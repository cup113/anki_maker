<script lang="ts">
  import { record_store } from '$lib/stores/record.svelte'
  import * as model from '$lib/model'

  import Icon from './Icon.svelte'
  import SimpleChoice from './SimpleChoice.svelte'
  import TiptapEditor from './TiptapEditor.svelte'

  let { chunk_id, addition_id }: { chunk_id: string; addition_id: string } = $props()

  const addition = $derived(model.find_addition(record_store.doc, chunk_id, addition_id))
</script>

<div
  data-addition-id={addition.id}
  class="col-span-full grid grid-cols-subgrid border-t border-dashed border-rule"
>
  <div class="pb-3 pl-1 pt-3">
    <SimpleChoice bind:value={addition.icon} />
  </div>

  <div
    class="min-w-0 pb-3 pr-4 pt-2.5 text-right text-[12.5px] leading-[1.6] sm:pr-5 sm:text-[14px]"
  >
    <TiptapEditor bind:value={addition.front} placeholder="附加（提示）" />
  </div>

  <div
    class="min-w-0 border-l border-dashed border-rule-strong pb-3 pl-4 pt-2.5 text-[12.5px] leading-[1.6] sm:pl-5 sm:text-[14px]"
  >
    <TiptapEditor
      bind:value={addition.back}
      placeholder="附加（答案）"
      class="italic text-muted focus-within:text-ink"
    />
  </div>

  <div class="flex items-center justify-center">
    <button
      type="button"
      class="grid h-7 w-7 place-items-center rounded-full text-muted opacity-40 transition-colors hover:bg-[#ece8df] hover:text-ink focus-visible:opacity-100"
      aria-label="删除附加条目"
      onclick={() => model.delete_addition(record_store.doc, chunk_id, addition_id)}
    >
      <Icon name="delete" class="h-3 w-3" />
    </button>
  </div>
</div>
