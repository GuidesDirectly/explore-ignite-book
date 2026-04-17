import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface FoundingProgramData {
  foundingPlanId: string | null;
  limit: number;
  currentCount: number;
  remaining: number;
  freeUntil: string; // ISO date string
  lockedPrice: number;
  isFull: boolean;
  isPastFreeUntil: boolean;
}

const DEFAULTS: FoundingProgramData = {
  foundingPlanId: null,
  limit: 50,
  currentCount: 0,
  remaining: 50,
  freeUntil: "2026-12-31",
  lockedPrice: 29,
  isFull: false,
  isPastFreeUntil: false,
};

/**
 * Reads founding-program settings + plan UUID from Supabase exactly once
 * per component mount. Cached in component state — no refetch on render.
 */
export function useFoundingProgram() {
  const [data, setData] = useState<FoundingProgramData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [planRes, settingsRes] = await Promise.all([
          supabase
            .from("subscription_plans")
            .select("id")
            .eq("slug", "founding")
            .maybeSingle(),
          supabase
            .from("app_settings")
            .select("key, value")
            .in("key", [
              "founding_guide_limit",
              "founding_guide_current_count",
              "founding_guide_free_until",
              "founding_guide_locked_price",
            ]),
        ]);

        if (cancelled) return;

        const settingsMap: Record<string, any> = {};
        (settingsRes.data || []).forEach((row: any) => {
          settingsMap[row.key] = row.value;
        });

        const parseNumber = (v: any, fallback: number): number => {
          if (v === null || v === undefined) return fallback;
          if (typeof v === "number") return v;
          const n = Number(typeof v === "string" ? v : JSON.stringify(v).replace(/"/g, ""));
          return Number.isFinite(n) ? n : fallback;
        };
        const parseString = (v: any, fallback: string): string => {
          if (v === null || v === undefined) return fallback;
          if (typeof v === "string") return v;
          return JSON.stringify(v).replace(/"/g, "");
        };

        const limit = parseNumber(settingsMap["founding_guide_limit"], DEFAULTS.limit);
        const currentCount = parseNumber(settingsMap["founding_guide_current_count"], DEFAULTS.currentCount);
        const freeUntil = parseString(settingsMap["founding_guide_free_until"], DEFAULTS.freeUntil);
        const lockedPrice = parseNumber(settingsMap["founding_guide_locked_price"], DEFAULTS.lockedPrice);
        const remaining = Math.max(0, limit - currentCount);
        const isFull = remaining <= 0;
        const isPastFreeUntil = new Date() > new Date(freeUntil + "T23:59:59Z");

        setData({
          foundingPlanId: (planRes.data as any)?.id ?? null,
          limit,
          currentCount,
          remaining,
          freeUntil,
          lockedPrice,
          isFull,
          isPastFreeUntil,
        });
      } catch (e) {
        console.error("useFoundingProgram fetch failed:", e);
        if (!cancelled) setData(DEFAULTS);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return { data, loading };
}
