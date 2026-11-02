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
  <main class="px-4 py-20 sm:px-8">
    <div v-if="loading" class="flex flex-col items-center gap-3">
      <div class="h-6 w-6 animate-spin rounded-full border border-rule-strong border-t-ink"></div>
      <p class="text-[12.5px] text-muted">正在加载草稿…</p>
    </div>

    <div v-else-if="error" class="text-center">
      <p class="text-[12.5px] text-muted">{{ error }}</p>
      <router-link
        to="/"
        class="paper-link mt-5 inline-block text-[12.5px] text-muted transition-colors hover:text-ink"
      >
        返回首页
      </router-link>
    </div>
  </main>
</template>
