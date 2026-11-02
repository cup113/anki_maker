import { nanoid } from 'nanoid'

import { Addition, ChunkRecord } from '@/stores/record'

/**
 * 给任何 AI 用的一段话。它必须自己说清楚要什么：没有 MCP 的窗口里，
 * 这是唯一的约定——模型只会照着这段文字输出，没有工具签名可看。
 */
export const CARD_PROMPT = `帮我把这些内容整理成 Anki 卡片，只输出 JSON 数组，不要解释，也不要 Markdown 代码块。

我可能会附上图片、PDF 或文本文件，请直接根据附件内容整理。

每一项这样写：
{ "level": "A", "front": "正面（提示）", "back": "背面（答案）" }

additions 是可选的：只有原文本来就有例句或补充说明时才加，形如
[{ "icon": "→", "front": "例句", "back": "释义" }]；没有就省略，不要自己编。

规则
- level 用来分组：同一主题或难度用同一个字母（A、B、C…），分不出来就写 "-"
- front 是提示，back 是答案，都可以用 <b> <i> <sub> 标签
- 一个词条一项，按出现顺序排列`

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

function to_addition(raw: unknown): Addition {
  const item = (raw ?? {}) as { icon?: unknown; front?: unknown; back?: unknown }
  return new Addition(nanoid(), as_text(item.icon) || '→', as_text(item.front), as_text(item.back))
}

function to_record(raw: unknown): ChunkRecord {
  const card = (raw ?? {}) as RawCard
  const additions = Array.isArray(card.additions) ? card.additions.map(to_addition) : []
  return new ChunkRecord(
    nanoid(),
    as_text(card.level) || '-',
    as_text(card.front),
    as_text(card.back),
    additions,
  )
}

/** 接受 `[{...}]` 和 `{"records": [...]}` 两种形状；空卡片丢弃。 */
export function parse_cards(text: string): ChunkRecord[] {
  if (!text.trim()) {
    throw new CardParseError('先粘贴 AI 的回复')
  }

  const data = read_json(strip_fence(text).trim())
  const list = Array.isArray(data) ? data : (data as { records?: unknown } | null)?.records
  if (!Array.isArray(list)) {
    throw new CardParseError('没有找到卡片数组')
  }

  const records = list.map(to_record).filter((record) => record.front.trim() || record.back.trim())
  if (records.length === 0) {
    throw new CardParseError('没有可用的卡片')
  }

  return records
}
