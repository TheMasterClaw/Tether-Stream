#!/bin/bash
# PayStream Hackathon Demo Script
# Usage: ./demo.sh [scenario]

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Contract addresses
PAYMENT_STREAM="0xDE900020CEA3F4ca1223a553D66179DF43f14Aa5"
BILLING_REGISTRY="0xb623478107adB1b7153f4df72Fc7FC81A8440107"
USDT="0x068e3C17A5C68906E42E0F28d281D8B8b1E48f8B"

echo -e "${BLUE}"
echo "╔══════════════════════════════════════════════════════════════╗"
echo "║                                                              ║"
echo "║   🌊 PayStream - USDT Micropayment Streaming for AI Agents   ║"
echo "║                                                              ║"
echo "║   Hackathon Demo Script                                      ║"
echo "║                                                              ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo -e "${NC}"

show_help() {
    echo ""
    echo "Usage: ./demo.sh [command]"
    echo ""
    echo "Commands:"
    echo "  info          Show contract addresses and setup info"
    echo "  test          Run all contract tests"
    echo "  stream        Demo: Create a payment stream"
    echo "  marketplace   Demo: Register and browse services"
    echo "  wallet        Demo: Agent wallet operations"
    echo "  help          Show this help message"
    echo ""
    echo "Live Demo: https://paystream-beryl.vercel.app"
    echo ""
}

show_info() {
    echo -e "${GREEN}Contract Addresses (Base Sepolia):${NC}"
    echo ""
    echo "  PaymentStream:   $PAYMENT_STREAM"
    echo "  BillingRegistry: $BILLING_REGISTRY"
    echo "  USDT (Mock):     $USDT"
    echo ""
    echo -e "${YELLOW}Getting Started:${NC}"
    echo ""
    echo "  1. Visit: https://paystream-beryl.vercel.app"
    echo "  2. Connect your wallet (Base Sepolia)"
    echo "  3. Get test USDT from https://faucet.circle.com/"
    echo "  4. Create your first stream!"
    echo ""
}

run_tests() {
    echo -e "${BLUE}Running Contract Tests...${NC}"
    echo ""
    npm test
    echo ""
    echo -e "${GREEN}✅ All tests passed!${NC}"
    echo ""
}

demo_stream() {
    echo -e "${BLUE}Demo: Creating a Payment Stream${NC}"
    echo ""
    echo "This demo shows how PayStream enables continuous USDT streaming."
    echo ""
    
    echo -e "${YELLOW}Step 1: User connects wallet${NC}"
    echo "  - User visits https://paystream-beryl.vercel.app"
    echo "  - Clicks 'Connect Wallet'"
    echo "  - Selects MetaMask or WalletConnect"
    echo "  - Switches to Base Sepolia network"
    sleep 1
    echo ""
    
    echo -e "${YELLOW}Step 2: User navigates to Create Stream${NC}"
    echo "  - Enters recipient: 0xAb5801a7D398351b8bE11C439e05C5B3259aeC9B"
    echo "  - Sets amount: 100 USDT"
    echo "  - Selects duration: 1 hour"
    echo "  - Sees live rate calculation: ~0.027 USDT/sec"
    sleep 1
    echo ""
    
    echo -e "${YELLOW}Step 3: User approves USDT spending${NC}"
    echo "  - Clicks 'Approve USDT'"
    echo "  - Confirms transaction in wallet"
    echo "  - Waits for confirmation"
    sleep 1
    echo ""
    
    echo -e "${YELLOW}Step 4: User creates stream${NC}"
    echo "  - Clicks 'Create Stream'"
    echo "  - Confirms transaction in wallet"
    echo "  - Stream is created!"
    sleep 1
    echo ""
    
    echo -e "${YELLOW}Step 5: Stream is live!${NC}"
    echo "  - Progress bar starts moving"
    echo "  - Available balance increases every second"
    echo "  - Recipient can withdraw anytime"
    echo "  - Sender can cancel to reclaim unspent funds"
    echo ""
    
    echo -e "${GREEN}✅ Stream created successfully!${NC}"
    echo ""
    
    echo -e "${BLUE}Key Features Demonstrated:${NC}"
    echo "  • Real-time USDT streaming"
    echo "  • Pay-as-you-go pricing"
    echo "  • Withdraw anytime flexibility"
    echo "  • Cancel anytime protection"
    echo ""
}

demo_marketplace() {
    echo -e "${BLUE}Demo: Service Marketplace${NC}"
    echo ""
    echo "This demo shows how AI agents can offer services."
    echo ""
    
    echo -e "${YELLOW}Step 1: Browse Services${NC}"
    echo "  - User navigates to 'Marketplace'"
    echo "  - Sees list of available AI services:"
    echo "    • GPT-4 Inference - $0.001/token"
    echo "    • Image Generation Pro - $5/image"
    echo "    • Real-time Data Stream - $0.1/sec"
    echo "    • Smart Contract Audit - $100/audit"
    sleep 1
    echo ""
    
    echo -e "${YELLOW}Step 2: Filter by Tag${NC}"
    echo "  - User clicks 'AI' tag"
    echo "  - Filters to show only AI-related services"
    echo "  - Can also search by name/description"
    sleep 1
    echo ""
    
    echo -e "${YELLOW}Step 3: Register a Service${NC}"
    echo "  - AI agent clicks 'Register Service'"
    echo "  - Fills in details:"
    echo "    • Name: 'My AI Service'"
    echo "    • Description: 'High-quality AI processing'"
    echo "    • Endpoint: 'https://api.example.com/ai'"
    echo "    • Billing Type: 'Per Call'"
    echo "    • Rate: 10 USDT"
    sleep 1
    echo ""
    
    echo -e "${YELLOW}Step 4: Service is Live${NC}"
    echo "  - Service appears in marketplace"
    echo "  - Other users can now pay for it"
    echo "  - Earnings tracked on-chain"
    echo ""
    
    echo -e "${GREEN}✅ Service registered successfully!${NC}"
    echo ""
}

demo_wallet() {
    echo -e "${BLUE}Demo: Agent Wallet${NC}"
    echo ""
    echo "This demo shows smart contract wallets for AI agents."
    echo ""
    
    echo -e "${YELLOW}Step 1: Deposit Funds${NC}"
    echo "  - AI agent owner deposits USDT to wallet"
    echo "  - Funds are secured in smart contract"
    echo "  - Only owner can withdraw"
    sleep 1
    echo ""
    
    echo -e "${YELLOW}Step 2: Set Daily Limit${NC}"
    echo "  - Owner sets daily spending limit: 1000 USDT"
    echo "  - Protects against runaway spending"
    echo "  - Automatically resets daily"
    sleep 1
    echo ""
    
    echo -e "${YELLOW}Step 3: Configure Auto-Stream${NC}"
    echo "  - Owner approves specific recipients"
    echo "  - Sets max amount and duration per recipient"
    echo "  - AI agent can now auto-pay approved services"
    sleep 1
    echo ""
    
    echo -e "${YELLOW}Step 4: AI Agent Operates${NC}"
    echo "  - AI agent uses operator key (not owner key)"
    echo "  - Can initiate streams to approved recipients"
    echo "  - Cannot exceed daily limits"
    echo "  - All actions logged on-chain"
    echo ""
    
    echo -e "${GREEN}✅ Agent wallet configured!${NC}"
    echo ""
    
    echo -e "${BLUE}Security Features:${NC}"
    echo "  • Owner-only withdrawals"
    echo "  • Daily spending limits"
    echo "  • Pre-approved recipients"
    echo "  • Operator separation"
    echo ""
}

# Main script
case "${1:-help}" in
    info)
        show_info
        ;;
    test)
        run_tests
        ;;
    stream)
        demo_stream
        ;;
    marketplace)
        demo_marketplace
        ;;
    wallet)
        demo_wallet
        ;;
    help|--help|-h)
        show_help
        ;;
    *)
        echo -e "${RED}Unknown command: $1${NC}"
        show_help
        exit 1
        ;;
esac
