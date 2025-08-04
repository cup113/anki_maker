<script lang="ts" setup>
import { computed } from 'vue';
import { useRecordStore } from '@/stores/record';
import { useToastsStore } from '@/stores/toasts';
import { TreeRoot, TreeItem } from 'reka-ui';
import DocumentIcon from '@/components/Icon/DocumentIcon.vue';
import ImportIcon from '@/components/Icon/ImportIcon.vue';
import DeleteIcon from '@/components/Icon/DeleteIcon.vue';
import dayjs from 'dayjs';

const recordStore = useRecordStore();
const toastsStore = useToastsStore();
const items = computed(() => {
    return recordStore.recordStorageTitles.map(title => {
        const document = recordStore.read_document(title);
        const createdAt: string = document?.createdAt ?? 'Unknown';
        const modifiedAt: string = document?.modifiedAt ?? 'Unknown';
        const amount: number = document?.records?.length ?? NaN;

        return {
            title,
            createdAt,
            modifiedAt,
            amount,
        };
    });
});

function delete_document(title: string) {
    if (confirm("确定删除该文档？")) {
        recordStore.delete_document(title);
    }
}

function load_document(title: string) {
    recordStore.load_document(title);
    toastsStore.add_toast('文档加载成功', `(${dayjs().format('HH:mm:ss')}) ${title}`);
}

function import_document(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
        try {
            const result = reader.result;
            if (typeof result !== 'string') {
                alert('文件内容格式不正确');
                return;
            }
            recordStore.import_document(result);
        } catch (error) {
            alert("导入失败：文件格式不正确。" + String(error));
        }
    };
    reader.readAsText(file);
}
</script>

<template>
    <main class="p-4">
        <TreeRoot :items="items" :get-key="item => item.title" v-slot="{ flattenItems }"
            class="border-primary-600 border px-8 text-center">
            <div class="flex items-center gap-2 my-2 justify-center text-primary-700 font-bold">
                <div class="w-6"></div>
                <div class="w-48">Title</div>
                <div class="w-16">Amount</div>
                <div class="w-40">Created At</div>
                <div class="w-40">Modified At</div>
                <div class="w-20">Actions</div>
            </div>
            <TreeItem v-for="item in flattenItems" :key="item._id" v-bind="item.bind">
                <div class="flex items-center gap-2 my-2 justify-center">
                    <DocumentIcon></DocumentIcon>
                    <div class="w-48">{{ item.value.title }}</div>
                    <div class="w-16 font-mono">{{ item.value.amount }}</div>
                    <div class="w-40 text-sm">{{ item.value.createdAt }}</div>
                    <div class="w-40 text-sm">{{ item.value.modifiedAt }}</div>
                    <button class="btn-primary p-1" @click="load_document(item.value.title)">
                        <ImportIcon></ImportIcon>
                    </button>
                    <button class="btn-primary p-1 text-red-700" @click="delete_document(item.value.title)">
                        <DeleteIcon></DeleteIcon>
                    </button>
                </div>
            </TreeItem>
        </TreeRoot>

        <div class="flex items-center gap-2 justify-center mt-4">
            <span>导入文件</span>
            <input type="file" accept="application/json" @change="import_document"
                class="w-64 border border-primary-300 px-2 py-1 rounded-md">
        </div>
    </main>
</template>
