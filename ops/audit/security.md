# Security audit

Severity is based on this static pass and local tests, not a professional penetration test.

- **Critical:** none proven. No wallet signature, real purchase, Base URI mutation or listing cancellation was executed.
- **High:** none proven. Contract, chain, transaction target and price checks exist in checkout validation.
- **Medium:** public checkout API has no application-level rate limiter; add Vercel/edge rate limiting before growth.
- **Medium:** browser imports a pinned remote `viem` ESM bundle; self-host or integrity-check for stronger supply-chain control.
- **Low:** raw provider errors are written to developer console only; redact them in production telemetry.
- **Info:** no seed/private key files were found in tracked source; `.env` remains ignored. Seaport replay/order validity remains marketplace responsibility and no order was signed here.
