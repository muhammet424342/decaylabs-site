# Vercel Production Engineering Report

Date: 2026-08-13. Project: `decaylabs_archive` (`prj_G0IQA9GAdW79CUPXlk8m4KYQLXtc`). Team: `team_stRcMSXaqhGIudKrk5QZoPxd`.

## Outcome

Vercel is now used as product infrastructure: static global delivery, cached Subject share pages, deterministic result URLs, privacy-safe conversion events, structured function logs, guarded upstream calls and rollback-ready deployments. The new production deployment is `dpl_HVqe1eYHnChaaP4AC6q7GwsNcKnV`, READY and aliased to `decaylabs.online` plus `www`.

## Current architecture

- Frameworkless static HTML/CSS/ES modules; no client framework bundle or database.
- Four public Node functions: buy quote/fulfillment, collection stats, event intake and Subject share HTML.
- CDN caches `/public/*`, `/data/*`, and Subject-share output; buy/event endpoints are no-store.
- Production/preview/development share one environment-variable name: `OPENSEA_API_KEY`. Only the name is recorded.
- Custom domains: `decaylabs.online`, `www.decaylabs.online`; two Vercel aliases retained.
- Function region observed: `iad1`; visitors tested through Frankfurt edge (`fra1`).

## Verified production findings

- Home 200; observed TTFB ~0.18s on warm test. Static HTML is revalidated and served as CDN HIT after first request.
- Subject share endpoint becomes `X-Vercel-Cache: HIT`; the returned HTML contains exact Subject metadata and canonical launch URL.
- Featured local art is ~138 KB and cached for one day with seven-day stale window.
- New matching page and JS return 200; live end-to-end matching produced Subject #0554 and a stable `?path=3-2-4` URL.
- Mobile 390×844 verification found and fixed an actual horizontal overflow caused by hidden grid content/min-content image width.
- 50 automated tests and the repository validator pass.

## Production faults found

1. OpenSea credential returns 401. The previous code tried to mint a temporary key, producing 246 `api_key_unavailable_429` errors in seven days. Automatic key minting was removed; failures now stop after one authenticated request and the client shows an exact OpenSea fallback. **Manual:** replace/rotate the OpenSea key and mark it Sensitive in Vercel.
2. Legacy `builds` makes Vercel project Build/Development Settings ineffective and causes an ESM→CommonJS warning. It remains because the current plain static/function deployment is stable; migrate in a preview first.
3. Node runtime emits `DEP0169 url.parse()` from the Vercel wrapper/build path. Application code already uses WHATWG `URL`; no unsafe local `url.parse` call was found.
4. Real-user Core Web Vitals/Speed Insights are not available in the inspected data. Lab DOM/mobile checks are not RUM.

## Changes applied

- Structured start/outcome/error context for checkout, stats and event functions without wallet/secret logging.
- Removed unstable OpenSea `/auth/keys` fallback and nonproductive 401/429 retry loop.
- Added client fallback from unavailable in-app checkout to the exact OpenSea asset.
- Event endpoint now requires JSON, rejects foreign browser origins and caps optional webhook wait at 1.5 seconds.
- Collection stats timer is always cleared.
- Subject-share endpoint enforces GET/HEAD and retains CDN caching/noindex.
- Added matching events to the existing first-party, address-filtered analytics system.
- Added Base-ready 1200×628, 164 KB thumbnail asset.

## Security / reliability / cost

- No wallet address is persisted in analytics; address-like properties are removed.
- Checkout remains price/token/contract/seller/protocol/chain cross-validated before wallet submission.
- No external database, cron, edge store, image transformation or per-user server render was added.
- Main cost risk is abusive event/function traffic. Origin/content-type/body limits reduce browser abuse; robust distributed rate limiting would require Firewall or a shared store and is not justified before real traffic.
- Cache strategy is low-cost: static art at CDN, data short-lived, Subject share one-hour edge cache with stale window.

## Vercel as growth infrastructure

Implemented: exact share destinations, cached Subject previews, personalized result URLs, global delivery, funnel events, structured production logs. Next opportunities:

1. Generate 3:2 branded cards only for Subjects proven by match/share analytics.
2. Add Vercel Speed Insights only if the plan/data will actually be reviewed; current dependency-free lab checks are sufficient for zero traffic.
3. Run one preview migration away from legacy `builds`; promote only after all four functions and clean URLs pass.
4. Separate production and preview OpenSea credentials and mark them Sensitive.
5. Add Firewall rate limiting only after logs show abuse; do not pay for speculative infrastructure.

## Score

- **VERCEL CURRENT SCORE: 8.2/10**
- **VERCEL IDEAL SCORE: 9.5/10**

Not 10/10 because the OpenSea key is invalid, env sensitivity/separation is weak, legacy build configuration emits warnings, RUM is absent, no distributed rate limit exists, and real traffic/uptime evidence is too small. Ideal is 9.5 rather than 10 because OpenSea remains an external dependency.

