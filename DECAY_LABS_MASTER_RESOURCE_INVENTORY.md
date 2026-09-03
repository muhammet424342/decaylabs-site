# Decay Labs Master Resource Inventory

Inventory date: 2026-08-13 (Europe/Istanbul)

Status vocabulary: ACTIVE = current production/source; SUPPORTING = useful evidence/material; LEGACY = superseded but retained; DUPLICATE = byte-identical or structurally duplicated; BLOCKED = known resource whose ownership/verification needs an external action. No secret values are recorded.

## 1. Canonical identity and public surfaces

| Name | Type | Location / URL | Purpose | Status | Used? | Importance | Notes |
|---|---|---|---|---|---|---:|---|
| Decay Labs | Brand/project | `Decay Labs / The Half-Life Archive` | Umbrella onchain art/product identity | ACTIVE | Yes | Critical | Tagline: “Everything decays. Proof remains.” |
| Production website | Website/domain | https://decaylabs.online | Brand, lore, Subject discovery, trust and collect funnel | ACTIVE | Yes | Critical | Canonical Vercel alias; production verified. |
| Vercel deployment URL | Deployment | `decaylabsarchive-qmkz6heo1-muhammet424342s-projects.vercel.app` | Latest production build origin | ACTIVE | Indirect | High | Deployment `dpl_BRPK9xtZYvatneg2GfPiNYS4kGUr`; canonical domains alias here. |
| GitHub account | Builder identity | https://github.com/muhammet424342 | Public proof of work | ACTIVE | Yes | High | Five public repos at snapshot. |
| Farcaster profile | Social/builder identity | https://farcaster.xyz/decaylabs | Farcaster discovery and Mini App identity | ACTIVE but weak | Yes | Critical | FID 3343103; profile optimization/pinned cast still manual. |
| X profile | Social identity | https://x.com/Decaylabss | Broader public content/distribution | ACTIVE | Yes | Medium | Connected to Talent. |
| Talent builder profile | Reputation | https://talent.app/muhammet424342 | Aggregated builder proof | ACTIVE | Yes | High | Updated to personal builder + project identity. |
| Talent project | Project reputation | https://talent.app/~/projects/c675408f-d727-48ff-9008-77465498d951 | GitHub/project impact aggregation | ACTIVE/PARTIAL | Yes | High | Website verification blocked by duplicate-domain ownership. |
| OpenSea collection | Marketplace | https://opensea.io/collection/decaylabs-archive | Secondary listings and ownership/activity | ACTIVE | Yes | Critical | 800 listings/80%, one holder at audit; no settings changed. |
| Base contract | ERC-721 | https://basescan.org/address/0x65F5e8006F4eF730d6984836F606a5C5c516CdC8 | Onchain ownership/transfer proof | ACTIVE | Yes | Critical | 1,000 supply; chain ID 8453. |
| Public founder wallet | EVM identity | `0x9072954ead2b42d8bc992861e22ec170a622eb06` | Founder-held inventory and Talent identity | ACTIVE/PUBLIC | Yes | High | Public proof only; no balance/private credential recorded. |

## 2. Repositories and local project roots

| Name | Type | Location / URL | Purpose | Status | Used? | Importance | Notes |
|---|---|---|---|---|---|---:|---|
| Production repository | Git/local repo | `C:\Users\Muhammet\Desktop\NFT\decaylabs_archive` / https://github.com/muhammet424342/decaylabs-site | Current site, Mini App, APIs, metadata and operations | ACTIVE source of truth | Yes | Critical | Branch `decaylabs-validation-2026-08-04`; dirty worktree contains reviewed user + current changes. |
| Checkout starter | GitHub repo | https://github.com/muhammet424342/base-miniapp-buy-starter | Reusable Base/OpenSea/Seaport checkout proof | ACTIVE supporting | Yes | High | MIT, 1 star, relevant topics; should be a Talent project data source. |
| BasePaint Archive | GitHub repo | https://github.com/muhammet424342/basepaint-archive | Separate Base art/archive experiment | SUPPORTING/secondary | Not in Decay product | Medium | Currently linked to Decay Labs Talent project; verify relationship or separate it. |
| Scraper portfolio | GitHub repo | https://github.com/muhammet424342/scraper-portfolio | Python engineering proof | SUPPORTING/off-position | No | Low for Decay | Legitimate builder proof, not a Decay project source. |
| GitHub profile config | GitHub repo | https://github.com/muhammet424342/muhammet424342 | GitHub profile repository | LEGACY/empty | No | Low | No useful README content at snapshot. |
| Old static site | Local folder | `C:\Users\Muhammet\Desktop\NFT\decaylabs_site` | Early two-file site/install package | LEGACY | No | Low | 2 files, ~9 KB; do not confuse with production Git repo. |
| Working metadata/lore set | Local folder | `C:\Users\Muhammet\Desktop\NFT\decaylabs_calisma` | Historical working data | LEGACY/SUPPORTING | Unknown | Medium | 2,005 files; retain until provenance review. |
| Empty decay folder | Local folder | `C:\Users\Muhammet\Desktop\NFT\decay` | Unknown placeholder | UNUSED | No | Low | Empty; safe deletion not performed. |

## 3. Original NFT images and metadata archives

| Name | Type | Location | Purpose | Status | Used? | Importance | Notes |
|---|---|---|---|---|---|---:|---|
| Original 1,000 images | PNG archive | `C:\Users\Muhammet\Desktop\NFT\decay labs kopya 1000 adet` | Full original art set | LEGACY master/copy | Source heritage | Critical | 1,000 files, ~208 MB. Sample hash equals `part1/1.png`. |
| Image part 1 | PNG archive | `...\NFT\part1` | Images 1–330 | DUPLICATE split | No direct | Medium | 330 files; part of the same set as combined folder. |
| Image part 2 | PNG archive | `...\NFT\part2` | Images 331–660 | DUPLICATE split | No direct | Medium | 330 files. |
| Image part 3 | PNG archive | `...\NFT\part3` | Images 661–1000 | DUPLICATE split | No direct | Medium | 340 files. |
| Old metadata set A | JSON archive | `...\NFT\cıd` | Original/simple metadata | DUPLICATE legacy | No | Medium | 1,000 files; sample hash identical to `metadata (1)`. |
| Old metadata set B | JSON archive | `...\NFT\metadata (1)` | Original/simple metadata | DUPLICATE legacy | No | Medium | 1,000 files. Do not delete without owner confirmation. |
| Old metadata fragment | JSON archive | `...\NFT\json part 1` | Partial old metadata | LEGACY/duplicate subset | No | Low | 330 files. |
| Deployed metadata | Generated JSON | `...\NFT\decaylabs_calisma\metadata_tw\` | The set the contract actually serves | ACTIVE | Yes | Critical | 0-indexed, extensionless, matching `tokenURI(N) = ipfs://QmXShBe.../N`. token 0 = "DecayLabs #1" → `1.png`. This is the authority for Subject↔token↔image mapping. |
| Draft metadata (NOT deployed) | Generated JSON | `metadata-v2/` | 1,000 draft records | DRAFT — DO NOT PUBLISH | No | High | Renumbered 1-based and points at `ipfs://QmcNKaghAM636EiW9zQeirxz25s7fU1eJ8tN8PzLgK7qP`, which is not a valid CID (45 chars → 33 bytes, prefix `0x5003`). Publishing this set would break every token. Its bad CID leaked into the site config on 15 Aug 2026 and blanked all Subject artwork. |
| Production IPFS images | Decentralized media | `ipfs://Qmb5cxL3Qf3vZU7Fk5z9Cg7Vv4AzygWMUY3WEKB6HEsZPd/{id}.png` | Canonical Subject artwork | UNPINNED | Yes | Critical | The CID on chain and in `CIDLER.txt`. Valid, but every gateway returns 504 — the content lived on the retired `92.4.76.23` IPFS node. Site now serves the same files over HTTPS via `storage.imageBaseUrl`; re-pinning the identical folder (CIDv0 + wrapWithDirectory) should reproduce this CID and revive the onchain links. |
| Subject source images | PNG | `...\NFT\decay labs kopya 1000 adet\` | 1,000 source artworks, 198 MB | ACTIVE | Yes | Critical | `1.png`–`1000.png`; the only surviving full copy besides OpenSea's CDN cache. |

## 4. Product pages and frontend modules

| Name | Type | Location | Purpose | Status | Used? | Importance | Notes |
|---|---|---|---|---|---|---:|---|
| Home | HTML | `index.html` / `/` | Positioning, featured Subjects, build proof | ACTIVE | Yes | Critical | Includes Talent verification meta and Farcaster link. |
| Archive | HTML/JS | `lore.html`, `lore-page.js` / `/lore` | Ten arcs and 100 chapter hooks | ACTIVE | Yes | High | Deep lore layer. |
| Collection | HTML/JS | `collection.html`, `collection-page.js` / `/collection` | Curated discovery and Subject lookup | ACTIVE | Yes | Critical | Human Subject IDs 1–1000. |
| Subject record | HTML/JS | `subject.html`, `subject-page.js`, `subject-model.js` / `/subject?id={id}` | Individual art/lore/verify/collect/share | ACTIVE | Yes | Critical | Maps human ID to onchain token ID minus one. |
| Find Your Subject | HTML/JS | `find-your-subject.html`, `find-your-subject.js`, `subject-match.js` / `/find-your-subject` | Deterministic personalized discovery/share loop | ACTIVE | Yes | Critical | Three answers, no wallet or stored personal data; deep-link path. |
| Trust | HTML/JS | `trust.html`, `trust-page.js` / `/trust` | Contract/storage/inventory/safety disclosure | ACTIVE | Yes | Critical | No fabricated stats. |
| FAQ | HTML | `faq.html` / `/faq` | Plain-language product answers | ACTIVE | Yes | Medium | Trust/support. |
| Official links | HTML | `links.html` / `/links` | Canonical destinations | ACTIVE | Yes | High | Includes correct Farcaster/X/OpenSea/Base links. |
| Error page | HTML | `404.html` | Invalid route recovery | ACTIVE | Yes | Low | Required by validator. |
| Global app | JavaScript | `app.js` | Navigation, shared behaviors, Mini App ready | ACTIVE | Yes | High | SDK absence degrades safely. |
| Checkout client | JavaScript modules | `miniapp-buy.js`, `checkout-client.mjs`, `checkout-rules.mjs` | Quote, wallet, transaction and confirmation flow | ACTIVE | Yes | Critical | Token 0 supported; guarded failure UX. |
| Analytics client | JavaScript | `analytics.js` | Privacy-limited funnel events | ACTIVE | Yes | High | No wallet addresses. |
| Styles | CSS | `styles.css` | Responsive visual system | ACTIVE | Yes | High | Real-device changed-control QA still desirable. |

## 5. APIs and server-side integrations

| Name | Type | Location / URL | Purpose | Status | Used? | Importance | Notes |
|---|---|---|---|---|---|---:|---|
| Buy/quote API | Vercel function | `api/buy.js` / `/api/buy.js` | OpenSea listing selection and Seaport fulfillment | ACTIVE | Yes | Critical | Uses server credential; validates identity/price. |
| Collection stats API | Vercel function | `api/collection-stats.js` / `/api/collection-stats.js` | Live marketplace stats | ACTIVE | Yes | High | Explicit unavailable state when credential/upstream fails. |
| Event API | Vercel function | `api/ev.js` / `/api/ev.js` | Receive/forward allowed funnel events | ACTIVE | Yes | High | Optional server webhook. |
| Subject share API | Vercel function | `api/subject-share.js` / `/api/subject-share.js?id={id}` | Server-render exact Subject title/image/embed then open canonical record | ACTIVE | Yes | High | Added 2026-08-13; noindex; 47-test suite covers boundaries. |
| Checkout rules server copy | Server module | `api/lib/checkout-rules.js` | Vercel-compatible validation copy | ACTIVE | Yes | Critical | Automated parity test with browser rules. |
| Netlify stats function | Legacy function | `netlify/functions/stats.js` | Previous hosting stats path | LEGACY | No production | Low | Retained; Vercel is canonical. |
| Netlify config | Hosting config | `netlify.toml` | Previous/alternate host config | LEGACY | No | Low | Marked for review; not deleted. |

## 6. Farcaster and Mini App resources

| Name | Type | Location / URL | Purpose | Status | Used? | Importance | Notes |
|---|---|---|---|---|---|---:|---|
| Signed manifest | JSON | `.well-known/farcaster.json` / `/.well-known/farcaster.json` | Domain association and discovery metadata | ACTIVE | Yes | Critical | FID 3343103, Base chain, current icon/hero/OG fields. |
| Subject embed | Meta/API | `subject.html`, `api/subject-share.js` | Generic fallback + exact Subject share preview | ACTIVE | Yes | High | Exact preview deployed; IPFS source image is square, so client crop behavior still varies. |
| SDK integration | JavaScript | `app.js`, `subject-page.js`, `miniapp-buy.js` | ready, composeCast and wallet behavior | ACTIVE | Yes | Critical | Standard-browser fallbacks preserved. |
| App directory presence | External discovery | Farcaster Apps directory | Mini App acquisition | BLOCKED/PARTIAL | No | High | App not found at audit; registration/usage requires account action. |
| Farcaster master audit | Report | `ops/farcaster/2026-master-audit.md` | Strategy and evidence | ACTIVE reference | Yes | High | A–R output. |
| Farcaster completion audit | Matrix | `ops/farcaster/completion-audit.md` | Original 100-item status | HISTORICAL baseline | Yes | High | Do not rewrite as if historical status never existed. |
| 30-cast bank | Editorial asset | `ops/farcaster/30-cast-bank.md` | Human-reviewed English publishing inventory | ACTIVE | Not published automatically | High | 12 no-sell, 14 soft-sell, 4 direct-sell. |

## 7. Talent and builder-proof resources

| Name | Type | Location / URL | Purpose | Status | Used? | Importance | Notes |
|---|---|---|---|---|---|---:|---|
| Talent profile | Account | https://talent.app/muhammet424342 | Personal builder reputation | ACTIVE | Yes | High | Muhammet + Decay Labs, Engineering, Konya. |
| Talent project | Project | project ID above | Project GitHub/contract impact | ACTIVE/PARTIAL | Yes | High | Consumer Apps, description saved. |
| Talent website proof | HTML meta | `index.html` | Prove domain ownership | ACTIVE but blocked | Yes | High | Meta is live; Talent says URL already taken. |
| Talent master audit | Report | `ops/talent/2026-master-audit.md` | A–R builder reputation audit | ACTIVE reference | Yes | High | Current-state research and actions. |
| Talent completion audit | Matrix | `ops/talent/completion-audit.md` | Original 100-item status | HISTORICAL baseline | Yes | High | 100 rows. |

## 8. Lore, collection data and content systems

| Name | Type | Location | Purpose | Status | Used? | Importance | Notes |
|---|---|---|---|---|---|---:|---|
| Lore source | JSON | `data/lore.json` | Vanta, Bloom, five factions, ten arcs, 100 chapters | ACTIVE source | Yes | Critical | Do not invent contradictory lore. |
| Collection source | JSON | `data/collection.json` | Chain, contract, links, CIDs, curated IDs and truth copy | ACTIVE source | Yes | Critical | Public wallet by design. |
| X 30-day calendar | Content plan | `ops/x/30-day-calendar.md` | X publishing plan | SUPPORTING | Human use | Medium | Adapt, never copy verbatim to Farcaster. |
| X 100 ideas | Content bank | `ops/x/100-post-ideas.md` | Long-term content inventory | SUPPORTING | Human use | Medium | Needs platform adaptation. |
| X profile/pinned | Copy | `ops/x/profile-and-pinned.md` | X conversion copy | ACTIVE reference | Human use | Medium | Current OpenSea slug updated. |
| X reply system | Playbook | `ops/x/reply-system.md` | Relationship workflow | SUPPORTING | Human use | Medium | No bots/spam. |
| Publishing pack | JSON | `ops/x/final-publishing-pack.json` | Structured X drafts/assets | SUPPORTING | Human review | Medium | No automatic publication. |
| Metrics CSV | Data template | `ops/x/metrics.csv` | Manual content performance tracking | ACTIVE template | Available | Medium | Never fabricate values. |
| Discord blueprint | Legacy plan | `ops/community/discord-setup.md` | Possible future holder community | DEFERRED | No | Low | Explicitly marked not active. |
| OpenSea profile plan | Marketplace doc | `ops/marketplace/opensea-profile.md` | Marketplace copy/inventory plan | SUPPORTING | Not auto-applied | High | Wallet/account changes require approval. |
| Inventory release CSV | Marketplace plan | `ops/marketplace/inventory-release.csv` | Curated listing schedule | LEGACY/UNEXECUTED | No | Medium | Never treat planned rows as live listings. |

## 9. Brand and social assets

| Name | Type | Location | Purpose | Status | Used? | Importance | Notes |
|---|---|---|---|---|---|---:|---|
| Brand mark | SVG | `public/brand-mark.svg` | Site mark/favicon fallback | ACTIVE | Yes | High | Small-size identity. |
| X/Farcaster avatar | PNG 1024×1024 | `public/x-avatar.png` | Profile and manifest icon | ACTIVE | Manifest yes; profile manual | High | No alpha; current discovery requirement. |
| X/Farcaster banner | JPEG 1500×500 | `public/x-banner.jpg` | Social banner | ACTIVE asset | Manual | High | Profile application still manual. |
| OG v2 | PNG 1200×630 | `public/og-v2.png` | Generic site/manifest preview | ACTIVE | Yes | High | ~1.1 MB; can be optimized later. |
| Base App thumbnail | JPEG 1200×628 | `public/base-app-thumbnail.jpg` | Base Dashboard listing thumbnail | READY / NOT UPLOADED | No | High | 164 KB; upload blocked by Chrome extension file-URL permission. |
| OG legacy | PNG | `public/og.png` | Previous preview | LEGACY | Unknown | Low | Candidate for later cleanup after reference scan. |
| Brand key art | PNG | `public/brand-key-art.png` | Hero/social creative | ACTIVE | Yes | High | Generated by brand script. |
| Social card template | PNG | `public/social-card-template.png` | Content production template | SUPPORTING | Available | Medium | Human editorial asset. |
| Icons | PNG | `public/icon-192.png`, `icon-512.png`, `apple-touch-icon.png`, `favicon-32.png` | PWA/splash/browser icons | ACTIVE | Yes | Medium | Manifest discovery uses 1024 avatar; splash uses 192. |
| Curated NFT images | PNG | `public/nft-*.png` | Fast featured/Subject display | ACTIVE | Yes | High | 48 local images; remaining Subjects use IPFS. |
| Legacy image copies | PNG | `public/image-*.png`, `public/13.png`, `public/14.png` | Older curated assets | LEGACY/needs reference review | Mixed | Low | Do not delete without exhaustive reference check. |

## 10. Tests, scripts, configs and operations

| Name | Type | Location | Purpose | Status | Used? | Importance | Notes |
|---|---|---|---|---|---|---:|---|
| Test suite | Node tests | `tests/*.test.mjs` | API, checkout, analytics, retries, receipt, Subject/share/match validation | ACTIVE | Yes | Critical | 51 tests passing after Vercel/Base demand pass. |
| Site validator | Script | `scripts/validate-site.mjs` | Pages, truth copy, lore, supply, metadata and Farcaster manifest checks | ACTIVE | Yes | Critical | Validates 1024 icon and required manifest fields. |
| Metadata generator | Script | `scripts/generate-metadata.mjs` | Rebuild enriched metadata | ACTIVE/controlled | Available | High | Do not rerun/publish IPFS without review. |
| Brand asset builder | Python | `scripts/build-brand-assets.py` | Generate social/brand images | SUPPORTING | Available | Medium | Source asset pipeline. |
| Content pack builder | Script | `scripts/build-content-pack.mjs` | Structured content asset preparation | SUPPORTING | Available | Medium | Human review gate. |
| Vercel config | Config | `vercel.json`, `.vercel/project.json` | Functions, static files, headers and project identity | ACTIVE | Yes | Critical | Project name `decaylabs_archive`; security headers enabled. |
| Web manifest | Config | `manifest.webmanifest` | Installable web-app metadata | ACTIVE | Yes | Medium | Separate from Farcaster manifest. |
| Robots/sitemap | SEO | `robots.txt`, `sitemap.xml` | Search crawl routing | ACTIVE | Yes | Medium | Subject query variants are not individually enumerated. |
| Package config | Node config | `package.json` | Scripts/engine/module mode | ACTIVE | Yes | High | Node >=20; no runtime dependency bloat. |
| Environment names | Server config | Vercel environment | OpenSea plus optional curated IDs/event webhook | ACTIVE/PARTIAL | Yes | Critical | Live Vercel inventory exposed only `OPENSEA_API_KEY` across Production/Preview/Development; code optionally supports `CURATED_TOKEN_IDS`, `EVENT_WEBHOOK_URL`. Values never inventoried. Current OpenSea credential returns 401 and is not marked Sensitive. |
| Deployment guide | Operations doc | `DEPLOY.md` | Safe release and verification | ACTIVE | Yes | High | Rewritten to remove obsolete route/fake fallback guidance. |
| Security audit | Report | `ops/audit/security.md` | Threat and control review | SUPPORTING | Yes | High | Historical; current tests are stronger evidence. |
| Checkout scenarios | Report | `ops/audit/checkout-scenarios.md` | Failure/edge cases | SUPPORTING | Yes | High | Matches automated coverage. |
| IPFS verification | Report | `ops/audit/ipfs-verification.md` | Storage/provenance evidence | SUPPORTING | Yes | High | Reverify before any metadata mutation. |
| Final audit | Report | `ops/audit/final-report.md` | Earlier implementation audit | HISTORICAL | Yes | Medium | Superseded in strategy by 2026 audits. |
| 90-day execution | Plan | `ops/90-day-execution.md` | Operational roadmap | SUPPORTING | Human use | Medium | Reconcile with current final priorities. |
| Implementation matrix | Matrix | `ops/implementation-matrix.md` | Work/status map | HISTORICAL | Yes | Medium | Do not assume current without verification. |
| External actions docs | Boundary docs | `ops/external-actions.md`, `ops/external-actions-v2.md` | Wallet/account/manual action queue | ACTIVE reference | Yes | High | v2 is newer; both retained. |
| Funnel analyzer | Script | `ops/funnel.mjs` | Parse privacy-safe event logs | ACTIVE | Available | High | Raw event source depends on configured delivery/log access. |
| Dev server | Script | `ops/dev-server.mjs` | Local static testing | ACTIVE | Available | Medium | API behavior still needs Vercel/tests. |
| Claude handoff | Handoff doc | `CLAUDE_DEVAM.md` | Older continuation context | LEGACY | No current | Low | May be stale; retained. |

## 11. Duplicate, legacy and deletion review queue

Nothing was deleted. Owner review is required before cleanup.

1. Exact duplicate metadata roots: `cıd` and `metadata (1)`.
2. Exact/structural duplicate image roots: combined 1,000-image folder versus `part1/part2/part3`.
3. Partial legacy metadata: `json part 1`.
4. Legacy site root: `decaylabs_site` (two files).
5. Empty root: `decay`.
6. Legacy Netlify function/config while production is Vercel.
7. Legacy public images (`image-*`, numeric files, old `og.png`) after reference verification.
8. Historical audit/implementation documents; retain as provenance, label rather than delete.

## 12. Known external/manual dependencies

- Farcaster profile avatar/banner/bio/site/pinned cast and Mini App directory registration.
- Talent Farcaster connection, optional human verification and contract attribution.
- Talent support resolution for `decaylabs.online` already attached to another project record.
- GitHub push/profile/repository metadata changes; local README changes are not public until intentionally pushed.
- OpenSea listing count, pricing, collection profile/Farcaster link and any ownership transfer.
- Any wallet signature, transaction, contract ownership proof, reward claim, DNS or payment.

## 13. Vercel production resources

| Name | Type | URL / location | Purpose | Status | Used? | Importance | Notes |
|---|---|---|---|---|---|---:|---|
| Vercel project | Hosting/project | `decaylabs_archive` / `.vercel/project.json` | Production, previews, functions, CDN | ACTIVE | Yes | Critical | Project ID `prj_G0IQA9GAdW79CUPXlk8m4KYQLXtc`; Node 24.x. |
| Production deployment | Deployment | `dpl_BRPK9xtZYvatneg2GfPiNYS4kGUr` | Current live build | READY | Yes | Critical | Final verified CLI deployment; rollback available in history. |
| Custom domains | DNS/aliases | `decaylabs.online`, `www.decaylabs.online` | Canonical product access | ACTIVE | Yes | Critical | No DNS changes made. |
| Preview deployments | Deployments | Vercel project history | Branch/change verification | ACTIVE | Sometimes | Medium | Multiple READY previews observed. |
| Function: checkout | Node function | `api/buy.js` | OpenSea listing/Seaport quote | DEGRADED | Yes | Critical | OpenSea credential returns 401; exact-asset fallback deployed. |
| Function: stats | Node function | `api/collection-stats.js` | Transparent marketplace stats | ACTIVE/FALLBACK | Yes | Medium | Cached, bounded request; truthful empty fallback. |
| Function: events | Node function | `api/ev.js` | Privacy-safe funnel logs | ACTIVE | Yes | High | JSON/origin/body controls; optional webhook timeout. |
| Function: Subject share | Node function | `api/subject-share.js` | Exact social preview | ACTIVE/CACHED | Yes | High | GET/HEAD, CDN cache, noindex. |
| Vercel config | Config | `vercel.json` | Builds, headers, caching, clean URLs | ACTIVE/NEEDS PREVIEW MIGRATION | Yes | High | Legacy `builds` makes project build settings ineffective. |
| Vercel observability | Runtime logs | Vercel Dashboard/API | Errors, latency, conversion events | ACTIVE | Yes | High | Structured logs added; no drain/RUM verified. |
| Vercel report | Audit | `ops/VERCEL_PRODUCTION_REPORT_2026-08-13.md` | Production/growth evidence | ACTIVE | Yes | High | Scores, faults and opportunities. |

## 14. Base Dashboard and ecosystem resources

| Name | Type | URL / location | Relation to Decay Labs | Status | Proof value | Used? | Notes |
|---|---|---|---|---|---:|---|---|
| Base Dashboard app | Registered Base app | `https://dashboard.base.org/apps/6a6018e4426d14cfbad57663` | Metadata, analytics, discovery, attribution | ACTIVE | Critical | Yes | Name/domain/tagline verified; description saved. |
| Primary app domain | Domain proof | `decaylabs.online` | Connects Dashboard to product | ACTIVE | Critical | Yes | One primary domain. |
| Builder Code | ERC-8021 attribution | `bc_yb6cmebf` | Attributes Decay-generated transactions | ACTIVE | Critical | Yes | Encoded checkout suffix matches Dashboard. |
| Dashboard analytics | Product metrics | App Overview | Opens/users/transactions/entry points | ACTIVE / ZERO DATA | High | Yes | Last-week values observed as zero. |
| Weekly leaderboards | Discovery setting | Dashboard Configuration | Potential Base discovery | ENABLED | Medium | Yes | Visibility on; performance zero. |
| Base App notifications | Dashboard setting/API | Dashboard Configuration | Opt-in retention | ENABLED / UNUSED | Medium | No sends | Do not send without opted-in users/value. |
| App description | Account field | Dashboard App Information | Product positioning | ACTIVE | High | Yes | 157/180 characters; saved. |
| Base App thumbnail | Listing asset | `public/base-app-thumbnail.jpg` | Discovery card | READY / BLOCKED UPLOAD | High | No | Requires Chrome extension file-URL permission. |
| Base App screenshots | Listing assets | Not created/uploaded | Demonstrate product | MISSING | High | No | Requires 1284×2778 captures. |
| Appcoin task | Dashboard task | Base Dashboard | Optional token distribution | NOT RELEVANT | Low/negative | No | Intentionally rejected. |
| Base report | Audit | `ops/BASE_BUILD_ECOSYSTEM_REPORT_2026-08-13.md` | Current proof/score/opportunities | ACTIVE | High | Yes | Official docs + logged-in Dashboard. |
| Next-session checkpoint | Handoff / operational source of truth | `NEXT_SESSION_CHECKPOINT.md` | Preserve production baseline, dirty worktree, blockers, decisions, measurement gaps and exact restart order | ACTIVE / CANONICAL | Critical | Start here before any development, deploy, account action or user experiment. |
| Demand report | Strategy/execution | `ops/DEMAND_ENGINE_2026-08-13.md` | First users/collectors system | ACTIVE | High | Yes | Includes A–T and One Big Bet. |
