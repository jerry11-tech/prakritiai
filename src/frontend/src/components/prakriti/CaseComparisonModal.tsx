import React from "react";
import { Button } from "@/components/ui/button";
import { X, ArrowRightLeft, CheckCircle } from "lucide-react";
import { PrakritiBadge } from "./PrakritiBadge";

interface CaseItem {
  id: string;
  userEmail?: string;
  dominantDosha: string;
  vataScore: number;
  pittaScore: number;
  kaphaScore: number;
  aiConfidence: number;
  facialStatus: string;
  createdAt: string;
}

interface CaseComparisonModalProps {
  caseA: CaseItem | null;
  caseB: CaseItem | null;
  isOpen: boolean;
  onClose: () => void;
}

export function CaseComparisonModal({ caseA, caseB, isOpen, onClose }: CaseComparisonModalProps) {
  if (!isOpen || !caseA || !caseB) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-card border border-border rounded-3xl max-w-3xl w-full p-6 space-y-6 shadow-card animate-fadeUp">
        <div className="flex items-center justify-between border-b border-border/40 pb-3">
          <div className="flex items-center gap-2">
            <ArrowRightLeft className="h-5 w-5 text-primary" />
            <h3 className="font-display font-bold text-base text-foreground">Side-by-Side Clinical Case Comparison</h3>
          </div>
          <Button size="icon" variant="ghost" onClick={onClose} className="h-7 w-7">
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* 2-Column Comparison Grid */}
        <div className="grid md:grid-cols-2 gap-6 text-xs">
          {/* Case A */}
          <div className="p-4 bg-muted/20 border border-border/60 rounded-2xl space-y-3">
            <div className="flex justify-between items-center border-b border-border/40 pb-2">
              <span className="font-mono font-bold text-primary">Case #{caseA.id}</span>
              <PrakritiBadge type={caseA.dominantDosha} label={caseA.dominantDosha} size="sm" />
            </div>
            <div className="space-y-1 text-muted-foreground">
              <div><strong>User:</strong> {caseA.userEmail || "Anonymous"}</div>
              <div><strong>Confidence:</strong> {caseA.aiConfidence}%</div>
              <div><strong>Facial Status:</strong> {caseA.facialStatus}</div>
              <div><strong>Date:</strong> {caseA.createdAt}</div>
            </div>
            <div className="p-3 bg-card border border-border/40 rounded-xl space-y-1 font-mono">
              <div className="flex justify-between text-vata"><span>Vata:</span> <strong>{caseA.vataScore}%</strong></div>
              <div className="flex justify-between text-pitta"><span>Pitta:</span> <strong>{caseA.pittaScore}%</strong></div>
              <div className="flex justify-between text-kapha"><span>Kapha:</span> <strong>{caseA.kaphaScore}%</strong></div>
            </div>
          </div>

          {/* Case B */}
          <div className="p-4 bg-muted/20 border border-border/60 rounded-2xl space-y-3">
            <div className="flex justify-between items-center border-b border-border/40 pb-2">
              <span className="font-mono font-bold text-primary">Case #{caseB.id}</span>
              <PrakritiBadge type={caseB.dominantDosha} label={caseB.dominantDosha} size="sm" />
            </div>
            <div className="space-y-1 text-muted-foreground">
              <div><strong>User:</strong> {caseB.userEmail || "Anonymous"}</div>
              <div><strong>Confidence:</strong> {caseB.aiConfidence}%</div>
              <div><strong>Facial Status:</strong> {caseB.facialStatus}</div>
              <div><strong>Date:</strong> {caseB.createdAt}</div>
            </div>
            <div className="p-3 bg-card border border-border/40 rounded-xl space-y-1 font-mono">
              <div className="flex justify-between text-vata"><span>Vata:</span> <strong>{caseB.vataScore}%</strong></div>
              <div className="flex justify-between text-pitta"><span>Pitta:</span> <strong>{caseB.pittaScore}%</strong></div>
              <div className="flex justify-between text-kapha"><span>Kapha:</span> <strong>{caseB.kaphaScore}%</strong></div>
            </div>
          </div>
        </div>

        {/* Diff Summary */}
        <div className="p-3 bg-secondary/60 border border-primary/30 rounded-xl text-xs text-primary font-semibold flex items-center gap-2">
          <CheckCircle className="h-4 w-4" />
          Comparison Result: {caseA.dominantDosha === caseB.dominantDosha ? "Matching dominant dosha type" : "Different dominant Prakriti types"} (Confidence delta: {Math.abs(caseA.aiConfidence - caseB.aiConfidence).toFixed(1)}%).
        </div>

        <div className="text-right">
          <Button size="sm" onClick={onClose} className="text-xs font-bold bg-primary text-primary-foreground">
            Close Comparison
          </Button>
        </div>
      </div>
    </div>
  );
}
