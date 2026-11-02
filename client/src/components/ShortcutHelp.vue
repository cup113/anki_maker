<script setup lang="ts">
import { PopoverContent, PopoverPortal, PopoverRoot, PopoverTrigger } from 'reka-ui'

const shortcuts = [
  { label: '新建词条', keys: 'Ctrl / ⌘ + Enter' },
  { label: '行内换行', keys: 'Enter' },
  { label: '添加附加条目', keys: 'Alt + Enter' },
  { label: '保存', keys: 'Ctrl / ⌘ + S' },
  { label: '撤销（编辑器内）', keys: 'Ctrl / ⌘ + Z' },
  { label: '关闭面板', keys: 'Esc' },
]
</script>

<template>
  <PopoverRoot>
    <PopoverTrigger
      class="grid h-5 w-5 flex-none place-items-center rounded-full border border-rule-strong font-book text-[11px] leading-none text-muted transition-colors hover:border-ink hover:text-ink focus:outline-none focus-visible:border-ink"
      aria-label="快捷键"
    >
      ?
    </PopoverTrigger>

    <PopoverPortal>
      <PopoverContent
        align="end"
        :side-offset="8"
        class="z-50 w-[272px] rounded-[2px] border border-rule-strong bg-paper shadow-[0_6px_18px_rgba(45,42,38,0.10)]"
      >
        <div
          class="border-b border-rule px-3 py-2 text-[9.5px] uppercase tracking-[0.14em] text-faint"
        >
          快捷键
        </div>
        <dl class="py-1">
          <div
            v-for="item in shortcuts"
            :key="item.label"
            class="flex items-center justify-between gap-3 px-3 py-1.5"
          >
            <dt class="text-[12px] text-muted">{{ item.label }}</dt>
            <dd
              class="whitespace-nowrap rounded-[3px] border border-b-2 border-rule-strong bg-white px-1.5 py-px font-book text-[11px] text-ink"
            >
              {{ item.keys }}
            </dd>
          </div>
        </dl>
      </PopoverContent>
    </PopoverPortal>
  </PopoverRoot>
</template>
