# TetherStream — USDT Micropayment Streaming

[![Live Demo](https://img.shields.io/badge/Live-Demo-green)](https://paystream-beryl.vercel.app)
[![Tether](https://img.shields.io/badge/Tether-USDT-26A17B)]()
[![Network](https://img.shields.io/badge/Network-Base_Sepolia-0052FF)]()

## Hackathon Submission — Tether Hackathon Galactica: WDK Edition 1

**Track**: Agent Wallets (WDK / Agents Integration)
**Focus**: Self-custodial agent wallets with real-time USDT streaming on Base

---

## What It Does

TetherStream enables **pay-per-second USDT micropayments** for AI services. Instead of monthly subscriptions, agents stream USDT continuously and only pay for compute they actually use.

### The Problem
- AI APIs charge monthly — you pay for idle time
- No native way to pay-per-second for compute
- Agents can't transact autonomously without centralized custody
- Small payments are impractical with high fees

### The Solution
- **Agent Wallets** — Self-custodial BIP39 HD wallets (real derivation via ethers.js, path m/44'/60'/0'/0/0)
- **Streaming Payments** — Pay by the second, not by the month
- **On-Chain Policy Control** — Daily limits, approved recipients, max stream amounts enforced in `AgentWallet.sol`
- **Native USDT** — Stablecoin streaming on Base
- **Low Fees** — Optimized for micropayments on Base Sepolia

---

## Live Demo

**Try it**: https://paystream-beryl.vercel.app

---

## Features

### Dashboard
- Real-time USDT balance and stream stats
- Incoming / outgoing / net flow overview
- Active stream count and total volume

### Stream Manager
- Create streams: recipient, amount, duration, service ID
- USDT approval + stream creation in two steps
- Pre-fill from marketplace or templates

### Agent Wallets
- Generate real BIP39 12-word mnemonics
- Derive EVM address via HD path (m/44'/60'/0'/0/0)
- Configure daily spend limits and approved recipients
- On-chain policy enforcement via `AgentWallet.sol`

### Service Marketplace
- Browse services registered in `BillingRegistry.sol`
- Filter by tag, sort by rating or price
- 5 billing models: PerSecond, PerCall, PerToken, Fixed, Hybrid

### Stream Templates
- Pre-configured templates: AI inference, GPU compute, cloud storage, data APIs
- Cost comparison vs traditional monthly billing
- One-click fill for stream creation

### Analytics
- Volume charts (incoming / outgoing / net)
- Time range filters: 24h, 7d, 30d, all time
- Stream timeline with progress bars
- Service breakdown

### Transaction History
- Full event log: StreamCreated, StreamWithdrawn, StreamCancelled, StreamCompleted
- Filter by type, CSV export, pagination

### Live Visualization
- Canvas-based animated USDT particle flows
- Real-time updates driven by contract events

---

## Smart Contracts (Base Sepolia)

| Contract | Address |
|----------|---------|
| **PaymentStreamV2** | `0xc3E0869913FCdbeB59934FfC92C74269c428C834` |
| **AgentWallet** | `0x8F44610D43Db6775e351F22F43bDF0ba7F8D0CEa` |
| **BillingRegistry** | `0x9C34200882C37344A098E0e8B84a533DFB80e552` |
| **MockUSDT** | `0xEf70C6e8D49DC21b96b02854089B26df9BECE227` |

Deployed: 2026-03-23 · Chain ID: 84532

---

## Architecture

```
┌─────────────────────────────────────────────────────┐
│              Frontend (React + TypeScript)           │
│                                                     │
│  Dashboard · Streams · Marketplace · Analytics      │
│  Templates · Agent Wallets · History · Viz          │
└──────────┬──────────────────────────────────────────┘
           │ wagmi + RainbowKit (user wallets)
           │ ethers.js (agent wallet BIP39 + HD derivation)
           │
┌──────────▼──────────────────────────────────────────┐
│          Smart Contracts (Base Sepolia)              │
│                                                     │
│  PaymentStreamV2.sol  — streaming, pause/resume     │
│  AgentWallet.sol      — policy-controlled wallets   │
│  BillingRegistry.sol  — service marketplace         │
│  MockUSDT.sol         — ERC20 test token            │
└─────────────────────────────────────────────────────┘
```

---

## Tech Stack

| Layer | Tech |
|-------|------|
| Frontend | React 18 + TypeScript + Vite |
| Styling | Tailwind CSS |
| User Wallets | wagmi v2 + RainbowKit |
| Agent Wallets | ethers.js v6 (BIP39 + HD derivation) |
| Contracts | Solidity ^0.8.20 + Hardhat |
| Network | Base Sepolia |
| Token | MockUSDT (6 decimals, faucet available) |

---

## Test Coverage

```
36/36 tests passing

TetherStream.test.js (5 tests)
  PaymentStream     — streaming logic, withdrawals, cancellation
  AgentWallet       — wallet functionality, auto-streams
  BillingRegistry   — service registration, ratings
  MockUSDT          — transfers, approvals

TetherStream.extended.test.js (31 tests)
  PaymentStream     — edge cases, fee calculation, limits
  AgentWallet       — operator permissions, daily limits, batch ops
  BillingRegistry   — marketplace stats, search, cost calculation
```

---

## Getting Started

```bash
# Install root dependencies (Hardhat, contract tools)
npm install

# Install frontend dependencies
cd frontend && npm install

# Start dev server
npm run dev

# Build for production
npm run build
```

### Deploy contracts (requires `.env`)

```bash
cp .env.example .env
# fill in PRIVATE_KEY, BASE_SEPOLIA_RPC, BASESCAN_API_KEY
npx hardhat run scripts/deploy.js --network baseSepolia
```

### Environment variables (frontend)

```env
VITE_PAYMENT_STREAM_ADDRESS=0xc3E0869913FCdbeB59934FfC92C74269c428C834
VITE_BILLING_REGISTRY_ADDRESS=0x9C34200882C37344A098E0e8B84a533DFB80e552
VITE_AGENT_WALLET_ADDRESS=0x8F44610D43Db6775e351F22F43bDF0ba7F8D0CEa
VITE_USDT_ADDRESS=0xEf70C6e8D49DC21b96b02854089B26df9BECE227
VITE_WALLETCONNECT_PROJECT_ID=your_project_id
VITE_BASE_SEPOLIA_RPC=https://sepolia.base.org
```

---

## Project Structure

```
tether-hackathon-project/
├── contracts/
│   ├── PaymentStreamV2.sol
│   ├── AgentWallet.sol
│   ├── BillingRegistry.sol
│   └── MockUSDT.sol
├── frontend/
│   └── src/
│       ├── components/
│       │   ├── WDKAgentWallets.tsx
│       │   ├── StreamManager.tsx
│       │   ├── ActiveStreams.tsx
│       │   ├── ServiceMarketplace.tsx
│       │   ├── StreamTemplates.tsx
│       │   ├── AnalyticsDashboard.tsx
│       │   ├── TransactionHistory.tsx
│       │   ├── LiveStreamVisualization.tsx
│       │   ├── RealTimeStreams.tsx
│       │   └── WalletDashboard.tsx
│       └── utils/
│           ├── contracts.ts   — ABIs + deployed addresses
│           └── wdk.ts         — BIP39 seed gen + HD derivation
├── scripts/
├── test/
├── deployment.json
└── netlify.toml
```

---

## Get Test USDT

Call `faucet()` on MockUSDT (`0xEf70C6e8D49DC21b96b02854089B26df9BECE227`) to receive 10,000 USDT on Base Sepolia.

---

**GitHub**: https://github.com/TheMasterClaw/Tether-Stream

**Demo**: https://paystream-beryl.vercel.app

---

MIT License
