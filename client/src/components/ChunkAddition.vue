<script lang="ts" setup>
import { computed } from 'vue'
import { useRecordStore } from '@/stores/record'
import DeleteIcon from './Icon/DeleteIcon.vue'
import SimpleChoice from './SimpleChoice.vue'
import TiptapEditor from './TiptapEditor.vue'

const props = defineProps<{
  chunkId: string
  additionId: string
}>()

const recordStore = useRecordStore()

const addition = computed(() => {
  return recordStore.chunkDocument.find_addition(props.chunkId, props.additionId)
})
</script>

<template>
  <div
    :data-addition-id="addition.id"
    class="col-span-full grid grid-cols-subgrid border-t border-dashed border-rule"
  >
    <div class="pb-3 pl-1 pt-3">
      <SimpleChoice v-model="addition.icon" />
    </div>

    <div class="min-w-0 pb-3 pr-4 pt-2.5 text-right text-[12.5px] leading-[1.6] sm:pr-5 sm:text-[14px]">
      <TiptapEditor v-model="addition.front" placeholder="附加（提示）" />
    </div>

    <div
      class="min-w-0 border-l border-dashed border-rule-strong pb-3 pl-4 pt-2.5 text-[12.5px] leading-[1.6] sm:pl-5 sm:text-[14px]"
    >
      <TiptapEditor
        v-model="addition.back"
        placeholder="附加（答案）"
        class="italic text-muted focus-within:text-ink"
      />
    </div>

    <div class="flex items-center justify-center">
      <button
        type="button"
        class="grid h-7 w-7 place-items-center rounded-full text-muted opacity-40 transition-colors hover:bg-[#ece8df] hover:text-ink focus-visible:opacity-100"
        aria-label="删除附加条目"
        @click="recordStore.chunkDocument.delete_addition(chunkId, additionId)"
      >
        <DeleteIcon class="h-3 w-3" />
      </button>
    </div>
  </div>
</template>
