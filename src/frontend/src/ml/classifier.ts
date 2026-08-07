// ---------------------------------------------------------------------------
// Browser-side inference using the trained DoshaNet weights.
//
// The trained weights are bundled at build time from weights.json (produced
// by `node src/ml/train.ts`). This module fuses the questionnaire tally with
// the ML facial-condition prediction to produce the final Prakriti result.
// ---------------------------------------------------------------------------

import weights from "./weights.json";
import { DoshaNet } from "./model.ts";
import { encodeConditions } from "./dataset.ts";
import type { FaceConditions } from "./types.ts";

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

/**
 * Fuses the questionnaire tally (questionnaireScores in 0..N counts) with the
 * ML facial prediction. Facial evidence carries 35% weight by default so the
 * questionnaire stays primary while the trained model meaningfully adjusts
 * the outcome toward the observed facial constitution.
 */
export function fuseScores(
  questionnaireScores: { vata: number; pitta: number; kapha: number },
  facialPrediction: ModelPrediction,
  facialWeight = 0.35,
): { vata: number; pitta: number; kapha: number } {
  const qTotal =
    questionnaireScores.vata + questionnaireScores.pitta + questionnaireScores.kapha || 1;

  const q = {
    vata: questionnaireScores.vata / qTotal,
    pitta: questionnaireScores.pitta / qTotal,
    kapha: questionnaireScores.kapha / qTotal,
  };

  const f = facialPrediction.probs;

  const fused = {
    vata: q.vata * (1 - facialWeight) + f.vata * facialWeight,
    pitta: q.pitta * (1 - facialWeight) + f.pitta * facialWeight,
    kapha: q.kapha * (1 - facialWeight) + f.kapha * facialWeight,
  };

  // Normalize to 100.
  const total = fused.vata + fused.pitta + fused.kapha || 1;
  return {
    vata: (fused.vata / total) * 100,
    pitta: (fused.pitta / total) * 100,
    kapha: (fused.kapha / total) * 100,
  };
}

export { net as loadedDoshaNet };
