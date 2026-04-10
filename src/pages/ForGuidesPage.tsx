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
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

import dcImg from "@/assets/hero-dc.jpg";
import chicagoImg from "@/assets/city-cards/chicago.jpg";

/* ─── static data ─── */

const features = [
  { icon: Search, title: "Your own Google page", desc: "Your profile ranks on Google for your name and city. Travelers searching for you find YOU — not a platform." },
  { icon: DollarSign, title: "Zero commission forever", desc: "Keep 100% of every dollar your travelers pay you. Always." },
  { icon: MessageCircle, title: "Direct traveler contact", desc: "Travelers message you directly. No platform intermediary. Build real relationships." },
  { icon: Sparkles, title: "AI Content Co-Pilot", desc: "Write your bio, tour descriptions, and social posts in 21 languages instantly." },
  { icon: Video, title: "Showcase your tours", desc: "Upload videos, photos, and itineraries so travelers know exactly what to expect." },
  { icon: Star, title: "Verified reviews", desc: "Collect and display verified traveler reviews to build your reputation on Google." },
  { icon: Share2, title: "Built-in social sharing", desc: "Share your profile to Instagram, WhatsApp, and Facebook with one click." },
  { icon: Globe, title: "SEO-optimized profile", desc: "Your profile is indexed by Google with structured data so travelers find you for your specializations." },
];

const foundingFeatures = [
  "Google-indexed profile page",
  "Direct traveler messaging",
  "City and language search visibility",
  "Zero commission on all earnings",
  "Founding Guide badge on profile",
  "Free for life — never changes",
];

const proFeatures = [
  "Everything in Founding Guide",
  "AI Content Co-Pilot (21 languages)",
  "Priority placement in search results",
  "Video embed on your profile",
  "Analytics — see who views your profile",
  "Dedicated support",
];

const featuredFeatures = [
  "Everything in Pro",
  "Featured on homepage",
  "Hotel and concierge referrals",
  "Verified badge upgrade",
  "Priority support",
];

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

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: "#0A1628" }}>
      <Navbar />

      {/* ── Section 1 — Hero ── */}
      <section className="pt-32 pb-20 px-4" style={{ background: "linear-gradient(135deg, #0A1628 0%, #122040 50%, #0A1628 100%)" }}>
        <div className="max-w-3xl mx-auto text-center">
          <p className="font-bold uppercase tracking-[0.12em] text-[11px] mb-6" style={{ color: "#C9A84C" }}>
            FOR PROFESSIONAL TOUR GUIDES
          </p>
          <h1 className="font-serif font-bold text-[32px] md:text-[52px] leading-[1.15] mb-6 text-white">
            Own your clients. Keep every dollar.
          </h1>
          <p className="text-[17px] md:text-[19px] leading-relaxed mb-10 mx-auto max-w-[600px]" style={{ color: "rgba(255,255,255,0.7)" }}>
            Guides Directly is the only platform where you keep 100% of what you earn — forever. No commission. No middlemen. Just you and your travelers.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => navigate("/guide-register")}
              className="font-semibold rounded-lg text-[16px] px-8 py-3.5 transition-colors inline-flex items-center gap-2"
              style={{ backgroundColor: "#C9A84C", color: "#0A1628" }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#B8924A")}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#C9A84C")}
            >
              Join as a Founding Guide — Free
              <ArrowRight size={18} />
            </button>
            <button
              onClick={() => scrollTo("how-it-works")}
              className="font-semibold rounded-lg text-[16px] px-8 py-3.5 transition-colors border"
              style={{ borderColor: "rgba(255,255,255,0.3)", color: "rgba(255,255,255,0.85)" }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.08)")}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
            >
              See how it works
            </button>
          </div>
        </div>
      </section>

      {/* ── Section 2 — Commission Problem ── */}
      <section className="w-full py-[72px]" style={{ backgroundColor: "#F0E6C8" }}>
        <div className="mx-auto px-4 text-center" style={{ maxWidth: 720 }}>
          <h2 className="font-serif font-bold mb-6 text-[28px] md:text-[40px]" style={{ color: "#0A1628", lineHeight: 1.3 }}>
            Other platforms take 20–30% of every tour you lead.
          </h2>
          <p className="mx-auto mb-10" style={{ fontSize: 18, color: "rgba(10,22,40,0.7)", lineHeight: 1.8, maxWidth: 560 }}>
            On ToursByLocals, Viator, and GetYourGuide, for every $300 tour you lead, you keep $210. They keep $90.
            On Guides Directly, you keep $300. We keep $0.
          </p>
          <div className="flex justify-center gap-4 flex-wrap">
            <div className="rounded-xl px-8 py-5" style={{ background: "rgba(192,57,43,0.08)", border: "1px solid rgba(192,57,43,0.25)" }}>
              <span className="block font-serif font-bold text-[36px] md:text-[48px] mb-1" style={{ color: "#C0392B" }}>$90</span>
              <span style={{ color: "rgba(10,22,40,0.6)", fontSize: 14 }}>lost per $300 tour on other platforms</span>
            </div>
            <div className="rounded-xl px-8 py-5" style={{ background: "rgba(45,106,79,0.08)", border: "1px solid rgba(45,106,79,0.3)" }}>
              <span className="block font-serif font-bold text-[36px] md:text-[48px] mb-1" style={{ color: "#2D6A4F" }}>$0</span>
              <span style={{ color: "rgba(10,22,40,0.6)", fontSize: 14 }}>taken by Guides Directly</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── Section 3 — What You Get ── */}
      <section id="how-it-works" className="py-20 px-4" style={{ backgroundColor: "#0A1628" }}>
        <div className="max-w-5xl mx-auto">
          <h2 className="font-serif font-bold text-[28px] md:text-[40px] text-white text-center mb-4" style={{ lineHeight: 1.3 }}>
            Everything you need to run your guide business
          </h2>
          <p className="text-center mb-14 text-[16px]" style={{ color: "rgba(255,255,255,0.6)" }}>
            Tools built by guides, for guides.
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
            Simple, transparent pricing
          </h2>
          <p className="text-center mb-14 text-[16px]" style={{ color: "rgba(255,255,255,0.6)" }}>
            Start free. Upgrade when you're ready. No surprises.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Founding Guide */}
            <div className="rounded-xl p-8 flex flex-col" style={{ backgroundColor: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)" }}>
              <span className="inline-block self-start text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full mb-4" style={{ backgroundColor: "rgba(45,106,79,0.15)", color: "#2D6A4F" }}>
                FREE FOREVER
              </span>
              <h3 className="text-white font-bold text-xl mb-1">Founding Guide</h3>
              <div className="flex items-baseline gap-1 mb-1">
                <span className="text-white font-serif font-bold text-[40px]">$0</span>
                <span style={{ color: "rgba(255,255,255,0.5)", fontSize: 14 }}>/month</span>
              </div>
              <p className="text-[13px] mb-6" style={{ color: "rgba(255,255,255,0.5)" }}>For our first 50 guides</p>
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
                Claim Your Founding Spot
              </button>
              <p className="text-center text-[12px] mt-3" style={{ color: "rgba(255,255,255,0.45)" }}>
                Only founding spots remaining
              </p>
            </div>

            {/* Pro Guide */}
            <div className="rounded-xl p-8 flex flex-col" style={{ backgroundColor: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)" }}>
              <span className="inline-block self-start text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full mb-4" style={{ backgroundColor: "rgba(201,168,76,0.15)", color: "#C9A84C" }}>
                COMING SOON
              </span>
              <h3 className="text-white font-bold text-xl mb-1">Pro Guide</h3>
              <div className="flex items-baseline gap-1 mb-1">
                <span className="text-white font-serif font-bold text-[40px]">$29</span>
                <span style={{ color: "rgba(255,255,255,0.5)", fontSize: 14 }}>/month</span>
              </div>
              <p className="text-[13px] mb-6" style={{ color: "rgba(255,255,255,0.5)" }}>For growing guide businesses</p>
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
                Join Free Now
              </button>
              <p className="text-center text-[12px] mt-3" style={{ color: "rgba(255,255,255,0.45)" }}>
                Join as Founding Guide now — upgrade to Pro when ready
              </p>
            </div>

            {/* Featured Guide */}
            <div className="rounded-xl p-8 flex flex-col" style={{ backgroundColor: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)" }}>
              <span className="inline-block self-start text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full mb-4" style={{ backgroundColor: "rgba(201,168,76,0.15)", color: "#C9A84C" }}>
                COMING SOON
              </span>
              <h3 className="text-white font-bold text-xl mb-1">Featured Guide</h3>
              <div className="flex items-baseline gap-1 mb-1">
                <span className="text-white font-serif font-bold text-[40px]">$59</span>
                <span style={{ color: "rgba(255,255,255,0.5)", fontSize: 14 }}>/month</span>
              </div>
              <p className="text-[13px] mb-6" style={{ color: "rgba(255,255,255,0.5)" }}>Maximum visibility & support</p>
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
                Join Free Now
              </button>
            </div>
          </div>

          <p className="text-center mt-10 text-[14px]" style={{ color: "rgba(255,255,255,0.5)" }}>
            Founding Guide status is free forever for our first 50 guides. We will notify you before any pricing changes — with at least 60 days notice.
          </p>
        </div>
      </section>

      {/* ── Section 5 — Founding Guides ── */}
      <section className="py-20 px-4" style={{ backgroundColor: "#0A1628" }}>
        <div className="max-w-4xl mx-auto">
          <h2 className="font-serif font-bold text-[28px] md:text-[40px] text-white text-center mb-14" style={{ lineHeight: 1.3 }}>
            Meet our founding guides
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
                    View {g.name.split(" ")[0]}'s Profile <ArrowRight size={15} />
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
            Founding spots are limited.
          </h2>
          <p className="mb-10 text-[18px]" style={{ color: "rgba(10,22,40,0.7)", lineHeight: 1.8 }}>
            We are accepting our first 50 professional guides. Founding status is free forever and never expires.
          </p>
          <button
            onClick={() => navigate("/guide-register")}
            className="inline-block font-semibold rounded-lg text-[16px] px-8 py-3.5 transition-colors"
            style={{ backgroundColor: "#C9A84C", color: "#0A1628" }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#B8924A")}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#C9A84C")}
          >
            Apply as a Founding Guide
          </button>
          <p className="mt-4 text-[13px]" style={{ color: "rgba(10,22,40,0.5)" }}>
            Takes 5 minutes · No credit card · Free forever
          </p>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default ForGuidesPage;
