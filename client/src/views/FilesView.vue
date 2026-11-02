<script lang="ts" setup>
import { computed } from 'vue'
import dayjs from 'dayjs'
import { PopoverContent, PopoverPortal, PopoverRoot, PopoverTrigger } from 'reka-ui'
import { useRecordStore } from '@/stores/record'
import { useToastsStore } from '@/stores/toasts'

const recordStore = useRecordStore()
const toastsStore = useToastsStore()

interface StoredDocument {
  records?: unknown[]
  createdAt?: string
  modifiedAt?: string
}

const items = computed(() => {
  return recordStore.recordStorageTitles.map((title) => {
    const document = recordStore.read_document(title) as StoredDocument | null
    return {
      title,
      amount: document?.records?.length ?? 0,
      createdAt: document?.createdAt ?? '',
      modifiedAt: document?.modifiedAt ?? '',
    }
  })
})

function format_date(value: string) {
  return value ? dayjs(value).format('MM-DD') : '—'
}

function delete_document(title: string) {
  if (confirm('确定删除该文档？')) {
    recordStore.delete_document(title)
  }
}

function load_document(title: string) {
  recordStore.load_document(title)
  toastsStore.add_toast('文档加载成功', `(${dayjs().format('HH:mm:ss')}) ${title}`)
}

function import_document(event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (!file) return

  const reader = new FileReader()
  reader.onload = () => {
    try {
      const result = reader.result
      if (typeof result !== 'string') {
        alert('文件内容格式不正确')
        return
      }
      recordStore.import_document(result)
    } catch (error) {
      alert('导入失败：文件格式不正确。' + String(error))
    }
  }
  reader.readAsText(file)
}
</script>

<template>
  <main class="px-4 pb-8 sm:px-8">
    <section class="flex items-baseline gap-3 border-b border-rule pb-4 pt-2">
      <h1 class="font-book text-[26px] leading-tight tracking-tight sm:text-[30px]">文档</h1>
      <span class="ml-auto text-[11.5px] text-muted">{{ items.length }} 份</span>
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
        <tr
          v-for="item in items"
          :key="item.title"
          class="border-b border-rule transition-colors hover:bg-wash"
        >
          <td class="py-3 pr-4">
            <button
              type="button"
              class="max-w-[46ch] truncate text-left font-book text-[15.5px] transition-colors hover:text-ink"
              :title="item.title"
              @click="load_document(item.title)"
            >
              {{ item.title }}
            </button>
          </td>
          <td class="py-3 text-right text-[11.5px] tabular-nums text-muted">{{ item.amount }}</td>
          <td class="hidden py-3 text-right text-[11.5px] tabular-nums text-muted sm:table-cell">
            {{ format_date(item.createdAt) }}
          </td>
          <td class="py-3 text-right text-[11.5px] tabular-nums text-muted">
            {{ format_date(item.modifiedAt) }}
          </td>
          <td class="py-3 text-right">
            <PopoverRoot>
              <PopoverTrigger
                class="ml-auto grid h-7 w-7 place-items-center rounded-full text-[14px] leading-none text-muted opacity-40 transition hover:bg-[#ece8df] hover:text-ink hover:opacity-100 focus:outline-none focus-visible:opacity-100"
                aria-label="文档菜单"
              >
                ⋯
              </PopoverTrigger>

              <PopoverPortal>
                <PopoverContent
                  align="end"
                  :side-offset="4"
                  class="z-50 w-28 rounded-[2px] border border-rule-strong bg-paper p-1 shadow-[0_6px_18px_rgba(45,42,38,0.10)]"
                >
                  <button
                    type="button"
                    class="block w-full rounded-[2px] px-2.5 py-1.5 text-left text-[12.5px] text-muted transition-colors hover:bg-wash hover:text-ink"
                    @click="load_document(item.title)"
                  >
                    打开
                  </button>
                  <button
                    type="button"
                    class="block w-full rounded-[2px] px-2.5 py-1.5 text-left text-[12.5px] text-muted transition-colors hover:bg-wash hover:text-ink"
                    @click="delete_document(item.title)"
                  >
                    删除
                  </button>
                </PopoverContent>
              </PopoverPortal>
            </PopoverRoot>
          </td>
        </tr>
      </tbody>
    </table>

    <p v-if="items.length === 0" class="py-10 text-center text-[12.5px] text-muted">
      还没有保存过的文档
    </p>

    <div class="flex justify-center border-t border-rule py-4">
      <label class="paper-link cursor-pointer text-[12px] text-muted transition-colors hover:text-ink">
        导入 JSON…
        <input type="file" accept="application/json" class="hidden" @change="import_document" />
      </label>
    </div>
  </main>
</template>
