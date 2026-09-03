# Decay Labs — Farcaster Master Growth Audit

Audit date: 2026-08-13 (Europe/Istanbul)

Evidence boundary: repository, live website, logged-in Farcaster profile, OpenSea collection and current official Farcaster/Base documentation were inspected. Metrics below are a dated snapshot. Mobile layout was code-inspected but the changed Subject controls were not visually tested in a real mobile viewport. PageSpeed lab data was unavailable because the API returned 429.

## A — Executive diagnosis

1. The product is much stronger than the Farcaster account: a working Base collection, 1,000 metadata records, individual Subject pages, lore, direct OpenSea item links and a guarded in-app checkout exist, but the profile exposes almost none of that proof.
2. The verified profile is `@decaylabs`: 0 followers, 0 following and four casts at the audit snapshot. It has no pinned introduction, no website field, an unrelated cartoon avatar and an empty banner.
3. The brand's strongest door is not “another Base NFT.” It is a dark-science onchain archive: 1,000 altered witnesses whose ownership record survives decay.
4. The existing casts behave like link drops or product announcements. There is no Subject-led art feed, reply history or recognizable Farcaster-native participation.
5. The live site is visually coherent and unusually transparent: supply, chain, contract, no-mint status and IPFS are clear. This trust is not carried into the social profile.
6. OpenSea is the largest conversion/trust constraint: 800/1,000 items were listed, one wallet held 100%, and no sales/volume were visible. Content cannot hide this.
7. A critical Subject/onchain identity defect was found: human Subject #1 mapped to OpenSea token 1 instead of token 0. It is fixed locally and covered by tests.
8. Subject pages are the right Farcaster landing destination. They now support Previous, Random, Next, Share and direct token-specific OpenSea routing.
9. The signed Farcaster manifest existed, but the discovery icon was only 192×192 and current discovery fields were missing. It is upgraded locally to the current manifest shape with a 1024×1024 PNG.
10. The app was not found in the live Apps directory. Registration/refresh and real usage remain external dependencies.
11. The art reads as a coherent collection, but the same bust/weapon composition across 1,000 tokens creates a “one base image, many traits” impression. Content must reveal meaningful visual and narrative differences, not merely rotate thumbnails.
12. The realistic first milestone is not sales or 10,000 followers. It is a credible profile, 12 strong casts, 25–40 meaningful ecosystem interactions and the first 100 relevant followers/visitors.
13. A founder-plus-project model is stronger than a silent brand account: keep Decay Labs as the art world, but let a human builder voice explain decisions and shipped work.
14. Do not add points, streaks, notifications, Discord or a large analytics dashboard now. They do not solve the zero-distribution and supply-trust problems.
15. Highest leverage: repair profile conversion, deploy the corrected Subject/manifest flow, publish a pinned intro, enter art/Base/Farcaster conversations naturally, and measure Subject-to-OpenSea intent.

## B — Ten largest problems (impact order)

1. **Zero social graph and zero community participation** — Discovery has no seed network.
2. **Profile identity failure** — avatar, banner, bio and links do not explain or prove Decay Labs.
3. **OpenSea supply concentration** — 80% listed and one wallet holding 100% weakens perceived curation and collector confidence.
4. **No collector proof** — no verified sale, holder voice or organic ownership loop exists.
5. **Link-drop content** — three of four casts were primarily promotional; none demonstrated sustained participation.
6. **Art differentiation is not demonstrated** — the grid looks highly repetitive without trait/lore interpretation.
7. **No pinned onboarding** — a visitor cannot understand What/Why Base/Where to explore in seconds.
8. **Mini App discovery incomplete** — valid signed manifest exists but the app was absent from the directory and icon/metadata were outdated.
9. **Generic social preview** — Subject URLs deep-link correctly, but still use one generic image rather than Subject-specific visual previews.
10. **No baseline conversion data** — events exist, but volume is insufficient and impression/profile-visit data is unavailable.

## C — Ten largest opportunities (impact order)

1. Make each Subject a shareable acquisition object with an exact URL, art, micro-lore and one action.
2. Use the 1,000 records as a curated library, not a daily random catalogue.
3. Turn the shipped checkout, metadata, IPFS and Base work into credible build-in-public proof.
4. Use “Everything decays. Proof remains.” as a trust concept, not a repeated ad slogan.
5. Enter curator/artist/builder graphs through informed replies before asking for attention.
6. Create a founder-human layer that makes the anonymous laboratory believable.
7. Register/refresh the Mini App after production deployment and use native compose/share flows.
8. Produce Subject-specific OG images so every share carries the actual work.
9. Make the OpenSea decision architecture honest: art/lore first, transparent listed price second, wallet only at purchase.
10. Curate a smaller visible sales surface later, with owner approval, instead of presenting 800 interchangeable listings.

## D — Profile revision

**Display name:** `Decay Labs / Half-Life Archive`

**Recommended bio:** `A dark-science archive of 1,000 altered witnesses on Base. Open a Subject. Follow the signal.`

Alternatives:

- `1,000 hand-drawn Subjects. One sealed city. Ownership on Base; records inside the archive.`
- `Onchain horror art on Base. 1,000 Subjects from The Half-Life Archive.`

**Avatar:** replace the generic cartoon with `public/x-avatar.png`; its 1024×1024 brand artwork remains legible at small size.

**Banner:** use `public/x-banner.jpg` as the immediate replacement. Later test a less text-heavy crop with one Subject and the tagline.

**Links:** primary `https://decaylabs.online`; keep X as secondary. Do not use generic Farcaster or OpenSea homepages.

**Pinned introduction cast:**

> Everything decays. Proof remains.
>
> Decay Labs is a dark-science archive of 1,000 altered witnesses on Base. Each Subject carries a borrowed memory from the sealed city of Vanta.
>
> Open the archive: https://decaylabs.online/collection?utm_source=farcaster&utm_medium=social&utm_campaign=intro

Add one reply containing the verified contract and direct OpenSea collection link. Profile edits and publishing require user/session control and were not executed.

## E — Farcaster positioning

**One sentence:** Decay Labs is a dark-science onchain archive of 1,000 altered witnesses on Base.

Positioning score (Farcaster fit / clarity / originality / collector appeal / shareability / lore / sales):

| Route | Scores | Decision |
|---|---|---|
| Onchain horror / post-apocalyptic art | 8/8/7/7/8/8/7 | Strong visual genre; too broad alone. |
| Digital archive | 9/6/9/7/7/10/6 | Ownable concept; needs “1,000 altered witnesses” context. |
| 1,000 Subjects | 7/8/6/7/9/8/8 | Excellent content mechanism, not the whole brand. |
| Experimental Base NFT | 7/8/4/5/5/5/5 | Clear but generic and technology-first. |
| Story-driven onchain world | 8/7/7/7/8/10/6 | Good supporting layer; can sound speculative. |
| Proof / decay / archive | 9/7/9/8/8/9/7 | Best conceptual spine. |

Use **Proof/Decay/Archive + Digital Archive** as the core; use **1,000 Subjects** as the discovery mechanic. Art/concept opens the door, lore deepens interest, technology proves trust, collecting closes the loop.

## F — Content system

| Pillar | Audience and purpose | Format / length | Media | CTA | Cadence | KPI |
|---|---|---|---|---|---|---|
| Subject Signal | New viewers; visual discovery | ID + 1–3 lore lines | Exact Subject image | Open record / interpret | 1× weekly | Subject views, quality replies |
| Archive Entry | Repeat viewers; world depth | 3–6 lines | scene/record card | Read | 2× monthly | completion, return visit |
| Visual Autopsy | Art collectors; differentiation | trait/process observation | crop/detail pair | Choose/notice | 2× monthly | saves, replies, next views |
| Build Proof | Builders; credibility | problem → shipped change | UI/code-result visual | Test/explore | 1× weekly | qualified clicks, builder replies |
| Archive Choice | Community entry | meaningful A/B interpretation | two Subjects | Choose and explain | 2× monthly | substantive replies |
| Onchain Record | Collectors; trust | one verifiable technical fact | contract/metadata visual | Verify | 2× monthly | explorer/OpenSea clicks |

Sustainable starting cadence: **three original casts per week plus five to ten genuine replies per week**. The 30-cast bank is inventory, not a mandate to publish daily.

Lore levels: Level 1 explains Subject/Vanta in one line; Level 2 introduces memories, factions and incidents; Level 3 points committed readers to chapter records. Never lead with a wall of lore.

Subject segmentation must come from actual metadata/art review: Hero thumbnails, visually distinct records, high-contrast mobile images, trait exemplars and lore anchors. “Rare” must only be used after verified trait-frequency calculation.

## G — 30-cast content bank

The complete, publish-ready English bank with pillar, goal, media, CTA and destination is in `ops/farcaster/30-cast-bank.md`. It contains 12 no-sell, 14 soft-sell and 4 direct-sell drafts; direct sale language remains a minority.

## H — Reply strategy

Work in four small lists: onchain artists, art curators/collectors, Base/Farcaster builders and experimental storytellers. Start with 20 accounts, not 200. Read first; reply only when Decay Labs can add a visual interpretation, technical observation, useful question or honest build lesson. Never attach the project link unless directly requested or necessary as evidence.

Good reply patterns:

- Art: `The compression at the edge makes the figure feel recovered rather than rendered. Was that damage introduced before or after the color pass?`
- Builder: `We hit a similar identity edge case: the gallery used human #1–1000 while the contract used token IDs 0–999. The fix was small; the trust failure was not.`
- Collector: `The piece I return to is the one whose composition still works at thumbnail size. Traits matter less if the silhouette disappears.`

Relevant current surfaces include art, artwork, gen-art, degen-art, Base and Farcaster developer conversations. Channel choice must match the cast, not be a distribution hack.

## I — Collector discovery

Use public signals ethically: repeated thoughtful art curation, actual collecting discussions, verified onchain ownership when voluntarily linked, and sustained replies to artists. Do not infer wealth, scrape private data or mass-DM wallets. The first 100 valuable followers are people who can recognize, critique, build with or plausibly collect the work—not arbitrary reach.

Follow mix: 30% artists, 25% collectors/curators, 20% Base builders, 15% Farcaster/Mini App builders, 10% potential collaborators. Follow only after reading the account. DM only after reciprocal context.

## J — Mini App audit

Current strengths: signed domain association; SDK readiness handling; exact Subject URLs; Base chain; wallet requested only at collect; guarded quote/listing/transaction flow; no secret exposure; fallback to OpenSea.

Implemented locally:

- Current manifest fields, Base chain declaration, canonical domain and 1024×1024 discovery icon.
- Exact Subject share flow using editable `composeCast`, Web Share and clipboard fallbacks.
- Previous/Random/Next discovery controls.
- Correct zero-based token mapping and token-0 checkout support.
- Manifest requirements added to automated validation.

Highest-ROI remaining work:

1. Deploy and validate the production manifest/embed.
2. Register/refresh in Farcaster developer tooling and earn genuine usage for directory inclusion.
3. Generate Subject-specific preview images.
4. Add optional return state only after repeat usage exists.

Not now: notifications, favorites accounts, points, streaks, leaderboard, chat or custom wallet custody. They add state and spam risk before demand.

Current official discovery favors complete metadata, valid icons, registration and real opens/adds/engagement. Current official Base guidance says the Base App now treats apps as standard web apps; Farcaster SDK behavior must remain optional. The implementation already catches SDK absence and keeps standard wallet/browser fallbacks.

## K — Share loop

`Cast → exact Subject URL → Subject view → Next/Random → editable Share → follower opens exact Subject` is now implemented locally.

Friction still present:

- Generic preview image reduces Subject identity.
- Zero followers means no initial propagation.
- Share completion cannot always be proven outside the SDK.
- A shared Subject may not be listed; collecting must degrade gracefully.

Use three dynamic copy shapes: observation (`Recovered Subject #846...`), interpretation (`I cannot decide whether #846 is guarding the archive or escaping it.`), and choice (`Archive #846 or release it?`). The user must always be able to edit.

## L — Website / Subject funnel

Subject casts should land on `/subject?id={humanSubject}`; lore casts on the relevant lore route; trust/build casts on `/trust`; collection introductions on `/collection`. Homepage is reserved for brand-level introductions.

Subject hierarchy: artwork → Subject ID/micro-lore → Previous/Random/Next → transparent collect state → direct OpenSea item. Wallet is never needed to browse. Mobile code is responsive and controls are concise, but a real-device visual pass remains required.

## M — OpenSea funnel

Current click paths:

- Subject page → exact OpenSea token: one click.
- Subject page → in-app Collect → quote → wallet confirmation: only at explicit purchase intent.
- Generic collection page → OpenSea collection: one click but weaker identity.

The fixed mapping is human Subject #1–1000 → onchain token 0–999. Listing identity, contract, seller, protocol target, chain and price are cross-validated. Stale/missing listing, timeout, rejection, wrong chain, insufficient funds, RPC error and reverted receipt have explicit paths.

The main funnel problem is not another checkout button. It is 800 listings, one holder and no verified sale. Any listing reduction, repricing or OpenSea settings change requires owner approval and wallet action; none was performed.

## N — Analytics

Measurable and allowed: `subject_view`, `subject_next`, `share_clicked`, `share_completed` where SDK confirms it, `share_cancelled`, website click, OpenSea click, checkout start, listing found/missing, wallet attempt/connected, signature/transaction stages, submitted, confirmed and purchase success/failure.

Not directly measurable from the site: cast impression and profile visit. Do not fabricate them. Use platform-provided data manually when available.

Attribution convention: `utm_source=farcaster`, `utm_medium=social`, `utm_campaign={pillar}`, `utm_content={subject}`. Never send wallet addresses to analytics. Store campaign and Subject IDs, not personal identity.

Weekly content score: Reach 10%, Engagement quality 20%, Profile/subject interest 20%, click 20%, collect intent 20%, confirmed sale 10%. With tiny samples, report raw counts and do not declare winners.

## O — 30 / 60 / 90 day experiments

**30 days — hypothesis:** a clear profile plus image-first Subject casts and real replies can generate qualified Subject visits from zero. Test 6 Subject/micro-lore casts versus 6 Subject/question casts. Success: first 25 relevant followers, at least 20 attributed Subject sessions and five substantive replies; no sale requirement.

**60 days — hypothesis:** exact Subject previews and a native share loop increase archive depth. Compare direct Subject landings with homepage landings. Success: higher `subject_next` rate and at least three organic Subject shares. Do not call a winner below meaningful sample size.

**90 days — hypothesis:** build proof plus curated art discovery produces more collector intent than direct sales copy. Compare soft-sell/technical casts with four controlled direct-sell casts. Scale only the format producing qualified OpenSea/collect intent, not likes.

Posting-time test is explicitly a hypothesis: one window around 16:00–20:00 UTC and one morning alternative, then use account data. There is no universal “best hour.”

## P — Stop doing

- Bare website-link casts.
- Repeating “available on OpenSea.”
- Treating the account as an announcement feed.
- Generic Web3 phrases, GM farming, hashtags and giveaway-driven followers.
- Building notifications, points or Discord before users exist.
- Calling trait variants “rare” without computation.
- Presenting 800 listings as scarcity.
- Copying X posts verbatim.
- Measuring success only by followers/reactions.
- Asking for wallet connection before collect intent.

## Q — Start doing

- Make the profile explain the project in five seconds.
- Pin one honest introduction.
- Publish Subjects as individual stories with exact destinations.
- Reply as a builder/artist three times for every promotional cast.
- Show shipped technical proof in human language.
- Curate visually distinct Subject clusters.
- Validate production embeds after every metadata change.
- Review funnel data weekly only while testing; monthly otherwise.
- Acknowledge a collector only after a real verified event and with consent.
- Keep English as the brand language; Turkish can remain in personal founder context.

## R — Top five priorities

| Priority | Impact | Effort | Confidence | Dependency |
|---|---:|---:|---:|---|
| Replace profile identity, add site and pin intro | 10 | 2 | 10 | Farcaster profile UI/user control |
| Deploy corrected Subject mapping/share/manifest | 10 | 4 | 10 | Correct Vercel project and production deployment |
| Begin 3 casts + 5–10 genuine replies weekly | 9 | 5 ongoing | 8 | Human review and participation |
| Produce dynamic Subject-specific OG images | 8 | 5 | 9 | Image/edge generation implementation |
| Review listing presentation and curated supply | 9 | 4 | 7 | Explicit owner approval; wallet/OpenSea action |

## Account scorecard

| Dimension | Score | Evidence |
|---|---:|---|
| Profile clarity | 2/10 | No project bio, site or pinned introduction. |
| Art direction | 4/10 | Strong site artwork; profile avatar/banner do not carry it. |
| Trust | 5/10 | Strong site/contract proof, absent from profile; one-holder supply. |
| Farcaster-native feel | 2/10 | Four announcement/link casts, no native participation. |
| Content quality | 3/10 | One useful technical post; no sustained art/lore system. |
| Community participation | 0/10 | 0 following and no visible reply graph. |
| Discoverability | 1/10 | 0 followers; app absent from directory snapshot. |
| Conversion | 3/10 | Product flow exists; profile and previews fail to feed it. |
| Collector appeal | 3/10 | Strong concept, but repetition, 80% listings and no collector proof. |
| Overall | 2.6/10 | Shipped product with an almost unstarted social surface. |

## Benchmark: 15 current accounts/projects

Follower counts are the observed 2026-08-13 snapshot when available; counts change. Exact count is marked unavailable rather than guessed.

| Account/project | Scale | Useful pattern | Do not copy | Adaptation |
|---|---:|---|---|---|
| `@nexart.eth` | ~212 | Sparse, technical generative-art proof | Depending only on dev detail | Metadata/rendering build logs |
| `@phenomena` | ~466 | Code/art identity and relevant channels | Long inactivity | Image-first process fragments |
| `@minooart` | ~3.7K | Creator presence and regular participation | Generic “fam” cadence | Warm human voice without clichés |
| `@basewtf` | ~7.5K | Multiple shipped Base collectibles | Giveaways/tip mechanics | Clear shipped-product catalogue only |
| `@jordigandul` | ~2K | Short WIP casts and recognizable visual voice | Constant mint framing | Subject crops and process notes |
| `@haniz.eth` | ~3.9K | Excellent pinned introduction and personal art story | Copying a personality format | Founder-backed pinned context |
| `@goldyday.base.eth` | ~2.1K | Deep, concrete art interpretation | Becoming a generic curator account | Thoughtful replies to artists |
| `@giulioaprin` | ~528 | Portfolio clarity and backstory | Recent sales-only repetition | Occasional lore-rich release context |
| `@marydeer` | ~1K | Collaboration and community presence | Unrelated lifestyle imitation | Real artist/writer collaborations |
| `@anemale.eth` | ~7.1K | Human builder + living onchain world + app | Scope/complexity beyond this project | Best founder/project hybrid model |
| `@eriks` / Fotocaster | ~19K | Personal network plus native app/collect flow | Treating a large founder as a comparable baseline | App pinned only when it has utility |
| `@samanthaeharvey` | ~866 | Experimental art, process, poems, replies | Over-explaining every piece | Level-2 lore in small doses |
| `@empresstrash` | unavailable | Repeated visual practice in art channels | Daily cadence without inventory quality | Consistent signature series |
| Blueprint | unavailable | Cohorts, drops and creator framing | Platform-scale launch language | Small curated archive events |
| Highlight | unavailable | Creator tooling and native collecting | Reward/incentive dependence | Friction and creator-proof lessons |

What works across the set: a human identity, image-first work, a pinned orientation, native community replies, visible shipping and a specific creative practice. What should not be copied: incentive farming, giant-brand announcement tone, mint-link repetition and activity for its own sake.

## Trust, security and operational boundaries

- No mint, transfer, listing, price, ownership, contract, DNS, claim or wallet transaction was executed.
- No secret value was printed or stored in content.
- Wallet signatures must state chain, token, price and action; browsing never requires a wallet.
- Existing checkout rejects mismatched contract, token, seller, protocol target and price, refreshes price, and waits for a confirmed successful receipt.
- Giveaway/free mint/discount are not recommended now: they risk low-quality acquisition and do not repair collector trust.
- Discord is not recommended until an actual holder/community need exists.
- SEO stays hygienic; no blog factory.

