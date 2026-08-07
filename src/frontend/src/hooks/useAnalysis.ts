import { useCallback, useState } from "react";
import type { PrakrutiResult } from "../types/prakruti";

const STORAGE_KEY = "prakriti_history";

export interface StoredAnalysis {
  id: string;
  result: PrakrutiResult;
  timestamp: number;
  imagePreview?: string;
}

function loadHistory(): StoredAnalysis[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveHistory(items: StoredAnalysis[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

interface AnalysisState {
  isLoading: boolean;
  error: string | null;
  stored: boolean;
}

export function useAnalysis() {
  const [state, setState] = useState<AnalysisState>({
    isLoading: false,
    error: null,
    stored: false,
  });

  const storeAnalysis = useCallback(
    async (result: PrakrutiResult, imagePreview?: string): Promise<void> => {
      setState({ isLoading: true, error: null, stored: false });
      try {
        await new Promise<void>((resolve) => setTimeout(resolve, 400));

        const entry: StoredAnalysis = {
          id: `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
          result,
          timestamp: Date.now(),
          imagePreview,
        };

        const history = loadHistory();
        history.unshift(entry);
        if (history.length > 20) history.pop();
        saveHistory(history);

        setState({ isLoading: false, error: null, stored: true });
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to store analysis";
        setState({ isLoading: false, error: message, stored: false });
      }
    },
    [],
  );

  const getHistory = useCallback((): StoredAnalysis[] => {
    return loadHistory();
  }, []);

  const deleteHistoryItem = useCallback((id: string) => {
    const history = loadHistory().filter((h) => h.id !== id);
    saveHistory(history);
  }, []);

  const clearHistory = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  const clearError = () => setState((prev) => ({ ...prev, error: null }));

  return {
    isLoading: state.isLoading,
    error: state.error,
    stored: state.stored,
    storeAnalysis,
    getHistory,
    deleteHistoryItem,
    clearHistory,
    clearError,
  };
}
