import type { PrakrutiType } from "../../types/prakruti";

interface DoshaBarProps {
  dosha: PrakrutiType;
  score: number;
  width: number;
}

const DOSHA_STYLES: Record<PrakrutiType, { color: string; bar: string }> = {
  Vata: { color: "text-primary", bar: "bg-primary" },
  Pitta: { color: "text-accent", bar: "bg-accent" },
  Kapha: { color: "text-chart-3", bar: "bg-chart-3" },
};

export function DoshaBar({ dosha, score, width }: DoshaBarProps) {
  const { color, bar } = DOSHA_STYLES[dosha];

  return (
    <div className="flex items-center gap-3 mb-2.5">
      <span className={`text-xs font-semibold min-w-[40px] ${color}`}>
        {dosha}
      </span>
      <div className="flex-1 h-2 bg-muted/30 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full ${bar} transition-all duration-[1400ms] ease-out`}
          style={{ width: `${width}%` }}
        />
      </div>
      <span className={`text-xs font-bold min-w-[32px] text-right ${color}`}>
        {score}%
      </span>
    </div>
  );
}
