import crypto from "crypto";

const ALGORITHM = "aes-256-gcm";
const KEY_LENGTH = 32;
const IV_LENGTH = 16;
const AUTH_TAG_LENGTH = 16;
const SALT_LENGTH = 16;

let _cachedKey: Buffer | null = null;

function getEncryptionKey(): Buffer {
  if (_cachedKey) return _cachedKey;
  const key = process.env.ENCRYPTION_KEY;
  if (!key) {
    throw new Error("Encryption configuration missing");
  }
  const keyBuffer = Buffer.from(key, "hex");
  if (keyBuffer.length !== KEY_LENGTH) {
    throw new Error("Invalid encryption configuration");
  }
  _cachedKey = keyBuffer;
  return keyBuffer;
}

function deriveUserKey(baseKey: Buffer, userSalt: Buffer): Buffer {
  return crypto.pbkdf2Sync(baseKey, userSalt, 100000, KEY_LENGTH, 'sha256');
}

export function encrypt(plaintext: string, userId?: number): string {
  const baseKey = getEncryptionKey();
  const iv = crypto.randomBytes(IV_LENGTH);
  
  let key = baseKey;
  let userSalt: Buffer | null = null;
  
  if (userId !== undefined) {
    userSalt = crypto.createHash('sha256')
      .update(`flux-user-${userId}-salt`)
      .digest()
      .subarray(0, SALT_LENGTH);
    key = deriveUserKey(baseKey, userSalt);
  }
  
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv, { authTagLength: AUTH_TAG_LENGTH });
  
  let encrypted = cipher.update(plaintext, "utf8", "hex");
  encrypted += cipher.final("hex");
  const authTag = cipher.getAuthTag();
  
  const saltHex = userSalt ? userSalt.toString("hex") : '';
  return `${iv.toString("hex")}:${authTag.toString("hex")}:${saltHex}:${encrypted}`;
}

export function decrypt(ciphertext: string, userId?: number): string {
  const baseKey = getEncryptionKey();
  const parts = ciphertext.split(":");
  
  if (parts.length < 3) {
    throw new Error("Invalid encrypted data format");
  }
  
  const ivHex = parts[0];
  const authTagHex = parts[1];
  const saltHex = parts[2];
  const encrypted = parts.slice(3).join(":");
  
  if (!ivHex || !authTagHex || !encrypted) {
    throw new Error("Invalid encrypted data format");
  }
  
  const iv = Buffer.from(ivHex, "hex");
  const authTag = Buffer.from(authTagHex, "hex");

  if (authTag.length !== AUTH_TAG_LENGTH) {
    throw new Error("Invalid authentication tag length");
  }
  
  let key = baseKey;
  if (saltHex && userId !== undefined) {
    const userSalt = crypto.createHash('sha256')
      .update(`flux-user-${userId}-salt`)
      .digest()
      .subarray(0, SALT_LENGTH);
    key = deriveUserKey(baseKey, userSalt);
  }
  
  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv, { authTagLength: AUTH_TAG_LENGTH });
  decipher.setAuthTag(authTag);
  
  let decrypted = decipher.update(encrypted, "hex", "utf8");
  decrypted += decipher.final("utf8");
  
  return decrypted;
}

export function generateEncryptionKey(): string {
  return crypto.randomBytes(KEY_LENGTH).toString("hex");
}

export function generateUserSalt(userId: number): string {
  return crypto.createHash('sha256')
    .update(`flux-user-${userId}-salt-${Date.now()}`)
    .digest('hex');
}
