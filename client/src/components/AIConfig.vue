<template>
  <div class="bg-white rounded-lg border border-gray-200 p-6 mb-6 shadow-sm">
    <h3 class="text-lg font-semibold text-gray-900 mb-4">AI 配置</h3>

    <div class="space-y-4">
      <div class="flex items-center justify-between">
        <label class="text-sm font-medium text-gray-700">启用AI功能</label>
        <input type="checkbox" v-model="config.enabled"
          class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2" />
      </div>

      <div v-if="config.enabled" class="bg-gray-50 rounded-lg p-4 space-y-4 border border-gray-200">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">API Base URL</label>
          <input type="text" v-model="config.baseUrl" placeholder="https://api.openai.com/v1"
            class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">API Key</label>
          <input type="password" v-model="config.apiKey" placeholder="输入OpenAI API密钥"
            class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">模型</label>
          <input type="text" v-model="config.model_name"
            class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">最大并发数</label>
          <input type="number" v-model="config.max_concurrent" min="1" max="10"
            class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
        </div>

        <button @click="saveConfig"
          class="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
          保存配置
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAIStore } from '@/stores/ai'
import { ref, watch } from 'vue'

const aiStore = useAIStore()
const config = ref({ ...aiStore.config })

watch(() => aiStore.config, (newConfig) => {
  config.value = { ...newConfig }
})

function saveConfig() {
  aiStore.updateConfig(config.value)
}
</script>
