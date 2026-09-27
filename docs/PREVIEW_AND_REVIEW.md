# Preview and review

This branch is intentionally not connected to production.

## Local interactive preview

```bash
npm ci
npm test
npm run typecheck
npm run build
npm run dev
```

Open:

- Companion: http://localhost:3000
- Gallery Studio: http://localhost:3000/?area=studio

The concept uses local demo content and browser storage. AI generation stays disabled unless the reviewer adds `ANTHROPIC_API_KEY` to a private `.env.local`; never commit that file. New AI mediation requires an artist-approved source excerpt.

## Suggested walkthrough

1. In Companion, move through Before, During and After.
2. In During, switch among Look closer, Add context, Artist voice and Make a connection.
3. Open approved sources and save a work.
4. In After, write a private reflection and verify the saved count.
5. Open Gallery Studio, save an artist profile and add an unpublished artwork with an approved source.
6. Reopen the artwork and confirm generation is unavailable when a source is missing and environment configuration is absent.
7. Refresh and confirm local concept data persists.

## Isolated hosted preview

The repository currently has no checked-in CI or preview-deployment configuration. A hosted preview should be created from this dedicated branch in a non-production Vercel project/environment after the CTO chooses the account and confirms environment/data policy. Do not connect this branch to `kulth.art` or the existing cPanel/Sitejet production root.
