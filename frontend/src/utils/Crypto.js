export function base64ToUint8Array(base64) {
  return Uint8Array.from(atob(base64), c => c.charCodeAt(0));
}

export function uint8ArrayToBase64(arr) {
  return btoa(String.fromCharCode(...arr));
}

export async function encrypt(plainText, rawKey) {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await crypto.subtle.importKey(
    'raw',
    rawKey,
    { name: 'AES-GCM' },
    false,
    ['encrypt']
  );
  const encoded = new TextEncoder().encode(plainText);
  const cipherBuffer = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, encoded);

  const combined = new Uint8Array(iv.length + cipherBuffer.byteLength);
  combined.set(iv);
  combined.set(new Uint8Array(cipherBuffer), iv.length);
  return uint8ArrayToBase64(combined);
}

export async function decrypt(base64Cipher, rawKey) {
  const combined = base64ToUint8Array(base64Cipher);
  const iv = combined.slice(0, 12);
  const ciphertext = combined.slice(12);

  const key = await crypto.subtle.importKey(
    'raw',
    rawKey,
    { name: 'AES-GCM' },
    false,
    ['decrypt']
  );

  const decryptedBuffer = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, ciphertext);
  return new TextDecoder().decode(decryptedBuffer);
}