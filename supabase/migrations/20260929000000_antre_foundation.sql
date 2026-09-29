-- Antre / Art Voice foundation. Draft-only: no public catalog, publication or lead API yet.
-- Run in a fresh Supabase project through the migration runner, never on production by hand.
create extension if not exists pgcrypto;
create schema if not exists app;
revoke all on schema app from public, anon, authenticated;
grant usage on schema app to authenticated;

create table public.workspaces (
  id uuid primary key default gen_random_uuid(),
  kind text not null check (kind in ('gallery','artist_run_space','artist','curator')),
  name text not null check (length(btrim(name)) between 1 and 200),
  created_at timestamptz not null default now()
);
create table public.workspace_memberships (
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (role in ('owner','admin','editor','viewer')),
  created_at timestamptz not null default now(),
  primary key (workspace_id,user_id)
);
create index workspace_memberships_user_idx on public.workspace_memberships(user_id,workspace_id);
create table public.artist_profiles (
  id uuid primary key default gen_random_uuid(),
  managing_workspace_id uuid not null references public.workspaces(id),
  artist_user_id uuid references auth.users(id), -- verified artist authority, not curator credit
  public_name text not null check (length(btrim(public_name)) between 1 and 200),
  statement_draft text,
  cultural_profile_draft text,
  created_at timestamptz not null default now()
);
create index artist_profiles_workspace_idx on public.artist_profiles(managing_workspace_id);
create table public.artworks (
  id uuid primary key default gen_random_uuid(),
  managing_workspace_id uuid not null references public.workspaces(id),
  title text not null check (length(btrim(title)) between 1 and 300),
  created_at timestamptz not null default now(),
  unique (id, managing_workspace_id)
);
create index artworks_workspace_idx on public.artworks(managing_workspace_id);
create table public.artwork_creators (
  artwork_id uuid not null references public.artworks(id) on delete cascade,
  artist_id uuid not null references public.artist_profiles(id),
  credit_order integer not null check (credit_order >= 0),
  primary key (artwork_id,artist_id), unique (artwork_id,credit_order)
);
create table public.curator_grants (
  artwork_id uuid not null references public.artworks(id) on delete cascade,
  curator_user_id uuid not null references auth.users(id) on delete cascade,
  granted_by uuid not null references auth.users(id),
  created_at timestamptz not null default now(),
  revoked_at timestamptz,
  primary key (artwork_id,curator_user_id)
);
create index curator_grants_user_idx on public.curator_grants(curator_user_id,artwork_id) where revoked_at is null;
create table public.dossier_sources (
  id uuid primary key default gen_random_uuid(),
  artwork_id uuid not null references public.artworks(id) on delete cascade,
  created_by uuid not null references auth.users(id),
  source_kind text not null check (source_kind in ('artist_statement','interview','process_note','curator_note','other')),
  created_at timestamptz not null default now(),
  unique (id, artwork_id)
);
create index dossier_sources_artwork_idx on public.dossier_sources(artwork_id);
create table public.source_versions (
  id uuid primary key default gen_random_uuid(),
  source_id uuid not null references public.dossier_sources(id) on delete cascade,
  version_number integer not null check (version_number > 0),
  body text not null check (length(btrim(body)) between 1 and 50000),
  author_user_id uuid not null references auth.users(id),
  created_at timestamptz not null default now(),
  unique (source_id,version_number), unique (id,source_id)
);
create index source_versions_source_idx on public.source_versions(source_id,version_number desc);
-- Approval records are version-specific and cannot be forged by client writes.
-- A later reviewed publication migration must enforce artist + gallery approval
-- for gallery-managed works, and artist-only approval for independent artists.
-- Artist-run-space approval policy and withdrawal need explicit review.
-- Curators contribute drafts but do not replace the artist approver.
create table public.source_approvals (
  source_version_id uuid not null references public.source_versions(id) on delete cascade,
  approver_user_id uuid not null references auth.users(id),
  approver_capacity text not null check (approver_capacity in ('artist','gallery')),
  approved_at timestamptz not null default now(),
  withdrawn_at timestamptz,
  primary key (source_version_id,approver_capacity)
);

create or replace function app.is_member(w uuid, permitted text[]) returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.workspace_memberships m
    where m.workspace_id=w and m.user_id=(select auth.uid()) and m.role = any(permitted));
$$;
create or replace function app.can_edit_artwork(a uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.artworks x
    where x.id=a and (
      app.is_member(x.managing_workspace_id,array['owner','admin','editor'])
      or exists (select 1 from public.curator_grants g
        where g.artwork_id=x.id and g.curator_user_id=(select auth.uid()) and g.revoked_at is null)
      or exists (select 1 from public.artwork_creators c join public.artist_profiles p on p.id=c.artist_id
        where c.artwork_id=x.id and p.artist_user_id=(select auth.uid()))));
$$;
revoke all on function app.is_member(uuid,text[]), app.can_edit_artwork(uuid) from public, anon;
grant execute on function app.is_member(uuid,text[]), app.can_edit_artwork(uuid) to authenticated;

alter table public.workspaces enable row level security;
alter table public.workspace_memberships enable row level security;
alter table public.artist_profiles enable row level security;
alter table public.artworks enable row level security;
alter table public.artwork_creators enable row level security;
alter table public.curator_grants enable row level security;
alter table public.dossier_sources enable row level security;
alter table public.source_versions enable row level security;
alter table public.source_approvals enable row level security;

-- Existing members see their workspace; workspace creation/invites need a reviewed RPC.
create policy workspace_read on public.workspaces for select to authenticated
  using (app.is_member(id,array['owner','admin','editor','viewer']));
create policy memberships_read on public.workspace_memberships for select to authenticated
  using (app.is_member(workspace_id,array['owner','admin','editor','viewer']));
create policy artist_read on public.artist_profiles for select to authenticated
  using (app.is_member(managing_workspace_id,array['owner','admin','editor','viewer']) or artist_user_id=(select auth.uid()));
create policy artwork_read on public.artworks for select to authenticated
  using (app.is_member(managing_workspace_id,array['owner','admin','editor','viewer'])
    or app.can_edit_artwork(id));
create policy artwork_create on public.artworks for insert to authenticated
  with check (app.is_member(managing_workspace_id,array['owner','admin','editor']));
create policy creator_read on public.artwork_creators for select to authenticated
  using (exists (select 1 from public.artworks a where a.id=artwork_id));
create policy curator_grant_read on public.curator_grants for select to authenticated
  using (curator_user_id=(select auth.uid()) or exists (select 1 from public.artworks a
    where a.id=artwork_id and app.is_member(a.managing_workspace_id,array['owner','admin','editor'])));
create policy source_read on public.dossier_sources for select to authenticated
  using (exists (select 1 from public.artworks a where a.id=artwork_id));
create policy source_create on public.dossier_sources for insert to authenticated
  with check (created_by=(select auth.uid()) and app.can_edit_artwork(artwork_id));
create policy version_read on public.source_versions for select to authenticated
  using (exists (select 1 from public.dossier_sources s where s.id=source_id));
create policy version_create on public.source_versions for insert to authenticated
  with check (author_user_id=(select auth.uid()) and exists (select 1 from public.dossier_sources s
    where s.id=source_id and app.can_edit_artwork(s.artwork_id)));
-- No client update/delete of sources or versions: append a new version; withdrawal requires reviewed workflow.
-- No client access to approvals; do not mistake a draft for published content.
revoke all on public.source_approvals from anon, authenticated;
-- Explicit grants; RLS is not a substitute for SQL privileges.
revoke all on public.workspaces,public.workspace_memberships,public.artist_profiles,
 public.artworks,public.artwork_creators,public.curator_grants,public.dossier_sources,
 public.source_versions from anon,authenticated;
grant select on public.workspaces,public.workspace_memberships,public.artist_profiles,
 public.artworks,public.artwork_creators,public.curator_grants,public.dossier_sources,
 public.source_versions to authenticated;
grant insert on public.artworks,public.dossier_sources,public.source_versions to authenticated;
