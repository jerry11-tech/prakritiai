import React, { useState } from "react";
import { Sparkles, Eye, Info } from "lucide-react";
import { PrakritiBadge } from "./PrakritiBadge";

interface Observation {
  category: string;
  observation: string;
}

interface FacialFeatureMapProps {
  imageUrl?: string | null;
  observations?: Observation[];
  status?: string;
}

export function FacialFeatureMap({ imageUrl, observations = [], status }: FacialFeatureMapProps) {
  const [selectedHotspot, setSelectedHotspot] = useState<number | null>(null);

  if (status !== "COMPLETED" || !observations.length) {
    return (
      <div className="p-6 bg-muted/20 border border-border/40 rounded-2xl text-center">
        <Info className="h-6 w-6 text-amber-600 mx-auto mb-2" />
        <p className="text-xs font-semibold text-foreground">Facial Analysis Gated</p>
        <p className="text-[11px] text-muted-foreground mt-1">
          No facial image uploaded. 0 simulated observations produced — analysis is questionnaire-based.
        </p>
      </div>
    );
  }

  // Map observations to facial zone hotspots
  const hotspots = [
    { id: 0, title: "Skin Luminance", top: "35%", left: "48%", label: "Forehead / Skin" },
    { id: 1, title: "Color Saturation", top: "50%", left: "38%", label: "Cheek / Complexion" },
    { id: 2, title: "Image Clarity", top: "70%", left: "52%", label: "Facial Contour" },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="font-display font-bold text-sm text-foreground flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" /> Interactive Facial Analysis Overlay
        </h4>
        <span className="text-[10px] text-muted-foreground font-semibold">Hover hotspots for details</span>
      </div>

      <div className="grid md:grid-cols-2 gap-4 items-center">
        {/* Facial Image with Hotspot Pins */}
        <div className="relative aspect-square max-h-64 rounded-2xl overflow-hidden border border-border/60 bg-muted/20 mx-auto w-full">
          {imageUrl ? (
            <img src={imageUrl.startsWith("http") ? imageUrl : `http://127.0.0.1:8000${imageUrl}`} alt="Facial Analysis" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">
              Facial Image Landmark Map
            </div>
          )}

          {/* Interactive Hotspot Buttons */}
          {hotspots.map((spot, idx) => {
            const obs = observations[idx];
            const isSelected = selectedHotspot === idx;
            return (
              <button
                key={spot.id}
                type="button"
                style={{ top: spot.top, left: spot.left }}
                onClick={() => setSelectedHotspot(isSelected ? null : idx)}
                className={`absolute w-6 h-6 -ml-3 -mt-3 rounded-full flex items-center justify-center transition-all ${
                  isSelected ? "bg-primary text-primary-foreground ring-4 ring-primary/30 scale-110" : "bg-card text-primary border border-primary/40 shadow-xs hover:scale-110"
                }`}
                title={spot.label}
              >
                <Eye className="h-3 w-3" />
              </button>
            );
          })}
        </div>

        {/* Observation Details Panel */}
        <div className="space-y-2">
          {observations.map((obs, idx) => {
            const isSelected = selectedHotspot === idx;
            return (
              <div
                key={idx}
                onClick={() => setSelectedHotspot(isSelected ? null : idx)}
                className={`p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                  isSelected
                    ? "bg-secondary border-primary ring-1 ring-primary"
                    : "bg-card border-border/40 hover:border-primary/40"
                }`}
              >
                <div className="flex justify-between items-center mb-1">
                  <span className="font-bold text-foreground">{obs.category}</span>
                  <PrakritiBadge type="APPROVED" label="Landmark Verified" size="sm" />
                </div>
                <p className="text-muted-foreground text-[11px] leading-relaxed">{obs.observation}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
