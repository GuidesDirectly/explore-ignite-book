import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import LanguageSelectScreen from "@/components/LanguageSelectScreen";
import SEO from "@/components/seo/SEO";

const Index = () => {
  const navigate = useNavigate();

  // If the URL has a recovery hash (from password reset email), redirect immediately
  useEffect(() => {
    const hash = window.location.hash;
    if (hash && hash.includes("type=recovery")) {
      navigate(`/reset-password${hash}`, { replace: true });
    }
  }, [navigate]);

  return (
    <>
      <SEO
        title="GuidesDirectly — Book Private Tour Guides Directly | Zero Commission"
        description="Connect directly with licensed local tour guides. No booking fees, no commission markup, no middlemen. Washington DC, Chicago, Los Angeles and more. Keep 100% of what you pay with your guide."
        keywords="private tour guide, local tour guide, book tour guide directly, no commission tours, Washington DC tour guide, Chicago tour guide"
        canonical="https://iguidetours.net"
      />
      <LanguageSelectScreen
        onLanguageSelected={() => {
          navigate("/home", { replace: true });
        }}
      />
    </>
  );
};

export default Index;
