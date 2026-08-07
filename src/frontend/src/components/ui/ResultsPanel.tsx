import { Button } from "@/components/ui/button";
import type { ReactNode } from "react";
import { RECOMMENDATIONS } from "../../data/recommendations";
import type {
  DoshaType,
  PrakrutiResult,
  PrakrutiType,
} from "../../types/prakruti";

interface ResultsPanelProps {
  result: PrakrutiResult;
  barWidths: Record<PrakrutiType, number>;
  doshaOrder: PrakrutiType[];
  onReset: () => void;
  children: ReactNode;
  saved?: boolean;
}

const DOT_COLORS = ["bg-accent", "bg-primary", "bg-chart-3"];

export function ResultsPanel({ result, onReset, children, saved }: ResultsPanelProps) {
  const stats = [
    {
      label: "Face Shape",
      value: result.facialConditions.faceShape,
      cls: "border-primary/30 bg-primary/8",
    },
    {
      label: "Prakriti",
      value: result.dominant,
      cls: "border-accent/30 bg-accent/8",
    },
    {
      label: "Confidence",
      value: `${result.confidence}%`,
      cls: "border-chart-3/30 bg-chart-3/8",
    },
  ];

  const conditions = [
    {
      key: "Dark Circles",
      val: result.facialConditions.darkCircles,
      cls:
        result.facialConditions.darkCircles === "None"
          ? "text-accent"
          : "text-chart-3",
    },
    {
      key: "Facial Puffiness",
      val: result.facialConditions.puffiness,
      cls:
        result.facialConditions.puffiness === "None"
          ? "text-accent"
          : "text-primary",
    },
    {
      key: "Skin Tone",
      val: result.facialConditions.skinTone,
      cls: "text-muted-foreground",
    },
    {
      key: "Skin Moisture",
      val: result.facialConditions.skinMoisture,
      cls:
        result.facialConditions.skinMoisture.includes("Dry")
          ? "text-chart-3"
          : result.facialConditions.skinMoisture.includes("Oily")
            ? "text-primary"
            : "text-accent",
    },
    {
      key: "Hair Texture",
      val: result.facialConditions.hairTexture,
      cls: "text-muted-foreground",
    },
    {
      key: "Body Frame",
      val: result.facialConditions.bodyFrame,
      cls: "text-muted-foreground",
    },
    {
      key: "Eye Look",
      val: result.facialConditions.eyeLook,
      cls: "text-muted-foreground",
    },
    {
      key: "Dominant Dosha",
      val: `${result.dominant} (${result.doshaScores[result.dominant.toLowerCase() as DoshaType].toFixed(0)}%)`,
      cls: "gradient-hero font-bold",
    },
  ];

  return (
    <div data-ocid="results-panel">
      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className={`text-center border rounded-xl p-3 ${stat.cls}`}
          >
            <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
              {stat.label}
            </div>
            <div className="font-display font-black text-base">
              {stat.value}
            </div>
          </div>
        ))}
      </div>

      {/* Facial Conditions */}
      <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 mb-4">
        <div className="flex items-center justify-between mb-3">
          <div className="text-xs font-bold tracking-widest text-primary/70 uppercase">
            Facial Condition Analysis
          </div>
          <span className="text-[10px] font-bold text-accent bg-accent/10 border border-accent/30 rounded-full px-2 py-0.5">
            ML Model · 77% Accuracy
          </span>
        </div>
        {conditions.map((row) => (
          <div
            key={row.key}
            className="flex justify-between items-center py-2 border-b border-white/5 last:border-0"
          >
            <span className="text-xs text-muted-foreground">{row.key}</span>
            <span className={`text-xs font-semibold ${row.cls}`}>
              {row.val}
            </span>
          </div>
        ))}
      </div>

      {/* Dosha Bars */}
      <div className="mb-4">
        <div className="text-xs font-bold tracking-widest text-accent uppercase mb-3">
          Dosha Breakdown
        </div>
        {children}
      </div>

      {/* Recommendations */}
      <div className="bg-accent/5 border border-accent/20 rounded-xl p-4 mb-4">
        <div className="text-xs font-bold tracking-widest text-accent uppercase mb-3">
          🌿 Ayurvedic Recommendations
        </div>
        {RECOMMENDATIONS[result.dominant].diet.slice(0, 4).map((rec, idx) => (
          <div key={rec} className="flex gap-2.5 mb-2 items-start">
            <div
              className={`w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0 ${DOT_COLORS[idx % DOT_COLORS.length]}`}
            />
            <p className="text-xs text-foreground/75 leading-relaxed">{rec}</p>
          </div>
        ))}
      </div>

      <Button
        type="button"
        data-ocid="reset-btn"
        variant="outline"
        size="sm"
        className="w-full border-border/50 text-muted-foreground hover:text-foreground text-xs"
        onClick={onReset}
      >
        ↺ Start New Analysis
      </Button>

      {saved ? (
        <div className="mt-3 text-center text-[11px] text-accent/80">
          ✓ Saved to your analysis history
        </div>
      ) : null}
    </div>
  );
}
