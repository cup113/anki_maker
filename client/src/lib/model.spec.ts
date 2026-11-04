import { describe, expect, it } from 'vitest'

import { create_document, default_addition, default_record, fingerprint } from './model'

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
