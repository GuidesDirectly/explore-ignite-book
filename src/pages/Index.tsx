import { useNavigate, useLocation } from "react-router-dom";
import { useEffect } from "react";
import LanguageSelectScreen from "@/components/LanguageSelectScreen";

const Index = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // If the URL has a recovery hash (from password reset email), redirect immediately
  useEffect(() => {
    const hash = window.location.hash;
    if (hash && hash.includes("type=recovery")) {
      navigate(`/reset-password${hash}`, { replace: true });
    }
  }, [navigate]);

  return (
    <LanguageSelectScreen
      onLanguageSelected={() => {
        navigate("/home", { replace: true });
      }}
    />
  );
};

export default Index;
