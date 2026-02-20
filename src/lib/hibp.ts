/**
 * HIBP k-Anonymity Password Breach Check
 *
 * Uses the Have I Been Pwned Pwned Passwords API with k-anonymity:
 *  1. SHA-1 hash is computed client-side using the Web Crypto API
 *  2. Only the first 5 hex characters (prefix) are sent to the API
 *  3. The full hash never leaves the device
 *  4. The returned suffix list is compared locally
 *
 * This matches the protection provided by Supabase's "Leaked Password Protection"
 * toggle, implemented directly without any dependency on Supabase settings.
 *
 * Reference: https://haveibeenpwned.com/API/v3#SearchingPwnedPasswordsByRange
 */

// Simple in-memory cache: prefix → Set<suffix> | null (null means API error)
// Keyed by prefix, value is { suffixes, expiresAt }
const cache = new Map<string, { suffixes: Set<string>; expiresAt: number }>();
const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

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
 * Uses k-anonymity so the full password and full hash never leave the device.
 *
 * @returns true  if the password is compromised (found in breach database)
 * @returns false if the password is safe, or if the API is unreachable (fail-open)
 */
export async function checkPasswordBreached(password: string): Promise<boolean> {
  if (!password || password.length < 3) return false;

  try {
    const hash = await sha1Hex(password);
    const prefix = hash.slice(0, 5);
    const suffix = hash.slice(5);

    // Check in-memory cache first
    const cached = cache.get(prefix);
    if (cached && Date.now() < cached.expiresAt) {
      return cached.suffixes.has(suffix);
    }

    // Fetch range from HIBP — Add-Padding prevents traffic analysis
    const response = await fetch(
      `https://api.pwnedpasswords.com/range/${prefix}`,
      { headers: { "Add-Padding": "true" } }
    );

    if (!response.ok) {
      // Fail open: don't block signup if API is unavailable
      console.warn("HIBP API unavailable:", response.status);
      return false;
    }

    const text = await response.text();
    const suffixes = new Set<string>();

    for (const line of text.split("\n")) {
      // Each line is: SUFFIX:COUNT  (padding entries have count 0)
      const colonIdx = line.indexOf(":");
      if (colonIdx !== -1) {
        suffixes.add(line.slice(0, colonIdx).trim().toUpperCase());
      }
    }

    // Cache for 24 hours
    cache.set(prefix, { suffixes, expiresAt: Date.now() + CACHE_TTL_MS });

    return suffixes.has(suffix);
  } catch (err) {
    // Fail open: network errors should not block users
    console.warn("HIBP check failed (network error):", err);
    return false;
  }
}
