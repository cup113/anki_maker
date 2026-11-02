<script lang="ts" setup>
import { computed, ref } from 'vue'
import { PopoverContent, PopoverPortal, PopoverRoot, PopoverTrigger } from 'reka-ui'
import { useRecordStore } from '@/stores/record'
import ChunkAddition from './ChunkAddition.vue'
import SimpleChoice from './SimpleChoice.vue'
import TiptapEditor from './TiptapEditor.vue'

const props = defineProps<{
  index: number
  chunkId: string
}>()

const recordStore = useRecordStore()
const menu_open = ref(false)

const chunk = computed(() => {
  return recordStore.chunkDocument.find_record(props.chunkId)
})

const index = computed(() => {
  return (props.index + 1).toString().padStart(2, '0')
})

function add_addition() {
  recordStore.chunkDocument.add_addition(props.chunkId)
  menu_open.value = false
}

function remove_chunk() {
  recordStore.chunkDocument.delete_record(props.chunkId)
  menu_open.value = false
}
</script>

<template>
  <li
    :data-chunk-id="chunk.id"
    class="group grid grid-cols-[28px_minmax(0,1fr)_minmax(0,1fr)_32px] items-stretch border-b border-rule transition-colors hover:bg-wash focus-within:bg-wash sm:grid-cols-[38px_minmax(0,1fr)_minmax(0,1fr)_34px]"
  >
    <div class="flex flex-col items-start gap-0.5 py-4">
      <span class="font-book text-[11px] italic text-muted">{{ index }}</span>
      <SimpleChoice v-model="chunk.level" />
    </div>

    <div class="min-w-0 py-4 pr-4 text-right text-[15px] leading-[1.6] sm:pr-5 sm:text-[18px]">
      <TiptapEditor v-model="chunk.front" placeholder="正面（提示）" />
    </div>

    <div
      class="min-w-0 border-l border-dashed border-rule-strong py-4 pl-4 text-[15.5px] leading-[1.6] sm:pl-5 sm:text-[19px]"
    >
      <TiptapEditor
        v-model="chunk.back"
        placeholder="反面（答案）"
        class="italic text-muted focus-within:text-ink"
      />
    </div>

    <div class="flex items-center justify-center">
      <PopoverRoot v-model:open="menu_open">
        <PopoverTrigger
          class="grid h-7 w-7 place-items-center rounded-full text-[14px] leading-none text-muted opacity-40 transition hover:bg-[#ece8df] hover:text-ink group-hover:opacity-100 focus:outline-none focus-visible:opacity-100"
          aria-label="词条菜单"
        >
          ⋯
        </PopoverTrigger>

        <PopoverPortal>
          <PopoverContent
            align="end"
            :side-offset="4"
            class="z-50 w-36 rounded-[2px] border border-rule-strong bg-paper p-1 shadow-[0_6px_18px_rgba(45,42,38,0.10)]"
          >
            <button
              type="button"
              class="block w-full rounded-[2px] px-2.5 py-1.5 text-left text-[12.5px] text-muted transition-colors hover:bg-wash hover:text-ink"
              @click="add_addition"
            >
              添加附加条目
            </button>
            <button
              type="button"
              class="block w-full rounded-[2px] px-2.5 py-1.5 text-left text-[12.5px] text-muted transition-colors hover:bg-wash hover:text-ink"
              @click="remove_chunk"
            >
              删除词条
            </button>
          </PopoverContent>
        </PopoverPortal>
      </PopoverRoot>
    </div>

    <ChunkAddition
      v-for="addition in chunk.additions"
      :key="addition.id"
      :chunk-id="chunk.id"
      :addition-id="addition.id"
    />
  </li>
</template>
