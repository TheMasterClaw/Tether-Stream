import { useState, useEffect } from 'react';
import { useAccount, useBalance, useReadContract, useWriteContract } from 'wagmi';
import { parseUnits, formatUnits } from 'viem';
import { useSearchParams, Link } from 'react-router-dom';
import { USDT_ABI, PAYMENT_STREAM_ABI } from '../utils/contracts';
import { 
  Zap, 
  AlertCircle, 
  CheckCircle, 
  AlertTriangle,
  Loader2,
  Wallet,
  Clock,
  Tag,
  Sparkles
} from 'lucide-react';

const PAYMENT_STREAM_ADDRESS = (import.meta.env.VITE_PAYMENT_STREAM_ADDRESS || '0xDE900020CEA3F4ca1223a553D66179DF43f14Aa5') as `0x${string}`;
const USDT_ADDRESS = (import.meta.env.VITE_USDT_ADDRESS || '0x068e3C17A5C68906E42E0F28d281D8B8b1E48f8B') as `0x${string}`;

export function StreamManager() {
  const { address, isConnected } = useAccount();
  const [searchParams] = useSearchParams();
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState(searchParams.get('amount') || '');
  const [duration, setDuration] = useState(searchParams.get('duration') || '3600');
  const [serviceId, setServiceId] = useState(searchParams.get('serviceId') || '');
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const { data: allowance } = useReadContract({
    address: USDT_ADDRESS,
    abi: USDT_ABI,
    functionName: 'allowance',
    args: [address, PAYMENT_STREAM_ADDRESS],
    query: { enabled: isConnected },
  });

  const { data: usdtBalance, refetch: refetchBalance } = useBalance({
    address,
    token: USDT_ADDRESS,
    query: { enabled: isConnected },
  });

  const { writeContractAsync: approveUSDT, isPending: isApproving } = useWriteContract();
  const { writeContractAsync: createStream, isPending: isCreating } = useWriteContract();

  // Clear messages after 5 seconds
  useEffect(() => {
    if (successMessage || error) {
      const timer = setTimeout(() => {
        setSuccessMessage(null);
        setError(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [successMessage, error]);

  const handleApprove = async () => {
    if (!amount) {
      setError('Please enter an amount');
      return;
    }
    
    setError(null);
    setSuccessMessage(null);
    
    try {
      const amountWei = parseUnits(amount, 6);
      await approveUSDT({
        address: USDT_ADDRESS,
        abi: USDT_ABI,
        functionName: 'approve',
        args: [PAYMENT_STREAM_ADDRESS, amountWei],
      });
      setSuccessMessage('USDT approved successfully!');
      refetchBalance();
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Approval failed';
      setError(errorMessage);
    }
  };

  const handleCreateStream = async () => {
    if (!recipient) {
      setError('Please enter a recipient address');
      return;
    }
    if (!amount) {
      setError('Please enter an amount');
      return;
    }
    if (!duration) {
      setError('Please select a duration');
      return;
    }

    // Validate recipient address
    if (!recipient.startsWith('0x') || recipient.length !== 42) {
      setError('Invalid recipient address format');
      return;
    }

    setError(null);
    setSuccessMessage(null);

    try {
      const amountWei = parseUnits(amount, 6);
      await createStream({
        address: PAYMENT_STREAM_ADDRESS,
        abi: PAYMENT_STREAM_ABI,
        functionName: 'createStream',
        args: [recipient as `0x${string}`, amountWei, BigInt(duration), serviceId || 'custom-service'],
      });
      setSuccessMessage('Stream created successfully!');
      setRecipient('');
      setAmount('');
      setServiceId('');
      refetchBalance();
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Stream creation failed';
      setError(errorMessage);
    }
  };

  const needsApproval = allowance !== undefined && amount 
    ? (allowance as bigint) < parseUnits(amount, 6)
    : true;

  const templateId = searchParams.get('template');
  const templateNames: Record<string, string> = {
    'ai-agent': 'AI Agent Service',
    'gpu-compute': 'GPU Compute',
    'content-streaming': 'Content Access',
    'cloud-storage': 'Cloud Storage',
    'data-api': 'Data API Access',
    'custom': 'Custom Stream'
  };

  const durationOptions = [
    { value: '300', label: '5 minutes' },
    { value: '900', label: '15 minutes' },
    { value: '1800', label: '30 minutes' },
    { value: '3600', label: '1 hour' },
    { value: '7200', label: '2 hours' },
    { value: '86400', label: '1 day' },
    { value: '604800', label: '1 week' },
  ];

  if (!isConnected) {
    return (
      <div className="text-center py-20">
        <div className="w-24 h-24 mx-auto rounded-2xl bg-gradient-to-br from-[var(--color-primary)]/20 to-[var(--color-secondary)]/20 flex items-center justify-center mb-6">
          <Zap className="w-12 h-12 text-[var(--color-primary)]" />
        </div>
        <h2 className="text-3xl font-bold mb-4 text-white" style={{ fontFamily: 'var(--font-heading)' }}>Create Payment Stream</h2>
        <p className="text-gray-400 max-w-md mx-auto">
          Connect your wallet to start streaming USDT payments to AI agents
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-8">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center">
            <Zap className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white" style={{ fontFamily: 'var(--font-heading)' }}>Create Stream</h2>
            <p className="text-gray-400">Stream USDT to an AI agent or service</p>
          </div>
        </div>

        {templateId && (
          <div className="mb-6 p-4 bg-purple-500/20 border border-purple-500/30 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Sparkles className="w-5 h-5 text-purple-400" />
              <div>
                <p className="text-sm text-purple-400">Using Template</p>
                <p className="font-medium text-white">{templateNames[templateId] || 'Custom Template'}</p>
              </div>
            </div>
            <Link
              to="/app/templates"
              className="text-sm text-purple-400 hover:text-purple-300"
            >
              Change Template →
            </Link>
          </div>
        )}

        {/* Error/Success Messages */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/20 border border-red-500/30 rounded-xl text-red-400 flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            {error}
          </div>
        )}
        {successMessage && (
          <div className="mb-6 p-4 bg-green-500/20 border border-green-500/30 rounded-xl text-green-400 flex items-center gap-2">
            <CheckCircle className="w-5 h-5" />
            {successMessage}
          </div>
        )}

        <div className="space-y-6">
          {/* Recipient */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Recipient Address *
            </label>
            <input
              type="text"
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              placeholder="0x..."
              className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-[var(--color-primary)]/50 transition-colors"
            />
          </div>

          {/* Amount */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Total Amount (USDT) *
            </label>
            <div className="relative">
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="1000"
                min="0"
                step="0.01"
                className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-[var(--color-primary)]/50 transition-colors"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">USDT</span>
            </div>            
            <div className="flex items-center gap-2 mt-2">
              <Wallet className="w-4 h-4 text-gray-500" />
              <p className="text-sm text-gray-500">
                Balance: {usdtBalance ? formatUnits(usdtBalance.value, 6) : '0'} USDT
              </p>
            </div>
          </div>

          {/* Duration */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Stream Duration *
            </label>
            <div className="relative">
              <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <select
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                className="w-full bg-black/20 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-white focus:outline-none focus:border-[var(--color-primary)]/50 transition-colors appearance-none"
              >
                {durationOptions.map((opt) => (
                  <option key={opt.value} value={opt.value} className="bg-slate-900">
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Service ID */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Service ID (optional)
            </label>
            <div className="relative">
              <Tag className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input
                type="text"
                value={serviceId}
                onChange={(e) => setServiceId(e.target.value)}
                placeholder="e.g., ai-inference-v1"
                className="w-full bg-black/20 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-[var(--color-primary)]/50 transition-colors"
              />
            </div>
          </div>

          {/* Summary */}
          {amount && duration && (
            <div className="bg-[var(--color-primary)]/10 border border-[var(--color-primary)]/20 rounded-xl p-4">
              <h4 className="text-sm font-medium text-[var(--color-primary)] mb-2">Stream Summary</h4>
              <div className="space-y-1 text-sm">
                <p className="text-gray-300">
                  Rate: {(parseFloat(amount) / parseInt(duration)).toFixed(6)} USDT/sec
                </p>
                <p className="text-gray-300">
                  Total: {amount} USDT over {durationOptions.find(o => o.value === duration)?.label}
                </p>
                <p className="text-gray-300">
                  Platform Fee (0.25%): {(parseFloat(amount) * 0.0025).toFixed(4)} USDT
                </p>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <button
              onClick={handleApprove}
              disabled={!amount || isApproving}
              className="flex-1 bg-white/10 hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-3 px-6 rounded-xl transition-colors cursor-pointer"
            >
              {isApproving ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Approving...
                </span>
              ) : (
                '1. Approve USDT'
              )}
            </button>
            <button
              onClick={handleCreateStream}
              disabled={!recipient || !amount || !duration || isCreating || (needsApproval && amount !== '')}
              className="flex-1 gradient-cta hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-3 px-6 rounded-xl transition-all cursor-pointer"
            >
              {isCreating ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Creating...
                </span>
              ) : (
                '2. Create Stream'
              )}
            </button>
          </div>

          {needsApproval && amount && (
            <p className="text-sm text-amber-400 text-center flex items-center justify-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              Please approve USDT spending first
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
