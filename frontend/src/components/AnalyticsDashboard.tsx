import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAccount, useReadContract, usePublicClient } from 'wagmi';
import { formatUnits } from 'viem';
import { PAYMENT_STREAM_ABI } from '../utils/contracts';
import { 
  TrendingUp, 
  Activity, 
  Clock, 
  DollarSign, 
  Zap,
  ArrowUpRight,
  ArrowDownRight,
  BarChart3,
  PieChart,
  RefreshCw,
  Wallet,
  Flame,
  Target
} from 'lucide-react';
import { Link } from 'react-router-dom';

const PAYMENT_STREAM_ADDRESS = (import.meta.env.VITE_PAYMENT_STREAM_ADDRESS || '0xDE900020CEA3F4ca1223a553D66179DF43f14Aa5') as `0x${string}`;

interface Stream {
  streamId: string;
  sender: string;
  recipient: string;
  depositAmount: bigint;
  withdrawnAmount: bigint;
  startTime: bigint;
  endTime: bigint;
  ratePerSecond: bigint;
  isActive: boolean;
  serviceId: string;
}

interface TimeSeriesPoint {
  time: string;
  value: number;
}

export function AnalyticsDashboard() {
  const { address, isConnected } = useAccount();
  const publicClient = usePublicClient();
  const [currentTime, setCurrentTime] = useState(Math.floor(Date.now() / 1000));
  const [streams, setStreams] = useState<Stream[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'24h' | '7d' | '30d' | 'all'>('7d');
  const [hoveredStream, setHoveredStream] = useState<string | null>(null);

  // Update current time every second for live calculations
  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(Math.floor(Date.now() / 1000)), 1000);
    return () => clearInterval(interval);
  }, []);

  // Fetch stream IDs
  const { data: senderStreamIds, refetch: refetchSender } = useReadContract({
    address: PAYMENT_STREAM_ADDRESS,
    abi: PAYMENT_STREAM_ABI,
    functionName: 'getSenderStreams',
    args: [address],
    query: { enabled: isConnected && !!address },
  });

  const { data: recipientStreamIds, refetch: refetchRecipient } = useReadContract({
    address: PAYMENT_STREAM_ADDRESS,
    abi: PAYMENT_STREAM_ABI,
    functionName: 'getRecipientStreams',
    args: [address],
    query: { enabled: isConnected && !!address },
  });

  // Fetch all stream details
  const fetchStreams = useCallback(async () => {
    if (!publicClient || !isConnected) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const allIds = [...new Set([
        ...((senderStreamIds as string[]) || []),
        ...((recipientStreamIds as string[]) || []),
      ])];

      const details = await Promise.all(
        allIds.map(async (id) => {
          try {
            const data = await publicClient.readContract({
              address: PAYMENT_STREAM_ADDRESS,
              abi: PAYMENT_STREAM_ABI,
              functionName: 'getStream',
              args: [id as `0x${string}`],
            }) as Stream;
            return { ...data, streamId: id };
          } catch {
            return null;
          }
        })
      );

      setStreams(details.filter((s): s is Stream => s !== null));
    } catch (err) {
      console.error('Failed to fetch streams:', err);
    } finally {
      setIsLoading(false);
    }
  }, [publicClient, senderStreamIds, recipientStreamIds, isConnected]);

  useEffect(() => {
    fetchStreams();
  }, [fetchStreams]);

  // Calculate analytics
  const analytics = useMemo(() => {
    const now = currentTime;
    const incoming = streams.filter(s => s.recipient.toLowerCase() === address?.toLowerCase());
    const outgoing = streams.filter(s => s.sender.toLowerCase() === address?.toLowerCase());
    
    const activeIncoming = incoming.filter(s => s.isActive);
    const activeOutgoing = outgoing.filter(s => s.isActive);
    
    // Calculate live flow rates (USDT per second)
    const incomingRate = activeIncoming.reduce((sum, s) => sum + s.ratePerSecond, 0n);
    const outgoingRate = activeOutgoing.reduce((sum, s) => sum + s.ratePerSecond, 0n);
    
    // Calculate total earned/spent
    const totalEarned = incoming.reduce((sum, s) => sum + s.withdrawnAmount, 0n);
    const totalSpent = outgoing.reduce((sum, s) => sum + s.withdrawnAmount, 0n);
    
    // Calculate pending (not yet withdrawn)
    const calculatePending = (s: Stream) => {
      if (!s.isActive) return 0n;
      const effectiveTime = now > Number(s.endTime) ? s.endTime : BigInt(now);
      if (effectiveTime <= s.startTime) return 0n;
      const elapsed = effectiveTime - s.startTime;
      const totalAvailable = elapsed * s.ratePerSecond;
      const capped = totalAvailable > s.depositAmount ? s.depositAmount : totalAvailable;
      return capped - s.withdrawnAmount;
    };
    
    const pendingIncoming = incoming.reduce((sum, s) => sum + calculatePending(s), 0n);
    const pendingOutgoing = outgoing.reduce((sum, s) => sum + calculatePending(s), 0n);
    
    // Time range filter
    const getCutoffTime = () => {
      switch (timeRange) {
        case '24h': return now - 24 * 3600;
        case '7d': return now - 7 * 24 * 3600;
        case '30d': return now - 30 * 24 * 3600;
        default: return 0;
      }
    };
    const cutoff = getCutoffTime();
    
    // Volume over time (simulated based on start times)
    const volumeData: TimeSeriesPoint[] = [];
    const timePoints = timeRange === '24h' ? 24 : timeRange === '7d' ? 7 : 30;
    const interval = (now - cutoff) / timePoints;
    
    for (let i = 0; i < timePoints; i++) {
      const pointTime = cutoff + i * interval;
      const pointStreams = streams.filter(s => Number(s.startTime) <= pointTime && Number(s.endTime) >= pointTime);
      const volume = pointStreams.reduce((sum, s) => sum + s.depositAmount, 0n);
      volumeData.push({
        time: new Date(pointTime * 1000).toLocaleDateString('en-US', { 
          month: 'short', 
          day: 'numeric',
          hour: timeRange === '24h' ? 'numeric' : undefined
        }),
        value: Number(formatUnits(volume, 6))
      });
    }
    
    // Stream activity heatmap data
    const activityData = streams.map(s => ({
      streamId: s.streamId,
      serviceId: s.serviceId,
      startTime: Number(s.startTime),
      endTime: Number(s.endTime),
      duration: Number(s.endTime - s.startTime),
      amount: Number(formatUnits(s.depositAmount, 6)),
      isIncoming: s.recipient.toLowerCase() === address?.toLowerCase(),
      isActive: s.isActive,
      withdrawn: Number(formatUnits(s.withdrawnAmount, 6)),
      progress: s.isActive 
        ? Math.min(100, ((now - Number(s.startTime)) / Number(s.endTime - s.startTime)) * 100)
        : 100
    }));
    
    // Service breakdown
    const serviceBreakdown = streams.reduce((acc, s) => {
      const name = s.serviceId || 'Custom';
      if (!acc[name]) acc[name] = { count: 0, total: 0n, incoming: 0n, outgoing: 0n };
      acc[name].count++;
      acc[name].total += s.depositAmount;
      if (s.recipient.toLowerCase() === address?.toLowerCase()) {
        acc[name].incoming += s.depositAmount;
      } else {
        acc[name].outgoing += s.depositAmount;
      }
      return acc;
    }, {} as Record<string, { count: number; total: bigint; incoming: bigint; outgoing: bigint }>);
    
    return {
      incomingRate,
      outgoingRate,
      netFlow: incomingRate - outgoingRate,
      totalEarned,
      totalSpent,
      netEarnings: totalEarned - totalSpent,
      pendingIncoming,
      pendingOutgoing,
      activeIncoming: activeIncoming.length,
      activeOutgoing: activeOutgoing.length,
      totalIncoming: incoming.length,
      totalOutgoing: outgoing.length,
      volumeData,
      activityData,
      serviceBreakdown
    };
  }, [streams, currentTime, address, timeRange]);

  const handleRefresh = () => {
    refetchSender();
    refetchRecipient();
    fetchStreams();
  };

  if (!isConnected) {
    return (
      <div className="text-center py-20">
        <div className="w-24 h-24 mx-auto rounded-2xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center mb-6">
          <BarChart3 className="w-12 h-12 text-purple-400" />
        </div>
        <h2 className="text-3xl font-bold mb-4 text-white">Analytics Dashboard</h2>
        <p className="text-gray-400 max-w-md mx-auto">
          Connect your wallet to view detailed analytics of your payment streams
        </p>
      </div>
    );
  }

  const formatRate = (rate: bigint) => {
    const perSecond = Number(formatUnits(rate, 6));
    const perHour = perSecond * 3600;
    const perDay = perSecond * 86400;
    
    if (perDay >= 1) return `${perDay.toFixed(2)} USDT/day`;
    if (perHour >= 1) return `${perHour.toFixed(4)} USDT/hr`;
    return `${perSecond.toFixed(6)} USDT/sec`;
  };

  // Calculate max for bar chart scaling
  const maxVolume = Math.max(...analytics.volumeData.map(d => d.value), 1);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white" style={{ fontFamily: 'var(--font-heading)' }}>
            Stream Analytics
          </h1>
          <p className="text-gray-400">Real-time insights into your payment flows</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex bg-black/30 rounded-xl border border-white/10 p-1">
            {(['24h', '7d', '30d', 'all'] as const).map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  timeRange === range
                    ? 'bg-purple-500/20 text-purple-400'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {range === 'all' ? 'All Time' : range}
              </button>
            ))}
          </div>
          <button
            onClick={handleRefresh}
            disabled={isLoading}
            className="p-3 bg-black/30 border border-white/10 rounded-xl text-gray-400 hover:text-white transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Live Flow Ticker */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-2xl p-6 border border-green-500/20">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-400 flex items-center gap-2">
              <ArrowDownRight className="w-4 h-4 text-green-400" />
              Incoming Flow
            </p>
            <Activity className="w-4 h-4 text-green-400 animate-pulse" />
          </div>
          <p className="text-3xl font-bold text-green-400">
            {formatRate(analytics.incomingRate)}
          </p>
          <p className="text-sm text-gray-500 mt-1">
            {analytics.activeIncoming} active stream{analytics.activeIncoming !== 1 ? 's' : ''}
          </p>
        </div>

        <div className="bg-gradient-to-br from-red-500/10 to-orange-500/10 rounded-2xl p-6 border border-red-500/20">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-400 flex items-center gap-2">
              <ArrowUpRight className="w-4 h-4 text-red-400" />
              Outgoing Flow
            </p>
            <Flame className="w-4 h-4 text-red-400" />
          </div>
          <p className="text-3xl font-bold text-red-400">
            {formatRate(analytics.outgoingRate)}
          </p>
          <p className="text-sm text-gray-500 mt-1">
            {analytics.activeOutgoing} active stream{analytics.activeOutgoing !== 1 ? 's' : ''}
          </p>
        </div>

        <div className={`bg-gradient-to-br rounded-2xl p-6 border ${
          analytics.netFlow >= 0n 
            ? 'from-green-500/10 to-emerald-500/10 border-green-500/20' 
            : 'from-red-500/10 to-orange-500/10 border-red-500/20'
        }`}>
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-400 flex items-center gap-2">
              <Target className={`w-4 h-4 ${analytics.netFlow >= 0n ? 'text-green-400' : 'text-red-400'}`} />
              Net Flow
            </p>
            <Zap className={`w-4 h-4 ${analytics.netFlow >= 0n ? 'text-green-400' : 'text-red-400'}`} />
          </div>
          <p className={`text-3xl font-bold ${analytics.netFlow >= 0n ? 'text-green-400' : 'text-red-400'}`}>
            {formatRate(analytics.netFlow >= 0n ? analytics.netFlow : -analytics.netFlow)}
          </p>
          <p className="text-sm text-gray-500 mt-1">
            {analytics.netFlow >= 0n ? 'Net positive' : 'Net spending'}
          </p>
        </div>
      </div>

      {/* Volume Chart */}
      <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-purple-400" />
              Volume Over Time
            </h3>
            <p className="text-sm text-gray-500">Total value locked in streams</p>
          </div>
        </div>
        
        <div className="h-48 flex items-end gap-2">
          {analytics.volumeData.map((point, i) => (
            <div
              key={i}
              className="flex-1 flex flex-col items-center gap-1 group"
            >
              <div className="w-full relative">
                <div
                  className="w-full bg-gradient-to-t from-purple-500/50 to-purple-400/80 rounded-t-lg transition-all duration-500 group-hover:from-purple-400/70 group-hover:to-purple-300"
                  style={{ height: `${(point.value / maxVolume) * 160}px` }}
                />
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-black/80 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                  {point.value.toFixed(2)} USDT
                </div>
              </div>
              <span className="text-xs text-gray-500 rotate-0 md:-rotate-45 origin-top-left whitespace-nowrap">
                {point.time}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          label="Total Earned"
          value={`${Number(formatUnits(analytics.totalEarned, 6)).toFixed(2)} USDT`}
          trend={analytics.pendingIncoming > 0n ? `+${Number(formatUnits(analytics.pendingIncoming, 6)).toFixed(2)} pending` : undefined}
          trendUp={true}
          icon={Wallet}
          color="green"
        />
        <StatCard
          label="Total Spent"
          value={`${Number(formatUnits(analytics.totalSpent, 6)).toFixed(2)} USDT`}
          trend={analytics.pendingOutgoing > 0n ? `+${Number(formatUnits(analytics.pendingOutgoing, 6)).toFixed(2)} pending` : undefined}
          trendUp={false}
          icon={DollarSign}
          color="red"
        />
        <StatCard
          label="Net Earnings"
          value={`${Number(formatUnits(analytics.netEarnings >= 0n ? analytics.netEarnings : -analytics.netEarnings, 6)).toFixed(2)} USDT`}
          trend={analytics.netEarnings >= 0n ? 'Profit' : 'Loss'}
          trendUp={analytics.netEarnings >= 0n}
          icon={PieChart}
          color={analytics.netEarnings >= 0n ? 'green' : 'red'}
        />
        <StatCard
          label="Total Streams"
          value={`${analytics.totalIncoming + analytics.totalOutgoing}`}
          trend={`${analytics.activeIncoming + analytics.activeOutgoing} active`}
          trendUp={true}
          icon={Activity}
          color="purple"
        />
      </div>

      {/* Active Streams Activity */}
      {analytics.activityData.length > 0 && (
        <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-6">
          <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
            <Clock className="w-5 h-5 text-blue-400" />
            Stream Timeline
          </h3>
          
          <div className="space-y-3">
            {analytics.activityData
              .sort((a, b) => b.startTime - a.startTime)
              .slice(0, 10)
              .map((stream) => (
                <div
                  key={stream.streamId}
                  className="relative"
                  onMouseEnter={() => setHoveredStream(stream.streamId)}
                  onMouseLeave={() => setHoveredStream(null)}
                >
                  <div className="flex items-center gap-4 p-4 bg-black/20 rounded-xl hover:bg-black/30 transition-colors">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      stream.isIncoming ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                    }`}>
                      {stream.isIncoming ? <ArrowDownRight className="w-5 h-5" /> : <ArrowUpRight className="w-5 h-5" />}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-white truncate">{stream.serviceId || 'Custom Stream'}</span>
                        {stream.isActive && (
                          <span className="px-2 py-0.5 text-xs bg-green-500/20 text-green-400 rounded-full animate-pulse">
                            Live
                          </span>
                        )}
                      </div>
                      <div className="h-2 bg-black/30 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-1000 ${
                            stream.isIncoming 
                              ? 'bg-gradient-to-r from-green-500 to-emerald-400' 
                              : 'bg-gradient-to-r from-red-500 to-orange-400'
                          }`}
                          style={{ width: `${stream.progress}%` }}
                        />
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <p className="font-semibold text-white">{stream.amount.toFixed(2)} USDT</p>
                      <p className="text-xs text-gray-500">
                        {stream.withdrawn.toFixed(2)} withdrawn
                      </p>
                    </div>
                    
                    {hoveredStream === stream.streamId && stream.isActive && (
                      <Link
                        to="/app/streams"
                        className="absolute right-2 top-2 text-xs text-purple-400 hover:text-purple-300"
                      >
                        View →
                      </Link>
                    )}
                  </div>
                </div>
              ))}
          </div>
          
          {analytics.activityData.length > 10 && (
            <Link
              to="/app/streams"
              className="block text-center mt-4 text-purple-400 hover:text-purple-300 text-sm"
            >
              View all {analytics.activityData.length} streams →
            </Link>
          )}
        </div>
      )}

      {/* Service Breakdown */}
      {Object.keys(analytics.serviceBreakdown).length > 0 && (
        <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-6">
          <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
            <PieChart className="w-5 h-5 text-pink-400" />
            Service Breakdown
          </h3>
          
          <div className="grid md:grid-cols-2 gap-4">
            {Object.entries(analytics.serviceBreakdown)
              .sort(([, a], [, b]) => Number(b.total - a.total))
              .map(([name, data]) => (
                <div
                  key={name}
                  className="p-4 bg-black/20 rounded-xl border border-white/5 hover:border-white/10 transition-colors"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-white">{name}</span>
                    <span className="text-xs text-gray-500">{data.count} streams</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-green-400">+{Number(formatUnits(data.incoming, 6)).toFixed(2)}</span>
                    <span className="text-red-400">-{Number(formatUnits(data.outgoing, 6)).toFixed(2)}</span>
                  </div>
                  <div className="mt-2 h-1.5 bg-black/30 rounded-full overflow-hidden flex">
                    {data.incoming > 0n && (
                      <div
                        className="h-full bg-green-500"
                        style={{ 
                          width: `${Number(data.incoming) / Number(data.total) * 100}%` 
                        }}
                      />
                    )}
                    {data.outgoing > 0n && (
                      <div
                        className="h-full bg-red-500"
                        style={{ 
                          width: `${Number(data.outgoing) / Number(data.total) * 100}%` 
                        }}
                      />
                    )}
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && streams.length === 0 && (
        <div className="text-center py-16 bg-white/5 rounded-2xl border border-white/10">
          <BarChart3 className="w-16 h-16 mx-auto text-gray-500 mb-4" />
          <h3 className="text-xl font-semibold mb-2 text-white">No Data Yet</h3>
          <p className="text-gray-400 mb-6">Create your first stream to see analytics</p>
          <Link
            to="/app/create"
            className="inline-flex items-center gap-2 px-6 py-3 gradient-cta rounded-xl font-semibold text-white"
          >
            <Zap className="w-5 h-5" />
            Create Stream
          </Link>
        </div>
      )}
    </div>
  );
}

function StatCard({ 
  label, 
  value, 
  trend,
  trendUp,
  icon: Icon,
  color
}: { 
  label: string; 
  value: string;
  trend?: string;
  trendUp?: boolean;
  icon: React.ElementType;
  color: string;
}) {
  const colorClasses: Record<string, string> = {
    green: 'from-green-500/20 to-emerald-500/20 border-green-500/30',
    red: 'from-red-500/20 to-orange-500/20 border-red-500/30',
    purple: 'from-purple-500/20 to-pink-500/20 border-purple-500/30',
    blue: 'from-blue-500/20 to-cyan-500/20 border-blue-500/30',
  };

  return (
    <div className={`bg-gradient-to-br ${colorClasses[color]} rounded-2xl p-5 border`}>
      <div className="flex items-center justify-between mb-2">
        <p className="text-sm text-gray-400">{label}</p>
        <Icon className="w-4 h-4 text-gray-500" />
      </div>
      <p className="text-xl font-bold text-white mb-1">{value}</p>
      {trend && (
        <p className={`text-xs ${trendUp ? 'text-green-400' : 'text-red-400'}`}>
          {trend}
        </p>
      )}
    </div>
  );
}
