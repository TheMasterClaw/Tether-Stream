/**
 * Tether WDK Integration — Agent Wallet Manager
 *
 * Uses ethers.js (v6) for real BIP39 mnemonic generation and
 * HD wallet derivation (m/44'/60'/0'/0/0 — same path WDK uses).
 */

import { Wallet } from 'ethers';

// WDK Base Sepolia Configuration
export const WDK_EVM_CONFIG = {
  chainId: 84532,
  chainName: 'Base Sepolia',
  rpcUrl: import.meta.env.VITE_BASE_SEPOLIA_RPC || 'https://sepolia.base.org',
  explorerUrl: 'https://sepolia.basescan.org',
  currency: {
    name: 'Ethereum',
    symbol: 'ETH',
    decimals: 18,
  },
};

// Agent wallet state type
export interface AgentWalletState {
  id: string;
  name: string;
  seed: string;       // 12-word BIP39 mnemonic
  address: string;    // Derived EVM address (m/44'/60'/0'/0/0)
  balance: string;    // USDT balance
  dailyLimit: string;
  totalSpent: string;
  status: 'active' | 'paused' | 'depleted';
  createdAt: number;
  autoStreamConfig?: {
    recipient: string;
    maxAmount: string;
    maxDuration: number;
    enabled: boolean;
  };
}

/**
 * Generate a real 12-word BIP39 mnemonic using ethers.js entropy.
 */
export function generateAgentSeed(): string {
  return Wallet.createRandom().mnemonic!.phrase;
}

/**
 * Derive the real EVM address from a BIP39 mnemonic via HD path m/44'/60'/0'/0/0.
 */
export function deriveAgentAddress(seed: string): string {
  return Wallet.fromPhrase(seed).address;
}

export const WDK_INTEGRATION_INFO = {
  packages: ['@tetherto/wdk-core', '@tetherto/wdk-wallet-evm'],
  docsUrl: 'https://docs.wallet.tether.io',
  features: [
    'Self-custodial agent wallets — keys never leave the agent runtime',
    'BIP39 seed phrase generation and HD wallet derivation',
    'Multi-chain support (Base, Ethereum, Arbitrum, etc.)',
    'Programmatic transaction signing for autonomous agents',
    'Stateless architecture — wallet state derived from seed',
    'Protocol modules for DeFi (swap, bridge, lending)',
  ],
};
