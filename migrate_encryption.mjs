// Use node --env-file=.env.local migrate_encryption.mjs

import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || "couples-website-secret-key-12345";
const key = crypto.scryptSync(ENCRYPTION_KEY, "salt", 32);
const ALGORITHM = "aes-256-cbc";
const STATIC_IV = crypto.createHash("md5").update(key).digest();

function encrypt(text) {
  if (!text) return text;
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");
  return `enc:${iv.toString("hex")}:${encrypted}`;
}

function deterministicEncrypt(text) {
  if (!text) return text;
  const cipher = crypto.createCipheriv(ALGORITHM, key, STATIC_IV);
  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");
  return `det:${encrypted}`;
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
if (!supabaseUrl || !supabaseKey) {
  console.error("Missing supabase env vars");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function migrate() {
  console.log("Starting encryption migration...");
  
  // 1. Users table (username, email)
  const { data: users, error: uErr } = await supabase.from("users").select("*");
  if (uErr) {
    console.error("Error fetching users:", uErr);
  } else {
    for (const u of users) {
      const updates = {};
      
      // Assume if it starts with "det:" it's already encrypted.
      // But usernames are usually short lowercase strings.
      if (u.username && !u.username.startsWith("det:")) {
        updates.username = deterministicEncrypt(u.username);
      }
      
      if (u.email && !u.email.startsWith("det:")) {
        updates.email = deterministicEncrypt(u.email);
      }
      
      if (Object.keys(updates).length > 0) {
        console.log(`Encrypting user ${u.id}...`);
        const { error: updErr } = await supabase.from("users").update(updates).eq("id", u.id);
        if (updErr) console.error(`Error updating user ${u.id}:`, updErr);
      }
    }
  }

  // 2. Letters (content)
  const { data: letters, error: lErr } = await supabase.from("letters").select("*");
  if (lErr) {
    console.error("Error fetching letters:", lErr);
  } else {
    for (const l of letters) {
      if (l.content && !l.content.startsWith("enc:")) {
        console.log(`Encrypting letter ${l.id}...`);
        const { error: updErr } = await supabase.from("letters").update({
          content: encrypt(l.content)
        }).eq("id", l.id);
        if (updErr) console.error(`Error updating letter ${l.id}:`, updErr);
      }
    }
  }

  // 3. Daily Notes (content)
  const { data: notes, error: nErr } = await supabase.from("daily_notes").select("*");
  if (nErr) {
    console.error("Error fetching notes:", nErr);
  } else {
    for (const n of notes) {
      if (n.content && !n.content.startsWith("enc:")) {
        console.log(`Encrypting note ${n.id}...`);
        const { error: updErr } = await supabase.from("daily_notes").update({
          content: encrypt(n.content)
        }).eq("id", n.id);
        if (updErr) console.error(`Error updating note ${n.id}:`, updErr);
      }
    }
  }

  console.log("Migration complete.");
}

migrate();
