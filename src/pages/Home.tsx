import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import TrustSection from "@/components/TrustSection";
import HowItWorksSection from "@/components/HowItWorksSection";
import DestinationsSection from "@/components/DestinationsSection";
import MeetGuidesSection from "@/components/MeetGuidesSection";
import WhyDirectSection from "@/components/WhyDirectSection";
import TestimonialsSection from "@/components/TestimonialsSection";
import ForGuidesSection from "@/components/ForGuidesSection";
import AboutSection from "@/components/AboutSection";
import FAQSection from "@/components/FAQSection";
import FinalCtaSection from "@/components/FinalCtaSection";
import InquirySection from "@/components/InquirySection";
import Footer from "@/components/Footer";
import { Link } from "react-router-dom";
import { MessageCircle } from "lucide-react";

const Home = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Section 1 — Hero */}
      <HeroSection />

      {/* Section 2 — How It Works */}
      <HowItWorksSection />

      {/* Section 3 — Featured Destinations */}
      <DestinationsSection />

      {/* Section 4 — Featured Guides */}
      <MeetGuidesSection />

      {/* Section 5 — Why Direct Booking Is Better */}
      <WhyDirectSection />

      {/* Section 6 — Testimonials */}
      <TestimonialsSection />

      {/* Section 7 — For Guides CTA Banner */}
      <ForGuidesSection />

      {/* Section 8 — Trust / Transparency */}
      <TrustSection />

      {/* Section 9 — About */}
      <AboutSection />

      {/* Section 10 — FAQ */}
      <FAQSection />

      {/* Section 11 — Final CTA */}
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
