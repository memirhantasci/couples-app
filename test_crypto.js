const crypto = require("crypto");

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || "couples-website-secret-key-12345";
const key = crypto.scryptSync(ENCRYPTION_KEY, "salt", 32);
const ALGORITHM = "aes-256-cbc";

function encrypt(text) {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  
  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");
  
  return `enc:${iv.toString("hex")}:${encrypted}`;
}

function decrypt(text) {
  try {
    if (!text.startsWith("enc:")) return text;

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

const enc = encrypt("testpassword");
console.log("Encrypted:", enc);
const dec = decrypt(enc);
console.log("Decrypted:", dec);
