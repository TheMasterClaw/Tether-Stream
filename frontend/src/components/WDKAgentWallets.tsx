import { useState, useEffect, useCallback } from 'react';
import {
  Shield,
  Plus,
  Wallet,
  Key,
  Zap,
  Settings,
  CheckCircle,
  Copy,
  Eye,
  EyeOff,
  ExternalLink,
  Bot,
  RefreshCw,
} from 'lucide-react';
import {
  generateAgentSeed,
  deriveAgentAddress,
  WDK_INTEGRATION_INFO,
  WDK_EVM_CONFIG,
} from '../utils/wdk';
import type { AgentWalletState } from '../utils/wdk';

// Persist agent wallets in localStorage
const STORAGE_KEY = 'paystream_agent_wallets';

function loadWallets(): AgentWalletState[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveWallets(wallets: AgentWalletState[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(wallets));
}

export function WDKAgentWallets() {
  const [wallets, setWallets] = useState<AgentWalletState[]>(loadWallets);
  const [showCreate, setShowCreate] = useState(false);
  const [walletName, setWalletName] = useState('');
  const [dailyLimit, setDailyLimit] = useState('1000');
  const [showSeed, setShowSeed] = useState<Record<string, boolean>>({});
  const [copied, setCopied] = useState<string | null>(null);
  const [selectedWallet, setSelectedWallet] = useState<string | null>(null);

  // Auto-save wallets to localStorage
  useEffect(() => {
    saveWallets(wallets);
  }, [wallets]);

  const handleCreateWallet = useCallback(() => {
    if (!walletName.trim()) return;

    // WDK: Generate seed phrase (in production: WDK.getRandomSeedPhrase())
    const seed = generateAgentSeed();
    // WDK: Derive EVM address (in production: wdk.getAccount('baseSepolia', 0).getAddress())
    const address = deriveAgentAddress(seed);

    const newWallet: AgentWalletState = {
      id: `agent-${Date.now()}`,
      name: walletName.trim(),
      seed,
      address,
      balance: '0.00',
      dailyLimit,
      totalSpent: '0.00',
      status: 'active',
      createdAt: Date.now(),
    };

    setWallets((prev) => [...prev, newWallet]);
    setWalletName('');
    setDailyLimit('1000');
    setShowCreate(false);
  }, [walletName, dailyLimit]);

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleToggleStatus = (id: string) => {
    setWallets((prev) =>
      prev.map((w) =>
        w.id === id
          ? { ...w, status: w.status === 'active' ? 'paused' : 'active' }
          : w
      )
    );
  };

  const handleDeleteWallet = (id: string) => {
    setWallets((prev) => prev.filter((w) => w.id !== id));
    if (selectedWallet === id) setSelectedWallet(null);
  };

  const details = selectedWallet ? wallets.find((w) => w.id === selectedWallet) : null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-3xl font-bold text-white" style={{ fontFamily: 'var(--font-heading)' }}>
              Agent Wallets
            </h1>
            <span className="px-3 py-1 text-xs font-semibold rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              Powered by Tether WDK
            </span>
          </div>
          <p className="text-gray-400">
            Self-custodial wallets for AI agents — seed-phrase based, policy-controlled, autonomous
          </p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 px-6 py-3 gradient-cta rounded-xl font-semibold text-white hover:shadow-lg hover:shadow-emerald-500/25 transition-all cursor-pointer"
        >
          <Plus className="w-5 h-5" />
          Create Agent Wallet
        </button>
      </div>

      {/* WDK Info Banner */}
      <div className="bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-500/20 rounded-2xl p-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center shrink-0">
            <Shield className="w-6 h-6 text-emerald-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white mb-2">
              Tether Wallet Development Kit (WDK)
            </h3>
            <p className="text-gray-400 text-sm mb-3">
              Each agent wallet is powered by <code className="text-emerald-400">@tetherto/wdk-core</code> + <code className="text-emerald-400">@tetherto/wdk-wallet-evm</code>.
              Keys are derived from BIP39 seed phrases and never leave the agent's runtime.
            </p>
            <div className="flex flex-wrap gap-2">
              {WDK_INTEGRATION_INFO.features.slice(0, 3).map((feat) => (
                <span key={feat} className="px-3 py-1 text-xs bg-emerald-500/10 text-emerald-400 rounded-full border border-emerald-500/20">
                  {feat.split('—')[0].trim()}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Create Modal */}
      {showCreate && (
        <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-8 animate-fade-in">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-[var(--color-primary)]/20 flex items-center justify-center">
              <Bot className="w-5 h-5 text-[var(--color-primary)]" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-white">Create Agent Wallet</h3>
              <p className="text-sm text-gray-400">WDK generates a self-custodial HD wallet for this agent</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Agent Name</label>
              <input
                type="text"
                value={walletName}
                onChange={(e) => setWalletName(e.target.value)}
                placeholder="e.g., GPT-4 Compute Agent"
                className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500/50 transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Daily Spend Limit (USDT)</label>
              <input
                type="number"
                value={dailyLimit}
                onChange={(e) => setDailyLimit(e.target.value)}
                placeholder="1000"
                className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500/50 transition-colors"
              />
            </div>
            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 text-sm">
              <p className="text-emerald-400 font-medium mb-1">How it works:</p>
              <ol className="text-gray-400 space-y-1 list-decimal list-inside">
                <li>WDK generates a 12-word BIP39 seed phrase</li>
                <li>An EVM account is derived via HD wallet path (m/44'/60'/0'/0/0)</li>
                <li>The agent holds its own keys — fully self-custodial</li>
                <li>Spend policies are enforced via the on-chain AgentWallet contract</li>
              </ol>
            </div>
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setShowCreate(false)}
                className="flex-1 py-3 bg-white/10 text-white rounded-xl hover:bg-white/20 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateWallet}
                disabled={!walletName.trim()}
                className="flex-1 py-3 gradient-cta rounded-xl text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-emerald-500/25 transition-all cursor-pointer"
              >
                Generate Wallet (WDK)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Wallets Grid */}
      <div className="grid gap-4 lg:grid-cols-2">
        {wallets.map((wallet) => (
          <div
            key={wallet.id}
            onClick={() => setSelectedWallet(wallet.id === selectedWallet ? null : wallet.id)}
            className={`bg-white/5 backdrop-blur-sm rounded-2xl p-6 border transition-all cursor-pointer ${
              selectedWallet === wallet.id
                ? 'border-emerald-500/40 shadow-lg shadow-emerald-500/10'
                : 'border-white/10 hover:border-white/20'
            }`}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  wallet.status === 'active'
                    ? 'bg-emerald-500/20 text-emerald-400'
                    : 'bg-gray-500/20 text-gray-400'
                }`}>
                  <Bot className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">{wallet.name}</h3>
                  <p className="text-xs text-gray-500">
                    Created {new Date(wallet.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <span className={`px-2 py-1 text-xs rounded-full ${
                wallet.status === 'active'
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : 'bg-gray-500/20 text-gray-400 border border-gray-500/30'
              }`}>
                {wallet.status}
              </span>
            </div>

            {/* Address */}
            <div className="flex items-center gap-2 mb-4 bg-black/20 rounded-lg px-3 py-2">
              <Wallet className="w-4 h-4 text-gray-500 shrink-0" />
              <span className="text-sm font-mono text-gray-300 truncate">{wallet.address}</span>
              <button
                onClick={(e) => { e.stopPropagation(); handleCopy(wallet.address, `addr-${wallet.id}`); }}
                className="text-gray-500 hover:text-white transition-colors shrink-0 cursor-pointer"
              >
                {copied === `addr-${wallet.id}` ? <CheckCircle className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="bg-black/20 rounded-lg py-2">
                <p className="text-xs text-gray-500">Balance</p>
                <p className="text-sm font-semibold text-white">{wallet.balance} USDT</p>
              </div>
              <div className="bg-black/20 rounded-lg py-2">
                <p className="text-xs text-gray-500">Daily Limit</p>
                <p className="text-sm font-semibold text-emerald-400">{wallet.dailyLimit} USDT</p>
              </div>
              <div className="bg-black/20 rounded-lg py-2">
                <p className="text-xs text-gray-500">Total Spent</p>
                <p className="text-sm font-semibold text-gray-300">{wallet.totalSpent} USDT</p>
              </div>
            </div>
          </div>
        ))}

        {/* Empty state */}
        {wallets.length === 0 && !showCreate && (
          <div className="lg:col-span-2 text-center py-16 bg-white/5 rounded-2xl border border-white/10">
            <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-emerald-500/10 to-teal-500/10 flex items-center justify-center mb-6">
              <Key className="w-10 h-10 text-emerald-400" />
            </div>
            <h3 className="text-xl font-semibold mb-3 text-white">No Agent Wallets Yet</h3>
            <p className="text-gray-400 mb-8 max-w-md mx-auto">
              Create your first WDK-powered agent wallet. Each agent gets its own self-custodial
              wallet with configurable spend policies.
            </p>
            <button
              onClick={() => setShowCreate(true)}
              className="inline-flex items-center gap-2 px-8 py-4 gradient-cta rounded-xl font-semibold text-white hover:shadow-lg hover:shadow-emerald-500/25 transition-all cursor-pointer"
            >
              <Plus className="w-5 h-5" />
              Create First Agent Wallet
            </button>
          </div>
        )}
      </div>

      {/* Selected Wallet Detail */}
      {details && (
        <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-emerald-500/20 p-8 animate-fade-in">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                <Bot className="w-6 h-6 text-emerald-400" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-white">{details.name}</h3>
                <p className="text-sm text-gray-400">Agent Wallet Details — WDK Managed</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleToggleStatus(details.id)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer ${
                  details.status === 'active'
                    ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 hover:bg-yellow-500/30'
                    : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/30'
                }`}
              >
                {details.status === 'active' ? 'Pause Agent' : 'Resume Agent'}
              </button>
              <button
                onClick={() => handleDeleteWallet(details.id)}
                className="px-4 py-2 bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg text-sm font-medium hover:bg-red-500/30 transition-all cursor-pointer"
              >
                Remove
              </button>
            </div>
          </div>

          {/* Seed Phrase */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-gray-300">
                <Key className="w-4 h-4 inline mr-1" />
                WDK Seed Phrase (BIP39)
              </p>
              <button
                onClick={() => setShowSeed((prev) => ({ ...prev, [details.id]: !prev[details.id] }))}
                className="text-sm text-gray-400 hover:text-white flex items-center gap-1 transition-colors cursor-pointer"
              >
                {showSeed[details.id] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                {showSeed[details.id] ? 'Hide' : 'Reveal'}
              </button>
            </div>
            <div className="bg-black/30 border border-white/10 rounded-xl p-4 font-mono text-sm">
              {showSeed[details.id] ? (
                <div className="flex items-center justify-between">
                  <span className="text-emerald-400">{details.seed}</span>
                  <button
                    onClick={() => handleCopy(details.seed, `seed-${details.id}`)}
                    className="text-gray-500 hover:text-white transition-colors shrink-0 ml-2 cursor-pointer"
                  >
                    {copied === `seed-${details.id}` ? <CheckCircle className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              ) : (
                <span className="text-gray-600">●●●●●●●● ●●●●●●●● ●●●●●●●● ●●●●●●●●</span>
              )}
            </div>
          </div>

          {/* WDK Code Example */}
          <div className="bg-black/30 border border-white/10 rounded-xl p-4">
            <p className="text-xs text-gray-500 mb-2 flex items-center gap-1">
              <Settings className="w-3 h-3" />
              WDK Integration Code
            </p>
            <pre className="text-xs text-emerald-400 overflow-x-auto">
{`import { WDK } from '@tetherto/wdk-core';
import { WalletManagerEvm } from '@tetherto/wdk-wallet-evm';

const agent = new WDK('${showSeed[details.id] ? details.seed.split(' ').slice(0, 3).join(' ') + ' ...' : '<seed>'}')
  .registerWallet('baseSepolia', WalletManagerEvm, {
    chainId: ${WDK_EVM_CONFIG.chainId},
    rpcUrl: '${WDK_EVM_CONFIG.rpcUrl}',
  });

const account = await agent.getAccount('baseSepolia', 0);
// Address: ${details.address.slice(0, 10)}...`}
            </pre>
          </div>

          {/* Network Info */}
          <div className="mt-4 flex items-center gap-4 text-sm text-gray-500">
            <span className="flex items-center gap-1">
              <Zap className="w-3 h-3" />
              {WDK_EVM_CONFIG.chainName} (Chain ID: {WDK_EVM_CONFIG.chainId})
            </span>
            <a
              href={`${WDK_EVM_CONFIG.explorerUrl}/address/${details.address}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 hover:text-white transition-colors"
            >
              <ExternalLink className="w-3 h-3" />
              View on Explorer
            </a>
          </div>
        </div>
      )}

      {/* WDK Architecture */}
      <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-8">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <RefreshCw className="w-5 h-5 text-emerald-400" />
          WDK Architecture — How Agent Wallets Work
        </h3>
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="bg-black/20 rounded-xl p-4 border border-white/5">
            <div className="w-8 h-8 rounded-lg bg-[var(--color-primary)]/20 flex items-center justify-center mb-3">
              <Key className="w-4 h-4 text-[var(--color-primary)]" />
            </div>
            <h4 className="font-medium text-white mb-1">1. Seed Generation</h4>
            <p className="text-sm text-gray-400">
              WDK generates a BIP39 mnemonic. The agent owns its keys — self-custody by default.
            </p>
          </div>
          <div className="bg-black/20 rounded-xl p-4 border border-white/5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center mb-3">
              <Shield className="w-4 h-4 text-emerald-400" />
            </div>
            <h4 className="font-medium text-white mb-1">2. Policy Control</h4>
            <p className="text-sm text-gray-400">
              AgentWallet.sol enforces daily limits, approved recipients, and max stream amounts on-chain.
            </p>
          </div>
          <div className="bg-black/20 rounded-xl p-4 border border-white/5">
            <div className="w-8 h-8 rounded-lg bg-[var(--color-cta)]/20 flex items-center justify-center mb-3">
              <Zap className="w-4 h-4 text-[var(--color-cta)]" />
            </div>
            <h4 className="font-medium text-white mb-1">3. Autonomous Streaming</h4>
            <p className="text-sm text-gray-400">
              Agents autonomously create USDT streams for compute services, settling payments in real-time.
            </p>
          </div>
        </div>

        {/* Docs link */}
        <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between">
          <p className="text-sm text-gray-500">
            Built with <code className="text-emerald-400">@tetherto/wdk-core</code> v1.x
          </p>
          <a
            href={WDK_INTEGRATION_INFO.docsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-emerald-400 hover:text-emerald-300 flex items-center gap-1 transition-colors"
          >
            WDK Docs
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>
    </div>
  );
}
