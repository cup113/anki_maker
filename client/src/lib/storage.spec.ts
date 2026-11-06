import { encode as encode_base64 } from 'js-base64'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { create_document, default_record, replace_content } from './model'
import * as storage from './storage'

class MemoryStorage {
  #data = new Map<string, string>()

  getItem(key: string): string | null {
    return this.#data.get(key) ?? null
  }

  setItem(key: string, value: string): void {
    this.#data.set(key, value)
  }

  removeItem(key: string): void {
    this.#data.delete(key)
  }

  keys(): string[] {
    return [...this.#data.keys()]
  }
}

let memory: MemoryStorage

beforeEach(() => {
  memory = new MemoryStorage()
  vi.stubGlobal('localStorage', memory)
})

function doc_keys(): string[] {
  return memory.keys().filter((key) => key.startsWith('AL_doc_'))
}

describe('migrate', () => {
  const saved = '时态练习'
  const unsaved = '草稿'
  const legacy_key = `AL_records_${encode_base64(saved)}`

  beforeEach(() => {
    memory.setItem('AL_recordStorageIds', JSON.stringify([saved]))
    memory.setItem(
      legacy_key,
      JSON.stringify({
        version: 4,
        title: saved,
        records: [{ front: 'a', back: 'b' }],
        deckType: 'two-sides',
      }),
    )
    memory.setItem('AL_chunkDocument', JSON.stringify({ version: 4, title: unsaved, records: [] }))
  })

  it('moves saved documents onto id keys', () => {
    storage.migrate()

    const summaries = storage.list()
    expect(summaries).toHaveLength(1)
    expect(summaries[0].title).toBe(saved)
    expect(summaries[0].amount).toBe(1)
    expect(storage.read(summaries[0].id)?.deckType).toBe('two-sides')
  })

  it('keeps the working document out of the library', () => {
    storage.migrate()

    expect(storage.read_working()?.title).toBe(unsaved)
    expect(storage.list().map((summary) => summary.title)).not.toContain(unsaved)
  })

  it('removes the legacy keys', () => {
    storage.migrate()

    expect(memory.getItem('AL_recordStorageIds')).toBeNull()
    expect(memory.getItem('AL_chunkDocument')).toBeNull()
    expect(memory.getItem(legacy_key)).toBeNull()
  })

  it('can run twice without duplicating anything', () => {
    storage.migrate()
    const after_first = memory.keys().sort()

    storage.migrate()

    expect(memory.keys().sort()).toEqual(after_first)
    expect(storage.list()).toHaveLength(1)
  })
})

describe('write', () => {
  it('keeps one entry when a document is renamed', () => {
    const document = create_document('旧名', [])
    storage.write(document)

    document.title = '新名'
    storage.write(document)

    const summaries = storage.list()
    expect(summaries).toHaveLength(1)
    expect(summaries[0].title).toBe('新名')
    expect(doc_keys()).toHaveLength(1)
  })

  it('lets two documents share a title without overwriting each other', () => {
    const first = create_document('同名', [])
    first.records.push(default_record())
    const second = create_document('同名', [])

    storage.write(first)
    storage.write(second)

    const summaries = storage.list()
    expect(summaries).toHaveLength(2)
    expect(summaries.find((summary) => summary.id === first.id)?.amount).toBe(1)
    expect(summaries.find((summary) => summary.id === second.id)?.amount).toBe(0)
  })
})

describe('read', () => {
  it('answers null for a document that is not there', () => {
    expect(storage.read('missing')).toBeNull()
  })

  it('takes the id from the key', () => {
    memory.setItem('AL_doc_x', JSON.stringify({ id: 'stale', title: 't' }))

    expect(storage.read('x')?.id).toBe('x')
  })
})

describe('remove', () => {
  it('drops the document and its index entry', () => {
    const document = create_document('要删的', [])
    storage.write(document)

    storage.remove(document.id)

    expect(storage.list()).toEqual([])
    expect(doc_keys()).toHaveLength(0)
  })

  it('clears the working copy when the removed document is the one being edited', () => {
    const document = create_document('正在编辑', [])
    storage.write(document)
    storage.write_working(document)

    storage.remove(document.id)

    // 留着它，下次 init() 会把它捡回来，再被一次保存写回库里。
    expect(storage.read_working()).toBeNull()
  })
})

describe('migrate after the index already exists', () => {
  it('imports a legacy save that arrived after the index was written', () => {
    storage.migrate()
    expect(memory.getItem('AL_index')).not.toBeNull()

    // 部署之后仍有一个没刷新的旧标签页，按旧格式保存了一次。
    const title = '旧标签页写的'
    const legacy_key = `AL_records_${encode_base64(title)}`
    memory.setItem('AL_recordStorageIds', JSON.stringify([title]))
    memory.setItem(legacy_key, JSON.stringify({ version: 4, title, records: [{ front: 'a' }] }))

    storage.migrate()

    expect(storage.list().map((summary) => summary.title)).toEqual([title])
    expect(memory.getItem(legacy_key)).toBeNull()
  })
})

describe('replacing the current document', () => {
  it('leaves one entry, carrying the replacement content', () => {
    const current = create_document('时态', [default_record()])
    storage.write(current)
    expect(storage.list()).toHaveLength(1)

    const replacement = create_document('时态', [default_record(), default_record()])
    storage.write(replace_content(current, replacement))

    const summaries = storage.list()
    expect(summaries).toHaveLength(1)
    expect(summaries[0].id).toBe(current.id)
    expect(summaries[0].amount).toBe(2)
  })
})
