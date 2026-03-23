import { useState, useEffect } from 'react';
import { useAccount, useBalance, useReadContract } from 'wagmi';
import { formatUnits } from 'viem';
import { PAYMENT_STREAM_ABI, BILLING_REGISTRY_ABI } from '../utils/contracts';
import { 
  Zap, 
  ArrowUpRight, 
  ArrowDownRight, 
  Clock, 
  Wallet, 
  Activity,
  ShoppingCart,
  Droplets,
  Plus,
  ChevronRight,
  TrendingUp,
  RefreshCw,
  ExternalLink
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { LiveStreamVisualization } from './LiveStreamVisualization';

const USDT_ADDRESS = (import.meta.env.VITE_USDT_ADDRESS || '0x068e3C17A5C68906E42E0F28d281D8B8b1E48f8B') as `0x${string}`;
const PAYMENT_STREAM_ADDRESS = (import.meta.env.VITE_PAYMENT_STREAM_ADDRESS || '0xDE900020CEA3F4ca1223a553D66179DF43f14Aa5') as `0x${string}`;
const BILLING_REGISTRY_ADDRESS = (import.meta.env.VITE_BILLING_REGISTRY_ADDRESS || '0xb623478107adB1b7153f4df72Fc7FC81A8440107') as `0x${string}`;

interface StreamActivity {
  type: 'sent' | 'received';
  amount: number;
  to?: string;
  from?: string;
  time: string;
  status: 'active' | 'completed';
  streamId: string;
}

export function WalletDashboard() {
  const { address, isConnected } = useAccount();
  const [activeTab, setActiveTab] = useState('overview');

  const { data: usdtBalance, isLoading: isBalanceLoading, refetch: refetchBalance } = useBalance({
    address,
    token: USDT_ADDRESS,
    query: { enabled: isConnected },
  });

  // Fetch stream counts for stats
  const { data: senderStreams, refetch: refetchSender } = useReadContract({
    address: PAYMENT_STREAM_ADDRESS,
    abi: PAYMENT_STREAM_ABI,
    functionName: 'getSenderStreams',
    args: [address],
    query: { enabled: isConnected && !!address },
  });

  const { data: recipientStreams, refetch: refetchRecipient } = useReadContract({
    address: PAYMENT_STREAM_ADDRESS,
    abi: PAYMENT_STREAM_ABI,
    functionName: 'getRecipientStreams',
    args: [address],
    query: { enabled: isConnected && !!address },
  });

  // Fetch marketplace stats
  const { data: marketplaceStats } = useReadContract({
    address: BILLING_REGISTRY_ADDRESS,
    abi: BILLING_REGISTRY_ABI,
    functionName: 'getMarketplaceStats',
    query: { enabled: isConnected },
  });

  // Calculate stats from real data
  const sentCount = (senderStreams as string[] || []).length;
  const receivedCount = (recipientStreams as string[] || []).length;
  const activeStreamsCount = sentCount + receivedCount;

  // Parse marketplace stats
  const totalMarketplaceVolume = marketplaceStats ? (marketplaceStats as [number, bigint, number])[1] : 0n;

  // Activity data
  const [recentActivity] = useState<StreamActivity[]>([]);
  const [isActivityLoading, setIsActivityLoading] = useState(true);

  useEffect(() => {
    setIsActivityLoading(false);
  }, [address, senderStreams, recipientStreams]);

  const handleRefresh = () => {
    refetchBalance();
    refetchSender();
    refetchRecipient();
  };

  if (!isConnected) {
    return (
      <div className="text-center py-20">
        <div className="mb-12">
          <div className="w-24 h-24 mx-auto rounded-2xl gradient-primary flex items-center justify-center mb-6 shadow-lg shadow-[var(--color-primary)]/20">
            <Zap className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-4xl font-bold mb-4 text-white" style={{ fontFamily: 'var(--font-heading)' }}>
            Welcome to TetherStream
          </h1>
          <p className="text-xl text-gray-400 max-w-md mx-auto">
            Connect your wallet to start streaming USDT payments to AI agents
          </p>
        </div>        
        
        <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          <FeatureCard
            icon={Zap}
            title="Real-time Streaming"
            description="Pay for AI services by the second with continuous USDT streams"
            color="orange"
          />
          <FeatureCard
            icon={Wallet}
            title="Smart Wallets"
            description="Smart contract wallets with programmable payment rules"
            color="blue"
          />
          <FeatureCard
            icon={GlobeIcon}
            title="Service Marketplace"
            description="Discover and pay for AI services with transparent pricing"
            color="green"
          />
        </div>

        <div className="mt-12 p-6 bg-gradient-to-br from-[var(--color-primary)]/10 to-[var(--color-secondary)]/10 rounded-2xl border border-[var(--color-primary)]/20 max-w-2xl mx-auto">
          <h3 className="text-lg font-semibold mb-4 text-white flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-[var(--color-cta)]" />
            Quick Start Guide
          </h3>
          <ol className="text-left text-gray-400 space-y-3 list-decimal list-inside">
            <li className="hover:text-white transition-colors">Connect your wallet (Base Sepolia)</li>
            <li className="hover:text-white transition-colors">Get test USDT from the <Link to="/app/create" className="text-[var(--color-cta)] hover:underline inline-flex items-center gap-1">TetherStream Faucet</Link></li>
            <li className="hover:text-white transition-colors">Create your first payment stream</li>
            <li className="hover:text-white transition-colors">Explore AI services in the marketplace</li>
          </ol>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-[var(--color-primary)]/10 to-[var(--color-secondary)]/10 rounded-2xl p-8 border border-[var(--color-primary)]/20 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--color-cta)]/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <h1 className="text-3xl font-bold mb-2 text-white" style={{ fontFamily: 'var(--font-heading)' }}>
              Agent Dashboard
            </h1>
            <p className="text-gray-400">
              Manage your USDT streams and AI service payments
            </p>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-3 justify-end mb-1">
              <p className="text-sm text-gray-400">USDT Balance</p>
              <button 
                onClick={handleRefresh}
                className="p-1.5 text-gray-500 hover:text-white hover:bg-white/10 rounded-lg transition-all"
                title="Refresh balance"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
            <div className="flex items-center gap-2 justify-end">
              {isBalanceLoading ? (
                <div className="w-8 h-8 border-2 border-[var(--color-primary)]/30 border-t-[var(--color-primary)] rounded-full animate-spin"></div>
              ) : (
                <p className="text-4xl font-bold text-[var(--color-cta)]">
                  {usdtBalance ? formatUnits(usdtBalance.value, 6) : '0'} <span className="text-xl text-gray-400">USDT</span>
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          label="Outgoing"
          value={`${sentCount}`}
          sublabel="streams"
          icon={ArrowUpRight}
          color="orange"
          isLoading={false}
        />
        <StatCard
          label="Incoming"
          value={`${receivedCount}`}
          sublabel="streams"
          icon={ArrowDownRight}
          color="blue"
          isLoading={false}
        />
        <StatCard
          label="Active"
          value={`${activeStreamsCount}`}
          sublabel="streams"
          icon={Activity}
          color="green"
          isLoading={false}
        />
        <StatCard
          label="Network"
          value="Base"
          sublabel="Sepolia"
          icon={GlobeIcon}
          color="purple"
          isLoading={false}
        />
      </div>

      {/* Marketplace Stats */}
      {totalMarketplaceVolume > 0n && (
        <div className="bg-gradient-to-r from-teal-500/10 to-pink-500/10 rounded-2xl p-6 border border-teal-500/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400 mb-1">Marketplace Volume</p>
              <p className="text-2xl font-bold text-white">
                {formatUnits(totalMarketplaceVolume, 6)} <span className="text-lg text-gray-400">USDT</span>
              </p>
            </div>
            <Link 
              to="/app/marketplace"
              className="px-4 py-2 bg-teal-500/20 text-teal-400 border border-teal-500/30 rounded-lg font-medium hover:bg-teal-500/30 transition-all"
            >
              Explore
            </Link>
          </div>
        </div>
      )}

      {/* Live Stream Visualization */}
      <LiveStreamVisualization />

      {/* Tabs */}
      <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 overflow-hidden">
        <div className="flex border-b border-white/10 overflow-x-auto">
          {['overview', 'streams', 'history'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-4 text-sm font-medium capitalize transition-colors whitespace-nowrap cursor-pointer ${
                activeTab === tab
                  ? 'text-[var(--color-cta)] border-b-2 border-[var(--color-cta)]'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="p-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-white">Recent Activity</h3>
              {isActivityLoading ? (
                <div className="text-center py-8">
                  <div className="w-8 h-8 mx-auto border-2 border-[var(--color-primary)]/30 border-t-[var(--color-primary)] rounded-full animate-spin mb-4"></div>
                  <p className="text-gray-400">Loading activity...</p>
                </div>
              ) : recentActivity.length > 0 ? (
                <div className="space-y-3">
                  {recentActivity.map((activity, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-4 bg-black/20 rounded-xl hover:bg-black/30 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          activity.type === 'sent' ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'
                        }`}>
                          {activity.type === 'sent' ? <ArrowUpRight className="w-5 h-5" /> : <ArrowDownRight className="w-5 h-5" />}
                        </div>
                        <div>
                          <p className="font-medium text-white">
                            {activity.type === 'sent' ? 'Stream Created' : 'Payment Received'}
                          </p>
                          <p className="text-sm text-gray-500">
                            {activity.type === 'sent' ? `To ${activity.to}` : `From ${activity.from}`} • {activity.time}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`font-semibold ${
                          activity.type === 'sent' ? 'text-red-400' : 'text-green-400'
                        }`}>
                          {activity.type === 'sent' ? '-' : '+'}{activity.amount} USDT
                        </p>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          activity.status === 'active' 
                            ? 'bg-green-500/20 text-green-400' 
                            : 'bg-gray-500/20 text-gray-400'
                        }`}>
                          {activity.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 bg-black/20 rounded-xl">
                  <div className="w-16 h-16 mx-auto rounded-full bg-white/5 flex items-center justify-center mb-4">
                    <Clock className="w-8 h-8 text-gray-500" />
                  </div>
                  <p className="text-gray-400 mb-2">No recent activity</p>
                  <p className="text-sm text-gray-500 mb-6">Your stream activity will appear here</p>
                  <Link to="/app/create" className="btn-primary inline-flex items-center gap-2">
                    <Plus className="w-4 h-4" />
                    Create your first stream
                  </Link>
                </div>
              )}
            </div>
          )}

          {activeTab === 'streams' && (
            <div className="text-center py-8">
              <div className="w-16 h-16 mx-auto rounded-full bg-[var(--color-primary)]/10 flex items-center justify-center mb-4">
                <Activity className="w-8 h-8 text-[var(--color-primary)]" />
              </div>
              <p className="text-gray-400 mb-4">View all your active and past streams</p>
              <Link 
                to="/app/streams"
                className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 rounded-xl font-medium transition-colors text-white"
              >
                Go to Streams Page
                <ChevronRight className="w-5 h-5" />
              </Link>
            </div>
          )}

          {activeTab === 'history' && (
            <div className="text-center py-8">
              <div className="w-16 h-16 mx-auto rounded-full bg-white/5 flex items-center justify-center mb-4">
                <Clock className="w-8 h-8 text-gray-500" />
              </div>
              <p className="text-gray-400">Full transaction history coming soon...</p>
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-3 gap-4">
        <Link
          to="/app/create"
          className="p-6 bg-gradient-to-br from-[var(--color-cta)]/10 to-emerald-500/10 border border-[var(--color-cta)]/20 rounded-2xl hover:border-[var(--color-cta)]/40 transition-all group cursor-pointer hover:shadow-lg hover:shadow-emerald-500/10"
        >
          <div className="w-10 h-10 rounded-lg bg-[var(--color-cta)]/20 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
            <Plus className="w-5 h-5 text-[var(--color-cta)]" />
          </div>
          <h3 className="font-semibold mb-1 text-white group-hover:text-[var(--color-cta)] transition-colors">Create Stream</h3>
          <p className="text-sm text-gray-400">Start a new payment stream</p>
        </Link>

        <Link
          to="/app/marketplace"
          className="p-6 bg-gradient-to-br from-[var(--color-primary)]/10 to-blue-500/10 border border-[var(--color-primary)]/20 rounded-2xl hover:border-[var(--color-primary)]/40 transition-all group cursor-pointer hover:shadow-lg hover:shadow-blue-500/10"
        >
          <div className="w-10 h-10 rounded-lg bg-[var(--color-primary)]/20 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
            <ShoppingCart className="w-5 h-5 text-[var(--color-primary)]" />
          </div>
          <h3 className="font-semibold mb-1 text-white group-hover:text-[var(--color-primary)] transition-colors">Marketplace</h3>
          <p className="text-sm text-gray-400">Browse AI services</p>
        </Link>

        <Link 
          to="/app/create"
          className="p-6 bg-gradient-to-br from-teal-500/10 to-pink-500/10 border border-teal-500/20 rounded-2xl hover:border-teal-500/40 transition-all group cursor-pointer block hover:shadow-lg hover:shadow-teal-500/10"
        >
          <div className="w-10 h-10 rounded-lg bg-teal-500/20 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
            <Droplets className="w-5 h-5 text-teal-400" />
          </div>
          <h3 className="font-semibold mb-1 text-white">Faucet</h3>
          <p className="text-sm text-gray-400">
            <span className="text-teal-400 group-hover:underline inline-flex items-center gap-1">
              Get test USDT
              <ArrowUpRight className="w-3 h-3" />
            </span>
          </p>
        </Link>
      </div>
    </div>
  );
}

function GlobeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
    </svg>
  );
}

function FeatureCard({ 
  icon: Icon, 
  title, 
  description, 
  color 
}: { 
  icon: React.ElementType; 
  title: string; 
  description: string;
  color: 'orange' | 'blue' | 'green';
}) {
  const colorClasses = {
    emerald: 'from-[var(--color-cta)]/20 to-emerald-500/20 border-[var(--color-cta)]/30',
    blue: 'from-[var(--color-primary)]/20 to-blue-500/20 border-[var(--color-primary)]/30',
    green: 'from-green-500/20 to-emerald-500/20 border-green-500/30',
  };

  const iconColors = {
    emerald: 'text-[var(--color-cta)]',
    blue: 'text-[var(--color-primary)]',
    green: 'text-green-400',
  };

  return (
    <div className={`bg-gradient-to-br ${colorClasses[color]} backdrop-blur-sm rounded-2xl p-6 border hover:opacity-80 transition-all hover:shadow-lg`}>
      <div className={`w-12 h-12 rounded-xl bg-black/30 flex items-center justify-center mb-4`}>
        <Icon className={`w-6 h-6 ${iconColors[color]}`} />
      </div>
      <h3 className="text-lg font-semibold mb-2 text-white" style={{ fontFamily: 'var(--font-heading)' }}>{title}</h3>
      <p className="text-gray-400 text-sm">{description}</p>
    </div>
  );
}

function StatCard({ 
  label, 
  value, 
  sublabel, 
  icon: Icon,
  color,
  isLoading 
}: { 
  label: string; 
  value: string; 
  sublabel: string;
  icon: React.ElementType;
  color: string;
  isLoading: boolean;
}) {
  const colorClasses: Record<string, string> = {
    emerald: 'from-[var(--color-cta)]/20 to-emerald-500/20 border-[var(--color-cta)]/30',
    blue: 'from-[var(--color-primary)]/20 to-blue-500/20 border-[var(--color-primary)]/30',
    green: 'from-green-500/20 to-emerald-500/20 border-green-500/30',
    purple: 'from-teal-500/20 to-pink-500/20 border-teal-500/30',
  };

  return (
    <div className={`bg-gradient-to-br ${colorClasses[color]} rounded-2xl p-6 border hover:shadow-lg transition-all`}>
      <div className="flex items-center justify-between mb-2">
        <p className="text-sm text-gray-400">{label}</p>
        <Icon className="w-4 h-4 text-gray-500" />
      </div>
      
      {isLoading ? (
        <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
      ) : (
        <>
          <p className="text-2xl font-bold text-white">{value}</p>
          <p className="text-sm text-gray-500">{sublabel}</p>
        </>
      )}
    </div>
  );
}
