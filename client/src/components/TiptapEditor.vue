<script lang="ts" setup>
import { Editor, EditorContent, BubbleMenu } from '@tiptap/vue-3'
import { ToggleGroupRoot, ToggleGroupItem } from 'reka-ui'
import { computed, watch, ref } from 'vue'
import StarterKit from '@tiptap/starter-kit'
import Subscript from '@tiptap/extension-subscript'

import FormatBold from './Icon/FormatBold.vue'
import FormatItalic from './Icon/FormatItalic.vue'
import FormatSubscript from './Icon/FormatSubscript.vue'

const modelValue = defineModel<string>()
defineProps<{ placeholder?: string }>()

const updating = ref(false)

watch(modelValue, () => {
  if (editor) {
    if (!updating.value) {
      editor.commands.setContent(modelValue.value || '')
    } else {
      updating.value = false
    }
  }
})

const editor = new Editor({
  extensions: [StarterKit, Subscript],
  content: modelValue.value,
  onUpdate: ({ editor }) => {
    updating.value = true
    modelValue.value = editor.getHTML()
  },
})

const bubbleMenuItems = [
  { name: 'bold', command: 'toggleBold', icon: FormatBold },
  { name: 'italic', command: 'toggleItalic', icon: FormatItalic },
  { name: 'subscript', command: 'toggleSubscript', icon: FormatSubscript },
] as const

// 空态占位：编辑器自身没有 placeholder 扩展，用一层覆盖层表达，
// 这样中缝两栏各自的对齐方式都能沿用。
const empty = computed(() => {
  const html = modelValue.value ?? ''
  return html.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim() === ''
})
</script>

<template>
  <div class="editor">
    <div v-if="editor">
      <bubble-menu :tippy-options="{ duration: 100 }" :editor="editor" class="relative">
        <toggle-group-root
          class="flex gap-1 rounded-[2px] border border-rule-strong bg-paper p-1 shadow-[0_4px_14px_rgba(45,42,38,0.08)]"
        >
          <toggle-group-item
            v-for="item in bubbleMenuItems"
            :key="item.name"
            :value="item.name"
            class="cursor-pointer px-1 text-muted transition-colors hover:text-ink"
            :class="{ 'text-ink': editor.isActive(item.name) }"
            @click="editor.chain().focus()[item.command]().run()"
          >
            <component :is="item.icon" />
          </toggle-group-item>
        </toggle-group-root>
      </bubble-menu>
    </div>

    <EditorContent :editor="editor" />

    <span
      v-if="empty && placeholder"
      class="pointer-events-none absolute inset-0 select-none font-sans text-[0.82em] not-italic leading-[1.6] tracking-wide text-faint"
    >
      {{ placeholder }}
    </span>
  </div>
</template>
