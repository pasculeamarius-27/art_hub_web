import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const sql = readFileSync(new URL('../migrations/20260929000000_antre_foundation.sql', import.meta.url), 'utf8');
test('all foundation tables have RLS enabled', () => {
  for (const table of ['workspaces','workspace_memberships','artist_profiles','artworks','artwork_creators','curator_grants','dossier_sources','source_versions','source_approvals']) {
    assert.match(sql, new RegExp(`alter table public\\.${table} enable row level security;`));
  }
});
test('no client approval or grant write policy is added in foundation', () => {
  assert.doesNotMatch(sql, /create policy \w+ on public\.(source_approvals|workspace_memberships|curator_grants) for (insert|update|delete)/i);
  assert.match(sql, /revoke all on public\.source_approvals from anon, authenticated;/);
});
test('dossier authors are bound to authenticated identity and artwork access', () => {
  assert.match(sql, /created_by=\(select auth\.uid\(\)\) and app\.can_edit_artwork\(artwork_id\)/);
  assert.match(sql, /author_user_id=\(select auth\.uid\(\)\)/);
});
