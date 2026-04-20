import { Link, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Home, Compass } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import NotFoundMeta from "@/components/seo/NotFoundMeta";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "#0A1628" }}>
      <NotFoundMeta title="Page Not Found | Guides Directly" />
      <Navbar />
      <main className="flex-1 flex items-center justify-center px-4 pt-24 pb-16">
        <div className="text-center max-w-xl">
          <p className="font-display text-7xl font-bold mb-4" style={{ color: "#C9A84C" }}>
            404
          </p>
          <h1 className="font-display text-3xl md:text-4xl font-bold mb-4" style={{ color: "#F5F0E8" }}>
            Page Not Found
          </h1>
          <p className="text-base md:text-lg mb-8" style={{ color: "rgba(245,240,232,0.7)" }}>
            The page you're looking for doesn't exist or has been moved. Let's get you back on track.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button asChild size="lg" className="bg-[#C9A84C] text-[#0A1628] hover:bg-[#C9A84C]/90 font-semibold">
              <Link to="/">
                <Home className="w-4 h-4 mr-2" />
                Back to Home
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-white/20 text-white hover:bg-white/10">
              <Link to="/guides">
                <Compass className="w-4 h-4 mr-2" />
                Browse Guides
              </Link>
            </Button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default NotFound;
