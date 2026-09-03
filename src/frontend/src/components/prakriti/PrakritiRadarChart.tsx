import React from "react";
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend, Tooltip } from "recharts";
import { PrakritiBadge } from "./PrakritiBadge";
import { Activity } from "lucide-react";

interface PrakritiRadarChartProps {
  scores?: { Vata: number; Pitta: number; Kapha: number };
  dominantDosha?: string;
}

export function PrakritiRadarChart({ scores = { Vata: 45, Pitta: 35, Kapha: 20 }, dominantDosha = "Vata" }: PrakritiRadarChartProps) {
  const v = scores.Vata || 40;
  const p = scores.Pitta || 35;
  const k = scores.Kapha || 25;

  const data = [
    { axis: "Physical Frame", Vata: v * 0.9, Pitta: p * 0.7, Kapha: k * 1.1 },
    { axis: "Metabolic Fire", Vata: v * 0.6, Pitta: p * 1.2, Kapha: k * 0.7 },
    { axis: "Skin & Moisture", Vata: v * 0.5, Pitta: p * 0.9, Kapha: k * 1.2 },
    { axis: "Nervous Energy", Vata: v * 1.2, Pitta: p * 0.8, Kapha: k * 0.5 },
    { axis: "Sleep & Stamina", Vata: v * 0.6, Pitta: p * 0.9, Kapha: k * 1.3 },
    { axis: "Mental Focus", Vata: v * 1.1, Pitta: p * 1.2, Kapha: k * 0.8 },
  ];

  return (
    <div className="bg-card border border-border/60 rounded-3xl p-6 shadow-card space-y-4">
      <div className="flex items-center justify-between border-b border-border/40 pb-3">
        <div className="flex items-center gap-2">
          <Activity className="h-5 w-5 text-primary" />
          <div>
            <h3 className="font-display font-bold text-base text-foreground">6-Axis Tri-Dosha Radar Visual</h3>
            <p className="text-xs text-muted-foreground">Multi-dimensional physiological and mental expression.</p>
          </div>
        </div>
        <PrakritiBadge type={dominantDosha} label={`${dominantDosha} Expression`} size="sm" />
      </div>

      <div className="h-72 w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
            <PolarGrid stroke="var(--border)" />
            <PolarAngleAxis dataKey="axis" stroke="var(--muted-foreground)" tick={{ fontSize: 10, fontWeight: 600 }} />
            <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="var(--border)" tick={{ fontSize: 9 }} />
            <Radar name="Vata (Air)" dataKey="Vata" stroke="#4F86C6" fill="#4F86C6" fillOpacity={0.25} />
            <Radar name="Pitta (Fire)" dataKey="Pitta" stroke="#E8753D" fill="#E8753D" fillOpacity={0.25} />
            <Radar name="Kapha (Earth)" dataKey="Kapha" stroke="#4F9A67" fill="#4F9A67" fillOpacity={0.25} />
            <Tooltip contentStyle={{ backgroundColor: "var(--card)", borderColor: "var(--border)", borderRadius: 12, fontSize: 11 }} />
            <Legend wrapperStyle={{ fontSize: 11, paddingTop: 10 }} />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
