<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useRecordStore, ChunkDocument } from '@/stores/record'
import { useToastsStore } from '@/stores/toasts'
import dayjs from 'dayjs'

const route = useRoute()
const router = useRouter()
const recordStore = useRecordStore()
const toastsStore = useToastsStore()

const loading = ref(true)
const error = ref('')

onMounted(async () => {
  const draftId = route.params.id as string
  if (!draftId) {
    error.value = '无效的草稿 ID'
    loading.value = false
    return
  }

  try {
    const res = await fetch(`/api/drafts/${draftId}`)
    if (!res.ok) {
      if (res.status === 404) {
        error.value = '草稿不存在或已过期'
      } else {
        error.value = `加载失败 (${res.status})`
      }
      loading.value = false
      return
    }

    const data = await res.json()
    const doc = ChunkDocument.fromJSON(data)
    recordStore.loadDocumentFromDraft(doc)
    toastsStore.add_toast('草稿加载成功', `(${dayjs().format('HH:mm:ss')}) ${doc.title}`)
    router.replace('/')
  } catch {
    error.value = '网络错误，无法加载草稿'
    loading.value = false
  }
})
</script>

<template>
  <main class="p-6 max-w-6xl mx-auto">
    <div v-if="loading" class="flex flex-col items-center justify-center py-24">
      <div class="w-10 h-10 border-4 border-primary-300 border-t-primary-600 rounded-full animate-spin mb-4"></div>
      <p class="text-secondary-600 text-lg">正在加载草稿...</p>
    </div>
    <div v-else-if="error" class="bg-white rounded-xl shadow-md p-8 text-center">
      <div class="text-5xl mb-4 text-secondary-300">📄</div>
      <h2 class="text-2xl font-bold text-secondary-700 mb-2">无法加载草稿</h2>
      <p class="text-secondary-500 mb-6">{{ error }}</p>
      <router-link to="/"
        class="inline-block px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium shadow-md">
        返回首页
      </router-link>
    </div>
  </main>
</template>
