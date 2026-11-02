<script setup lang="ts">
import { onBeforeUnmount, ref } from 'vue'

import { useToastsStore } from '@/stores/toasts'

const props = withDefaults(defineProps<{ text: string; label?: string }>(), { label: '复制' })

const toastsStore = useToastsStore()
const copied = ref(false)
let timer: ReturnType<typeof setTimeout> | undefined

// 非安全上下文（局域网 http）没有 clipboard API，退回选中复制
function copy_legacy(value: string) {
  const area = document.createElement('textarea')
  area.value = value
  area.setAttribute('readonly', '')
  area.style.position = 'fixed'
  area.style.opacity = '0'
  document.body.append(area)
  area.select()
  const done = document.execCommand('copy')
  area.remove()
  if (!done) throw new Error('copy rejected')
}

async function copy() {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(props.text)
    } else {
      copy_legacy(props.text)
    }
  } catch {
    toastsStore.add_toast('复制失败', '浏览器拒绝了剪贴板访问')
    return
  }

  copied.value = true
  clearTimeout(timer)
  timer = setTimeout(() => {
    copied.value = false
  }, 1600)
}

onBeforeUnmount(() => clearTimeout(timer))
</script>

<template>
  <button
    type="button"
    class="paper-link shrink-0 pb-px text-[11px] text-muted transition-colors hover:text-ink focus:outline-none focus-visible:text-ink"
    @click="copy"
  >
    {{ copied ? '已复制' : label }}
  </button>
</template>
