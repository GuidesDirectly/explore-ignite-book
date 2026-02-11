import { TFunction } from "i18next";

// Maps English DB values to i18n keys under the "options" namespace
const OPTION_KEY_MAP: Record<string, string> = {
  // Cities
  "Washington DC": "options.city_dc",
  "New York City": "options.city_nyc",
  "Niagara Falls": "options.city_niagara",
  "Toronto": "options.city_toronto",
  "Boston": "options.city_boston",
  "Chicago": "options.city_chicago",

  // Languages
  "English": "options.lang_english",
  "Spanish": "options.lang_spanish",
  "French": "options.lang_french",
  "German": "options.lang_german",
  "Mandarin": "options.lang_mandarin",
  "Japanese": "options.lang_japanese",
  "Russian": "options.lang_russian",
  "Polish": "options.lang_polish",
  "Portuguese": "options.lang_portuguese",
  "Arabic": "options.lang_arabic",
  "Korean": "options.lang_korean",
  "Italian": "options.lang_italian",
  "Hindi": "options.lang_hindi",

  // Specializations
  "History & Culture": "options.spec_history",
  "Food & Culinary": "options.spec_food",
  "Art & Museums": "options.spec_art",
  "Nature & Outdoors": "options.spec_nature",
  "Architecture": "options.spec_architecture",
  "Nightlife & Entertainment": "options.spec_nightlife",
  "Photography Tours": "options.spec_photography",
  "Family-Friendly": "options.spec_family",
  "Luxury & VIP": "options.spec_luxury",
  "Adventure & Sports": "options.spec_adventure",

  // Tour types
  "Private Tours": "options.tour_private",
  "Group Tours": "options.tour_group",
  "Walking Tours": "options.tour_walking",
  "Driving Tours": "options.tour_driving",
  "Multi-Day Tours": "options.tour_multiday",
};

/**
 * Translate a DB-stored English option value using i18n.
 * Falls back to the original value if no key is found.
 */
export const translateOption = (t: TFunction, value: string): string => {
  const key = OPTION_KEY_MAP[value];
  if (!key) return value;
  return t(key, value);
};

/**
 * Translate an array of DB-stored English values.
 */
export const translateOptions = (t: TFunction, values: string[]): string[] => {
  return values.map((v) => translateOption(t, v));
};
