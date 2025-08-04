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
    <main class="p-6 max-w-6xl mx-auto">
        <div class="bg-white rounded-xl shadow-md overflow-hidden">
            <div class="border-b border-primary-200 bg-gradient-to-r from-primary-50 to-secondary-50 p-4">
                <h2 class="text-2xl font-bold text-primary-800">文档管理</h2>
            </div>

            <TreeRoot :items="items" :get-key="item => item.title" v-slot="{ flattenItems }" class="px-6 py-4">
                <div
                    class="flex items-center gap-2 my-4 justify-between text-primary-700 font-bold bg-primary-100 rounded-lg p-3">
                    <div class="w-12"></div>
                    <div class="w-64 text-left">文档标题</div>
                    <div class="w-20 text-center">卡片数</div>
                    <div class="w-40 text-center">创建时间</div>
                    <div class="w-40 text-center">修改时间</div>
                    <div class="w-32 text-center">操作</div>
                </div>
                <TreeItem v-for="item in flattenItems" :key="item._id" v-bind="item.bind">
                    <div
                        class="flex items-center gap-2 my-3 justify-between bg-white border border-secondary-200 rounded-lg p-3 hover:shadow-md transition-shadow">
                        <div class="w-12 flex justify-center">
                            <DocumentIcon class="text-primary-600" />
                        </div>
                        <div class="w-64 text-left font-medium text-primary-900 truncate">{{ item.value.title }}</div>
                        <div class="w-20 text-center font-mono bg-primary-100 rounded-full py-1 px-3 text-primary-700">
                            {{ item.value.amount }}</div>
                        <div class="w-40 text-center text-sm text-secondary-600">{{
                            dayjs(item.value.createdAt).format('YYYY-MM-DD HH:mm') }}</div>
                        <div class="w-40 text-center text-sm text-secondary-600">{{
                            dayjs(item.value.modifiedAt).format('YYYY-MM-DD HH:mm') }}</div>
                        <div class="w-32 text-center flex justify-center gap-2">
                            <button class="btn-primary p-2 rounded-full text-primary-700 hover:text-primary-900"
                                @click="load_document(item.value.title)" title="加载文档">
                                <ImportIcon class="w-4 h-4" />
                            </button>
                            <button class="btn-primary p-2 rounded-full text-red-600 hover:text-red-800"
                                @click="delete_document(item.value.title)" title="删除文档">
                                <DeleteIcon class="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </TreeItem>
            </TreeRoot>

            <div v-if="items.length === 0" class="text-center py-12 text-secondary-500">
                <DocumentIcon class="mx-auto w-12 h-12 mb-3 text-secondary-300" />
                <p>暂无文档</p>
            </div>
        </div>

        <div class="bg-white rounded-xl shadow-md p-6 mt-6">
            <div class="flex flex-wrap items-center gap-4 justify-center">
                <span class="text-primary-800 font-medium">导入文档</span>
                <input type="file" accept="application/json" @change="import_document"
                    class="w-full max-w-md border-2 border-dashed border-primary-300 px-4 py-3 rounded-lg hover:border-primary-500 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-opacity-50">
                <div class="text-sm text-secondary-500 ml-2">
                    <p>支持 JSON 格式文件</p>
                </div>
            </div>
        </div>
    </main>
</template>