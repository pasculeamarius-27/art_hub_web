import assert from 'node:assert/strict'
import test from 'node:test'
import { readFileSync } from 'node:fs'
import ts from 'typescript'
const source = readFileSync(new URL('../lib/onboarding.ts', import.meta.url), 'utf8')
const output = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText
const mod = { exports: {} }
new Function('module', 'exports', output)(mod, mod.exports)
const { readOnboarding } = mod.exports

test('only explicit completed choices are accepted', () => {
  assert.deepEqual(readOnboarding('{"choice":"explore","complete":true}'), {choice:'explore', complete:true})
  assert.deepEqual(readOnboarding('{"choice":"learn","complete":true}'), {choice:'learn', complete:true})
  assert.equal(readOnboarding('{"choice":"explore","complete":false}'), null)
  assert.equal(readOnboarding('{"choice":"signup","complete":true}'), null)
})
test('corrupt or hostile-shaped storage cannot force an onboarding state', () => {
  assert.equal(readOnboarding('{broken'), null)
  assert.equal(readOnboarding('null'), null)
  assert.equal(readOnboarding('[]'), null)
  assert.equal(readOnboarding(null), null)
})
