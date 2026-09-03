# Decay Labs — Final Optimization and 10/10 Gap Analysis

Date: 2026-08-13

## Outcome

The original two 100-item audits were re-read, programmatically recounted and checked against repository/live state. Their historical completion tables contain 200/200 rows. The original summary arithmetic for Talent was wrong and is corrected: Farcaster 77 DONE / 15 PARTIAL / 8 N/A; Talent 89 DONE / 10 PARTIAL / 1 N/A. The starting partial count was therefore 25, not 29.

This pass improved the product rather than relabeling account-dependent work as complete. Code, documentation, production metadata, live endpoints and resource provenance were changed. No NFT, listing, price, wallet, contract, domain or reward transaction was performed.

## What changed

1. Added `api/subject-share.js`, a server-rendered exact-Subject social/Mini App preview endpoint.
2. Share actions now embed Subject-specific title, ID, IPFS art and canonical launch URL instead of the same generic OG card.
3. Invalid Subject preview IDs redirect safely to the collection.
4. Added two automated Subject-share tests; suite increased from 45 to 47 passing tests.
5. Added the share endpoint to site validation.
6. Deployed the endpoint and verified live Subject #0846 HTML, headers, canonical URL, IPFS image and launch action.
7. Rewrote obsolete/mojibake `DEPLOY.md` with the correct Vercel project, current APIs, environment names and truthful failure behavior.
8. Marked the Discord blueprint explicitly deferred instead of letting a legacy plan look active.
9. Expanded README builder proof with actual stack, Base/IPFS/Mini App/Seaport/analytics/test and transaction-safety facts.
10. Published and retained Talent domain verification metadata; live domain ownership proof is present even though Talent has a duplicate-domain conflict.
11. Built `DECAY_LABS_MASTER_RESOURCE_INVENTORY.md`, covering public accounts, repositories, local folders, images, metadata, IPFS, APIs, analytics, manifests, assets, tests, scripts, configs and legacy/duplicate resources.
12. Hash-verified two exact duplicate source relationships and left every file intact.

## Previously partial gaps closed or materially advanced

| Original item | Result now |
|---|---|
| Farcaster #23 social preview | **Closed at product level:** exact Subject title/art/embed now comes from the server and is live. Client-specific crop/cache still requires a real cast test. |
| Farcaster #95 correct profile link production | **Closed:** correct Farcaster URL is deployed on the canonical website. |
| Farcaster #22 manifest production validation | **Advanced:** manifest is live, signed and fields/icon are automatically validated; directory registration still account-dependent. |
| Farcaster #16 Subject segmentation | **Advanced:** curated/showcase groups and 48 local fast images are inventoried; full 1,000-image visual scoring remains unjustified without a dedicated visual pipeline. |
| Farcaster #43/#44 mobile/speed | **Advanced:** code, asset weights, caching and headers checked; real-device visual proof and PageSpeed lab data remain unavailable. |
| Talent #24/#25 project presentation | **Advanced:** project copy/category and public website proof improved; dedicated project image/social-link controls are limited by Talent UI. |
| Talent #55 duplicate identity | **Advanced:** exact error changed from missing tag to `Website url has already been taken`, proving a Talent-side duplicate rather than code failure. |
| Talent #63/#94 repo/site proof | **Closed locally/production:** README and website proof improved; README becomes public only after an intentional Git push. |

## New problems discovered beyond the 200 items

1. **Historical audit arithmetic error:** Talent totals did not match its 100 rows; corrected.
2. **Static social metadata limitation:** JavaScript-updated Subject pages could never give crawlers exact Subject metadata; fixed with a server endpoint.
3. **Documentation danger:** old deployment guide named a nonexistent API and described fabricated fallback stats; fixed.
4. **Source sprawl:** multiple exact/structural copies of 1,000 images and metadata exist without a provenance index; inventoried, not deleted.
5. **Legacy plan ambiguity:** Discord blueprint appeared operational despite current strategy rejecting an empty server; marked deferred.
6. **GitHub/Talent proof mismatch:** checkout starter is stronger Decay engineering proof than the currently linked BasePaint repo.
7. **Preview aspect ratio caveat:** canonical Subject art is square while current Farcaster guidance favors 3:2 embed images. The exact art now works, but clients may crop it. Generating 1,000 branded 3:2 cards would add substantial storage/build cost; not added blindly.

## Before → after scores

Scores measure the whole live system, not the quality of the report.

| Area | Before | After | Exact reason it is not 10/10 |
|---|---:|---:|---|
| Farcaster | 2.6/10 | 4.2/10 | Product/share foundation is much better, but the live profile still has almost no graph, optimized identity, pinned cast or participation. |
| Talent | 4.0/10 | 6.3/10 | Bio/role/project proof improved; Farcaster, contract, human proof and website verification remain incomplete; rank/rewards/impact are low. |
| Website | 7.5/10 | 8.8/10 | Strong live art/trust/funnel; real-device QA, lab performance evidence and fully dynamic canonical Subject HTML remain gaps. |
| Mini App | 5.5/10 | 8.5/10 | Signed manifest, fallbacks, navigation/share/checkout are live; directory registration, real usage and real-client embed validation remain. |
| GitHub / builder proof | 5.5/10 | 7.5/10 | Strong code/tests/README locally; low external adoption, no release history, incomplete public repo mapping and unpushed local proof reduce credibility. |
| Base / onchain proof | 6.0/10 | 7.0/10 | Real contract and collection exist; Talent project attribution, unique users, sales and broader contract impact are absent. |
| OpenSea / collect funnel | 5.0/10 | 6.5/10 | Exact token routing and guarded checkout are strong; 80% listing supply, one holder, no verified sales and weak marketplace social consistency remain. |
| Brand / lore | 7.5/10 | 8.4/10 | Distinct archive/proof concept and deep lore; visual repetition across one base composition and weak live social identity remain. |
| Content system | 3.5/10 | 8.5/10 | Six pillars, 30 casts, replies and experiments exist; they are not yet tested/published and lack performance data. |
| Analytics | 5.5/10 | 7.8/10 | Privacy-safe funnel coverage is strong; cast impression/profile visit and share completion are partially unobservable, and traffic is too small for decisions. |
| Trust | 5.0/10 | 8.0/10 | Transparent chain/contract/IPFS/transaction behavior; supply concentration, no collectors and incomplete Talent/OpenSea identity linkage remain. |
| Conversion | 3.0/10 | 6.8/10 | Exact Subject → listing and in-app collect paths work; demand, social proof and listing strategy—not buttons—are the constraint. |
| Discoverability | 1.5/10 | 4.8/10 | Better metadata/deep links/search identity; zero/near-zero social graph, absent Mini App directory listing and no organic sharing remain. |
| General system | 4.8/10 | 7.7/10 | Technical and strategic foundation is coherent; real users, collectors, account-level execution and external verification cannot be manufactured. |

## Remaining problems and why

### User/account authorization required

- Apply Farcaster avatar, banner, bio, website and pinned introduction.
- Register/refresh the Mini App and test an actual cast preview in Farcaster.
- Connect Farcaster to Talent.
- Add/verify the Base ERC-721 in Talent Smart contracts if Talent requests ownership authorization.
- Replace the Talent project image and correct repo mapping.
- Push reviewed GitHub changes and improve repo description/topics/license/release metadata.

### External support/paid access required

- Talent must release/merge the existing `decaylabs.online` project claim.
- Talent+ is required for unrestricted 15-profile filtered benchmark/export; buying it solely for this audit is not justified.
- PageSpeed API quota returned 429; later rerun or use a browser lab session.

### Wallet/financial decision required

- Reduce/restructure 800 OpenSea listings, change prices or update marketplace settings.
- Any NFT transfer, sale acknowledgement, contract ownership claim or reward claim.

### Real-world evidence required

- Followers, meaningful replies, Mini App opens/adds, collectors, transactions, testimonials, top Subjects and statistically useful content experiments.
- Active-contract credential requires 10+ unique transacting wallets; self-transactions would be manipulation.

## Manual action sequence

1. Farcaster: apply the prepared profile package and pin the prepared intro.
2. Farcaster developer tooling: register/refresh `decaylabs.online`, then cast one exact Subject-share URL and visually verify the embed.
3. Talent: connect Farcaster and submit the duplicate-domain error to official Support with the live meta proof.
4. Talent project: replace `basepaint-archive` with `base-miniapp-buy-starter` unless BasePaint is truly part of Decay Labs; add the ERC-721 through Smart contracts, not Token contract.
5. GitHub: review this dirty worktree, commit/push intentionally; do not publish unrelated user changes by accident.
6. OpenSea: decide whether 800 listings express the intended art strategy. Any change remains owner/wallet controlled.

## Test and deployment record

- `npm test`: **47/47 passed**.
- `npm run check`: **passed**.
- `node --check api/subject-share.js`: **passed**.
- Vercel production: **READY**, deployment `dpl_2k7Cex73EAcgtQjKookA1irdsAAX`.
- Canonical alias: **https://decaylabs.online**.
- Live exact preview: `/api/subject-share.js?id=846` returned 200 with correct title, canonical record, IPFS art, Mini App action, cache and `noindex` headers.
- Signed Farcaster manifest and 1024×1024 icon returned 200.

## Highest-impact next work

| Priority | Impact | Effort | Reason |
|---|---:|---:|---|
| Execute Farcaster profile + pinned intro | 10 | 2 | Converts every visit; current profile hides the product. |
| Register and real-client-test Mini App/embed | 10 | 2 | Unlocks actual discovery and validates the new share loop. |
| Resolve Talent domain + connect contract/Farcaster | 9 | 3 | Completes aggregated builder proof. |
| Curate OpenSea supply strategy | 9 | 4 | Current 80% listings/one holder is the largest collector trust gap. |
| Run the 30-day content/reply experiment | 9 | ongoing | Produces the real data the system currently lacks. |
| Intentionally push/release GitHub proof | 8 | 3 | Makes local engineering quality externally verifiable. |
| Generate branded 3:2 cards for proven top Subjects | 7 | 4 | Avoid generating 1,000 cards before analytics identifies useful Subjects. |

## Resource inventory

The canonical inventory is `DECAY_LABS_MASTER_RESOURCE_INVENTORY.md` at the repository root. It records active, supporting, legacy, duplicate, unused and blocked resources without secrets and without deleting anything.
