export type DoshaType = "vata" | "pitta" | "kapha";
export type PrimaryDosha = "Vata" | "Pitta" | "Kapha";
export type PrakrutiType = "Vata" | "Pitta" | "Kapha" | "Vata-Pitta" | "Pitta-Kapha" | "Kapha-Vata" | "Sama";
export type FaceShape = "Oval" | "Round" | "Square" | "Heart" | "Oblong";
export type DarkCirclesSeverity = "None" | "Mild" | "Moderate" | "Prominent";
export type PuffinessLevel = "None" | "Mild" | "Moderate" | "Significant";
export type VerificationStatus = "PENDING" | "VERIFIED" | "NEEDS_REVERIFICATION";
export type LabelStatus = "CONSENSUS_AGREED" | "DISAGREEMENT" | "SINGLE_EXPERT" | "UNLABELED";

export interface QuestionOption {
  label: string;
  dosha: DoshaType;
  value: string; // ML categorical value (e.g. "Low", "Medium", "High", "Dry", "Oily")
}

export interface Question {
  id: string;
  text: string;
  category: "demographic" | "health" | "prakriti" | "vikriti";
  options: QuestionOption[];
}

export interface QuestionnaireAnswer {
  questionId: string;
  dosha: DoshaType;
  value: string;
}

export interface FacialCvMetrics {
  ear: number; // Eye Aspect Ratio (Vata <=0.1, Pitta 0.1-0.2, Kapha >0.2)
  nar: number; // Nose Aspect Ratio (Vata <=0.8, Pitta 0.8-1.0, Kapha >1.0)
  mar: number; // Mouth Aspect Ratio (Vata <=0.5, Pitta 0.5-0.6, Kapha >0.6)
  foreheadRgb: { r: number; g: number; b: number };
  foreheadHsv: { h: number; s: number; v: number };
  faceShape: FaceShape;
  isValid: boolean;
  validationMessage: string;
}

export interface VikritiResult {
  imbalanceDominant: DoshaType;
  vikritiScores: DoshaScores;
  hasActiveImbalance: boolean;
  notes: string[];
}

export interface ClinicalRiskInsight {
  dosha: PrakrutiType;
  riskTitle: string;
  evidenceReference: string;
  description: string;
  preventiveGuidance: string[];
}

export interface ParticipantDemographics {
  participantId: string;
  name: string;
  ageGroup: string;
  gender: string;
  city: string;
  diabetes: boolean;
  bloodPressure: boolean;
  createdAt: string;
  userVerified: boolean;
  verificationStatus: VerificationStatus;
  verificationDate?: string;
}

export interface ExpertAssessment {
  assessmentId: string;
  participantId: string;
  expertId: string;
  expertName: string;
  primaryPrakriti: PrakrutiType;
  secondaryPrakriti?: PrakrutiType;
  confidence: number;
  assessmentMethod: string;
  notes?: string;
  assessmentDate: string;
}

export interface PrakritiConsensusLabel {
  participantId: string;
  consensusPrakriti?: PrakrutiType;
  labelStatus: LabelStatus;
  expertCount: number;
  agreedCount: number;
}

export interface ChangeHistoryRecord {
  changeId: string;
  participantId: string;
  changedAt: string;
  changedBy: string;
  userRole: "User" | "Admin" | "Expert";
  fieldName: string;
  previousValue: string;
  newValue: string;
  changeType: "ANSWER_CHANGED" | "VERIFICATION_RESET" | "USER_VERIFIED";
  reason: string;
  verificationStatus: VerificationStatus;
}

export interface VerificationLogRecord {
  verificationId: string;
  participantId: string;
  verificationDate: string;
  status: VerificationStatus;
  verifiedBy: string;
  numberOfAnswers: number;
  answersChangedBeforeVerification: number;
  verificationMethod: string;
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
  cvMetrics?: FacialCvMetrics;
}

export interface ModelPredictionDetail {
  dominant: PrakrutiType;
  doshaScores: DoshaScores;
  confidence: number;
}

export interface PrakrutiResult {
  dominant: PrakrutiType;
  doshaScores: DoshaScores;
  confidence: number;
  constitutionCategory?: "Ekadoshaja (Single)" | "Dwandwaja (Dual)" | "Sama (Tridoshaja)";
  secondaryDosha?: DoshaType;
  facialConditions: FacialConditions;
  isMlPrediction?: boolean;
  mlProbabilities?: Record<string, number>;
  explanationFeatures?: Array<{ feature: string; val: string; influence: string }>;
  
  // 3-Model Benchmark Architecture outputs
  questionnairePrediction?: ModelPredictionDetail;
  visionPrediction?: ModelPredictionDetail;
  fusionPrediction?: ModelPredictionDetail;
  multimodalAgreement?: boolean;
  lowAgreementWarning?: string;

  // Vikriti & Clinical Risk
  vikriti?: VikritiResult;
  clinicalRisks?: ClinicalRiskInsight[];
}

export interface ExcelSyncStatus {
  lastUpdated: string;
  status: "SUCCESS" | "PENDING" | "FAILED" | "RETRYING";
  totalRecords: number;
  verifiedRecords: number;
  pendingRecords: number;
  needsReverificationRecords: number;
  totalChanges: number;
  todaySubmissions: number;
  todayVerifications: number;
}

export interface MLModelMetrics {
  modelName: string;
  version: string;
  trainedAt: string;
  datasetSize: number;
  trainSamples: number;
  testSamples: number;
  cvAccuracyMean: number;
  cvAccuracyStd: number;
  cvF1MacroMean: number;
  testAccuracy: number;
  testPrecisionMacro: number;
  testRecallMacro: number;
  testF1Macro: number;
  testF1Weighted: number;
  cohensKappa: number;
  fleissKappa?: number;
  cronbachAlpha?: number;
  confusionMatrix: number[][];
  classNames: string[];
  perClassPerformance: Record<string, { precision: number; recall: number; f1: number; count: number }>;
  topFeatures: Array<{ feature: string; importance: number }>;
}
