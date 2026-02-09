/**
 * Client-Side Zero-Knowledge Encryption
 * AES-256-GCM with Web Crypto API
 */

export class EncryptionService {
  private async deriveKey(password: string, salt: Uint8Array): Promise<CryptoKey> {
    const enc = new TextEncoder();
    const keyMaterial = await window.crypto.subtle.importKey(
      'raw',
      enc.encode(password),
      'PBKDF2',
      false,
      ['deriveBits', 'deriveKey']
    );

    return window.crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: salt,
        iterations: 100000,
        hash: 'SHA-256',
      },
      keyMaterial,
      { name: 'AES-GCM', length: 256 },
      true,
      ['encrypt', 'decrypt']
    );
  }

  async encrypt(plaintext: string, userId: string): Promise<string> {
    const enc = new TextEncoder();
    const data = enc.encode(plaintext);

    // Generate random IV and salt
    const iv = window.crypto.getRandomValues(new Uint8Array(12));
    const salt = window.crypto.getRandomValues(new Uint8Array(16));

    // Derive key
    const key = await this.deriveKey(userId, salt);

    // Encrypt
    const encrypted = await window.crypto.subtle.encrypt(
      {
        name: 'AES-GCM',
        iv: iv,
      },
      key,
      data
    );

    // Combine IV + salt + ciphertext
    const combined = new Uint8Array(iv.length + salt.length + encrypted.byteLength);
    combined.set(iv, 0);
    combined.set(salt, iv.length);
    combined.set(new Uint8Array(encrypted), iv.length + salt.length);

    // Convert to base64
    return btoa(String.fromCharCode(...combined));
  }

  async decrypt(encrypted: string, userId: string): Promise<string> {
    // Decode from base64
    const combined = Uint8Array.from(atob(encrypted), c => c.charCodeAt(0));

    // Extract IV, salt, and ciphertext
    const iv = combined.slice(0, 12);
    const salt = combined.slice(12, 28);
    const ciphertext = combined.slice(28);

    // Derive key
    const key = await this.deriveKey(userId, salt);

    // Decrypt
    const decrypted = await window.crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv: iv,
      },
      key,
      ciphertext
    );

    // Convert to string
    const dec = new TextDecoder();
    return dec.decode(decrypted);
  }
}

export const encryption = new EncryptionService();