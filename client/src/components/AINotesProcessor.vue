<template>
  <div class="bg-white rounded-lg border border-gray-200 p-6 mb-6 shadow-sm">
    <h3 class="text-lg font-semibold text-gray-900 mb-4">AI 笔记处理</h3>

    <div class="space-y-4">
      <!-- 输入区域 -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">
          输入笔记（每行一个单词/短语，以#开头的行作为标题）
        </label>
        <textarea v-model="notesInput" placeholder="输入要处理的笔记，每行一个项目..." rows="8"
          :disabled="processingState.isProcessing"
          class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"></textarea>

        <div class="text-sm text-gray-500 mt-2">
          共 {{ noteCount }} 条有效笔记
        </div>
      </div>

      <!-- 操作按钮 -->
      <div class="flex flex-wrap gap-2">
        <button @click="processNotes" :disabled="!canProcess || processingState.isProcessing"
          class="px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed">
          {{ processingState.isProcessing ? '处理中...' : '开始处理' }}
        </button>

        <button @click="applyResults" :disabled="!hasResults"
          class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed">
          应用到文档
        </button>

        <button @click="clearResults" :disabled="!hasResults"
          class="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed">
          清除结果
        </button>
      </div>

      <!-- 进度条 -->
      <div v-if="processingState.isProcessing" class="space-y-2">
        <div class="w-full bg-gray-200 rounded-full h-2">
          <div class="bg-green-600 h-2 rounded-full transition-all duration-300 ease-out"
            :style="{ width: progressPercentage + '%' }"></div>
        </div>
        <div class="text-sm text-gray-600">
          处理中: {{ processingState.processedCount }} / {{ processingState.totalCount }}
        </div>
      </div>

      <!-- 错误信息 -->
      <div v-if="processingState.error" class="bg-red-50 border border-red-200 rounded-md p-3">
        <div class="flex items-center text-red-800 text-sm">
          <span class="text-red-500 mr-2">❌</span>
          {{ processingState.error }}
        </div>
      </div>

      <!-- 结果区域 -->
      <div v-if="hasResults" class="space-y-3">
        <h4 class="text-md font-medium text-gray-900">
          处理结果 ({{ processingState.results.length }} 条)
        </h4>

        <div class="border border-gray-200 rounded-md divide-y divide-gray-200 max-h-80 overflow-y-auto">
          <div v-for="(result, index) in processingState.results" :key="index" class="p-4">
            <div class="flex items-center justify-between mb-2">
              <span class="text-sm font-medium text-blue-600">Level {{ result.level }}</span>
              <span class="text-sm text-gray-500 truncate max-w-xs">{{ result.front }}</span>
            </div>

            <div v-if="result.additions.length" class="pl-4 border-l-2 border-gray-200 space-y-1 mt-2">
              <div v-for="(addition, addIndex) in result.additions" :key="addIndex" class="text-sm">
                <span class="font-medium text-gray-700">{{ addition.front }}</span>
                <span class="text-gray-500 ml-2">{{ addition.back }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useAIStore } from '@/stores/ai'
import { ChunkRecord, useRecordStore } from '@/stores/record'
import { aiService } from '@/services/aiService'
import { marked } from 'marked'

const aiStore = useAIStore()
const recordStore = useRecordStore()
const notesInput = ref('')

const processingState = computed(() => aiStore.processingState)

const noteCount = computed(() => {
  if (!notesInput.value) return 0

  return notesInput.value
    .split('\n')
    .filter(line => {
      const trimmed = line.trim()
      return trimmed && !trimmed.startsWith('#') && !trimmed.startsWith('//')
    })
    .length
})

const canProcess = computed(() => {
  return aiStore.config.enabled && aiStore.config.apiKey && noteCount.value > 0
})

const hasResults = computed(() => {
  return processingState.value.results.length > 0
})

const progressPercentage = computed(() => {
  if (processingState.value.totalCount === 0) return 0
  return (processingState.value.processedCount / processingState.value.totalCount) * 100
})

async function processNotes() {
  if (!canProcess.value) return

  const notes = notesInput.value.split('\n')

  try {
    await aiService.processNotesBatch(notes)
  } catch (error) {
    console.error('Process notes error:', error)
  }
}

async function applyResults() {
  if (!hasResults.value) return

  for (const result of processingState.value.results) {
    // 转换markdown为HTML
    const front = await marked.parse(result.front) || ''
    const back = await marked.parse(result.back) || ''

    // 清空原有additions并添加新的
    const additions = []
    for (const addition of result.additions) {
      additions.push({
        id: crypto.randomUUID(),
        icon: '→',
        front: await marked.parse(addition.front) || '',
        back: await marked.parse(addition.back) || ''
      })
    }

    recordStore.chunkDocument.records.push(new ChunkRecord(
      crypto.randomUUID(),
      "1", // TODO
      front,
      back,
      additions
    ))
  }

  recordStore.save_document()
}

function clearResults() {
  aiStore.resetProcessingState()
  notesInput.value = ''
}
</script>

<style scoped>
/* 所有样式已迁移到Tailwind CSS类 */
</style>
