import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const VIRUSTOTAL_API = "https://www.virustotal.com/api/v3";

// Simple rate limiter: max 2 scan requests per IP per minute
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + 60_000 });
    return false;
  }
  if (entry.count >= 2) return true;
  entry.count++;
  return false;
}

serve(async (req) => {
  if (req.method === "OPTIONS")
    return new Response(null, { headers: corsHeaders });

  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0].trim() ??
    req.headers.get("cf-connecting-ip") ??
    "unknown";

  if (isRateLimited(ip)) {
    return new Response(
      JSON.stringify({ error: "Too many scan requests. Please wait." }),
      { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  const VIRUSTOTAL_API_KEY = Deno.env.get("VIRUSTOTAL_API_KEY");
  if (!VIRUSTOTAL_API_KEY) {
    console.error("VIRUSTOTAL_API_KEY is not configured");
    // Fail open: if no API key, allow upload to proceed
    return new Response(
      JSON.stringify({ clean: true, skipped: true, reason: "Scan service not configured" }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return new Response(
        JSON.stringify({ error: "No file provided." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Enforce max file size: 32 MB (VirusTotal free tier limit)
    if (file.size > 32 * 1024 * 1024) {
      return new Response(
        JSON.stringify({ error: "File too large for virus scan (max 32 MB)." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Step 1: Upload file to VirusTotal
    const vtFormData = new FormData();
    vtFormData.append("file", file);

    const uploadRes = await fetch(`${VIRUSTOTAL_API}/files`, {
      method: "POST",
      headers: { "x-apikey": VIRUSTOTAL_API_KEY },
      body: vtFormData,
    });

    if (!uploadRes.ok) {
      const errBody = await uploadRes.text();
      console.error(`VirusTotal upload failed [${uploadRes.status}]:`, errBody);
      // Fail open on API errors to avoid blocking legitimate uploads
      return new Response(
        JSON.stringify({ clean: true, skipped: true, reason: "Scan API error" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const uploadData = await uploadRes.json();
    const analysisId: string = uploadData?.data?.id;

    if (!analysisId) {
      return new Response(
        JSON.stringify({ clean: true, skipped: true, reason: "No analysis ID returned" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Step 2: Poll analysis result (up to 30s, checking every 5s)
    let attempts = 0;
    const maxAttempts = 6;

    while (attempts < maxAttempts) {
      await new Promise((r) => setTimeout(r, 5000));
      attempts++;

      const analysisRes = await fetch(`${VIRUSTOTAL_API}/analyses/${analysisId}`, {
        headers: { "x-apikey": VIRUSTOTAL_API_KEY },
      });

      if (!analysisRes.ok) continue;

      const analysisData = await analysisRes.json();
      const status: string = analysisData?.data?.attributes?.status;

      if (status !== "completed") continue;

      const stats = analysisData?.data?.attributes?.stats ?? {};
      const malicious: number = stats.malicious ?? 0;
      const suspicious: number = stats.suspicious ?? 0;

      const infected = malicious > 0 || suspicious > 1;

      return new Response(
        JSON.stringify({
          clean: !infected,
          malicious,
          suspicious,
          analysisId,
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Timed out waiting for result — fail open
    console.warn("VirusTotal analysis timed out for:", analysisId);
    return new Response(
      JSON.stringify({ clean: true, skipped: true, reason: "Scan timed out" }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("scan-upload error:", err);
    // Fail open on unexpected errors
    return new Response(
      JSON.stringify({ clean: true, skipped: true, reason: "Unexpected error" }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
