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
import he from "./locales/he.json";
import ar from "./locales/ar.json";
import pt from "./locales/pt.json";
import ko from "./locales/ko.json";
import it from "./locales/it.json";
import hi from "./locales/hi.json";
import vi from "./locales/vi.json";
import id from "./locales/id.json";
import nl from "./locales/nl.json";
import th from "./locales/th.json";
import tr from "./locales/tr.json";
import sv from "./locales/sv.json";
import uk from "./locales/uk.json";

export const languages = [
  { code: "en", name: "English", flag: "us" },
  { code: "ru", name: "Русский", flag: "ru" },
  { code: "pl", name: "Polski", flag: "pl" },
  { code: "de", name: "Deutsch", flag: "de" },
  { code: "fr", name: "Français", flag: "fr" },
  { code: "es", name: "Español", flag: "es" },
  { code: "zh", name: "中文", flag: "cn" },
  { code: "ja", name: "日本語", flag: "jp" },
  { code: "he", name: "עברית", flag: "il" },
  { code: "ar", name: "العربية", flag: "eg" },
  { code: "pt", name: "Português", flag: "br" },
  { code: "ko", name: "한국어", flag: "kr" },
  { code: "it", name: "Italiano", flag: "it" },
  { code: "hi", name: "हिन्दी", flag: "in" },
  { code: "vi", name: "Tiếng Việt", flag: "vn" },
  { code: "id", name: "Bahasa Indonesia", flag: "id" },
  { code: "nl", name: "Nederlands", flag: "nl" },
  { code: "th", name: "ไทย", flag: "th" },
  { code: "tr", name: "Türkçe", flag: "tr" },
  { code: "sv", name: "Svenska", flag: "se" },
  { code: "uk", name: "Українська", flag: "ua" },
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
      he: { translation: he },
      ar: { translation: ar },
      pt: { translation: pt },
      ko: { translation: ko },
      it: { translation: it },
      hi: { translation: hi },
      vi: { translation: vi },
      id: { translation: id },
      nl: { translation: nl },
      th: { translation: th },
      tr: { translation: tr },
      sv: { translation: sv },
      uk: { translation: uk },
    },
    fallbackLng: "en",
    interpolation: { escapeValue: false },
    detection: {
      order: ["navigator", "localStorage", "htmlTag"],
      caches: ["localStorage"],
    },
  });

export default i18n;
