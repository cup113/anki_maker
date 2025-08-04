<script lang="ts" setup>
import { Editor, EditorContent, BubbleMenu } from '@tiptap/vue-3';
import { ToggleGroupRoot, ToggleGroupItem } from 'reka-ui';
import { watch, ref } from 'vue';
import StarterKit from '@tiptap/starter-kit';
import Subscript from '@tiptap/extension-subscript';

import FormatBold from './Icon/FormatBold.vue';
import FormatItalic from './Icon/FormatItalic.vue';
import FormatSubscript from './Icon/FormatSubscript.vue';

const modelValue = defineModel<string>();
const updating = ref(false);

watch(modelValue, () => {
    if (editor) {
        if (!updating.value) {
            editor.commands.setContent(modelValue.value || "");
        } else {
            updating.value = false;
        }
    }
});

const editor = new Editor({
    extensions: [
        StarterKit,
        Subscript,
    ],
    content: modelValue.value,
    onUpdate: ({ editor }) => {
        updating.value = true;
        modelValue.value = editor.getHTML();
    },
});

const bubbleMenuItems = [
    { name: 'bold', command: 'toggleBold', icon: FormatBold, },
    { name: 'italic', command: 'toggleItalic', icon: FormatItalic, },
    { name: 'subscript', command: 'toggleSubscript', icon: FormatSubscript, },
] as const;
</script>

<template>
    <div class="editor">
        <div v-if="editor">
            <bubble-menu :tippy-options="{ duration: 100 }" :editor="editor" class="relative">
                <toggle-group-root class="flex space-x-2 bg-white rounded shadow-sm p-1">
                    <toggle-group-item v-for="item in bubbleMenuItems" :key="item.name" :value="item.name"
                        @click="editor.chain().focus()[item.command]().run()"
                        :class="{ 'text-primary-700': editor.isActive(item.name) }">
                        <component :is="item.icon" />
                    </toggle-group-item>
                </toggle-group-root>
            </bubble-menu>
        </div>
        <EditorContent :editor="editor" />
    </div>
</template>
