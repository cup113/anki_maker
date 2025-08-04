<script lang="ts" setup>
import { useRecordStore } from '@/stores/record';
import { computed } from 'vue';
import { Separator } from 'reka-ui';
import DeleteIcon from './Icon/DeleteIcon.vue';
import TiptapEditor from './TiptapEditor.vue';
import SimpleChoice from './SimpleChoice.vue';

const props = defineProps<{
    chunkId: string;
    additionId: string;
}>();

const recordStore = useRecordStore();

const addition = computed(() => {
    return recordStore.chunkDocument.find_addition(props.chunkId, props.additionId);
});
</script>

<template>
    <div class="flex text-center justify-center gap-4">
        <SimpleChoice v-model="addition.icon"></SimpleChoice>
        <div class="grow px-2 py-1">
            <TiptapEditor v-model="addition.front" />
        </div>
        <Separator class="bg-gray-300 h-5 w-0.5 mx-2" decorative orientation="vertical">
        </Separator>
        <div class="grow px-2 py-1">
            <TiptapEditor v-model="addition.back" />
        </div>
        <button class="btn-primary text-red-700 py-1 px-2"
            @click="recordStore.chunkDocument.delete_addition(chunkId, additionId)">
            <DeleteIcon />
        </button>
    </div>
</template>
