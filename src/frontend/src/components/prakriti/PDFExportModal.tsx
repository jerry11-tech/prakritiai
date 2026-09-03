import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Download, FileText, Check, X, ShieldCheck } from "lucide-react";
import { PrakritiBadge } from "./PrakritiBadge";

interface PDFExportModalProps {
  testId?: string;
  dominantDosha?: string;
  isOpen: boolean;
  onClose: () => void;
  onConfirmExport: (options: ExportOptions) => void;
}

export interface ExportOptions {
  includeFacialObs: boolean;
  includeDietPlan: boolean;
  includeYoga: boolean;
  includeRoutine: boolean;
  includeClinicalSeal: boolean;
}

export function PDFExportModal({ testId = "T001", dominantDosha = "Vata", isOpen, onClose, onConfirmExport }: PDFExportModalProps) {
  const [options, setOptions] = useState<ExportOptions>({
    includeFacialObs: true,
    includeDietPlan: true,
    includeYoga: true,
    includeRoutine: true,
    includeClinicalSeal: true,
  });

  if (!isOpen) return null;

  const toggle = (key: keyof ExportOptions) => {
    setOptions((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-card border border-border rounded-3xl max-w-md w-full p-6 space-y-5 shadow-card animate-fadeUp">
        <div className="flex items-center justify-between border-b border-border/40 pb-3">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            <h3 className="font-display font-bold text-base text-foreground">Customize PDF Report Export</h3>
          </div>
          <Button size="icon" variant="ghost" onClick={onClose} className="h-7 w-7">
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="p-3 bg-muted/20 border border-border/40 rounded-xl flex items-center justify-between text-xs">
          <div>
            <span className="font-bold text-foreground block">Report Case ID: #{testId}</span>
            <span className="text-muted-foreground text-[11px]">Dominant Profile: {dominantDosha}</span>
          </div>
          <PrakritiBadge type={dominantDosha} label={dominantDosha} size="sm" />
        </div>

        <div className="space-y-2 text-xs">
          <span className="font-bold text-muted-foreground uppercase tracking-wider block text-[10px]">REPORT SECTIONS TO INCLUDE</span>

          {[
            { key: "includeFacialObs", label: "Facial Computer Vision Observations" },
            { key: "includeDietPlan", label: "Personalized Ayurvedic Nutrition Plan" },
            { key: "includeYoga", label: "Yoga Asanas & Pranayama Guidance" },
            { key: "includeRoutine", label: "Daily Dinacharya Routine" },
            { key: "includeClinicalSeal", label: "Verification QR Seal & Practitioner Block" },
          ].map((item) => {
            const isChecked = options[item.key as keyof ExportOptions];
            return (
              <div
                key={item.key}
                onClick={() => toggle(item.key as keyof ExportOptions)}
                className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                  isChecked ? "bg-secondary/60 border-primary text-primary font-semibold" : "bg-background border-border text-muted-foreground"
                }`}
              >
                <span>{item.label}</span>
                <div className={`w-4 h-4 rounded flex items-center justify-center border ${isChecked ? "bg-primary text-primary-foreground border-primary" : "border-border"}`}>
                  {isChecked && <Check className="h-3 w-3" />}
                </div>
              </div>
            );
          })}
        </div>

        <div className="pt-3 border-t border-border/40 flex gap-3">
          <Button variant="outline" size="sm" onClick={onClose} className="flex-1 text-xs">
            Cancel
          </Button>
          <Button
            size="sm"
            onClick={() => {
              onConfirmExport(options);
              onClose();
            }}
            className="flex-1 text-xs font-bold bg-primary text-primary-foreground gap-1.5"
          >
            <Download className="h-3.5 w-3.5" /> Download PDF
          </Button>
        </div>
      </div>
    </div>
  );
}
