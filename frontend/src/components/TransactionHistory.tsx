import { useState, useEffect, useCallback } from 'react';
import { useAccount, usePublicClient } from 'wagmi';
import { formatUnits } from 'viem';
import { PAYMENT_STREAM_ABI } from '../utils/contracts';
import { 
  History, 
  ArrowDownRight, 
  Clock,
  Download,
  RefreshCw,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Wallet,
  Zap,
  CheckCircle,
  XCircle
} from 'lucide-react';

const PAYMENT_STREAM_ADDRESS = (import.meta.env.VITE_PAYMENT_STREAM_ADDRESS || '0xDE900020CEA3F4ca1223a553D66179DF43f14Aa5') as `0x${string}`;

interface StreamEvent {
  id: string;
  type: 'created' | 'withdrawn' | 'cancelled' | 'completed';
  streamId: string;
  sender: string;
  recipient: string;
  amount?: bigint;
  timestamp: number;
  serviceId: string;
  txHash: string;
}

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

export function TransactionHistory() {
  const { address, isConnected } = useAccount();
  const publicClient = usePublicClient();
  const [events, setEvents] = useState<StreamEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'incoming' | 'outgoing' | 'created' | 'withdrawn' | 'cancelled'>('all');
  const [expandedEvent, setExpandedEvent] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const eventsPerPage = 10;

  const fetchData = useCallback(async () => {
    if (!publicClient || !isConnected || !address) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      // Fetch all stream IDs
      const [senderIds, recipientIds] = await Promise.all([
        publicClient.readContract({
          address: PAYMENT_STREAM_ADDRESS,
          abi: PAYMENT_STREAM_ABI,
          functionName: 'getSenderStreams',
          args: [address],
        }) as Promise<string[]>,
        publicClient.readContract({
          address: PAYMENT_STREAM_ADDRESS,
          abi: PAYMENT_STREAM_ABI,
          functionName: 'getRecipientStreams',
          args: [address],
        }) as Promise<string[]>
      ]);

      const allIds = [...new Set([...(senderIds || []), ...(recipientIds || [])])];

      // Fetch stream details
      const streamDetails = await Promise.all(
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

      const validStreams = streamDetails.filter((s): s is Stream => s !== null);

      // Build event history from streams
      const historyEvents: StreamEvent[] = [];

      validStreams.forEach((stream) => {
        // Created event
        historyEvents.push({
          id: `${stream.streamId}-created`,
          type: 'created',
          streamId: stream.streamId,
          sender: stream.sender,
          recipient: stream.recipient,
          amount: stream.depositAmount,
          timestamp: Number(stream.startTime),
          serviceId: stream.serviceId,
          txHash: '' // Would need to fetch from logs
        });

        // Withdrawn events (simplified - in production would fetch from event logs)
        if (stream.withdrawnAmount > 0n) {
          historyEvents.push({
            id: `${stream.streamId}-withdrawn`,
            type: 'withdrawn',
            streamId: stream.streamId,
            sender: stream.sender,
            recipient: stream.recipient,
            amount: stream.withdrawnAmount,
            timestamp: Date.now() / 1000, // Approximate
            serviceId: stream.serviceId,
            txHash: ''
          });
        }

        // Completed event
        if (!stream.isActive && stream.withdrawnAmount >= stream.depositAmount) {
          historyEvents.push({
            id: `${stream.streamId}-completed`,
            type: 'completed',
            streamId: stream.streamId,
            sender: stream.sender,
            recipient: stream.recipient,
            timestamp: Number(stream.endTime),
            serviceId: stream.serviceId,
            txHash: ''
          });
        }
      });

      // Sort by timestamp descending
      historyEvents.sort((a, b) => b.timestamp - a.timestamp);
      setEvents(historyEvents);
    } catch (err) {
      console.error('Failed to fetch history:', err);
    } finally {
      setIsLoading(false);
    }
  }, [publicClient, isConnected, address]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Filter events
  const filteredEvents = events.filter((event) => {
    if (filter === 'all') return true;
    if (filter === 'incoming') return event.recipient.toLowerCase() === address?.toLowerCase();
    if (filter === 'outgoing') return event.sender.toLowerCase() === address?.toLowerCase();
    return event.type === filter;
  });

  // Pagination
  const totalPages = Math.ceil(filteredEvents.length / eventsPerPage);
  const paginatedEvents = filteredEvents.slice(
    (currentPage - 1) * eventsPerPage,
    currentPage * eventsPerPage
  );

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'created': return { icon: Zap, color: 'text-blue-400', bg: 'bg-blue-500/20' };
      case 'withdrawn': return { icon: ArrowDownRight, color: 'text-green-400', bg: 'bg-green-500/20' };
      case 'cancelled': return { icon: XCircle, color: 'text-red-400', bg: 'bg-red-500/20' };
      case 'completed': return { icon: CheckCircle, color: 'text-teal-400', bg: 'bg-teal-500/20' };
      default: return { icon: Clock, color: 'text-gray-400', bg: 'bg-gray-500/20' };
    }
  };

  const getEventTitle = (event: StreamEvent) => {
    const isIncoming = event.recipient.toLowerCase() === address?.toLowerCase();
    switch (event.type) {
      case 'created': return isIncoming ? 'Stream Received' : 'Stream Created';
      case 'withdrawn': return 'Funds Withdrawn';
      case 'cancelled': return 'Stream Cancelled';
      case 'completed': return 'Stream Completed';
      default: return 'Unknown Event';
    }
  };

  const exportCSV = () => {
    const csv = [
      ['Date', 'Type', 'Service', 'Amount (USDT)', 'From/To', 'Transaction'].join(','),
      ...filteredEvents.map(e => [
        new Date(e.timestamp * 1000).toISOString(),
        e.type,
        e.serviceId,
        e.amount ? formatUnits(e.amount, 6) : '-',
        e.sender.toLowerCase() === address?.toLowerCase() ? `To: ${e.recipient}` : `From: ${e.sender}`,
        e.txHash || '-'
      ].join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `paystream-history-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!isConnected) {
    return (
      <div className="text-center py-20">
        <div className="w-24 h-24 mx-auto rounded-2xl bg-gradient-to-br from-gray-500/20 to-gray-600/20 flex items-center justify-center mb-6">
          <History className="w-12 h-12 text-gray-400" />
        </div>
        <h2 className="text-3xl font-bold mb-4 text-white">Transaction History</h2>
        <p className="text-gray-400 max-w-md mx-auto">
          Connect your wallet to view your complete payment stream history
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white" style={{ fontFamily: 'var(--font-heading)' }}>
            Transaction History
          </h1>
          <p className="text-gray-400">Complete log of your payment stream activity</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchData}
            disabled={isLoading}
            className="p-2.5 bg-black/30 border border-white/10 rounded-xl text-gray-400 hover:text-white transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={exportCSV}
            disabled={events.length === 0}
            className="px-4 py-2.5 bg-white/10 hover:bg-white/20 disabled:opacity-50 rounded-xl text-white font-medium flex items-center gap-2 transition-all"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <SummaryCard
          label="Total Events"
          value={events.length.toString()}
          icon={History}
        />
        <SummaryCard
          label="Streams Created"
          value={events.filter(e => e.type === 'created').length.toString()}
          icon={Zap}
        />
        <SummaryCard
          label="Withdrawals"
          value={events.filter(e => e.type === 'withdrawn').length.toString()}
          icon={Wallet}
        />
        <SummaryCard
          label="Completed"
          value={events.filter(e => e.type === 'completed').length.toString()}
          icon={CheckCircle}
        />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
        <FilterBadge filter="all" current={filter} onClick={setFilter} label="All Events" />
        <FilterBadge filter="incoming" current={filter} onClick={setFilter} label="Incoming" />
        <FilterBadge filter="outgoing" current={filter} onClick={setFilter} label="Outgoing" />
        <FilterBadge filter="created" current={filter} onClick={setFilter} label="Created" />
        <FilterBadge filter="withdrawn" current={filter} onClick={setFilter} label="Withdrawn" />
        <FilterBadge filter="cancelled" current={filter} onClick={setFilter} label="Cancelled" />
      </div>

      {/* Events List */}
      <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 overflow-hidden">
        {isLoading ? (
          <div className="text-center py-12">
            <RefreshCw className="w-8 h-8 mx-auto text-gray-500 animate-spin mb-4" />
            <p className="text-gray-400">Loading transaction history...</p>
          </div>
        ) : paginatedEvents.length === 0 ? (
          <div className="text-center py-12">
            <History className="w-12 h-12 mx-auto text-gray-500 mb-4" />
            <p className="text-gray-400">No events found</p>
            {filter !== 'all' && (
              <button
                onClick={() => setFilter('all')}
                className="mt-2 text-[var(--color-cta)] hover:underline text-sm"
              >
                Clear filters
              </button>
            )}
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {paginatedEvents.map((event) => {
              const { icon: Icon, color, bg } = getEventIcon(event.type);
              const isExpanded = expandedEvent === event.id;
              const isIncoming = event.recipient.toLowerCase() === address?.toLowerCase();

              return (
                <div
                  key={event.id}
                  className="p-4 hover:bg-white/5 transition-colors cursor-pointer"
                  onClick={() => setExpandedEvent(isExpanded ? null : event.id)}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-lg ${bg} flex items-center justify-center flex-shrink-0`}>
                      <Icon className={`w-5 h-5 ${color}`} />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-white">{getEventTitle(event)}</p>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          isIncoming ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                        }`}>
                          {isIncoming ? 'Incoming' : 'Outgoing'}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 truncate">
                        {event.serviceId || 'Custom Stream'} • {new Date(event.timestamp * 1000).toLocaleString()}
                      </p>
                    </div>

                    <div className="text-right">
                      {event.amount !== undefined && event.amount > 0n ? (
                        <p className={`font-medium ${isIncoming ? 'text-green-400' : 'text-red-400'}`}>
                          {isIncoming ? '+' : '-'}{Number(formatUnits(event.amount, 6)).toFixed(4)} USDT
                        </p>
                      ) : null}
                      {isExpanded ? <ChevronUp className="w-4 h-4 text-gray-500" /> : <ChevronDown className="w-4 h-4 text-gray-500" />}
                    </div>
                  </div>

                  {/* Expanded Details */}
                  {isExpanded && (
                    <div className="mt-4 pt-4 border-t border-white/10 pl-14">
                      <div className="grid md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-gray-500 mb-1">Stream ID</p>
                          <p className="text-white font-mono">
                        {event.streamId.slice(0, 20)}...
                      </p>
                        </div>
                        <div>
                          <p className="text-gray-500 mb-1">{isIncoming ? 'Sender' : 'Recipient'}</p>
                          <p className="text-white font-mono">
                            {isIncoming ? event.sender : event.recipient}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-500 mb-1">Service ID</p>
                          <p className="text-white">{event.serviceId || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-gray-500 mb-1">Timestamp</p>
                          <p className="text-white">
                            {new Date(event.timestamp * 1000).toLocaleString()}
                          </p>
                        </div>
                      </div>

                      {event.txHash && (
                        <a
                          href={`https://sepolia.basescan.org/tx/${event.txHash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-4 inline-flex items-center gap-2 text-sm text-[var(--color-cta)] hover:underline"
                          onClick={(e) => e.stopPropagation()}
                        >
                          View on Explorer
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="p-2 bg-white/5 border border-white/10 rounded-lg disabled:opacity-50 text-white"
          >
            Previous
          </button>
          <span className="text-gray-400">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="p-2 bg-white/5 border border-white/10 rounded-lg disabled:opacity-50 text-white"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}

function SummaryCard({ label, value, icon: Icon }: { 
  label: string; 
  value: string; 
  icon: React.ElementType;
}) {
  return (
    <div className="bg-white/5 rounded-xl p-4 border border-white/10">
      <div className="flex items-center gap-3 mb-2">
        <Icon className="w-4 h-4 text-gray-500" />
        <p className="text-sm text-gray-400">{label}</p>
      </div>
      <p className="text-2xl font-bold text-white">{value}</p>
    </div>
  );
}

function FilterBadge({ 
  filter, 
  current, 
  onClick, 
  label 
}: { 
  filter: typeof current; 
  current: 'all' | 'incoming' | 'outgoing' | 'created' | 'withdrawn' | 'cancelled'; 
  onClick: (f: typeof current) => void;
  label: string;
}) {
  const isActive = filter === current;
  return (
    <button
      onClick={() => onClick(filter as typeof current)}
      className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
        isActive
          ? 'bg-[var(--color-cta)]/20 text-[var(--color-cta)] border border-[var(--color-cta)]/30'
          : 'bg-white/5 text-gray-400 border border-white/10 hover:border-white/20'
      }`}
    >
      {label}
    </button>
  );
}
