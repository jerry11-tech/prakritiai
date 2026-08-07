export type DoshaType = "vata" | "pitta" | "kapha";
export type PrakrutiType = "Vata" | "Pitta" | "Kapha";
export type FaceShape = "Oval" | "Round" | "Square" | "Heart" | "Oblong";
export type DarkCirclesSeverity = "None" | "Mild" | "Moderate" | "Prominent";
export type PuffinessLevel = "None" | "Mild" | "Moderate" | "Significant";

export interface QuestionOption {
  label: string;
  dosha: DoshaType;
}

export interface Question {
  id: string;
  text: string;
  options: QuestionOption[];
}

export interface QuestionnaireAnswer {
  questionId: string;
  dosha: DoshaType;
}

export interface DoshaScores {
  vata: number;
  pitta: number;
  kapha: number;
}

export interface FacialConditions {
  faceShape: FaceShape;
  darkCircles: DarkCirclesSeverity;
  puffiness: PuffinessLevel;
  skinTone: string;
  skinMoisture: string;
  hairTexture: string;
  bodyFrame: string;
  eyeLook: string;
}

export interface PrakrutiResult {
  dominant: PrakrutiType;
  doshaScores: DoshaScores;
  confidence: number;
  facialConditions: FacialConditions;
}
