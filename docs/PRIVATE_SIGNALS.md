# Private consumer signals and scoped Art Voice intelligence

Status: second stacked implementation draft; not a working dashboard, consent flow or production analytics system.

Antre and Antre Art Voice are distinct products sharing Supabase data. An approved Art Voice dossier may later generate a public B2C projection. In the other direction, B2C interactions are private records, not a B2B data API. A privileged, audited aggregation job can produce only fixed monthly metrics for each partner's own artworks, with a proposed minimum of 20 distinct visitors. No arbitrary cohort filters, small intervals or raw event export. A threshold is not proof against reidentification; a privacy review must examine sparse exhibitions and known audiences before launch.

The `partner_metrics` table is currently empty and client read-only. No aggregation job exists yet. `visitor_events` accepts simple client-reported events tied to the signed-in user but is write-only and not yet trustworthy as a purchase or impact measure. Abuse, duplicate events, guest metrics, consent and retention need explicit review. No conversation text, cultural profile, inferred score, location trace or person-level browsing history goes into the partner table.

An individual sales lead is different from an aggregate. `consented_leads` is a locked schema placeholder with no client grants or policies. A later opt-in flow must show the visitor the specific receiving partner, artwork, purpose and exact fields, including any match indicator; capture the precise consent version; support withdrawal; and return only approved fields to that partner. The cultural match is computed internally to recommend art, not to create a lead automatically. No B2B access or insert into this table is implemented here.

## Security verification required before merge

Run the first migration, then this one, in isolated Supabase. Test real anon/auth identities across two workspaces. Assert B2B cannot SELECT raw events or consented leads, visitor cannot SELECT partner metrics for a foreign workspace, and forged `visitor_id` is denied. An aggregation job must test threshold and differencing suppression, revocation, rollback and deletion. Static checks below only check that named SQL boundaries exist; they do not run the database.
