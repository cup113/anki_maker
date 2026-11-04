<script lang="ts">
  import { page } from '$app/state'
  import CopyButton from '$lib/components/CopyButton.svelte'

  type Client = {
    id: string
    label: string
    where: string
    snippet?: string
  }

  const endpoint = $derived(`${page.url.origin}/mcp/sse`)

  const clients = $derived.by<Client[]>(() => [
    {
      id: 'claude-code',
      label: 'Claude Code',
      where: '在终端运行',
      snippet: `claude mcp add --transport sse anki ${endpoint}`,
    },
    {
      id: 'cursor',
      label: 'Cursor',
      where: '粘贴到 .cursor/mcp.json',
      snippet: `{
  "mcpServers": {
    "anki": { "url": "${endpoint}" }
  }
}`,
    },
    {
      id: 'claude-desktop',
      label: 'Claude Desktop',
      where: '粘贴到 claude_desktop_config.json',
      snippet: `{
  "mcpServers": {
    "anki": {
      "command": "npx",
      "args": ["-y", "mcp-remote", "${endpoint}"]
    }
  }
}`,
    },
    {
      id: 'other',
      label: '其他软件',
      where: '新建 SSE 连接',
    },
  ])

  let active = $state('claude-code')
  const client = $derived(clients.find((item) => item.id === active) ?? clients[0])
</script>

<section class="pt-5">
  <p class="text-[12.5px] leading-[1.75] text-muted">
    连上后，AI 能直接生成卡组和 Word，并给出编辑链接。
  </p>

  <div
    class="mt-5 flex items-end gap-5 overflow-x-auto overflow-y-hidden border-b border-rule text-[11.5px]"
  >
    {#each clients as item (item.id)}
      <button
        type="button"
        class="-mb-px shrink-0 border-b border-transparent pb-1.5 transition-colors focus:outline-none focus-visible:text-ink {item.id ===
        active
          ? 'border-ink text-ink'
          : 'text-muted hover:text-ink'}"
        onclick={() => (active = item.id)}
      >
        {item.label}
      </button>
    {/each}
  </div>

  <div class="mt-3 flex items-baseline gap-3">
    <span class="text-[10px] tracking-[0.08em] text-faint">{client.where}</span>
    {#if client.snippet}
      <CopyButton class="ml-auto" text={client.snippet!} />
    {/if}
  </div>

  {#if client.snippet}
    <pre
      class="fine-scroll mt-2 overflow-x-auto rounded-[2px] border border-rule bg-white px-3 py-2.5 font-mono text-[11px] leading-[1.8]">{client.snippet}</pre>
  {:else}
    <dl
      class="mt-2 grid grid-cols-[5.5rem_minmax(0,1fr)] items-center gap-y-2.5 rounded-[2px] border border-rule bg-white px-3 py-2.5 text-[12px]"
    >
      <dt class="text-[10px] tracking-[0.12em] text-faint">地址</dt>
      <dd class="flex min-w-0 items-center gap-3">
        <code class="truncate font-mono text-[11.5px]">{endpoint}</code>
        <CopyButton class="ml-auto" text={endpoint} />
      </dd>

      <dt class="text-[10px] tracking-[0.12em] text-faint">传输方式</dt>
      <dd><code class="font-mono text-[11.5px]">SSE</code></dd>
    </dl>
  {/if}

  <p class="mt-3 text-[11.5px] text-faint">
    重启客户端后，对 AI 说：帮我生成 10 张关于现在完成时的卡片。
  </p>
</section>
