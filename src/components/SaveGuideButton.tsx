import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SaveGuideButtonProps {
  isSaved: boolean;
  onToggle: () => void;
  loading?: boolean;
  size?: "sm" | "md";
}

const SaveGuideButton = ({ isSaved, onToggle, loading, size = "sm" }: SaveGuideButtonProps) => {
  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onToggle();
      }}
      disabled={loading}
      className={`${size === "sm" ? "h-8 w-8" : "h-10 w-10"} rounded-full transition-all ${
        isSaved
          ? "text-red-500 hover:text-red-600 bg-red-50 hover:bg-red-100"
          : "text-muted-foreground hover:text-red-500 hover:bg-red-50"
      }`}
      aria-label={isSaved ? "Remove from favorites" : "Save to favorites"}
    >
      <Heart
        className={`${size === "sm" ? "w-4 h-4" : "w-5 h-5"} transition-all ${isSaved ? "fill-current" : ""}`}
      />
    </Button>
  );
};

export default SaveGuideButton;
