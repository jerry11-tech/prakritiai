import type {
  DarkCirclesSeverity,
  FaceShape,
  FacialConditions,
  PuffinessLevel,
} from "../types/prakruti";

const FACE_SHAPES: FaceShape[] = ["Oval", "Round", "Square", "Heart", "Oblong"];
const DARK_CIRCLES: DarkCirclesSeverity[] = [
  "None",
  "Mild",
  "Moderate",
  "Prominent",
];
const PUFFINESS: PuffinessLevel[] = ["None", "Mild", "Moderate", "Significant"];
const SKIN_TONES = [
  "Fair, Smooth",
  "Medium, Warm",
  "Olive, Balanced",
  "Deep, Rich",
  "Light, Cool",
];

function hashString(str: string): number {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) + hash) ^ str.charCodeAt(i);
    hash = hash >>> 0;
  }
  return hash;
}

function seededRandom(seed: number, offset: number): number {
  const n = hashString(`${seed}_${offset}`);
  return (n % 1000) / 1000;
}

export function simulateFacialAnalysis(seed: string): FacialConditions {
  const numericSeed = hashString(seed);

  const faceShapeIdx = Math.floor(
    seededRandom(numericSeed, 0) * FACE_SHAPES.length,
  );
  const darkCirclesIdx = Math.floor(
    seededRandom(numericSeed, 1) * DARK_CIRCLES.length,
  );
  const puffinessIdx = Math.floor(
    seededRandom(numericSeed, 2) * PUFFINESS.length,
  );
  const skinToneIdx = Math.floor(
    seededRandom(numericSeed, 3) * SKIN_TONES.length,
  );

  return {
    faceShape: FACE_SHAPES[faceShapeIdx],
    darkCircles: DARK_CIRCLES[darkCirclesIdx],
    puffiness: PUFFINESS[puffinessIdx],
    skinTone: SKIN_TONES[skinToneIdx],
  };
}

export function generateRandomSeed(): string {
  return Math.random().toString(36).substring(2, 10);
}
