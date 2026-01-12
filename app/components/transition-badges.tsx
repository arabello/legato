import type { ReactNode } from "react";
import { Flame, Layers } from "lucide-react";
import type { HarmonicMood, HarmonicRuleType } from "~/core/rules";
import { cn } from "~/lib/utils";

const typeStyleMap: Record<HarmonicRuleType, string> = {
  impact: "bg-energy-impact/20 text-energy-impact",
  smooth: "bg-energy-smooth/20 text-energy-smooth",
};

const typeIconMap: Record<HarmonicRuleType, typeof Flame> = {
  impact: Flame,
  smooth: Layers,
};

const moodStyleMap: Record<HarmonicMood, string> = {
  neutral: "bg-muted/30 text-muted-foreground",
  tension: "bg-energy-tension/20 text-energy-tension",
  moodier: "bg-key-minor/20 text-key-minor",
  happier: "bg-key-major/20 text-key-major",
};

const capitalize = (value: string) =>
  value.slice(0, 1).toUpperCase() + value.slice(1);

type BadgeProps<T> = {
  value: T;
  children?: ReactNode;
  className?: string;
};

export function TransitionTypeBadge({
  value,
  children,
  className,
  showIcon = true,
}: BadgeProps<HarmonicRuleType> & { showIcon?: boolean }) {
  const Icon = typeIconMap[value];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium",
        typeStyleMap[value],
        className,
      )}
    >
      {showIcon && <Icon className="h-3 w-3" />}
      {children ?? capitalize(value)}
    </span>
  );
}

export function TransitionMoodBadge({
  value,
  children,
  className,
}: BadgeProps<HarmonicMood>) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full px-2 py-0.5 text-xs font-medium",
        moodStyleMap[value],
        className,
      )}
    >
      {children ?? capitalize(value)}
    </span>
  );
}
