# Decay Labs — Final Optimization Extension

Date: 2026-08-13

## Outcome

The final Vercel, Base Dashboard and demand-engineering pass is live. It added a deterministic Find Your Subject product loop, exact Subject sharing, stronger conversion analytics, safer OpenSea failure handling and complete infrastructure/resource documentation. No NFT transfer, listing, price, wallet signature, contract action, reward claim or DNS change was performed.

## Changes applied

- Shipped `/find-your-subject`: three lore-compatible choices map deterministically to a real Subject and produce a stable, shareable result URL.
- Made Find Your Subject the primary homepage discovery action while retaining Collect as a secondary action.
- Added `subject_match_started`, `subject_match_completed` and `subject_match_shared` events and funnel parsing for structured Vercel logs.
- Added exact Subject social previews through `/api/subject-share.js?id=...`.
- Fixed mobile horizontal overflow and hidden-panel rendering at 390 px.
- Removed automatic OpenSea API-key mint fallback and stopped retrying authentication failures; invalid credentials now fail once and cleanly.
- Hardened event validation, upstream timeouts, structured logs and cache/method behavior.
- Filled and saved the previously empty Base Dashboard app description.
- Verified the registered Base app, primary domain, Builder Code implementation and zero-usage baseline.
- Built `public/base-app-thumbnail.jpg`; account upload remains manual because browser file access is disabled.
- Published the final production build `dpl_BRPK9xtZYvatneg2GfPiNYS4kGUr` and aliased it to `decaylabs.online`.
- Expanded the master resource inventory with Vercel, Base Dashboard, demand, matching, analytics and deployment resources.

## Previous gaps closed or advanced

- Product retention/discovery: advanced from passive gallery to discover → choose → match → inspect → share → return.
- Subject differentiation: matching now gives a real Subject contextual identity without modifying NFT art or metadata.
- Share loop: exact Subject cards and stable result paths are live.
- Vercel observability: structured conversion/upstream logs and bounded calls are live.
- Base proof: Dashboard description and Builder Code chain are verified; visual assets are prepared.
- OpenSea reliability: retry storm removed; degraded state is truthful and bounded.
- Mobile quality: measured overflow defect fixed and rechecked.

## New issues found

1. The configured OpenSea credential is currently rejected upstream; in-app quotes cannot work until the owner rotates it.
2. Base Dashboard had no app description and still has no thumbnail/screenshots; description is fixed, visuals are prepared/blocked by account upload access.
3. Base Dashboard reports zero opens, active users and transactions for the observed week; demand, not another infrastructure feature, is now the bottleneck.
4. Legacy Vercel `builds` configuration suppresses dashboard build settings and emits an ESM-to-CJS warning. It is stable but should be migrated first in Preview.
5. The prior matching/share system had no genuine return reason; Find Your Subject supplies one, but actual retention is still unproven.

## Before → after scorecard

| Area | Before | After | Why not 10/10 |
|---|---:|---:|---|
| Farcaster | 4.2 | 4.5 | Share infrastructure is ready; profile execution, graph, real casts and collector interaction remain. |
| Talent | 6.3 | 6.4 | Cleaner website proof; account connections, duplicate-domain resolution and credentials remain manual/external. |
| Website | 8.8 | 9.2 | New interactive loop and mobile fix are live; real-user performance and conversion evidence remain. |
| Mini App | 8.5 | 8.8 | Matching/deep links/share work; directory/client validation and usage remain. |
| GitHub / builder proof | 7.5 | 7.8 | Stronger tested product proof exists locally; intentional public release/adoption is absent. |
| Base / onchain proof | 7.0 | 7.8 | Builder Code and Dashboard identity verified; real attributed users/transactions are zero. |
| OpenSea / collect funnel | 6.5 | 6.2 | Failure handling improved, but the invalid API credential currently disables in-app quotes. |
| Brand / lore | 8.4 | 8.8 | Matching turns lore into interaction; visual repetition and weak collector history remain. |
| Content system | 8.5 | 8.7 | Matching creates compounding prompts; publication/performance data remain absent. |
| Analytics | 7.8 | 8.7 | Match and structured server events are live; platform impressions and share completion remain partly unobservable. |
| Trust | 8.0 | 8.4 | Errors are transparent and proof chain is clearer; holder concentration and external social proof remain. |
| Conversion | 6.8 | 7.8 | A desire-building entry loop is live; checkout credential and real demand block higher confidence. |
| Discoverability | 4.8 | 6.2 | A shareable product and Base listing copy now exist; distribution and Base visuals remain weak. |
| Vercel | 7.0 | 8.2 | Production is fast, cached and observable; legacy config, key health and fuller monitoring remain. |
| Base Dashboard | 5.3 | 7.1 | Description/code/domain fixed; screenshots, thumbnail and usage remain. |
| General system | 7.7 | 8.4 | Product and proof loops now connect; real audience, collectors, account-level actions and a healthy OpenSea credential cannot be manufactured. |

## Manual/account actions

1. Rotate the rejected OpenSea API credential in Vercel, mark it Sensitive and run a read-only quote check.
2. Upload `public/base-app-thumbnail.jpg` plus three 1284×2778 screenshots in Base Dashboard.
3. Apply the prepared Farcaster profile/pinned cast and run one real Subject-share client test.
4. Resolve Talent's duplicate-domain claim and connect Farcaster/contract only through owner-approved verification.
5. Review and intentionally commit/push the dirty worktree; do not sweep unrelated user changes into a release.
6. Decide the 800-listing supply presentation separately; no listing or price was changed.

## Verification

- `npm test`: 51/51 passed.
- `npm run check`: passed.
- JavaScript syntax checks: passed.
- Vercel production: READY, `dpl_BRPK9xtZYvatneg2GfPiNYS4kGUr`.
- Canonical alias: `https://decaylabs.online`.
- Find Your Subject route: live; canonical extensionless redirect works.
- Subject share HEAD: 200 with cache/security/noindex headers.
- OpenSea checkout: safely degraded until the credential is rotated.

## One big bet

Find Your Subject is the highest-leverage bet: it turns 1,000 static inventory items into a repeatable identity/discovery mechanic with exact Subject sharing. Its next proof is not more code; it is whether 100 relevant people complete, share and revisit it.

## Canonical supporting reports

- `DECAY_LABS_MASTER_RESOURCE_INVENTORY.md`
- `ops/DEMAND_ENGINE_2026-08-13.md`
- `ops/VERCEL_PRODUCTION_REPORT_2026-08-13.md`
- `ops/BASE_BUILD_ECOSYSTEM_REPORT_2026-08-13.md`
- `ops/FINAL_OPTIMIZATION_2026-08-13.md`
