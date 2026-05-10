import { useState, useEffect, useMemo } from "react";
import MessageGuideButton from "@/components/messaging/MessageGuideButton";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { generateGuideSlug, toTitleCase } from "@/lib/utils";
import { MapPin, Globe, Search, MessageCircle } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEO from "@/components/seo/SEO";
import SpotlightBanner from "@/components/SpotlightBanner";
import dcImg from "@/assets/hero-dc.jpg";
import chicagoImg from "@/assets/city-cards/chicago.jpg";

const LANGUAGE_FLAGS: Record<string, string> = {
  English: "🇺🇸",
  "Русский": "🇷🇺",
  "Polski": "🇵🇱",
  Deutsch: "🇩🇪",
  "Français": "🇫🇷",
  "Español": "🇪🇸",
  "中文": "🇨🇳",
  "日本語": "🇯🇵",
  "עברית": "🇮🇱",
  "العربية": "🇸🇦",
  "Português": "🇧🇷",
  "한국어": "🇰🇷",
  Italiano: "🇮🇹",
  "हिन्दी": "🇮🇳",
  "Tiếng Việt": "🇻🇳",
  "Bahasa Indonesia": "🇮🇩",
  Nederlands: "🇳🇱",
  "ไทย": "🇹🇭",
  "Türkçe": "🇹🇷",
  Svenska: "🇸🇪",
  "Українська": "🇺🇦",
};

const LANGUAGE_OPTIONS = [
  "Any Language",
  ...Object.keys(LANGUAGE_FLAGS),
];

function getCityImage(guide: GuideProfile): string | null {
  const areas = guide.service_areas || [];
  const areasStr = JSON.stringify(areas).toLowerCase();
  if (areasStr.includes("washington") || areasStr.includes("dc") || areasStr.includes("d.c")) return dcImg;
  if (areasStr.includes("chicago")) return chicagoImg;
  return null;
}

type SortOption = "recommended" | "most_reviews" | "newest";

interface GuideProfile {
  id: string;
  user_id: string;
  form_data: any;
  service_areas: string[] | null;
  translations: any;
  activation_status: string | null;
  created_at: string | null;
  is_spotlight?: boolean | null;
}

interface ReviewStats {
  guide_id: string;
  count: number;
  avg: number;
}

const GuidesPage = () => {
  const navigate = useNavigate();
  const [guides, setGuides] = useState<GuideProfile[]>([]);
  const [reviewStats, setReviewStats] = useState<Record<string, ReviewStats>>({});
  const [tourCounts, setTourCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [cityFilter, setCityFilter] = useState("");
  const [languageFilter, setLanguageFilter] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("recommended");
  const [fetchStatus, setFetchStatus] = useState<"ok" | "error" | "empty" | "pending">("pending");
  const [fetchError, setFetchError] = useState<string>("");
  const [rowCount, setRowCount] = useState<number>(0);

  useEffect(() => {
    document.title = "Find Local Tour Guides | Guides Directly";
    const desc = document.querySelector('meta[name="description"]');
    if (desc) desc.setAttribute("content", "Browse verified local tour guides by city and language. Direct contact, zero commission. Washington DC, Chicago, and more.");
    return () => {
      document.title = "Guides Directly — Find Local Tour Guides | Zero Commission";
    };
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);

      // 1) Guides — must succeed independently. Failure here = empty list.
      try {
        const { data, error } = await supabase
          .from("guide_profiles_public")
          .select("*");
        console.log("[GuidesPage] fetch result:", data, error);
        if (error) {
          console.error("[GuidesPage] Guides fetch error:", error);
          setFetchStatus("error");
          setFetchError(error.message || String(error));
          throw error;
        }
        console.log("[GuidesPage] Guides data:", data?.length ?? 0, "rows");
        setRowCount(data?.length ?? 0);
        if (data && data.length > 0) {
          setGuides(data as GuideProfile[]);
          setFetchStatus("ok");
        } else {
          setFetchStatus("empty");
        }
      } catch (err: any) {
        console.error("[GuidesPage] guides fetch failed:", err);
        setFetchStatus("error");
        setFetchError(err?.message || String(err));
      }

      // Build user_id -> profile id map (used to key reviews/tours by guide.id)
      let userIdToProfileId = new Map<string, string>();
      try {
        const { data: idMap } = await supabase
          .from("guide_profiles")
          .select("id, user_id")
          .eq("status", "approved")
          .eq("activation_status", "active");
        if (idMap) {
          userIdToProfileId = new Map(
            (idMap as any[]).map((r) => [r.user_id, r.id])
          );
        }
      } catch (err) {
        console.warn("[GuidesPage] id map fetch failed (non-blocking):", err);
      }

      // Reviews — optional decoration, keyed by profile id
      try {
        const { data: reviewsData } = await supabase
          .from("reviews_public")
          .select("guide_user_id, rating");
        if (reviewsData) {
          const stats: Record<string, ReviewStats> = {};
          for (const r of reviewsData) {
            if (!r.guide_user_id) continue;
            const profileId = userIdToProfileId.get(r.guide_user_id);
            if (!profileId) continue;
            if (!stats[profileId]) {
              stats[profileId] = { guide_id: profileId, count: 0, avg: 0 };
            }
            stats[profileId].count++;
            stats[profileId].avg += (r.rating || 0);
          }
          for (const k of Object.keys(stats)) {
            stats[k].avg = stats[k].count > 0 ? stats[k].avg / stats[k].count : 0;
          }
          setReviewStats(stats);
        }
      } catch (err) {
        console.warn("[GuidesPage] reviews fetch failed (non-blocking):", err);
      }

      // Tour counts — optional decoration, keyed by profile id
      try {
        const { data: toursData } = await supabase
          .from("tours")
          .select("guide_user_id")
          .eq("status", "published");
        if (toursData) {
          const counts: Record<string, number> = {};
          for (const row of toursData as any[]) {
            if (!row.guide_user_id) continue;
            const profileId = userIdToProfileId.get(row.guide_user_id);
            if (!profileId) continue;
            counts[profileId] = (counts[profileId] || 0) + 1;
          }
          setTourCounts(counts);
        }
      } catch (err) {
        console.warn("[GuidesPage] tours fetch failed (non-blocking):", err);
      }

      setLoading(false);
    };
    fetchData();
  }, []);

  const filtered = useMemo(() => {
    let result = [...guides];

    if (cityFilter.trim()) {
      const q = cityFilter.trim().toLowerCase();
      result = result.filter((g) =>
        g.service_areas?.some((a) => a.toLowerCase().includes(q))
      );
    }

    if (languageFilter && languageFilter !== "Any Language") {
      result = result.filter((g) => {
        const langs = g.form_data?.languages;
        if (Array.isArray(langs)) return langs.some((l: string) => l === languageFilter);
        if (typeof langs === "string") return langs.includes(languageFilter);
        return false;
      });
    }

    if (sortBy === "most_reviews") {
      result.sort((a, b) => (reviewStats[b.id]?.count || 0) - (reviewStats[a.id]?.count || 0));
    } else if (sortBy === "newest") {
      result.sort((a, b) => (b.created_at || "").localeCompare(a.created_at || ""));
    }

    // Spotlight guides always rendered first within the current result set
    result.sort((a, b) => (b.is_spotlight ? 1 : 0) - (a.is_spotlight ? 1 : 0));

    return result;
  }, [guides, cityFilter, languageFilter, sortBy, reviewStats]);

  const getInitials = (fd: any) => {
    const f = (fd?.firstName || "?")[0]?.toUpperCase() || "?";
    const l = (fd?.lastName || "?")[0]?.toUpperCase() || "?";
    return f + l;
  };

  const getLanguageCodes = (languages: string[]): string[] => {
    const codeMap: Record<string, string> = {
      English: "EN", "Русский": "RU", Polski: "PL", Deutsch: "DE",
      "Français": "FR", "Español": "ES", "中文": "ZH", "日本語": "JA",
      "עברית": "HE", "العربية": "AR", "Português": "PT", "한국어": "KO",
      Italiano: "IT", "हिन्दी": "HI", "Tiếng Việt": "VI",
      "Bahasa Indonesia": "ID", Nederlands: "NL", "ไทย": "TH",
      "Türkçe": "TR", Svenska: "SV", "Українська": "UK",
    };
    return languages.map(l => codeMap[l] || l.slice(0, 2).toUpperCase()).slice(0, 4);
  };

  const displayList = filtered;
  const hasFilters = !!cityFilter.trim() || (!!languageFilter && languageFilter !== "Any Language");
  const showLoadError = !loading && fetchStatus !== "ok" && guides.length === 0 && !hasFilters;

  return (
    <div style={{ background: "#0A1628" }} className="min-h-screen">
      <Navbar />

      {/* SECTION 2 — Results bar */}
      <section style={{ background: "#122040", padding: "16px 0" }}>
        <div className="container mx-auto px-4 flex items-center justify-between">
          <span style={{ color: "#F5F0E8", fontSize: 14 }}>
            {displayList.length} guide{displayList.length !== 1 ? "s" : ""} found
          </span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortOption)}
            className="bg-transparent outline-none cursor-pointer"
            style={{
              color: "#C9A84C",
              fontSize: 13,
              border: "1px solid rgba(201,168,76,0.4)",
              borderRadius: 6,
              padding: "6px 12px",
            }}
          >
            <option value="recommended" style={{ background: "#0A1628" }}>Recommended</option>
            <option value="most_reviews" style={{ background: "#0A1628" }}>Most Reviews</option>
            <option value="newest" style={{ background: "#0A1628" }}>Newest Members</option>
          </select>
        </div>
      </section>

      {/* SECTION 3 — Guide cards grid */}
      <section style={{ background: "#0A1628", padding: "48px 0" }}>
        <div className="container mx-auto px-4" style={{ maxWidth: 1200 }}>
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="animate-pulse rounded-xl" style={{ background: "#1A2F50", height: 420 }} />
              ))}
            </div>
          ) : displayList.length === 0 ? (
            <div className="text-center py-20">
              {showLoadError ? (
                <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 16 }}>
                  Unable to load guides at this time. Please try again shortly.
                </p>
              ) : (
                <>
                  <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 16 }} className="mb-6">
                    No guides found for your search. Try a different city or language.
                  </p>
                  <button
                    onClick={() => { setCityFilter(""); setLanguageFilter(""); }}
                    className="px-6 py-3 rounded-full text-sm font-semibold"
                    style={{
                      color: "#C9A84C",
                      border: "1px solid rgba(201,168,76,0.4)",
                      background: "transparent",
                    }}
                  >
                    Clear filters
                  </button>
                </>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {displayList.map((guide) => {
                const fd = guide.form_data || {};
                const initials = getInitials(fd);
                const languages: string[] = Array.isArray(fd?.languages) ? fd.languages : [];
                const langCodes = getLanguageCodes(languages);
                const city = guide.service_areas?.[0] || "";
                const bio = fd.biography
                  ? fd.biography.length > 100
                    ? fd.biography.slice(0, 100) + "..."
                    : fd.biography
                  : "";
                const specs: string[] = Array.isArray(fd.specializations)
                  ? fd.specializations.slice(0, 3)
                  : [];
                const firstName = fd.firstName || "Guide";

                return (
                  <div
                    key={guide.id}
                    className="rounded-xl overflow-hidden transition-all duration-200 hover:-translate-y-0.5"
                    style={{
                      background: "#1A2F50",
                      border: "0.5px solid rgba(201,168,76,0.15)",
                      cursor: "pointer",
                    }}
                    onClick={() => navigate(`/guide/${generateGuideSlug(fd.firstName || "", fd.lastName || "", city)}`)}
                    onMouseEnter={(e) => (e.currentTarget.style.borderColor = "rgba(201,168,76,0.4)")}
                    onMouseLeave={(e) => (e.currentTarget.style.borderColor = "rgba(201,168,76,0.15)")}
                  >
                    {/* Avatar */}
                    <div
                      className="relative flex items-center justify-center"
                      style={{ aspectRatio: "16/9", background: "#0A1628", overflow: "hidden" }}
                    >
                      {getCityImage(guide) && (
                        <>
                          <img
                            src={getCityImage(guide)!}
                            alt=""
                            className="absolute inset-0 w-full h-full"
                            style={{ objectFit: "cover", opacity: 0.92 }}
                          />
                          <div
                            className="absolute inset-0"
                            style={{ background: "linear-gradient(to top, rgba(10,22,40,0.35), rgba(10,22,40,0.05))" }}
                          />
                        </>
                      )}
                      <span className="font-serif" style={{ fontSize: 52, color: "#C9A84C", position: "relative", zIndex: 1 }}>
                        {initials}
                      </span>
                      {guide.activation_status === "active" && (
                        <span
                          className="absolute bottom-3 left-3 text-white font-semibold"
                          style={{
                            background: "#2D6A4F",
                            fontSize: 10,
                            padding: "3px 8px",
                            borderRadius: 4,
                            position: "relative",
                            zIndex: 1,
                          }}
                        >
                          VERIFIED
                        </span>
                      )}
                      {guide.is_spotlight && (
                        <div className="absolute top-3 right-3 flex flex-col items-end gap-1.5" style={{ zIndex: 1 }}>
                          <SpotlightBanner size="sm" />
                        </div>
                      )}
                    </div>

                    {/* Language code pills */}
                    {langCodes.length > 0 && (
                      <div style={{ display: "flex", gap: "6px", padding: "8px 16px", flexWrap: "wrap" }}>
                        {langCodes.map((code) => (
                          <span
                            key={code}
                            style={{
                              fontSize: "11px",
                              fontWeight: 600,
                              color: "#C9A84C",
                              background: "rgba(201,168,76,0.12)",
                              border: "1px solid rgba(201,168,76,0.3)",
                              borderRadius: "4px",
                              padding: "2px 7px",
                              letterSpacing: "0.05em",
                            }}
                          >
                            {code}
                          </span>
                        ))}
                        {languages.length > 4 && (
                          <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.5)", padding: "2px 4px" }}>
                            +{languages.length - 4}
                          </span>
                        )}
                      </div>
                    )}

                    {/* Name */}
                    <p
                      className="font-serif"
                      style={{ fontSize: 20, fontWeight: 600, color: "#F5F0E8", padding: "16px 16px 4px" }}
                    >
                      {fd.firstName} {fd.lastName}
                    </p>

                    {/* City */}
                    {city && (
                      <p style={{ fontSize: 13, color: "rgba(255,255,255,0.6)", padding: "0 16px 8px" }}>
                        📍 {toTitleCase(city)}
                      </p>
                    )}

                    {/* Tour count pill or empty-state note */}
                    {(() => {
                      const count = tourCounts[guide.id] || 0;
                      if (count > 0) {
                        return (
                          <div style={{ padding: "0 16px 8px" }}>
                            <span
                              style={{
                                display: "inline-block",
                                fontSize: 11,
                                fontWeight: 600,
                                color: "#C9A84C",
                                background: "rgba(201,168,76,0.12)",
                                border: "1px solid rgba(201,168,76,0.35)",
                                borderRadius: 999,
                                padding: "3px 10px",
                              }}
                            >
                              🎟️ {count} tour{count !== 1 ? "s" : ""} available
                            </span>
                          </div>
                        );
                      }
                      return (
                        <p
                          style={{
                            fontSize: 12,
                            fontStyle: "italic",
                            color: "rgba(255,255,255,0.5)",
                            padding: "0 16px 8px",
                          }}
                        >
                          Available for custom tours — send a message
                        </p>
                      );
                    })()}

                    {/* Bio */}
                    {bio && (
                      <p style={{ fontSize: 13, lineHeight: 1.6, color: "rgba(255,255,255,0.55)", padding: "0 16px 12px" }}>
                        {bio}
                      </p>
                    )}

                    {/* Specialization pills */}
                    {specs.length > 0 && (
                      <div className="flex flex-wrap gap-2 px-4 pb-4">
                        {specs.map((s) => (
                          <button
                            key={s}
                            onClick={(e) => { e.stopPropagation(); navigate(`/guide/${generateGuideSlug(fd.firstName || "", fd.lastName || "", city)}?specialization=${encodeURIComponent(s)}`); }}
                            className="cursor-pointer"
                            style={{
                              background: "rgba(201,168,76,0.1)",
                              border: "1px solid rgba(201,168,76,0.25)",
                              color: "#C9A84C",
                              fontSize: 11,
                              padding: "3px 10px",
                              borderRadius: 20,
                            }}
                          >
                            {s}
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Message button */}
                    <div onClick={(e) => e.stopPropagation()}>
                      <MessageGuideButton
                        guideUserId={guide.user_id}
                        guideFirstName={fd.firstName || firstName}
                        guideLastName={fd.lastName || ""}
                        guideCity={city}
                      >
                        <button
                          className="w-full flex items-center justify-center gap-2 font-semibold transition-colors"
                          style={{
                            background: "#C9A84C",
                            color: "#0A1628",
                            padding: 14,
                            borderRadius: "0 0 12px 12px",
                            border: "none",
                            width: "100%",
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.background = "#B8924A")}
                          onMouseLeave={(e) => (e.currentTarget.style.background = "#C9A84C")}
                        >
                          <MessageCircle size={16} />
                          Message {firstName}
                        </button>
                      </MessageGuideButton>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* SECTION 4 — Recruitment banner */}
      <section
        style={{
          background: "rgba(201,168,76,0.06)",
          borderTop: "1px solid rgba(201,168,76,0.2)",
          padding: 48,
        }}
      >
        <div className="text-center">
          <h2 className="font-serif" style={{ fontSize: 28, color: "#F5F0E8" }}>
            Are you a local guide?
          </h2>
          <p style={{ fontSize: 16, color: "rgba(255,255,255,0.65)", marginTop: 12, maxWidth: 480 }} className="mx-auto">
            Join Guides Directly as a Founding Guide. Keep 100% of your earnings. Own your clients. Build your brand.
          </p>
          <button
            onClick={() => navigate("/guide-register")}
            className="mt-7 px-8 py-3 rounded-full font-semibold transition-colors"
            style={{ background: "#C9A84C", color: "#0A1628" }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "#B8924A")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "#C9A84C")}
          >
            Apply as a Founding Guide →
          </button>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default GuidesPage;
