import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

function chunkArray<T>(arr: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    chunks.push(arr.slice(i, i + size));
  }
  return chunks;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ error: "Method not allowed" }),
      { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  // --- Authentication: require valid JWT + admin role ---
  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return new Response(
      JSON.stringify({ error: "Unauthorized" }),
      { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  const token = authHeader.replace("Bearer ", "");
  const supabaseAuth = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_ANON_KEY")!,
    { global: { headers: { Authorization: authHeader } } }
  );

  const { data: claimsData, error: claimsError } = await supabaseAuth.auth.getClaims(token);
  if (claimsError || !claimsData?.claims) {
    return new Response(
      JSON.stringify({ error: "Unauthorized" }),
      { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  const userId = claimsData.claims.sub;

  // Check admin role
  const adminSupabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  const { data: roleData } = await adminSupabase.rpc("has_role", {
    _user_id: userId,
    _role: "admin",
  });

  if (!roleData) {
    return new Response(
      JSON.stringify({ error: "Forbidden: admin role required" }),
      { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  try {
    const body = await req.json();

    if (!body || typeof body !== "object") {
      return new Response(
        JSON.stringify({ error: "Invalid request body" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { keys, targetLanguages, context } = body;

    // Validate keys
    if (!keys || typeof keys !== "object" || Array.isArray(keys)) {
      return new Response(
        JSON.stringify({ error: "keys must be a non-empty object of key-value pairs" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const keyEntries = Object.entries(keys);
    if (keyEntries.length === 0 || keyEntries.length > 500) {
      return new Response(
        JSON.stringify({ error: "keys must contain 1-500 entries" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    for (const [k, v] of keyEntries) {
      if (typeof k !== "string" || typeof v !== "string") {
        return new Response(
          JSON.stringify({ error: `Invalid key-value pair: ${k}` }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    // Validate targetLanguages
    const VALID_LANGS = new Set([
      "ar", "de", "es", "fr", "he", "hi", "id", "it", "ja", "ko",
      "nl", "pl", "pt", "ru", "sv", "th", "tr", "uk", "vi", "zh",
    ]);

    if (!Array.isArray(targetLanguages) || targetLanguages.length === 0) {
      return new Response(
        JSON.stringify({ error: "targetLanguages must be a non-empty array" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    for (const lang of targetLanguages) {
      if (!VALID_LANGS.has(lang)) {
        return new Response(
          JSON.stringify({ error: `Invalid target language: ${lang}` }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    // Validate context (optional)
    if (context !== undefined && (typeof context !== "string" || context.length > 500)) {
      return new Response(
        JSON.stringify({ error: "context must be a string of up to 500 characters" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const lovableApiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!lovableApiKey) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Build the source text block
    const sourceJson = JSON.stringify(keys, null, 2);

    // Language name mapping for better translation quality
    const langNames: Record<string, string> = {
      ar: "Arabic", de: "German", es: "Spanish", fr: "French",
      he: "Hebrew", hi: "Hindi", id: "Indonesian", it: "Italian",
      ja: "Japanese", ko: "Korean", nl: "Dutch", pl: "Polish",
      pt: "Portuguese", ru: "Russian", sv: "Swedish", th: "Thai",
      tr: "Turkish", uk: "Ukrainian", vi: "Vietnamese", zh: "Simplified Chinese",
    };

    // Batch languages in groups of 5
    const langBatches = chunkArray(targetLanguages, 5);
    const allTranslations: Record<string, Record<string, string>> = {};
    const errors: string[] = [];

    for (const batch of langBatches) {
      const batchLangs = batch.map((code) => `${code} (${langNames[code] || code})`).join(", ");

      const prompt = `Translate the following JSON object values into these languages: ${batchLangs}.

Source (English):
${sourceJson}

${context ? `Context: ${context}\n` : ""}Rules:
- Return a JSON object where each top-level key is a language code
- Each value is an object with the same keys as the source, but with translated values
- Keep all JSON keys exactly as they are (do not translate keys)
- Do not translate brand names, proper nouns, or technical terms
- Preserve any HTML tags, placeholders like {{name}}, and special characters
- For RTL languages (Arabic, Hebrew), provide natural RTL text
- Match the tone and register of the English source

Example output format:
{
  "de": { "key1": "German translation", "key2": "..." },
  "fr": { "key1": "French translation", "key2": "..." }
}

Return ONLY valid JSON. No markdown, no explanation.`;

      try {
        const aiResponse = await fetch(
          "https://ai.gateway.lovable.dev/v1/chat/completions",
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${lovableApiKey}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              model: "google/gemini-2.5-flash",
              messages: [
                {
                  role: "system",
                  content:
                    "You are a professional translator specializing in UI/UX localization. Return only valid JSON with no markdown formatting. Produce natural, culturally appropriate translations.",
                },
                { role: "user", content: prompt },
              ],
            }),
          }
        );

        if (!aiResponse.ok) {
          const errorText = await aiResponse.text();
          console.error(`AI gateway error for batch [${batch.join(",")}]:`, aiResponse.status, errorText);

          if (aiResponse.status === 429) {
            errors.push(`Rate limited on batch [${batch.join(",")}]`);
            continue;
          }
          if (aiResponse.status === 402) {
            return new Response(
              JSON.stringify({ error: "AI credits exhausted", partialTranslations: allTranslations }),
              { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
          }
          errors.push(`AI error ${aiResponse.status} for batch [${batch.join(",")}]`);
          continue;
        }

        const aiData = await aiResponse.json();
        const content = aiData.choices?.[0]?.message?.content;

        if (!content) {
          errors.push(`Empty AI response for batch [${batch.join(",")}]`);
          continue;
        }

        let batchTranslations: Record<string, Record<string, string>>;
        try {
          const cleaned = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
          batchTranslations = JSON.parse(cleaned);
        } catch {
          console.error(`Failed to parse AI response for batch [${batch.join(",")}]:`, content.substring(0, 200));
          errors.push(`Parse error for batch [${batch.join(",")}]`);
          continue;
        }

        // Merge batch results
        for (const lang of batch) {
          if (batchTranslations[lang]) {
            allTranslations[lang] = batchTranslations[lang];
          } else {
            errors.push(`Missing language ${lang} in AI response`);
          }
        }
      } catch (batchErr) {
        console.error(`Batch [${batch.join(",")}] failed:`, batchErr);
        errors.push(`Exception for batch [${batch.join(",")}]`);
      }
    }

    const translatedLangs = Object.keys(allTranslations);
    console.log(
      `Translated ${keyEntries.length} keys into ${translatedLangs.length}/${targetLanguages.length} languages.` +
        (errors.length > 0 ? ` Errors: ${errors.join("; ")}` : "")
    );

    return new Response(
      JSON.stringify({
        translations: allTranslations,
        translatedKeys: keyEntries.length,
        languages: translatedLangs.length,
        ...(errors.length > 0 ? { errors } : {}),
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("translate-i18n-keys error:", e);
    return new Response(
      JSON.stringify({ error: "An unexpected error occurred." }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
