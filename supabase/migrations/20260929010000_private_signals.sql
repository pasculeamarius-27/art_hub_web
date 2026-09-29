-- Separate B2C activity from Art Voice. This does not yet publish dashboard data.
-- A reviewed server aggregation job must enforce suppression and anti-differencing.
create table public.visitor_events (
  id uuid primary key default gen_random_uuid(),
  visitor_id uuid not null references auth.users(id) on delete cascade,
  artwork_id uuid not null references public.artworks(id) on delete cascade,
  event_kind text not null check (event_kind in ('artwork_view','context_open','conversation_started','interest_expressed')),
  occurred_at timestamptz not null default now()
);
create index visitor_events_owner_time_idx on public.visitor_events(visitor_id,occurred_at desc);
create index visitor_events_artwork_time_idx on public.visitor_events(artwork_id,occurred_at desc);
alter table public.visitor_events enable row level security;
-- No SELECT grant to the B2C client or Art Voice, including the event's own author.
-- Client inserts must bind the authenticated user; a dedicated write-only endpoint may
-- replace this policy after abuse and event-authenticity controls are designed.
create policy visitor_event_insert on public.visitor_events for insert to authenticated
  with check (visitor_id=(select auth.uid()));
revoke all on public.visitor_events from anon,authenticated;
grant insert (visitor_id,artwork_id,event_kind) on public.visitor_events to authenticated;

-- Aggregate rows have no visitor identifier or free-form user-submitted fields.
-- Fixed calendar-month buckets; one aggregate per workspace, artwork, kind, bucket.
-- Only the privileged aggregation job inserts after checking contributor threshold.
create table public.partner_metrics (
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  artwork_id uuid not null,
  event_kind text not null check (event_kind in ('artwork_view','context_open','conversation_started','interest_expressed')),
  bucket_start date not null,
  distinct_visitors integer not null check (distinct_visitors>=20),
  event_count integer not null check (event_count>=distinct_visitors),
  computed_at timestamptz not null default now(),
  primary key (workspace_id,artwork_id,event_kind,bucket_start),
  foreign key (artwork_id,workspace_id) references public.artworks(id,managing_workspace_id),
  check (bucket_start = date_trunc('month',bucket_start::timestamp)::date)
);
alter table public.partner_metrics enable row level security;
create policy partner_metrics_read on public.partner_metrics for select to authenticated
  using (app.is_member(workspace_id,array['owner','admin','editor','viewer']));
revoke all on public.partner_metrics from anon,authenticated;
grant select on public.partner_metrics to authenticated;
-- Do not materialize overlapping narrower filters, cohorts, daily buckets, or low-N
-- rows. Threshold alone is not a complete anonymity guarantee: a partner could
-- infer individuals from known attendees. Privacy review before job and UI release.

-- Individual leads are a separate consented channel; no client access in this slice.
-- Never generate these from a match, event or conversation automatically.
create table public.consented_leads (
  id uuid primary key default gen_random_uuid(),
  visitor_id uuid not null references auth.users(id) on delete cascade,
  recipient_workspace_id uuid not null references public.workspaces(id),
  artwork_id uuid not null,
  consent_text_version text not null,
  consented_fields text[] not null,
  consented_at timestamptz not null,
  withdrawn_at timestamptz,
  payload jsonb not null default '{}'::jsonb,
  foreign key (artwork_id,recipient_workspace_id) references public.artworks(id,managing_workspace_id),
  check (array_length(consented_fields,1) > 0)
);
create index consented_leads_visitor_idx on public.consented_leads(visitor_id);
create index consented_leads_recipient_idx on public.consented_leads(recipient_workspace_id) where withdrawn_at is null;
alter table public.consented_leads enable row level security;
revoke all on public.consented_leads from anon,authenticated;
-- An approved consent capture and scoped projection must be designed and tested
-- before any lead is inserted or returned to a partner. Arbitrary JSON must never
-- be exposed wholesale as a B2B row.
