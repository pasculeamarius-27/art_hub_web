# KULTH: CTO Architecture and Delivery Plan

**Status:** Working technical plan, September 2026  
**Branch:** `feat/mature-art-companion-foundation`  
**Decision state:** Proposed architecture. Product, legal, model-provider and hosting choices need founder/CTO approval before production use.

## 1. Executive technical verdict

The repository is a useful interaction prototype, not a production MVP. It is a single Next.js page with browser-only persistence and one unauthenticated AI proxy. It proves that an artist can create a profile, add artwork and generate a description. It does not yet provide multi-tenant gallery governance, trusted-source retrieval, visitor identity, a conversational companion, visit continuity, analytics, consent, operational controls or a production data layer.

The fastest credible path is not a rewrite into microservices. Keep a modular Next.js application while the team validates the experience, add managed Postgres/Auth/Object Storage and a server-side AI orchestration boundary, and design domain seams that can be extracted only when scale requires it.

This branch starts that transition without touching production. It:

1. reframes the visitor experience as a before/during/after art companion;
2. preserves the existing artist profile and artwork workflow in a Studio area;
3. removes browser collection of personal model API keys and moves the key to server configuration;
4. requires artist-approved source material for new generated mediation;
5. adds input bounds, structured error responses and basic in-memory abuse protection;
6. adds accessible, responsive UI states and an explicit demo-data boundary;
7. adds validation tests and this technical plan.

This is a foundation tranche, not a claim that the full target product exists.

## 2. Current-state audit

### Repository and delivery

- Repository: `pasculeamarius-27/art_hub_web`, default branch `main`, one commit at audit time.
- Framework: Next.js Pages Router, React and TypeScript.
- Deploy guidance: Vercel, but no checked-in CI workflow, environment contract, preview policy, observability or rollback runbook.
- Contribution controls: no CONTRIBUTING, CODEOWNERS, pull-request template, branch policy or ADR process in the repository.
- Tests: none.
- Baseline build: succeeds on a clean install.
- Dependency audit on the original lock resolution reported one high and one critical vulnerability through the Next.js/PostCSS chain. Dependency remediation must be treated as a release gate.

### Product and UX

- One screen with two tabs: artist profile and artwork gallery.
- No visitor journey, exhibition context, scan/deep-link entry, conversation, accessibility preferences, language control, saved discoveries or post-visit continuity.
- UI uses generic startup styling and browser alerts. It has no empty/error/recovery model beyond alerts.
- Image upload stores base64 in localStorage, which is quota-limited and can fail silently for ordinary photographs.

### Data and tenancy

- `artist` and `artworks` are unversioned localStorage records.
- No organization/gallery, membership, exhibition, source, approval, visitor, consent, session, interaction, citation or analytics entity.
- No server persistence, authorization, backup, export, retention policy, deletion flow or audit trail.
- IDs are timestamps, not collision-safe identifiers.
- JSON parsing is unguarded. Corrupt local state can crash the page.

### AI and cultural integrity

- The browser sends the visitor's personal Anthropic key to a server endpoint. It is not persisted, but collection in product UI is inappropriate and makes security/support the visitor's problem.
- Prompt inputs are concatenated without bounds, source provenance, approval status, citations or prompt-injection isolation.
- The output goal is buyer attraction, not faithful, personal cultural mediation.
- The model is an old pinned identifier and there is no provider abstraction, timeout, cost ceiling, moderation policy, evaluation set, trace or fallback.
- Generated text is stored as if it were ordinary artwork data. There is no distinction between artist-authored, approved, generated and published content.

### Privacy and security

- No authentication or authorization.
- No tenant isolation.
- No consent record for personalization or analytics.
- No rate limiting, schema validation, CSRF strategy, security headers, audit logging or secrets contract.
- Artwork images and profiles stay in one browser, but that is not a privacy architecture. It only postpones the server-side responsibilities.
- The original AI endpoint accepts an arbitrary third-party key and forwards it. This branch removes that interface.

### Observability and analytics

- No structured logs, error reporting, product analytics, service-level objectives or tracing.
- No event taxonomy to prove gallery value. Page views alone would be insufficient.

## 3. Product principles that constrain architecture

1. **Cultural authority stays with people and institutions.** Models may transform approved sources within explicit tone and policy bounds. They do not invent institutional truth.
2. **Every substantive answer is attributable.** The product should retain source and generation provenance and surface useful citations to visitors.
3. **Personalization is earned and reversible.** Anonymous use works; deeper memory requires clear consent, view/edit/delete controls and data minimization.
4. **The visit is a lifecycle.** Before, during and after are first-class states attached to an exhibition journey, not separate campaigns.
5. **The gallery owns its workspace.** Tenant boundaries, roles, publishing workflow and audit history are product features.
6. **Measure depth, not surveillance.** Track consented engagement and useful outcomes without covert location or sensitive profiling.
7. **Progressive web first.** Validate on mobile web and QR/deep links before funding two native clients. Add native shells only for proven device needs.

## 4. Target experience

### Visitor

- Enter from a gallery link, QR/NFC tag or discovery page.
- Choose language, pace and optional access needs without creating an account.
- Receive a concise exhibition orientation before arrival.
- In the gallery, open an artwork and ask questions in text or voice. Answers use only published source bundles, cite their basis and signal uncertainty.
- Move between “look closer”, “context”, “artist voice” and “make a connection” modes instead of receiving one long wall of text.
- Save works and reflections to a private visit journal.
- After the visit, receive a recap and opt into future continuity.

### Gallery and artist

- Ingest text, audio, transcripts, images and rights metadata.
- Link content to artist, artwork and exhibition records.
- Review extracted claims and approve a versioned source bundle.
- Preview representative visitor questions, cited answers, languages and safety fallbacks.
- Publish or roll back a bundle.
- Inspect aggregated, privacy-safe engagement outcomes and unresolved visitor questions.

## 5. Recommended target architecture

```text
Mobile/PWA visitor UI       Gallery Studio UI
          |                        |
          +------ Next.js BFF/API -+
                     |
      +--------------+------------------+
      |              |                  |
 Identity/RBAC   Companion service   Ingestion workers
      |              |                  |
      +--------- PostgreSQL + pgvector --+
                     |
            Object storage / CDN
                     |
        Model gateway + safety/evals
                     |
  Analytics events -> warehouse/dashboard
```

### Initial technology recommendation

- **Frontend/BFF:** Next.js TypeScript monorepo, responsive PWA, server components or route handlers after an intentional router migration.
- **Primary data:** managed PostgreSQL with row-level security; `pgvector` initially for semantic retrieval.
- **Identity:** managed OIDC/auth with anonymous visitor sessions and gallery SSO-ready identities.
- **Files:** S3-compatible object storage with signed uploads, virus scanning, metadata extraction and derivative generation.
- **Jobs:** managed queue/workflow for ingestion, transcription, embeddings and exports. Do not run long ingestion in request handlers.
- **AI:** provider-neutral server adapter, structured outputs, retrieval policy, prompt versions, token budgets and trace IDs.
- **Analytics:** first-party event gateway with a documented taxonomy; warehouse once pilot volume justifies it.
- **Operations:** preview deployments per PR, protected production environment, infrastructure as code, structured logs, error monitoring and uptime checks.

### Why not microservices now

A three-founder team needs transactional consistency and fast iteration more than independent deployability. Use modules (`identity`, `catalogue`, `publishing`, `companion`, `journeys`, `analytics`) in one deployable system. Extract ingestion workers first because their runtime and scaling profile differ.

### Alternatives to decide deliberately

| Decision | Recommended now | Alternative | Trigger to revisit |
|---|---|---|---|
| Data platform | Managed Postgres + pgvector | Firebase/Firestore | Choose only if offline sync dominates relational governance and analytics needs |
| Client | Responsive PWA | React Native | Proven demand for offline media, background audio, beacons or app-store distribution |
| Retrieval | Hybrid Postgres lexical + vector | Dedicated vector DB | Corpus/query scale or latency breaches measured SLOs |
| AI providers | Gateway with one primary model | Multi-model routing on day one | Material cost/quality/regional-residency evidence |
| Architecture | Modular monolith + workers | Microservices | Team/domain ownership and independent scaling justify operational cost |

## 6. Core data model

All tenant-owned tables carry `organization_id`; authorization is enforced in both application services and database policy. All publishable records have immutable versions.

- `organizations(id, name, locale, policy_version, created_at)`
- `memberships(id, organization_id, user_id, role)` where role is owner/editor/reviewer/analyst
- `artists(id, organization_id, display_name, biography, rights_status)`
- `artworks(id, organization_id, artist_id, accession_ref, title, year, medium, dimensions, rights_status)`
- `exhibitions(id, organization_id, title, venue, starts_at, ends_at, status)`
- `exhibition_artworks(exhibition_id, artwork_id, display_order, location_label)`
- `sources(id, organization_id, source_type, uri, checksum, rights_basis, created_by)`
- `source_versions(id, source_id, content, language, created_at)`
- `source_links(source_version_id, entity_type, entity_id, relation)`
- `approval_bundles(id, organization_id, scope_type, scope_id, version, status, approved_by, approved_at)`
- `approval_bundle_sources(bundle_id, source_version_id)`
- `visitor_profiles(id, user_id nullable, consent_state, preferred_language, accessibility_preferences)`
- `journeys(id, visitor_profile_id, exhibition_id, phase, started_at, ended_at)`
- `companion_threads(id, journey_id, approval_bundle_id, prompt_version, language)`
- `messages(id, thread_id, role, content, safety_state, created_at)`
- `message_citations(message_id, source_version_id, passage_start, passage_end)`
- `saves(id, journey_id, artwork_id, created_at)`
- `reflections(id, journey_id, artwork_id nullable, encrypted_content, created_at)`
- `events(id, organization_id, anonymous_subject_id, event_name, properties, occurred_at)`
- `audit_log(id, organization_id, actor_id, action, resource_type, resource_id, before, after, occurred_at)`

### Cultural Artifact Graph

Treat the graph as a product capability, not a separate graph database at first. Store typed relations in Postgres:

`artifact_relations(subject_type, subject_id, predicate, object_type, object_id, source_version_id, confidence, review_state)`

Only `review_state=published` relations enter visitor retrieval. Move to a graph database only after real query patterns show Postgres recursive queries are inadequate.

## 7. AI and RAG design

### Ingestion

1. Signed upload and malware scan.
2. OCR/transcription with language detection.
3. Preserve raw source, extracted text and checksum.
4. Segment by semantic structure, not fixed token count alone.
5. Extract candidate claims and relations.
6. Human review of rights, claims, tone and prohibited topics.
7. Create immutable approved bundle version.
8. Embed only approved passages into a tenant-scoped index.

### Answer path

1. Authenticate gallery context and resolve published bundle.
2. Classify intent and requested depth without inferring sensitive traits.
3. Retrieve with hard tenant, language, exhibition and approval filters.
4. Combine lexical and semantic ranking; retain passage IDs.
5. Generate a structured response: `answer`, `citations`, `uncertainty`, `suggested_modes`, `safety_state`.
6. Verify that citations support material claims; fail closed to an honest fallback.
7. Stream to the client and log redacted trace metadata.

### Prompt-injection boundary

Ingested documents are untrusted content. Never execute instructions found in sources. Delimit source passages, state that they are evidence only, block tool invocation from retrieved text and validate model output against a schema. Gallery publishing does not make embedded instructions authoritative.

### Memory

Use three layers:

- **Turn memory:** current thread, short-lived.
- **Visit memory:** works, modes and questions in the current journey.
- **Long-term preference memory:** opt-in summaries that the visitor can inspect, edit and delete.

Do not store inferred religion, politics, health, sexuality or other sensitive traits. Do not use face recognition or passive microphone capture.

### Evaluation and release gates

Build a versioned set of questions with gallery-approved reference points. Measure citation precision, groundedness, abstention quality, tone adherence, latency, cost, harmful-content handling and multilingual quality. A prompt/model change cannot ship if it regresses agreed thresholds.

## 8. Privacy, security and compliance baseline

- GDPR roles and data processing agreements documented per customer and provider.
- Explicit purposes for service delivery, optional personalization and analytics. Never bundle consent.
- Anonymous journey by default; account creation is optional.
- Data inventory, retention schedule, export and deletion workflow before live pilots.
- Tenant-scoped authorization tests and database row-level security.
- Secrets only in a managed secret store; never in browser state, source control or logs.
- TLS in transit, managed encryption at rest and field-level encryption for private reflections.
- Signed upload/download URLs, MIME validation, size limits, malware scanning and image metadata stripping.
- CSP, HSTS, Referrer-Policy, Permissions-Policy, secure cookies, CSRF protection where relevant.
- Rate limits by session, account, tenant and endpoint; model spend ceilings and circuit breakers.
- Immutable publish/audit trail for source and policy changes.
- Dependency, secret and static analysis in CI; threat model updated per phase.
- Incident response owner, severity rubric, contact tree and breach-notification workflow.

## 9. API boundaries

Prefer documented REST/JSON initially. Version public contracts and generate types from schemas.

- `POST /api/v1/sessions/anonymous`
- `GET /api/v1/exhibitions/:slug`
- `GET /api/v1/artworks/:id`
- `POST /api/v1/journeys`
- `POST /api/v1/companion/threads`
- `POST /api/v1/companion/threads/:id/messages`
- `POST /api/v1/journeys/:id/saves`
- `POST /api/v1/journeys/:id/reflections`
- `POST /api/v1/studio/sources/upload-intent`
- `POST /api/v1/studio/approval-bundles/:id/publish`
- `GET /api/v1/studio/analytics/exhibitions/:id`

Use idempotency keys for mutations likely to retry. Return a request/trace ID with errors. Never expose model-provider credentials to clients.

## 10. Event taxonomy and institutional value

Version every event and exclude raw message/reflection content from analytics.

- `journey_started`
- `artwork_opened`
- `companion_mode_selected`
- `question_asked`
- `answer_completed`
- `citation_opened`
- `artwork_saved`
- `reflection_created`
- `journey_recap_opened`
- `visitor_returned`
- `unanswered_question_flagged`

Pilot metrics: visitor activation, artworks meaningfully explored, median engaged minutes, question completion, citation use, save/reflection rate, post-visit return, opt-in rate, unanswered-question rate, latency and cost per engaged visit. Sales conversion is a customer outcome to test, not an AI claim.

## 11. Testing strategy

### Per pull request

- Type check, lint and formatting.
- Unit tests for schemas, policy, retrieval filtering and state migration.
- Component tests for keyboard, loading, error and empty states.
- API contract and authorization tests.
- Tenant-isolation negative tests.
- Dependency and secret scan.
- Production build.

### Preview and release

- Playwright mobile and desktop journeys with screenshot diffs.
- Accessibility scan and manual screen-reader/keyboard pass for core journeys.
- Seeded end-to-end path: open exhibition -> artwork -> ask -> cited answer -> save -> recap.
- AI evaluation suite against the approved corpus.
- Load test companion streaming and ingestion separately.
- Backup restore and rollback rehearsal before the first paid pilot.

## 12. Deployment and environments

- `local`: synthetic data, no production secrets.
- `preview`: one deployment per PR, isolated database/schema, synthetic or approved test corpus.
- `staging`: production-like, restricted access, release candidate and migration rehearsal.
- `production`: protected environment, two-person approval, monitored migrations and rollback.

Use expand/migrate/contract database changes. Never combine an irreversible migration and dependent code in one unprotected release. Record deployed commit, migration version, prompt/model versions and feature-flag state.

Initial SLO candidates for pilots: 99.5% monthly availability; p95 non-AI API under 500 ms; p95 first companion token under 2.5 s on target networks; error rate under 1%. Validate before turning them into contracts.

## 13. Migration from this repository

1. Keep the original local records readable.
2. Introduce a versioned client store and safe parsing.
3. Add export/import before server migration.
4. Introduce identities and organizations.
5. On explicit user action, upload local profile/artworks to a chosen organization.
6. Verify counts/checksums and keep a local recovery copy.
7. Ask before deleting legacy local data.
8. Record migration outcome and allow retry by idempotency key.

## 14. Phased roadmap and code changes

### Phase 0: Stabilize and make the prototype honest (this branch)

- CTO audit and architecture decision record.
- Visitor companion shell with explicit demo content and before/during/after journey.
- Existing profile/artwork workflow retained as Studio.
- Safe local-state parsing and versioned journal state.
- Server-owned Anthropic secret, approved-source requirement, input bounds and basic abuse controls.
- Responsive/accessibility pass, deterministic unit tests and clean build.
- Dependency remediation and CI are release gates; do not deploy this branch directly.

**Exit:** CTO approves direction, build/tests pass, visual checks pass at mobile and desktop, no production mutation.

### Phase 1: Pilot foundation (4-6 weeks, estimate)

- Auth, organization/membership roles and tenant isolation.
- Postgres/object storage schema and migration tooling.
- Exhibition/artwork/source CRUD with approval workflow.
- QR/deep-link visitor entry and anonymous journey.
- First retrieval pipeline over approved text.
- Consent, retention, export and delete basics.
- CI, preview environments, logs, error monitoring and spend limits.

**Exit:** one gallery can publish one exhibition; a visitor receives cited answers from only its approved bundle; cross-tenant tests pass.

### Phase 2: Companion beta (6-10 weeks, estimate)

- Streaming conversation and interaction modes.
- Multilingual source/answer workflow.
- Saved works, reflections, recap and opt-in continuity.
- Gallery preview/evaluation console.
- Analytics taxonomy and unanswered-question queue.
- Audio playback; voice input only with explicit activation.

**Exit:** measurable multi-visit journey, gallery can audit/correct answers, pilot quality/cost thresholds pass.

### Phase 3: Network and scale (quarter-scale estimate)

- Permissioned artifact relations across institutions.
- Portable visitor preferences with granular sharing.
- Rights/licensing rules, partner APIs and institution exports.
- Dedicated retrieval infrastructure only if measured need appears.
- Regional data controls, stronger enterprise SSO and compliance evidence.

**Exit:** repeatable multi-gallery deployment and unit economics support paid expansion.

### Phase 4: Mature platform

- Cross-city cultural journeys, partner ecosystem and graph-assisted discovery.
- Native client only for validated hardware/offline needs.
- Recommendation systems with bias/diversity evaluation and transparent controls.
- Formal reliability/on-call and enterprise administration.

## 15. Delivery risks and mitigations

- **Hallucinated authority:** approved bundles, citations, claim checks, abstention and review queue.
- **Gallery onboarding burden:** templates, bulk import, assisted extraction and clear publish previews.
- **Weak repeat use:** design continuity around saved works and reflection, then test retention honestly.
- **Inference cost:** concise modes, caching of approved stable responses, model routing after evaluation and tenant budgets.
- **Rights ambiguity:** rights metadata is mandatory before publish; separate permission to ingest, generate and display.
- **Sensitive profiling:** anonymous default, explicit controls, prohibited-trait policy and privacy review.
- **Premature complexity:** modular monolith, one primary data store and measured extraction triggers.

## 16. CTO decisions required before Phase 1 implementation

1. Confirm this repository is the canonical product codebase rather than a demonstration repo.
2. Choose managed Postgres/Auth/Object Storage vendor and target hosting regions.
3. Approve App Router migration timing and supported browser/device matrix.
4. Name the organization role model and content approval authority.
5. Select model provider(s), data-processing terms, retention and regional controls.
6. Approve analytics provider or first-party-only implementation.
7. Define first pilot gallery, corpus, languages and measurable success thresholds.
8. Confirm ownership of production operations, security response and data protection decisions.
9. Decide whether price/sales functionality belongs in pilot scope; keep it separate from interpretive truth.
10. Approve branch protection, required checks and release sign-off.

## 17. Definition of done for a “mature companion” claim

Kulth should not call the product mature until: galleries can govern and roll back approved sources; visitors get cited, uncertainty-aware answers across a full visit journey; personalization is optional and controllable; tenant/privacy/security tests pass; the system is observable and recoverable; model changes are evaluated; and multiple galleries have completed real paid or contractually committed pilots with measured repeatable outcomes.

## 18. Adaptive Cultural Intelligence (founder product steering)

Feed, map, scanning, community and the taste dashboard must share one user-controlled intelligence layer. Building five unrelated recommenders would fragment the experience, multiply privacy risk and make explanations inconsistent.

### Cultural profile representation

Maintain separate evidence classes rather than one opaque “taste score”:

- explicit: languages, access needs, self-selected interests, artists/movements/materials, discovery intent and novelty appetite;
- behavioral: viewed works, dwell ranges, saves, questions, source opens, map visits and follows;
- reflective: user-authored notes and labels, private by default and excluded from training/recommendation unless explicitly included;
- social: follows, replies and communities, with lower default weight than direct art interaction to avoid popularity collapse;
- situational: current exhibition, available time and coarse user-requested location, short-lived by default;
- negative/controls: hide, “less like this”, topic mute, blocked accounts and reset history.

Store events append-only, derive versioned profile features, and keep a human-readable profile projection. Users can inspect “why this?”, change or remove interests, reduce personalization, switch to chronological/community-only modes, and reset the model. Sensitive-trait inference is prohibited.

### Personalized art feed

Use candidate generation from followed institutions/artists, nearby published exhibitions, graph relations, editorial collections, community and exploration inventory. Rank with a blended objective: predicted relevance, novelty, cultural breadth, source quality, recency, travel feasibility and creator/institution diversity. Apply hard moderation, rights, availability and tenant publication filters first. Reserve exploration inventory so the feed develops taste rather than only repeating it. Log explanation factors and evaluate filter bubbles, geographic bias and exposure concentration.

### Cultural map

Map entries represent verifiable, currently accessible artworks/exhibitions with source, hours and availability freshness. Recommendation uses the same cultural profile plus explicit trip constraints: time, travel mode, accessibility, opening hours, cost and desired depth. Route optimization must never silently imply an artwork is on view. Show confidence/freshness and allow “surprise me”, “closest”, “free”, “accessible” and “outside my usual taste”. Current location is requested only while mapping; precise history is not retained by default.

### Artwork recognition and scanning

“Recognize in any condition” is a research target, not a credible launch promise. Use a cascaded system:

1. QR/NFC/deep link for deterministic venue-owned identification.
2. On-device image quality checks and guided capture (glare, blur, crop, distance).
3. Venue/exhibition candidate narrowing from explicit context or temporary coarse location.
4. Multi-view visual embeddings plus metadata/OCR matching against the published catalogue.
5. Calibrated confidence and top candidates, never forced identification.
6. User confirmation; feed corrected labels into a reviewed evaluation dataset.
7. Optional gallery label OCR as fallback, with clear privacy treatment.

Do not use face recognition. Strip EXIF before uploads, minimize retention, hash/dedupe where justified, and create hard evaluation slices for glare, oblique angle, low light, occlusion, frames, similar series, sculpture, installation and changed displays. Measure top-1/top-5 recall and false-positive rate per slice. A confident wrong answer is worse than a useful “not sure”.

### Community and messaging

Community objects are artwork/exhibition-linked posts, media, comments, reactions, follows, circles and direct conversations. Start with public posts/comments and follow graph before DMs because messaging creates heavier abuse, encryption, age-safety, block/report, spam and legal operations. Require alt text prompts, rights attestations and visible artist/gallery attribution. Add rate limits, reporting, blocking, mute controls, moderation queues, media scanning, appeals and an incident/SLA owner before growth. Separate institutional/artist verified accounts from ordinary profiles. Never use private messages to train or personalize without a separate explicit opt-in.

### Taste dashboard

The dashboard is a reflective tool, not a psychographic verdict. Show evidence-backed patterns over time: explored mediums, periods, themes, institutions, geographic breadth, questions asked, saved-vs-viewed, novelty range and changing interests. Every statement links to the interactions behind it and supports correction. Use language like “you have explored” rather than “you are”. Offer private milestones, revisit prompts and comparisons only against the user's own history by default.

### Additional data entities

- `profile_preferences`, `profile_feature_versions`, `profile_explanations`, `profile_resets`
- `recommendation_impressions`, `recommendation_actions`, `negative_feedback`
- `venues`, `display_instances`, `availability_assertions`, `map_sessions`
- `recognition_attempts`, `recognition_candidates`, `capture_quality`, `recognition_feedback`
- `community_posts`, `post_media`, `comments`, `reactions`, `follows`
- `conversations`, `conversation_members`, `direct_messages`, `blocks`, `reports`, `moderation_cases`
- `taste_snapshots` with evidence links and user corrections

### Service seams

Add modules for `cultural-profile`, `recommendations`, `places`, `recognition`, `community`, `messaging` and `trust-safety`. Keep them in the modular monolith first except compute-heavy recognition inference and media processing, which run as isolated workers. Use one policy service for consent and data use across all modules.

### Roadmap adjustment

- **Phase 1:** cultural-profile event contract, explicit interests, explanation store, deterministic QR identification and verified display records.
- **Phase 2:** personalized feed v1, taste dashboard v1, artwork-linked public posts/comments and map with explicit filters.
- **Phase 3:** visual recognition beta with calibrated fallback, exploration-aware ranking, creator diversity evaluation and trust/safety operations.
- **Phase 4:** DMs after safety readiness, route planning, cross-institution profile portability and mature graph recommendations.

### Non-negotiable release gates

- Recommendation explanations reconstruct from logged features without exposing sensitive data.
- Profile reset and deletion propagate to derived features and indexes.
- Offline evaluation plus controlled pilot proves ranking beats simple baselines without concentrating exposure unfairly.
- Scanner meets slice-specific thresholds and abstains below calibrated confidence.
- Community cannot launch without report/block/mute, moderation ownership, media policy and audit records.
- DMs cannot launch without spam defense, abuse response, retention policy and age-safety decision.

## 19. Product colour foundation (not final branding)

The demo uses a gallery-like dark ground so artwork and source text carry attention. This is a product system Marius can brand later, not a finished identity.

| Token | Demo value | Role |
|---|---:|---|
| `--navy` | `#08182F` | primary dark canvas; calmer than pure black and compatible with low-light exhibition use |
| `--ink` | `#F3EFE5` | warm neutral text/surface; avoids sterile app white |
| `--coral` | `#FF765F` | high-salience interaction and current-state accent |
| `--muted` | `#A9B3C2` | secondary text on dark ground |
| `--panel` | `#102540` | raised dark surface |
| `--line` | 16% warm ink | restrained spatial divisions |

Usage rules:

- Artwork colour is content, never UI chrome. Interface colour stays restrained around imagery.
- Coral marks the next action, active mode or current position. Do not use it decoratively everywhere.
- Semantic success, warning and danger require their own text/icon/shape in addition to colour before production.
- Body text targets WCAG AA contrast; interactive controls target 3:1 against adjacent surfaces and receive a visible focus ring.
- Dark mode is the exhibition-first default in this concept. A production light mode should map semantic tokens, not invert raw hex values: warm paper (`#F3EFE5`) canvas, navy text, white raised surfaces and the same calibrated coral action.
- Honour `prefers-reduced-motion`, system font scaling and high-contrast testing. Do not encode taste categories by colour alone.
- Validate tokens with automated contrast checks plus real-device review in gallery lighting before freezing brand values.
