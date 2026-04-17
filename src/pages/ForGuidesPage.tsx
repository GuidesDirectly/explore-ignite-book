import { useNavigate } from "react-router-dom";
import {
  Search,
  DollarSign,
  MessageCircle,
  Sparkles,
  Video,
  Star,
  Share2,
  Globe,
  Check,
  ArrowRight,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

import dcImg from "@/assets/hero-dc.jpg";
import chicagoImg from "@/assets/city-cards/chicago.jpg";

const featureIcons = [Search, DollarSign, MessageCircle, Sparkles, Video, Star, Share2, Globe];

const founders = [
  {
    img: dcImg,
    initials: "MZ",
    name: "Michael Zlotnitsky",
    title: "Founder & President, iGuide Tours",
    city: "Washington DC",
    langs: ["EN", "RU", "HE"],
    bio: "Licensed DC Tour Guide & Architectural Historian. 35 years of stories. One unforgettable city.",
    slug: "/guide/michael-zlotnitsky-washington-dc",
  },
  {
    img: chicagoImg,
    initials: "MM",
    name: "Mike McMains",
    title: "President, CTPA Chicago",
    city: "Chicago",
    langs: ["EN"],
    bio: "Chicago's leading guide and President of the Chicago Tour-Guide Professionals Association. Top 10% on TripAdvisor worldwide.",
    slug: "/guide/mike-mcmains-chicago",
  },
];

/* ─── component ─── */

const ForGuidesPage = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  const features = featureIcons.map((icon, i) => ({
    icon,
    title: t(`forGuides.feature${i + 1}Title`),
    desc: t(`forGuides.feature${i + 1}Desc`),
  }));

  const foundingFeatures = [
    t("forGuides.founding1"),
    t("forGuides.founding2"),
    t("forGuides.founding3"),
    t("forGuides.founding4"),
    t("forGuides.founding5"),
    t("forGuides.founding6"),
  ];

  const proFeatures = [
    t("forGuides.pro1"),
    t("forGuides.pro2"),
    t("forGuides.pro3"),
    t("forGuides.pro4"),
    t("forGuides.pro5"),
    t("forGuides.pro6"),
  ];

  const featuredFeatures = [
    t("forGuides.featured1"),
    t("forGuides.featured2"),
    t("forGuides.featured3"),
    t("forGuides.featured4"),
    t("forGuides.featured5"),
  ];

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: "#0A1628" }}>
      <Navbar />

      {/* ── Section 1 — Hero ── */}
      <section className="pt-32 pb-20 px-4" style={{ background: "linear-gradient(135deg, #0A1628 0%, #122040 50%, #0A1628 100%)" }}>
        <div className="max-w-3xl mx-auto text-center">
          <p className="font-bold uppercase tracking-[0.12em] text-[11px] mb-6" style={{ color: "#C9A84C" }}>
            {t("forGuides.heroEyebrow")}
          </p>
          <h1 className="font-serif font-bold text-[32px] md:text-[52px] leading-[1.15] mb-6 text-white">
            {t("forGuides.heroHeadline")}
          </h1>
          <p className="text-[17px] md:text-[19px] leading-relaxed mb-10 mx-auto max-w-[600px]" style={{ color: "rgba(255,255,255,0.7)" }}>
            {t("forGuides.heroSubheading")}
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => navigate("/guide-register")}
              className="font-semibold rounded-lg text-[16px] px-8 py-3.5 transition-colors inline-flex items-center gap-2"
              style={{ backgroundColor: "#C9A84C", color: "#0A1628" }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#B8924A")}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#C9A84C")}
            >
              {t("forGuides.heroCta1")}
              <ArrowRight size={18} />
            </button>
            <button
              onClick={() => scrollTo("how-it-works")}
              className="font-semibold rounded-lg text-[16px] px-8 py-3.5 transition-colors border"
              style={{ borderColor: "rgba(255,255,255,0.3)", color: "rgba(255,255,255,0.85)" }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.08)")}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
            >
              {t("forGuides.heroCta2")}
            </button>
          </div>
        </div>
      </section>

      {/* ── Section 2 — Commission Problem ── */}
      <section className="w-full py-[72px]" style={{ backgroundColor: "#F0E6C8" }}>
        <div className="mx-auto px-4 text-center" style={{ maxWidth: 720 }}>
          <h2 className="font-serif font-bold mb-6 text-[28px] md:text-[40px]" style={{ color: "#0A1628", lineHeight: 1.3 }}>
            {t("forGuides.commissionHeadline")}
          </h2>
          <p className="mx-auto mb-10" style={{ fontSize: 18, color: "rgba(10,22,40,0.7)", lineHeight: 1.8, maxWidth: 560 }}>
            {t("forGuides.commissionBody")}
          </p>
          <div className="flex justify-center gap-4 flex-wrap">
            <div className="rounded-xl px-8 py-5" style={{ background: "rgba(192,57,43,0.08)", border: "1px solid rgba(192,57,43,0.25)" }}>
              <span className="block font-serif font-bold text-[36px] md:text-[48px] mb-1" style={{ color: "#C0392B" }}>{t("forGuides.commissionOtherStat")}</span>
              <span style={{ color: "rgba(10,22,40,0.6)", fontSize: 14 }}>{t("forGuides.commissionOtherLabel")}</span>
            </div>
            <div className="rounded-xl px-8 py-5" style={{ background: "rgba(45,106,79,0.08)", border: "1px solid rgba(45,106,79,0.3)" }}>
              <span className="block font-serif font-bold text-[36px] md:text-[48px] mb-1" style={{ color: "#2D6A4F" }}>{t("forGuides.commissionOurStat")}</span>
              <span style={{ color: "rgba(10,22,40,0.6)", fontSize: 14 }}>{t("forGuides.commissionOurLabel")}</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── Section 3 — What You Get ── */}
      <section id="how-it-works" className="py-20 px-4" style={{ backgroundColor: "#0A1628" }}>
        <div className="max-w-5xl mx-auto">
          <h2 className="font-serif font-bold text-[28px] md:text-[40px] text-white text-center mb-4" style={{ lineHeight: 1.3 }}>
            {t("forGuides.featuresHeadline")}
          </h2>
          <p className="text-center mb-14 text-[16px]" style={{ color: "rgba(255,255,255,0.6)" }}>
            {t("forGuides.featuresSubheading")}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((f) => (
              <div
                key={f.title}
                className="rounded-xl p-6 transition-colors"
                style={{ backgroundColor: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
              >
                <f.icon size={28} style={{ color: "#C9A84C" }} className="mb-4" />
                <h3 className="font-semibold text-white text-[16px] mb-2">{f.title}</h3>
                <p className="text-[14px] leading-relaxed" style={{ color: "rgba(255,255,255,0.6)" }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Section 4 — Pricing ── */}
      <section className="py-20 px-4" style={{ backgroundColor: "#122040" }}>
        <div className="max-w-5xl mx-auto">
          <h2 className="font-serif font-bold text-[28px] md:text-[40px] text-white text-center mb-4" style={{ lineHeight: 1.3 }}>
            {t("forGuides.pricingHeadline")}
          </h2>
          <p className="text-center mb-14 text-[16px]" style={{ color: "rgba(255,255,255,0.6)" }}>
            {t("forGuides.pricingSubheading")}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Founding Guide */}
            <div className="rounded-xl p-8 flex flex-col" style={{ backgroundColor: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)" }}>
              <span className="inline-block self-start text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full mb-4" style={{ backgroundColor: "rgba(45,106,79,0.15)", color: "#2D6A4F" }}>
                {t("forGuides.tier1Badge")}
              </span>
              <h3 className="text-white font-bold text-xl mb-1">{t("forGuides.tier1Name")}</h3>
              <div className="flex items-baseline gap-1 mb-1">
                <span className="text-white font-serif font-bold text-[40px]">$0</span>
                <span style={{ color: "rgba(255,255,255,0.5)", fontSize: 14 }}>{t("forGuides.perMonth")}</span>
              </div>
              <p className="text-[13px] mb-1" style={{ color: "rgba(255,255,255,0.5)" }}>{t("forGuides.tier1Sub")}</p>
              <p className="text-[13px] mb-6" style={{ color: "rgba(255,255,255,0.7)" }}>{t("forGuides.tier1SubLine2")}</p>
              <ul className="flex-1 space-y-3 mb-8">
                {foundingFeatures.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-[14px]" style={{ color: "rgba(255,255,255,0.8)" }}>
                    <Check size={16} className="mt-0.5 shrink-0" style={{ color: "#2D6A4F" }} />
                    {f}
                  </li>
                ))}
              </ul>
              <button
                onClick={() => navigate("/guide-register")}
                className="w-full font-semibold rounded-lg text-[15px] py-3 transition-colors"
                style={{ backgroundColor: "#C9A84C", color: "#0A1628" }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#B8924A")}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#C9A84C")}
              >
                {t("forGuides.tier1Cta")}
              </button>
              <p className="text-center text-[12px] mt-3" style={{ color: "rgba(255,255,255,0.45)" }}>
                {t("forGuides.tier1Note")}
              </p>
            </div>

            {/* Pro Guide */}
            <div className="rounded-xl p-8 flex flex-col" style={{ backgroundColor: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)" }}>
              <span className="inline-block self-start text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full mb-4" style={{ backgroundColor: "rgba(201,168,76,0.15)", color: "#C9A84C" }}>
                {t("forGuides.tier2Badge")}
              </span>
              <h3 className="text-white font-bold text-xl mb-1">{t("forGuides.tier2Name")}</h3>
              <div className="flex items-baseline gap-1 mb-1">
                <span className="text-white font-serif font-bold text-[40px]">$29</span>
                <span style={{ color: "rgba(255,255,255,0.5)", fontSize: 14 }}>{t("forGuides.perMonth")}</span>
              </div>
              <p className="text-[13px] mb-6" style={{ color: "rgba(255,255,255,0.5)" }}>{t("forGuides.tier2Sub")}</p>
              <ul className="flex-1 space-y-3 mb-8">
                {proFeatures.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-[14px]" style={{ color: "rgba(255,255,255,0.8)" }}>
                    <Check size={16} className="mt-0.5 shrink-0" style={{ color: "#C9A84C" }} />
                    {f}
                  </li>
                ))}
              </ul>
              <button
                onClick={() => navigate("/guide-register")}
                className="w-full font-semibold rounded-lg text-[15px] py-3 transition-colors border"
                style={{ borderColor: "#C9A84C", color: "#C9A84C", backgroundColor: "transparent" }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "rgba(201,168,76,0.12)")}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
              >
                {t("forGuides.tier2Cta")}
              </button>
              <p className="text-center text-[12px] mt-3" style={{ color: "rgba(255,255,255,0.45)" }}>
                {t("forGuides.tier2Note")}
              </p>
            </div>

            {/* Featured Guide */}
            <div className="rounded-xl p-8 flex flex-col" style={{ backgroundColor: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)" }}>
              <span className="inline-block self-start text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full mb-4" style={{ backgroundColor: "rgba(201,168,76,0.15)", color: "#C9A84C" }}>
                {t("forGuides.tier3Badge")}
              </span>
              <h3 className="text-white font-bold text-xl mb-1">{t("forGuides.tier3Name")}</h3>
              <div className="flex items-baseline gap-1 mb-1">
                <span className="text-white font-serif font-bold text-[40px]">$59</span>
                <span style={{ color: "rgba(255,255,255,0.5)", fontSize: 14 }}>{t("forGuides.perMonth")}</span>
              </div>
              <p className="text-[13px] mb-6" style={{ color: "rgba(255,255,255,0.5)" }}>{t("forGuides.tier3Sub")}</p>
              <ul className="flex-1 space-y-3 mb-8">
                {featuredFeatures.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-[14px]" style={{ color: "rgba(255,255,255,0.8)" }}>
                    <Check size={16} className="mt-0.5 shrink-0" style={{ color: "#C9A84C" }} />
                    {f}
                  </li>
                ))}
              </ul>
              <button
                onClick={() => navigate("/guide-register")}
                className="w-full font-semibold rounded-lg text-[15px] py-3 transition-colors border"
                style={{ borderColor: "#C9A84C", color: "#C9A84C", backgroundColor: "transparent" }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "rgba(201,168,76,0.12)")}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
              >
                {t("forGuides.tier3Cta")}
              </button>
            </div>
          </div>

          <p className="text-center mt-10 text-[14px]" style={{ color: "rgba(255,255,255,0.5)" }}>
            {t("forGuides.pricingDisclaimer")}
          </p>

          {/* Spotlight Add-on box */}
          <div
            className="mt-12 rounded-xl p-8"
            style={{
              background: "linear-gradient(135deg, rgba(201,168,76,0.10) 0%, rgba(201,168,76,0.04) 100%)",
              border: "1.5px solid rgba(201,168,76,0.5)",
              boxShadow: "0 8px 32px rgba(201,168,76,0.12)",
            }}
          >
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Star size={20} style={{ color: "#C9A84C", fill: "#C9A84C" }} />
                  <h3 className="font-serif font-bold text-[20px] md:text-[24px]" style={{ color: "#C9A84C" }}>
                    {t("forGuides.spotlightTitle")}
                  </h3>
                </div>
                <p className="text-[13px] mb-5" style={{ color: "rgba(255,255,255,0.6)" }}>
                  {t("forGuides.spotlightAvailability")}
                </p>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-5">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <li
                      key={n}
                      className="flex items-start gap-2 text-[14px]"
                      style={{ color: "rgba(255,255,255,0.85)" }}
                    >
                      <Check size={16} className="mt-0.5 shrink-0" style={{ color: "#C9A84C" }} />
                      {t(`forGuides.spotlightFeat${n}`)}
                    </li>
                  ))}
                </ul>
                <p className="text-[13px] italic" style={{ color: "rgba(255,255,255,0.55)" }}>
                  {t("forGuides.spotlightNote")}
                </p>
              </div>
              <div className="flex flex-col items-stretch md:items-end gap-2 md:min-w-[180px]">
                <a
                  href="mailto:allharmony@gmail.com?subject=Spotlight%20Guide%20Enrollment&body=I'd%20like%20to%20add%20Spotlight%20to%20my%20guide%20profile."
                  className="font-semibold rounded-lg text-[15px] px-6 py-3 text-center transition-colors inline-flex items-center justify-center gap-2"
                  style={{ backgroundColor: "#C9A84C", color: "#0A1628" }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#B8924A")}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#C9A84C")}
                >
                  <Star size={16} style={{ fill: "#0A1628" }} />
                  {t("forGuides.spotlightCta")}
                </a>
                <p className="text-[11px] text-center md:text-right" style={{ color: "rgba(255,255,255,0.45)" }}>
                  $49/mo · Manual enrollment
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Section 5 — Founding Guides ── */}
      <section className="py-20 px-4" style={{ backgroundColor: "#0A1628" }}>
        <div className="max-w-4xl mx-auto">
          <h2 className="font-serif font-bold text-[28px] md:text-[40px] text-white text-center mb-14" style={{ lineHeight: 1.3 }}>
            {t("forGuides.foundingHeadline")}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {founders.map((g) => (
              <div key={g.name} className="rounded-xl overflow-hidden" style={{ backgroundColor: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)" }}>
                <div className="h-44 bg-cover bg-center relative" style={{ backgroundImage: `url(${g.img})` }}>
                  <div className="absolute inset-0" style={{ background: "linear-gradient(to top, #0A1628 0%, transparent 60%)" }} />
                </div>
                <div className="px-6 pb-6 -mt-8 relative">
                  <div className="w-16 h-16 rounded-full flex items-center justify-center font-serif font-bold text-xl mb-3" style={{ backgroundColor: "#0A1628", border: "2px solid #C9A84C", color: "#C9A84C" }}>
                    {g.initials}
                  </div>
                  <h3 className="text-white font-bold text-lg">{g.name}</h3>
                  <p className="text-[13px] mb-1" style={{ color: "#C9A84C" }}>{g.title}</p>
                  <p className="text-[13px] mb-3" style={{ color: "rgba(255,255,255,0.5)" }}>{g.city}</p>
                  <div className="flex gap-2 mb-4">
                    {g.langs.map((l) => (
                      <span key={l} className="text-[11px] font-semibold px-2 py-0.5 rounded" style={{ backgroundColor: "rgba(201,168,76,0.12)", color: "#C9A84C" }}>
                        {l}
                      </span>
                    ))}
                  </div>
                  <p className="text-[14px] leading-relaxed mb-5" style={{ color: "rgba(255,255,255,0.65)" }}>{g.bio}</p>
                  <button
                    onClick={() => navigate(g.slug)}
                    className="text-[14px] font-semibold inline-flex items-center gap-1.5 transition-colors"
                    style={{ color: "#C9A84C" }}
                  >
                    {t("forGuides.viewProfile", { name: g.name.split(" ")[0] })} <ArrowRight size={15} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Section 6 — Final CTA ── */}
      <section className="w-full py-[72px]" style={{ backgroundColor: "#F0E6C8" }}>
        <div className="mx-auto px-4 text-center" style={{ maxWidth: 600 }}>
          <h2 className="font-serif font-bold text-[28px] md:text-[40px] mb-6" style={{ color: "#0A1628", lineHeight: 1.3 }}>
            {t("forGuides.finalHeadline")}
          </h2>
          <p className="mb-10 text-[18px]" style={{ color: "rgba(10,22,40,0.7)", lineHeight: 1.8 }}>
            {t("forGuides.finalSubheading")}
          </p>
          <button
            onClick={() => navigate("/guide-register")}
            className="inline-block font-semibold rounded-lg text-[16px] px-8 py-3.5 transition-colors"
            style={{ backgroundColor: "#C9A84C", color: "#0A1628" }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#B8924A")}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#C9A84C")}
          >
            {t("forGuides.finalCta")}
          </button>
          <p className="mt-4 text-[13px]" style={{ color: "rgba(10,22,40,0.5)" }}>
            {t("forGuides.finalNote")}
          </p>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default ForGuidesPage;
