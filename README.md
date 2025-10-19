# AutoP2P Hub — Product Requirements Document (PRD)

## 1) Summary
AutoP2P Hub is a peer‑to‑peer (P2P) crypto–fiat marketplace that connects buyers and merchants. Users discover ads, initiate trades, escrow funds on-chain, complete payment off-chain (bank rails or in-app wallet), and release funds trust-minimized via a smart contract. The frontend is a React (Vite) dApp integrated with a backend REST API and AutoP2P smart contracts deployed on Lisk Sepolia.

## 2) Background & Problem Statement
- On/Off-ramp access in many markets is fragmented, with inconsistent rates, long settlement times, and limited transparency.
- Traditional P2P platforms are centralized, with opaque custody and dispute processes.
- Goal: provide a transparent, non-custodial, on-chain escrow experience with merchant discovery, fair pricing, and simple fiat payout.

## 3) Goals and Non‑Goals
- Goals
  - Enable users to discover competitive BUY/SELL ads for USDT and initiate trades quickly.
  - Non-custodial on-chain escrow using AutoP2P smart contract; minimize trust in intermediaries.
  - Provide merchant tooling: ads lifecycle, pricing controls, balances, withdrawal.
  - Integrate fiat payout options (bank transfer) with clear eligibility and limits.
  - Offer basic dispute and admin controls for edge cases.
- Non‑Goals (MVP)
  - Full KYC/AML program and compliance tooling (placeholder to integrate later).
  - Multi-chain production deployment beyond Lisk Sepolia test network.
  - Advanced order matching engine or derivatives.

## 4) Users & Personas
- Buyer: Wants to buy USDT with local currency (e.g., NGN) at a fair rate, fast settlement.
- Merchant (Seller): Lists ads, manages pricing and inventory, fulfills orders, withdraws fiat.
- Admin/Support: Monitors health and disputes, manages platform fees and emergency controls.

## 5) User Stories
- As a buyer, I can browse/search ads by token, type (BUY/SELL), rate range, currency, payment method so I can find the best offer.
- As a buyer, I can connect a wallet and start a trade by approving USDT and calling the escrow contract.
- As a buyer, I can submit bank details for payout and confirm payment so funds can be released.
- As a buyer, I can raise a dispute with a reason if there’s an issue.
- As a merchant, I can create, update, toggle, and delete ads; view stats and transactions.
- As a merchant, I can withdraw balance to my bank when eligible and view withdrawal history.
- As an admin, I can resolve disputes, adjust platform fees, and perform emergency withdraws if needed.

## 6) Functional Requirements
A. Wallet & On‑Chain Escrow
- Support wallet connection via RainbowKit/Wagmi; chain: Lisk Sepolia (id 4202).
- Contracts (test): `AUTOP2P=0x5c7707D0b70bc56a210464812B0141953e8c95aa`, `USDT=0xD35d4d76841d6223F7244D6D723E102E38b005b0`.
- Approvals: buyer must approve USDT spend to AutoP2P before creating a trade.
- Trade creation: provide `merchantId`, `merchantAddress`, `adId`, bank details, and `amount` (USDT) to `createTrade`.
- Release: merchant or contract logic releases funds to buyer upon payment confirmation; support auto-release for in-app wallet payout when `accountName=accountNumber=WALLET`.
- Disputes: support `raiseDispute` and `resolveDispute(buyerWins, resolution)`; respect timeout (`DISPUTE_TIMEOUT`).

B. Ads Marketplace
- Browse ads with filters: token (USDT), type (BUY/SELL), rate range, local currency, payment methods, activity status.
- Search endpoint to support text queries and field filters.
- Pagination and sorting for discovery at scale; summary stats endpoint.

C. Trade Lifecycle
- States (derived from contract): Created → Payment Confirmed → Completed/Cancelled → (optional) Disputed/Resolved.
- On start, escrow happens on-chain; off-chain payment happens via bank.
- Buyer or merchant can confirm payment and proceed to release.
- Show trade timelines and status in UI; surface errors from web3 transactions and backend.

D. Merchant Management
- Create merchant profile from wallet address; update profile (name, email, currency, payment methods, limits, ad rate).
- Fetch merchant stats and transactions with filtering; show balances.
- Manage ads: create/update/toggle/delete; optimistic updates where possible.

E. Payments & Withdrawals
- Fetch supported banks list and metadata.
- Withdrawal eligibility check (amount thresholds, balance checks).
- Initiate withdrawals with bank fields and optional narration; show history and statuses.

F. System Health
- Public health endpoint for monitoring and readiness.

## 7) Integrations & Interfaces
Backend REST API (base: `https://airp2p-backend.onrender.com/api`)
- System: `GET /health`, `GET /`.
- Merchants: `GET /merchants`, `POST /merchants`, `GET /merchants/{wallet}`, `GET /merchants/{id}/stats`, `GET /merchants/{id}/transactions`.
- Merchant profile updates: `PUT /merchants/{id}/profile`, `PUT /merchants/wallet/{wallet}/profile`.
- Withdrawals: `POST /merchants/{id}/withdrawal`, `GET /merchants/{id}/withdrawal/eligibility`, `GET /merchants/{id}/withdrawal/history`.
- Ads: `GET /ads`, `GET /ads/search`, `GET /ads/summary`, `GET /ads/{id}`.
- Merchant Ads: `GET /merchants/{id}/ads`, `POST /merchants/{id}/ads`, `PUT /merchants/{id}/ads/{adId}`, `PATCH /merchants/{id}/ads/{adId}/toggle`, `DELETE /merchants/{id}/ads/{adId}`.

Smart Contracts (Lisk Sepolia)
- Core flows: `approve(USDT) → createTrade(...) → paymentConfirmed → releaseFunds(tradeId)`.
- Disputes: `raiseDispute(tradeId, reason)`, `resolveDispute(tradeId, buyerWins, resolution)`.
- Admin: `addAdmin`, `removeAdmin`, `withdrawPlatformFees(amount)`, `emergencyWithdraw`.

Frontend Tech
- React + Vite + TypeScript, Tailwind, Radix UI.
- Wagmi + RainbowKit for wallet/connect; React Query for data fetching/caching.

## 8) Data Model (canonical)
- Merchant
  - id, walletAddress, name, email, adRate, balance, currency, isActive, minOrder, maxOrder, paymentMethods[], createdAt, updatedAt
- Advertisement
  - id, merchantId, title, token (USDT), type (BUY/SELL), exchangeRate, localCurrency, minAmount, maxAmount, availableAmount, paymentMethods[], tradingTerms, autoReply, isActive, geolocation, tags[], expiresAt, timestamps
- Trade (on-chain primary)
  - tradeId, buyer, merchantId, merchantAddress, accountName, accountNumber, bankCode, amount, depositTime, paymentTime, status, disputed, disputeInitiator
- Transaction (off-chain record)
  - id, merchantId, userAddress, amount, status, txHash

## 9) UX Requirements & Flows
- Connect Wallet: prominent CTA; guide if wrong network; show chain and address.
- Browse Ads: filters, sorting, pagination; clear rate display (NGN/USDT) and limits.
- Start Trade: modal to collect bank details; approval + trade tx progress with toasts; show EVM confirmations.
- Trade Detail: status timeline, bank instructions, copyable fields, dispute action, release state.
- Merchant Dashboard: profile form, balances, stats, ads CRUD, transactions list, withdrawal flow with eligibility validation.
- Errors/Toasts: actionable messages for API and web3 failures; retries for transient errors.
- Accessibility: keyboard nav, focus states, color contrast.

## 10) Non‑Functional Requirements
- Performance: initial load < 3s on 3G; subsequent views cached; API p95 < 500ms.
- Availability: backend/API target 99.9% monthly; graceful degradation if chain RPC unstable.
- Security: non-custodial design; least-privilege API keys; protect PII (bank data) at rest/in transit; avoid storing secret keys in client.
- Privacy: comply with local data retention rules; allow data removal requests (merchant contact).
- Observability: client events + API health; error tracking for web3 and HTTP.

## 11) Metrics & KPIs
- Core: number of trades, completion rate, average completion time, TVL escrowed, dispute rate, dispute resolution time.
- Growth: new merchants, active ads, buyer conversion from view→initiate→complete.
- Reliability: API uptime, RPC error rates, client error rates.

## 12) Risks & Mitigations
- RPC instability on testnet → fallback RPCs, retry/backoff, user messaging.
- Price volatility → frequent refresh of rates and clear slippage guidance in UI.
- Fraud/chargebacks → dispute mechanism, merchant limits, reputation (future), manual reviews.
- Regulatory uncertainty → abstract KYC/AML as optional integration points; geofencing if required.

## 13) Release Plan & Milestones
- M0: Wallet connect, ads browse, trade creation with approval, basic merchant CRUD for ads.
- M1: Withdrawals (eligibility + history), merchant stats/transactions, banks directory.
- M2: Disputes (raise/resolve), admin ops, platform fee withdrawal.
- M3: Hardening (metrics, error handling, UX polish), compliance hooks, production infra.

## 14) Out of Scope (initially)
- Cross‑chain swaps; derivatives; automated market making.
- Full identity verification workflow and sanctions screening.
- Mobile apps (web responsive only).

## 15) Assumptions
- Users can access Lisk Sepolia and hold testnet USDT or funds as needed.
- Fiat rails are available via partner APIs or manual settlement; bank list is up to date.
- Merchants maintain liquidity and honor posted rates/limits.

## 16) Open Questions
- Fee model: fixed vs. percentage; who pays gas vs. platform fees; display in UI?
- Reputation: ratings, completed trade counts, and slashing flows?
- KYC/Compliance: which jurisdictions and thresholds; data storage policies?
- Production chain(s): which mainnets; final contract addresses and audits timeline?

## 17) Configuration & Environment
- Chain: Lisk Sepolia (id 4202), explorer: https://sepolia-blockscout.lisk.com
- RPC: https://rpc.sepolia-api.lisk.com (with fallbacks as needed)
- Contracts: `AUTOP2P=0x5c7707D0b70bc56a210464812B0141953e8c95aa`, `USDT=0xD35d4d76841d6223F7244D6D723E102E38b005b0`
- WalletConnect (RainbowKit): set `projectId` via environment variable and do not hardcode secrets in client builds.
- API base: `https://airp2p-backend.onrender.com/api`

---
This PRD reflects the current implementation surfaces (frontend, backend API, and smart contracts) and is intended to evolve with feedback and production requirements.
