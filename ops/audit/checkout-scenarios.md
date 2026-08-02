# Checkout scenario audit

Automated evidence: `node --test` (6/6 passed), `tests/buy-api.test.mjs`, `tests/subject-model.test.mjs`. No wallet signature or real funds were used.

| Scenario | Expected | Result / user message | Evidence | Status |
|---|---|---|---|---|
| Wallet disconnected | Offer marketplace fallback | Client detects missing provider and offers OpenSea link | `miniapp-buy.js` | Verified locally |
| Invalid address | Reject before API call | API returns `400 invalid_address` | `api/buy.js` | Verified in source |
| Wrong network | Request Base switch; stop if rejected | Friendly Base-network message | `checkout-rules.mjs` | Verified by pure rule |
| Insufficient balance | Do not submit | Friendly balance message | `checkout-rules.mjs` | Classifier prepared |
| User rejects | No submission | Cancellation message | client handler | Classifier prepared |
| RPC failure | Preserve funds; retry | RPC unavailable message | client handler | Classifier prepared |
| API failure | Marketplace fallback | Temporary listing message | API error path | Verified in source |
| Invalid token ID | Reject input | `400 invalid_token_id` | `api/buy.js` | Verified in source |
| NFT missing | No transaction | Not-found message | selection logic | Verified by tests |
| NFT sold | Refresh listing | Manual marketplace state required | external account | Manual required |
| Price changed | Stop and re-check | Price-change message | rules module | Prepared |
| Wrong contract | Stop | Contract safety message | rules module | Prepared |
| Wrong transaction target | Stop | Target safety message | rules module | Prepared |
| Successful purchase | Wallet confirmation then Base tx | Not executed; requires signature and funds | user wallet | Manual required |
