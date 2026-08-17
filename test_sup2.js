const { createClient } = require("@supabase/supabase-js");

// We'll read the env from the mobile app's .env if it exists, or web app's .env
const fs = require("fs");
require("dotenv").config({ path: "c:\\Users\\emirh\\Desktop\\couples-app\\.env.local" });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function testQuery() {
  const { data, error } = await supabase
    .from("photo_archive")
    .select("id, user_id, image_url, title, description, taken_date, taken_time, user:users(username, display_name)")
    .limit(1);

  console.log("Data:", JSON.stringify(data, null, 2));
  console.log("Error:", error);
}

testQuery();
