import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AiTourPlanner from "@/components/AiTourPlanner";

const AiPlannerPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <AiTourPlanner />
      <Footer />
    </div>
  );
};

export default AiPlannerPage;
