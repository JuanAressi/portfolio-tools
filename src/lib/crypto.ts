/**
 * Client-side AES-GCM helpers.
 * The key never leaves the browser except as a URL #fragment.
 */

function bytesToBase64url(bytes: Uint8Array): string {
  let binary = "";
  for (const b of bytes) binary += String.fromCharCode(b);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function base64urlToBytes(value: string): Uint8Array {
  const padded =
    value.replace(/-/g, "+").replace(/_/g, "/") +
    "===".slice((value.length + 3) % 4);
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

async function importKey(raw: Uint8Array): Promise<CryptoKey> {
  const keyData = raw.slice().buffer;
  return crypto.subtle.importKey("raw", keyData, { name: "AES-GCM" }, false, [
    "encrypt",
    "decrypt",
  ]);
}

export type EncryptedPayload = {
  /** base64url ciphertext (includes auth tag) */
  ciphertext: string;
  /** base64url IV */
  iv: string;
  /** base64url raw AES key — put in URL #fragment only */
  key: string;
};

export async function encryptText(plaintext: string): Promise<EncryptedPayload> {
  const keyBytes = crypto.getRandomValues(new Uint8Array(32));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await importKey(keyBytes);
  const encoded = new TextEncoder().encode(plaintext);

  const encrypted = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv: iv.buffer as ArrayBuffer },
    key,
    encoded,
  );

  return {
    ciphertext: bytesToBase64url(new Uint8Array(encrypted)),
    iv: bytesToBase64url(iv),
    key: bytesToBase64url(keyBytes),
  };
}

export async function decryptText(
  ciphertextB64: string,
  ivB64: string,
  keyB64: string,
): Promise<string> {
  const key = await importKey(base64urlToBytes(keyB64));
  const iv = base64urlToBytes(ivB64);
  const ciphertext = base64urlToBytes(ciphertextB64);

  const decrypted = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv: iv.slice().buffer as ArrayBuffer },
    key,
    ciphertext.slice().buffer as ArrayBuffer,
  );

  return new TextDecoder().decode(decrypted);
}

/** Fragment format: key.iv (both base64url) */
export function encodeFragment(key: string, iv: string): string {
  return `${key}.${iv}`;
}

export function decodeFragment(
  fragment: string,
): { key: string; iv: string } | null {
  const cleaned = fragment.replace(/^#/, "").trim();
  const [key, iv] = cleaned.split(".");
  if (!key || !iv) return null;
  return { key, iv };
}
