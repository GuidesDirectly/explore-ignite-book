import Navbar from "@/components/Navbar";
import TestimonialsSection from "@/components/TestimonialsSection";
import Footer from "@/components/Footer";
import { Link } from "react-router-dom";
import { MessageCircle } from "lucide-react";

const Testimonials = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-20">
        <TestimonialsSection showAll />
      </div>
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

export default Testimonials;
