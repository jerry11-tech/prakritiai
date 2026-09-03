import React from "react";
import { Activity, Clock } from "lucide-react";
import { PrakritiBadge } from "./PrakritiBadge";

interface HistoricalTest {
  testId: string;
  date: string;
  vata: number;
  pitta: number;
  kapha: number;
  dominant: string;
}

interface LongitudinalChartProps {
  history?: HistoricalTest[];
  currentScores?: { Vata: number; Pitta: number; Kapha: number };
}

export function LongitudinalChart({ history, currentScores }: LongitudinalChartProps) {
  const dummyHistory: HistoricalTest[] = history || [
    { testId: "T-01", date: "3 Months Ago", vata: 55, pitta: 25, kapha: 20, dominant: "Vata" },
    { testId: "T-02", date: "1 Month Ago", vata: 40, pitta: 40, kapha: 20, dominant: "Pitta" },
    { testId: "T-03", date: "Current Assessment", vata: currentScores?.Vata || 45, pitta: currentScores?.Pitta || 35, kapha: currentScores?.Kapha || 20, dominant: "Vata" },
  ];

  return (
    <div className="bg-card border border-border/60 rounded-2xl p-6 shadow-card space-y-4">
      <div className="flex items-center justify-between border-b border-border/40 pb-3">
        <div className="flex items-center gap-2">
          <Activity className="h-5 w-5 text-primary" />
          <div>
            <h3 className="font-display font-bold text-base text-foreground">Longitudinal Prakriti vs. Vikriti Trends</h3>
            <p className="text-xs text-muted-foreground">Prakriti (Birth Constitution) vs. Vikriti (Current Seasonal Imbalance)</p>
          </div>
        </div>
        <PrakritiBadge type="APPROVED" label="Multi-Assessment Tracking" size="sm" />
      </div>

      {/* Historical Trend Timeline */}
      <div className="space-y-3 pt-2">
        {dummyHistory.map((item, idx) => (
          <div key={idx} className="p-3 bg-muted/20 border border-border/40 rounded-xl space-y-2 text-xs">
            <div className="flex justify-between items-center">
              <span className="font-bold text-foreground flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-muted-foreground" /> {item.date} (#{item.testId})
              </span>
              <PrakritiBadge type={item.dominant} label={`${item.dominant} Peak`} size="sm" />
            </div>

            {/* Score Bar */}
            <div className="h-2.5 w-full bg-muted/40 rounded-full overflow-hidden flex">
              <div style={{ width: `${item.vata}%` }} className="bg-vata h-full" title={`Vata: ${item.vata}%`} />
              <div style={{ width: `${item.pitta}%` }} className="bg-pitta h-full" title={`Pitta: ${item.pitta}%`} />
              <div style={{ width: `${item.kapha}%` }} className="bg-kapha h-full" title={`Kapha: ${item.kapha}%`} />
            </div>

            <div className="flex justify-between text-[11px] text-muted-foreground font-mono">
              <span className="text-vata font-bold">Vata {item.vata}%</span>
              <span className="text-pitta font-bold">Pitta {item.pitta}%</span>
              <span className="text-kapha font-bold">Kapha {item.kapha}%</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
