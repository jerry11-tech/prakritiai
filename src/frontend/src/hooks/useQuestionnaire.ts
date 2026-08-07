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
import { predictFacialDosha, fuseScores } from "../ml/classifier";

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

    const DOSHA_MAP: Record<keyof DoshaScores, PrakrutiType> = {
      vata: "Vata",
      pitta: "Pitta",
      kapha: "Kapha",
    };

    const facialConditions = simulateFacialAnalysis(imageSeed);

    // ML inference: run the observed facial conditions through the trained
    // DoshaNet and fuse its prediction with the questionnaire tally.
    const facialPrediction = predictFacialDosha(facialConditions);
    const fused = fuseScores(scores, facialPrediction, 0.35);

    const dominantEntry = (
      Object.entries(fused) as [keyof DoshaScores, number][]
    ).reduce((max, entry) => (entry[1] > max[1] ? entry : max), ["vata", 0] as [
      keyof DoshaScores,
      number,
    ]);

    const dominantDosha = dominantEntry[0];
    const dominantPct = fused[dominantDosha];
    const confidence = Math.min(96, 45 + dominantPct);

    const prakrutiResult: PrakrutiResult = {
      dominant: DOSHA_MAP[dominantDosha],
      doshaScores: fused,
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
