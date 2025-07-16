import crypto from "crypto";
import * as dotenv from "dotenv";

dotenv.config();

if (!process.env.ENCRYPTION_KEY || !process.env.ENCRYPTION_SALT) {
  console.error("Missing ENCRYPTION variables are environment variables");
  throw new Error("ENCRYPTION variables are required");
}

const ENCRYPTION_KEY = crypto.scryptSync(
  process.env.ENCRYPTION_KEY,
  process.env.ENCRYPTION_SALT,
  32
);
const IV_LENGTH = 16;

export async function encrypt(text: string) {
  try {
    const iv = crypto.randomBytes(IV_LENGTH); // Generate a random IV for each encryption
    const cipher = crypto.createCipheriv(
      "aes-256-cbc",
      Buffer.from(ENCRYPTION_KEY),
      iv
    );
    const encrypted = Buffer.concat([
      cipher.update(text, "utf8"),
      cipher.final(),
    ]);

    // Return as a string in format 'iv:encrypted_data' (both in hex)
    return `${iv.toString("hex")}:${encrypted.toString("hex")}`;
  } catch (e) {
    console.error("Encryption error:", e);
    throw e; // Propagate the error
  }
}

export async function decrypt(encryptedText: string) {
  try {
    if (!encryptedText || !encryptedText.includes(':')) {
      throw new Error('Invalid encrypted text format');
    }

    const [ivHex, encryptedDataHex] = encryptedText.split(':');
    
    if (!ivHex || !encryptedDataHex) {
      throw new Error('Invalid encrypted text format');
    }

    const iv = Buffer.from(ivHex, 'hex');
    const encryptedData = Buffer.from(encryptedDataHex, 'hex');

    const decipher = crypto.createDecipheriv(
      "aes-256-cbc",
      Buffer.from(ENCRYPTION_KEY),
      iv
    );
    let decrypted = decipher.update(encryptedData, undefined, "utf8");
    decrypted += decipher.final("utf8"); // Finish decryption

    return decrypted;
  } catch (e) {
    console.error('Decryption error:', e);
    throw e; // Propagate the error
  }
}
