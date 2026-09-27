import assert from 'node:assert/strict'
import test from 'node:test'
import { readFileSync } from 'node:fs'
import ts from 'typescript'
const source = readFileSync(new URL('../lib/feed.ts', import.meta.url), 'utf8')
const output = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText
const mod = { exports: {} }; new Function('module', 'exports', output)(mod, mod.exports)
const { DEMO_FEED, GUEST_WORK_LIMIT, feedWindow, publicContextFor } = mod.exports
const guest = { kind: 'guest' }

test('guest pagination ends after ten unique approved works and signals account gate', () => {
  assert.equal(GUEST_WORK_LIMIT, 10)
  const a = feedWindow(DEMO_FEED, guest, 0)
  const b = feedWindow(DEMO_FEED, guest, a.nextCursor)
  const c = feedWindow(DEMO_FEED, guest, b.nextCursor)
  assert.deepEqual([a.visible.length,b.visible.length,c.visible.length], [4,4,2])
  assert.equal(c.nextCursor, null); assert.equal(c.gate, true)
  assert.deepEqual(feedWindow(DEMO_FEED, guest, 10).visible, [])
})
test('no gate when fewer than ten public works, and no duplicate or unpublished leak', () => {
  const items = [...DEMO_FEED.slice(0, 3), {...DEMO_FEED[0]}, {...DEMO_FEED[3], publicApproved:false}]
  const page = feedWindow(items, guest, 0)
  assert.equal(page.visible.length, 3); assert.equal(page.gate, false)
  assert.equal(publicContextFor(items, 'demo-work-4', new Set(page.visible.map((item) => item.id))), null)
})
test('previously viewed public context remains readable past guest limit', () => {
  const visited = new Set(['demo-work-1'])
  assert.equal(publicContextFor(DEMO_FEED, 'demo-work-1', visited)?.title, 'Study 01')
  assert.equal(publicContextFor(DEMO_FEED, 'demo-work-11', visited), null)
  assert.equal(publicContextFor(DEMO_FEED, 'bad', visited), null)
})
test('account access is an explicit verified input to the pure function, not a client self-assertion', () => {
  const a = feedWindow(DEMO_FEED, {kind:'account',userId:'verified-by-server'}, 8)
  assert.equal(a.visible.length, 4); assert.equal(a.gate, false)
  assert.throws(() => feedWindow(DEMO_FEED, guest, -1), RangeError)
  assert.throws(() => feedWindow(DEMO_FEED, guest, 0, 0), RangeError)
})
