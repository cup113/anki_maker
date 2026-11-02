<script lang="ts" setup>
import { PopoverContent, PopoverPortal, PopoverRoot, PopoverTrigger } from 'reka-ui'
import { ref } from 'vue'

const model = defineModel<string>()
const open = ref(false)

const choices = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', '-', '→', '①', '②', '③', '④', '⑤']

function choose_level(level: string) {
  model.value = level
  open.value = false
}
</script>

<template>
  <PopoverRoot v-model:open="open">
    <PopoverTrigger
      class="border-b border-dotted border-transparent pb-px font-book text-[11.5px] leading-tight text-muted transition-colors hover:border-rule-strong hover:text-ink focus:outline-none focus-visible:border-ink"
    >
      {{ model }}
    </PopoverTrigger>

    <PopoverPortal>
      <PopoverContent
        side="right"
        align="start"
        :side-offset="6"
        class="z-50 grid w-[172px] grid-cols-5 gap-0.5 rounded-[2px] border border-rule-strong bg-paper p-2 shadow-[0_6px_18px_rgba(45,42,38,0.10)]"
      >
        <button
          v-for="level in choices"
          :key="level"
          type="button"
          class="h-6 text-center font-book text-[12px] text-muted transition-colors hover:bg-wash hover:text-ink"
          :class="{ 'bg-wash text-ink': level === model }"
          @click="choose_level(level)"
        >
          {{ level }}
        </button>
      </PopoverContent>
    </PopoverPortal>
  </PopoverRoot>
</template>
