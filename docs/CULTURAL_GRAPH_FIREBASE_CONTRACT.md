# Permissioned cultural graph - domain contract, not a deployed backend

Status: technical proposal for Constantin's ADR review. Firebase is the chosen backend platform, NOT AWS, because Marius said it is easier for Constantin. This branch deliberately does not choose Firestore/Realtime Database, a physical edge layout, Auth claims, Functions, Storage buckets or indexes without a reviewed ADR. It does not create a Firebase project or Security Rules. `publicSubgraph` is a **pure test helper**, not an authorization boundary. In production, enforce tenant and source approval filtering server-side and in Firebase Security Rules, validated with the Emulator Suite. Never trust client assertions of artist approval or account identity.

## Logical graph
Nodes: artist, identity, statement, series, artwork, source, space, exhibition, concept. Edges: created, has_identity, stated, belongs_to, describes, exhibits, supports. Every node/edge belongs to a tenant and has visibility/approval; each relation cites a source ID and version. A source withdrawal invalidates new public traversal and derived search indexes. AI-inferred relationships remain drafts until approved by the responsible artist. Viewer journal and personal taste are **not** public graph nodes and must live behind separate consent/ownership checks.

## Invariants for the storage ADR
- Public traversal includes only approved, public source versions from the requested tenant and approved endpoints/edges. No cross-tenant ID guessing.
- Approval is a versioned, auditable transition initiated by verified artist authority, not a client boolean. Withdrawal invalidates all derived views/caches; retention of historical citations is a separate, permissioned policy decision.
- Guest reads fetch only a bounded page of public artworks/context. The validated starting window is ~10 artworks; the actual gate, usage count and anti-abuse mechanism are server-side and privacy-reviewed, not implemented in this branch.
- Auth roles, rules, transaction boundaries, query indexes, EU region, backup/restore, cost and schema migration need written ADRs and negative security tests before real data enters Firebase.

## Test state
Pure tests cover tenant isolation, withdrawal, version mismatch, orphaned and unapproved relationships. These are examples and do not substitute for Firebase Emulator Suite, OWASP ASVS/MASVS, privacy/legal review or a real source-provenance workflow.
