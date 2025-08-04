<script setup lang="ts">
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
      <button class="text-primary-700 btn-primary p-2" @click="recordStore.download_export">
        <DownloadIcon></DownloadIcon>
      </button>
    </section>
  </main>
</template>
