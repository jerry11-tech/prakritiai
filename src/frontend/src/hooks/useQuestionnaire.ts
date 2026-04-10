import { useCallback, useState } from "react";
import { QUESTIONS } from "../data/questions";
import type {
  DoshaScores,
  PrakrutiResult,
  PrakrutiType,
  QuestionnaireAnswer,
} from "../types/prakruti";
import {
  generateRandomSeed,
  simulateFacialAnalysis,
} from "../utils/facialAnalysis";

export function useQuestionnaire() {
  const [answers, setAnswers] = useState<Record<string, QuestionnaireAnswer>>(
    {},
  );
  const [imageSeed, setImageSeed] = useState<string>(generateRandomSeed());
  const [result, setResult] = useState<PrakrutiResult | null>(null);

  const setAnswer = useCallback(
    (questionId: string, dosha: QuestionnaireAnswer["dosha"]) => {
      setAnswers((prev) => ({
        ...prev,
        [questionId]: { questionId, dosha },
      }));
    },
    [],
  );

  const setImageFile = useCallback((filename: string) => {
    setImageSeed(filename || generateRandomSeed());
  }, []);

  const totalAnswered = Object.keys(answers).length;
  const totalQuestions = QUESTIONS.length;
  const isComplete = totalAnswered === totalQuestions;

  const classifyPrakruti = useCallback((): PrakrutiResult => {
    const scores: DoshaScores = { vata: 0, pitta: 0, kapha: 0 };

    for (const { dosha } of Object.values(answers)) {
      scores[dosha] += 1;
    }

    const total = scores.vata + scores.pitta + scores.kapha || 1;
    // Largest-remainder correction to ensure percentages sum exactly to 100
    const rawVata = (scores.vata / total) * 100;
    const rawPitta = (scores.pitta / total) * 100;
    const rawKapha = (scores.kapha / total) * 100;
    const floored = {
      vata: Math.floor(rawVata),
      pitta: Math.floor(rawPitta),
      kapha: Math.floor(rawKapha),
    };
    const remainder = 100 - floored.vata - floored.pitta - floored.kapha;
    const entries = (
      [
        ["vata", rawVata - floored.vata],
        ["pitta", rawPitta - floored.pitta],
        ["kapha", rawKapha - floored.kapha],
      ] as [keyof DoshaScores, number][]
    ).sort((a, b) => b[1] - a[1]);
    const percentages: DoshaScores = { ...floored };
    for (let i = 0; i < remainder; i++) {
      percentages[entries[i][0]] += 1;
    }

    const dominantEntry = (
      Object.entries(scores) as [keyof DoshaScores, number][]
    ).reduce((max, entry) => (entry[1] > max[1] ? entry : max), ["vata", 0] as [
      keyof DoshaScores,
      number,
    ]);

    const dominantDosha = dominantEntry[0];
    const dominantPct = percentages[dominantDosha];
    const confidence = Math.min(95, 50 + dominantPct);

    const DOSHA_MAP: Record<keyof DoshaScores, PrakrutiType> = {
      vata: "Vata",
      pitta: "Pitta",
      kapha: "Kapha",
    };

    const facialConditions = simulateFacialAnalysis(imageSeed);

    const prakrutiResult: PrakrutiResult = {
      dominant: DOSHA_MAP[dominantDosha],
      doshaScores: percentages,
      confidence,
      facialConditions,
    };

    setResult(prakrutiResult);
    return prakrutiResult;
  }, [answers, imageSeed]);

  const reset = useCallback(() => {
    setAnswers({});
    setResult(null);
    setImageSeed(generateRandomSeed());
  }, []);

  return {
    questions: QUESTIONS,
    answers,
    setAnswer,
    setImageFile,
    totalAnswered,
    totalQuestions,
    isComplete,
    result,
    classifyPrakruti,
    reset,
  };
}
