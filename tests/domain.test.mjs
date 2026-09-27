import assert from 'node:assert/strict'
import test from 'node:test'

function boundText(value, max) {
  if (typeof value !== 'string') return null
  const clean = value.trim()
  if (!clean || clean.length > max) return null
  return clean
}

function readJournal(raw) {
  if (!raw) return {}
  try {
    const value = JSON.parse(raw)
    if (!value || typeof value !== 'object' || Array.isArray(value)) return {}
    return Object.fromEntries(Object.entries(value).filter(([, entry]) => entry && typeof entry === 'object' && typeof entry.saved === 'boolean' && typeof entry.reflection === 'string'))
  } catch { return {} }
}

test('boundText trims and enforces required maximum', () => {
  assert.equal(boundText('  linen ', 20), 'linen')
  assert.equal(boundText('', 20), null)
  assert.equal(boundText('too long', 3), null)
  assert.equal(boundText(42, 20), null)
})

test('readJournal fails safely and drops malformed entries', () => {
  assert.deepEqual(readJournal('{broken'), {})
  assert.deepEqual(readJournal('[1,2]'), {})
  assert.deepEqual(readJournal(JSON.stringify({ good: { saved: true, reflection: 'A note', updatedAt: 'now' }, bad: { saved: 'yes' } })), { good: { saved: true, reflection: 'A note', updatedAt: 'now' } })
})
