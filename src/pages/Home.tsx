import { useEffect } from "react";
import { useLocation, Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import TrustBarSection from "@/components/TrustBarSection";
import TruePriceSection from "@/components/TruePriceSection";
import HowItWorksSection from "@/components/HowItWorksSection";
import DestinationsSection from "@/components/DestinationsSection";
import WhyDirectSection from "@/components/WhyDirectSection";
import TestimonialsSection from "@/components/TestimonialsSection";
import ForGuidesSection from "@/components/ForGuidesSection";
import TravelerAiCta from "@/components/TravelerAiCta";
import TrustSection from "@/components/TrustSection";
import FinalCtaSection from "@/components/FinalCtaSection";
import InquirySection from "@/components/InquirySection";
import Footer from "@/components/Footer";
import { Sparkles } from "lucide-react";

const Home = () => {
  const location = useLocation();

  useEffect(() => {
    if (location.hash) {
      const scrollToHash = () => {
        const hashId = location.hash.split("?")[0];
        const el = document.querySelector(hashId);
        if (el) {
          el.scrollIntoView({ behavior: "smooth" });
          return true;
        }
        return false;
      };
      const attempts = [100, 500, 1000, 2000];
      attempts.forEach((delay) => {
        setTimeout(() => scrollToHash(), delay);
      });
    }
  }, [location.hash]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Section 1 — Hero */}
      <HeroSection />

      {/* Trust Bar */}
      <TrustBarSection />

      {/* Section 4 — How It Works */}
      <HowItWorksSection />

      {/* Section 5 — Featured Destinations */}
      <DestinationsSection />

      {/* Section 7 — Why Direct Booking Is Better */}
      <WhyDirectSection />

      {/* Traveler AI CTA */}
      <TravelerAiCta />

      {/* Section 8 — Testimonials */}
      <TestimonialsSection />

      {/* Section 9 — For Guides CTA Banner */}
      <ForGuidesSection />

      {/* Section 10 — Trust / Transparency */}
      <TrustSection />

      {/* Section 14 — Final CTA */}
      <FinalCtaSection />

      {/* Contact/Inquiry */}
      <InquirySection />

      <Footer />

      <Link
        to="/chat"
        className="fixed bottom-6 right-6 z-50 bg-[#C9A84C] w-auto px-3 py-2 rounded-2xl flex items-center gap-1.5 shadow-lg hover:scale-110 transition-transform duration-200"
        aria-label="Chat with AI assistant"
        title="Chat with our AI Trip Architect"
      >
        <Sparkles className="w-5 h-5 text-[#0A1628]" />
        <span className="text-[11px] font-semibold text-[#0A1628]">AI Planner</span>
      </Link>
    </div>
  );
};

export default Home;
