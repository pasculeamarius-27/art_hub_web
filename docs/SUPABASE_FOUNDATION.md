# Supabase foundation, first branch

Status: implementation draft for Constantin's review. No hosted project, migration run, public catalog or client wiring is claimed.

Marius selected Supabase on September 29, superseding the September 28 Firebase direction. He selected this repository (`art_hub_web`), approved the four access tiers and required artist plus gallery approval of source material. Antre is B2C mobile; Antre Art Voice is a separate B2B app and web platform, both sharing a backend per environment. The four Art Voice user types are gallery, artist-run space, artist, and curator. Curators may sign in and help an artist formulate or edit draft sources in the artist's intended voice, after a separately verified collaboration grant creates the relationship. Preserve attribution to the curator as author and show the artist the exact version for final approval; never present curator text as an artist-approved statement before that approval. `workspace.kind` describes the managing practice, not a global user role; workspace membership and an artwork-specific grant determine actual rights.

The first migration intentionally defines only **private draft** data access; onboarding is not implemented, so a fresh project has no usable workspaces yet. Auth-linked memberships scope workspaces; a curator gets a named artwork grant, not universal access. A creator's credit never by itself creates an edit grant; `artist_user_id` must be verified in an onboarding workflow before activation. Insertable dossier sources and append-only versions still need validated version allocation (an RPC in a later PR). No direct client write can create a membership, curator grant, artist-to-account binding, approval, publication, or public read. Those workflows require authorization design and tests before production data.

## Pending decisions and work

- Verify artist identity and select who may grant or revoke curator collaboration. The database never accepts a client-side claim as proof.
- For gallery-managed works: final version approval requires both the verified artist and an authorized gallery approver. For independent artists without a gallery, the verified artist alone approves; a curator may collaborate but cannot replace that approval. Artist-run spaces still need a precise rule for who represents that space before their publishing workflow ships. Withdrawal invalidates future mediation and public projections.
- Implement published projections and artist-approved content for B2C. Keep original dossiers, private files and recognition references in separate private Storage buckets; publish only approved derivatives. Storage policies and validated media pipeline are not in this PR.
- Keep private B2C taste/events and conversations apart from Art Voice. Server-side aggregation produces partner-scoped dashboard metrics with suppression thresholds. A lead is a separate, explicit visitor opt-in for named partner and work; it is never inferred from a match. Define retention and consent UI before implementing leads.
- Edge Functions should own secret-bearing AI/voice calls and validate JWT, resource access, approved source versions and citations. No service role or model keys go to either client.
- Introduce the two product frontends separately after UX approval. Existing six stacked preview PRs are unmerged concepts, not a deployed backend; reconcile their graph contracts rather than treating them as access rules.

## Review gates

Run this migration on an isolated local Supabase instance, then test real anon and authenticated sessions across two workspaces: draft reads, forged workspace/author IDs, membership revocation, curator grant revocation, and direct approval denial. Include positive paths. Generate strict TypeScript database types and CI checks. No production deployment or merge until these tests and Constantin's review. This container lacks a Supabase CLI/runtime, so this document makes no claim that database tests passed.
