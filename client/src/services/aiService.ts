import { useAIStore, type AIProcessingResult } from "@/stores/ai";
import { useToastsStore } from "@/stores/toasts";

export class AIService {
  private static instance: AIService;
  private requestPool: Set<Promise<any>> = new Set();
  private maxConcurrent: number = 3;

  static getInstance(): AIService {
    if (!AIService.instance) {
      AIService.instance = new AIService();
    }
    return AIService.instance;
  }

  setMaxConcurrent(max: number) {
    this.maxConcurrent = max;
  }

  async processSingleNote(note: string, level: string): Promise<AIProcessingResult> {
    const aiStore = useAIStore();

    if (!aiStore.config.apiKey) {
      throw new Error("API key not configured");
    }

    try {
      const response = await fetch('/api/ai/process-single-note', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          note: note,
          level: level,
          base_url: aiStore.config.baseUrl,
          api_key: aiStore.config.apiKey,
          model_name: aiStore.config.model_name
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "AI处理失败";
      throw new Error(errorMessage);
    }
  }

  async processNotesBatch(notes: string[]): Promise<void> {
    const aiStore = useAIStore();
    const toastsStore = useToastsStore();

    if (!aiStore.config.apiKey) {
      toastsStore.add_toast("AI配置错误", "请先设置OpenAI API密钥");
      throw new Error("API key not configured");
    }

    // 过滤空行
    const validNotes = notes.filter(note => {
      const trimmed = note.trim();
      return trimmed
    });

    const notesCount = validNotes.filter(note => !note.startsWith("#")).length;

    if (notesCount === 0) {
      toastsStore.add_toast("无有效内容", "请输入有效的学习笔记");
      return;
    }

    aiStore.startProcessing(notesCount);

    let levelNumber = 0;
    const processingPromises: Promise<void>[] = [];

    for (const note of validNotes) {
      if (note.trim().startsWith('#')) {
        // 标题行，增加level number
        levelNumber += 1;
        continue;
      }

      const processPromise = this.addToRequestPool(
        this.processSingleNote(note.trim(), levelNumber.toString())
          .then(result => {
            aiStore.updateProgress(result);
          })
          .catch(error => {
            console.error(`Error processing note "${note}":`, error);
            // 生成一个默认的错误结果
            const errorResult: AIProcessingResult = {
              level: levelNumber.toString(),
              front: `**${note}** - 生成失败`,
              back: "AI生成过程中出现错误，请手动编辑内容",
              additions: []
            };
            aiStore.updateProgress(errorResult);
          })
      );

      processingPromises.push(processPromise);
    }

    try {
      await Promise.all(processingPromises);
      toastsStore.add_toast("处理完成", `成功生成 ${aiStore.processingState.processedCount} 张卡片`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "批量处理失败";
      aiStore.setError(errorMessage);
      toastsStore.add_toast("AI处理错误", errorMessage);
      throw error;
    } finally {
      aiStore.completeProcessing();
    }
  }

  async addToRequestPool<T>(promise: Promise<T>): Promise<T> {
    // 如果请求池已满，等待一个请求完成
    if (this.requestPool.size >= this.maxConcurrent) {
      await Promise.race(this.requestPool);
    }

    this.requestPool.add(promise);

    try {
      const result = await promise;
      return result;
    } finally {
      this.requestPool.delete(promise);
    }
  }

  clearRequestPool() {
    this.requestPool.clear();
  }

  getCurrentPoolSize(): number {
    return this.requestPool.size;
  }
}

// 导出单例实例
export const aiService = AIService.getInstance();