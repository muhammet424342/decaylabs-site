# DecayLabs final evidence report

## Completed and verified

- Main repo commit `ae4e8165e82a5d2a5d627d3e89c97a1855ae2a18` pushed to GitHub.
- Vercel production deployment `dpl_4nUNn8fg4yenqC8pehd2biT7Yex6` ready and aliased to `https://decaylabs.online`.
- Main automated tests: 6/6 passed.
- Starter automated tests: 5/5 passed.
- Site validator passed.
- `metadata-v2`: exactly 1,000 numbered JSON files; all parse successfully.
- HTTP evidence: home, robots, sitemap, public OG and avatar returned 200; invalid API address returned 400 with no-store, CORS, Referrer-Policy and security headers.
- Responsive screenshots generated at 320, 375, 390, 768, 1024 and 1440 px in `C:\tmp\decay-*.png`.
- Content pack generated with 30 days, 100 full ideas and 50 replies: `ops/x/final-publishing-pack.json`.

## Fixed and prepared

- Central checkout validation and friendly error mapping: `checkout-rules.mjs`.
- API positive-price filtering, protocol/contract response fields and headers: `api/buy.js`.
- Scenario matrix: `ops/audit/checkout-scenarios.md`.
- Security review: `ops/audit/security.md`.
- IPFS/Base URI safety plan: `ops/audit/ipfs-verification.md`.
- Ordered external action register: `ops/external-actions.md`, `ops/external-actions-v2.md`.
- Claude handoff: `CLAUDE_DEVAM.md`.

## Prepared but not applied to accounts

- X profile, assets, pinned thread, schedule, OpenSea profile, Discord server and IPFS pinning.

## User login required

- X, OpenSea, IPFS provider, Discord and Vercel account settings.

## User wallet signature required

- Listing cancellations, Base URI update, real NFT purchase and any wallet verification bot.

## Not executed / environment limits

- Authenticated X/OpenSea visual inspection was not possible because the Windows browser runner failed to start.
- Lighthouse was not run in this environment; static SEO/site validation and HTTP checks were run instead.
- No real purchase, order cancellation, IPFS upload or onchain mutation was attempted.

## Security findings

- Critical: none proven.
- High: none proven.
- Medium: public API rate limiting and remote browser ESM dependency remain hardening items.
- Low: raw provider errors are developer-console only.

## Remaining manual actions

Follow `ops/external-actions-v2.md` in order. Do not sign anything until chain, contract, target, value and destination are visible and independently verified.

## Real completion estimate

| Area | Score |
|---|---:|
| Site | 92 |
| Checkout | 84 |
| Mobile | 82 |
| Security | 78 |
| X | 58 |
| OpenSea | 55 |
| Metadata | 92 |
| IPFS | 62 |
| Discord | 35 |
| Community operations | 68 |

Overall local implementation and evidence: **78%**. The remaining 22% is account-authenticated, wallet-signed or external-state work and is intentionally not automated.
