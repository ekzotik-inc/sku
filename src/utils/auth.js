const HASH_KEY = 'iqos_settings_hash';
const SESSION_KEY = 'iqos_settings_authed';

/** SHA-256 hash via Web Crypto API */
async function sha256(text) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
}

/** Returns true if a password has been set */
export function hasPassword() {
  return !!localStorage.getItem(HASH_KEY);
}

/** Set a new password (replaces existing) */
export async function setPassword(password) {
  const hash = await sha256(password);
  localStorage.setItem(HASH_KEY, hash);
  sessionStorage.setItem(SESSION_KEY, '1');
}

/** Verify password — returns true/false */
export async function verifyPassword(password) {
  const stored = localStorage.getItem(HASH_KEY);
  if (!stored) return true; // no password set → open
  const hash = await sha256(password);
  const ok = hash === stored;
  if (ok) sessionStorage.setItem(SESSION_KEY, '1');
  return ok;
}

/** Check if already authenticated this browser session */
export function isAuthed() {
  if (!hasPassword()) return true;
  return sessionStorage.getItem(SESSION_KEY) === '1';
}

/** Clear session auth (lock) */
export function lockSettings() {
  sessionStorage.removeItem(SESSION_KEY);
}

/** Remove password entirely */
export function removePassword() {
  localStorage.removeItem(HASH_KEY);
  sessionStorage.removeItem(SESSION_KEY);
}
