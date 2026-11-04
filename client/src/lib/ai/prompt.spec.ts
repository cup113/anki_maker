import { describe, expect, it } from 'vitest'

import { CardParseError, parse_reply } from './prompt'

describe('parse_reply', () => {
  it('reads a whole document', () => {
    const document = parse_reply(
      JSON.stringify({
        title: '现在完成时',
        deckType: 'two-sides',
        footer: '例句来自 BBC',
        records: [{ level: 'A', front: 'I have eaten', back: '我已经吃了' }],
      }),
    )

    expect(document.title).toBe('现在完成时')
    expect(document.deckType).toBe('two-sides')
    expect(document.footer).toBe('例句来自 BBC')
    expect(document.records).toHaveLength(1)
    expect(document.records[0].front).toBe('I have eaten')
  })

  it('reads a fenced block surrounded by chat', () => {
    const reply = `好的，这是你要的卡组：

\`\`\`json
{ "title": "交通", "records": [{ "front": "einkaufen", "back": "购物" }] }
\`\`\`

需要更多可以再告诉我。`

    const document = parse_reply(reply)

    expect(document.title).toBe('交通')
    expect(document.records).toHaveLength(1)
  })

  it('fills title, deckType and footer when the model omits them', () => {
    const document = parse_reply('{ "records": [{ "front": "a", "back": "b" }] }')

    expect(document.title).toBe('未命名文档')
    expect(document.deckType).toBe('one-side')
    expect(document.footer).toBe('')
  })

  it('still accepts a bare array', () => {
    const document = parse_reply('[{"front":"a","back":"b"}]')

    expect(document.records).toHaveLength(1)
    expect(document.title).toBe('未命名文档')
  })

  it('falls back to one-side for an unknown deckType', () => {
    const document = parse_reply('{ "deckType": "cloze", "records": [{"front":"a","back":"b"}] }')

    expect(document.deckType).toBe('one-side')
  })

  it('keeps additions and defaults their icon', () => {
    const document = parse_reply(
      '{"records":[{"front":"a","back":"b","additions":[{"front":"例句","back":"释义"}]}]}',
    )

    expect(document.records[0].additions).toHaveLength(1)
    expect(document.records[0].additions[0].icon).toBe('→')
  })

  it('drops cards with neither side filled', () => {
    const document = parse_reply('{"records":[{"front":"","back":""},{"front":"a","back":"b"}]}')

    expect(document.records).toHaveLength(1)
    expect(document.records[0].front).toBe('a')
  })

  it('rejects an empty reply', () => {
    expect(() => parse_reply('   ')).toThrow(CardParseError)
  })

  it('rejects prose with no JSON in it', () => {
    expect(() => parse_reply('抱歉，我无法完成这个请求。')).toThrow(CardParseError)
  })

  it('rejects a document with no records', () => {
    expect(() => parse_reply('{ "title": "空" }')).toThrow(CardParseError)
  })

  it('rejects an empty record list', () => {
    expect(() => parse_reply('{ "records": [] }')).toThrow(CardParseError)
  })
})
