<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink, RouterView, useRoute } from 'vue-router'

import ShortcutHelp from './components/ShortcutHelp.vue'
import ToastList from './components/ToastList.vue'

const route = useRoute()

// 顶栏本来用 active-class，但那套类名和 text-muted 抢同一个属性，
// Tailwind 4 里谁后生成谁赢，选中态就再也没出现过。按路由算，只留一个颜色类。
const links = computed(() => [
  { to: '/', label: 'Home', active: route.name === 'home' },
  { to: '/files', label: 'Files', active: route.name === 'files' },
  { to: '/ai', label: 'AI', active: route.path.startsWith('/ai') },
])
</script>

<template>
  <div class="min-h-screen bg-canvas">
    <div
      class="mx-auto flex min-h-screen w-full max-w-[820px] flex-col border-x border-rule bg-paper"
    >
      <header class="flex items-center gap-3 px-4 py-4 sm:px-8">
        <RouterLink to="/" class="flex items-center gap-2">
          <span class="h-3.5 w-2.5 rounded-[1px_5px_1px_1px] bg-ink"></span>
          <span class="font-book text-[15px] tracking-tight">Anki Linguist</span>
        </RouterLink>

        <nav class="ml-auto flex items-center gap-3 text-[11px]">
          <RouterLink
            v-for="link in links"
            :key="link.to"
            :to="link.to"
            class="border-b pb-px transition-colors"
            :class="
              link.active ? 'border-ink text-ink' : 'border-transparent text-muted hover:text-ink'
            "
          >
            {{ link.label }}
          </RouterLink>
        </nav>

        <ShortcutHelp />
      </header>

      <div class="flex-1">
        <RouterView />
      </div>

      <footer
        class="border-t border-rule px-4 py-4 text-center font-book text-[11px] text-muted sm:px-8"
      >
        <span>cup11 © 2025</span>
        <span class="mx-1.5 text-rule-strong">·</span>
        <a class="paper-link" href="https://github.com/cup113/anki-linguist">GitHub</a>
      </footer>
    </div>

    <ToastList />
  </div>
</template>
