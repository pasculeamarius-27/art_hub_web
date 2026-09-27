# Antre navigation shell - review draft

This branch establishes a typed seven-feature navigation in the existing Next.js concept. The old companion and Art Voice local prototype remain separate views for continuity. Six feature panels are explicit placeholders, not fake working screens. Feed currently points to the old companion concept; a later branch supplies a real Feed demo. This is not an iOS/Android app.

Shared domain direction: Artist, Artwork, Source and Approval IDs link across every experience, with a permissioned cultural artifact graph. Firebase (not AWS) is the backend choice confirmed by Marius because Constantin uses it more easily. This branch does not instantiate a Firebase project, decide Firestore/schema/Auth/Rules, or persist real user data. Those require reviewed ADRs, access rules and emulator tests before production use.

Review: consistent Antre C5 tokens, keyboard and screen-reader navigation, restrained artwork-first layout, mobile overflow, no claim of shipped functionality, and tests for feature ID validity. No merges without Constantin.
