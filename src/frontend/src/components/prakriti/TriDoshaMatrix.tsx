import React from "react";
import { PrakritiBadge } from "./PrakritiBadge";

interface TriDoshaMatrixProps {
  dominantDosha?: string;
}

export function TriDoshaMatrix({ dominantDosha = "Vata" }: TriDoshaMatrixProps) {
  const norm = dominantDosha.toUpperCase();

  const matrix = [
    {
      feature: "Elements & Principle",
      vata: "Air + Space (Movement)",
      pitta: "Fire + Water (Metabolism)",
      kapha: "Earth + Water (Structure)",
    },
    {
      feature: "Physical Frame",
      vata: "Thin, slender, light bone structure",
      pitta: "Medium, athletic, well-proportioned",
      kapha: "Broad, heavy, sturdy build",
    },
    {
      feature: "Skin & Complexion",
      vata: "Cool, dry, thin, easily chapped",
      pitta: "Warm, soft, flushed, sensitive",
      kapha: "Smooth, oily, thick, cool",
    },
    {
      feature: "Appetite & Digestion",
      vata: "Irregular, variable, prone to bloat",
      pitta: "Strong, sharp, intense hunger",
      kapha: "Slow, steady, constant appetite",
    },
    {
      feature: "Mental & Stress Style",
      vata: "Quick, creative, anxious under stress",
      pitta: "Decisive, intense, irritable when blocked",
      kapha: "Calm, deliberate, stubborn under pressure",
    },
  ];

  return (
    <div className="bg-card border border-border/60 rounded-2xl p-6 shadow-card space-y-4">
      <div className="flex items-center justify-between border-b border-border/40 pb-3">
        <div>
          <h3 className="font-display font-bold text-base text-foreground">Tri-Dosha Comparative Matrix</h3>
          <p className="text-xs text-muted-foreground">Ayurvedic constitutional traits side-by-side.</p>
        </div>
        <PrakritiBadge type={dominantDosha} label={`${dominantDosha} Expression`} size="sm" />
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-xs text-left border-collapse">
          <thead>
            <tr className="uppercase text-[10px] tracking-wider border-b border-border/40 text-muted-foreground">
              <th className="p-2.5">Feature</th>
              <th className={`p-2.5 ${norm === "VATA" ? "bg-vata-light text-vata-text font-extrabold rounded-t-lg" : ""}`}>
                Vata (Air)
              </th>
              <th className={`p-2.5 ${norm === "PITTA" ? "bg-pitta-light text-pitta-text font-extrabold rounded-t-lg" : ""}`}>
                Pitta (Fire)
              </th>
              <th className={`p-2.5 ${norm === "KAPHA" ? "bg-kapha-light text-kapha-text font-extrabold rounded-t-lg" : ""}`}>
                Kapha (Earth)
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/30">
            {matrix.map((row, idx) => (
              <tr key={idx} className="hover:bg-muted/20">
                <td className="p-2.5 font-bold text-foreground">{row.feature}</td>
                <td className={`p-2.5 text-muted-foreground ${norm === "VATA" ? "bg-vata-light/50 text-vata-text font-semibold" : ""}`}>
                  {row.vata}
                </td>
                <td className={`p-2.5 text-muted-foreground ${norm === "PITTA" ? "bg-pitta-light/50 text-pitta-text font-semibold" : ""}`}>
                  {row.pitta}
                </td>
                <td className={`p-2.5 text-muted-foreground ${norm === "KAPHA" ? "bg-kapha-light/50 text-kapha-text font-semibold" : ""}`}>
                  {row.kapha}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
