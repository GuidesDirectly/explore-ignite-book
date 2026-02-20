/**
 * Server-Side HIBP k-Anonymity Password Breach Check
 *
 * Security architecture:
 *  1. Client hashes password with SHA-1 locally — password never sent anywhere
 *  2. Client sends only: prefix (5 chars) + suffix (35 chars) to THIS function
 *  3. This function queries HIBP API server-side
 *  4. Results are cached in the password_breach_cache DB table for 24 h
 *     → survives edge function cold starts, reduces external API calls
 *  5. Breach rejections are logged server-side for audit purposes
 *
 * Reference: https://haveibeenpwned.com/API/v3#SearchingPwnedPasswordsByRange
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

// Simple IP-based rate limiter: max 20 requests per minute per IP (in-memory is fine here)
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

  // Service role client for cache table access (bypasses RLS)
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  try {
    const body = await req.json();
    const prefix: string = (body?.prefix ?? "").toUpperCase();
    const suffix: string = (body?.suffix ?? "").toUpperCase();

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

    // --- 1. Check persistent DB cache ---
    const { data: cached } = await supabase
      .from("password_breach_cache")
      .select("hashes, fetched_at")
      .eq("prefix", prefix)
      .maybeSingle();

    if (cached) {
      const age = Date.now() - new Date(cached.fetched_at).getTime();
      if (age < CACHE_TTL_MS) {
        const breached = cached.hashes.includes(suffix);
        if (breached) console.log(`[cache-hit] Breach detected for prefix ${prefix}`);
        return new Response(
          JSON.stringify({ breached, cached: true }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    // --- 2. Fetch fresh data from HIBP ---
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
      console.warn(`HIBP API unavailable: ${response.status}`);
      // Fail open — don't block the user, flag for review
      return new Response(
        JSON.stringify({ breached: false, skipped: true, reason: "HIBP API unavailable" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const hashes = await response.text();

    // --- 3. Persist to DB cache (upsert) ---
    await supabase.from("password_breach_cache").upsert({
      prefix,
      hashes,
      fetched_at: new Date().toISOString(),
    });

    const breached = hashes.includes(suffix);

    if (breached) {
      console.log(`[breach-detected] Prefix: ${prefix} — password rejected`);
    }

    return new Response(
      JSON.stringify({ breached }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.warn("check-password-breach error:", err);
    return new Response(
      JSON.stringify({ breached: false, skipped: true, reason: "Unexpected error" }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
