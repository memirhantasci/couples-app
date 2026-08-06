import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const EXPO_PUSH_URL = "https://exp.host/--/api/v2/push/send";

serve(async (req) => {
  try {
    const body = await req.json();
    
    // Supabase Webhook body shape: { type, table, record, old_record }
    const { type, table, record } = body;
    
    if (type !== "INSERT") {
      return new Response("Not an INSERT, skipping.", { status: 200 });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    let message: { title: string; body: string } | null = null;
    let partnerUserId: string | null = null;
    let senderUserId: string | null = null;

    // ─── medicine_logs: ilaç alındı ──────────────────────────────────────────
    if (table === "medicine_logs" && record.status === "taken") {
      senderUserId = record.user_id;

      const { data: medicine } = await supabase
        .from("medicines")
        .select("name")
        .eq("id", record.medicine_id)
        .single();

      const { data: sender } = await supabase
        .from("users")
        .select("display_name, couple_id")
        .eq("id", senderUserId)
        .single();

      if (sender && medicine) {
        message = {
          title: "💊 İlaç Takibi",
          body: `${sender.display_name} ${medicine.name} ilacını içti ✅`,
        };

        // Partner'ı bul (aynı couple_id, farklı user)
        const { data: partner } = await supabase
          .from("users")
          .select("id")
          .eq("couple_id", sender.couple_id)
          .neq("id", senderUserId)
          .single();

        partnerUserId = partner?.id ?? null;
      }
    }

    // ─── daily_notes: yeni günlük notu ───────────────────────────────────────
    else if (table === "daily_notes") {
      senderUserId = record.user_id;

      const { data: sender } = await supabase
        .from("users")
        .select("display_name, couple_id")
        .eq("id", senderUserId)
        .single();

      if (sender) {
        message = {
          title: "📝 Günlük",
          body: `${sender.display_name} günlüğüne yeni bir not ekledi`,
        };

        const { data: partner } = await supabase
          .from("users")
          .select("id")
          .eq("couple_id", sender.couple_id)
          .neq("id", senderUserId)
          .single();

        partnerUserId = partner?.id ?? null;
      }
    }

    // ─── letters: yeni mektup ─────────────────────────────────────────────────
    else if (table === "letters") {
      senderUserId = record.sender_id;
      partnerUserId = record.receiver_id;

      const { data: sender } = await supabase
        .from("users")
        .select("display_name")
        .eq("id", senderUserId)
        .single();

      const unlockDate = record.unlock_date
        ? new Date(record.unlock_date).toLocaleDateString("tr-TR", {
            day: "numeric",
            month: "long",
            year: "numeric",
          })
        : null;

      if (sender) {
        message = {
          title: "💌 Yeni Mektup",
          body: unlockDate
            ? `${sender.display_name} sana geleceğe bir mektup yazdı! (${unlockDate} tarihinde açılacak)`
            : `${sender.display_name} sana bir mektup yazdı!`,
        };
      }
    }

    // ─── period_logs: regl kaydı ──────────────────────────────────────────────
    else if (table === "period_logs") {
      senderUserId = record.user_id;

      const { data: sender } = await supabase
        .from("users")
        .select("display_name, couple_id")
        .eq("id", senderUserId)
        .single();

      if (sender) {
        message = {
          title: "🩸 Regl Takvimi",
          body: `${sender.display_name}'in sıkıntılı günleri başladı. Ona destek olmayı unutma 💕`,
        };

        const { data: partner } = await supabase
          .from("users")
          .select("id")
          .eq("couple_id", sender.couple_id)
          .neq("id", senderUserId)
          .single();

        partnerUserId = partner?.id ?? null;
      }
    }

    // ─── Bildirim gönder ──────────────────────────────────────────────────────
    if (!message || !partnerUserId) {
      return new Response("No message or partner to notify.", { status: 200 });
    }

    // Partner'ın push token(ları)nı getir
    const { data: tokens } = await supabase
      .from("push_tokens")
      .select("token")
      .eq("user_id", partnerUserId);

    if (!tokens || tokens.length === 0) {
      return new Response("Partner has no push tokens.", { status: 200 });
    }

    // Expo Push API'ye gönder
    const pushMessages = tokens.map((t) => ({
      to: t.token,
      sound: "default",
      title: message!.title,
      body: message!.body,
      data: { table, recordId: record.id },
    }));

    const expoResponse = await fetch(EXPO_PUSH_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        "Accept-Encoding": "gzip, deflate",
      },
      body: JSON.stringify(pushMessages),
    });

    const expoResult = await expoResponse.json();
    console.log("Expo Push Result:", JSON.stringify(expoResult));

    return new Response(JSON.stringify({ success: true, expoResult }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("send-push error:", err);
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});
