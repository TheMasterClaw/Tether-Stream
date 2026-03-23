# PayStream Hackathon Demo Script

## Live Demo
**URL:** https://paystream-beryl.vercel.app

---

## Quick Demo Flow (5 minutes)

### 1. Landing Page (30 seconds)
**What to show:**
- Navigate to https://paystream-beryl.vercel.app
- Show the landing page with features:
  - ⚡ Real-time Streaming
  - 🤖 AI Agent Wallets  
  - 🌐 Service Marketplace
- Point out the "Connect Wallet" button

**Talking points:**
- "PayStream enables real-time USDT streaming for AI agents"
- "Instead of paying upfront, you pay by the second for exactly what you use"
- "Built on Base Sepolia with real smart contracts"

---

### 2. Wallet Connection (30 seconds)
**What to show:**
- Click "Connect Wallet"
- Select MetaMask or Rainbow
- Show wallet connects to Base Sepolia

**Talking points:**
- "Works with any wallet that supports Base Sepolia"
- "RainbowKit provides a seamless connection experience"

---

### 3. Dashboard (1 minute)
**What to show:**
- USDT balance display
- Stats cards (Outgoing/Incoming streams)
- Recent activity section
- Quick action buttons

**Talking points:**
- "Dashboard shows your USDT balance and streaming activity"
- "See how many streams you've created and received"
- "Quick access to create streams or browse marketplace"

---

### 4. Create a Stream (1.5 minutes)
**What to show:**
- Navigate to "Create Stream"
- Fill in:
  - Recipient: `0xCA5AD2cD81ff9f4eFF6f66742706D831410403e3` (deployer)
  - Amount: 100 USDT
  - Duration: 5 minutes
  - Service ID: demo-stream
- Show stream summary (rate per second, platform fee)
- Explain the 2-step process (approve then create)

**Talking points:**
- "Enter recipient address and amount to stream"
- "Stream duration determines the rate per second"
- "Platform fee is only 0.25% - much lower than traditional payment processors"
- "First approve USDT, then create the stream"

---

### 5. Active Streams (1 minute)
**What to show:**
- Navigate to "Active Streams"
- Show demo streams with live progress bars
- Show filtering options (All/Active/Incoming/Outgoing)
- Point out withdraw/cancel buttons

**Talking points:**
- "See all your active and past streams"
- "Progress bars show how much time remains"
- "Incoming streams show how much you can withdraw"
- "Cancel anytime to reclaim unspent funds"

---

### 6. Service Marketplace (1 minute)
**What to show:**
- Navigate to "Marketplace"
- Show demo services (GPT-4, Image Generation, etc.)
- Show search and filter functionality
- Show "Register Service" button

**Talking points:**
- "Browse AI services with transparent pricing"
- "Multiple billing models: per-second, per-call, per-token, fixed"
- "Services rated by actual users"
- "Anyone can register their AI service"

---

## Technical Deep Dive (Optional - 5 minutes)

### Smart Contract Architecture
**Show the contracts:**
```
contracts/
├── PaymentStream.sol    # Core streaming logic
├── AgentWallet.sol      # Smart wallet for AI agents
├── BillingRegistry.sol  # Service marketplace
└── MockUSDT.sol         # Test USDT token
```

**Key features to highlight:**
1. **PaymentStream**
   - Streams are identified by unique bytes32 IDs
   - Rate per second calculated at creation
   - Linear vesting - recipient earns continuously

2. **AgentWallet**
   - Can be controlled by an operator (AI agent)
   - Daily spending limits
   - Pre-approved recipients

3. **BillingRegistry**
   - Service discovery
   - Rating system
   - Usage tracking

### Test Coverage
**Run tests:**
```bash
npx hardhat test
```

**Show results:**
- 37 tests passing
- Edge cases covered
- Integration tests included

---

## Contract Verification

Show verified contracts on Base Sepolia:

| Contract | Explorer Link |
|----------|---------------|
| PaymentStream | https://sepolia.basescan.org/address/0xDE900020CEA3F4ca1223a553D66179DF43f14Aa5 |
| BillingRegistry | https://sepolia.basescan.org/address/0xb623478107adB1b7153f4df72Fc7FC81A8440107 |
| AgentWallet | https://sepolia.basescan.org/address/0xBb8960cB40088f6020D2E5e0a880E630FAC5f884 |

---

## Common Questions

**Q: How does the streaming work?**
A: Funds are locked in the contract and released linearly over time. The recipient can withdraw earned funds anytime.

**Q: What happens if I cancel?**
A: The recipient gets what they earned, and you get the rest back immediately.

**Q: Is this on mainnet?**
A: Currently on Base Sepolia testnet. Mainnet deployment is on the roadmap.

**Q: Can AI agents use this automatically?**
A: Yes! AgentWallet.sol is designed for programmatic use by AI agents.

**Q: What are the fees?**
A: Only 0.25% platform fee - much lower than traditional payment processors.

---

## Troubleshooting

**Issue: Wallet won't connect**
- Make sure MetaMask is installed
- Add Base Sepolia network to MetaMask

**Issue: No USDT balance**
- Get test USDT from https://faucet.circle.com/
- Make sure you're on Base Sepolia

**Issue: Transaction fails**
- Check you have Base Sepolia ETH for gas
- Verify contract addresses are correct

---

## Key Metrics to Highlight

- **37** Smart contract tests passing
- **0.25%** Platform fee (vs 2-3% traditional)
- **~15** Second block time on Base
- **3** Core smart contracts
- **5** Different billing models supported

---

## Closing Statement

"PayStream brings real-time payments to AI services. Instead of subscriptions or upfront payments, you pay by the second for exactly what you use. Perfect for AI agents, microservices, and any continuous service."

---

## Links

- 🌐 **Live Demo:** https://paystream-beryl.vercel.app
- 📄 **GitHub:** https://github.com/TheMasterClaw/tether-hackathon-project
- 🔍 **Contracts:** Verified on Base Sepolia

---

*Built for the Tether Hackathon 2026*
