# 🧠 AutoP2P — Automated P2P Trading Protocol

## 🚀 Overview

**AutoP2P** is an automated peer-to-peer (P2P) crypto-fiat trading platform that allows users to **earn, trade, and settle payments — even while they sleep**.

Unlike traditional DEXs and CEXs that only match orders and leave users to handle payments manually, AutoP2P introduces **automated payment execution** — a system that monitors market rates, executes trades, and settles payments through smart contracts and backend automation.

Users can list or accept offers, escrow crypto on-chain, and complete fiat settlements off-chain (via bank rails or in-app wallet) — **without needing to be online**.

## ❌ The Problem

Most existing P2P, DEX, and CEX platforms fail to automate the _last mile_ of the trade — **the fiat payment and settlement process**.

As a result, traders often:

- Lose opportunities while offline or asleep.
- Miss trades due to manual confirmations.
- Experience inconsistent rates, long settlement times, and disputes caused by human delay.

Even with automation in order matching, **payment execution and escrow release remain largely manual** — making P2P trading stressful, time-sensitive, and inefficient.

## 💡 The AutoP2P Solution

AutoP2P solves these inefficiencies through **smart contract-driven automation** and **real-time rate synchronization**.

Core innovations include:

- 🤖 **Automated P2P Trades** – Merchants can sync prices with live exchange rates (e.g., Bybit API), allowing AutoP2P to automatically update ads and execute trades when criteria are met.
- 🔒 **On-Chain Escrow System** – Non-custodial escrow using AutoP2P smart contracts ensures transparent and trust-minimized transactions.
- 💸 **Automated Payment Releases** – Once payment is confirmed (via in-app logic or bank API), funds are automatically released — even when users are offline.
- 🧮 **Smart Merchant Tools** – Manage ads, rates, balances, and withdrawals with full control and visibility.
- ⚡ **Sleep-Mode Trading** – Set your trade preferences, go offline, and let AutoP2P handle the rest.

## 🧱 Architecture Overview

AutoP2P integrates three layers:

1. **Frontend (React + Vite dApp)**

   - User dashboard, merchant management, ads discovery, trade tracking.
   - Wallet connection via RainbowKit/Wagmi (Hedera Testnet).

2. **Backend (REST API)**

   - Rate syncing, bank integration, merchant profiles, withdrawal logic, and trade automation engine.
   - API base: `https://airp2p-backend.onrender.com/api`

3. **Smart Contracts (Hedera Testnet)**

   - Core escrow logic: `approve(USDT) → createTrade() → confirmPayment() → releaseFunds()`
   - Deployed test contracts:
     - `AUTOP2P = 0xCB9b33444D8a0c228Cd0878A7C0AeFaF5aC5ac77`
     - `USDT = 0x9700712F87B1BF6F5A731882a221BBA27fE34BE0`

   🔗 Explorer: [https://hashscan.io/testnet](https://hashscan.io/testnet)

## 👥 Target Users

- **Buyers:** Want to buy USDT or crypto with local currency (e.g., NGN) at the best rates, with zero delays.
- **Merchants:** Want to automate trades, manage pricing, and accept payments 24/7 without manual monitoring.
- **Admins:** Maintain platform integrity, resolve disputes, and ensure system uptime.

## 🧩 Key Features

- 🔗 **Non-custodial escrow** using smart contracts.
- 🏦 **Bank & wallet settlement** via secure off-chain integration.
- ⚙️ **Auto-sync merchant ads** with live rates from exchanges.
- 📊 **Merchant dashboards** for analytics, balances, and transactions.
- 🔔 **Smart notifications** for trade status and automatic releases.
- ⚖️ **Dispute resolution** flow for transparency.

## 🔐 Security & Trust

- Fully **non-custodial design** — users maintain control of their crypto.
- Encrypted bank data and private information at rest and in transit.
- Least-privilege API design with no private key exposure on the client.

## 📈 Roadmap

| Milestone | Description                                           | Status         |
| --------- | ----------------------------------------------------- | -------------- |
| **M0**    | Wallet connect, ads browse, trade creation            | ✅ Done        |
| **M1**    | Automated rate sync, withdrawal eligibility + history | 🔄 In progress |
| **M2**    | Dispute system + admin panel                          | ⏳ Planned     |
| **M3**    | Automation upgrade (auto-payment + fiat API)          | ⏳ Planned     |
| **M4**    | Production mainnet deployment                         | ⏳ Pending     |

## 🧮 Metrics & KPIs

- Number of automated trades executed
- Average trade completion time
- 24-hour trade volume
- Escrow TVL
- Merchant conversion rate (ads → trades → completions)

## ⚠️ Risks & Mitigation

- **RPC downtime:** Use fallback RPCs and retry logic.
- **Price volatility:** Dynamic rate refresh every X seconds.
- **Regulatory risks:** Optional KYC integrations and jurisdiction filters.
- **Fraud attempts:** Built-in dispute process and merchant reputation metrics.

## 🌐 Environment

- **Chain:** Hedera Testnet
- **Explorer:** [https://hashscan.io/testnet](https://hashscan.io/testnet)
- **Contracts:**
  - AutoP2P: `0xCB9b33444D8a0c228Cd0878A7C0AeFaF5aC5ac77`
  - USDT: `0x9700712F87B1BF6F5A731882a221BBA27fE34BE0`

## 🧠 Vision

Our vision is to create **the first truly autonomous P2P exchange**, where users can go to bed and wake up to completed, secure, and verified trades — without human intervention.

AutoP2P is **where DeFi meets automation** — making crypto-fiat trading truly effortless.

© 2025 AutoP2P — _Built for the future of automated P2P trading._
