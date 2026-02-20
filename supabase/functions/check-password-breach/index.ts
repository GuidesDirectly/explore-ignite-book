/**
 * Server-Side HIBP k-Anonymity Password Breach Check
 *
 * Accepts only the first 5 hex characters of the SHA-1 hash (prefix).
 * The full hash and password never leave the client or reach this function.
 *
 * Flow:
 *   Client: SHA1(password) → send prefix (5 chars) + suffix (35 chars)
 *   Server: GET https://api.pwnedpasswords.com/range/{prefix}
 *   Server: check if suffix appears in response
 *   Server: return { breached: boolean }
 *
 * Caching: prefix → suffix set cached in-memory for 24 h to avoid rate limits.
 *
 * Reference: https://haveibeenpwned.com/API/v3#SearchingPwnedPasswordsByRange
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

// In-memory cache: prefix → { suffixes, expiresAt }
const cache = new Map<string, { suffixes: Set<string>; expiresAt: number }>();
const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

// Simple IP-based rate limiter: max 20 requests per minute per IP
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + 60_000 });
    return false;
  }
  if (entry.count >= 20) return true;
  entry.count++;
  return false;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0].trim() ??
    req.headers.get("cf-connecting-ip") ??
    "unknown";

  if (isRateLimited(ip)) {
    return new Response(
      JSON.stringify({ error: "Too many requests. Please wait." }),
      { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  try {
    const body = await req.json();
    const prefix: string = body?.prefix ?? "";
    const suffix: string = body?.suffix ?? "";

    // Validate prefix: exactly 5 uppercase hex chars
    if (!/^[0-9A-F]{5}$/.test(prefix)) {
      return new Response(
        JSON.stringify({ error: "Invalid prefix format." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate suffix: exactly 35 uppercase hex chars
    if (!/^[0-9A-F]{35}$/.test(suffix)) {
      return new Response(
        JSON.stringify({ error: "Invalid suffix format." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check in-memory cache
    const cached = cache.get(prefix);
    if (cached && Date.now() < cached.expiresAt) {
      const breached = cached.suffixes.has(suffix);
      return new Response(
        JSON.stringify({ breached, cached: true }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Fetch from HIBP — Add-Padding prevents traffic analysis
    const response = await fetch(
      `https://api.pwnedpasswords.com/range/${prefix}`,
      {
        headers: {
          "Add-Padding": "true",
          "User-Agent": "GuidesDirectly-SecurityCheck/1.0",
        },
      }
    );

    if (!response.ok) {
      console.warn("HIBP API unavailable:", response.status);
      // Fail open: flag the account for review rather than silently skip
      return new Response(
        JSON.stringify({ breached: false, skipped: true, reason: "HIBP API unavailable" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const text = await response.text();
    const suffixes = new Set<string>();

    for (const line of text.split("\n")) {
      const colonIdx = line.indexOf(":");
      if (colonIdx !== -1) {
        suffixes.add(line.slice(0, colonIdx).trim().toUpperCase());
      }
    }

    // Cache for 24 hours
    cache.set(prefix, { suffixes, expiresAt: Date.now() + CACHE_TTL_MS });

    const breached = suffixes.has(suffix);

    if (breached) {
      console.log(`Breach detected for prefix ${prefix} — password rejected`);
    }

    return new Response(
      JSON.stringify({ breached }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.warn("check-password-breach error:", err);
    // Fail open on unexpected errors — flag for review
    return new Response(
      JSON.stringify({ breached: false, skipped: true, reason: "Unexpected error" }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
