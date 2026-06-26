/**
 * Password is set via VITE_SETTINGS_PWD_HASH env variable at build time.
 * The value must be a SHA-256 hex hash of the chosen password.
 *
 * To generate the hash, open browser console and run:
 *   const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode('YOUR_PASSWORD'));
 *   console.log(Array.from(new Uint8Array(buf)).map(b=>b.toString(16).padStart(2,'0')).join(''));
 *
 * Then add the result as a GitHub secret: VITE_SETTINGS_PWD_HASH
 */
const CORRECT_HASH = import.meta.env.VITE_SETTINGS_PWD_HASH || '';
const SESSION_KEY = 'iqos_settings_authed';

async function sha256(text) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
}

/** True if password protection is configured (hash is set at build time) */
export function hasPassword() {
  return CORRECT_HASH.length === 64; // valid SHA-256 hex is 64 chars
}

/** Verify entered password against the compiled-in hash */
export async function verifyPassword(password) {
  if (!hasPassword()) return true; // no hash configured → open
  const hash = await sha256(password);
  const ok = hash === CORRECT_HASH;
  if (ok) sessionStorage.setItem(SESSION_KEY, '1');
  return ok;
}

/** Check if already authenticated this browser session */
export function isAuthed() {
  if (!hasPassword()) return true;
  return sessionStorage.getItem(SESSION_KEY) === '1';
}

/** Lock: clear session auth */
export function lockSettings() {
  sessionStorage.removeItem(SESSION_KEY);
}
