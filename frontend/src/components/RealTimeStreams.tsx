import { useEffect, useRef, useState, useCallback } from 'react';
import { useAccount, useWatchContractEvent } from 'wagmi';
import { PAYMENT_STREAM_ABI, PAYMENT_STREAM_ADDRESS } from '../utils/contracts';
import { formatUnits, Log } from 'viem';
import { useNotifications } from './Notifications';

export interface StreamEvent {
  type: 'created' | 'withdrawn' | 'cancelled' | 'completed';
  streamId: string;
  sender?: string;
  recipient?: string;
  amount?: bigint;
  timestamp: number;
}

interface RealTimeMonitorProps {
  onStreamEvent?: (event: StreamEvent) => void;
  onBalanceUpdate?: (newBalance: bigint) => void;
}

export function useRealTimeStreams({ onStreamEvent, onBalanceUpdate }: RealTimeMonitorProps = {}) {
  const { address, isConnected } = useAccount();
  const { addNotification } = useNotifications();
  const [recentEvents, setRecentEvents] = useState<StreamEvent[]>([]);
  const [liveStreamCount, setLiveStreamCount] = useState(0);
  const eventsRef = useRef<StreamEvent[]>([]);

  useEffect(() => {
    eventsRef.current = recentEvents;
  }, [recentEvents]);

  useWatchContractEvent({
    address: PAYMENT_STREAM_ADDRESS,
    abi: PAYMENT_STREAM_ABI,
    eventName: 'StreamCreated',
    onLogs(logs: Log[]) {
      logs.forEach((log) => {
        const args = (log as any).args;
        if (!args) return;

        const event: StreamEvent = {
          type: 'created',
          streamId: args.streamId as string,
          sender: args.sender as string,
          recipient: args.recipient as string,
          amount: args.amount as bigint,
          timestamp: Number(args.startTime) * 1000,
        };

        setRecentEvents(prev => [event, ...prev].slice(0, 50));

        if (isConnected && address) {
          const isIncoming = event.recipient?.toLowerCase() === address.toLowerCase();
          const isOutgoing = event.sender?.toLowerCase() === address.toLowerCase();

          if (isIncoming && event.amount) {
            addNotification({
              type: 'incoming',
              title: '📥 New Payment Stream!',
              message: `Receiving ${formatUnits(event.amount, 6)} USDT for ${args.serviceId || 'service'}`,
            });
            setLiveStreamCount(prev => prev + 1);
          } else if (isOutgoing && event.amount) {
            addNotification({
              type: 'success',
              title: '✅ Stream Created',
              message: `Streaming ${formatUnits(event.amount, 6)} USDT to ${event.sender?.slice(0, 6)}...${event.sender?.slice(-4)}`,
            });
            setLiveStreamCount(prev => prev + 1);
          }
        }

        onStreamEvent?.(event);
      });
    },
  });

  useWatchContractEvent({
    address: PAYMENT_STREAM_ADDRESS,
    abi: PAYMENT_STREAM_ABI,
    eventName: 'StreamWithdrawn',
    onLogs(logs: Log[]) {
      logs.forEach((log) => {
        const args = (log as any).args;
        if (!args) return;

        const event: StreamEvent = {
          type: 'withdrawn',
          streamId: args.streamId as string,
          recipient: args.recipient as string,
          amount: args.amount as bigint,
          timestamp: Date.now(),
        };

        setRecentEvents(prev => [event, ...prev].slice(0, 50));

        if (isConnected && address && event.recipient?.toLowerCase() === address.toLowerCase() && event.amount) {
          addNotification({
            type: 'success',
            title: '💰 Funds Withdrawn!',
            message: `You received ${formatUnits(event.amount, 6)} USDT`,
          });
        }

        onStreamEvent?.(event);
        if (event.amount) {
          onBalanceUpdate?.(event.amount);
        }
      });
    },
  });

  useWatchContractEvent({
    address: PAYMENT_STREAM_ADDRESS,
    abi: PAYMENT_STREAM_ABI,
    eventName: 'StreamCancelled',
    onLogs(logs: Log[]) {
      logs.forEach((log) => {
        const args = (log as any).args;
        if (!args) return;

        const event: StreamEvent = {
          type: 'cancelled',
          streamId: args.streamId as string,
          sender: args.sender as string,
          amount: args.remainingAmount as bigint,
          timestamp: Date.now(),
        };

        setRecentEvents(prev => [event, ...prev].slice(0, 50));

        if (isConnected && address && event.sender?.toLowerCase() === address.toLowerCase() && event.amount) {
          addNotification({
            type: 'warning',
            title: '⚠️ Stream Cancelled',
            message: `Stream cancelled. ${formatUnits(event.amount, 6)} USDT refunded.`,
          });
          setLiveStreamCount(prev => Math.max(0, prev - 1));
        }

        onStreamEvent?.(event);
      });
    },
  });

  useWatchContractEvent({
    address: PAYMENT_STREAM_ADDRESS,
    abi: PAYMENT_STREAM_ABI,
    eventName: 'StreamCompleted',
    onLogs(logs: Log[]) {
      logs.forEach((log) => {
        const args = (log as any).args;
        if (!args) return;

        const event: StreamEvent = {
          type: 'completed',
          streamId: args.streamId as string,
          recipient: args.recipient as string,
          amount: args.finalAmount as bigint,
          timestamp: Date.now(),
        };

        setRecentEvents(prev => [event, ...prev].slice(0, 50));

        if (isConnected && address && event.recipient?.toLowerCase() === address.toLowerCase() && event.amount) {
          addNotification({
            type: 'info',
            title: '✅ Stream Completed',
            message: `Payment stream finished. Total received: ${formatUnits(event.amount, 6)} USDT`,
          });
        }

        onStreamEvent?.(event);
        setLiveStreamCount(prev => Math.max(0, prev - 1));
      });
    },
  });

  const clearEvents = useCallback(() => {
    setRecentEvents([]);
  }, []);

  return {
    recentEvents,
    liveStreamCount,
    clearEvents,
  };
}

export function LivePaymentTicker() {
  const { recentEvents, liveStreamCount } = useRealTimeStreams();
  const [displayEvents, setDisplayEvents] = useState<StreamEvent[]>([]);

  useEffect(() => {
    setDisplayEvents(recentEvents.slice(0, 3));
  }, [recentEvents]);

  if (displayEvents.length === 0) return null;

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'created': return '📥';
      case 'withdrawn': return '💰';
      case 'cancelled': return '⚠️';
      case 'completed': return '✅';
      default: return '•';
    }
  };

  const getEventClass = (type: string) => {
    switch (type) {
      case 'created': return 'bg-blue-500/90 text-white';
      case 'withdrawn': return 'bg-green-500/90 text-white';
      case 'cancelled': return 'bg-orange-500/90 text-white';
      case 'completed': return 'bg-purple-500/90 text-white';
      default: return 'bg-gray-500/90 text-white';
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 space-y-2">
      {liveStreamCount > 0 && (
        <div className="bg-green-500/90 text-white px-4 py-2 rounded-xl shadow-lg backdrop-blur-sm animate-pulse">
          <span className="flex items-center gap-2">
            <span className="w-2 h-2 bg-white rounded-full animate-ping" />
            {liveStreamCount} Active Stream{liveStreamCount !== 1 ? 's' : ''}
          </span>
        </div>
      )}
      
      {displayEvents.map((event, idx) => (
        <div
          key={`${event.streamId}-${idx}`}
          className={`px-4 py-3 rounded-xl shadow-lg backdrop-blur-sm animate-fade-in text-sm max-w-xs ${getEventClass(event.type)}`}
          style={{ animationDelay: `${idx * 100}ms` }}
        >
          <div className="flex items-center gap-2">
            <span>{getEventIcon(event.type)}</span>
            <span className="font-medium capitalize">{event.type}</span>
          </div>
          {event.amount !== undefined && (
            <div className="mt-1 text-white/90">
              {formatUnits(event.amount, 6)} USDT
            </div>
          )}
          <div className="text-xs text-white/60 mt-1">
            {new Date(event.timestamp).toLocaleTimeString()}
          </div>
        </div>
      ))}
    </div>
  );
}

export function useStreamProgress(streamId: string, endTime: bigint, ratePerSecond: bigint) {
  const [currentEarned, setCurrentEarned] = useState(0n);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      const now = Math.floor(Date.now() / 1000);
      const end = Number(endTime);
      
      if (now >= end) {
        setProgress(100);
        clearInterval(interval);
        return;
      }

      const totalDuration = end - (end - Number(endTime));
      const elapsed = now - (end - Number(endTime));
      const newProgress = Math.min(100, (elapsed / totalDuration) * 100);
      setProgress(newProgress);

      const earned = BigInt(Math.floor(elapsed)) * ratePerSecond;
      setCurrentEarned(earned);
    }, 100);

    return () => clearInterval(interval);
  }, [streamId, endTime, ratePerSecond]);

  return { currentEarned, progress };
}