import { defineStore } from "pinia";
import { ref } from "vue";
import { nanoid } from "nanoid";

class Toast {
    public id: string;
    public title: string;
    public message: string;
    public opacity: number;

    constructor(title: string, message: string) {
        this.id = nanoid();

        this.title = title;
        this.message = message;
        this.opacity = 0;
    }
}

export const useToastsStore = defineStore("toasts", () => {
    const toasts = ref<Toast[]>([]);

    function add_toast(title: string, message: string) {
        const toast = new Toast(title, message);
        toasts.value.push(toast);
        const id = toast.id;
        const DURATION = 8000;

        setTimeout(() => {
            toasts.value[toasts.value.findIndex(toast => toast.id === id)].opacity = 1;
        }, 50);
        setTimeout(() => {
            toasts.value[toasts.value.findIndex(toast => toast.id === id)].opacity = 0;
            setTimeout(() => {
                toasts.value.splice(toasts.value.findIndex(toast => toast.id === id), 1);
            }, 150);
        }, DURATION - 150);
    }

    return { toasts, add_toast };
});
