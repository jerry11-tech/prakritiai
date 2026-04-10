import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface DoshaScores {
    vata: number;
    pitta: number;
    kapha: number;
}
export interface FacialConditions {
    faceShape: string;
    puffiness: string;
    skinTone: string;
    darkCircles: string;
}
export interface AnalysisResult {
    id: bigint;
    prakruti: PrakrutiType;
    questAnswers: Array<string>;
    facialConditions: FacialConditions;
    timestamp: bigint;
    confidence: number;
    doshaScores: DoshaScores;
}
export enum PrakrutiType {
    Vata = "Vata",
    Pitta = "Pitta",
    Kapha = "Kapha"
}
export interface backendInterface {
    getAnalysisById(id: bigint): Promise<AnalysisResult | null>;
    getAnalysisCount(): Promise<bigint>;
    getLatestAnalysis(): Promise<AnalysisResult | null>;
    storeAnalysis(prakruti: PrakrutiType, doshaScores: DoshaScores, confidence: number, facialConditions: FacialConditions, questAnswers: Array<string>): Promise<bigint>;
}
