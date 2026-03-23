import { useState, useEffect, useCallback, useRef } from 'react';
import { useAccount, useReadContract, usePublicClient } from 'wagmi';
import { formatUnits } from 'viem';
import { PAYMENT_STREAM_ABI } from '../utils/contracts';
import { 
  Droplets, 
  Zap, 
  Activity,
  Clock,
  Pause,
  Play,
  Settings
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

export function LiveStreamVisualization() {
  const { address, isConnected } = useAccount();
  const publicClient = usePublicClient();
  const [streams, setStreams] = useState<Stream[]>([]);
  const [isSimulating, setIsSimulating] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [simulationSpeed, setSimulationSpeed] = useState(1);
  const [totalFlowed, setTotalFlowed] = useState(0);
  const animationRef = useRef<number>();
  const lastUpdateRef = useRef(Date.now());
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Fetch streams
  const { data: senderStreamIds } = useReadContract({
    address: PAYMENT_STREAM_ADDRESS,
    abi: PAYMENT_STREAM_ABI,
    functionName: 'getSenderStreams',
    args: [address],
    query: { enabled: isConnected && !!address },
  });

  const { data: recipientStreamIds } = useReadContract({
    address: PAYMENT_STREAM_ADDRESS,
    abi: PAYMENT_STREAM_ABI,
    functionName: 'getRecipientStreams',
    args: [address],
    query: { enabled: isConnected && !!address },
  });

  const fetchStreams = useCallback(async () => {
    if (!publicClient || !isConnected) return;

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

    setStreams(details.filter((s): s is Stream => s !== null && s.isActive));
  }, [publicClient, senderStreamIds, recipientStreamIds, isConnected]);

  useEffect(() => {
    fetchStreams();
    const interval = setInterval(fetchStreams, 30000);
    return () => clearInterval(interval);
  }, [fetchStreams]);

  // Canvas animation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width = canvas.offsetWidth * 2;
      canvas.height = canvas.offsetHeight * 2;
      ctx.scale(2, 2);
    };
    resize();
    window.addEventListener('resize', resize);

    const animate = () => {
      const now = Date.now();
      const deltaTime = (now - lastUpdateRef.current) / 1000;
      lastUpdateRef.current = now;

      ctx.clearRect(0, 0, canvas.width / 2, canvas.height / 2);

      // Draw streams as flowing pipes
      const activeStreams = streams.filter(s => s.isActive);
      const streamHeight = canvas.offsetHeight / Math.max(activeStreams.length, 1);

      activeStreams.forEach((stream, index) => {
        const y = index * streamHeight + streamHeight / 2;
        const isIncoming = stream.recipient.toLowerCase() === address?.toLowerCase();
        
        // Draw pipe
        const gradient = ctx.createLinearGradient(0, y - 20, canvas.offsetWidth, y + 20);
        if (isIncoming) {
          gradient.addColorStop(0, 'rgba(34, 197, 94, 0.3)');
          gradient.addColorStop(0.5, 'rgba(34, 197, 94, 0.5)');
          gradient.addColorStop(1, 'rgba(34, 197, 94, 0.3)');
        } else {
          gradient.addColorStop(0, 'rgba(239, 68, 68, 0.3)');
          gradient.addColorStop(0.5, 'rgba(239, 68, 68, 0.5)');
          gradient.addColorStop(1, 'rgba(239, 68, 68, 0.3)');
        }

        ctx.fillStyle = gradient;
        ctx.fillRect(0, y - 15, canvas.offsetWidth, 30);

        // Draw flowing particles
        const ratePerSecond = Number(formatUnits(stream.ratePerSecond, 6));
        const particleCount = Math.max(1, Math.floor(ratePerSecond * 10));
        
        for (let i = 0; i < particleCount; i++) {
          const progress = ((now / 1000 * simulationSpeed) + (i / particleCount)) % 1;
          const x = progress * canvas.offsetWidth;
          const particleY = y + Math.sin(progress * Math.PI * 4 + index) * 8;

          // Glow effect
          const glowGradient = ctx.createRadialGradient(x, particleY, 0, x, particleY, 8);
          if (isIncoming) {
            glowGradient.addColorStop(0, 'rgba(34, 197, 94, 1)');
            glowGradient.addColorStop(0.5, 'rgba(34, 197, 94, 0.5)');
            glowGradient.addColorStop(1, 'rgba(34, 197, 94, 0)');
          } else {
            glowGradient.addColorStop(0, 'rgba(239, 68, 68, 1)');
            glowGradient.addColorStop(0.5, 'rgba(239, 68, 68, 0.5)');
            glowGradient.addColorStop(1, 'rgba(239, 68, 68, 0)');
          }

          ctx.fillStyle = glowGradient;
          ctx.beginPath();
          ctx.arc(x, particleY, 8, 0, Math.PI * 2);
          ctx.fill();

          // Core particle
          ctx.fillStyle = isIncoming ? '#22c55e' : '#ef4444';
          ctx.beginPath();
          ctx.arc(x, particleY, 3, 0, Math.PI * 2);
          ctx.fill();
        }

        // Labels
        ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        ctx.font = '12px sans-serif';
        ctx.fillText(
          `${stream.serviceId || 'Stream'}`,
          10,
          y - 20
        );
        ctx.fillText(
          `${ratePerSecond.toFixed(6)} USDT/s`,
          canvas.offsetWidth - 100,
          y - 20
        );
      });

      // Update total flowed
      if (isSimulating) {
        const totalRate = activeStreams.reduce((sum, s) => sum + Number(formatUnits(s.ratePerSecond, 6)), 0);
        setTotalFlowed(prev => prev + totalRate * deltaTime * simulationSpeed);
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resize);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [streams, address, simulationSpeed, isSimulating]);

  if (!isConnected) {
    return (
      <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-8 text-center">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 flex items-center justify-center mb-4">
          <Activity className="w-8 h-8 text-blue-400" />
        </div>
        <h3 className="text-lg font-semibold text-white mb-2">Live Stream Visualization</h3>
        <p className="text-gray-400 text-sm">Connect wallet to see your payment flows in action</p>
      </div>
    );
  }

  const activeStreams = streams.filter(s => s.isActive);
  const totalIncoming = activeStreams
    .filter(s => s.recipient.toLowerCase() === address?.toLowerCase())
    .reduce((sum, s) => sum + Number(formatUnits(s.ratePerSecond, 6)), 0);
  const totalOutgoing = activeStreams
    .filter(s => s.sender.toLowerCase() === address?.toLowerCase())
    .reduce((sum, s) => sum + Number(formatUnits(s.ratePerSecond, 6)), 0);

  return (
    <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 flex items-center justify-center">
            <Droplets className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">Live Payment Flows</h3>
            <p className="text-sm text-gray-400">Real-time USDT micropayment visualization</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsSimulating(!isSimulating)}
            className="p-2 bg-black/30 border border-white/10 rounded-lg text-gray-400 hover:text-white transition-all"
          >
            {isSimulating ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </button>
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="p-2 bg-black/30 border border-white/10 rounded-lg text-gray-400 hover:text-white transition-all"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-3 gap-4 p-4 bg-black/20">
        <div className="text-center">
          <p className="text-xs text-gray-500 mb-1">Incoming</p>
          <p className="text-lg font-semibold text-green-400">{totalIncoming.toFixed(6)} USDT/s</p>
        </div>
        <div className="text-center border-x border-white/10">
          <p className="text-xs text-gray-500 mb-1">Outgoing</p>
          <p className="text-lg font-semibold text-red-400">{totalOutgoing.toFixed(6)} USDT/s</p>
        </div>
        <div className="text-center">
          <p className="text-xs text-gray-500 mb-1">Total Flowed</p>
          <p className="text-lg font-semibold text-blue-400">{totalFlowed.toFixed(4)} USDT</p>
        </div>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div className="p-4 bg-black/30 border-b border-white/10">
          <div className="flex items-center justify-between">
            <label className="text-sm text-gray-400">Simulation Speed</label>
            <div className="flex items-center gap-3">
              <span className="text-xs text-gray-500">1x</span>
              <input
                type="range"
                min="0.1"
                max="5"
                step="0.1"
                value={simulationSpeed}
                onChange={(e) => setSimulationSpeed(parseFloat(e.target.value))}
                className="w-32"
              />
              <span className="text-xs text-gray-500">5x</span>
              <span className="text-sm text-white ml-2">{simulationSpeed.toFixed(1)}x</span>
            </div>
          </div>
        </div>
      )}

      {/* Visualization Canvas */}
      <div className="relative" style={{ height: `${Math.max(200, activeStreams.length * 60)}px` }}>
        {activeStreams.length === 0 ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto rounded-full bg-white/5 flex items-center justify-center mb-4">
                <Zap className="w-8 h-8 text-gray-500" />
              </div>
              <p className="text-gray-400 mb-2">No active streams</p>
              <p className="text-sm text-gray-500">Create a stream to see the visualization</p>
            </div>
          </div>
        ) : (
          <canvas
            ref={canvasRef}
            className="absolute inset-0 w-full h-full"
            style={{ width: '100%', height: '100%' }}
          />
        )}
      </div>

      {/* Stream List */}
      {activeStreams.length > 0 && (
        <div className="border-t border-white/10 max-h-48 overflow-y-auto">
          {activeStreams.map((stream) => {
            const isIncoming = stream.recipient.toLowerCase() === address?.toLowerCase();
            const progress = ((Date.now() / 1000 - Number(stream.startTime)) / Number(stream.endTime - stream.startTime)) * 100;
            
            return (
              <div
                key={stream.streamId}
                className="flex items-center justify-between p-4 border-b border-white/5 hover:bg-white/5 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${isIncoming ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`} />
                  <div>
                    <p className="text-sm font-medium text-white">{stream.serviceId || 'Custom Stream'}</p>
                    <p className="text-xs text-gray-500">
                      {isIncoming ? 'Receiving from' : 'Sending to'} {' '}
                      {isIncoming 
                        ? `${stream.sender.slice(0, 6)}...${stream.sender.slice(-4)}`
                        : `${stream.recipient.slice(0, 6)}...${stream.recipient.slice(-4)}`
                      }
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`text-sm font-medium ${isIncoming ? 'text-green-400' : 'text-red-400'}`}>
                    {isIncoming ? '+' : '-'}{Number(formatUnits(stream.ratePerSecond, 6)).toFixed(6)} USDT/s
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <Clock className="w-3 h-3 text-gray-500" />
                    <div className="w-20 h-1 bg-black/30 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-400 rounded-full transition-all"
                        style={{ width: `${Math.min(progress, 100)}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
