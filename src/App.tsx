import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { useEffect } from "react";
import Index from "./pages/Index";
import Home from "./pages/Home";
import Tours from "./pages/Tours";
import TourDetail from "./pages/TourDetail";
import BookingCheckout from "./pages/BookingCheckout";
import AiPlannerPage from "./pages/AiPlannerPage";
import Review from "./pages/Review";
import Admin from "./pages/Admin";
import Testimonials from "./pages/Testimonials";
import GuideRegister from "./pages/GuideRegister";
import ApplyCityPilot from "./pages/ApplyCityPilot";
import GuideProfilePage from "./pages/GuideProfilePage";
import ExploreCities from "./pages/ExploreCities";
import ResetPassword from "./pages/ResetPassword";
import ForgotPassword from "./pages/ForgotPassword";
import GuideDashboard from "./pages/GuideDashboard";
import NotFound from "./pages/NotFound";
import TrustPage from "./pages/TrustPage";
import SavedGuides from "./pages/SavedGuides";
import Install from "./pages/Install";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import Support from "./pages/Support";
import Login from "./pages/Login";

const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <ScrollToTop />
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/home" element={<Home />} />
          <Route path="/tours" element={<Tours />} />
          <Route path="/tour/:guideId" element={<TourDetail />} />
          <Route path="/book/:guideId" element={<BookingCheckout />} />
          <Route path="/chat" element={<AiPlannerPage />} />
          <Route path="/review" element={<Review />} />
          <Route path="/testimonials" element={<Testimonials />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/guide-register" element={<GuideRegister />} />
          <Route path="/guide-dashboard" element={<GuideDashboard />} />
          <Route path="/apply-city-pilot" element={<ApplyCityPilot />} />
          <Route path="/guide/:id" element={<GuideProfilePage />} />
          <Route path="/explore" element={<ExploreCities />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/trust" element={<TrustPage />} />
          <Route path="/saved-guides" element={<SavedGuides />} />
          <Route path="/install" element={<Install />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/support" element={<Support />} />
          <Route path="/login" element={<Login />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
