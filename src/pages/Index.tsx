import { useNavigate } from "react-router-dom";
import LanguageSelectScreen from "@/components/LanguageSelectScreen";
import { useEffect } from "react";

const Index = () => {
  const navigate = useNavigate();

  useEffect(() => {
    if (localStorage.getItem("languageSelected") === "true") {
      navigate("/home", { replace: true });
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
