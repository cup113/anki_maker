import { browser } from '$app/environment'
import { encode as encode_base64 } from 'js-base64'
import dayjs from 'dayjs'
import { nanoid } from 'nanoid'

import * as model from '../model'
import { dialogs } from './dialogs.svelte'
import { toasts } from './toasts.svelte'

const DOCUMENT_KEY = 'AL_chunkDocument'
const TITLES_KEY = 'AL_recordStorageIds'

/** 首屏（含 SSR）用一个空文档占位，挂载后才换成 localStorage 里的那一份。 */
const EMPTY = model.create_document('', [])

function storage_key(title: string): string {
  return `AL_records_${encode_base64(title)}`
}

function parse(raw: string | null): unknown {
  if (raw === null) return null
  try {
    return JSON.parse(raw)
  } catch {
    return null
  }
}

function download_blob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

class RecordStore {
  #document = $state<model.ChunkDocument | null>(null)
  titles = $state<string[]>([])
  #ready = $state(false)

  get doc(): model.ChunkDocument {
    return this.#document ?? EMPTY
  }

  get ready(): boolean {
    return this.#ready
  }

  /** 只在浏览器里跑，且必须晚于 hydration —— 否则首屏和 SSR 的 HTML 对不上。 */
  init(): void {
    if (!browser || this.#ready) return

    const titles = parse(localStorage.getItem(TITLES_KEY))
    if (Array.isArray(titles)) {
      this.titles = titles.filter((title): title is string => typeof title === 'string')
    }

    // AL_chunkDocument 是「上一次关页面时正在编辑的那份」，存了就直接恢复，
    // 刷新回到原来的文档，而不是又开一份 "New xxxxxxxx"。
    const stored = parse(localStorage.getItem(DOCUMENT_KEY))
    this.#document =
      stored === null ? model.create_document(`New ${nanoid(8)}`, []) : model.from_json(stored)
    this.#ready = true
  }

  /** 把当前这份记成「工作文档」，只回答刷新后打开哪一份，不写存档列表。 */
  #persist_working(): void {
    if (!browser || this.#document === null) return
    localStorage.setItem(DOCUMENT_KEY, JSON.stringify(this.#document))
  }

  save_document(): void {
    if (!browser) return

    if (!this.titles.includes(this.doc.title)) {
      this.titles.push(this.doc.title)
      localStorage.setItem(TITLES_KEY, JSON.stringify(this.titles))
    }
    this.doc.modifiedAt = model.now()
    localStorage.setItem(storage_key(this.doc.title), JSON.stringify(this.doc))
    this.#persist_working()
    toasts.add_toast('文档已保存', `(${dayjs().format('HH:mm:ss')}) ${this.doc.title}`)
  }

  read_document(title: string): unknown | null {
    if (!browser) return null
    return parse(localStorage.getItem(storage_key(title)))
  }

  load_document(title: string, interactive = true): void {
    const stored = this.read_document(title)
    if (stored === null) {
      if (interactive) void dialogs.alert('找不到这份文档，可能已被删除。')
      return
    }
    const document = model.from_json(stored)
    document.title = title
    this.#document = document
    this.#persist_working()
  }

  async import_document(json_string: string): Promise<void> {
    const imported = model.from_json(JSON.parse(json_string))
    const answer = await dialogs.prompt('导入为新文档，给它起个名字：', imported.title)
    imported.title = answer?.trim() || imported.title
    this.#document = imported
    this.save_document()
  }

  delete_document(title: string): void {
    if (!browser) return
    localStorage.removeItem(storage_key(title))
    const index = this.titles.indexOf(title)
    if (index !== -1) {
      this.titles.splice(index, 1)
      localStorage.setItem(TITLES_KEY, JSON.stringify(this.titles))
    }
  }

  load_draft(document: model.ChunkDocument): void {
    this.#document = document
    this.save_document()
  }

  /** 用 AI 返回的整份文档替换当前文档，并立即落盘——AI 页不经过首页的保存按钮 */
  replace_document(document: model.ChunkDocument): void {
    this.#document = document
    this.save_document()
  }

  new_document(): void {
    this.save_document()
    this.#document = model.create_document(`New ${nanoid(8)}`, [])
    this.#persist_working()
  }

  // 服务端一次 /api/generate 就同时产出 docx 与 apkg，缓存这次结果，
  // 让「先点 Word、再点 APKG」不必重新生成。缓存按内容判等：
  // 只比标题的话，改完卡片再导出会拿到上一次的文件。
  #last_export: { key: string; docx: string; apkg: string } | null = null

  async export_format(format: 'json' | 'word' | 'apkg'): Promise<void> {
    const doc = this.doc
    const safe_title = doc.title.replace(/[^a-zA-Z0-9\u4e00-\u9fa5-_]/g, '_')

    if (format === 'json') {
      const blob = new Blob([JSON.stringify(doc, null, 2)], { type: 'application/json' })
      download_blob(blob, `${doc.title}.json`)
      return
    }

    try {
      const key = `${safe_title}\u0000${model.fingerprint(doc)}`
      if (this.#last_export === null || this.#last_export.key !== key) {
        const response = await fetch('/api/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...doc, title: safe_title }),
        })
        if (!response.ok) {
          throw new Error(`generate failed: ${response.status}`)
        }
        const data = (await response.json()) as { docx_filename: string; apkg_filename: string }
        this.#last_export = {
          key,
          docx: data.docx_filename,
          apkg: data.apkg_filename,
        }
      }

      const extension = format === 'word' ? 'docx' : 'apkg'
      const filename = format === 'word' ? this.#last_export.docx : this.#last_export.apkg
      const link = document.createElement('a')
      link.href = `/api/download/${extension}/${filename}`
      link.download = `${safe_title}.${extension}`
      link.click()
    } catch (error) {
      console.error('生成文件时出错:', error)
      toasts.add_toast('下载失败', '生成文件时出错，请重试')
    }
  }
}

export const record_store = new RecordStore()
