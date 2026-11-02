<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'
import ShortcutHelp from './components/ShortcutHelp.vue'
import ToastList from './components/ToastList.vue'
</script>

<template>
  <div class="min-h-screen bg-canvas">
    <div class="mx-auto flex min-h-screen w-full max-w-[820px] flex-col border-x border-rule bg-paper">
      <header class="flex items-center gap-3 px-4 py-4 sm:px-8">
        <RouterLink to="/" class="flex items-center gap-2">
          <span class="h-3.5 w-2.5 rounded-[1px_5px_1px_1px] bg-ink"></span>
          <span class="font-book text-[15px] tracking-tight">Anki Linguist</span>
        </RouterLink>

        <nav class="ml-auto flex items-center gap-3 text-[11px]">
          <RouterLink
            to="/"
            class="border-b border-transparent pb-px text-muted transition-colors hover:text-ink"
            exact-active-class="border-ink text-ink"
          >
            Home
          </RouterLink>
          <RouterLink
            to="/files"
            class="border-b border-transparent pb-px text-muted transition-colors hover:text-ink"
            active-class="border-ink text-ink"
          >
            Files
          </RouterLink>
        </nav>

        <ShortcutHelp />
      </header>

      <div class="flex-1">
        <RouterView />
      </div>

      <footer class="border-t border-rule px-4 py-4 text-center font-book text-[11px] text-muted sm:px-8">
        <span>cup11 © 2025</span>
        <span class="mx-1.5 text-rule-strong">·</span>
        <a class="paper-link" href="https://github.com/cup113/anki-linguist">GitHub</a>
      </footer>
    </div>

    <ToastList />
  </div>
</template>
