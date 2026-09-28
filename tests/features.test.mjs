import assert from 'node:assert/strict'
import test from 'node:test'
import { readFileSync } from 'node:fs'
import ts from 'typescript'
const source = readFileSync(new URL('../lib/features.ts', import.meta.url), 'utf8')
const output = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText
const mod = { exports: {} }
new Function('module', 'exports', output)(mod, mod.exports)
const { FEATURES, isFeatureId } = mod.exports

test('seven unique canonical Art feature IDs and names', () => {
  assert.equal(FEATURES.length, 7)
  assert.equal(new Set(FEATURES.map((f) => f.id)).size, 7)
  assert.deepEqual(FEATURES.map((f) => f.name), ['Art Feed','Art Chat','Art Community','Art Map','Art Recognition','Art Taste','Art Mecena'])
})
test('feature identity is type-safe at runtime for untrusted route values', () => {
  assert.equal(isFeatureId('feed'), true)
  assert.equal(isFeatureId('mecena'), true)
  assert.equal(isFeatureId('payments'), false)
  assert.equal(isFeatureId(null), false)
})
