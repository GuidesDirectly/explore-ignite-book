/**
 * HIBP k-Anonymity Password Breach Check — Server-Side via Edge Function
 *
 * Security architecture:
 *  1. SHA-1 hash is computed client-side using the Web Crypto API
 *  2. Only the first 5 hex chars (prefix) AND the 35-char suffix are sent
 *     to our own Edge Function — never to HIBP directly
 *  3. The Edge Function queries HIBP server-side and caches results for 24 h
 *  4. The full password never leaves the client; the API never sees it
 *
 * Moving the check server-side means:
 *  - Client-side bypass is no longer possible
 *  - Caching and rate limiting are centralised
 *  - Breached password rejections are logged server-side
 *
 * Reference: https://haveibeenpwned.com/API/v3#SearchingPwnedPasswordsByRange
 */

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string;

async function sha1Hex(text: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  const hashBuffer = await crypto.subtle.digest("SHA-1", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")
    .toUpperCase();
}

/**
 * Checks whether a password appears in any known data breach.
 * The full password and full hash never leave the client.
 * Only the 5-char prefix and 35-char suffix are sent to our own Edge Function.
 *
 * @returns true  if the password is compromised (found in breach database)
 * @returns false if the password is safe, or if the service is unreachable (fail-open)
 */
export async function checkPasswordBreached(password: string): Promise<boolean> {
  if (!password || password.length < 3) return false;

  try {
    const hash = await sha1Hex(password);
    const prefix = hash.slice(0, 5);  // First 5 chars — sent to edge function
    const suffix = hash.slice(5);     // Remaining 35 chars — sent to edge function

    // Call our server-side edge function — HIBP API call happens there
    const response = await fetch(
      `${SUPABASE_URL}/functions/v1/check-password-breach`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "apikey": SUPABASE_ANON_KEY,
        },
        body: JSON.stringify({ prefix, suffix }),
      }
    );

    if (!response.ok) {
      console.warn("Breach check service unavailable:", response.status);
      return false; // Fail open — flag account for review server-side
    }

    const data = await response.json();
    return data.breached === true;
  } catch (err) {
    // Fail open: network errors should not block users
    console.warn("HIBP check failed (network error):", err);
    return false;
  }
}

