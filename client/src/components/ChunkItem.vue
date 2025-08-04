<script lang="ts" setup>
import { computed } from 'vue';
import { Separator } from 'reka-ui';
import { useRecordStore } from '@/stores/record';
import MoreIcon from './Icon/MoreIcon.vue';
import DeleteIcon from './Icon/DeleteIcon.vue';

import TiptapEditor from './TiptapEditor.vue';
import ChunkAddition from './ChunkAddition.vue';
import SimpleChoice from './SimpleChoice.vue';

const props = defineProps<{
    index: number;
    chunkId: string;
}>();

const recordStore = useRecordStore();

const chunk = computed(() => {
    return recordStore.chunkDocument.find_record(props.chunkId);
});

const index = computed(() => {
    return (props.index + 1).toString().padStart(2, '0');
});
</script>

<template>
    <div class="shadow rounded-lg pl-4">
        <div class="flex text-center items-center gap-4">
            <div class="text-gray-500 text-sm font-semibold">{{ index }}</div>
            <SimpleChoice v-model="chunk.level"></SimpleChoice>
            <div class="grow px-2 py-1">
                <TiptapEditor v-model="chunk.front" ref="frontEditor" />
            </div>
            <Separator class="bg-gray-300 h-5 w-0.5" decorative orientation="vertical">
            </Separator>
            <div class="grow px-2 py-1">
                <TiptapEditor v-model="chunk.back" />
            </div>
            <div>
                <button class="text-primary-700 btn-primary py-1 px-2"
                    @click="recordStore.chunkDocument.add_addition(chunk.id)">
                    <MoreIcon />
                </button>
                <button class="text-red-700 btn-primary py-1 px-2"
                    @click="recordStore.chunkDocument.delete_record(chunk.id)">
                    <DeleteIcon />
                </button>
            </div>
        </div>
        <div class="pl-16">
            <ChunkAddition v-for="addition in chunk.additions" :key="addition.id" :chunk-id="chunk.id"
                :addition-id="addition.id" />
        </div>
    </div>
</template>
