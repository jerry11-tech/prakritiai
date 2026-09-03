// ---------------------------------------------------------------------------
// Browser-side inference using the trained DoshaNet weights & CV Metrics.
// Supports 7-Class Prakriti Taxonomy, 3-Model Benchmark Architecture,
// and Multimodal Fusion.
// ---------------------------------------------------------------------------

import weights from "./weights.json";
import { DoshaNet } from "./model.ts";
import { encodeConditions } from "./dataset.ts";
import type { FaceConditions } from "./types.ts";
import type { FacialCvMetrics, PrakrutiType } from "../types/prakruti";

const net = DoshaNet.fromJSON(weights);

export interface ModelPrediction {
  dosha: "Vata" | "Pitta" | "Kapha";
  label: number;
  probs: { vata: number; pitta: number; kapha: number };
  confidence: number;
}

const NAME_MAP = ["Vata", "Pitta", "Kapha"] as const;

export function predictFacialDosha(conditions: FaceConditions): ModelPrediction {
  const vec = encodeConditions(conditions);
  const { label, probs } = net.predict(vec);
  return {
    dosha: NAME_MAP[label],
    label,
    probs: { vata: probs[0], pitta: probs[1], kapha: probs[2] },
    confidence: Math.max(...probs) * 100,
  };
}

export function classify7PrakritiTaxonomy(scores: { vata: number; pitta: number; kapha: number }): {
  dominant: PrakrutiType;
  category: "Ekadoshaja (Single)" | "Dwandwaja (Dual)" | "Sama (Tridoshaja)";
  secondaryDosha?: "vata" | "pitta" | "kapha";
} {
  const total = scores.vata + scores.pitta + scores.kapha || 1;
  const pV = (scores.vata / total) * 100;
  const pP = (scores.pitta / total) * 100;
  const pK = (scores.kapha / total) * 100;

  const sorted = [
    { name: "Vata" as PrakrutiType, key: "vata" as const, score: pV },
    { name: "Pitta" as PrakrutiType, key: "pitta" as const, score: pP },
    { name: "Kapha" as PrakrutiType, key: "kapha" as const, score: pK },
  ].sort((a, b) => b.score - a.score);

  const top1 = sorted[0];
  const top2 = sorted[1];
  const top3 = sorted[2];

  if (top1.score - top3.score <= 10.0) {
    return { dominant: "Sama", category: "Sama (Tridoshaja)" };
  } else if (top1.score - top2.score <= 15.0) {
    const dualName = `${top1.name}-${top2.name}` as PrakrutiType;
    return { dominant: dualName, category: "Dwandwaja (Dual)", secondaryDosha: top2.key };
  } else {
    return { dominant: top1.name, category: "Ekadoshaja (Single)", secondaryDosha: top2.key };
  }
}

/**
 * Fuses the questionnaire tally (0..N counts) with ML facial & CV aspect ratio metrics.
 * Uses dynamic weighting (65% questionnaire / 35% vision).
 */
export function fuseScores(
  questionnaireScores: { vata: number; pitta: number; kapha: number },
  facialPrediction: ModelPrediction,
  cvMetrics?: FacialCvMetrics | null,
  facialWeight = 0.35
): { vata: number; pitta: number; kapha: number } {
  const qTotal = questionnaireScores.vata + questionnaireScores.pitta + questionnaireScores.kapha || 1;

  const q = {
    vata: questionnaireScores.vata / qTotal,
    pitta: questionnaireScores.pitta / qTotal,
    kapha: questionnaireScores.kapha / qTotal,
  };

  let f = facialPrediction.probs;

  if (cvMetrics && cvMetrics.isValid) {
    // Suguna & Thippeswamy aspect ratio rules
    const vCv = (cvMetrics.ear <= 0.10 ? 1 : 0.2) + (cvMetrics.nar <= 0.80 ? 1 : 0.2) + (cvMetrics.mar <= 0.50 ? 1 : 0.2);
    const pCv = (cvMetrics.ear > 0.10 && cvMetrics.ear <= 0.20 ? 1 : 0.2) + (cvMetrics.nar > 0.80 && cvMetrics.nar <= 1.00 ? 1 : 0.2) + (cvMetrics.mar > 0.50 && cvMetrics.mar <= 0.60 ? 1 : 0.2);
    const kCv = (cvMetrics.ear > 0.20 ? 1 : 0.2) + (cvMetrics.nar > 1.00 ? 1 : 0.2) + (cvMetrics.mar > 0.60 ? 1 : 0.2);
    const cvTot = vCv + pCv + kCv || 1;

    f = {
      vata: (f.vata + vCv / cvTot) / 2,
      pitta: (f.pitta + pCv / cvTot) / 2,
      kapha: (f.kapha + kCv / cvTot) / 2,
    };
  }

  const fused = {
    vata: q.vata * (1 - facialWeight) + f.vata * facialWeight,
    pitta: q.pitta * (1 - facialWeight) + f.pitta * facialWeight,
    kapha: q.kapha * (1 - facialWeight) + f.kapha * facialWeight,
  };

  const total = fused.vata + fused.pitta + fused.kapha || 1;
  return {
    vata: (fused.vata / total) * 100,
    pitta: (fused.pitta / total) * 100,
    kapha: (fused.kapha / total) * 100,
  };
}

export { net as loadedDoshaNet };
