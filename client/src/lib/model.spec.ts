import { describe, expect, it } from 'vitest'

import {
  LATEST_VERSION,
  create_document,
  default_addition,
  default_record,
  fingerprint,
  from_json,
  replace_content,
} from './model'

function sample() {
  const record = default_record()
  record.level = 'A'
  record.front = '<p>I have eaten</p>'
  record.back = '<p>我已经吃了</p>'
  const addition = default_addition()
  addition.front = '<p>例句</p>'
  addition.back = '<p>释义</p>'
  record.additions.push(addition)
  return create_document('时态练习', [record])
}

describe('fingerprint', () => {
  it('stays equal when only ids and timestamps differ', () => {
    const a = sample()
    const b = sample()
    a.createdAt = '2020-01-01 00:00:00'
    b.modifiedAt = '2026-11-04 21:00:00'

    expect(fingerprint(a)).toBe(fingerprint(b))
  })

  it('changes when a card is edited', () => {
    const before = fingerprint(sample())
    const after = sample()
    after.records[0].back = '<p>改过了</p>'

    expect(fingerprint(after)).not.toBe(before)
  })

  it('changes when the deck type changes', () => {
    const before = fingerprint(sample())
    const after = sample()
    after.deckType = 'two-sides'

    expect(fingerprint(after)).not.toBe(before)
  })

  it('changes when an addition is edited', () => {
    const before = fingerprint(sample())
    const after = sample()
    after.records[0].additions[0].back = '<p>另一条释义</p>'

    expect(fingerprint(after)).not.toBe(before)
  })

  it('changes when cards are reordered', () => {
    const before = sample()
    const second = default_record()
    second.front = '<p>second</p>'
    before.records.push(second)

    const after = sample()
    after.records.unshift(second)

    expect(fingerprint(after)).not.toBe(fingerprint(before))
  })
})

describe('from_json', () => {
  it('keeps a card with neither side filled', () => {
    // 刚新建的词条就是这样的：解码删掉它，等于删用户的数据。
    const document = from_json({ records: [{ front: '', back: '' }] })

    expect(document.records).toHaveLength(1)
  })

  it('leaves the title alone so the caller can pick a default', () => {
    expect(from_json({ records: [] }).title).toBe('')
  })

  it('reads a document written with no version field', () => {
    const document = from_json({
      title: '交通',
      deckType: 'two-sides',
      footer: '来自 BBC',
      records: [{ front: 'einkaufen', back: '购物' }],
    })

    expect(document.deckType).toBe('two-sides')
    expect(document.footer).toBe('来自 BBC')
  })

  it('gives every document an id and keeps one it was handed', () => {
    expect(from_json({}).id).toBeTruthy()
    expect(from_json({ id: 'known' }).id).toBe('known')
  })

  it('stamps the current version rather than the one it read', () => {
    expect(from_json({ version: 1 }).version).toBe(LATEST_VERSION)
  })

  it('takes a bare array as a document with no title', () => {
    const document = from_json([{ front: 'a', back: 'b' }])

    expect(document.title).toBe('')
    expect(document.records).toHaveLength(1)
  })

  it('survives shapes it cannot read', () => {
    expect(() => from_json('nonsense')).not.toThrow()
    expect(from_json(null).records).toEqual([])
    expect(from_json({ records: 'not a list' }).records).toEqual([])
  })
})

describe('replace_content', () => {
  it('keeps the identity of the document it replaces and takes the new content', () => {
    const current = sample()
    current.createdAt = '2020-01-01 00:00:00'

    const next = sample()
    next.title = '改过的'
    next.modifiedAt = '2026-11-07 01:00:00'

    const merged = replace_content(current, next)

    expect(merged.id).toBe(current.id)
    expect(merged.createdAt).toBe('2020-01-01 00:00:00')
    expect(merged.title).toBe('改过的')
    expect(merged.modifiedAt).toBe('2026-11-07 01:00:00')
  })
})
