import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const sql=readFileSync(new URL('../migrations/20260929010000_private_signals.sql',import.meta.url),'utf8');
test('raw events and leads have RLS but no client SELECT',()=>{
  for(const table of ['visitor_events','partner_metrics','consented_leads']) assert.match(sql,new RegExp(`alter table public\\.${table} enable row level security;`));
  assert.doesNotMatch(sql,/create policy \w+ on public\.(visitor_events|consented_leads) for select/i);
  assert.match(sql,/revoke all on public\.consented_leads from anon,authenticated;/);
});
test('event insert binds authenticated identity and aggregate reads bind partner',()=>{
  assert.match(sql,/visitor_id=\(select auth\.uid\(\)\)/);
  assert.match(sql,/app\.is_member\(workspace_id,array\['owner','admin','editor','viewer'\]\)/);
  assert.match(sql,/distinct_visitors>=20/);
});
