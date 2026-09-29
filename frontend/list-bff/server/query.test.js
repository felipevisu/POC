import { test } from 'node:test'
import assert from 'node:assert/strict'
import { query } from './query.js'

const rows = [
  { id: 1, date: '2026-01-01', category: 'A' },
  { id: 2, date: '2026-01-02', category: 'B' },
  { id: 3, date: '2026-01-02', category: 'A' },
  { id: 4, date: '2026-01-03', category: 'C' },
]

test('filters by date range and categories, empty categories = all', () => {
  assert.equal(query(rows, { from: '2026-01-02', to: '2026-01-03', categories: [], page: 0, pageSize: 10 }).total, 3)
  assert.equal(query(rows, { from: '2026-01-01', to: '2026-01-03', categories: ['A', 'C'], page: 0, pageSize: 10 }).total, 3)
  assert.equal(query(rows, { from: '2026-01-02', to: '2026-01-02', categories: ['A'], page: 0, pageSize: 10 }).items[0].id, 3)
})

test('paginates', () => {
  const r = query(rows, { from: '2026-01-01', to: '2026-01-03', categories: [], page: 1, pageSize: 3 })
  assert.deepEqual(r.items.map((i) => i.id), [4])
  assert.equal(r.total, 4)
})

test('searches configured fields, case-insensitive; no fields = search ignored', () => {
  const accounts = [
    { id: 1, date: '2026-01-01', category: 'A', account: 'ACC-1234' },
    { id: 2, date: '2026-01-01', category: 'A', account: 'ACC-9999' },
  ]
  const base = { from: '2026-01-01', to: '2026-01-01', categories: [], page: 0, pageSize: 10 }
  assert.deepEqual(query(accounts, { ...base, search: ' acc-12 ', searchFields: ['account'] }).items.map((i) => i.id), [1])
  assert.equal(query(accounts, { ...base, search: '1234' }).total, 2)
})
