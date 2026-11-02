<script lang="ts" setup>
import { ToastRoot, ToastTitle, ToastDescription, ToastViewport, ToastProvider } from 'reka-ui'
import { useToastsStore } from '@/stores/toasts'

const toastsStore = useToastsStore()
</script>

<template>
  <ToastProvider>
    <ToastRoot
      v-for="toast in toastsStore.toasts"
      :key="toast.id"
      class="flex flex-col gap-0.5 rounded-[2px] border border-rule-strong bg-paper px-3 py-2 shadow-[0_4px_14px_rgba(45,42,38,0.08)] transition-opacity"
      :style="{ opacity: toast.opacity }"
    >
      <ToastTitle class="text-[12px] text-ink">{{ toast.title }}</ToastTitle>
      <ToastDescription class="text-[11px] text-muted">{{ toast.message }}</ToastDescription>
    </ToastRoot>

    <ToastViewport
      class="fixed bottom-0 right-0 z-50 m-0 flex w-80 list-none flex-col-reverse gap-2 p-3 outline-none"
    />
  </ToastProvider>
</template>
