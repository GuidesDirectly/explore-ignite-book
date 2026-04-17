import { Crown } from "lucide-react";

interface FoundingGuideBadgeProps {
  size?: "sm" | "md";
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Permanent gold "FOUNDING GUIDE" badge for guides on the founding plan.
 * Renders on profile cards, profile pages, search results, and admin lists.
 */
const FoundingGuideBadge = ({ size = "sm", className = "", style }: FoundingGuideBadgeProps) => {
  const dims =
    size === "md"
      ? { fontSize: 12, padding: "5px 10px", iconSize: 13 }
      : { fontSize: 10, padding: "3px 8px", iconSize: 11 };

  return (
    <span
      className={`inline-flex items-center gap-1 font-bold uppercase rounded ${className}`}
      style={{
        backgroundColor: "#C9A84C",
        color: "#0A1628",
        fontSize: dims.fontSize,
        padding: dims.padding,
        letterSpacing: "0.04em",
        lineHeight: 1,
        ...style,
      }}
      aria-label="Founding Guide"
    >
      <Crown style={{ width: dims.iconSize, height: dims.iconSize }} strokeWidth={2.5} />
      Founding Guide
    </span>
  );
};

export default FoundingGuideBadge;
