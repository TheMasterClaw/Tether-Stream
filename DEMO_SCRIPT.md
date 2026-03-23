# PayStream - 3-Minute Demo Script

## 🎬 Demo Flow (3 Minutes Total)

---

### Opening Hook (0:00-0:15)
**[Screen: Animated USDT flow visualization]**

**Script:**
"What if you could pay for AI services by the second instead of by the month? Meet PayStream: real-time USDT micropayments for the AI economy."

**Visual:** Flowing USDT particles on dark background

---

### Connect Wallet (0:15-0:25)
**[Screen: RainbowKit connect button]**

**Script:**
"One-click connection with any wallet."

**Action:**
1. Click "Connect Wallet"
2. Select MetaMask from RainbowKit modal
3. Approve connection
4. Show: ✅ Connected with wallet address and USDT balance

**Key Point:** "Native USDT support on Base Sepolia"

---

### Live Stream Visualization (0:25-0:50)
**[Screen: Animated canvas with USDT particle flows]**

**Script:**
"Watch USDT streams flow in real-time. Green particles are incoming payments, red are outgoing."

**Action:**
1. Show live stream canvas
2. Adjust simulation speed (1x → 10x)
3. Toggle between views:
   - All streams
   - Incoming only
   - Outgoing only

4. Hover over a stream to see details:
   - Sender/Receiver
   - Rate (USDT/second)
   - Total streamed

**Key Point:** "Real-time visualization of micropayment streams"

---

### Create a Payment Stream (0:50-1:25)
**[Screen: Stream creation form]**

**Script:**
"Let's create a payment stream for an AI service."

**Action:**
1. Click "Create New Stream"
2. Fill form using template:
   - **Template:** "AI Agent Services"
   - **Auto-fills:**
     - Recipient: 0xAIAgent...
     - Rate: 0.0001 USDT/sec ($8.64/day)
     - Duration: 1 day
     - Total: 8.64 USDT

3. Or manually enter:
   - **Recipient:** 0x1234...
   - **Rate:** 0.0001 USDT/sec
   - **Duration:** 86400 seconds (1 day)

4. Click "Create Stream"
5. MetaMask: Approve USDT spending (2 transactions)
6. Show: Stream created with progress bar

**Key Point:** "Pay only for what you use—pause or cancel anytime"

---

### Analytics Dashboard (1:25-1:55)
**[Screen: Dashboard with charts and metrics]**

**Script:**
"Track all your payment streams in one place."

**Action:**
1. Navigate to Dashboard
2. Show key metrics:
   - **Net Flow:** +45.2 USDT (last 24h)
   - **Incoming:** 67.5 USDT
   - **Outgoing:** 22.3 USDT
   - **Active Streams:** 5

3. Show volume chart:
   - Toggle between 24h, 7d, 30d
   - Hover for specific values

4. Show stream timeline:
   - Active streams with progress bars
   - Completed streams below
   - Click to expand details

**Key Point:** "Complete visibility into all payment activity"

---

### Service Marketplace (1:55-2:20)
**[Screen: Marketplace with AI services]**

**Script:**
"Discover and subscribe to AI services in the marketplace."

**Action:**
1. Navigate to Marketplace
2. Browse services:
   - 🤖 AI Agent API — 0.0001 USDT/sec
   - 🎨 Image Generator — 0.0005 USDT/sec
   - 📝 Text Processor — 0.00005 USDT/sec
   - 🔍 Data Analyzer — 0.0002 USDT/sec

3. Click on "AI Agent API"
4. Show service details:
   - Description
   - Provider reputation
   - Total streams
   - Average rating

5. Click "Subscribe with Stream"
6. Form pre-fills with service details

**Key Point:** "One-click subscription to any service"

---

### Transaction History (2:20-2:45)
**[Screen: History page with event log]**

**Script:**
"Complete transparency with full transaction history."

**Action:**
1. Navigate to History
2. Show event log:
   - Stream Created — 0xabc... — 2 min ago
   - Funds Withdrawn — 0xdef... — 15 min ago
   - Stream Cancelled — 0xghi... — 1 hour ago
   - Stream Completed — 0xjkl... — 2 hours ago

3. Filter by event type:
   - Show only "Withdrawals"
   - Show only "Created"

4. Click export to CSV
5. Show: CSV download with all transactions

**Key Point:** "Exportable records for accounting and taxes"

---

### Demo Mode (2:45-2:55)
**[Screen: Demo mode toggle]**

**Script:**
"For hackathon presentations, use Demo Mode to simulate activity without real transactions."

**Action:**
1. Toggle "Demo Mode"
2. Show simulated streams:
   - Multiple active streams
   - Real-time balance updates
   - Animated visualizations

3. Adjust simulation speed to 100x
4. Show fast-forwarded activity

**Key Point:** "Perfect for presentations and testing"

---

### Closing (2:55-3:00)
**[Screen: Homepage with call-to-action]**

**Script:**
"PayStream—real-time micropayments for the AI economy. Pay by the second, not by the month."

**Display:**
- Website: https://paystream-beryl.vercel.app
- GitHub: github.com/.../paystream
- Tagline: "Streaming USDT for AI Services"

---

## 🎯 Key Talking Points

### The Problem
- AI subscriptions are monthly—you pay for unused time
- No easy way for agents to transact with each other
- High fees make small payments impractical

### Our Solution
- **Streaming Payments** — Pay by the second
- **Agent Wallets** — Each AI gets its own wallet
- **USDT Integration** — Stable, familiar currency
- **Low Fees** — Optimized for micropayments on Base

### Technical Highlights
- **Real-time:** WebSocket updates on every block
- **Non-custodial:** You control your funds
- **Composable:** Any contract can integrate
- **Gas-efficient:** Optimized for Base L2

### Smart Contracts
| Contract | Purpose |
|----------|---------|
| PaymentStream.sol | Core streaming logic |
| AgentWallet.sol | Smart wallets for agents |
| BillingRegistry.sol | Service directory |
| MockUSDT.sol | Test USDT token |

---

## 🚨 Troubleshooting

### "Insufficient USDT balance"
- Get test USDT from the faucet in the app
- Or use Demo Mode

### "Transaction failed"
- Check Base Sepolia ETH for gas
- Ensure USDT approval transaction confirmed first

### "Stream not updating"
- Check WebSocket connection indicator
- Refresh the page

---

## 🎥 Recording Tips

1. **Use Demo Mode** for consistent visuals
2. **Speed up simulation** to 10x for effect
3. **Have test USDT ready** in wallet
4. **Zoom to 125%** for better visibility
5. **Show the particle animation**—it's eye-catching

---

**Live Demo:** https://paystream-beryl.vercel.app  
**Hackathon:** Tether Hackathon 2026  
**Built with:** React, wagmi, RainbowKit, Solidity
