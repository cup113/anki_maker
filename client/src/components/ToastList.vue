<script lang="ts" setup>
import { ToastRoot, ToastTitle, ToastDescription, ToastViewport, ToastProvider } from 'reka-ui';
import { useToastsStore } from '@/stores/toasts';

const toastsStore = useToastsStore();
</script>

<template>
    <section>
        <ToastProvider>
            <ToastRoot v-for="toast in toastsStore.toasts" :key="toast.id"
                class="flex flex-col gap-1 bg-white shadow-lg p-3 border-secondary-200 border-2 rounded-lg transition-opacity"
                :style="{ opacity: toast.opacity }">
                <ToastTitle class="font-bold text-primary-700">{{ toast.title }}</ToastTitle>
                <ToastDescription class="text-sm text-secondary-700">{{ toast.message }}</ToastDescription>
            </ToastRoot>
            <ToastViewport
                class="fixed bottom-0 right-0 flex flex-col-reverse p-3 gap-2 w-96 m-0 list-none z-50 outline-none" />
        </ToastProvider>
    </section>
</template>
