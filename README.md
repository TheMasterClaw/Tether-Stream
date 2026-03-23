# PayStream - USDT Micropayment Streaming

[![Live Demo](https://img.shields.io/badge/Live-Demo-green)](https://paystream-beryl.vercel.app)
[![Tether](https://img.shields.io/badge/Tether-USDT-26A17B)]()

## 🎯 Hackathon Submission - Tether Hackathon 2026

**Focus**: USDT/Stablecoin Integration

## 💰 What It Does

PayStream enables **real-time USDT micropayments** for AI services.

### The Problem
- AI API subscriptions are monthly (pay for unused time)
- No way to pay per-second for compute
- Agents can't easily transact with each other
- High fees for small payments

### The Solution
- **Streaming Payments** - Pay by the second, not by the month
- **Agent Wallets** - Each AI agent gets its own smart wallet
- **USDT Integration** - Native stablecoin support
- **Low Fees** - Optimized for micropayments on Base

## 🚀 Live Demo

**Try it now**: https://paystream-beryl.vercel.app

## ✨ Features

### 📊 Analytics Dashboard
- Real-time payment flow tracking (incoming/outgoing/net)
- Volume over time charts
- Stream timeline with progress bars
- Service breakdown analytics
- Time range selection (24h, 7d, 30d, all time)

### 🎬 Live Stream Visualization
- Canvas-based animated USDT particle flows
- Real-time simulation with adjustable speed
- Visual distinction between incoming (green) and outgoing (red) streams
- Individual stream controls

### 📋 Stream Templates
- Pre-configured templates for common use cases:
  - AI Agent Services
  - GPU Compute
  - Content Access
  - Cloud Storage
  - Data API Access
- Cost comparison vs traditional billing
- One-click template selection

### 📜 Transaction History
- Complete event log (created, withdrawn, cancelled, completed)
- Filter by event type
- CSV export functionality
- Expandable event details
- Pagination for large histories

### 🎮 Demo Mode
- Interactive simulation without real transactions
- Adjustable simulation speed (1x - 1000x)
- Multiple demo streams running simultaneously
- Perfect for hackathon presentations

### 🔔 Notifications
- Real-time toast notifications
- Types: success, error, warning, info, incoming, outgoing
- Auto-dismissing with progress bars
- Stream-specific notification hooks

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────┐
│              Frontend (React + TypeScript)          │
│  ┌─────────────────────────────────────────────┐    │
│  │  Dashboard          │  Stream Manager        │    │
│  │  - Analytics        │  - Create streams      │    │
│  │  - Visualizations   │  - Templates           │    │
│  │  - Live flows       │  - Pre-fill params     │    │
│  ├─────────────────────────────────────────────┤    │
│  │  Marketplace        │  History               │    │
│  │  - Service registry │  - Transaction log     │    │
│  │  - Ratings          │  - CSV export          │    │
│  │  - Search           │  - Event filtering     │    │
│  └─────────────────────────────────────────────┘    │
└──────────────────┬──────────────────────────────────┘
                   │ wagmi + RainbowKit
                   │
┌──────────────────▼──────────────────────────────────┐
│              Smart Contracts (Base Sepolia)         │
│  PaymentStream.sol    - Core streaming logic        │
│  AgentWallet.sol      - Smart wallet for agents     │
│  BillingRegistry.sol  - Service directory           │
│  MockUSDT.sol         - USDT for testing            │
└─────────────────────────────────────────────────────┘
```

## 📊 Smart Contracts (Base Sepolia)

| Contract | Address | Purpose |
|----------|---------|---------|
| **PaymentStream** | `0xDE900020CEA3F4ca1223a553D66179DF43f14Aa5` | Core streaming |
| **AgentWallet** | `0xBb8960cB40088f6020D2E5e0a880E630FAC5f884` | Agent wallets |
| **BillingRegistry** | `0xb623478107adB1b7153f4df72Fc7FC81A8440107` | Service registry |
| **MockUSDT** | `0x068e3C17A5C68906E42E0F28d281D8B8b1E48f8B` | Test USDT |

## 💸 Use Cases

- **AI APIs** - Pay per API call in real-time
- **GPU Compute** - Rent GPU resources by the second
- **Content Streaming** - Pay for content as you consume
- **Data APIs** - Real-time data feeds with streaming payments
- **Agent-to-Agent** - AI services transacting autonomously

## 🎥 Demo Video

**3-minute walkthrough**: [YouTube Link](https://youtube.com/...)

## 🛠️ Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS
- **Web3**: wagmi + RainbowKit
- **Contracts**: Solidity ^0.8.20 + Hardhat
- **Network**: Base Sepolia
- **Token**: USDT (Mock for testnet)

## 📁 Project Structure

```
tether-hackathon-project/
├── contracts/           # Solidity smart contracts
│   ├── PaymentStream.sol
│   ├── BillingRegistry.sol
│   ├── AgentWallet.sol
│   └── MockUSDT.sol
├── frontend/            # React frontend
│   src/
│   ├── components/
│   │   ├── AnalyticsDashboard.tsx
│   │   ├── LiveStreamVisualization.tsx
│   │   ├── StreamTemplates.tsx
│   │   ├── TransactionHistory.tsx
│   │   ├── DemoMode.tsx
│   │   └── Notifications.tsx
│   ├── utils/
│   │   └── contracts.ts
│   └── main.tsx
├── scripts/             # Deployment scripts
└── test/                # Contract tests
```

## 🧪 Test Coverage

```
Contract Tests: 4/4 PASSING ✅
├── PaymentStream     - Streaming logic, withdrawals, cancellation
├── AgentWallet       - Wallet functionality, auto-streams
├── BillingRegistry   - Service registration, ratings
└── MockUSDT          - Token transfers, approvals
```

## 🚀 Getting Started

```bash
# Install dependencies
npm install

# Start frontend dev server
cd frontend && npm run dev

# Deploy contracts (requires .env setup)
npx hardhat run scripts/deploy.js --network baseSepolia
```

## 🎮 Demo Mode

Try the demo mode to see payment streaming in action without spending real USDT:

1. Navigate to `/app/demo`
2. Watch simulated streams flow in real-time
3. Adjust simulation speed (1x to 1000x)
4. Pause/resume individual streams

## 📝 Environment Variables

```env
VITE_PAYMENT_STREAM_ADDRESS=0x...
VITE_BILLING_REGISTRY_ADDRESS=0x...
VITE_AGENT_WALLET_ADDRESS=0x...
VITE_USDT_ADDRESS=0x...
VITE_WALLETCONNECT_PROJECT_ID=your_project_id
```

## 🏆 Why We Win

- **Real USDT Integration** - Native stablecoin support on Base
- **Novel Mechanism** - Pay-per-second is unique in the market
- **Production Ready** - Working contracts + polished UI
- **Demo Impressive** - Live visualizations and simulations
- **Complete Solution** - Templates, analytics, history, notifications

## 📄 License

MIT License - see LICENSE file

---

**Try it now**: https://paystream-beryl.vercel.app

**GitHub**: https://github.com/TheMasterClaw/tether-hackathon-project
