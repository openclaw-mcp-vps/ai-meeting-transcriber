import * as React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  tone?: "default" | "positive" | "neutral" | "negative" | "mixed";
}

export function Badge({ className, tone = "default", ...props }: BadgeProps) {
  const toneStyles: Record<NonNullable<BadgeProps["tone"]>, string> = {
    default: "bg-slate-800 text-slate-200",
    positive: "bg-emerald-500/15 text-emerald-300",
    neutral: "bg-slate-700 text-slate-200",
    negative: "bg-rose-500/15 text-rose-300",
    mixed: "bg-amber-500/15 text-amber-300",
  };

  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium capitalize",
        toneStyles[tone],
        className,
      )}
      {...props}
    />
  );
}
