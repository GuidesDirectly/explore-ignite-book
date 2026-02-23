import { useEffect } from "react";
import { useLocation, Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import LaunchStripSection from "@/components/LaunchStripSection";
import WhatIsPlatformSection from "@/components/WhatIsPlatformSection";
import HowItWorksSection from "@/components/HowItWorksSection";
import DestinationsSection from "@/components/DestinationsSection";
import MeetGuidesSection from "@/components/MeetGuidesSection";
import WhyDirectSection from "@/components/WhyDirectSection";
import TestimonialsSection from "@/components/TestimonialsSection";
import ForGuidesSection from "@/components/ForGuidesSection";
import TrustSection from "@/components/TrustSection";
import MonetizationSection from "@/components/MonetizationSection";
import AboutSection from "@/components/AboutSection";
import FAQSection from "@/components/FAQSection";
import FinalCtaSection from "@/components/FinalCtaSection";
import InquirySection from "@/components/InquirySection";
import Footer from "@/components/Footer";
import { MessageCircle } from "lucide-react";

const Home = () => {
  const location = useLocation();

  useEffect(() => {
    if (location.hash) {
      const scrollToHash = () => {
        // Strip query params from hash for querySelector (e.g., #guides?cities=X → #guides)
        const hashId = location.hash.split("?")[0];
        const el = document.querySelector(hashId);
        if (el) {
          el.scrollIntoView({ behavior: "smooth" });
          return true;
        }
        return false;
      };
      // Try multiple times as sections may load async
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

      {/* Section 2 — Launch Strip */}
      <LaunchStripSection />

      {/* Section 3 — What Is This Platform */}
      <WhatIsPlatformSection />

      {/* Section 4 — How It Works */}
      <HowItWorksSection />

      {/* Section 5 — Featured Destinations */}
      <DestinationsSection />

      {/* Section 6 — Featured Guides */}
      <MeetGuidesSection />

      {/* Section 7 — Why Direct Booking Is Better */}
      <WhyDirectSection />

      {/* Section 8 — Testimonials */}
      <TestimonialsSection />

      {/* Section 9 — For Guides CTA Banner */}
      <ForGuidesSection />

      {/* Section 10 — Trust / Transparency */}
      <TrustSection />

      {/* Section 11 — How We Make Money (Monetization Infographic) */}
      <MonetizationSection />

      {/* Section 12 — About */}
      <AboutSection />

      {/* Section 13 — FAQ */}
      <FAQSection />

      {/* Section 14 — Final CTA */}
      <FinalCtaSection />

      {/* Contact/Inquiry */}
      <InquirySection />

      <Footer />

      <Link
        to="/chat"
        className="fixed bottom-6 right-6 z-50 bg-primary text-secondary w-14 h-14 rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform duration-200"
        aria-label="Chat with AI assistant"
      >
        <MessageCircle className="w-6 h-6" />
      </Link>
    </div>
  );
};

export default Home;
