<script lang="ts">
  import { tick } from 'svelte'

  import ChunkItem from '$lib/components/ChunkItem.svelte'
  import Popover from '$lib/components/Popover.svelte'
  import TiptapEditor from '$lib/components/TiptapEditor.svelte'
  import * as model from '$lib/model'
  import { record_store } from '$lib/stores/record.svelte'

  const formats = [
    { value: 'json', label: 'JSON', hint: '文档数据' },
    { value: 'word', label: 'Word', hint: '文档格式' },
    { value: 'apkg', label: 'APKG', hint: 'Anki 卡组' },
  ] as const

  type ExportStatus = 'busy' | 'done'

  let export_status = $state<Record<string, ExportStatus>>({})
  let deck_open = $state(false)
  let export_open = $state(false)

  const doc = $derived(record_store.doc)
  const count = $derived(doc.records.length)
  const deck_label = $derived(
    model.deckTypes.find((item) => item.value === doc.deckType)?.label ?? '选择卡组类型',
  )

  function hint_for(format: (typeof formats)[number]) {
    const status = export_status[format.value]
    if (status === 'busy') return '生成中…'
    if (status === 'done') return '已下载'
    return format.hint
  }

  async function run_export(value: (typeof formats)[number]['value']) {
    if (value !== 'json') {
      export_status[value] = 'busy'
    }
    await record_store.export_format(value)
    export_status[value] = 'done'
  }

  async function focus_editable(selector: string) {
    await tick()
    const host = document.querySelector(selector)
    const editable = host?.querySelector('[contenteditable="true"]')
    if (editable instanceof HTMLElement) {
      editable.focus()
    }
  }

  function add_chunk() {
    model.add_record(record_store.doc)
    const records = record_store.doc.records
    const last = records[records.length - 1]
    if (last) void focus_editable(`[data-chunk-id="${last.id}"]`)
  }

  function choose_deck(value: typeof doc.deckType) {
    record_store.doc.deckType = value
    deck_open = false
  }

  // 一个监听服务所有格子：Enter 换行交给编辑器，Ctrl/⌘ + Enter 新建词条，
  // Alt + Enter 加附加条目。组字期的回车必须放行，否则选字会凭空多一条。
  function on_keydown(event: KeyboardEvent) {
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 's') {
      event.preventDefault()
      record_store.save_document()
      return
    }

    if (event.key !== 'Enter') return
    if (event.isComposing || event.keyCode === 229) return
    if (!event.ctrlKey && !event.metaKey && !event.altKey) return

    const host = (event.target as HTMLElement | null)?.closest?.('[data-chunk-id]')
    const chunk_id = host?.getAttribute('data-chunk-id')
    if (!chunk_id) return

    event.preventDefault()

    if (event.altKey) {
      const addition_id = model.add_addition(record_store.doc, chunk_id)
      void focus_editable(`[data-addition-id="${addition_id}"]`)
    } else {
      const record_id = model.add_record_after(record_store.doc, chunk_id)
      void focus_editable(`[data-chunk-id="${record_id}"]`)
    }
  }
</script>

<svelte:window onkeydown={on_keydown} />

<main class="px-4 pb-6 sm:px-8">
  <section class="border-b border-rule pb-4 pt-1 text-center">
    <input
      bind:value={record_store.doc.title}
      type="text"
      placeholder="未命名文档"
      class="w-full bg-transparent text-center font-book text-[26px] leading-tight tracking-tight outline-none placeholder:text-rule-strong sm:text-[32px]"
    />

    <div class="mt-2 flex items-center justify-center gap-5 text-[11.5px] text-muted">
      <Popover bind:open={deck_open}>
        {#snippet trigger(toggle)}
          <button
            type="button"
            class="paper-link flex items-center gap-1 pb-px text-muted transition-colors hover:text-ink focus:outline-none"
            onclick={toggle}
          >
            {deck_label}
            <span class="text-[8px] opacity-60">▾</span>
          </button>
        {/snippet}

        {#snippet panel()}
          <div
            class="min-w-[128px] rounded-[2px] border border-rule-strong bg-paper p-1 shadow-[0_6px_18px_rgba(45,42,38,0.10)]"
          >
            {#each model.deckTypes as deck_type (deck_type.value)}
              <button
                type="button"
                class="flex w-full cursor-pointer items-center rounded-[2px] px-2.5 py-1.5 text-left text-[12.5px] transition-colors hover:bg-wash {deck_type.value ===
                doc.deckType
                  ? 'text-ink'
                  : 'text-muted'}"
                onclick={() => choose_deck(deck_type.value)}
              >
                {deck_type.label}
              </button>
            {/each}
          </div>
        {/snippet}
      </Popover>

      <span class="tabular-nums">{count} 条</span>

      <button
        type="button"
        class="paper-link pb-px transition-colors hover:text-ink"
        onclick={() => record_store.save_document()}
      >
        保存
      </button>
    </div>
  </section>

  <ol>
    {#each doc.records as record, index (record.id)}
      <ChunkItem {index} chunk_id={record.id} />
    {/each}
  </ol>

  <section class="pb-1 pt-4">
    <div class="mx-auto mb-3 h-px w-11 bg-rule-strong"></div>
    <TiptapEditor
      bind:value={doc.footer}
      placeholder="页脚注记：例句、语法提示…"
      class="text-center text-[12.5px] italic text-muted"
    />
  </section>

  <section class="flex justify-center gap-3.5 py-5">
    <button
      type="button"
      class="grid h-10 w-10 place-items-center rounded-full border border-rule-strong text-[18px] leading-none text-muted transition-colors hover:border-ink hover:text-ink focus:outline-none focus-visible:border-ink"
      aria-label="添加词条"
      onclick={add_chunk}
    >
      +
    </button>

    <Popover bind:open={export_open} align="center">
      {#snippet trigger(toggle)}
        <button
          type="button"
          class="grid h-10 w-10 place-items-center rounded-full border border-rule-strong text-[16px] leading-none text-muted transition-colors hover:border-ink hover:text-ink focus:outline-none focus-visible:border-ink"
          aria-label="导出"
          onclick={toggle}
        >
          ↓
        </button>
      {/snippet}

      {#snippet panel()}
        <div
          class="w-[272px] rounded-[2px] border border-rule-strong bg-paper shadow-[0_6px_18px_rgba(45,42,38,0.10)]"
        >
          <div
            class="border-b border-rule px-3 py-2 text-[9.5px] uppercase tracking-[0.14em] text-faint"
          >
            导出
          </div>

          {#each formats as format (format.value)}
            <button
              type="button"
              class="flex w-full items-center gap-2 px-3 py-2 text-left transition-colors hover:bg-wash"
              onclick={() => run_export(format.value)}
            >
              <span class="font-book text-[12.5px]">{format.label}</span>
              <span class="ml-auto text-[11px] text-muted">{hint_for(format)}</span>
            </button>
          {/each}
        </div>
      {/snippet}
    </Popover>
  </section>
</main>
