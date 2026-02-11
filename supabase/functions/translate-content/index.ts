import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const LANGUAGES = [
  { code: "en", name: "English" },
  { code: "ru", name: "Russian" },
  { code: "pl", name: "Polish" },
  { code: "de", name: "German" },
  { code: "fr", name: "French" },
  { code: "es", name: "Spanish" },
  { code: "zh", name: "Mandarin Chinese" },
  { code: "ja", name: "Japanese" },
];

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { table, record_id, fields } = await req.json();

    if (!table || !record_id || !fields || !Array.isArray(fields)) {
      return new Response(
        JSON.stringify({ error: "Missing required params: table, record_id, fields" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Only allow specific tables
    if (!["reviews", "guide_profiles"].includes(table)) {
      return new Response(
        JSON.stringify({ error: "Invalid table" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const lovableApiKey = Deno.env.get("LOVABLE_API_KEY");

    if (!lovableApiKey) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey);

    // Fetch the record
    const { data: record, error: fetchError } = await supabase
      .from(table)
      .select("*")
      .eq("id", record_id)
      .single();

    if (fetchError || !record) {
      console.error("Failed to fetch record:", fetchError);
      return new Response(
        JSON.stringify({ error: "Record not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Extract text values to translate
    const textsToTranslate: Record<string, string> = {};
    for (const field of fields) {
      let value: string | null = null;
      if (field.includes(".")) {
        // Nested field like form_data.biography
        const [parent, child] = field.split(".");
        value = record[parent]?.[child] || null;
      } else {
        value = record[field] || null;
      }
      if (value && typeof value === "string" && value.trim()) {
        textsToTranslate[field] = value;
      }
    }

    if (Object.keys(textsToTranslate).length === 0) {
      return new Response(
        JSON.stringify({ message: "No text to translate" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Build the prompt
    const fieldEntries = Object.entries(textsToTranslate)
      .map(([key, val]) => `"${key}": "${val.replace(/"/g, '\\"')}"`)
      .join(",\n");

    const targetLangs = LANGUAGES.map((l) => `${l.code} (${l.name})`).join(", ");

    const prompt = `Translate the following text fields into these languages: ${targetLangs}.

Input fields:
{
${fieldEntries}
}

Return a JSON object where each key is a language code, and each value is an object with the translated fields. Keep field names exactly as given. Do not translate proper nouns or brand names. Preserve tone and meaning.

Example output format:
{
  "en": {"comment": "Great tour!"},
  "ru": {"comment": "Отличный тур!"},
  ...
}

Return ONLY the JSON object, no markdown, no explanation.`;

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
                "You are a professional translator. Return only valid JSON with no markdown formatting.",
            },
            { role: "user", content: prompt },
          ],
        }),
      }
    );

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error("AI gateway error:", aiResponse.status, errorText);
      
      if (aiResponse.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limited, will retry later" }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (aiResponse.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted" }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      throw new Error(`AI gateway error: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    const content = aiData.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("No content in AI response");
    }

    // Parse the JSON response (strip markdown code fences if present)
    let translations: Record<string, Record<string, string>>;
    try {
      const cleaned = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      translations = JSON.parse(cleaned);
    } catch (e) {
      console.error("Failed to parse AI response:", content);
      throw new Error("Failed to parse translation response");
    }

    // Update the record with translations
    const { error: updateError } = await supabase
      .from(table)
      .update({ translations })
      .eq("id", record_id);

    if (updateError) {
      console.error("Failed to update record:", updateError);
      throw new Error("Failed to save translations");
    }

    console.log(`Translated ${Object.keys(textsToTranslate).length} fields for ${table}/${record_id} into ${Object.keys(translations).length} languages`);

    return new Response(
      JSON.stringify({ success: true, languages: Object.keys(translations) }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("translate-content error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
