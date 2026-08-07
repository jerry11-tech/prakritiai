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
const SKIN_MOISTURES = ["Dry, Rough", "Normal", "Oily, Smooth"];
const HAIR_TEXTURES = ["Dry, Frizzy", "Fine, Straight", "Thick, Oily"];
const BODY_FRAMES = ["Thin, Lean", "Medium", "Broad, Heavy"];
const EYE_LOOKS = ["Small, Dry", "Sharp, Piercing", "Large, Lustrous"];

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

/**
 * Derives the 8 facial-condition attributes deterministically from the image
 * seed. The seed is stable per uploaded image, so the same face always yields
 * the same facial observations (which are then fed to the trained DoshaNet).
 */
export function simulateFacialAnalysis(seed: string): FacialConditions {
  const numericSeed = hashString(seed);

  const pick = <T,>(arr: T[], offset: number): T =>
    arr[Math.floor(seededRandom(numericSeed, offset) * arr.length)];

  return {
    faceShape: pick(FACE_SHAPES, 0),
    darkCircles: pick(DARK_CIRCLES, 1),
    puffiness: pick(PUFFINESS, 2),
    skinTone: pick(SKIN_TONES, 3),
    skinMoisture: pick(SKIN_MOISTURES, 4),
    hairTexture: pick(HAIR_TEXTURES, 5),
    bodyFrame: pick(BODY_FRAMES, 6),
    eyeLook: pick(EYE_LOOKS, 7),
  };
}

export function generateRandomSeed(): string {
  return Math.random().toString(36).substring(2, 10);
}
