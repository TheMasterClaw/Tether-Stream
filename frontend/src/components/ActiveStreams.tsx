import { useState, useEffect, useCallback } from 'react';
import { useAccount, useWriteContract, useReadContract, usePublicClient } from 'wagmi';
import { formatUnits } from 'viem';
import { PAYMENT_STREAM_ABI } from '../utils/contracts';
import { 
  Zap, 
  ArrowDownRight, 
  ArrowUpRight, 
  CheckCircle, 
  AlertCircle,
  Loader2,
  Filter,
  Clock,
  RefreshCw
} from 'lucide-react';

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

export function ActiveStreams() {
  const { address, isConnected } = useAccount();
  const publicClient = usePublicClient();
  const [filter, setFilter] = useState('all');
  const [currentTime, setCurrentTime] = useState(Math.floor(Date.now() / 1000));
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [streams, setStreams] = useState<Stream[]>([]);

  // Update current time every second for live progress
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(Math.floor(Date.now() / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Fetch sender streams
  const { data: senderStreamIds, refetch: refetchSender } = useReadContract({
    address: PAYMENT_STREAM_ADDRESS,
    abi: PAYMENT_STREAM_ABI,
    functionName: 'getSenderStreams',
    args: [address],
    query: { enabled: isConnected && !!address },
  });

  // Fetch recipient streams
  const { data: recipientStreamIds, refetch: refetchRecipient } = useReadContract({
    address: PAYMENT_STREAM_ADDRESS,
    abi: PAYMENT_STREAM_ABI,
    functionName: 'getRecipientStreams',
    args: [address],
    query: { enabled: isConnected && !!address },
  });

  // Fetch stream details from contract
  const fetchStreamDetails = useCallback(async () => {
    if (!publicClient || !isConnected) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const allStreamIds = [
        ...((senderStreamIds as string[]) || []),
        ...((recipientStreamIds as string[]) || []),
      ];

      // Remove duplicates
      const uniqueStreamIds = [...new Set(allStreamIds)];

      if (uniqueStreamIds.length === 0) {
        setStreams([]);
        setIsLoading(false);
        return;
      }

      // Fetch details for each stream from the contract
      const streamDetails = await Promise.all(
        uniqueStreamIds.map(async (streamId) => {
          try {
            const streamData = await publicClient.readContract({
              address: PAYMENT_STREAM_ADDRESS,
              abi: PAYMENT_STREAM_ABI,
              functionName: 'getStream',
              args: [streamId as `0x${string}`],
            }) as {
              sender: string;
              recipient: string;
              depositAmount: bigint;
              withdrawnAmount: bigint;
              startTime: bigint;
              endTime: bigint;
              ratePerSecond: bigint;
              isActive: boolean;
              serviceId: string;
            };

            return {
              streamId,
              ...streamData,
            };
          } catch (err) {
            console.error(`Failed to fetch stream ${streamId}:`, err);
            return null;
          }
        })
      );

      const validStreams = streamDetails.filter((s): s is Stream => s !== null);
      setStreams(validStreams);
    } catch (err) {
      console.error('Failed to load streams:', err);
      setError('Failed to load streams. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [publicClient, senderStreamIds, recipientStreamIds, isConnected]);

  // Fetch stream details when stream IDs change
  useEffect(() => {
    fetchStreamDetails();
  }, [fetchStreamDetails]);

  const { writeContractAsync: withdrawStream, isPending: isWithdrawing } = useWriteContract();
  const { writeContractAsync: cancelStream, isPending: isCancelling } = useWriteContract();

  const handleWithdraw = async (streamId: string) => {
    try {
      setError(null);
      setSuccessMessage(null);
      
      await withdrawStream({
        address: PAYMENT_STREAM_ADDRESS,
        abi: PAYMENT_STREAM_ABI,
        functionName: 'withdraw',
        args: [streamId as `0x${string}`],
      });
      
      setSuccessMessage('Withdrawal successful! Funds have been transferred to your wallet.');
      setTimeout(() => setSuccessMessage(null), 5000);
      refetchSender();
      refetchRecipient();
      // Refresh stream details after withdrawal
      setTimeout(fetchStreamDetails, 2000);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Withdrawal failed';
      setError(errorMessage);
    }
  };

  const handleCancel = async (streamId: string) => {
    try {
      setError(null);
      setSuccessMessage(null);
      
      await cancelStream({
        address: PAYMENT_STREAM_ADDRESS,
        abi: PAYMENT_STREAM_ABI,
        functionName: 'cancelStream',
        args: [streamId as `0x${string}`],
      });
      
      setSuccessMessage('Stream cancelled successfully! Unspent funds have been returned.');
      setTimeout(() => setSuccessMessage(null), 5000);
      refetchSender();
      refetchRecipient();
      // Refresh stream details after cancellation
      setTimeout(fetchStreamDetails, 2000);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Cancellation failed';
      setError(errorMessage);
    }
  };

  const calculateProgress = (stream: Stream) => {
    const total = Number(stream.endTime - stream.startTime);
    if (total === 0) return 0;
    const elapsed = Math.min(currentTime - Number(stream.startTime), total);
    return Math.min((elapsed / total) * 100, 100);
  };

  const calculateAvailable = (stream: Stream) => {
    if (!stream.isActive) return 0n;
    const currentTimeBig = BigInt(currentTime);
    const effectiveTime = currentTimeBig > stream.endTime ? stream.endTime : currentTimeBig;
    if (effectiveTime <= stream.startTime) return 0n;
    const elapsed = effectiveTime - stream.startTime;
    const totalAvailable = elapsed * stream.ratePerSecond;
    const cappedAvailable = totalAvailable > stream.depositAmount ? stream.depositAmount : totalAvailable;
    return cappedAvailable - stream.withdrawnAmount;
  };

  const filteredStreams = streams.filter((stream) => {
    if (filter === 'all') return true;
    if (filter === 'active') return stream.isActive;
    if (filter === 'completed') return !stream.isActive;
    if (filter === 'incoming') return stream.recipient.toLowerCase() === address?.toLowerCase();
    if (filter === 'outgoing') return stream.sender.toLowerCase() === address?.toLowerCase();
    return true;
  });

  if (!isConnected) {
    return (
      <div className="text-center py-20">
        <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-[var(--color-primary)]/20 to-[var(--color-secondary)]/20 flex items-center justify-center mb-6">
          <Zap className="w-10 h-10 text-[var(--color-primary)]" />
        </div>
        <h2 className="text-2xl font-bold mb-2 text-white" style={{ fontFamily: 'var(--font-heading)' }}>Connect Your Wallet</h2>
        <p className="text-gray-400 max-w-md mx-auto">
          Connect your wallet to view and manage your USDT payment streams
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white" style={{ fontFamily: 'var(--font-heading)' }}>Active Streams</h1>
          <p className="text-gray-400">Monitor and manage your USDT payment streams</p>
        </div>
        
        <div className="flex items-center gap-3">
          <button
            onClick={fetchStreamDetails}
            disabled={isLoading}
            className="p-2 bg-black/30 border border-white/10 rounded-xl text-gray-400 hover:text-white hover:border-white/20 transition-all disabled:opacity-50"
            title="Refresh streams"
          >
            <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
          
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="pl-10 pr-8 py-2 bg-black/30 border border-white/10 rounded-xl text-white focus:outline-none focus:border-[var(--color-primary)]/50 appearance-none cursor-pointer"
            >
              <option value="all" className="bg-slate-800">All Streams</option>
              <option value="active" className="bg-slate-800">Active Only</option>
              <option value="completed" className="bg-slate-800">Completed</option>
              <option value="incoming" className="bg-slate-800">Incoming</option>
              <option value="outgoing" className="bg-slate-800">Outgoing</option>
            </select>
          </div>
        </div>
      </div>

      {/* Success/Error Messages */}
      {successMessage && (
        <div className="p-4 bg-green-500/20 border border-green-500/30 rounded-xl text-green-400 flex items-center gap-2 animate-fade-in">
          <CheckCircle className="w-5 h-5" />
          {successMessage}
        </div>
      )}
      {error && (
        <div className="p-4 bg-red-500/20 border border-red-500/30 rounded-xl text-red-400 flex items-center gap-2 animate-fade-in">
          <AlertCircle className="w-5 h-5" />
          {error}
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="text-center py-12">
          <Loader2 className="w-12 h-12 mx-auto text-[var(--color-primary)] animate-spin mb-4" />
          <p className="text-gray-400">Loading streams from blockchain...</p>
        </div>
      )}

      {/* Streams Grid */}
      {!isLoading && (
        <div className="grid gap-4">
          {filteredStreams.map((stream) => {
            const progress = calculateProgress(stream);
            const available = calculateAvailable(stream);
            const isIncoming = stream.recipient.toLowerCase() === address?.toLowerCase();
            const isOutgoing = stream.sender.toLowerCase() === address?.toLowerCase();

            return (
              <div
                key={stream.streamId}
                className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 hover:border-[var(--color-primary)]/30 transition-all hover:shadow-lg hover:shadow-[var(--color-primary)]/5"
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-4">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                      isIncoming ? 'bg-green-500/20 text-green-400' : 'bg-[var(--color-primary)]/20 text-[var(--color-primary)]'
                    }`}>
                      {isIncoming ? <ArrowDownRight className="w-6 h-6" /> : <ArrowUpRight className="w-6 h-6" />}
                    </div>
                    <div>
                      <h3 className="font-semibold text-white">
                        {stream.serviceId || 'Custom Stream'}
                      </h3>
                      <p className="text-sm text-gray-400">
                        {isIncoming ? 'From' : 'To'} {' '}
                        <span className="font-mono">
                          {isIncoming 
                            ? `${stream.sender.slice(0, 6)}...${stream.sender.slice(-4)}`
                            : `${stream.recipient.slice(0, 6)}...${stream.recipient.slice(-4)}`
                          }
                        </span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <p className="text-sm text-gray-400">Total</p>
                      <p className="font-semibold text-white">
                        {formatUnits(stream.depositAmount, 6)} USDT
                      </p>
                    </div>
                    
                    <div className="text-right">
                      <p className="text-sm text-gray-400">Rate</p>
                      <p className="font-semibold text-white">
                        {formatUnits(stream.ratePerSecond * 3600n, 6)} USDT/hr
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="text-sm text-gray-400">Status</p>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        stream.isActive 
                          ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                          : 'bg-gray-500/20 text-gray-400 border border-gray-500/30'
                      }`}>
                        {stream.isActive ? 'Active' : 'Completed'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mb-4">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-400">
                      {new Date(Number(stream.startTime) * 1000).toLocaleDateString()} - {new Date(Number(stream.endTime) * 1000).toLocaleDateString()}
                    </span>
                    <span className="text-[var(--color-cta)] font-medium">{progress.toFixed(1)}%</span>
                  </div>
                  <div className="h-3 bg-black/30 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-cta)] rounded-full transition-all duration-1000"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-6">
                    <div>
                      <p className="text-sm text-gray-400">Withdrawn</p>
                      <p className="font-medium text-white">{formatUnits(stream.withdrawnAmount, 6)} USDT</p>
                    </div>
                    {stream.isActive && (
                      <div>
                        <p className="text-sm text-gray-400">Available</p>
                        <p className="font-medium text-[var(--color-cta)]">
                          {formatUnits(available, 6)} USDT
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2">
                    {stream.isActive && isIncoming && available > 0n && (
                      <button
                        onClick={() => handleWithdraw(stream.streamId)}
                        disabled={isWithdrawing}
                        className="px-4 py-2 gradient-cta rounded-lg font-medium text-white hover:shadow-lg hover:shadow-orange-500/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                      >
                        {isWithdrawing ? (
                          <span className="flex items-center gap-2">
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Withdrawing...
                          </span>
                        ) : (
                          'Withdraw'
                        )}
                      </button>
                    )}
                    {stream.isActive && isOutgoing && (
                      <button
                        onClick={() => handleCancel(stream.streamId)}
                        disabled={isCancelling}
                        className="px-4 py-2 bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg font-medium hover:bg-red-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                      >
                        {isCancelling ? (
                          <span className="flex items-center gap-2">
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Cancelling...
                          </span>
                        ) : (
                          'Cancel Stream'
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && filteredStreams.length === 0 && (
        <div className="text-center py-16 bg-white/5 rounded-2xl border border-white/10">
          <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-[var(--color-primary)]/10 to-[var(--color-secondary)]/10 flex items-center justify-center mb-6">
            <Clock className="w-10 h-10 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold mb-3 text-white">No Streams Found</h3>
          <p className="text-gray-400 mb-8 max-w-md mx-auto">
            {filter === 'all' 
              ? "You don't have any payment streams yet. Create your first stream to get started."
              : "No streams match the selected filter. Try a different view or create a new stream."
            }
          </p>
          <a
            href="#/app/create"
            className="inline-flex items-center gap-2 px-8 py-4 gradient-cta rounded-xl font-semibold text-white hover:shadow-lg hover:shadow-orange-500/25 transition-all"
          >
            <Zap className="w-5 h-5" />
            Create Your First Stream
          </a>
        </div>
      )}
    </div>
  );
}
