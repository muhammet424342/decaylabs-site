# DecayLabs external actions register

Canonical order and field-complete audit: see [`external-actions-v2.md`](external-actions-v2.md). It records Platform, Action, File, Menu, Account, Wallet, Risk, Control and evidence status.

Local code, copy, assets, metadata and operating documents are implemented in this repository. The actions below cannot be completed safely without an authenticated third-party session, a wallet signature, an API credential or a human presence during account-risk prompts.

## X

- Upload `public/x-avatar.png` and `public/x-banner.jpg`.
- Set display name, bio, location and website from `ops/x/profile-and-pinned.md`.
- Publish and pin the five-post introduction thread.
- Schedule the 30-day calendar where X scheduling is available.
- Username change should be attempted only after availability and impersonation checks; a verified display-name change may temporarily affect the checkmark.

## OpenSea

- Upload profile assets and description from `ops/marketplace/opensea-profile.md`.
- Add official site and X links.
- Replace collection metadata URI only if the contract supports it and after reviewing the generated `metadata-v2` files.
- Cancel surplus founder listings and keep no more than 24 curated active listings. Cancelling signed orders may require wallet confirmation and, depending on method, network fees.
- Do not sign any transaction until the domain, chain, contract and method are visible and verified.

## IPFS / metadata

- Upload the complete `metadata-v2` directory to a pinned IPFS provider.
- Verify random token IDs at two public gateways.
- Update the onchain/base URI only if the deployed contract exposes an authorized setter. This requires the owner wallet and a Base transaction.

## Discord

- Create/configure the server using `ops/community/discord-setup.md`.
- Add two human moderators before making the invite public.
- Review and authorize any wallet-verification bot manually.

## Deployment

- Production deployment requires the linked Vercel account/session.
- Environment variable `OPENSEA_API_KEY` is required for checkout and live collection statistics.
- Optional `CURATED_TOKEN_IDS` controls which live listings the checkout endpoint may surface.

## Ongoing human work

- Replies must remain human-written and context-specific; they should not be bulk automated.
- X Spaces, partner outreach, collector interviews and moderation require a human voice and judgment.
- Never delegate wallet signing, seed phrases, 2FA codes or recovery codes to an agent.
