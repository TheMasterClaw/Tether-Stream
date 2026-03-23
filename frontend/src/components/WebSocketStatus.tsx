import { useState, useEffect } from 'react';
import { Wifi, WifiOff, Activity } from 'lucide-react';

interface WebSocketStatusProps {
  isConnected: boolean;
  latency?: number;
}

export function WebSocketStatus({ isConnected, latency }: WebSocketStatusProps) {
  const [pulse, setPulse] = useState(false);

  useEffect(() => {
    if (isConnected) {
      const interval = setInterval(() => {
        setPulse(prev => !prev);
      }, 2000);
      return () => clearInterval(interval);
    }
  }, [isConnected]);

  if (isConnected) {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/30 border border-white/10">
        <div className="relative">
          <Wifi className="w-4 h-4 text-green-400" />
          {pulse && (
            <span className="absolute inset-0 rounded-full bg-green-400/30 animate-ping" />
          )}
        </div>
        <span className="text-xs text-green-400 font-medium">Live</span>
        {latency !== undefined && (
          <span className="text-xs text-gray-500">{latency}ms</span>
        )}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/30 border border-white/10">
      <WifiOff className="w-4 h-4 text-red-400" />
      <span className="text-xs text-red-400 font-medium">Offline</span>
    </div>
  );
}

interface NetworkActivityProps {
  events: Array<{
    id: string;
    type: string;
    timestamp: number;
  }>;
}

export function NetworkActivity({ events }: NetworkActivityProps) {
  const [activityLevel, setActivityLevel] = useState(0);

  useEffect(() => {
    const now = Date.now();
    const recentEvents = events.filter(e => now - e.timestamp < 10000);
    setActivityLevel(Math.min(100, recentEvents.length * 20));
  }, [events]);

  const getActivityColor = () => {
    if (activityLevel === 0) return 'text-gray-500';
    if (activityLevel < 30) return 'text-blue-400';
    if (activityLevel < 60) return 'text-yellow-400';
    return 'text-green-400';
  };

  const getBarColor = () => {
    if (activityLevel === 0) return 'bg-gray-500';
    if (activityLevel < 30) return 'bg-blue-400';
    if (activityLevel < 60) return 'bg-yellow-400';
    return 'bg-green-400';
  };

  return (
    <div className="flex items-center gap-2">
      <Activity className={`w-4 h-4 ${getActivityColor()} ${activityLevel > 0 ? 'animate-pulse' : ''}`} />
      <div className="w-16 h-1.5 bg-black/30 rounded-full overflow-hidden">
        <div 
          className={`h-full rounded-full transition-all duration-500 ${getBarColor()}`}
          style={{ width: `${activityLevel}%` }}
        />
      </div>
    </div>
  );
}

interface LiveUSDTCounterProps {
  ratePerSecond: bigint;
  isActive: boolean;
}

export function LiveUSDTCounter({ ratePerSecond, isActive }: LiveUSDTCounterProps) {
  const [displayAmount, setDisplayAmount] = useState(0);
  const rate = Number(ratePerSecond) / 1e6;

  useEffect(() => {
    if (!isActive) {
      setDisplayAmount(0);
      return;
    }

    let accumulated = 0;
    const interval = setInterval(() => {
      accumulated += rate / 10;
      setDisplayAmount(accumulated);
    }, 100);

    return () => clearInterval(interval);
  }, [rate, isActive]);

  if (!isActive) return null;

  return (
    <span className="inline-flex items-center gap-1 text-green-400 font-mono">
      <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
      +{displayAmount.toFixed(6)} USDT
    </span>
  );
}