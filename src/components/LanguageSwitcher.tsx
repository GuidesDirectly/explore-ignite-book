import { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { languages } from "@/i18n/config";
import { Globe } from "lucide-react";

const LanguageSwitcher = () => {
  const { i18n } = useTranslation();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const currentLang = languages.find((l) => l.code === i18n.language) || languages[0];

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 text-sm text-primary-foreground/70 hover:text-primary transition-colors"
      >
        <img
          src={`https://flagcdn.com/w40/${currentLang.flag}.png`}
          alt={currentLang.name}
          className="w-5 h-3.5 rounded-sm object-cover"
        />
        <Globe className="w-4 h-4" />
      </button>

      {open && (
        <div className="absolute top-full right-0 mt-2 bg-secondary border border-primary/20 rounded-lg shadow-xl py-2 min-w-[160px] z-50">
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => {
                i18n.changeLanguage(lang.code);
                setOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-4 py-2 text-sm hover:bg-primary/10 transition-colors ${
                i18n.language === lang.code
                  ? "text-primary font-semibold"
                  : "text-primary-foreground/70"
              }`}
            >
              <img
                src={`https://flagcdn.com/w40/${lang.flag}.png`}
                alt={lang.name}
                className="w-5 h-3.5 rounded-sm object-cover"
              />
              {lang.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default LanguageSwitcher;
