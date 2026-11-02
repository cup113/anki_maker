<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink, RouterView, useRoute } from 'vue-router'

const route = useRoute()

const tabs = [
  { name: 'ai-mcp', to: '/ai/mcp', label: 'MCP 接入' },
  { name: 'ai-prompt', to: '/ai/prompt', label: '提示词' },
] as const

const active = computed(() => route.name)
</script>

<template>
  <main class="px-4 pb-10 sm:px-8">
    <section class="pt-2">
      <h1 class="font-book text-[26px] leading-tight tracking-tight sm:text-[30px]">AI</h1>

      <nav class="mt-3 flex gap-7 border-b border-rule">
        <RouterLink
          v-for="tab in tabs"
          :key="tab.name"
          :to="tab.to"
          class="-mb-px border-b-2 pb-2 text-[13px] transition-colors focus:outline-none"
          :class="
            active === tab.name
              ? 'border-ink text-ink'
              : 'border-transparent text-muted hover:text-ink'
          "
        >
          {{ tab.label }}
        </RouterLink>
      </nav>
    </section>

    <RouterView />
  </main>
</template>
