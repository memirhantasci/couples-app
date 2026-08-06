import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

/**
 * Bu fonksiyon her gün çalışan pg_cron tarafından tetiklenecek.
 * deletion_scheduled_at tarihi geçmiş olan çiftlerin hesaplarını kalıcı siler.
 */
serve(async (_req) => {
  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  try {
    const now = new Date().toISOString();

    // Silinme tarihi geçmiş çiftleri bul
    const { data: expiredCouples, error: fetchError } = await supabase
      .from("couples")
      .select("id")
      .not("deletion_scheduled_at", "is", null)
      .lt("deletion_scheduled_at", now);

    if (fetchError) {
      console.error("Fetch error:", fetchError);
      return new Response(JSON.stringify({ error: fetchError.message }), { status: 500 });
    }

    if (!expiredCouples || expiredCouples.length === 0) {
      return new Response(JSON.stringify({ message: "No accounts to delete." }), { status: 200 });
    }

    let deletedCount = 0;

    for (const couple of expiredCouples) {
      // Bu çiftteki kullanıcıları bul
      const { data: users } = await supabase
        .from("users")
        .select("id")
        .eq("couple_id", couple.id);

      if (users && users.length > 0) {
        for (const user of users) {
          // Her kullanıcıyı auth.users'dan sil (Service Role ile mümkün)
          const { error: deleteError } = await supabase.auth.admin.deleteUser(user.id);
          if (deleteError) {
            console.error(`Failed to delete user ${user.id}:`, deleteError.message);
          } else {
            deletedCount++;
            console.log(`Deleted user: ${user.id}`);
          }
        }
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `Cleaned up ${expiredCouples.length} couple(s). Deleted ${deletedCount} user(s).`,
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("Cleanup error:", err);
    return new Response(JSON.stringify({ error: String(err) }), { status: 500 });
  }
});
