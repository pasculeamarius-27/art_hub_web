# Antre design foundation - draft for Constantin

This branch is a narrow visual foundation, not a native iOS app and not a production-ready feature. It changes public-facing labels from KULTH/Gallery Studio to Antre/Art Voice and establishes the C5 palette across the existing local concept. It does not rewrite the historical CTO plan, storage namespace, routes or API semantics. Legacy localStorage keys remain unchanged to avoid erasing a reviewer's saved demo data.

## Design constraints
- Artworks are the focus. The current abstract demo compositions are placeholders and are not licensed artwork images. Replace only with rights-verified artwork assets after founder/artist approval.
- The C5 working palette is warm paper `#F7F4EF`, near-black `#1C1A17`, blue `#4D82FF`, pale blue `#EEF2FB`. Contrast, Dynamic Type and native iOS behavior must be validated in the eventual mobile stack; this Next.js prototype is not that validation.
- Translucency is limited to navigation chrome, with reduced-transparency and reduced-motion fallbacks. Artwork itself stays opaque.
- Shared tokens are a first step toward consistent type, spacing, components and transitions. A full component library and native implementation require CTO stack decision.

## Explicit limitations / next PRs
The older companion demo remains a single Next.js page with browser-local state and simulated source labels; no server-side artist approval or authenticated tenancy exists. Do not publish this build. Next branches should cover Art Voice approval and a genuinely sourced Chat vertical slice after stack/architecture review. Review the Notion methodology and audit before expanding the UI.
