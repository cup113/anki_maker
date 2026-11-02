import { describe, expect, it } from 'vitest'

import { CardParseError, parse_cards } from '../prompt'

describe('parse_cards', () => {
  it('reads a bare array', () => {
    const records = parse_cards('[{"level":"A","front":"aufstehen","back":"起床"}]')

    expect(records).toHaveLength(1)
    expect(records[0].level).toBe('A')
    expect(records[0].front).toBe('aufstehen')
    expect(records[0].back).toBe('起床')
  })

  it('reads a fenced block surrounded by chat', () => {
    const reply = `好的，这是你要的卡片：

\`\`\`json
[{ "front": "einkaufen", "back": "购物" }]
\`\`\`

需要更多可以再告诉我。`

    const records = parse_cards(reply)

    expect(records).toHaveLength(1)
    expect(records[0].front).toBe('einkaufen')
  })

  it('reads the records wrapper the MCP tool returns', () => {
    const records = parse_cards('{"records":[{"front":"a","back":"b"}]}')

    expect(records).toHaveLength(1)
  })

  it('fills level and additions when the model omits them', () => {
    const records = parse_cards('[{"front":"a","back":"b"}]')

    expect(records[0].level).toBe('-')
    expect(records[0].additions).toEqual([])
    expect(records[0].id).toBeTruthy()
  })

  it('keeps additions and defaults their icon', () => {
    const records = parse_cards(
      '[{"front":"a","back":"b","additions":[{"front":"例句","back":"释义"}]}]',
    )

    expect(records[0].additions).toHaveLength(1)
    expect(records[0].additions[0].icon).toBe('→')
  })

  it('drops cards with neither side filled', () => {
    const records = parse_cards('[{"front":"","back":""},{"front":"a","back":"b"}]')

    expect(records).toHaveLength(1)
    expect(records[0].front).toBe('a')
  })

  it('rejects an empty reply', () => {
    expect(() => parse_cards('   ')).toThrow(CardParseError)
  })

  it('rejects prose with no array in it', () => {
    expect(() => parse_cards('抱歉，我无法完成这个请求。')).toThrow(CardParseError)
  })

  it('rejects an empty card list', () => {
    expect(() => parse_cards('[]')).toThrow(CardParseError)
  })
})
