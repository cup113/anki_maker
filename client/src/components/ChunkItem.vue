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
  <div class="bg-white rounded-xl shadow-md overflow-hidden transition-all hover:shadow-lg">
    <div class="flex flex-wrap md:flex-nowrap items-center gap-4 px-4 py-2">
      <div class="bg-primary-100 text-primary-800 text-sm font-bold rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0">
        {{ index }}
      </div>
      <div class="flex-shrink-0">
        <SimpleChoice v-model="chunk.level"></SimpleChoice>
      </div>
      <div class="flex-grow w-1/3 px-2">
        <TiptapEditor v-model="chunk.front" ref="frontEditor" class="border border-secondary-200 rounded-lg p-2 hover:border-primary-300 focus-within:border-primary-500 transition-colors text-center" />
      </div>
      <Separator class="bg-secondary-300 h-10 w-0.5 hidden md:block" decorative orientation="vertical" />
      <div class="flex-grow w-1/3 px-2">
        <TiptapEditor v-model="chunk.back" class="border border-secondary-200 rounded-lg p-2 hover:border-primary-300 focus-within:border-primary-500 transition-colors text-center" />
      </div>
      <div class="flex gap-1">
        <button class="text-primary-700 btn-primary p-2 rounded-lg shadow hover:shadow-md transition-all"
                @click="recordStore.chunkDocument.add_addition(chunk.id)"
                title="添加附加内容">
          <MoreIcon class="w-4 h-4" />
        </button>
        <button class="text-red-600 btn-primary p-2 rounded-lg shadow hover:shadow-md transition-all" 
                @click="recordStore.chunkDocument.delete_record(chunk.id)"
                title="删除卡片">
          <DeleteIcon class="w-4 h-4" />
        </button>
      </div>
    </div>
    <div class="pl-16 pr-4">
      <ChunkAddition v-for="addition in chunk.additions" :key="addition.id" :chunk-id="chunk.id"
        :addition-id="addition.id" />
    </div>
  </div>
</template>
