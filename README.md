# Decay Labs — Archive

The site behind [decaylabs.online](https://decaylabs.online): a 1000-piece NFT collection on
Base, and a verified Base App mini app you can buy from without leaving the client.

## What's here

| Path | Purpose |
| --- | --- |
| `index.html`, `styles.css`, `script.js` | The static site (vanilla + GSAP, no build step) |
| `api/buy.js` | Serverless endpoint: cheapest listing → Seaport fulfillment data |
| `miniapp-buy.js` | Wallet connect, Base network switch, calldata encode, tx send |
| `.well-known/farcaster.json` | Signed Farcaster/Base App mini app manifest |

## In-app buying

`api/buy.js` asks OpenSea for the cheapest active listing and the matching Seaport
fulfillment payload, keeping the API key server-side. The browser encodes
`fulfillBasicOrder_efficient_6GL6yc` with viem and sends it through the wallet the
mini app already provides — buyers never get redirected to a marketplace.

Two things keep that button alive without babysitting:

- OpenSea agent keys expire after 30 days, so the endpoint mints a fresh keyless one
  and retries when the current key stops authenticating.
- If the marketplace API is unreachable for any reason, the front-end falls back to
  the OpenSea collection page rather than dead-ending the buyer.

## Deploying

Pushes to `main` deploy automatically via Vercel. `OPENSEA_API_KEY` is set as a Vercel
environment variable; nothing secret lives in this repo.

## Links

- Site: <https://decaylabs.online>
- Collection: <https://opensea.io/collection/decaylabs-395322216>
