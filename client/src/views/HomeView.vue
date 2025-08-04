<script setup lang="ts">
import { ref } from 'vue';
import { onKeyStroke } from '@vueuse/core';

import ChunkItem from '@/components/ChunkItem.vue';
import DownloadIcon from '@/components/Icon/DownloadIcon.vue'
import AddIcon from '@/components/Icon/AddIcon.vue';
import SaveIcon from '@/components/Icon/SaveIcon.vue';

import TiptapEditor from '@/components/TiptapEditor.vue';
import {
  SelectRoot, SelectTrigger, SelectValue, SelectPortal, SelectContent, SelectViewport, SelectGroup, SelectItem, SelectItemIndicator, SelectItemText,
} from 'reka-ui';
import { useRecordStore, deckTypes } from '@/stores/record';

const recordStore = useRecordStore();

// 下载选项模态框相关
const showDownloadModal = ref(false);
const selectedDownloads = ref({
  json: false,
  word: false,
  apkg: false,
});

const openDownloadModal = () => {
  showDownloadModal.value = true;
};

const closeDownloadModal = () => {
  showDownloadModal.value = false;
};

const confirmDownload = async () => {
  await recordStore.download_export(selectedDownloads.value);
  closeDownloadModal();
};

onKeyStroke('s', e => {
  if (e.ctrlKey) {
    e.preventDefault();
    recordStore.save_document();
  }
});
</script>

<template>
  <main class="p-4 flex flex-col gap-4">
    <section class="flex justify-center items-center gap-2">
      <button class="btn-primary p-1 text-primary-700" @click="recordStore.new_document">
        <AddIcon />
      </button>
      <input type="text" v-model="recordStore.chunkDocument.title" class="text-center text-xl font-bold w-72">
      <button class="text-primary-700 btn-primary p-1" @click="recordStore.save_document">
        <SaveIcon />
      </button>
    </section>
    <section class="flex justify-center">
      <SelectRoot v-model="recordStore.chunkDocument.deckType" class="w-72">
        <SelectTrigger class="btn-primary py-1 px-2 text-primary-700 font-bold">
          卡组类型：
          <SelectValue placeholder="请选择卡组类型" />
        </SelectTrigger>
        <SelectPortal>
          <SelectContent class="bg-white text-primary-700 rounded-md shadow-md p-2">
            <SelectViewport>
              <SelectGroup>
                <SelectItem v-for="deckType in deckTypes" :value="deckType.value" :key="deckType.value"
                  class="p-2 hover:bg-secondary-100">
                  <SelectItemIndicator />
                  <SelectItemText>{{ deckType.label }}</SelectItemText>
                </SelectItem>
              </SelectGroup>
            </SelectViewport>
          </SelectContent>
        </SelectPortal>
      </SelectRoot>
    </section>
    <section class="flex flex-col gap-2">
      <ChunkItem v-for="record, index in recordStore.chunkDocument.records" :key="record.id" :chunk-id="record.id"
        :index="index" />
    </section>
    <section>
      <TiptapEditor v-model="recordStore.chunkDocument.footer"></TiptapEditor>
    </section>
    <section class="flex gap-2 justify-center">
      <button class="text-primary-700 btn-primary p-2" @click="recordStore.chunkDocument.add_record">
        <AddIcon></AddIcon>
      </button>
      <button class="text-primary-700 btn-primary p-2" @click="openDownloadModal">
        <DownloadIcon></DownloadIcon>
      </button>
    </section>
  </main>

  <!-- 下载选项模态框 -->
  <div v-if="showDownloadModal" class="fixed inset-0 bg-secondary-500/50 flex items-center justify-center z-50">
    <div class="bg-white rounded-lg p-6 w-96">
      <h3 class="text-lg font-bold mb-4">选择要下载的文件类型</h3>
      <div class="space-y-3 mb-6">
        <label class="flex items-center">
          <input type="checkbox" v-model="selectedDownloads.json" class="mr-2 h-5 w-5">
          <span class="text-gray-700">JSON 文件 (文档数据)</span>
        </label>
        <label class="flex items-center">
          <input type="checkbox" v-model="selectedDownloads.word" class="mr-2 h-5 w-5">
          <span class="text-gray-700">Word 文件 (文档格式)</span>
        </label>
        <label class="flex items-center">
          <input type="checkbox" v-model="selectedDownloads.apkg" class="mr-2 h-5 w-5">
          <span class="text-gray-700">APKG 文件 (Anki 卡组)</span>
        </label>
      </div>
      <div class="flex justify-end space-x-3">
        <button @click="closeDownloadModal"
          class="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100">
          取消
        </button>
        <button @click="confirmDownload" class="px-4 py-2 bg-primary-500 text-white rounded-md hover:bg-primary-600"
          :disabled="!selectedDownloads.json && !selectedDownloads.word && !selectedDownloads.apkg"
          :class="{ 'opacity-50 cursor-not-allowed': !selectedDownloads.json && !selectedDownloads.word && !selectedDownloads.apkg }">
          下载
        </button>
      </div>
    </div>
  </div>
</template>