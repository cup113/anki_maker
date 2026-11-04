<script lang="ts">
  import { page } from '$app/state'

  let { children } = $props()

  const tabs = [
    { href: '/ai/mcp', label: 'MCP 接入' },
    { href: '/ai/prompt', label: '提示词' },
  ] as const

  const path = $derived(page.url.pathname)
</script>

<main class="px-4 pb-10 sm:px-8">
  <section class="pt-2">
    <h1 class="font-book text-[26px] leading-tight tracking-tight sm:text-[30px]">AI</h1>

    <nav class="mt-3 flex gap-7 border-b border-rule">
      {#each tabs as tab (tab.href)}
        <a
          href={tab.href}
          class="-mb-px border-b-2 pb-2 text-[13px] transition-colors focus:outline-none {path ===
          tab.href
            ? 'border-ink text-ink'
            : 'border-transparent text-muted hover:text-ink'}"
        >
          {tab.label}
        </a>
      {/each}
    </nav>
  </section>

  {@render children()}
</main>
