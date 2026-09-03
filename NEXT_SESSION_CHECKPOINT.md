# DECAY LABS — PERMANENT HANDOFF / CHECKPOINT

Checkpoint date: 2026-08-13 (Europe/Istanbul)

This is the canonical continuation document for the next session. Do not treat historical DONE labels as proof of current live health; revalidate the two blockers below first.

## 1. Critical blockers — highest priority

1. **Production checkout is not operational.** Claude's live verification found `GET /api/buy.js` returning `502 opensea_unavailable`, upstream `listing_best`. The configured OpenSea credential/checkout path must be repaired and then verified against production. The current failure is bounded and truthful, but a real in-app quote cannot be obtained.
2. **Analytics is not persistent.** `api/ev.js` can emit structured Vercel logs and optionally forward to `EVENT_WEBHOOK_URL`, but no durable measurement destination is configured/verified. Do not begin a real-user experiment until `EVENT_WEBHOOK_URL` and measurement persistence are implemented and live-verified.

## 2. Required measurement gaps

- Separate unique visitors from sessions without collecting unnecessary wallet/PII data.
- Move/verify `subject_match_started` timing so it represents an actual matching-flow start, not an ambiguous page load or late interaction.
- Distinguish share click/compose intent from measurable share completion; label completion unavailable unless the client/platform provides proof.
- Track OpenSea click, listing lookup, checkout intent, submitted/confirmed onchain sale and purchase completion without fabricating a sale from a click.
- Preserve Farcaster/Mini App attribution through clean source/campaign/content or equivalent first-party attribution.
- Define retention/return measurement before claiming Find Your Subject creates repeat use.
- Validate event persistence, deduplication, retry behavior, retention period and access path before inviting users.

## 3. Current production baseline

- Canonical site: `https://decaylabs.online`.
- Vercel project: `decaylabs_archive`; project ID `prj_G0IQA9GAdW79CUPXlk8m4KYQLXtc`.
- Last deployment made in this session: `dpl_BRPK9xtZYvatneg2GfPiNYS4kGUr`; state READY and aliased to the canonical domain.
- Vercel config still uses legacy `builds`; this makes dashboard Build/Development Settings ineffective and emits an ESM-to-CJS compile warning. Migrate only through Preview after the two critical blockers.
- Static delivery, Subject share caching and security headers were verified. A warm homepage response was fast in the audit, but this is not a substitute for real-user Core Web Vitals.
- Production `/api/buy.js`: **DEGRADED/BLOCKED**, returns `502 opensea_unavailable / listing_best` with the rejected OpenSea credential.
- Production analytics: **EPHEMERAL/INCOMPLETE** until a durable event destination is configured.
- No DNS change, wallet signature, transaction, NFT transfer, mint/burn, listing change, price change, reward claim or Appcoin operation was performed.

## 4. Find Your Subject state

- Live route: `/find-your-subject` (`find-your-subject.html`, `find-your-subject.js`, `subject-match.js`).
- Three lore-compatible choices deterministically select one real Subject from the 1,000-record corpus and produce a stable query path such as `?path=3-2-4`.
- Result supports exact Subject viewing and sharing; matching answers are not stored as personal data.
- Homepage primary discovery CTA points to Find Your Subject; Collect remains secondary.
- Added analytics vocabulary: `subject_match_started`, `subject_match_completed`, `subject_match_shared`.
- Added tests in `tests/subject-match.test.mjs`.
- Mobile 390px horizontal overflow caused by hidden/grid min-content behavior was fixed and rechecked.
- Product hypothesis remains unproven: discover → choose → match → inspect → share → return must be measured with persistent analytics and real users.

## 5. Subject share / Mini App state

- `api/subject-share.js` renders exact Subject title, canonical record URL and IPFS art with cached, noindex HTML; GET/HEAD behavior was tested.
- `subject-page.js` routes shares through exact Subject preview URLs.
- Farcaster signed manifest remains under `.well-known/farcaster.json`; it is Farcaster proof, not the current Base Dashboard app-registration source.
- Farcaster profile/package, pinned cast, directory registration/refresh and real-client cast-preview test remain account-level manual actions.
- Do not claim share completion from the current `subject_match_shared` event without platform confirmation; it presently represents a share action/intent boundary.

## 6. Checkout / OpenSea state

- `api/buy.js`, checkout rules and client validation were hardened for exact token, contract, seller, protocol target, price, stale listing, wallet and receipt validation.
- Authentication errors are no longer retried; automatic OpenSea key-mint fallback was removed to stop 401→mint→429 storms.
- Current live blocker remains the invalid/rejected OpenSea credential and `listing_best` upstream failure.
- Required next verification: rotate/fix credential in Vercel with owner authorization, mark it Sensitive, request a read-only production quote for an actually listed Subject, inspect runtime logs, verify exact token/price/contract, and do not sign or submit a transaction.
- Marketplace inventory was not changed. Previous audit observed roughly 800 listed NFTs and one holder; this may drift and must be refreshed directly from OpenSea before treating it as current. No listing was removed by this work, so items that were listed should still be for sale unless the owner/marketplace changed them externally.
- Supply presentation/listing-count/price decisions require explicit owner approval.

## 7. Analytics state

- `analytics.js` emits privacy-safe funnel events to `api/ev.js`.
- `api/ev.js` validates JSON/origin/body size, writes structured logs and supports optional `EVENT_WEBHOOK_URL` with a bounded timeout.
- `ops/funnel.mjs` parses legacy `DL_EVENT` and structured Vercel log records and counts sessions per step.
- Only `OPENSEA_API_KEY` was observed in Vercel env inventory; `EVENT_WEBHOOK_URL` was not verified configured. Secret values must never be copied into documentation or chat.
- Vercel runtime logs are observability, not an adequate long-term analytics datastore for the planned real-user experiment.
- No real experiment should start until durable storage/delivery and the measurement gaps in section 2 pass production verification.

## 8. Base Dashboard / Base ecosystem state

- Registered app: `https://dashboard.base.org/apps/6a6018e4426d14cfbad57663`.
- App name: Decay Labs; primary domain: `decaylabs.online`; tagline verified.
- Previously empty app description was filled and saved: interactive archive of 1,000 hand-illustrated Subjects on Base, lore/matching/sharing/onchain collect proof.
- Builder Code `bc_yb6cmebf` was verified against the ERC-8021 suffix in checkout code.
- Two Inbox tasks were read: Builder Code is relevant; Submit Your Appcoin was intentionally rejected. No Appcoin/token/signature/transaction was created.
- Observed last-week baseline: 0 opens, 0 active users, 0 transactions, 0 gas and zero entry-point/action counts.
- Weekly leaderboard visibility is enabled. Notifications are enabled but unused; do not send without opted-in users and a valuable event.
- Missing: Base thumbnail upload and up to three 1284×2778 screenshots. `public/base-app-thumbnail.jpg` is ready; upload was blocked because Chrome extension file-URL access is disabled.

## 9. Farcaster state

- Product-side manifest, deep links, exact Subject sharing, compose flow, content bank and audit materials exist.
- Account-side avatar/banner/bio/site/pinned intro, directory registration and genuine community/distribution work remain incomplete/manual.
- The product infrastructure does not compensate for the cold-start graph. Do not spam, mass-DM, automate replies or claim performance without data.
- Real-client verification must include one exact Subject cast and mobile preview inspection after analytics persistence is operational.

## 10. Talent state

- Talent 2026 audit/materials are under `ops/talent/`.
- Website/domain proof was strengthened, but Talent reports that `decaylabs.online` is already taken by another project record; this needs official support/identity resolution.
- Farcaster connection, project/contract association, profile visual/account changes and any verification signature remain manual.
- Talent should aggregate real builder proof; do not farm credentials, commits, projects, transactions or rewards.

## 11. GitHub / builder proof state

- README and deployment documentation were improved locally to expose the live Base/IPFS/Farcaster/Seaport/Vercel/test proof chain.
- `base-miniapp-buy-starter` was identified as a potentially useful reusable builder asset, but no artificial release/activity was created.
- The worktree is dirty and includes user-owned/pre-existing changes. Preserve it exactly. No commit, push, reset, revert, deletion or cleanup was performed at shutdown.
- Before any future commit, inspect every changed/untracked file and intentionally separate project work from unrelated user changes.

## 12. Files created in this work

- `DECAY_LABS_MASTER_RESOURCE_INVENTORY.md`
- `NEXT_SESSION_CHECKPOINT.md`
- `find-your-subject.html`
- `find-your-subject.js`
- `subject-match.js`
- `api/subject-share.js`
- `tests/subject-match.test.mjs`
- `tests/subject-share.test.mjs`
- `public/base-app-thumbnail.jpg`
- `ops/FINAL_OPTIMIZATION_2026-08-13.md`
- `ops/FINAL_OPTIMIZATION_EXTENSION_2026-08-13.md`
- `ops/VERCEL_PRODUCTION_REPORT_2026-08-13.md`
- `ops/BASE_BUILD_ECOSYSTEM_REPORT_2026-08-13.md`
- `ops/DEMAND_ENGINE_2026-08-13.md`
- Farcaster audit/content files under `ops/farcaster/`
- Talent audit files under `ops/talent/`

## 13. Files materially changed in the dirty worktree

At checkpoint time `git status --short` showed modifications to `.well-known/farcaster.json`, `DEPLOY.md`, `README.md`, `analytics.js`, checkout/API files, collection/home/subject/trust/link pages, metadata presentation, Mini App scripts, funnel logic, validation/build scripts, sitemap/styles, tests and selected operations documents. The authoritative exact list is the next-session `git status --short`; do not infer ownership or discard anything from this summary.

## 14. Test and deploy evidence

- `npm test`: **51/51 passed** after the final checkout authentication no-retry test.
- `npm run check`: **passed**.
- Syntax checks for checkout/matching client modules: **passed**.
- Final deployment: `dpl_BRPK9xtZYvatneg2GfPiNYS4kGUr`, READY, canonical alias active.
- Find Your Subject extensionless route redirect: live.
- Subject share HEAD: 200 with expected cache/security/noindex headers.
- Important limitation: unit/integration tests passing does not override the live checkout 502 or non-persistent analytics blockers.

## 15. Decisions and safety boundaries

- One Big Bet: Find Your Subject, because it can turn 1,000 static records into identity, preference, sharing and return behavior. Do not expand it before measuring it.
- Appcoin rejected: it would add token/speculation complexity without solving current demand.
- Empty Discord deferred; community should first form through meaningful Farcaster interactions.
- Base should provide ownership, provenance, settlement and attribution—not unnecessary tokens/points/contracts.
- No fake collectors, fake scarcity, wash trading, fake engagement, score farming or fabricated analytics.
- Account/OAuth, wallet, financial, listing/price, domain/DNS, reward and irreversible actions always require owner approval.

## 16. Manual work remaining

1. Owner-authorized OpenSea credential replacement in Vercel and live read-only quote verification.
2. Configure and verify durable analytics persistence through `EVENT_WEBHOOK_URL` or an equally simple privacy-safe store.
3. Repair the measurement gaps listed in section 2 and test end-to-end in production.
4. Upload Base thumbnail and three screenshots after enabling trusted browser file access.
5. Apply Farcaster profile/pinned cast and perform real-client registration/share validation.
6. Resolve Talent duplicate-domain ownership through support; connect accounts/contracts only with explicit approval.
7. Review dirty worktree before any intentional commit/push.
8. Refresh live OpenSea holder/listing/sales data and make a separate owner decision about supply presentation.
9. Only after blockers are cleared, recruit the first small cohort and measure real behavior before scaling distribution.

## 17. Canonical references

- Resource inventory: `DECAY_LABS_MASTER_RESOURCE_INVENTORY.md`
- Latest score/gap extension: `ops/FINAL_OPTIMIZATION_EXTENSION_2026-08-13.md`
- Vercel audit: `ops/VERCEL_PRODUCTION_REPORT_2026-08-13.md`
- Base audit: `ops/BASE_BUILD_ECOSYSTEM_REPORT_2026-08-13.md`
- Demand system: `ops/DEMAND_ENGINE_2026-08-13.md`
- Local cross-project status: `C:\Users\Muhammet\AI_SISTEM_DURUMU.md`
- Google Doc status: `AI Sistem Durumu ve Yapılanlar`

## NEXT SESSION START HERE

**Önce checkout'u production'da çalışır hale getir → analytics'i kalıcı hale getir → canlı doğrula → ancak bundan sonra gerçek kullanıcı testine geç.**
