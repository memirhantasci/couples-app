import crypto from "crypto";

// For a real production app, this should be a 32-byte string stored in .env
// We use a fallback if not provided to prevent crashes.
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || "couples-website-secret-key-12345"; // Must be 32 bytes
// Ensure the key is exactly 32 bytes for AES-256-CBC
const key = crypto.scryptSync(ENCRYPTION_KEY, "salt", 32);

const ALGORITHM = "aes-256-cbc";

export function encrypt(text: string): string {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  
  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");
  
  // Format: "enc:IV:EncryptedText" so we can identify encrypted strings
  return `enc:${iv.toString("hex")}:${encrypted}`;
}

export function decrypt(text: string): string {
  try {
    if (!text.startsWith("enc:")) return text; // Not encrypted

    const parts = text.split(":");
    if (parts.length !== 3) return text;

    const iv = Buffer.from(parts[1], "hex");
    const encryptedText = Buffer.from(parts[2], "hex");

    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    
    let decrypted = decipher.update(encryptedText, undefined, "utf8");
    decrypted += decipher.final("utf8");
    
    return decrypted;
  } catch (err) {
    console.error("Decryption error:", err);
    return "";
  }
}

// Generate a static IV for deterministic encryption (always 16 bytes)
// We hash the secret key to ensure it's always the same for the same key, but random enough.
const STATIC_IV = crypto.createHash("md5").update(key).digest();

export function deterministicEncrypt(text: string): string {
  if (!text) return text;
  
  const cipher = crypto.createCipheriv(ALGORITHM, key, STATIC_IV);
  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");
  
  return `det:${encrypted}`;
}

export function deterministicDecrypt(text: string): string {
  try {
    if (!text || !text.startsWith("det:")) return text; // Not deterministically encrypted

    const encryptedText = Buffer.from(text.substring(4), "hex");
    const decipher = crypto.createDecipheriv(ALGORITHM, key, STATIC_IV);
    
    let decrypted = decipher.update(encryptedText, undefined, "utf8");
    decrypted += decipher.final("utf8");
    
    return decrypted;
  } catch (err) {
    console.error("Deterministic decryption error:", err);
    return "";
  }
}

export function encryptBuffer(buffer: Buffer): Buffer {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  
  const encrypted = Buffer.concat([
    cipher.update(buffer),
    cipher.final()
  ]);
  
  // Prepend IV to the encrypted buffer so we can extract it during decryption
  return Buffer.concat([iv, encrypted]);
}

export function decryptBuffer(buffer: Buffer): Buffer {
  try {
    // Extract the first 16 bytes as IV
    const iv = buffer.subarray(0, 16);
    const encryptedData = buffer.subarray(16);
    
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    
    const decrypted = Buffer.concat([
      decipher.update(encryptedData),
      decipher.final()
    ]);
    
    return decrypted;
  } catch (err) {
    console.error("Buffer decryption error:", err);
    throw err;
  }
}
