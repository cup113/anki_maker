import dayjs from 'dayjs'
import { nanoid } from 'nanoid'

export type DeckType = 'one-side' | 'two-sides' | 'type'

export type Addition = {
  id: string
  icon: string
  front: string
  back: string
}

export type ChunkRecord = {
  id: string
  level: string
  front: string
  back: string
  additions: Addition[]
}

export type Section = { abbr: string; full: string }

export type ChunkDocument = {
  /** 存档身份。标题可以改、可以重名，它不可以。 */
  id: string
  version: number
  title: string
  records: ChunkRecord[]
  sections: Section[][]
  footer: string
  deckType: DeckType
  createdAt: string
  modifiedAt: string
}

export const LATEST_VERSION = 5

export const deckTypes: { value: DeckType; label: string }[] = [
  { value: 'one-side', label: '单面卡片' },
  { value: 'two-sides', label: '双面卡片' },
  { value: 'type', label: '输入卡片' },
]

export function now(): string {
  return dayjs().format('YYYY-MM-DD HH:mm:ss')
}

/**
 * 导出缓存用的内容指纹：只认真正会进 docx/apkg 的字段。
 * createdAt / modifiedAt 每次保存都变，放进来会让缓存永远失效。
 */
export function fingerprint(document: ChunkDocument): string {
  return JSON.stringify([
    document.title,
    document.deckType,
    document.footer,
    document.records.map((record) => [
      record.level,
      record.front,
      record.back,
      record.additions.map((addition) => [addition.icon, addition.front, addition.back]),
    ]),
  ])
}

export function create_document(title: string, records: ChunkRecord[]): ChunkDocument {
  return {
    id: nanoid(),
    version: LATEST_VERSION,
    title,
    records,
    sections: [],
    footer: '',
    deckType: 'one-side',
    createdAt: now(),
    modifiedAt: now(),
  }
}

/**
 * 用 next 的内容换掉 current，但留住 current 的身份（id 与创建时间）。
 * 「整份替换当前文档」必须走这里：换了 id 就是新开一份，库里会多出一行同名文档。
 */
export function replace_content(current: ChunkDocument, next: ChunkDocument): ChunkDocument {
  return { ...next, id: current.id, createdAt: current.createdAt }
}

export function default_record(): ChunkRecord {
  return { id: nanoid(), level: '-', front: '', back: '', additions: [] }
}

export function default_addition(): Addition {
  return { id: nanoid(), icon: '→', front: '', back: '' }
}

export function add_record(document: ChunkDocument): void {
  document.records.push(default_record())
}

/** 在当前词条之后插入一条空词条，返回新词条的 id（键盘流用） */
export function add_record_after(document: ChunkDocument, id: string): string {
  const record = default_record()
  const index = document.records.findIndex((item) => item.id === id)
  if (index === -1) {
    document.records.push(record)
  } else {
    document.records.splice(index + 1, 0, record)
  }
  return record.id
}

export function find_record(document: ChunkDocument, id: string): ChunkRecord {
  return document.records.find((record) => record.id === id) ?? default_record()
}

export function delete_record(document: ChunkDocument, id: string): boolean {
  const index = document.records.findIndex((record) => record.id === id)
  if (index !== -1) {
    document.records.splice(index, 1)
    return true
  }
  return false
}

export function add_addition(document: ChunkDocument, id: string): string {
  const addition = default_addition()
  find_record(document, id).additions.push(addition)
  return addition.id
}

export function find_addition(document: ChunkDocument, id: string, addition_id: string): Addition {
  return (
    find_record(document, id).additions.find((addition) => addition.id === addition_id) ??
    default_addition()
  )
}

export function delete_addition(document: ChunkDocument, id: string, addition_id: string): boolean {
  const record = find_record(document, id)
  const index = record.additions.findIndex((addition) => addition.id === addition_id)
  if (index !== -1) {
    record.additions.splice(index, 1)
    return true
  }
  return false
}

function as_text(value: unknown): string {
  if (typeof value === 'string') return value
  if (typeof value === 'number') return String(value)
  return ''
}

function as_deck_type(value: unknown): DeckType {
  return value === 'two-sides' || value === 'type' ? value : 'one-side'
}

function addition_from_json(raw: unknown): Addition {
  const item = (raw ?? {}) as Partial<Addition>
  return {
    id: as_text(item.id) || nanoid(),
    icon: as_text(item.icon) || '→',
    front: as_text(item.front),
    back: as_text(item.back),
  }
}

function record_from_json(raw: unknown): ChunkRecord {
  const item = (raw ?? {}) as {
    id?: unknown
    level?: unknown
    front?: unknown
    back?: unknown
    additions?: unknown
  }
  return {
    id: as_text(item.id) || nanoid(),
    level: as_text(item.level) || '-',
    front: as_text(item.front),
    back: as_text(item.back),
    additions: Array.isArray(item.additions) ? item.additions.map(addition_from_json) : [],
  }
}

type ImportedDocument = {
  id?: unknown
  title?: unknown
  records?: unknown
  sections?: unknown
  footer?: unknown
  deckType?: unknown
  createdAt?: unknown
  modifiedAt?: unknown
}

/**
 * 不可信来源的 JSON → 一份完整的 Document。这是唯一的解码入口：
 * 存档、导入的文件、AI 的回复都从这里进。
 *
 * 只做形状归一 —— 凡是能读出来的字段都收下，读不出来的用默认值补齐，不抛错。
 * 解出来的文档一律标成当前版本：`version` 只说明「这份数据是什么形状」，
 * 没有任何代码按它分支，字段在了就收；这比维护一条版本阶梯更不容易漏。
 * 解码也不删任何词条 —— 刚新建的词条就是前后都空的，扔掉它就等于扔用户的
 * 数据；要丢掉空词条是调用方自己的策略（见 ai/prompt.ts）。
 */
export function from_json(raw: unknown): ChunkDocument {
  if (Array.isArray(raw)) {
    return create_document('', raw.map(record_from_json))
  }

  const json = (raw ?? {}) as ImportedDocument
  const records = Array.isArray(json.records) ? json.records.map(record_from_json) : []
  const document = create_document(as_text(json.title), records)

  document.id = as_text(json.id) || document.id
  document.footer = as_text(json.footer)
  document.deckType = as_deck_type(json.deckType)
  document.createdAt = as_text(json.createdAt) || document.createdAt
  document.modifiedAt = as_text(json.modifiedAt) || document.modifiedAt
  if (Array.isArray(json.sections)) {
    document.sections = json.sections as Section[][]
  }

  return document
}
