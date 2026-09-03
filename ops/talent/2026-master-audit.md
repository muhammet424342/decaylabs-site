# Decay Labs — Talent.app Builder Reputation Audit

Audit date: 2026-08-13 (Europe/Istanbul)

Verified surfaces: logged-in Talent app, public profile, profile/account settings, project settings/impact, Earn and data-point directories, public GitHub API, repository and live product. No wallet signature, transaction, contract claim, reward claim or financial action was performed.

## A — Talent 2026 current state

Talent is now a reputation aggregation and builder/project discovery product. Its current core is **Profile + connected Accounts + 150+ objective Data Points + Projects + Builder Rank + time-bounded ecosystem rewards**. The old Builder Score is preserved as “Builder Score 2025”; Creator Score became a historical credential after the January 2026 transition. Current first-party docs call Builder Rank the primary system.

Active product surfaces verified: personal builder profiles, X/GitHub/wallet aggregation, human verification options, project pages, up to five public repos and five smart contracts per project, project impact graphs, search, project discovery, 226 issuers/credentials in the live directory, Earn campaigns, Talent+ gating and API-backed advanced search. A distinct “creator profile” was not visible; creator activity exists as data points, not a separate profile type.

Talent is useful as an evidence index, not as the primary personal-brand home. GitHub remains proof of work, Farcaster public builder identity, Base/onchain data execution proof, Decay Labs the shipped product, and Talent the aggregator.

## B — My current profile

Profile: `https://talent.app/muhammet424342`

Before: brand-like display name `DecayLabs`; art-only bio with a shortened X URL; `Remote / Turkey`; no Main Role; X and GitHub verified; one verified EVM wallet; no Farcaster account; one incomplete project; 35 GitHub contributions shown; rank `>99`; $0 Talent rewards.

After applied changes:

- Display name: `Muhammet | Decay Labs`
- Main role: `Engineering`
- Location: `Konya, Turkey`
- Bio: `Indie onchain builder behind Decay Labs: 1,000 illustrated Subjects on Base, with IPFS metadata, Farcaster discovery and an OpenSea collect flow.`
- Project renamed `Decay Labs`, description added, category changed from incorrect `Commerce & Marketplaces` to `Consumer Apps`.
- Website ownership meta published at `decaylabs.online`.
- Project website verification remains blocked because Talent reports the domain is already taken by another record.

## C — Profile scorecard

| Dimension | Before | After/current | Why |
|---|---:|---:|---|
| Profile completeness | 4/10 | 7/10 | Role, personal identity, location and builder bio fixed; Farcaster/human verification missing. |
| Builder credibility | 5/10 | 7/10 | Live project and public code exist; low external adoption. |
| Onchain proof | 5/10 | 5/10 | Wallet/Base collection are real; project contract not yet tracked/ownership-attributed. |
| Project proof | 4/10 | 7/10 | Two repos and live impact visible; description/category fixed; website blocked. |
| Social proof | 2/10 | 2/10 | X connected, but little audience/collector proof. |
| GitHub proof | 6/10 | 7/10 | Three meaningful public Web3 repos; Talent project mapping needs cleanup. |
| Farcaster proof | 0/10 | 1/10 | Account exists but is not connected to Talent and has 0 followers. |
| Base ecosystem fit | 7/10 | 7/10 | Base NFT, contract, checkout and app are genuine. |
| Discoverability | 2/10 | 5/10 | Role/location/bio/category improved; rank and impact remain weak. |
| Trust | 5/10 | 7/10 | Person/project separation and transparent product proof improved. |
| Overall | 4.0/10 | 5.8/10 | Foundation is credible; aggregated proofs remain incomplete. |

**Strong:** verified X, GitHub, primary EVM wallet, live product, public repos, current commits, Base deployment.

**Weak:** low GitHub stars/forks/followers, 35 contributions in Talent, no rewards, one-holder NFT collection, project website duplicate, project repo mapping.

**Missing:** Farcaster connection, human checkmark, verified project website, tracked NFT contract, relevant Basename if already owned, clear project image, exact public identity ownership proof.

## D — Missing connections

1. **Farcaster `@decaylabs`** — highest relevant missing account. Connecting requires OAuth/signature-like user approval; not performed.
2. **Project website** — meta is live, but Talent says `Website url has already been taken`; use support to merge/release the duplicate rather than create another project.
3. **Decay Labs ERC-721 contract** — project UI supports smart contracts separately from the optional fungible “token contract” field. Add only after Talent verifies deployer/ownership attribution; this may require signature.
4. **LinkedIn** — optional. Connect only if it contains genuine work history; it is not necessary for an onchain pseudonymous profile.
5. **Human verification** — Self.xyz, World ID or Coinbase shown. Choose one only if privacy/permission tradeoff is acceptable; no need to do all three.
6. **Additional wallets** — do not connect wallets merely for balance/activity. Add only a wallet containing real builder/deployer proof owned by the same person. Talent supports up to ten and says addresses are public by default.

## E — Missing credentials

### Already verified

- X account `decaylabss`
- GitHub account `muhammet424342`
- Primary EVM wallet `0x9072…22eb06`
- GitHub account age/repositories/contributions can be automatically indexed
- Base first transaction/outgoing activity can be automatically indexed from the wallet

### Available now

- Main role/profile completeness — completed
- Project description/category — completed
- Farcaster Account ID/account age — connect `@decaylabs`
- Project website — technically ready, platform duplicate blocks completion
- Project smart contract — add real Base ERC-721 through the smart-contract data-source UI after ownership validation
- Human Checkmark — one privacy-acceptable provider, optional

### Can earn naturally

- GitHub 7D/30D/contributions/repositories/stars/forks through useful public shipping
- Farcaster followers through real participation
- Active Smart Contract only after 10+ unique transacting wallets; cannot be claimed through self-transactions
- Weekly/monthly Base contract transactions/fees through genuine users
- Total collectors/creator earnings only through real collecting
- Builder Rank through actual impact and earnings, not form completion

### Not relevant

- Celo, Stacks, WalletConnect, Zora, ENS, hackathon and attendance credentials without real usage/history
- $TALENT balance/vault solely as a score booster
- LinkedIn if the profile does not add verifiable work history
- Base Learn merely for points; complete only for actual learning value

### Not possible yet

- Farcaster Developer Rewards: requires earning in the top-25 Mini App rewards system; Decay Labs has no directory usage.
- Farcaster Creator Rewards: no verified earnings/current active program.
- Active Smart Contract: no evidence of 10+ unique transacting wallets.
- Collector/earnings impact: no verified sales/collectors.

Highest-value order: project website + contract proof, Farcaster Account ID, meaningful public GitHub shipping, genuine Base contract users, one human verification if comfortable. Ignore credential-count farming.

## F — Decay Labs project audit

Current Talent project ID: `c675408f-d727-48ff-9008-77465498d951`.

Before: `DecayLabs`, blank description, incorrect Commerce & Marketplaces category, no website, default initials icon, two repositories, no contracts, one contributor. Project impact showed 8 active days and 18 commits in the last 30 days; PRs were 0.

After: `Decay Labs`, builder/product description, Consumer Apps category. The project correctly remains a one-person project. No fake contributor added despite Talent recommending one. Website verification is blocked by a duplicate-domain record. The current two repositories are `decaylabs-site` and `basepaint-archive`; the latter should remain only if it is genuinely a Decay Labs data source. The reusable `base-miniapp-buy-starter` is stronger checkout proof and should replace the unrelated repo if the project mapping is wrong.

Contract `0x65F5e8006F4eF730d6984836F606a5C5c516CdC8` is the collection contract on Base. Do not put it into the optional “token contract” field, which is phrased for a project token. Use the dedicated Smart contracts data source after ownership/deployer verification.

## G — Project positioning

**Position:** NFT/digital art builder + working Base consumer product.

**One sentence:** `A dark-science onchain archive of 1,000 illustrated Subjects on Base.`

**Short:** `A 1,000-piece onchain art archive on Base with individual Subject records, IPFS metadata, Farcaster discovery and a transparent collect flow.`

**Medium:** `Decay Labs combines a hand-illustrated NFT collection with a working onchain product: 1,000 Subject records on Base, IPFS metadata, a 100-chapter lore archive, Farcaster-native discovery and a guarded OpenSea/Seaport collect flow.`

**Technical:** `A static JavaScript/Vercel application indexing a Base ERC-721 collection, deterministic Subject records, IPFS metadata, a signed Farcaster manifest, privacy-limited funnel analytics and server-side OpenSea listing/Seaport fulfillment validation.`

**Consumer-facing:** `Open a record from Vanta, follow its borrowed memory and verify the Subject on Base before you collect.`

Category: Consumer Apps is the least-wrong current primary category; Talent exposes no Art/NFT/Onchain category or secondary category. Ecosystem claims: Base and Farcaster are real; OpenSea is an integration/marketplace, not an ecosystem claim; Ethereum/Zora/Talent should not be claimed without use.

## H — GitHub audit

Public account snapshot: five repositories. Relevant proof:

- `decaylabs-site`: main shipped product; JavaScript; live URL; no stars/forks; README improved with stack, onchain, Mini App, analytics and transaction-safety proof.
- `base-miniapp-buy-starter`: strongest reusable engineering artifact; JavaScript; MIT; 1 star; Base/Farcaster/OpenSea/Seaport topics; public live-derived checkout logic.
- `basepaint-archive`: secondary experiment; JavaScript; MIT; live Vercel URL; no description/topics/stars. Show separately unless it is genuinely part of Decay Labs.
- `scraper-portfolio`: valid Python proof but off-position for the main onchain identity; secondary profile evidence, not a Decay Labs project source.
- profile config repo: not a project.

Talent showed 35 all-time GitHub contributions and the project showed 18 commits/8 active days in 30D. Private contribution handling was not documented clearly enough to assert it is scored; do not expose private code for rank. Improve real public repos, not empty commits.

Recommended project data sources: `decaylabs-site` + `base-miniapp-buy-starter`; add `basepaint-archive` only to its own project if it is actively maintained. README now covers What/Live/Chain/Features/Technical proof/Security/Status. Remaining GitHub easy wins: add a concise repo description/topics/license to `decaylabs-site` through GitHub when authorized; no fake stars or commits.

## I — Farcaster audit

Talent currently exposes six Farcaster data points: Account ID, account age, followers, Developer Rewards, Creator Rewards and Farcon NYC 2025 attendance. The Decay Labs account can immediately supply Account ID and age after connection; followers are currently 0; event attendance is irrelevant unless the ticket exists; reward credentials are historical/earned signals outside direct control.

Farcaster growth supports Talent only indirectly: real followers, public build logs and any genuine Mini App impact become data. Do not post for score. Developer Rewards top-25 eligibility is unrealistic now; solve directory registration, usage and product retention first.

## J — Base / onchain audit

Real signals: verified primary EVM wallet; Base ERC-721 collection; 1,000 minted Subjects; Base checkout; contract interaction; public ownership. Talent supports first transaction, outgoing transactions, deployed/verified contracts, weekly/monthly/all-time transactions/fees, Basename, builder earnings and active contracts (10+ unique transacting wallets).

The key missing link is project-contract attribution. A contract existing is not enough; it must be associated with the correct builder/project. If the deployer is another wallet, connect it only if personally controlled and privacy is acceptable. No random transactions or redeployments are justified.

Zero sales do not erase the shipped-product proof, but they cap impact/collector credentials. Builder reputation can still come from public code, verified deployment, product quality and project activity.

## K — Active campaigns

**None verified active and suitable on 2026-08-13.** The Talent homepage said “No active campaigns right now.” Earn displayed Celo Proof of Ship as Live with `Jul 1–27`, a past date, so it is treated as stale/expired. Stacks June, Agents Day, WalletConnect and Base January were explicitly ended. Decay Labs is Base-native; changing chain for Celo rewards would be poor fit regardless.

## L — Reward opportunities

| Opportunity | Status | Eligibility / fit | Effort | Potential benefit | Decision |
|---|---|---|---:|---|---|
| Celo Proof of Ship | Stale/expired UI | Wrong chain and July 27 passed | High | $5K pool/50 winners shown | Do not enter |
| Top Base Builders January | Ended Jan 31 | Base/public repos/contracts/Farcaster rewards | N/A | Historical | No action |
| WalletConnect | Ended Jan 31 | Actual integration required | N/A | Historical | No action |
| Stacks June | Ended Jun 30 | Wrong chain | N/A | Historical | No action |
| Future Base round | Not active | Genuine public commits + verified Base contract impact | Medium ongoing | Reputation/reward uncertain | Monitor monthly |
| Farcaster Developer Rewards | Credential, not current promise | Top-25 earnings | Very high | Impact credential | Not a current target |

Do not buy/stake $TALENT, add WalletConnect, deploy to another chain or create transactions merely for rewards. Claims/financial actions always require explicit approval.

## M — Benchmark

The free Talent view exposes ten top profiles; full result browsing/export is gated by Talent+. This prevents a verified 15-like-for-like filtered benchmark. Ten observed profiles: debielily, masaun, agedevs, jadonamite, geeloko, Mark Carey, Emiridbest, briandoyle81, gabedev and oxdev.eth. They consistently have a main role (mostly Engineering), thousands of GitHub contributions and material Talent rewards; several have country and Basename/Farcaster identity.

Project discovery exposed 192 projects with website, concise description, category, contributor and recency/impact sorting. Compared with Decay Labs, the controllable gaps are role/profile completeness (fixed), website verification, correct repo mapping, smart-contract attribution, consistent human identity and real ongoing GitHub/onchain usage. Their long history/network/reward participation cannot be copied quickly and should not be imitated with noise.

Five additional art/onchain builder profiles could not be reliably filtered in the free interface: **BLOCKED by Talent+ result gating**. No names or metrics are invented.

## N — Easy wins

1. Personal builder display name, Engineering role, direct bio and location — done.
2. Project name, honest description and category — done.
3. Publish project verification meta — done; platform duplicate blocks claim.
4. Replace irrelevant project repo with checkout starter — user-controlled Talent edit after confirming relationship.
5. Connect Farcaster — requires explicit account authorization.
6. Add Base ERC-721 via Smart contracts, not token field — may require ownership verification.
7. Refresh connected data after meaningful new shipping, not daily.

## O — Long-term signals

Ship useful public changes, earn users on the existing Base contract, maintain the reusable checkout starter, grow a real Farcaster graph, and document releases. Recency matters for 7D/30D GitHub and weekly/monthly contract metrics; account age and first transaction are immutable. Talent selects the highest value when multiple sources feed a data point, but connecting unrelated wallets is still a privacy/reputation risk.

30 days: foundation hypothesis—correct identity/project proof increases completeness and search clarity. 60 days: shipping hypothesis—two meaningful releases increase 30D GitHub/project activity and qualified collaboration. 90 days: impact hypothesis—real Mini App/Subject usage and contract users create stronger data than more credentials. Review after a ship and monthly; daily checking is waste.

## P — Stop doing

- Treating Talent rank as the product goal.
- Empty commits, README churn, fake projects, random Base transactions or self-interactions.
- Claiming irrelevant ecosystems/campaigns.
- Adding fake contributors to satisfy a recommendation card.
- Connecting every wallet or identity provider.
- Buying/staking tokens solely for a rank booster.
- Exposing private repositories for reputation.
- Calling an expired campaign active because of a stale badge.
- Mixing the person and project into one anonymous brand profile.

## Q — Top five actions

| Action | Impact | Effort | Control | Reason |
|---|---:|---:|---:|---|
| Resolve duplicate website through Talent support | 10 | 2 | 6 | Unlocks verified product identity and tracking. |
| Connect Farcaster `@decaylabs` | 8 | 2 | 9 | Adds account ID/age and future activity proof. |
| Attribute the real Base ERC-721 contract | 10 | 3 | 6 | Converts collection existence into project impact proof. |
| Correct repository mapping | 8 | 2 | 10 | Shows the checkout starter instead of unrelated activity. |
| Ship useful public product releases | 10 | ongoing | 10 | Compounds GitHub, project and real-user evidence. |

## R — Final recommendation

Spend **one focused setup session now, then 20–30 minutes monthly or after each real release**. Talent should aggregate existing work, not dictate development. Allocate most ongoing time to Decay Labs product quality, GitHub shipping and Farcaster relationships; those create the evidence Talent can index.

Recommended public identity architecture: **PERSON = Muhammet, indie onchain engineer; PROJECT = Decay Labs, art + product.** A real face can increase trust, but the current GitHub avatar is acceptable if privacy matters and identity/links remain consistent. Konya, Turkey is a mild discovery/trust benefit and no meaningful global disadvantage.

Talent profile links belong in the GitHub profile and optionally Farcaster builder bio. On the collector website, Talent is secondary trust proof and should not compete with art, contract or OpenSea. Add it only after the website/project is verified.

## Before / after KPI snapshot

| KPI | Before | After |
|---|---|---|
| Main role | Missing | Engineering |
| Personal/project separation | Brand-only | Muhammet + Decay Labs |
| Profile bio | Art-only + short URL | Builder-first proof |
| Location | Remote / Turkey | Konya, Turkey |
| Project description | Missing | Complete |
| Project category | Commerce & Marketplaces | Consumer Apps |
| Website verification | Missing | Meta live; duplicate-domain blocked |
| Project repos | 2 | 2; mapping issue documented |
| Smart contracts tracked | 0 | 0; approval/attribution pending |
| Farcaster connected | No | No; authorization pending |
| GitHub contributions | 35 | 35 snapshot |
| Talent rewards | $0 | $0 |

