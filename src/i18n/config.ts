import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

import en from "./locales/en.json";
import ru from "./locales/ru.json";
import pl from "./locales/pl.json";
import de from "./locales/de.json";
import fr from "./locales/fr.json";
import es from "./locales/es.json";
import zh from "./locales/zh.json";
import ja from "./locales/ja.json";

export const languages = [
  { code: "en", name: "English", flag: "gb" },
  { code: "ru", name: "Русский", flag: "ru" },
  { code: "pl", name: "Polski", flag: "pl" },
  { code: "de", name: "Deutsch", flag: "de" },
  { code: "fr", name: "Français", flag: "fr" },
  { code: "es", name: "Español", flag: "es" },
  { code: "zh", name: "中文", flag: "cn" },
  { code: "ja", name: "日本語", flag: "jp" },
];

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      ru: { translation: ru },
      pl: { translation: pl },
      de: { translation: de },
      fr: { translation: fr },
      es: { translation: es },
      zh: { translation: zh },
      ja: { translation: ja },
    },
    fallbackLng: "en",
    interpolation: { escapeValue: false },
    detection: {
      order: ["navigator", "localStorage", "htmlTag"],
      caches: ["localStorage"],
    },
  });

export default i18n;
