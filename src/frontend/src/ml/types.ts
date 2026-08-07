// Shared types for the Prakriti ML pipeline.

export type DoshaIndex = 0 | 1 | 2; // 0=Vata, 1=Pitta, 2=Kapha
export type DoshaName = "Vata" | "Pitta" | "Kapha";

export const DOSHA_NAMES: DoshaName[] = ["Vata", "Pitta", "Kapha"];

export interface FaceConditions {
  faceShape: string;
  darkCircles: string;
  puffiness: string;
  skinTone: string;
  skinMoisture: string;
  hairTexture: string;
  bodyFrame: string;
  eyeLook: string;
}

export interface Sample {
  features: number[];
  label: DoshaIndex;
  conditions: FaceConditions;
}

export interface Metrics {
  overallAccuracy: number;
  confusionMatrix: number[][];
  precision: number[];
  recall: number[];
  f1: number[];
  perClassAccuracy: number[];
  correct: number;
  total: number;
  nTrain: number;
  nTest: number;
}

export interface ModelWeights {
  inputSize: number;
  hiddenSize: number;
  outputSize: number;
  W1: number[][];
  b1: number[];
  W2: number[][];
  b2: number[];
}
