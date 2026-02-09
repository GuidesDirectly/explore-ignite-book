import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import ServicesSection from "@/components/ServicesSection";
import DestinationsSection from "@/components/DestinationsSection";
import GallerySection from "@/components/GallerySection";
import TestimonialsSection from "@/components/TestimonialsSection";
import InquirySection from "@/components/InquirySection";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <HeroSection />
      <ServicesSection />
      <DestinationsSection />
      <GallerySection />
      <TestimonialsSection />
      <InquirySection />
      <Footer />
    </div>
  );
};

export default Index;
