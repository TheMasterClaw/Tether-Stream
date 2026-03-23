import React, { createContext, useContext, useState, useCallback } from 'react';
import { 
  CheckCircle, 
  AlertCircle, 
  Info, 
  X,
  ArrowDownRight,
  ArrowUpRight
} from 'lucide-react';

type NotificationType = 'success' | 'error' | 'info' | 'warning' | 'incoming' | 'outgoing';

interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: number;
  duration?: number;
}

interface NotificationContextType {
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp'>) => void;
  removeNotification: (id: string) => void;
  clearAll: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const addNotification = useCallback((notification: Omit<Notification, 'id' | 'timestamp'>) => {
    const id = Math.random().toString(36).substring(2, 9);
    const newNotification: Notification = {
      ...notification,
      id,
      timestamp: Date.now(),
      duration: notification.duration || 5000
    };

    setNotifications(prev => [...prev, newNotification]);

    // Auto-remove after duration
    setTimeout(() => {
      removeNotification(id);
    }, newNotification.duration);
  }, []);

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  return (
    <NotificationContext.Provider value={{ notifications, addNotification, removeNotification, clearAll }}>
      {children}
      <NotificationContainer notifications={notifications} onRemove={removeNotification} />
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within NotificationProvider');
  }
  return context;
}

// Hook for common notification patterns
export function useStreamNotifications() {
  const { addNotification } = useNotifications();

  const notifyStreamCreated = useCallback((amount: string, service: string) => {
    addNotification({
      type: 'success',
      title: 'Stream Created',
      message: `Started streaming ${amount} USDT for ${service}`,
      duration: 6000
    });
  }, [addNotification]);

  const notifyStreamWithdrawn = useCallback((amount: string) => {
    addNotification({
      type: 'incoming',
      title: 'Funds Received',
      message: `Withdrawn ${amount} USDT from stream`,
      duration: 6000
    });
  }, [addNotification]);

  const notifyStreamCancelled = useCallback((refund: string) => {
    addNotification({
      type: 'warning',
      title: 'Stream Cancelled',
      message: `Stream cancelled. ${refund} USDT refunded.`,
      duration: 6000
    });
  }, [addNotification]);

  const notifyApprovalRequired = useCallback(() => {
    addNotification({
      type: 'info',
      title: 'Approval Needed',
      message: 'Please approve USDT spending in your wallet',
      duration: 10000
    });
  }, [addNotification]);

  const notifyError = useCallback((message: string) => {
    addNotification({
      type: 'error',
      title: 'Error',
      message,
      duration: 8000
    });
  }, [addNotification]);

  const notifyLowBalance = useCallback((balance: string, required: string) => {
    addNotification({
      type: 'warning',
      title: 'Low Balance',
      message: `Balance: ${balance} USDT. Required: ${required} USDT`,
      duration: 10000
    });
  }, [addNotification]);

  return {
    notifyStreamCreated,
    notifyStreamWithdrawn,
    notifyStreamCancelled,
    notifyApprovalRequired,
    notifyError,
    notifyLowBalance
  };
}

function NotificationContainer({ 
  notifications, 
  onRemove 
}: { 
  notifications: Notification[]; 
  onRemove: (id: string) => void;
}) {
  if (notifications.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 space-y-3 w-full max-w-sm">
      {notifications.map((notification) => (
        <NotificationItem
          key={notification.id}
          notification={notification}
          onRemove={onRemove}
        />
      ))}
    </div>
  );
}

function NotificationItem({ 
  notification, 
  onRemove 
}: { 
  notification: Notification; 
  onRemove: (id: string) => void;
}) {
  const { type, title, message, id } = notification;

  const config = {
    success: {
      icon: CheckCircle,
      bg: 'bg-green-500/20',
      border: 'border-green-500/30',
      text: 'text-green-400',
      progress: 'bg-green-500'
    },
    error: {
      icon: AlertCircle,
      bg: 'bg-red-500/20',
      border: 'border-red-500/30',
      text: 'text-red-400',
      progress: 'bg-red-500'
    },
    warning: {
      icon: AlertCircle,
      bg: 'bg-amber-500/20',
      border: 'border-amber-500/30',
      text: 'text-amber-400',
      progress: 'bg-amber-500'
    },
    info: {
      icon: Info,
      bg: 'bg-blue-500/20',
      border: 'border-blue-500/30',
      text: 'text-blue-400',
      progress: 'bg-blue-500'
    },
    incoming: {
      icon: ArrowDownRight,
      bg: 'bg-green-500/20',
      border: 'border-green-500/30',
      text: 'text-green-400',
      progress: 'bg-green-500'
    },
    outgoing: {
      icon: ArrowUpRight,
      bg: 'bg-red-500/20',
      border: 'border-red-500/30',
      text: 'text-red-400',
      progress: 'bg-red-500'
    }
  };

  const { icon: Icon, bg, border, text, progress } = config[type];

  return (
    <div
      className={`relative overflow-hidden rounded-xl border ${border} ${bg} backdrop-blur-sm shadow-lg animate-slide-in`}
      style={{
        animation: 'slideIn 0.3s ease-out'
      }}
    >
      <div className="p-4 flex items-start gap-3">
        <div className={`w-8 h-8 rounded-lg bg-black/30 flex items-center justify-center flex-shrink-0`}>
          <Icon className={`w-4 h-4 ${text}`} />
        </div>
        
        <div className="flex-1 min-w-0">
          <h4 className={`font-semibold text-sm ${text}`}>{title}</h4>
          <p className="text-gray-300 text-sm mt-1">{message}</p>
        </div>
        
        <button
          onClick={() => onRemove(id)}
          className="text-gray-500 hover:text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Progress bar */}
      <div className="h-0.5 bg-black/30">
        <div
          className={`h-full ${progress} animate-progress`}
          style={{
            animationDuration: `${notification.duration}ms`,
            animationTimingFunction: 'linear',
            animationFillMode: 'forwards'
          }}
        />
      </div>

      <style>{`
        @keyframes slideIn {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        
        @keyframes progress {
          from {
            width: 100%;
          }
          to {
            width: 0%;
          }
        }
        
        .animate-slide-in {
          animation: slideIn 0.3s ease-out;
        }
        
        .animate-progress {
          animation-name: progress;
        }
      `}</style>
    </div>
  );
}
