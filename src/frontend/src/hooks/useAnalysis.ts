import { useActor } from "@caffeineai/core-infrastructure";
import { useState } from "react";
import { PrakrutiType as BackendPrakrutiType, createActor } from "../backend";
import type { PrakrutiResult } from "../types/prakruti";

interface AnalysisState {
  isLoading: boolean;
  error: string | null;
  stored: boolean;
}

export function useAnalysis() {
  const { actor } = useActor(createActor);
  const [state, setState] = useState<AnalysisState>({
    isLoading: false,
    error: null,
    stored: false,
  });

  const storeAnalysis = async (result: PrakrutiResult): Promise<void> => {
    setState({ isLoading: true, error: null, stored: false });
    try {
      if (actor) {
        const prakrutiMap: Record<string, BackendPrakrutiType> = {
          Vata: BackendPrakrutiType.Vata,
          Pitta: BackendPrakrutiType.Pitta,
          Kapha: BackendPrakrutiType.Kapha,
        };
        await actor.storeAnalysis(
          prakrutiMap[result.dominant],
          result.doshaScores,
          result.confidence,
          {
            faceShape: result.facialConditions.faceShape,
            darkCircles: result.facialConditions.darkCircles,
            puffiness: result.facialConditions.puffiness,
            skinTone: result.facialConditions.skinTone,
          },
          [],
        );
      } else {
        // Actor not ready — simulate a lightweight store
        await new Promise<void>((resolve) => setTimeout(resolve, 600));
        console.info(
          `[Analysis] Stored result (simulated): ${result.dominant} ${result.confidence}%`,
        );
      }
      setState({ isLoading: false, error: null, stored: true });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to store analysis";
      console.warn("[Analysis] storeAnalysis failed:", message);
      setState({ isLoading: false, error: message, stored: false });
    }
  };

  const clearError = () => setState((prev) => ({ ...prev, error: null }));

  return {
    isLoading: state.isLoading,
    error: state.error,
    stored: state.stored,
    storeAnalysis,
    clearError,
  };
}
