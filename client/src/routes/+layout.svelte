<script lang="ts">
  import { onMount } from 'svelte'

  import { assets } from '$app/paths'
  import { page } from '$app/state'
  import '../app.css'
  import DialogHost from '$lib/components/DialogHost.svelte'
  import ShortcutHelp from '$lib/components/ShortcutHelp.svelte'
  import ToastList from '$lib/components/ToastList.svelte'
  import { record_store } from '$lib/stores/record.svelte'

  let { children } = $props()

  onMount(() => {
    record_store.init()
  })

  // 顶栏本来用 active-class，但那套类名和 text-muted 抢同一个属性，
  // Tailwind 4 里谁后生成谁赢，选中态就再也没出现过。按路径算，只留一个颜色类。
  const links = $derived([
    { href: '/', label: 'Home', active: page.url.pathname === '/' },
    { href: '/files', label: 'Files', active: page.url.pathname === '/files' },
    { href: '/ai', label: 'AI', active: page.url.pathname.startsWith('/ai') },
  ])
</script>

<div class="min-h-screen bg-canvas">
  <div
    class="mx-auto flex min-h-screen w-full max-w-[820px] flex-col border-x border-rule bg-paper"
  >
    <header class="flex items-center gap-3 px-4 py-4 sm:px-8">
      <a href="/" class="flex items-center gap-2">
        <img src="{assets}/favicon.svg" alt="" class="h-4 w-auto" />
        <span class="font-book text-[15px] tracking-tight">Anki Linguist</span>
      </a>

      <nav class="ml-auto flex items-center gap-3 text-[11px]">
        {#each links as link (link.href)}
          <a
            href={link.href}
            class="border-b pb-px transition-colors {link.active
              ? 'border-ink text-ink'
              : 'border-transparent text-muted hover:text-ink'}"
          >
            {link.label}
          </a>
        {/each}
      </nav>

      <ShortcutHelp />
    </header>

    <div class="flex-1">
      {@render children()}
    </div>

    <footer
      class="border-t border-rule px-4 py-4 text-center font-book text-[11px] text-muted sm:px-8"
    >
      <span>cup11 © 2025-2026</span>
      <span class="mx-1.5 text-rule-strong">·</span>
      <a class="paper-link" href="https://github.com/cup113/anki_maker">GitHub</a>
    </footer>
  </div>

  <ToastList />
  <DialogHost />
</div>
