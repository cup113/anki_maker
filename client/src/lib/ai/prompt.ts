import { nanoid } from 'nanoid'

import {
  create_document,
  type Addition,
  type ChunkDocument,
  type ChunkRecord,
  type DeckType,
} from '../model'

/**
 * 给任何 AI 用的一段话。它必须自己说清楚要什么：没有 MCP 的窗口里，
 * 这是唯一的约定——模型只会照着这段文字输出，没有工具签名可看。
 * 形状给骨架而不是填好的样例，否则模型会照着样例凭空补字段。
 */
export const CARD_PROMPT = `帮我把这些内容整理成 Anki 卡片。只输出一个 JSON 对象，不要解释，也不要 Markdown 代码块。

我可能会附上图片、PDF 或文本文件，请直接根据附件内容整理；没有附件时，就按我这句话里的主题来。

JSON 的形状如下，字段名照抄：
{
  "title": "文档标题",
  "deckType": "one-side",
  "footer": "页脚注记，可留空",
  "records": [
    { "level": "A", "front": "正面（提示）", "back": "背面（答案）" }
  ]
}

字段说明
- title：这份卡组的名字，一句话概括主题
- deckType：one-side 只看正面回忆背面；two-sides 正反都考；type 打字输入。按内容自己选一个
- footer：放在文档末尾的一两句说明，比如语法提示或来源；没有就写 ""
- records：一张卡片一项，按原文顺序排列；每项的字段只写 level、front、back、additions
- level：用来分组，同一主题或难度用同一个字母（A、B、C…），分不出来就写 "-"
- front / back：正面是提示，背面是答案；可以用 <b> <i> <sub> 标签
- additions：可选。只有原文本来就有例句或补充说明时才加，形如
  [{ "icon": "→", "front": "例句", "back": "释义" }]；没有就省略，不要自己编

第一个字符是 {，最后一个字符是 }，中间不要有别的东西。`

type RawDocument = {
  title?: unknown
  deckType?: unknown
  footer?: unknown
  records?: unknown
}

type RawCard = {
  level?: unknown
  front?: unknown
  back?: unknown
  additions?: unknown
}

export class CardParseError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'CardParseError'
  }
}

/** 模型习惯把 JSON 包在 ``` 里，前后还爱加一句「好的」。 */
function strip_fence(text: string): string {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i)
  return fenced?.[1] ?? text
}

function read_json(source: string): unknown {
  const start = Math.min(
    ...[source.indexOf('['), source.indexOf('{')].filter((index) => index >= 0),
  )
  const end = Math.max(source.lastIndexOf(']'), source.lastIndexOf('}'))
  const candidates = [source]
  if (Number.isFinite(start) && end > start) {
    candidates.push(source.slice(start, end + 1))
  }

  for (const candidate of candidates) {
    try {
      return JSON.parse(candidate)
    } catch {
      continue
    }
  }

  throw new CardParseError('不是合法的 JSON')
}

function as_text(value: unknown): string {
  if (typeof value === 'string') return value
  if (typeof value === 'number') return String(value)
  return ''
}

function as_deck_type(value: unknown): DeckType {
  return value === 'two-sides' || value === 'type' ? value : 'one-side'
}

function to_addition(raw: unknown): Addition {
  const item = (raw ?? {}) as { icon?: unknown; front?: unknown; back?: unknown }
  return {
    id: nanoid(),
    icon: as_text(item.icon) || '→',
    front: as_text(item.front),
    back: as_text(item.back),
  }
}

function to_record(raw: unknown): ChunkRecord {
  const card = (raw ?? {}) as RawCard
  const additions = Array.isArray(card.additions) ? card.additions.map(to_addition) : []
  return {
    id: nanoid(),
    level: as_text(card.level) || '-',
    front: as_text(card.front),
    back: as_text(card.back),
    additions,
  }
}

function build_document(raw: RawDocument, list: unknown[]): ChunkDocument {
  const records = list.map(to_record).filter((record) => record.front.trim() || record.back.trim())
  if (records.length === 0) {
    throw new CardParseError('没有可用的卡片')
  }

  const document = create_document(as_text(raw.title).trim() || '未命名文档', records)
  document.deckType = as_deck_type(raw.deckType)
  document.footer = as_text(raw.footer)
  return document
}

/**
 * 回复应当是一整份文档；裸数组和 `{"records": …}` 仍然收下，
 * 少掉的 title / deckType / footer 用默认值补齐。
 */
export function parse_reply(text: string): ChunkDocument {
  if (!text.trim()) {
    throw new CardParseError('先粘贴 AI 的回复')
  }

  const data = read_json(strip_fence(text).trim())
  if (Array.isArray(data)) {
    return build_document({}, data)
  }
  if (data === null || typeof data !== 'object') {
    throw new CardParseError('不是合法的 JSON')
  }

  const raw = data as RawDocument
  if (!Array.isArray(raw.records)) {
    throw new CardParseError('没有找到 records 数组')
  }

  return build_document(raw, raw.records)
}
