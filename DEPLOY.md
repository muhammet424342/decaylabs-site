# Decay Labs — Production Deployment

Current production project: `decaylabs_archive` on Vercel. Canonical domain: `https://decaylabs.online`.

## Safe release sequence

```powershell
npm test
npm run check
Get-Content -Raw .vercel\project.json
npx vercel deploy --prod --yes
```

Before deployment, confirm `.vercel/project.json` contains project name `decaylabs_archive`. A successful build is not enough: verify the canonical domain, manifest, Subject share endpoint and APIs after release.

## Server environment names

- `OPENSEA_API_KEY`: server-only OpenSea credential used by collection stats and checkout quote preparation.
- `CURATED_TOKEN_IDS`: optional comma-separated zero-based onchain token IDs for the generic collect path.
- `EVENT_WEBHOOK_URL`: optional server-side analytics delivery destination.

Never put credential values in source, documentation or browser JavaScript.

## Failure behavior

- Without a usable OpenSea credential, collection stats return an explicit unavailable/error state; the site must not invent floor, volume or owner metrics.
- Checkout validates the requested token, contract, seller, protocol target and refreshed price. A missing/stale listing stops the flow.
- Browsing the archive does not require a wallet.

## Production checks

- `https://decaylabs.online/`
- `https://decaylabs.online/.well-known/farcaster.json`
- `https://decaylabs.online/subject?id=1`
- `https://decaylabs.online/api/subject-share.js?id=846`
- `https://decaylabs.online/api/collection-stats.js`

Domain/DNS changes, OpenSea settings, listings, prices and wallet transactions are owner-controlled and are not part of a normal code deployment.
