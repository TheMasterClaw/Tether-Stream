import { useState, useEffect } from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Zap,
  Monitor,
  Cpu,
  Bot,
  TrendingUp,
  Clock,
  Wallet,
  ArrowRight,
  Sparkles,
  Info,
  ExternalLink
} from 'lucide-react';
import { Link } from 'react-router-dom';

interface DemoStream {
  id: string;
  name: string;
  icon: React.ElementType;
  iconColor: string;
  ratePerSecond: number;
  duration: number;
  recipient: string;
  isActive: boolean;
  progress: number;
  totalFlowed: number;
  startTime: number;
}

const initialDemoStreams: DemoStream[] = [
  {
    id: 'demo-ai',
    name: 'AI GPT-4 Inference',
    icon: Bot,
    iconColor: 'text-teal-400',
    ratePerSecond: 0.0001,
    duration: 3600,
    recipient: '0xAI...4F21',
    isActive: true,
    progress: 0,
    totalFlowed: 0,
    startTime: Date.now()
  },
  {
    id: 'demo-gpu',
    name: 'GPU Compute (A100)',
    icon: Cpu,
    iconColor: 'text-cyan-400',
    ratePerSecond: 0.0003,
    duration: 7200,
    recipient: '0xGPU...8B12',
    isActive: true,
    progress: 0,
    totalFlowed: 0,
    startTime: Date.now()
  },
  {
    id: 'demo-stream',
    name: 'Premium Content',
    icon: Monitor,
    iconColor: 'text-red-400',
    ratePerSecond: 0.00005,
    duration: 1800,
    recipient: '0xContent...3A9E',
    isActive: false,
    progress: 0,
    totalFlowed: 0,
    startTime: Date.now()
  }
];

export function DemoMode() {
  const [streams, setStreams] = useState<DemoStream[]>(initialDemoStreams);
  const [isRunning, setIsRunning] = useState(true);
  const [simulationSpeed, setSimulationSpeed] = useState(100); // 100x speed for demo
  const [showInfo, setShowInfo] = useState(true);
  const [totalFlowedAll, setTotalFlowedAll] = useState(0);

  // Simulation loop
  useEffect(() => {
    if (!isRunning) return;

    const interval = setInterval(() => {
      setStreams(prevStreams => {
        return prevStreams.map(stream => {
          if (!stream.isActive) return stream;

          const elapsed = (Date.now() - stream.startTime) / 1000 * simulationSpeed;
          const progress = Math.min((elapsed / stream.duration) * 100, 100);
          const flowed = stream.ratePerSecond * Math.min(elapsed, stream.duration);

          return {
            ...stream,
            progress,
            totalFlowed: flowed,
            isActive: progress < 100
          };
        });
      });
    }, 50);

    return () => clearInterval(interval);
  }, [isRunning, simulationSpeed]);

  // Calculate total
  useEffect(() => {
    const total = streams.reduce((sum, s) => sum + s.totalFlowed, 0);
    setTotalFlowedAll(total);
  }, [streams]);

  const toggleStream = (id: string) => {
    setStreams(prev => prev.map(s => 
      s.id === id ? { ...s, isActive: !s.isActive } : s
    ));
  };

  const resetDemo = () => {
    setStreams(initialDemoStreams.map(s => ({
      ...s,
      progress: 0,
      totalFlowed: 0,
      startTime: Date.now(),
      isActive: s.id !== 'demo-stream' // Keep one inactive for variety
    })));
    setTotalFlowedAll(0);
  };

  const formatCurrency = (value: number) => {
    if (value >= 1) return `$${value.toFixed(2)}`;
    if (value >= 0.01) return `$${value.toFixed(4)}`;
    return `$${value.toFixed(6)}`;
  };

  const formatRate = (rate: number) => {
    const perHour = rate * 3600;
    if (perHour >= 1) return `$${perHour.toFixed(2)}/hr`;
    return `$${(rate * 60).toFixed(4)}/min`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold text-white" style={{ fontFamily: 'var(--font-heading)' }}>
              Demo Mode
            </h1>
            <span className="px-3 py-1 bg-teal-500/20 text-teal-400 text-sm font-medium rounded-full border border-teal-500/30">
              Simulation
            </span>
          </div>
          <p className="text-gray-400">Experience real-time payment streaming without spending real USDT</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsRunning(!isRunning)}
            className={`px-4 py-2 rounded-xl font-medium flex items-center gap-2 transition-all ${
              isRunning 
                ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/30' 
                : 'bg-green-500/20 text-green-400 hover:bg-green-500/30 border border-green-500/30'
            }`}
          >
            {isRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            {isRunning ? 'Pause' : 'Resume'}
          </button>
          
          <button
            onClick={resetDemo}
            className="px-4 py-2 bg-white/10 text-white rounded-xl font-medium flex items-center gap-2 hover:bg-white/20 transition-all"
          >
            <RotateCcw className="w-4 h-4" />
            Reset
          </button>
        </div>
      </div>

      {/* Info Banner */}
      {showInfo && (
        <div className="p-4 bg-gradient-to-r from-teal-500/10 to-blue-500/10 rounded-2xl border border-teal-500/20">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-teal-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-gray-300 text-sm">
                This is a <strong className="text-white">simulated environment</strong>. 
                No real transactions are occurring. The demo runs at <strong className="text-white">{simulationSpeed}x speed</strong> 
                to demonstrate how payment streaming works in real-time.
              </p>
            </div>
            <button 
              onClick={() => setShowInfo(false)}
              className="text-gray-500 hover:text-white"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Live Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          label="Total Flowed"
          value={formatCurrency(totalFlowedAll)}
          subvalue="Demo USDT"
          icon={TrendingUp}
          color="purple"
          pulse
        />
        <StatCard
          label="Active Streams"
          value={streams.filter(s => s.isActive).length.toString()}
          subvalue={`of ${streams.length} total`}
          icon={Zap}
          color="green"
        />
        <StatCard
          label="Avg Rate"
          value={formatRate(streams.reduce((sum, s) => sum + s.ratePerSecond, 0) / streams.length)}
          subvalue="Combined"
          icon={Clock}
          color="blue"
        />
        <StatCard
          label="Time Saved"
          value={`${Math.floor(totalFlowedAll * 100)} hrs`}
          subvalue="vs monthly billing"
          icon={Wallet}
          color="amber"
        />
      </div>

      {/* Simulation Speed */}
      <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
        <div className="flex items-center justify-between mb-4">
          <label className="text-sm text-gray-400 flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            Simulation Speed
          </label>
          <span className="text-white font-medium">{simulationSpeed}x</span>
        </div>
        <input
          type="range"
          min="1"
          max="1000"
          step="10"
          value={simulationSpeed}
          onChange={(e) => setSimulationSpeed(parseInt(e.target.value))}
          className="w-full h-2 bg-black/30 rounded-full appearance-none cursor-pointer"
          style={{
            background: `linear-gradient(to right, var(--color-primary) 0%, var(--color-cta) ${simulationSpeed / 10}%, rgba(0,0,0,0.3) ${simulationSpeed / 10}%)`
          }}
        />
        <div className="flex justify-between mt-2 text-xs text-gray-500">
          <span>1x (Real-time)</span>
          <span>100x</span>
          <span>1000x (Fast)</span>
        </div>
      </div>

      {/* Demo Streams */}
      <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 overflow-hidden">
        <div className="p-6 border-b border-white/10">
          <h2 className="text-xl font-semibold text-white flex items-center gap-2">
            <Monitor className="w-5 h-5 text-[var(--color-primary)]" />
            Live Streams
          </h2>
        </div>

        <div className="divide-y divide-white/5">
          {streams.map((stream) => {
            const Icon = stream.icon;
            
            return (
              <div
                key={stream.id}
                className="p-6 hover:bg-white/5 transition-colors"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl bg-black/30 flex items-center justify-center`}>
                      <Icon className={`w-6 h-6 ${stream.iconColor}`} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-white">{stream.name}</h3>
                        {stream.isActive && (
                          <span className="px-2 py-0.5 text-xs bg-green-500/20 text-green-400 rounded-full animate-pulse">
                            Live
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500">
                        To: {stream.recipient} • {formatRate(stream.ratePerSecond)}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="text-2xl font-bold text-white">
                      {formatCurrency(stream.totalFlowed)}
                    </p>
                    <button
                      onClick={() => toggleStream(stream.id)}
                      className={`mt-2 text-xs px-3 py-1 rounded-full transition-colors ${
                        stream.isActive
                          ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                          : 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                      }`}
                    >
                      {stream.isActive ? 'Pause' : 'Resume'}
                    </button>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Progress</span>
                    <span className="text-white">{stream.progress.toFixed(1)}%</span>
                  </div>
                  
                  <div className="h-3 bg-black/30 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-100 ${
                        stream.isActive ? 'animate-pulse' : ''
                      }`}
                      style={{
                        width: `${stream.progress}%`,
                        background: `linear-gradient(90deg, var(--color-primary), var(--color-cta))`
                      }}
                    />
                  </div>
                  
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>Started: {new Date(stream.startTime).toLocaleTimeString()}</span>
                    <span>Duration: {(stream.duration / 60).toFixed(0)} min</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Try Real */}
      <div className="p-8 bg-gradient-to-r from-[var(--color-primary)]/20 to-[var(--color-cta)]/20 rounded-2xl border border-[var(--color-primary)]/30 text-center">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-white/10 flex items-center justify-center mb-4">
          <Zap className="w-8 h-8 text-[var(--color-cta)]" />
        </div>
        
        <h2 className="text-2xl font-bold text-white mb-2">Ready to Try Real Streams?</h2>
        <p className="text-gray-300 mb-6 max-w-md mx-auto">
          Create actual USDT payment streams on Base Sepolia testnet. 
          Get free test USDT from the faucet.
        </p>
        
        <div className="flex flex-wrap items-center justify-center gap-4">
          <Link
            to="/app/create"
            className="px-8 py-4 bg-white text-slate-900 rounded-xl font-semibold hover:bg-gray-100 transition-all inline-flex items-center gap-2"
          >
            Create Real Stream
            <ArrowRight className="w-5 h-5" />
          </Link>
          
          <a
            href="https://faucet.circle.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="px-8 py-4 bg-white/10 text-white rounded-xl font-semibold hover:bg-white/20 transition-all inline-flex items-center gap-2"
          >
            Get Test USDT
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </div>
    </div>
  );
}

function StatCard({ 
  label, 
  value, 
  subvalue,
  icon: Icon,
  color,
  pulse
}: { 
  label: string; 
  value: string;
  subvalue: string;
  icon: React.ElementType;
  color: string;
  pulse?: boolean;
}) {
  const colorClasses: Record<string, string> = {
    purple: 'from-teal-500/20 to-pink-500/20 border-teal-500/30',
    green: 'from-green-500/20 to-emerald-500/20 border-green-500/30',
    blue: 'from-blue-500/20 to-cyan-500/20 border-blue-500/30',
    amber: 'from-amber-500/20 to-yellow-500/20 border-amber-500/30',
  };

  return (
    <div className={`bg-gradient-to-br ${colorClasses[color]} rounded-2xl p-5 border`}>
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm text-gray-400">{label}</p>
        <div className={`w-8 h-8 rounded-lg bg-black/30 flex items-center justify-center ${pulse ? 'animate-pulse' : ''}`}>
          <Icon className="w-4 h-4 text-gray-400" />
        </div>
      </div>
      <p className="text-2xl font-bold text-white">{value}</p>
      <p className="text-xs text-gray-500 mt-1">{subvalue}</p>
    </div>
  );
}
