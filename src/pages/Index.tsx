import { useNavigate } from "react-router-dom";
import LanguageSelectScreen from "@/components/LanguageSelectScreen";

const Index = () => {
  const navigate = useNavigate();

  return (
    <LanguageSelectScreen
      onLanguageSelected={() => {
        navigate("/home", { replace: true });
      }}
    />
  );
};

export default Index;
