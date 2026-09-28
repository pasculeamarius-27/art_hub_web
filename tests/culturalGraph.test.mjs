import assert from 'node:assert/strict'
import test from 'node:test'
import { readFileSync } from 'node:fs'
import ts from 'typescript'
const source = readFileSync(new URL('../lib/culturalGraph.ts', import.meta.url), 'utf8')
const output = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText
const mod = { exports: {} }; new Function('module', 'exports', output)(mod, mod.exports)
const { publicSubgraph } = mod.exports
const sourceNode = (overrides={}) => ({id:'s1',tenantId:'gallery-A',kind:'source',visibility:'public',approval:'approved',version:2,...overrides})
const workNode = (overrides={}) => ({id:'w1',tenantId:'gallery-A',kind:'artwork',visibility:'public',approval:'approved',version:1,sourceId:'s1',...overrides})
const relation = (overrides={}) => ({id:'e1',tenantId:'gallery-A',fromId:'s1',toId:'w1',kind:'describes',sourceId:'s1',sourceVersion:2,visibility:'public',approval:'approved',...overrides})
test('public graph exposes only approved provenance from the requested tenant', () => {
 const output = publicSubgraph({nodes:[sourceNode(),workNode(),workNode({id:'w2',tenantId:'gallery-B'})],edges:[relation(),relation({id:'e2',tenantId:'gallery-B',toId:'w2'})]},'gallery-A')
 assert.deepEqual(output.nodes.map(x=>x.id),['s1','w1']); assert.deepEqual(output.edges.map(x=>x.id),['e1'])
})
test('withdrawal and stale source versions invalidate dependent public graph', () => {
 for (const overrides of [{approval:'withdrawn'},{visibility:'private'}]) {
  const output = publicSubgraph({nodes:[sourceNode(overrides),workNode()],edges:[relation()]},'gallery-A')
  assert.deepEqual(output.nodes,[]); assert.deepEqual(output.edges,[])
 }
 const stale=publicSubgraph({nodes:[sourceNode(),workNode()],edges:[relation({sourceVersion:1})]},'gallery-A')
 assert.equal(stale.edges.length,0)
})
test('orphaned and unapproved relations do not leak even if endpoints are public', () => {
 const output=publicSubgraph({nodes:[sourceNode(),workNode(),workNode({id:'orphan',sourceId:'missing'})],edges:[relation({approval:'draft'}),relation({id:'e2',toId:'orphan'})]},'gallery-A')
 assert.deepEqual(output.nodes.map(x=>x.id),['s1','w1']); assert.deepEqual(output.edges,[])
})
