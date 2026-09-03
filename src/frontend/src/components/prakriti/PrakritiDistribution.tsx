import React from "react";

interface PrakritiDistributionProps {
  scores: {
    Vata: number;
    Pitta: number;
    Kapha: number;
  };
  showLabels?: boolean;
  className?: string;
}

export function PrakritiDistribution({ scores, showLabels = true, className = "" }: PrakritiDistributionProps) {
  const vata = scores.Vata || 0;
  const pitta = scores.Pitta || 0;
  const kapha = scores.Kapha || 0;
  const total = vata + pitta + kapha || 100;

  const vataPct = round((vata / total) * 100);
  const pittaPct = round((pitta / total) * 100);
  const kaphaPct = round((kapha / total) * 100);

  function round(val: number) {
    return Math.round(val * 10) / 10;
  }

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Distribution Progress Bar */}
      <div className="h-3 w-full bg-muted/40 rounded-full overflow-hidden flex p-0.5 border border-border/50">
        <div style={{ width: `${vataPct}%` }} className="bg-vata h-full rounded-l-full transition-all duration-500" title={`Vata: ${vataPct}%`} />
        <div style={{ width: `${pittaPct}%` }} className="bg-pitta h-full transition-all duration-500" title={`Pitta: ${pittaPct}%`} />
        <div style={{ width: `${kaphaPct}%` }} className="bg-kapha h-full rounded-r-full transition-all duration-500" title={`Kapha: ${kaphaPct}%`} />
      </div>

      {/* Legend & Percentages */}
      {showLabels && (
        <div className="grid grid-cols-3 gap-2 text-xs text-center font-medium">
          <div className="p-2 bg-vata-light border border-vata-soft rounded-lg text-vata-text">
            <span className="font-bold block">Vata</span>
            <span className="text-sm font-extrabold">{vataPct}%</span>
          </div>
          <div className="p-2 bg-pitta-light border border-pitta-soft rounded-lg text-pitta-text">
            <span className="font-bold block">Pitta</span>
            <span className="text-sm font-extrabold">{pittaPct}%</span>
          </div>
          <div className="p-2 bg-kapha-light border border-kapha-soft rounded-lg text-kapha-text">
            <span className="font-bold block">Kapha</span>
            <span className="text-sm font-extrabold">{kaphaPct}%</span>
          </div>
        </div>
      )}
    </div>
  );
}
