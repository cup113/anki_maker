<script setup lang="ts">
import { computed, nextTick, ref } from 'vue'
import { onKeyStroke, useEventListener } from '@vueuse/core'
import {
  PopoverContent,
  PopoverPortal,
  PopoverRoot,
  PopoverTrigger,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectItemIndicator,
  SelectItemText,
  SelectPortal,
  SelectRoot,
  SelectTrigger,
  SelectValue,
  SelectViewport,
} from 'reka-ui'

import ChunkItem from '@/components/ChunkItem.vue'
import TiptapEditor from '@/components/TiptapEditor.vue'
import { deckTypes, useRecordStore } from '@/stores/record'

const recordStore = useRecordStore()

const formats = [
  { value: 'json', label: 'JSON', hint: '文档数据' },
  { value: 'word', label: 'Word', hint: '文档格式' },
  { value: 'apkg', label: 'APKG', hint: 'Anki 卡组' },
] as const

type ExportStatus = 'busy' | 'done'
const export_status = ref<Record<string, ExportStatus>>({})

const count = computed(() => recordStore.chunkDocument.records.length)

function hint_for(format: { value: string; hint: string }) {
  const status = export_status.value[format.value]
  if (status === 'busy') return '生成中…'
  if (status === 'done') return '已下载'
  return format.hint
}

async function run_export(value: (typeof formats)[number]['value']) {
  if (value !== 'json') {
    export_status.value[value] = 'busy'
  }
  await recordStore.export_format(value)
  export_status.value[value] = 'done'
}

function focus_editable(selector: string) {
  void nextTick(() => {
    const host = document.querySelector(selector)
    const editable = host?.querySelector('[contenteditable="true"]')
    if (editable instanceof HTMLElement) {
      editable.focus()
    }
  })
}

function add_chunk() {
  recordStore.chunkDocument.add_record()
  const records = recordStore.chunkDocument.records
  const last = records[records.length - 1]
  if (last) {
    focus_editable(`[data-chunk-id="${last.id}"]`)
  }
}

onKeyStroke('s', (event) => {
  if (event.ctrlKey || event.metaKey) {
    event.preventDefault()
    recordStore.save_document()
  }
})

// 一个监听服务所有格子：Enter 换行交给编辑器，Ctrl/⌘ + Enter 新建词条，
// Alt + Enter 加附加条目。组字期的回车必须放行，否则选字会凭空多一条。
useEventListener(document, 'keydown', (event: KeyboardEvent) => {
  if (event.key !== 'Enter') return
  if (event.isComposing || event.keyCode === 229) return
  if (!event.ctrlKey && !event.metaKey && !event.altKey) return

  const host = (event.target as HTMLElement | null)?.closest?.('[data-chunk-id]')
  const chunk_id = host?.getAttribute('data-chunk-id')
  if (!chunk_id) return

  event.preventDefault()

  if (event.altKey) {
    const addition_id = recordStore.chunkDocument.add_addition(chunk_id)
    focus_editable(`[data-addition-id="${addition_id}"]`)
  } else {
    const record_id = recordStore.chunkDocument.add_record_after(chunk_id)
    focus_editable(`[data-chunk-id="${record_id}"]`)
  }
})
</script>

<template>
  <main class="px-4 pb-6 sm:px-8">
    <section class="border-b border-rule pb-4 pt-1 text-center">
      <input
        v-model="recordStore.chunkDocument.title"
        type="text"
        placeholder="未命名文档"
        class="w-full bg-transparent text-center font-book text-[26px] leading-tight tracking-tight outline-none placeholder:text-rule-strong sm:text-[32px]"
      />

      <div class="mt-2 flex items-center justify-center gap-5 text-[11.5px] text-muted">
        <SelectRoot v-model="recordStore.chunkDocument.deckType">
          <SelectTrigger
            class="paper-link flex items-center gap-1 pb-px text-muted transition-colors hover:text-ink focus:outline-none"
          >
            <SelectValue placeholder="选择卡组类型" />
            <span class="text-[8px] opacity-60">▾</span>
          </SelectTrigger>

          <SelectPortal>
            <SelectContent
              :side-offset="6"
              class="z-50 min-w-[128px] rounded-[2px] border border-rule-strong bg-paper p-1 shadow-[0_6px_18px_rgba(45,42,38,0.10)]"
            >
              <SelectViewport>
                <SelectGroup>
                  <SelectItem
                    v-for="deck_type in deckTypes"
                    :key="deck_type.value"
                    :value="deck_type.value"
                    class="flex cursor-pointer items-center rounded-[2px] px-2.5 py-1.5 text-[12.5px] text-muted outline-none data-[highlighted]:bg-wash data-[highlighted]:text-ink"
                  >
                    <SelectItemIndicator class="mr-1.5 text-ink" />
                    <SelectItemText>{{ deck_type.label }}</SelectItemText>
                  </SelectItem>
                </SelectGroup>
              </SelectViewport>
            </SelectContent>
          </SelectPortal>
        </SelectRoot>

        <span class="tabular-nums">{{ count }} 条</span>

        <button
          type="button"
          class="paper-link pb-px transition-colors hover:text-ink"
          @click="recordStore.save_document()"
        >
          保存
        </button>
      </div>
    </section>

    <ol>
      <ChunkItem
        v-for="(record, index) in recordStore.chunkDocument.records"
        :key="record.id"
        :chunk-id="record.id"
        :index="index"
      />
    </ol>

    <section class="pb-1 pt-4">
      <div class="mx-auto mb-3 h-px w-11 bg-rule-strong"></div>
      <TiptapEditor
        v-model="recordStore.chunkDocument.footer"
        placeholder="页脚注记：例句、语法提示…"
        class="text-center text-[12.5px] italic text-muted"
      />
    </section>

    <section class="flex justify-center gap-3.5 py-5">
      <button
        type="button"
        class="grid h-10 w-10 place-items-center rounded-full border border-rule-strong text-[18px] leading-none text-muted transition-colors hover:border-ink hover:text-ink focus:outline-none focus-visible:border-ink"
        aria-label="添加词条"
        @click="add_chunk"
      >
        +
      </button>

      <PopoverRoot>
        <PopoverTrigger
          class="grid h-10 w-10 place-items-center rounded-full border border-rule-strong text-[16px] leading-none text-muted transition-colors hover:border-ink hover:text-ink focus:outline-none focus-visible:border-ink"
          aria-label="导出"
        >
          ↓
        </PopoverTrigger>

        <PopoverPortal>
          <PopoverContent
            align="center"
            :side-offset="6"
            class="z-50 w-[272px] rounded-[2px] border border-rule-strong bg-paper shadow-[0_6px_18px_rgba(45,42,38,0.10)]"
          >
            <div
              class="border-b border-rule px-3 py-2 text-[9.5px] uppercase tracking-[0.14em] text-faint"
            >
              导出
            </div>

            <button
              v-for="format in formats"
              :key="format.value"
              type="button"
              class="flex w-full items-center gap-2 px-3 py-2 text-left transition-colors hover:bg-wash"
              @click="run_export(format.value)"
            >
              <span class="font-book text-[12.5px]">{{ format.label }}</span>
              <span class="ml-auto text-[11px] text-muted">{{ hint_for(format) }}</span>
            </button>
          </PopoverContent>
        </PopoverPortal>
      </PopoverRoot>
    </section>
  </main>
</template>
