// ---------------------------------------------------------------------------
// ACCURACY TEST HARNESS — "different faces"
//
//   node src/ml/test-accuracy.ts [facesPerSeed] [seeds]
//
// Loads the trained weights and runs inference against several INDEPENDENT
// face populations (one per seed), which were never seen during training.
// Reports aggregate accuracy plus a per-seed breakdown so you can verify the
// model generalizes across many different faces, not just one held-out set.
// ---------------------------------------------------------------------------

import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { generateDataset, encodeConditions } from "./dataset.ts";
import { DoshaNet } from "./model.ts";
import { evaluate, formatMetrics } from "./evaluate.ts";
import type { DoshaIndex, FaceConditions, Metrics, ModelWeights } from "./types.ts";
import { FEATURE_DEFS } from "./dataset.ts";

const __dirname = dirname(fileURLToPath(import.meta.url));

const facesPerSeed = Number(process.argv[2]) || 800;
const seedCount = Number(process.argv[3]) || 5;

const raw = readFileSync(join(__dirname, "weights.json"), "utf-8");
const weights: ModelWeights = JSON.parse(raw);
const net = DoshaNet.fromJSON(weights);

console.log("=".repeat(62));
console.log("  PRAKRITI AI — CROSS-FACE GENERALIZATION TEST");
console.log(`  Model : ${weights.inputSize} inputs -> ${weights.hiddenSize} hidden -> ${weights.outputSize} outputs`);
console.log(`  Faces : ${facesPerSeed} per seed x ${seedCount} independent populations`);
console.log("=".repeat(62));

// Model seen training seed 42; test on completely different populations.
const testSeeds: number[] = [];
let s = 1000;
for (let i = 0; i < seedCount; i++) {
  testSeeds.push(s);
  s += 37;
}

let aggregate = {
  correct: 0,
  total: 0,
  perClassCorrect: [0, 0, 0],
  perClassTotal: [0, 0, 0],
};

const seedRows: Array<{ seed: number; acc: number }> = [];

for (const seed of testSeeds) {
  const faces = generateDataset(facesPerSeed, seed);
  const X = faces.map((f) => f.features);
  const Y = faces.map((f) => f.label);
  const m = evaluate(net, X, Y, 0);

  aggregate.correct += m.correct;
  aggregate.total += m.total;
  for (let c = 0; c < 3; c++) {
    aggregate.perClassTotal[c] += m.confusionMatrix[c].reduce((a, b) => a + b, 0);
    aggregate.perClassCorrect[c] += m.confusionMatrix[c][c];
  }
  seedRows.push({ seed, acc: m.overallAccuracy });

  console.log(`\n  Population seed=${seed} (${facesPerSeed} faces)`);
  console.log(`    Overall accuracy: ${(m.overallAccuracy * 100).toFixed(2)}%`);
  console.log(`    Vata=${(m.perClassAccuracy[0] * 100).toFixed(1)}%  Pitta=${(m.perClassAccuracy[1] * 100).toFixed(1)}%  Kapha=${(m.perClassAccuracy[2] * 100).toFixed(1)}%`);
}

console.log("");
console.log("-".repeat(62));
console.log("  AGGREGATE RESULTS ACROSS ALL TEST FACES");
console.log("-".repeat(62));
console.log(`  Total faces tested : ${aggregate.total}`);
console.log(`  Overall accuracy   : ${((aggregate.correct / aggregate.total) * 100).toFixed(2)}%`);
console.log(`  Per-class accuracy :`);
console.log(`    Vata  : ${((aggregate.perClassCorrect[0] / aggregate.perClassTotal[0]) * 100).toFixed(2)}%`);
console.log(`    Pitta : ${((aggregate.perClassCorrect[1] / aggregate.perClassTotal[1]) * 100).toFixed(2)}%`);
console.log(`    Kapha : ${((aggregate.perClassCorrect[2] / aggregate.perClassTotal[2]) * 100).toFixed(2)}%`);
console.log(`  StdDev across populations : ${(stdDev(seedRows.map((r) => r.acc)) * 100).toFixed(2)}%`);
console.log("=".repeat(62));

function stdDev(arr: number[]): number {
  if (arr.length < 2) return 0;
  const mean = arr.reduce((a, b) => a + b, 0) / arr.length;
  const variance = arr.reduce((a, b) => a + (b - mean) ** 2, 0) / (arr.length - 1);
  return Math.sqrt(variance);
}

// --- Single-face inference demo (round-trip through public API) ---
console.log("\n  SAMPLE SINGLE-FACE INFERENCES (round-trip):");
console.log("  " + "-".repeat(58));
for (const seed of testSeeds.slice(0, 3)) {
  const rng = makeRng(seed);
  for (let i = 0; i < 2; i++) {
    const cond = randomConditions(rng);
    const vec = encodeConditions(cond);
    const { label, probs } = net.predict(vec);
    const truth = dominantDoshaOf(cond);
    const hit = truth === label;
    console.log(
      `  face=${seed}-${i} shape=${cond.faceShape.padEnd(6)} circles=${cond.darkCircles.padEnd(9)} puff=${cond.puffiness.padEnd(10)} tones=${cond.skinTone.padEnd(14)} -> ${doshaName(label)} [${probs.map((p) => (p * 100).toFixed(0)).join("/")}%]  actual=${doshaName(truth)} ${hit ? "OK" : "MISS"}`,
    );
  }
}
console.log("=".repeat(62));

function doshaName(i: number): string {
  return ["Vata", "Pitta", "Kapha"][i] ?? "?";
}

function makeRng(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function randomConditions(rng: () => number): FaceConditions {
  const conditions = {} as FaceConditions;
  for (const def of FEATURE_DEFS) {
    const idx = Math.floor(rng() * def.values.length);
    conditions[def.key] = def.values[idx];
  }
  return conditions;
}

// Naive Ayurvedic ground-truth: the dosha whose canonical feature profile
// best matches the observed face. Used only for the round-trip display.
function dominantDoshaOf(cond: FaceConditions): number {
  const match = [0, 0, 0] as [number, number, number];
  for (const def of FEATURE_DEFS) {
    const valIdx = def.values.indexOf(cond[def.key]);
    if (valIdx < 0) continue;
    for (let d = 0 as DoshaIndex; d < 3; d++) {
      match[d] += def.byDosha[d][valIdx];
    }
  }
  let best = 0;
  for (let d = 1; d < 3; d++) if (match[d] > match[best]) best = d;
  return best;
}

// Re-export for convenience.
export const _unused = { evaluate, formatMetrics };
