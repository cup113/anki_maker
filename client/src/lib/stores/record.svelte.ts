import { browser } from '$app/environment'
import dayjs from 'dayjs'
import { nanoid } from 'nanoid'

import * as model from '../model'
import * as storage from '../storage'
import { dialogs } from './dialogs.svelte'
import { toasts } from './toasts.svelte'

/** 首屏（含 SSR）用一个空文档占位，挂载后才换成 localStorage 里的那一份。 */
const EMPTY = model.create_document('', [])

function download_blob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

/**
 * 当前正在编辑的那份 Document，以及文档库的摘要列表。
 * 存档怎么放（键名、索引、旧版迁移）都归 lib/storage 管，这里只做文档操作和编排。
 */
class RecordStore {
  #document = $state<model.ChunkDocument | null>(null)
  summaries = $state<storage.DocumentSummary[]>([])
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

    storage.migrate()
    this.#refresh()

    // `AL_document` 是「上一次关页面时正在编辑的那份」，存了就直接恢复，
    // 刷新回到原来的文档，而不是又开一份 "New xxxxxxxx"。
    this.#document = storage.read_working() ?? model.create_document(`New ${nanoid(8)}`, [])
    this.#ready = true
  }

  #refresh(): void {
    this.summaries = storage.list()
  }

  save_document(): void {
    // 还没 init（或者 SSR）时没有真文档，别把占位的空文档写进库里。
    if (!browser || this.#document === null) return

    this.#document.modifiedAt = model.now()
    storage.write(this.#document)
    storage.write_working(this.#document)
    this.#refresh()
    toasts.add_toast('文档已保存', `(${dayjs().format('HH:mm:ss')}) ${this.#document.title}`)
  }

  load_document(id: string, interactive = true): void {
    const document = storage.read(id)
    if (document === null) {
      if (interactive) void dialogs.alert('找不到这份文档，可能已被删除。')
      return
    }
    this.#document = document
    storage.write_working(document)
  }

  async import_document(json_string: string): Promise<void> {
    const imported = model.from_json(JSON.parse(json_string))
    const answer = await dialogs.prompt('导入为新文档，给它起个名字：', imported.title)
    imported.title = answer?.trim() || imported.title
    // 导入是「新开一份」：沿用文件里的 id 会覆盖掉同 id 的那份存档。
    imported.id = nanoid()
    this.#document = imported
    this.save_document()
  }

  delete_document(id: string): void {
    if (!browser) return

    storage.remove(id)

    // 删掉的正好是手上这份：换一份新的。否则它会留在编辑器里，
    // 下一次保存（新建、AI 替换都会先保存）又把它写回库里。
    if (this.#document?.id === id) {
      this.#document = model.create_document(`New ${nanoid(8)}`, [])
      storage.write_working(this.#document)
    }

    this.#refresh()
  }

  /**
   * 打开 MCP 给的草稿。它是从外面进来的一份新文档，不该顶掉手上这份的身份：
   * 旧代码按标题覆盖同名存档，那是静默丢数据；这里宁可多一行。
   */
  load_draft(document: model.ChunkDocument): void {
    this.#document = document
    this.save_document()
  }

  /**
   * 用 AI 返回的内容整份替换当前文档，并立即落盘——AI 页不经过首页的保存按钮。
   * 身份必须沿用（见 model.replace_content）：换了 id 就不是替换，而是新开一份，
   * 库里会多出一行同名文档，跟「导入会整份替换」这句提示对不上。
   */
  replace_document(document: model.ChunkDocument): void {
    this.#document = model.replace_content(this.doc, document)
    this.save_document()
  }

  new_document(): void {
    this.save_document()
    this.#document = model.create_document(`New ${nanoid(8)}`, [])
    storage.write_working(this.doc)
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
