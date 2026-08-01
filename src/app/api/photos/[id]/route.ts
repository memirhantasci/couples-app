import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { getSession } from "@/lib/auth/session";
import { decryptBuffer } from "@/utils/crypto";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const { id } = await params;
  if (!id) {
    return new NextResponse("Not Found", { status: 404 });
  }

  const supabase = createServerClient();

  // Get photo details from DB
  const { data: photo, error: dbError } = await supabase
    .from("photo_archive")
    .select("storage_path, image_url")
    .eq("id", id)
    .single();

  if (dbError || !photo || !photo.storage_path) {
    return new NextResponse("Photo not found in database", { status: 404 });
  }

  // Download the encrypted file from Supabase Storage
  const { data: fileData, error: downloadError } = await supabase.storage
    .from("photos")
    .download(photo.storage_path);

  if (downloadError || !fileData) {
    console.error("Storage download error:", downloadError);
    return new NextResponse("File not found in storage", { status: 404 });
  }

  try {
    const arrayBuffer = await fileData.arrayBuffer();
    const encryptedBuffer = Buffer.from(arrayBuffer);
    
    // Decrypt it
    const decryptedBuffer = decryptBuffer(encryptedBuffer);
    
    // Determine content type based on extension
    const ext = photo.storage_path.split('.').pop()?.toLowerCase() || 'jpg';
    let contentType = 'image/jpeg';
    if (ext === 'png') contentType = 'image/png';
    else if (ext === 'gif') contentType = 'image/gif';
    else if (ext === 'webp') contentType = 'image/webp';
    else if (ext === 'heic') contentType = 'image/heic';

    // NextResponse requires standard web types like Uint8Array instead of Node.js Buffer
    return new NextResponse(new Uint8Array(decryptedBuffer), {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "private, max-age=86400", // Cache in user's browser for 1 day
      },
    });
  } catch (err) {
    console.error("Failed to decrypt photo:", err);
    return new NextResponse("Error decrypting photo", { status: 500 });
  }
}
