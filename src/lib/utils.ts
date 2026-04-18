import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function generateGuideSlug(firstName: string, lastName: string, city: string): string {
  return [firstName, lastName, city]
    .join("-")
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export function isUUID(str: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);
}

const ACRONYMS = new Set(["DC", "USA", "US", "UK", "UAE", "NYC", "LA", "SF", "DR"]);

/**
 * Convert any-case string to Title Case, preserving common acronyms.
 * "LOS ANGELES" -> "Los Angeles"
 * "WASHINGTON DC" -> "Washington DC"
 * "new york nyc" -> "New York NYC"
 */
export function toTitleCase(str: string | null | undefined): string {
  if (!str) return "";
  return String(str)
    .toLowerCase()
    .split(/(\s+|-|\/|,)/)
    .map((part) => {
      if (/^\s+$/.test(part) || part === "-" || part === "/" || part === ",") return part;
      const upper = part.toUpperCase();
      if (ACRONYMS.has(upper)) return upper;
      if (!part) return part;
      return part.charAt(0).toUpperCase() + part.slice(1);
    })
    .join("");
}
