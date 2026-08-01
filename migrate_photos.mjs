// Use node --env-file=.env.local migrate_photos.mjs

import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || "couples-website-secret-key-12345";
const key = crypto.scryptSync(ENCRYPTION_KEY, "salt", 32);
const ALGORITHM = "aes-256-cbc";

function encrypt(text) {
  if (!text) return text;
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");
  return `enc:${iv.toString("hex")}:${encrypted}`;
}

function encryptBuffer(buffer) {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  
  const encrypted = Buffer.concat([
    cipher.update(buffer),
    cipher.final()
  ]);
  
  return Buffer.concat([iv, encrypted]);
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!supabaseUrl || !supabaseKey) {
  console.error("Missing supabase env vars");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function migratePhotos() {
  console.log("Starting photos encryption migration...");
  
  const { data: photos, error: fetchErr } = await supabase.from("photo_archive").select("*");
  if (fetchErr) {
    console.error("Error fetching photos:", fetchErr);
    return;
  }

  for (const photo of photos) {
    if (photo.image_url && photo.image_url.includes("/api/photos/")) {
      console.log(`Photo ${photo.id} already encrypted (has /api/photos url). Skipping.`);
      continue;
    }
    
    console.log(`Migrating photo ${photo.id}...`);

    // 1. Download file from storage
    const { data: fileBlob, error: dlErr } = await supabase.storage.from("photos").download(photo.storage_path);
    
    if (dlErr || !fileBlob) {
      console.error(`Error downloading file for photo ${photo.id}:`, dlErr);
      continue;
    }

    // 2. Encrypt file
    const arrayBuffer = await fileBlob.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const encryptedBuffer = encryptBuffer(buffer);

    // 3. Re-upload encrypted file
    const { error: upErr } = await supabase.storage.from("photos").upload(photo.storage_path, encryptedBuffer, {
      upsert: true,
      contentType: "application/octet-stream"
    });

    if (upErr) {
      console.error(`Error uploading encrypted file for photo ${photo.id}:`, upErr);
      continue;
    }

    // 4. Update metadata in DB
    const updates = {
      image_url: `/api/photos/${photo.id}`
    };
    
    if (photo.title && !photo.title.startsWith("enc:")) {
      updates.title = encrypt(photo.title);
    }
    if (photo.description && !photo.description.startsWith("enc:")) {
      updates.description = encrypt(photo.description);
    }

    const { error: dbErr } = await supabase.from("photo_archive").update(updates).eq("id", photo.id);
    if (dbErr) {
      console.error(`Error updating metadata for photo ${photo.id}:`, dbErr);
    } else {
      console.log(`Successfully migrated photo ${photo.id}`);
    }
  }

  console.log("Photos migration complete.");
}

migratePhotos();
