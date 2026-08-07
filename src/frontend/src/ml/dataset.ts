import type { DoshaIndex, FaceConditions, Sample } from "./types.ts";

// ---------------------------------------------------------------------------
// Ayurvedic feature vocabulary (from Charaka Samhita & classical texts).
// Each feature category lists its possible values and, for each dosha, the
// probability distribution of observing that value in a person dominated by
// that dosha. Noise is injected to model mixed/transitional prakriti.
// ---------------------------------------------------------------------------

export interface FeatureDef {
  key: keyof FaceConditions;
  values: string[];
  // dosha -> weight per value (relative emphasis; normalized later)
  byDosha: Record<number, number[]>;
}

export const FEATURE_DEFS: FeatureDef[] = [
  {
    key: "faceShape",
    values: ["Oval", "Round", "Square", "Heart", "Oblong"],
    byDosha: {
      0: [0.4, 0.05, 0.1, 0.15, 0.3], // Vata: thin / oblong / oval
      1: [0.2, 0.15, 0.35, 0.25, 0.05], // Pitta: medium / square / heart
      2: [0.15, 0.55, 0.1, 0.1, 0.1], // Kapha: round & full
    },
  },
  {
    key: "darkCircles",
    values: ["None", "Mild", "Moderate", "Prominent"],
    byDosha: {
      0: [0.05, 0.2, 0.4, 0.35], // Vata: prominent (dryness / poor sleep)
      1: [0.25, 0.4, 0.25, 0.1], // Pitta: mild to moderate
      2: [0.6, 0.25, 0.1, 0.05], // Kapha: rarely
    },
  },
  {
    key: "puffiness",
    values: ["None", "Mild", "Moderate", "Significant"],
    byDosha: {
      0: [0.6, 0.25, 0.1, 0.05], // Vata: little fluid retention
      1: [0.3, 0.4, 0.2, 0.1], // Pitta: mild
      2: [0.05, 0.2, 0.4, 0.35], // Kapha: significant puffiness
    },
  },
  {
    key: "skinTone",
    values: ["Fair, Smooth", "Medium, Warm", "Olive, Balanced", "Deep, Rich", "Light, Cool"],
    byDosha: {
      0: [0.25, 0.2, 0.1, 0.15, 0.3], // Vata: light/cool & dry
      1: [0.35, 0.3, 0.15, 0.1, 0.1], // Pitta: fair-red/warm
      2: [0.15, 0.25, 0.3, 0.25, 0.05], // Kapha: olive/deep & smooth
    },
  },
  {
    key: "skinMoisture",
    values: ["Dry, Rough", "Normal", "Oily, Smooth"],
    byDosha: {
      0: [0.7, 0.2, 0.1], // Vata: dry & rough
      1: [0.15, 0.55, 0.3], // Pitta: normal (slightly oily)
      2: [0.05, 0.25, 0.7], // Kapha: oily & smooth
    },
  },
  {
    key: "hairTexture",
    values: ["Dry, Frizzy", "Fine, Straight", "Thick, Oily"],
    byDosha: {
      0: [0.65, 0.25, 0.1], // Vata: dry & frizzy
      1: [0.1, 0.7, 0.2], // Pitta: fine & early greying
      2: [0.05, 0.25, 0.7], // Kapha: thick & oily
    },
  },
  {
    key: "bodyFrame",
    values: ["Thin, Lean", "Medium", "Broad, Heavy"],
    byDosha: {
      0: [0.75, 0.2, 0.05], // Vata: thin, prominent joints
      1: [0.15, 0.65, 0.2], // Pitta: medium & muscular
      2: [0.05, 0.25, 0.7], // Kapha: broad & heavy
    },
  },
  {
    key: "eyeLook",
    values: ["Small, Dry", "Sharp, Piercing", "Large, Lustrous"],
    byDosha: {
      0: [0.65, 0.2, 0.15], // Vata: small, dry, restless
      1: [0.15, 0.7, 0.15], // Pitta: sharp & piercing
      2: [0.05, 0.25, 0.7], // Kapha: large & lustrous
    },
  },
];

export const INPUT_SIZE = FEATURE_DEFS.reduce((acc, d) => acc + d.values.length, 0);

// ---------------------------------------------------------------------------
// Deterministic RNG (mulberry32) so experiments are reproducible.
// ---------------------------------------------------------------------------

export function createRng(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function weightedPick(rng: () => number, weights: number[]): number {
  const total = weights.reduce((a, b) => a + b, 0);
  let roll = rng() * total;
  for (let i = 0; i < weights.length; i++) {
    roll -= weights[i];
    if (roll <= 0) return i;
  }
  return weights.length - 1;
}

// ---------------------------------------------------------------------------
// Encodes a sample's categorical features into a numeric one-hot vector.
// ---------------------------------------------------------------------------

export function encodeConditions(conditions: FaceConditions): number[] {
  const vec: number[] = new Array(INPUT_SIZE).fill(0);
  let offset = 0;
  for (const def of FEATURE_DEFS) {
    const idx = def.values.indexOf(conditions[def.key]);
    if (idx >= 0) vec[offset + idx] = 1;
    offset += def.values.length;
  }
  return vec;
}

// ---------------------------------------------------------------------------
// Generates a labeled dataset grounded in Ayurvedic constitution theory.
// Ayurveda recognizes 7 prakriti types: single-dosha (ekadoshaja) and
// dual-dosha (dvandvaja). We model:
//   • 40% single-dosha  -> every feature sampled from the dominant dosha.
//   • 60% dual-dosha    -> a fixed secondary dosha is chosen once per person
//                          (so features are coherently mixed, not random),
//                          each feature drawn from dominant w.p. 0.78.
// This yields realistic, learnable class structure.
// ---------------------------------------------------------------------------

export function generateDataset(n: number, seed: number): Sample[] {
  const rng = createRng(seed);
  const samples: Sample[] = [];

  for (let i = 0; i < n; i++) {
    // Dominant dosha: slight class imbalance for realism.
    const roll = rng();
    let label: DoshaIndex;
    if (roll < 0.36) label = 0;
    else if (roll < 0.68) label = 1;
    else label = 2;

    // Constitution type: 60% dual-dosha, 40% single-dosha.
    const isDual = rng() < 0.6;
    const secondary = (label + 1 + Math.floor(rng() * 2)) % 3 as DoshaIndex;
    const dominanceP = 0.78;

    const conditions = {} as FaceConditions;
    for (const def of FEATURE_DEFS) {
      let source: number = label;
      if (isDual && rng() > dominanceP) {
        source = secondary;
      }
      const valueIdx = weightedPick(rng, def.byDosha[source]);
      conditions[def.key] = def.values[valueIdx];
    }

    samples.push({ features: encodeConditions(conditions), label, conditions });
  }

  return samples;
}

export { createRng as default };
