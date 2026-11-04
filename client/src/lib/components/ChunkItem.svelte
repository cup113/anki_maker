<script lang="ts">
  import { record_store } from '$lib/stores/record.svelte'
  import * as model from '$lib/model'

  import ChunkAddition from './ChunkAddition.svelte'
  import Popover from './Popover.svelte'
  import SimpleChoice from './SimpleChoice.svelte'
  import TiptapEditor from './TiptapEditor.svelte'

  let { index, chunk_id }: { index: number; chunk_id: string } = $props()

  let menu_open = $state(false)

  const chunk = $derived(model.find_record(record_store.doc, chunk_id))
  const position = $derived(String(index + 1).padStart(2, '0'))

  function add_addition() {
    model.add_addition(record_store.doc, chunk_id)
    menu_open = false
  }

  function remove_chunk() {
    model.delete_record(record_store.doc, chunk_id)
    menu_open = false
  }
</script>

<li
  data-chunk-id={chunk.id}
  class="group grid grid-cols-[28px_minmax(0,1fr)_minmax(0,1fr)_32px] items-stretch border-b border-rule transition-colors hover:bg-wash focus-within:bg-wash sm:grid-cols-[38px_minmax(0,1fr)_minmax(0,1fr)_34px]"
>
  <div class="flex flex-col items-start gap-0.5 py-4">
    <span class="font-book text-[11px] italic text-muted">{position}</span>
    <SimpleChoice bind:value={chunk.level} />
  </div>

  <div class="min-w-0 py-4 pr-4 text-right text-[15px] leading-[1.6] sm:pr-5 sm:text-[18px]">
    <TiptapEditor bind:value={chunk.front} placeholder="正面（提示）" />
  </div>

  <div
    class="min-w-0 border-l border-dashed border-rule-strong py-4 pl-4 text-[15.5px] leading-[1.6] sm:pl-5 sm:text-[19px]"
  >
    <TiptapEditor
      bind:value={chunk.back}
      placeholder="反面（答案）"
      class="italic text-muted focus-within:text-ink"
    />
  </div>

  <div class="flex items-center justify-center">
    <Popover bind:open={menu_open} align="end">
      {#snippet trigger(toggle)}
        <button
          type="button"
          class="grid h-7 w-7 place-items-center rounded-full text-[14px] leading-none text-muted opacity-40 transition hover:bg-[#ece8df] hover:text-ink group-hover:opacity-100 focus:outline-none focus-visible:opacity-100"
          aria-label="词条菜单"
          onclick={toggle}
        >
          ⋯
        </button>
      {/snippet}

      {#snippet panel()}
        <div
          class="w-36 rounded-[2px] border border-rule-strong bg-paper p-1 shadow-[0_6px_18px_rgba(45,42,38,0.10)]"
        >
          <button
            type="button"
            class="block w-full rounded-[2px] px-2.5 py-1.5 text-left text-[12.5px] text-muted transition-colors hover:bg-wash hover:text-ink"
            onclick={add_addition}
          >
            添加附加条目
          </button>
          <button
            type="button"
            class="block w-full rounded-[2px] px-2.5 py-1.5 text-left text-[12.5px] text-muted transition-colors hover:bg-wash hover:text-ink"
            onclick={remove_chunk}
          >
            删除词条
          </button>
        </div>
      {/snippet}
    </Popover>
  </div>

  {#each chunk.additions as addition (addition.id)}
    <ChunkAddition chunk_id={chunk.id} addition_id={addition.id} />
  {/each}
</li>
