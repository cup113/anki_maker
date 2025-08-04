<script lang="ts" setup>
import { PopoverRoot, PopoverTrigger, PopoverPortal, PopoverContent, PopoverArrow } from 'reka-ui';
import { ref } from 'vue';

const model = defineModel<string>();
const open = ref(false);

const choices = ["A", "B", "C", "D", "E", "F", "G", "H", "-", "→", "①", "②", "③", "④", "⑤"];

function choose_level(level: string) {
    model.value = level;
    open.value = false;
}
</script>

<template>
    <PopoverRoot v-model:open="open">
        <PopoverTrigger class="w-6 h-6 p-0 text-center rounded-xl bg-gray-100 text-sm font-semibold">
            {{ model }}
        </PopoverTrigger>
        <PopoverPortal>
            <PopoverContent class="bg-white dark:bg-gray-800 rounded-md shadow-md p-4 w-64">
                <div class="grid grid-cols-5">
                    <button v-for="level in choices" :key="level" class="btn-primary px-1 py-1 border-0"
                        :class="{ 'bg-primary-200': level === model }" @click="choose_level(level)">
                        {{ level }}
                    </button>
                </div>
                <PopoverArrow />
            </PopoverContent>
        </PopoverPortal>
    </PopoverRoot>
</template>
