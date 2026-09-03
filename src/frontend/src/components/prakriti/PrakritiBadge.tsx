import React from "react";

export type PrakritiType = "Vata" | "Pitta" | "Kapha" | "APPROVED" | "PENDING" | "REJECTED" | "ACTIVE" | "SUSPENDED" | string;

interface PrakritiBadgeProps {
  type: PrakritiType;
  label?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function PrakritiBadge({ type, label, size = "md", className = "" }: PrakritiBadgeProps) {
  const norm = type.toUpperCase();
  const text = label || type;

  let colorClasses = "bg-muted text-muted-foreground border-border";

  if (norm === "VATA") {
    colorClasses = "bg-vata-light text-vata-text border-vata-soft";
  } else if (norm === "PITTA") {
    colorClasses = "bg-pitta-light text-pitta-text border-pitta-soft";
  } else if (norm === "KAPHA") {
    colorClasses = "bg-kapha-light text-kapha-text border-kapha-soft";
  } else if (norm === "APPROVED" || norm === "ACTIVE" || norm === "VERIFIED" || norm === "CORRECT") {
    colorClasses = "bg-kapha-light text-kapha-text border-kapha-soft";
  } else if (norm === "PENDING" || norm === "UNDER REVIEW") {
    colorClasses = "bg-pitta-light text-pitta-text border-pitta-soft";
  } else if (norm === "REJECTED" || norm === "SUSPENDED" || norm === "INCORRECT") {
    colorClasses = "bg-red-50 text-red-700 border-red-200";
  }

  const sizeClasses =
    size === "sm"
      ? "text-[11px] px-2 py-0.5 rounded-md font-semibold"
      : size === "lg"
      ? "text-xs px-3.5 py-1.5 rounded-lg font-bold"
      : "text-xs px-2.5 py-1 rounded-md font-semibold";

  return (
    <span className={`inline-flex items-center gap-1 border border-opacity-60 transition-colors ${colorClasses} ${sizeClasses} ${className}`}>
      {norm === "VATA" && <span className="w-1.5 h-1.5 rounded-full bg-vata" />}
      {norm === "PITTA" && <span className="w-1.5 h-1.5 rounded-full bg-pitta" />}
      {norm === "KAPHA" && <span className="w-1.5 h-1.5 rounded-full bg-kapha" />}
      {text}
    </span>
  );
}
