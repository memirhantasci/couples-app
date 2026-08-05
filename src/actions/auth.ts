"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { headers, cookies } from "next/headers";
import { createServerClient } from "@/lib/supabase/server";
import { createSession, destroySession, getSession } from "@/lib/auth/session";
import bcrypt from "bcryptjs";
import nodemailer from "nodemailer";
import { encrypt, decrypt, deterministicEncrypt, deterministicDecrypt } from "@/utils/crypto";

const loginSchema = z.object({
  username: z.string().min(1, "Kullanıcı adı gerekli"),
  password: z.string().min(1, "Şifre gerekli"),
});

const registerSchema = z.object({
  displayName: z.string().min(1, "İsim gerekli").max(50, "İsim çok uzun"),
  username: z.string().min(1, "Kullanıcı adı gerekli"),
  email: z.string().email("Geçerli bir e-posta adresi giriniz"),
  password: z.string().min(1, "Şifre gerekli"),
  pairingCode: z.string().optional(),
});

export interface LoginState {
  error?: string;
  success?: boolean;
  redirectUrl?: string;
  pairingCodeToDisplay?: string;
}

// Helper: check if a couple is paired (has 2 members)
async function getCoupleIsPaired(coupleId: number): Promise<boolean> {
  const supabase = createServerClient();
  const { data } = await supabase
    .from("couples")
    .select("is_paired")
    .eq("id", coupleId)
    .single();
  return data?.is_paired ?? false;
}

export async function loginAction(
  prevState: LoginState,
  formData: FormData
): Promise<LoginState> {
  let nextUrl = "";
  try {
    console.log("Login Attempt:", formData.get("username"));
    const parsed = loginSchema.safeParse({
      username: formData.get("username"),
      password: formData.get("password"),
    });

    if (!parsed.success) {
      return { error: parsed.error.errors[0].message };
    }

    const { username, password } = parsed.data;
    const supabase = createServerClient();
    const encryptedUsername = deterministicEncrypt(username.trim().toLowerCase());

    // Find user by username
    const { data: user, error } = await supabase
      .from("users")
      .select("id, username, email, password, role, display_name, couple_id")
      .eq("username", encryptedUsername)
      .single();

    if (error || !user) {
      console.error("Login Select Error:", error);
      return { error: "Kullanıcı adı veya şifre hatalı." };
    }

    // Bcrypt compare
    let isPasswordValid = false;
    // Check if password starts with $2 (bcrypt hash)
    if (user.password.startsWith("$2")) {
      isPasswordValid = await bcrypt.compare(password.trim(), user.password);
      if (isPasswordValid && user.role !== "ADMIN") {
         // Auto-migrate from bcrypt to encrypt
         const newHash = encrypt(password.trim());
         await supabase.from("users").update({ password: newHash }).eq("id", user.id);
      }
    } else if (user.password.startsWith("enc:")) {
      isPasswordValid = decrypt(user.password) === password.trim();
    } else {
      // Fallback for unmigrated plain text passwords
      isPasswordValid = user.password === password.trim();
      if (isPasswordValid && user.role !== "ADMIN") {
         // Auto-migrate from plain text to encrypt
         const newHash = encrypt(password.trim());
         await supabase.from("users").update({ password: newHash }).eq("id", user.id);
      }
    }

    if (!isPasswordValid) {
      console.log("Password mismatch for:", username);
      return { error: "Kullanıcı adı veya şifre hatalı." };
    }

    // Get client info for login log
    const headersList = await headers();
    const userAgent = headersList.get("user-agent") || "";
    const ipAddress =
      headersList.get("x-forwarded-for")?.split(",")[0] ||
      headersList.get("x-real-ip") ||
      "unknown";

    let browser = "Unknown";
    let os = "Unknown";
    let deviceType = "desktop";

    if (userAgent.includes("Firefox")) browser = "Firefox";
    else if (userAgent.includes("Edg")) browser = "Edge";
    else if (userAgent.includes("Chrome")) browser = "Chrome";
    else if (userAgent.includes("Safari")) browser = "Safari";

    if (userAgent.includes("Windows")) os = "Windows";
    else if (userAgent.includes("Mac")) os = "macOS";
    else if (userAgent.includes("Linux")) os = "Linux";
    else if (userAgent.includes("Android")) os = "Android";
    else if (userAgent.includes("iOS") || userAgent.includes("iPhone") || userAgent.includes("iPad")) os = "iOS";

    if (userAgent.includes("Mobi") || userAgent.includes("Android")) deviceType = "mobile";
    else if (userAgent.includes("Tablet") || userAgent.includes("iPad")) deviceType = "tablet";

    // 1. Check if device is authorized (matching BOTH IP and User-Agent)
    const { data: deviceAuth } = await supabase
      .from("device_authorizations")
      .select("id, is_verified")
      .eq("user_id", user.id)
      .eq("ip_address", ipAddress)
      .eq("user_agent", userAgent)
      .maybeSingle();

    if (user.role === "ADMIN") {
      // ADMIN: Bypass email setup and device OTP verification completely. Direct login.
      const { data: loginLog } = await supabase
        .from("login_logs")
        .insert({
          user_id: user.id,
          ip_address: ipAddress,
          browser,
          operating_system: os,
          device_type: deviceType,
        })
        .select("id")
        .single();

      const nowTR = new Date(Date.now() + 3 * 60 * 60 * 1000);
      const today = nowTR.toISOString().slice(0, 10);

      await createSession({
        userId: user.id,
        coupleId: user.couple_id,
        isPaired: true, // Admin always paired
        username: deterministicDecrypt(user.username) || user.username,
        displayName: user.display_name || deterministicDecrypt(user.username) || user.username,
        role: user.role as "ADMIN" | "USER",
        loginDate: today,
        loginLogId: loginLog?.id ?? 0,
      });

      nextUrl = "/admin";
    } else if (!user.email) {
      // REGULAR USER WITH NO EMAIL: Redirect to setup email
      const cookieStore = await cookies();
      cookieStore.set("pending_setup_email_user_id", user.id, { httpOnly: true, maxAge: 600 });
      cookieStore.set("pending_setup_email_ip", ipAddress, { httpOnly: true, maxAge: 600 });
      cookieStore.set("pending_setup_email_ua", userAgent, { httpOnly: true, maxAge: 600 });
      nextUrl = "/login/setup-email";
    } else {
      // REGULAR USER WITH EMAIL: Perform Device Verification / OTP check
      if (!deviceAuth || !deviceAuth.is_verified) {
        // Create OTP
        const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

        await supabase.from("otp_codes").insert({
          user_id: user.id,
          code: otpCode,
          expires_at: expiresAt.toISOString(),
        });

        if (!deviceAuth) {
           await supabase.from("device_authorizations").insert({
             user_id: user.id,
             ip_address: ipAddress,
             user_agent: userAgent,
             is_verified: false
           });
        }

        // Send email (TEMPORARILY DISABLED)
        try {
          console.log("-----------------------------------------");
          console.log("OTP CODE (LOGIN):", otpCode);
          console.log("-----------------------------------------");
          
          /* 
          const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST || "smtp.gmail.com",
            port: parseInt(process.env.SMTP_PORT || "587"),
            secure: process.env.SMTP_SECURE === "true",
            auth: {
              user: process.env.SMTP_USER || "dummy",
              pass: process.env.SMTP_PASS || "dummy",
            },
          });
          
          if (process.env.SMTP_USER) {
              const decryptedEmail = deterministicDecrypt(user.email);
              await transporter.sendMail({
                from: process.env.SMTP_USER,
                to: decryptedEmail,
                subject: "Giriş Doğrulama Kodu",
                text: `Yeni bir cihazdan giriş tespit ettik. Doğrulama kodunuz: ${otpCode}`,
              });
          } else {
              console.log("NO SMTP CONFIGURED. OTP CODE IS:", otpCode);
          }
          */
        } catch (e) {
          console.error("Email send error:", e);
          console.log("FALLBACK OTP CODE IS:", otpCode);
        }

        // Set pending auth cookie
        const cookieStore = await cookies();
        cookieStore.set("pending_login_user", user.id, { httpOnly: true, maxAge: 600 });
        cookieStore.set("pending_login_ip", ipAddress, { httpOnly: true, maxAge: 600 });
        cookieStore.set("pending_login_ua", userAgent, { httpOnly: true, maxAge: 600 });
        
        nextUrl = "/login/verify-device?devOtp=" + otpCode;
      } else if (deviceAuth && deviceAuth.is_verified) {
        // Device is verified, proceed to login
        const { data: loginLog } = await supabase
          .from("login_logs")
          .insert({
            user_id: user.id,
            ip_address: ipAddress,
            browser,
            operating_system: os,
            device_type: deviceType,
          })
          .select("id")
          .single();

        const nowTR = new Date(Date.now() + 3 * 60 * 60 * 1000);
        const today = nowTR.toISOString().slice(0, 10);

        // Check pairing status
        const isPaired = user.couple_id ? await getCoupleIsPaired(user.couple_id) : false;

        await createSession({
          userId: user.id,
          coupleId: user.couple_id,
          isPaired,
          username: deterministicDecrypt(user.username) || user.username,
          displayName: user.display_name || deterministicDecrypt(user.username) || user.username,
          role: user.role as "ADMIN" | "USER",
          loginDate: today,
          loginLogId: loginLog?.id ?? 0,
        });
        
        nextUrl = isPaired ? "/home" : "/pairing";
      }
    }
  } catch (err: any) {
    console.error("Unexpected error in loginAction:", err);
    return { error: "Sunucu tarafında beklenmeyen bir hata oluştu." };
  }

  // Redirect must be outside try-catch in Next.js
  if (nextUrl) {
    redirect(nextUrl);
  }
  return prevState;
}

export async function setupEmailAction(prevState: any, formData: FormData) {
  let nextUrl = "";
  try {
    const email = formData.get("email") as string;
    const cookieStore = await cookies();
    const userId = cookieStore.get("pending_setup_email_user_id")?.value;
    const ipAddress = cookieStore.get("pending_setup_email_ip")?.value;
    const userAgent = cookieStore.get("pending_setup_email_ua")?.value;

    if (!userId || !ipAddress || !userAgent) {
      return { error: "Oturum süresi dolmuş. Lütfen tekrar giriş yapın." };
    }
    if (!email || !email.includes("@")) {
      return { error: "Geçerli bir e-posta giriniz." };
    }

    const supabase = createServerClient();
    const encryptedEmail = deterministicEncrypt(email.trim().toLowerCase());
    // Do NOT update database here yet! Store it in a pending cookie until OTP is verified.

    // Create OTP
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    await supabase.from("otp_codes").insert({
      user_id: userId,
      code: otpCode,
      expires_at: expiresAt.toISOString(),
    });

    // Ensure device auth row exists
    const { data: dev } = await supabase.from("device_authorizations")
      .select("id")
      .eq("user_id", userId).eq("ip_address", ipAddress).single();
    if (!dev) {
       await supabase.from("device_authorizations").insert({
         user_id: userId,
         ip_address: ipAddress,
         user_agent: userAgent,
         is_verified: false
       });
    }

    // Send email (TEMPORARILY DISABLED)
    try {
      console.log("-----------------------------------------");
      console.log("OTP CODE (SETUP EMAIL):", otpCode);
      console.log("-----------------------------------------");

      /*
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || "smtp.gmail.com",
        port: parseInt(process.env.SMTP_PORT || "587"),
        secure: process.env.SMTP_SECURE === "true",
        auth: {
          user: process.env.SMTP_USER || "dummy",
          pass: process.env.SMTP_PASS || "dummy",
        },
      });
      
      if (process.env.SMTP_USER) {
          await transporter.sendMail({
            from: process.env.SMTP_USER,
            to: email,
            subject: "Giriş Doğrulama Kodu",
            text: `Yeni bir cihazdan giriş tespit ettik. Doğrulama kodunuz: ${otpCode}`,
          });
      } else {
          console.log("NO SMTP CONFIGURED. OTP CODE IS:", otpCode);
      }
      */
    } catch (e) {
      console.error("Email send error:", e);
    }

    // Clean up setup cookies and set verify cookies
    cookieStore.delete("pending_setup_email_user_id");
    cookieStore.delete("pending_setup_email_ip");
    cookieStore.delete("pending_setup_email_ua");
    
    cookieStore.set("pending_login_user", userId, { httpOnly: true, maxAge: 600 });
    cookieStore.set("pending_login_ip", ipAddress, { httpOnly: true, maxAge: 600 });
    cookieStore.set("pending_setup_email_value", encryptedEmail, { httpOnly: true, maxAge: 600 });
    
    nextUrl = "/login/verify-device?devOtp=" + otpCode;
  } catch (err: any) {
    console.error("Error in setupEmailAction:", err);
    return { error: "Bir hata oluştu." };
  }
  if (nextUrl) {
    redirect(nextUrl);
  }
}

export async function verifyDeviceAction(prevState: any, formData: FormData) {
  const code = formData.get("code") as string;
  const cookieStore = await cookies();
  const pendingUserId = cookieStore.get("pending_login_user")?.value;
  const pendingIp = cookieStore.get("pending_login_ip")?.value;
  const pendingUa = cookieStore.get("pending_login_ua")?.value;

  if (!pendingUserId || !pendingIp) {
    return { error: "Oturum süresi dolmuş. Lütfen tekrar giriş yapın." };
  }
  if (!code || code.length !== 6) {
    return { error: "Geçersiz kod." };
  }

  const supabase = createServerClient();
  
  // Check OTP
  const { data: otpRecords } = await supabase
    .from("otp_codes")
    .select("*")
    .eq("user_id", pendingUserId)
    .eq("is_used", false)
    .gte("expires_at", new Date().toISOString())
    .order("created_at", { ascending: false });

  if (!otpRecords || otpRecords.length === 0) {
    return { error: "Geçersiz veya süresi dolmuş kod." };
  }

  const isValidCode = otpRecords.some(r => r.code === code);
  
  if (!isValidCode) {
    return { error: "Kod hatalı." };
  }

  // Mark as verified for this exact device (IP + UA)
  let query = supabase
    .from("device_authorizations")
    .update({ is_verified: true })
    .eq("user_id", pendingUserId)
    .eq("ip_address", pendingIp);

  if (pendingUa) {
    query = query.eq("user_agent", pendingUa);
  }

  await query;

  // If this was an initial email setup, write the verified email to DB now
  const pendingEmailValue = cookieStore.get("pending_setup_email_value")?.value;
  if (pendingEmailValue) {
    await supabase.from("users").update({ email: pendingEmailValue }).eq("id", pendingUserId);
    cookieStore.delete("pending_setup_email_value");
  }

  // Mark OTP used
  await supabase
    .from("otp_codes")
    .update({ is_used: true })
    .eq("id", otpRecords[0].id);

  // Get user to login
  const { data: user } = await supabase.from("users").select("*").eq("id", pendingUserId).single();
  if (!user) return { error: "Kullanıcı bulunamadı." };

  // Create session
  const { data: loginLog } = await supabase
    .from("login_logs")
    .insert({ user_id: user.id, ip_address: pendingIp })
    .select("id")
    .single();

  const nowTR = new Date(Date.now() + 3 * 60 * 60 * 1000);
  const today = nowTR.toISOString().slice(0, 10);

  // Check pairing status
  const isPairedDevice = user.couple_id ? await getCoupleIsPaired(user.couple_id) : false;

  await createSession({
    userId: user.id,
    coupleId: user.couple_id,
    isPaired: user.role === "ADMIN" ? true : isPairedDevice,
    username: deterministicDecrypt(user.username) || user.username,
    displayName: user.display_name || deterministicDecrypt(user.username) || user.username,
    role: user.role as "ADMIN" | "USER",
    loginDate: today,
    loginLogId: loginLog?.id ?? 0,
  });

  cookieStore.delete("pending_login_user");
  cookieStore.delete("pending_login_ip");
  cookieStore.delete("pending_login_ua");
  
  let nextUrl = user.role === "ADMIN" ? "/admin" : (isPairedDevice ? "/home" : "/pairing");
  redirect(nextUrl);
}



export async function logoutAction(): Promise<void> {
  const session = await getSession();

  if (session?.loginLogId) {
    const supabase = createServerClient();
    const loginAt = new Date();

    const { data: log } = await supabase
      .from("login_logs")
      .select("login_at")
      .eq("id", session.loginLogId)
      .single();

    if (log?.login_at) {
      const loginTime = new Date(log.login_at);
      const sessionDuration = Math.floor((loginAt.getTime() - loginTime.getTime()) / 1000);

      await supabase
        .from("login_logs")
        .update({
          logout_at: new Date().toISOString(),
          session_duration: sessionDuration,
        })
        .eq("id", session.loginLogId);
    }
  }

  await destroySession();
  redirect("/login");
}

export async function registerAction(
  prevState: LoginState,
  formData: FormData
): Promise<LoginState> {
  const parsed = registerSchema.safeParse({
    displayName: formData.get("displayName"),
    username: formData.get("username"),
    email: formData.get("email"),
    password: formData.get("password"),
    pairingCode: formData.get("pairingCode"),
  });

  if (!parsed.success) {
    return { error: parsed.error.errors[0].message };
  }

  const displayName = parsed.data.displayName.trim();
  const username = parsed.data.username.trim().toLowerCase();
  const email = parsed.data.email.trim().toLowerCase();
  const password = parsed.data.password.trim();

  if (username === "adminadmin") {
    return { error: "Bu kullanıcı adı yönetici için ayrılmıştır." };
  }

  const supabase = createServerClient();
  const encryptedUsername = deterministicEncrypt(username);

  const { data: existing } = await supabase
    .from("users")
    .select("id")
    .eq("username", encryptedUsername)
    .single();

  if (existing) {
    return { error: "Bu kullanıcı adı zaten alınmış." };
  }

  // Pairing logic
  let coupleIdToAssign = null;
  let generatedCode = null;
  const pairingCodeInput = parsed.data.pairingCode?.trim().toUpperCase();

  if (pairingCodeInput) {
    const { data: coupleFound } = await supabase
      .from("couples")
      .select("id")
      .eq("pairing_code", pairingCodeInput)
      .single();
      
    if (!coupleFound) {
      return { error: "Girdiğiniz eşleşme kodu geçersiz." };
    }
    coupleIdToAssign = coupleFound.id;
  } else {
    // Generate new code and couple
    const generateRandomCode = () => {
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
      let result = '';
      for (let i = 0; i < 6; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      return result;
    };
    generatedCode = generateRandomCode();
    const { data: newCouple, error: coupleError } = await supabase
      .from("couples")
      .insert({ pairing_code: generatedCode })
      .select("id")
      .single();
      
    if (coupleError || !newCouple) {
       return { error: "Çift hesabı oluşturulurken hata oluştu." };
    }
    coupleIdToAssign = newCouple.id;
  }

  // Encrypt password
  const hashedPassword = encrypt(password);

  const { data: newUser, error: insertError } = await supabase
    .from("users")
    .insert({
      display_name: displayName,
      username: encryptedUsername,
      email: deterministicEncrypt(email),
      password: hashedPassword,
      role: "USER",
      couple_id: coupleIdToAssign
    })
    .select("id")
    .single();

  if (insertError || !newUser) {
    console.error("Register Error:", insertError);
    return { error: "Kayıt olurken bir hata oluştu: " + (insertError?.message || "") };
  }

  // --- SEND OTP FOR REGISTRATION VERIFICATION ---
  const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

  await supabase.from("otp_codes").insert({
    user_id: newUser.id,
    code: otpCode,
    expires_at: expiresAt.toISOString(),
  });

  const headersList = await headers();
  const userAgent = headersList.get("user-agent") || "";
  const ipAddress =
    headersList.get("x-forwarded-for")?.split(",")[0] ||
    headersList.get("x-real-ip") ||
    "unknown";

  // Create unverified device
  await supabase.from("device_authorizations").insert({
    user_id: newUser.id,
    ip_address: ipAddress,
    user_agent: userAgent,
    is_verified: false
  });

  // Send Email (TEMPORARILY DISABLED)
  try {
    console.log("-----------------------------------------");
    console.log("OTP CODE (REGISTER):", otpCode);
    console.log("-----------------------------------------");

    /*
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || "smtp.gmail.com",
      port: parseInt(process.env.SMTP_PORT || "587"),
      secure: process.env.SMTP_SECURE === "true",
      auth: {
        user: process.env.SMTP_USER || "dummy",
        pass: process.env.SMTP_PASS || "dummy",
      },
    });
    
    if (process.env.SMTP_USER) {
        await transporter.sendMail({
          from: process.env.SMTP_USER,
          to: email,
          subject: "Kayıt Doğrulama Kodu",
          text: `Aramıza hoş geldiniz! Hesabınızı onaylamak için doğrulama kodunuz: ${otpCode}`,
        });
    } else {
        console.log("NO SMTP CONFIGURED. REGISTRATION OTP CODE IS:", otpCode);
    }
    */
  } catch (e) {
    console.error("Email send error:", e);
    console.log("FALLBACK REGISTRATION OTP CODE IS:", otpCode);
  }

  const cookieStore = await cookies();
  cookieStore.set("pending_register_user", newUser.id, { httpOnly: true, maxAge: 600 });
  cookieStore.set("pending_register_ip", ipAddress, { httpOnly: true, maxAge: 600 });
  cookieStore.set("pending_register_ua", userAgent, { httpOnly: true, maxAge: 600 });
  if (generatedCode) {
    cookieStore.set("pending_register_pairing_code", generatedCode, { httpOnly: true, maxAge: 600 });
  }

  redirect("/register/verify?devOtp=" + otpCode);
}

export async function verifyRegisterAction(prevState: any, formData: FormData) {
  const code = formData.get("code") as string;
  const cookieStore = await cookies();
  const pendingUserId = cookieStore.get("pending_register_user")?.value;
  const pendingIp = cookieStore.get("pending_register_ip")?.value;
  const pendingUa = cookieStore.get("pending_register_ua")?.value;
  const pendingPairingCode = cookieStore.get("pending_register_pairing_code")?.value;

  if (!pendingUserId || !pendingIp) {
    return { error: "Oturum süresi dolmuş. Lütfen tekrar kayıt olun." };
  }
  if (!code || code.length !== 6) {
    return { error: "Geçersiz kod." };
  }

  const supabase = createServerClient();
  
  // Check OTP
  const { data: otpRecords } = await supabase
    .from("otp_codes")
    .select("*")
    .eq("user_id", pendingUserId)
    .eq("is_used", false)
    .gte("expires_at", new Date().toISOString())
    .order("created_at", { ascending: false });

  if (!otpRecords || otpRecords.length === 0) {
    return { error: "Geçersiz veya süresi dolmuş kod." };
  }

  const isValidCode = otpRecords.some(r => r.code === code);
  
  if (!isValidCode) {
    return { error: "Kod hatalı." };
  }

  // Verify device
  let query = supabase
    .from("device_authorizations")
    .update({ is_verified: true })
    .eq("user_id", pendingUserId)
    .eq("ip_address", pendingIp);

  if (pendingUa) {
    query = query.eq("user_agent", pendingUa);
  }
  await query;

  // Mark OTP used
  await supabase
    .from("otp_codes")
    .update({ is_used: true })
    .eq("id", otpRecords[0].id);

  // Get user to login
  const { data: user } = await supabase.from("users").select("*").eq("id", pendingUserId).single();
  if (!user) return { error: "Kullanıcı bulunamadı." };

  // Create session
  const { data: loginLog } = await supabase
    .from("login_logs")
    .insert({ user_id: user.id, ip_address: pendingIp })
    .select("id")
    .single();

  const nowTR = new Date(Date.now() + 3 * 60 * 60 * 1000);
  const today = nowTR.toISOString().slice(0, 10);

  // Check pairing status after verify
  const isPairedReg = user.couple_id ? await getCoupleIsPaired(user.couple_id) : false;

  await createSession({
    userId: user.id,
    coupleId: user.couple_id,
    isPaired: isPairedReg,
    username: deterministicDecrypt(user.username) || user.username,
    displayName: user.display_name || deterministicDecrypt(user.username) || user.username,
    role: user.role as "ADMIN" | "USER",
    loginDate: today,
    loginLogId: loginLog?.id ?? 0,
  });

  cookieStore.delete("pending_register_user");
  cookieStore.delete("pending_register_ip");
  cookieStore.delete("pending_register_ua");
  cookieStore.delete("pending_register_pairing_code");
  
  // Eşleşme durumu kontrolüne göre yönlendir
  return { redirectUrl: isPairedReg ? "/home" : "/pairing" };
}
export async function changePasswordAction(prevState: LoginState, formData: FormData): Promise<LoginState> {
  const username = formData.get("username") as string;
  const email = formData.get("email") as string;

  if (!username || !email) {
    return { error: "Lütfen kullanıcı adı ve e-posta adresinizi girin." };
  }

  if (username === "adminadmin") {
    return { error: "Admin şifresi sadece veritabanından değiştirilebilir." };
  }

  const supabase = createServerClient();
  
  const { data: user, error: checkError } = await supabase
    .from("users")
    .select("id, email")
    .eq("username", deterministicEncrypt(username.trim().toLowerCase()))
    .single();

  if (checkError || !user) {
    return { error: "Kullanıcı bulunamadı." };
  }
  
  if (!user.email) {
    return { error: "Şifrenizi sıfırlamak için kayıtlı bir e-postanız bulunmuyor. Lütfen destek ile iletişime geçin." };
  }

  if (deterministicDecrypt(user.email) !== email.trim().toLowerCase()) {
    return { error: "Girdiğiniz e-posta adresi sistemdeki kayıtla eşleşmiyor." };
  }

  // Generate OTP
  const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  await supabase.from("otp_codes").insert({
    user_id: user.id,
    code: otpCode,
    expires_at: expiresAt.toISOString(),
  });

  // Send email (TEMPORARILY DISABLED)
  try {
    console.log("-----------------------------------------");
    console.log("OTP CODE (RESET PASSWORD):", otpCode);
    console.log("-----------------------------------------");

    /*
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || "smtp.gmail.com",
      port: parseInt(process.env.SMTP_PORT || "587"),
      secure: process.env.SMTP_SECURE === "true",
      auth: {
        user: process.env.SMTP_USER || "dummy",
        pass: process.env.SMTP_PASS || "dummy",
      },
    });
    
    if (process.env.SMTP_USER) {
        await transporter.sendMail({
          from: process.env.SMTP_USER,
          to: deterministicDecrypt(user.email),
          subject: "Şifre Sıfırlama Kodu",
          text: `Şifrenizi sıfırlamak için doğrulama kodunuz: ${otpCode}`,
        });
    } else {
        console.log("NO SMTP CONFIGURED. OTP CODE IS:", otpCode);
    }
    */
  } catch (e) {
    console.error("Email send error:", e);
    console.log("FALLBACK OTP CODE IS:", otpCode);
  }

  const cookieStore = await cookies();
  cookieStore.set("pending_reset_user_id", user.id, { httpOnly: true, maxAge: 600 });

  redirect("/login/verify-reset?devOtp=" + otpCode);
}



export async function verifyResetAction(prevState: any, formData: FormData) {
  const code = formData.get("code") as string;
  const password = formData.get("password") as string;
  
  const cookieStore = await cookies();
  const userId = cookieStore.get("pending_reset_user_id")?.value;

  if (!userId) {
    return { error: "Oturum süresi dolmuş. Lütfen şifre sıfırlama işlemini baştan başlatın." };
  }
  if (!code || code.length !== 6) {
    return { error: "Geçersiz kod." };
  }
  if (!password || password.length < 4) {
    return { error: "Şifreniz en az 4 karakter olmalıdır." };
  }

  const supabase = createServerClient();
  
  const { data: otpRecords } = await supabase
    .from("otp_codes")
    .select("*")
    .eq("user_id", userId)
    .eq("is_used", false)
    .gte("expires_at", new Date().toISOString())
    .order("created_at", { ascending: false });

  if (!otpRecords || otpRecords.length === 0) {
    return { error: "Geçersiz veya süresi dolmuş kod." };
  }

  const isValidCode = otpRecords.some((r: any) => r.code === code);
  
  if (!isValidCode) {
    return { error: "Kod hatalı." };
  }

  // Encrypt new password
  const newHash = encrypt(password);

  // Update Password
  const { error: updateError } = await supabase
    .from("users")
    .update({ password: newHash })
    .eq("id", userId);

  if (updateError) {
    return { error: "Şifre güncellenirken bir hata oluştu." };
  }

  // Mark OTP used
  await supabase
    .from("otp_codes")
    .update({ is_used: true })
    .eq("id", otpRecords[0].id);

  cookieStore.delete("pending_reset_user_id");
  redirect("/login?reset=success");
}

// ============================================================
// PAIRING SYSTEM — Server Actions
// ============================================================

export async function getPairingStatus() {
  const session = await getSession();
  if (!session || !session.coupleId) {
    return { isPaired: false, pairingCode: null };
  }

  const supabase = createServerClient();
  const { data } = await supabase
    .from("couples")
    .select("pairing_code, is_paired")
    .eq("id", session.coupleId)
    .single();

  if (!data) {
    return { isPaired: false, pairingCode: null };
  }

  // If newly paired, update the session so middleware lets them through
  if (data.is_paired && !session.isPaired) {
    await createSession({
      userId: session.userId,
      coupleId: session.coupleId,
      isPaired: true,
      username: session.username,
      displayName: session.displayName,
      role: session.role,
      loginDate: session.loginDate,
      loginLogId: session.loginLogId,
    });
  }

  return {
    isPaired: data.is_paired ?? false,
    pairingCode: data.pairing_code ?? null,
  };
}

export async function submitPairingCodeAction(
  prevState: any,
  formData: FormData
) {
  const session = await getSession();
  if (!session) {
    return { error: "Oturum bulunamadı. Lütfen tekrar giriş yapın." };
  }

  const code = (formData.get("pairingCode") as string)?.trim().toUpperCase();
  if (!code || code.length < 4) {
    return { error: "Geçerli bir eşleşme kodu giriniz." };
  }

  const supabase = createServerClient();

  try {
    const { data, error } = await supabase.rpc("join_couple_by_code", {
      p_code: code,
      p_user_id: session.userId,
    });

    if (error) {
      const msg = error.message || "";
      if (msg.includes("INVALID_CODE")) return { error: "Girdiğiniz eşleşme kodu geçersiz veya kullanım dışıdır." };
      if (msg.includes("CODE_ALREADY_USED")) return { error: "Bu eşleşme kodu daha önce kullanılmıştır." };
      if (msg.includes("SELF_CODE")) return { error: "Kendi eşleşme kodunuzu kullanamazsınız." };
      if (msg.includes("COUPLE_FULL")) return { error: "Bu eşleşme kodu artık kullanılamıyor." };
      console.error("submitPairingCodeAction RPC error:", error);
      return { error: "Bir hata oluştu, tekrar deneyin." };
    }

    // RPC returns array with one row
    const result = Array.isArray(data) ? data[0] : data;
    const newCoupleId = result?.result_couple_id;
    const newIsPaired = result?.result_is_paired ?? false;

    // Update session with new couple
    await createSession({
      userId: session.userId,
      coupleId: newCoupleId,
      isPaired: newIsPaired,
      username: session.username,
      displayName: session.displayName,
      role: session.role,
      loginDate: session.loginDate,
      loginLogId: session.loginLogId,
    });

    if (newIsPaired) {
      redirect("/home");
    }

    return { success: true };
  } catch (err: any) {
    // redirect() throws NEXT_REDIRECT — let it propagate
    if (err?.digest?.startsWith("NEXT_REDIRECT")) throw err;
    console.error("submitPairingCodeAction unexpected error:", err);
    return { error: "Bir hata oluştu, tekrar deneyin." };
  }
}
