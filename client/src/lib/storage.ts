import { encode as encode_base64 } from 'js-base64'

import { from_json, type ChunkDocument } from './model'

/**
 * 浏览器里的文档库：localStorage 里的所有 Document，按 id 索引。
 *
 * 存档分三处：
 * - `AL_index`：`[{ id, title }]`，只记顺序和标题。条数与时间不放进索引 ——
 *   那会和文档本身各说一套 —— 所以 `list()` 按索引逐份读存档、解码后再汇总；
 * - `AL_doc_<id>`：每份文档本身；
 * - `AL_document`：上次关页面时正在编辑的那份（工作副本），它不一定在索引里。
 *
 * 主键是 id 而不是标题。标题可以随时改、也允许重名；拿它当主键的话，
 * 改成已有的标题会覆盖那一份的记录，改个名字又会留下一份读不到的死键。
 * 索引只在 write/remove 里维护，所以它不会和存档脱节。
 */

const INDEX_KEY = 'AL_index'
const WORKING_KEY = 'AL_document'
const DOC_PREFIX = 'AL_doc_'

// v4 及更早的存档：标题就是主键，键名是 AL_records_<base64(标题)>。
const LEGACY_INDEX_KEY = 'AL_recordStorageIds'
const LEGACY_WORKING_KEY = 'AL_chunkDocument'
const LEGACY_PREFIX = 'AL_records_'

export type DocumentSummary = {
  id: string
  title: string
  /** 词条数量（Record 的条数）。 */
  amount: number
  createdAt: string
  modifiedAt: string
}

type IndexEntry = { id: string; title: string }

/** 服务端渲染和单元测试里没有 localStorage，所有操作都要能安静地不做。 */
function available(): boolean {
  return typeof localStorage !== 'undefined'
}

function read_json(key: string): unknown {
  if (!available()) return null
  const raw = localStorage.getItem(key)
  if (raw === null) return null
  try {
    return JSON.parse(raw)
  } catch {
    return null
  }
}

function doc_key(id: string): string {
  return `${DOC_PREFIX}${id}`
}

function read_index(): IndexEntry[] {
  const raw = read_json(INDEX_KEY)
  if (!Array.isArray(raw)) return []

  const entries: IndexEntry[] = []
  for (const item of raw) {
    const entry = item as Partial<IndexEntry> | null
    if (typeof entry?.id === 'string' && typeof entry.title === 'string') {
      entries.push({ id: entry.id, title: entry.title })
    }
  }
  return entries
}

function write_index(entries: IndexEntry[]): void {
  if (!available()) return
  localStorage.setItem(INDEX_KEY, JSON.stringify(entries))
}

/** 旧存档的标题是主键，这里按标题算出稳定的 id —— 重跑迁移只会覆盖同一批键。 */
function legacy_id(title: string): string {
  return `migrated-${encode_base64(title)}`
}

/** 删掉旧布局的键。放在迁移提交之后，中途崩了也只是多留几个死键。 */
function purge_legacy(): void {
  const titles = read_json(LEGACY_INDEX_KEY)
  if (Array.isArray(titles)) {
    for (const title of titles) {
      if (typeof title === 'string') {
        localStorage.removeItem(`${LEGACY_PREFIX}${encode_base64(title)}`)
      }
    }
  }
  localStorage.removeItem(LEGACY_INDEX_KEY)
  localStorage.removeItem(LEGACY_WORKING_KEY)
}

/**
 * 把标题主键的旧存档搬到 id 主键上。`init()` 里跑一次。
 *
 * 每一步都幂等：`legacy_id` 按标题算出 id，重跑只会覆盖同一批键，所以顺序是
 * 「先写新键 → 再合并索引 → 最后删旧键」，崩在任何一步、重跑都对。
 *
 * 这里不做「索引已经存在就直接清理」的短路。部署之后仍可能有一个没刷新的
 * 旧标签页按旧格式写存档 —— 那是数据，不是垃圾，必须先导入再删。
 */
export function migrate(): void {
  if (!available()) return

  const entries = read_index()
  let changed = false

  const titles = read_json(LEGACY_INDEX_KEY)
  if (Array.isArray(titles)) {
    for (const title of titles) {
      if (typeof title !== 'string') continue
      const stored = read_json(`${LEGACY_PREFIX}${encode_base64(title)}`)
      if (stored === null) continue

      const document = from_json(stored)
      document.id = legacy_id(title)
      document.title = title
      localStorage.setItem(doc_key(document.id), JSON.stringify(document))
      if (!entries.some((entry) => entry.id === document.id)) {
        entries.push({ id: document.id, title })
      }
      changed = true
    }
  }

  const working = read_json(LEGACY_WORKING_KEY)
  if (working !== null) {
    const document = from_json(working)
    // 工作副本不一定存过：它进了索引就等于谎称它在文档库里。
    // 标题和某份存档对得上，就认那一份的 id，打开它就像打开那份文档。
    const known = entries.find((entry) => entry.title === document.title)
    document.id = known?.id ?? legacy_id(document.title)
    localStorage.setItem(WORKING_KEY, JSON.stringify(document))
    changed = true
  }

  if (changed || localStorage.getItem(INDEX_KEY) === null) {
    write_index(entries)
  }
  purge_legacy()
}

export function list(): DocumentSummary[] {
  const summaries: DocumentSummary[] = []
  for (const entry of read_index()) {
    const document = read(entry.id)
    if (document === null) continue
    summaries.push({
      id: document.id,
      title: document.title || entry.title,
      amount: document.records.length,
      createdAt: document.createdAt,
      modifiedAt: document.modifiedAt,
    })
  }
  return summaries
}

/** 读一份存档。id 以键为准 —— 字段里的 id 只是副本，可以漂。 */
export function read(id: string): ChunkDocument | null {
  const stored = read_json(doc_key(id))
  if (stored === null) return null

  const document = from_json(stored)
  document.id = id
  return document
}

/** 写入或覆盖 `document.id` 那一份，同时把索引里的标题改成现在的。 */
export function write(document: ChunkDocument): void {
  if (!available()) return

  localStorage.setItem(doc_key(document.id), JSON.stringify(document))

  const entries = read_index()
  const index = entries.findIndex((entry) => entry.id === document.id)
  const entry = { id: document.id, title: document.title }
  if (index === -1) {
    entries.push(entry)
  } else {
    entries[index] = entry
  }
  write_index(entries)
}

/**
 * 删掉一份存档和它的索引条目。
 *
 * 它要正好是工作副本，工作副本也一起清掉：否则下次 `init()` 会把它捡回来，
 * 紧接着的一次保存又把它写回库里 —— 删了等于没删。
 */
export function remove(id: string): void {
  if (!available()) return

  localStorage.removeItem(doc_key(id))
  write_index(read_index().filter((entry) => entry.id !== id))

  const working = read_json(WORKING_KEY) as { id?: unknown } | null
  if (working?.id === id) localStorage.removeItem(WORKING_KEY)
}

export function read_working(): ChunkDocument | null {
  const stored = read_json(WORKING_KEY)
  return stored === null ? null : from_json(stored)
}

export function write_working(document: ChunkDocument): void {
  if (!available()) return
  localStorage.setItem(WORKING_KEY, JSON.stringify(document))
}
