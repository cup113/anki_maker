import { defineStore } from "pinia";
import { useLocalStorage } from "@vueuse/core";

export interface AIConfig {
  baseUrl: string;
  apiKey: string;
  model_name: string;
  max_concurrent: number;
  enabled: boolean;
}

export interface AIProcessingResult {
  level: string;
  front: string;
  back: string;
  additions: Array<{
    front: string;
    back: string;
  }>;
}

export interface AIProcessingState {
  isProcessing: boolean;
  processedCount: number;
  totalCount: number;
  results: AIProcessingResult[];
  error?: string;
}

export const useAIStore = defineStore("ai", () => {
  const config = useLocalStorage<AIConfig>("AL_aiConfig", {
    baseUrl: "https://api.openai.com/v1",
    apiKey: "",
    model_name: "qwen-plus",
    max_concurrent: 3,
    enabled: false
  });

  const processingState = useLocalStorage<AIProcessingState>("AL_aiProcessingState", {
    isProcessing: false,
    processedCount: 0,
    totalCount: 0,
    results: [],
    error: undefined
  });

  function updateConfig(newConfig: Partial<AIConfig>) {
    config.value = { ...config.value, ...newConfig };
  }

  function resetProcessingState() {
    processingState.value = {
      isProcessing: false,
      processedCount: 0,
      totalCount: 0,
      results: [],
      error: undefined
    };
  }

  function startProcessing(totalNotes: number) {
    processingState.value = {
      isProcessing: true,
      processedCount: 0,
      totalCount: totalNotes,
      results: [],
      error: undefined
    };
  }

  function updateProgress(result?: AIProcessingResult) {
    if (result) {
      processingState.value.results.push(result);
    }
    processingState.value.processedCount++;
  }

  function completeProcessing() {
    processingState.value.isProcessing = false;
  }

  function setError(error: string) {
    processingState.value.error = error;
    processingState.value.isProcessing = false;
  }

  return {
    config,
    processingState,
    updateConfig,
    resetProcessingState,
    startProcessing,
    updateProgress,
    completeProcessing,
    setError
  };
});