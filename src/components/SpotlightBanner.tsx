import { Star } from "lucide-react";

interface SpotlightBannerProps {
  size?: "sm" | "md";
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Gold "SPOTLIGHT" badge for guides on the Spotlight add-on plan.
 * Renders alongside FoundingGuideBadge on cards and profile headers.
 */
const SpotlightBanner = ({ size = "sm", className = "", style }: SpotlightBannerProps) => {
  const dims =
    size === "md"
      ? { fontSize: 12, padding: "5px 10px", iconSize: 13 }
      : { fontSize: 10, padding: "3px 8px", iconSize: 11 };

  return (
    <span
      className={`inline-flex items-center gap-1 font-bold uppercase rounded ${className}`}
      style={{
        background: "linear-gradient(135deg, #C9A84C 0%, #E5C870 50%, #C9A84C 100%)",
        color: "#0A1628",
        fontSize: dims.fontSize,
        padding: dims.padding,
        letterSpacing: "0.04em",
        lineHeight: 1,
        boxShadow: "0 2px 6px rgba(201,168,76,0.4)",
        ...style,
      }}
      aria-label="Spotlight Guide"
    >
      <Star
        style={{ width: dims.iconSize, height: dims.iconSize, fill: "#0A1628" }}
        strokeWidth={2.5}
      />
      Spotlight
    </span>
  );
};

export default SpotlightBanner;
