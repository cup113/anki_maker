<script lang="ts">
  import dayjs from 'dayjs'

  import FileRow from '$lib/components/FileRow.svelte'
  import { dialogs } from '$lib/stores/dialogs.svelte'
  import { record_store } from '$lib/stores/record.svelte'
  import { toasts } from '$lib/stores/toasts.svelte'

  interface StoredDocument {
    records?: unknown[]
    createdAt?: string
    modifiedAt?: string
  }

  const items = $derived(
    record_store.titles.map((title) => {
      const stored = record_store.read_document(title) as StoredDocument | null
      return {
        title,
        amount: stored?.records?.length ?? 0,
        createdAt: stored?.createdAt ?? '',
        modifiedAt: stored?.modifiedAt ?? '',
      }
    }),
  )

  function load_document(title: string) {
    record_store.load_document(title)
    toasts.add_toast('文档加载成功', `(${dayjs().format('HH:mm:ss')}) ${title}`)
  }

  async function delete_document(title: string) {
    if (await dialogs.confirm(`确定删除「${title}」？`, '删除')) {
      record_store.delete_document(title)
    }
  }

  function import_document(event: Event) {
    const input = event.target as HTMLInputElement
    const file = input.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = async () => {
      input.value = ''
      const result = reader.result
      if (typeof result !== 'string') {
        await dialogs.alert('文件内容读不出来，换一个 JSON 试试。')
        return
      }
      try {
        await record_store.import_document(result)
      } catch (error) {
        await dialogs.alert(`导入失败：${String(error)}`)
      }
    }
    reader.readAsText(file)
  }
</script>

<main class="px-4 pb-8 sm:px-8">
  <section class="flex items-baseline gap-3 border-b border-rule pb-4 pt-2">
    <h1 class="font-book text-[26px] leading-tight tracking-tight sm:text-[30px]">文档</h1>
    <span class="ml-auto text-[11.5px] text-muted">{items.length} 份</span>
  </section>

  <table class="w-full border-collapse text-left">
    <thead>
      <tr class="border-b border-rule-strong text-[9.5px] uppercase tracking-[0.12em] text-faint">
        <th class="py-2 font-normal">文档</th>
        <th class="w-12 py-2 text-right font-normal">条数</th>
        <th class="hidden w-16 py-2 text-right font-normal sm:table-cell">创建</th>
        <th class="w-16 py-2 text-right font-normal">修改</th>
        <th class="w-9"></th>
      </tr>
    </thead>

    <tbody>
      {#each items as item (item.title)}
        <FileRow
          title={item.title}
          amount={item.amount}
          created={item.createdAt}
          modified={item.modifiedAt}
          onopen={() => load_document(item.title)}
          ondelete={() => delete_document(item.title)}
        />
      {/each}
    </tbody>
  </table>

  {#if items.length === 0}
    <p class="py-10 text-center text-[12.5px] text-muted">还没有保存过的文档</p>
  {/if}

  <div class="flex justify-center border-t border-rule py-4">
    <label
      class="paper-link cursor-pointer text-[12px] text-muted transition-colors hover:text-ink"
    >
      导入 JSON…
      <input type="file" accept="application/json" class="hidden" onchange={import_document} />
    </label>
  </div>
</main>
