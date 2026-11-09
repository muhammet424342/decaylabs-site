# Decay Labs

The production source for [decaylabs.online](https://decaylabs.online): a hand-illustrated collection of Subjects created on Base, the 100-chapter Half-Life Archive, and an in-app Seaport checkout.

## Product surfaces

| Path | Purpose |
| --- | --- |
| `/` | Brand, narrative, curated Subjects and build proof |
| `/lore` | Ten story arcs and one hundred chapter hooks |
| `/collection` | Curated archive plus Subject lookup by number |
| `/subject?id=404` | Deterministic narrative record for any token |
| `/trust` | Contract, inventory, storage and safety disclosure |
| `/faq` | Plain-language product answers |
| `/links` | Canonical official destinations |
| `/api/buy.js` | Listing selection and Seaport fulfillment proxy |
| `/api/collection-stats.js` | Current stats without invented fallback values |

## Truth standard

- The archive tokens were initially created into founder-controlled inventory.
- There is no active mint, whitelist or surprise airdrop.
- Ownership lives on Base; media and metadata are referenced through IPFS.
- Factions and memory fragments are narrative classifications, not rarity or price claims.
- Games, staking, tokens and financial returns are not represented as delivered or promised.

## Local development

```powershell
python -m http.server 4173
```

Open <http://127.0.0.1:4173>. Static pages work locally; Vercel serverless routes require a Vercel development environment or test mocks.

## Deployment

Pushes to the configured production branch deploy through Vercel. Required environment variables:

- `OPENSEA_API_KEY`: server-side marketplace API key.
- `CURATED_TOKEN_IDS`: optional comma-separated set used by the generic in-app purchase button. Defaults to `1..24`.

No secrets belong in this repository.

## Archive Board (`/board`)

Holders place a Subject into its faction's zone by signing a message (`personal_sign`). No gas, no payment, no prizes; the only reward is a level (days held) and the leaderboard.

- Logic: `board-rules.mjs` (signature check, on-chain `ownerOf` via Base RPC, faction zones, levels). Tests: `tests/board.test.mjs`.
- API: `functions/api/board.js` (`GET` / `POST /api/board`).
- Storage: bind a Workers KV namespace as `BOARD` in the Pages project (Settings → Functions → KV bindings). Without it the board runs in preview mode and placements are not persistent.
