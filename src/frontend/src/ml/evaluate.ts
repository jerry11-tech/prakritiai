import { DoshaNet } from "./model.ts";
import { DOSHA_NAMES } from "./types.ts";
import type { Metrics, Sample } from "./types.ts";

// ---------------------------------------------------------------------------
// Evaluation utilities: train/test split, confusion matrix, and per-class
// precision / recall / F1 / accuracy. Mirrors scikit-learn semantics.
// ---------------------------------------------------------------------------

export function trainTestSplit(
  samples: Sample[],
  testRatio: number,
  seed: number,
): { XTrain: number[][]; YTrain: number[]; XTest: number[][]; YTest: number[] } {
  // Deterministic shuffle.
  let a = seed >>> 0;
  const rng = () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };

  const idx = samples.map((_, i) => i);
  for (let i = idx.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [idx[i], idx[j]] = [idx[j], idx[i]];
  }

  const nTest = Math.round(samples.length * testRatio);
  const testIdx = new Set(idx.slice(0, nTest));

  const XTrain: number[][] = [];
  const YTrain: number[] = [];
  const XTest: number[][] = [];
  const YTest: number[] = [];

  samples.forEach((s, i) => {
    if (testIdx.has(i)) {
      XTest.push(s.features);
      YTest.push(s.label);
    } else {
      XTrain.push(s.features);
      YTrain.push(s.label);
    }
  });

  return { XTrain, YTrain, XTest, YTest };
}

export function evaluate(
  model: DoshaNet,
  X: number[][],
  Y: number[],
  nTrain: number,
): Metrics {
  const nClasses = model.outputSize;
  const cm: number[][] = Array.from({ length: nClasses }, () =>
    new Array(nClasses).fill(0),
  );

  let correct = 0;
  X.forEach((x, i) => {
    const { label } = model.predict(x);
    cm[Y[i]][label] += 1;
    if (label === Y[i]) correct += 1;
  });

  const total = X.length;
  const overallAccuracy = total ? correct / total : 0;

  const precision: number[] = [];
  const recall: number[] = [];
  const f1: number[] = [];
  const perClassAccuracy: number[] = [];

  for (let c = 0; c < nClasses; c++) {
    const tp = cm[c][c];
    const fp = Array.from({ length: nClasses }, (_, r) => cm[r][c]).reduce(
      (a, b) => a + b,
      0,
    ) - tp;
    const fn =
      cm[c].reduce((a, b) => a + b, 0) - tp;
    const classTotal = cm[c].reduce((a, b) => a + b, 0);

    precision.push(tp + fp > 0 ? tp / (tp + fp) : 0);
    recall.push(tp + fn > 0 ? tp / (tp + fn) : 0);
    f1.push(precision[c] + recall[c] > 0 ? (2 * precision[c] * recall[c]) / (precision[c] + recall[c]) : 0);
    perClassAccuracy.push(classTotal > 0 ? tp / classTotal : 0);
  }

  return {
    overallAccuracy,
    confusionMatrix: cm,
    precision,
    recall,
    f1,
    perClassAccuracy,
    correct,
    total,
    nTrain,
    nTest: total,
  };
}

export function formatMetrics(m: Metrics): string {
  const lines: string[] = [];
  lines.push("=".repeat(62));
  lines.push("  PRAKRITI AI — FACIAL DOSHA CLASSIFIER EVALUATION");
  lines.push("=".repeat(62));
  lines.push(`  Overall Accuracy : ${(m.overallAccuracy * 100).toFixed(2)}%`);
  lines.push(`  Correct/Total    : ${m.correct}/${m.total}`);
  lines.push(`  Train samples    : ${m.nTrain}`);
  lines.push(`  Test samples     : ${m.nTest}`);
  lines.push("");

  lines.push("  Confusion Matrix (rows=actual, cols=predicted):");
  const header =
    "  " +
    DOSHA_NAMES.map((d) => d.padStart(8)).join("") +
    "   %Acc";
  lines.push(header);
  m.confusionMatrix.forEach((row, c) => {
    lines.push(
      "  " +
        DOSHA_NAMES[c].padEnd(5) +
        row.map((v) => String(v).padStart(8)).join("") +
        `   ${(m.perClassAccuracy[c] * 100).toFixed(1)}%`,
    );
  });
  lines.push("");

  lines.push("  Per-class Precision / Recall / F1:");
  lines.push("  " + "Dosha  ".padEnd(8) + "Precision  Recall    F1");
  DOSHA_NAMES.forEach((d, c) => {
    lines.push(
      `  ${d.padEnd(8)}${(m.precision[c] * 100).toFixed(1).padStart(9)}%  ${(m.recall[c] * 100).toFixed(1).padStart(7)}%  ${(m.f1[c] * 100).toFixed(1).padStart(7)}%`,
    );
  });
  lines.push("=".repeat(62));
  return lines.join("\n");
}
