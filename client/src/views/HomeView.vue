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
  <main class="p-6 max-w-6xl mx-auto">
    <div class="bg-white rounded-xl shadow-md p-6 mb-6">
      <section class="flex flex-wrap justify-center items-center gap-4 mb-6">
        <button class="btn-primary p-3 text-primary-700 rounded-full shadow hover:shadow-md transition-shadow"
          @click="recordStore.new_document" title="新建文档">
          <AddIcon class="w-5 h-5" />
        </button>
        <input type="text" v-model="recordStore.chunkDocument.title"
          class="text-center text-2xl font-bold w-full max-w-md mx-2 py-2 px-4 border-b-2 border-primary-300 focus:border-primary-500 focus:outline-none bg-secondary-50 rounded-lg">
        <button class="text-primary-700 btn-primary p-3 rounded-full shadow hover:shadow-md transition-shadow"
          @click="recordStore.save_document" title="保存文档">
          <SaveIcon class="w-5 h-5" />
        </button>
      </section>

      <section class="mb-8">
        <SelectRoot v-model="recordStore.chunkDocument.deckType">
          <SelectTrigger
            class="btn-primary py-3 px-4 text-primary-700 font-bold rounded-lg shadow hover:shadow-md transition-shadow flex items-center justify-between mx-auto">
            卡组类型：
            <SelectValue placeholder="请选择卡组类型" />
          </SelectTrigger>
          <SelectPortal>
            <SelectContent class="bg-white text-primary-700 rounded-xl shadow-lg p-2 border border-primary-200">
              <SelectViewport>
                <SelectGroup>
                  <SelectItem v-for="deckType in deckTypes" :value="deckType.value" :key="deckType.value"
                    class="p-3 hover:bg-primary-100 rounded-lg cursor-pointer transition-colors flex items-center">
                    <SelectItemIndicator class="mr-2" />
                    <SelectItemText>{{ deckType.label }}</SelectItemText>
                  </SelectItem>
                </SelectGroup>
              </SelectViewport>
            </SelectContent>
          </SelectPortal>
        </SelectRoot>
      </section>
    </div>

    <section class="flex flex-col gap-1 mb-6">
      <ChunkItem v-for="record, index in recordStore.chunkDocument.records" :key="record.id" :chunk-id="record.id"
        :index="index" />
    </section>

    <section class="bg-white rounded-xl shadow-md p-6 mb-6">
      <h3 class="text-lg font-semibold text-primary-800 mb-3">页脚内容</h3>
      <TiptapEditor v-model="recordStore.chunkDocument.footer" class="border-b border-b-primary-400"></TiptapEditor>
    </section>

    <section class="flex gap-4 justify-center mb-8">
      <button
        class="text-primary-700 btn-primary p-4 rounded-full shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
        @click="recordStore.chunkDocument.add_record" title="添加卡片">
        <AddIcon class="w-6 h-6" />
      </button>
      <button
        class="text-primary-700 btn-primary p-4 rounded-full shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
        @click="openDownloadModal" title="下载">
        <DownloadIcon class="w-6 h-6" />
      </button>
    </section>
  </main>

  <div v-if="showDownloadModal" class="fixed inset-0 bg-secondary-900/70 flex items-center justify-center z-50 p-4">
    <div class="bg-white rounded-2xl shadow-2xl w-full max-w-md transform transition-all">
      <div class="p-6">
        <h3 class="text-xl font-bold mb-4 text-primary-800">选择要下载的文件类型</h3>
        <div class="space-y-4 mb-6">
          <label class="flex items-center p-3 rounded-lg hover:bg-primary-50 cursor-pointer transition-colors">
            <input type="checkbox" v-model="selectedDownloads.json"
              class="mr-3 h-5 w-5 text-primary-600 rounded focus:ring-primary-500">
            <span class="text-gray-700">JSON 文件 (文档数据)</span>
          </label>
          <label class="flex items-center p-3 rounded-lg hover:bg-primary-50 cursor-pointer transition-colors">
            <input type="checkbox" v-model="selectedDownloads.word"
              class="mr-3 h-5 w-5 text-primary-600 rounded focus:ring-primary-500">
            <span class="text-gray-700">Word 文件 (文档格式)</span>
          </label>
          <label class="flex items-center p-3 rounded-lg hover:bg-primary-50 cursor-pointer transition-colors">
            <input type="checkbox" v-model="selectedDownloads.apkg"
              class="mr-3 h-5 w-5 text-primary-600 rounded focus:ring-primary-500">
            <span class="text-gray-700">APKG 文件 (Anki 卡组)</span>
          </label>
        </div>
        <div class="flex justify-end space-x-3">
          <button @click="closeDownloadModal"
            class="px-5 py-2.5 border border-secondary-300 rounded-lg text-secondary-700 hover:bg-secondary-100 transition-colors font-medium">
            取消
          </button>
          <button @click="confirmDownload"
            class="px-5 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium shadow-md"
            :disabled="!selectedDownloads.json && !selectedDownloads.word && !selectedDownloads.apkg"
            :class="{ 'opacity-50 cursor-not-allowed': !selectedDownloads.json && !selectedDownloads.word && !selectedDownloads.apkg }">
            下载
          </button>
        </div>
      </div>
    </div>
  </div>
</template>