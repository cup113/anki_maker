import { defineStore } from "pinia";
import { saveAs } from "file-saver";
import { nanoid } from "nanoid";
import { useLocalStorage } from "@vueuse/core";
import { encode as encode_base64 } from 'js-base64';
import { useToastsStore } from "./toasts";
import dayjs from 'dayjs';

type HTMLString = string;

type JsonType<T> = T extends Date ? string
    // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
    : T extends Function | undefined | symbol ? never
    : T extends object ? { [K in keyof T]: JsonType<T[K]> } : T;

function now(): string {
    return dayjs().format("YYYY-MM-DD HH:mm:ss");
}

export class Addition {
    public id: string;
    public icon: string;
    public front: string;
    public back: string;

    constructor(id: string, icon: string, front: string, back: string) {
        this.id = id;
        this.icon = icon;
        this.front = front;
        this.back = back;
    }

    static fromJSON(json: JsonType<Addition>) {
        return new Addition(json.id, json.icon, json.front, json.back);
    }

    static default() {
        return new Addition(nanoid(), "→", "", "");
    }
}

export class ChunkRecord {
    public id: string;
    public level: string;
    public front: HTMLString;
    public back: HTMLString;
    public additions: Addition[];

    constructor(id: string, level: string, front: HTMLString, back: HTMLString, additions: Addition[]) {
        this.id = id;
        this.level = level;
        this.front = front;
        this.back = back;
        this.additions = additions;
    }

    public withFront(front: HTMLString) {
        this.front = front;
        return this;
    }

    public withBack(back: HTMLString) {
        this.back = back;
        return this;
    }

    static default() {
        return new ChunkRecord(nanoid(), "-", "", "", []);
    }

    static fromJSON(json: JsonType<ChunkRecord>) {
        return new ChunkRecord(json.id, json.level, json.front, json.back, json.additions.map(Addition.fromJSON));
    }
}

type Section = { abbr: string, full: string }[];
type DeckType = "one-side" | "two-sides" | "type";
type ChunkDocumentV0 = ChunkRecord[];
type ChunkDocumentV1 = { version: 1, title: string, records: ChunkRecord[], sections: Section[] };
type ChunkDocumentV2 = Omit<ChunkDocumentV1, "version"> & { version: 2, footer: string };
type ChunkDocumentV3 = Omit<ChunkDocumentV2, "version"> & { version: 3, deckType: DeckType };
type ImportedChunkDocument = ChunkDocumentV0 | ChunkDocumentV1 | ChunkDocumentV2 | ChunkDocumentV3 | ChunkDocument;

export class ChunkDocument {
    static LATEST_VERSION = 4;

    public version: number;
    public title: string;
    public records: ChunkRecord[];
    public sections: Section[];
    public footer: string;
    public deckType: DeckType;
    public createdAt: string;
    public modifiedAt: string;

    constructor(title: string, records: ChunkRecord[]) {
        this.version = ChunkDocument.LATEST_VERSION;
        this.title = title;
        this.records = records;
        this.sections = [];
        this.footer = "";
        this.deckType = "one-side";
        this.createdAt = now();
        this.modifiedAt = now();
    }

    public add_record(): void {
        this.records.push(ChunkRecord.default());
    }

    /** 在当前词条之后插入一条空词条，返回新词条的 id（键盘流用） */
    public add_record_after(id: string): string {
        const record = ChunkRecord.default();
        const index = this.records.findIndex((item) => item.id === id);
        if (index === -1) {
            this.records.push(record);
        } else {
            this.records.splice(index + 1, 0, record);
        }
        return record.id;
    }

    public find_record(id: string): ChunkRecord {
        return this.records.find((record) => record.id === id) ?? ChunkRecord.default();
    }

    public delete_record(id: string): boolean {
        const index = this.records.findIndex((record) => record.id === id);
        if (index !== -1) {
            this.records.splice(index, 1);
            return true;
        }
        return false;
    }

    public add_addition(id: string): string {
        const addition = Addition.default();
        this.find_record(id).additions.push(addition);
        return addition.id;
    }

    public find_addition(id: string, additionId: string): Addition {
        return this.find_record(id).additions.find((addition) => addition.id === additionId) ?? Addition.default();
    }

    public delete_addition(id: string, additionId: string): boolean {
        const record = this.find_record(id);
        const index = record.additions.findIndex((addition) => addition.id === additionId);
        if (index !== -1) {
            record.additions.splice(index, 1);
            return true;
        }
        return false;
    }

    static fromJSON(json: JsonType<ImportedChunkDocument>): ChunkDocument {
        if (Array.isArray(json)) {
            return new ChunkDocument("", json.map(ChunkRecord.fromJSON));
        }

        const result = new ChunkDocument(json.title, json.records.map(ChunkRecord.fromJSON));
        result.sections = json.sections;
        if (json.version === 2 || json.version === 3 || json.version === 4) {
            result.footer = json.footer;
        }
        if (json.version === 3 || json.version === 4) {
            result.deckType = json.deckType;
        }
        if (json.version === 4) {
            result.createdAt = json.createdAt;
            result.modifiedAt = json.modifiedAt;
        }
        return result;
    }
}

export const deckTypes: { value: DeckType, label: string }[] = [
    { value: "one-side", label: "单面卡片" },
    { value: "two-sides", label: "双面卡片" },
    { value: "type", label: "输入卡片" },
]

export const useRecordStore = defineStore("record", () => {
    // TODO storage capacity
    // TODO backup download
    const chunkDocument = useLocalStorage("AL_chunkDocument", new ChunkDocument("New " + nanoid(8), []), {
        serializer: {
            read(raw) { return ChunkDocument.fromJSON(JSON.parse(raw)); },
            write(value) { return JSON.stringify(value); },
        },
    });
    const recordStorageTitles = useLocalStorage<string[]>("AL_recordStorageIds", []);
    load_document(chunkDocument.value.title, false);

    function get_local_storage_key(title: string) {
        return `AL_records_${encode_base64(title)}`;
    }

    function save_document() {
        if (!recordStorageTitles.value.includes(chunkDocument.value.title)) {
            recordStorageTitles.value.push(chunkDocument.value.title);
        }
        chunkDocument.value.modifiedAt = now();
        localStorage.setItem(get_local_storage_key(chunkDocument.value.title), JSON.stringify(chunkDocument.value));
        const toastsStore = useToastsStore();
        toastsStore.add_toast("文档已保存", `(${dayjs().format('HH:mm:ss')}) ${chunkDocument.value.title}`);
    }

    function read_document(title: string) {
        const item = localStorage.getItem(get_local_storage_key(title));
        if (item === null) {
            return null;
        } else {
            return JSON.parse(item);
        }
    }

    function load_document(title: string, interactive: boolean = true) {
        const doc = read_document(title);
        if (doc === null) {
            if (!interactive) {
                return;
            }
            alert("Record not found.");
        } else {
            chunkDocument.value = ChunkDocument.fromJSON(doc);
            chunkDocument.value.title = title;
        }
    }

    function import_document(jsonString: string) {
        const json = JSON.parse(jsonString);
        const importedDocument = ChunkDocument.fromJSON(json);
        const newTitle = prompt("请输入文档标题：", importedDocument.title) || importedDocument.title;
        importedDocument.title = newTitle;
        chunkDocument.value = importedDocument;
        save_document();
    }

    function delete_document(title: string) {
        localStorage.removeItem(get_local_storage_key(title));
        const index = recordStorageTitles.value.indexOf(title);
        if (index !== -1) {
            recordStorageTitles.value.splice(index, 1);
        }
    }

    function loadDocumentFromDraft(doc: ChunkDocument) {
        chunkDocument.value = doc;
        save_document();
    }

    function new_document() {
        save_document();
        chunkDocument.value = new ChunkDocument("New " + nanoid(8), []);
    }

    // 服务端一次 /api/generate 就同时产出 docx 与 apkg，缓存这次结果，
    // 让「先点 Word、再点 APKG」不必重新生成。
    let last_export: { title: string; docx: string; apkg: string } | null = null;

    async function export_format(format: "json" | "word" | "apkg") {
        const doc = chunkDocument.value;
        const safe_title = doc.title.replace(/[^a-zA-Z0-9\u4e00-\u9fa5-_]/g, "_");

        if (format === "json") {
            const blob = new Blob([JSON.stringify(doc, null, 2)], { type: "application/json" });
            saveAs(blob, `${doc.title}.json`);
            return;
        }

        try {
            if (last_export === null || last_export.title !== safe_title) {
                const response = await fetch("/api/generate", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ ...doc, title: safe_title }),
                });
                if (!response.ok) {
                    throw new Error(`generate failed: ${response.status}`);
                }
                const data = await response.json();
                last_export = {
                    title: safe_title,
                    docx: data.docx_filename,
                    apkg: data.apkg_filename,
                };
            }

            const extension = format === "word" ? "docx" : "apkg";
            const filename = format === "word" ? last_export.docx : last_export.apkg;
            const link = document.createElement("a");
            link.href = `/api/download/${extension}/${filename}`;
            link.download = `${safe_title}.${extension}`;
            link.click();
        } catch (error) {
            console.error("生成文件时出错:", error);
            useToastsStore().add_toast("下载失败", "生成文件时出错，请重试");
        }
    }

    return {
        chunkDocument,
        recordStorageTitles,
        save_document,
        read_document,
        load_document,
        import_document,
        delete_document,
        export_format,
        new_document,
        loadDocumentFromDraft,
    };
});
