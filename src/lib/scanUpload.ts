import { supabase } from "@/integrations/supabase/client";

/**
 * Scans a file for viruses/malware using the scan-upload Edge Function,
 * which proxies to VirusTotal using k-anonymity-safe file submission.
 *
 * Fails open: if the scan service is unavailable or times out,
 * this returns { clean: true } so legitimate uploads are not blocked.
 *
 * @returns { clean: boolean; reason?: string }
 */
export async function scanFileForViruses(
  file: File
): Promise<{ clean: boolean; reason?: string }> {
  try {
    const form = new FormData();
    form.append("file", file);

    // Use supabase.functions.invoke with raw FormData — we build the fetch manually
    // because invoke() doesn't support FormData natively
    const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID;
    const anonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

    const response = await fetch(
      `https://${projectId}.supabase.co/functions/v1/scan-upload`,
      {
        method: "POST",
        headers: {
          apikey: anonKey,
          Authorization: `Bearer ${anonKey}`,
        },
        body: form,
      }
    );

    if (!response.ok) {
      console.warn("scan-upload returned non-OK status:", response.status);
      return { clean: true, reason: "Scan service error — proceeding" };
    }

    const data = await response.json();
    return {
      clean: data.clean ?? true,
      reason: data.reason,
    };
  } catch (err) {
    console.warn("File scan failed (network/parse error):", err);
    return { clean: true, reason: "Scan unavailable — proceeding" };
  }
}
