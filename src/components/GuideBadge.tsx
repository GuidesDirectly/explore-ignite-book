import { ShieldCheck, IdCard, Clock } from "lucide-react";
import { useTranslation } from "react-i18next";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export type BadgeType = "licensed_verified" | "permit_confirmed" | "certification_pending";

interface GuideBadgeProps {
  type: BadgeType;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
}

const BADGE_CONFIG: Record<
  BadgeType,
  {
    icon: typeof ShieldCheck;
    labelKey: string;
    tooltipKey: string;
    colorClasses: string;
    priority: number;
  }
> = {
  licensed_verified: {
    icon: ShieldCheck,
    labelKey: "badge.licensedVerified",
    tooltipKey: "badge.licensedTooltip",
    colorClasses:
      "border-green-600/30 text-green-700 bg-green-500/10 dark:text-green-400 dark:border-green-500/30",
    priority: 1,
  },
  permit_confirmed: {
    icon: IdCard,
    labelKey: "badge.permitConfirmed",
    tooltipKey: "badge.permitTooltip",
    colorClasses:
      "border-blue-600/30 text-blue-700 bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/30",
    priority: 2,
  },
  certification_pending: {
    icon: Clock,
    labelKey: "badge.certPending",
    tooltipKey: "badge.pendingTooltip",
    colorClasses:
      "border-amber-600/30 text-amber-700 bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/30",
    priority: 3,
  },
};

const SIZE_MAP = {
  sm: { icon: "w-3 h-3", text: "text-xs", padding: "px-2 py-0.5" },
  md: { icon: "w-4 h-4", text: "text-sm", padding: "px-2.5 py-1" },
  lg: { icon: "w-5 h-5", text: "text-base", padding: "px-3 py-1.5" },
};

/** Returns the highest-priority badge from a list */
export function getHighestBadge(badges: BadgeType[]): BadgeType | null {
  if (!badges || badges.length === 0) return null;
  return badges.sort(
    (a, b) => BADGE_CONFIG[a].priority - BADGE_CONFIG[b].priority
  )[0];
}

const GuideBadge = ({ type, size = "sm", showLabel = true }: GuideBadgeProps) => {
  const { t } = useTranslation();
  const config = BADGE_CONFIG[type];
  const sizeConfig = SIZE_MAP[size];
  const Icon = config.icon;

  const badge = (
    <span
      className={`inline-flex items-center gap-1 rounded-full border font-semibold uppercase tracking-wide ${config.colorClasses} ${sizeConfig.padding} ${sizeConfig.text}`}
    >
      <Icon className={sizeConfig.icon} />
      {showLabel && <span>{t(config.labelKey)}</span>}
    </span>
  );

  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>{badge}</TooltipTrigger>
        <TooltipContent side="top" className="max-w-xs">
          <p className="text-sm">{t(config.tooltipKey)}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default GuideBadge;
