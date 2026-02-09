import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import AboutSection from "@/components/AboutSection";
import ServicesSection from "@/components/ServicesSection";
import DestinationsSection from "@/components/DestinationsSection";
import GallerySection from "@/components/GallerySection";
import TestimonialsSection from "@/components/TestimonialsSection";
import InquirySection from "@/components/InquirySection";
import Footer from "@/components/Footer";
import { Link } from "react-router-dom";
import { MessageCircle } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <HeroSection />
      <AboutSection />
      <ServicesSection />
      <DestinationsSection />
      <GallerySection />
      <TestimonialsSection />
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

export default Index;
