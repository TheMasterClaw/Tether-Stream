import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { Bell, X, CheckCircle, AlertCircle, Info } from 'lucide-react';

interface Notification {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  message: string;
  timestamp: number;
  read: boolean;
}

interface NotificationContextType {
  addNotification: (type: Notification['type'], title: string, message: string) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const addNotification = (type: Notification['type'], title: string, message: string) => {
    const newNotification: Notification = {
      id: crypto.randomUUID(),
      type,
      title,
      message,
      timestamp: Date.now(),
      read: false
    };
    setNotifications(prev => [newNotification, ...prev].slice(0, 50));
    localStorage.setItem('paystream_notifications', JSON.stringify([newNotification, ...notifications].slice(0, 50)));
  };

  return (
    <NotificationContext.Provider value={{ addNotification }}>
      {children}
      <NotificationCenterInternal />
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

function NotificationCenterInternal() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const saved = localStorage.getItem('paystream_notifications');
    if (saved) {
      const parsed = JSON.parse(saved);
      setNotifications(parsed);
      setUnreadCount(parsed.filter((n: Notification) => !n.read).length);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('paystream_notifications', JSON.stringify(notifications));
    setUnreadCount(notifications.filter(n => !n.read).length);
  }, [notifications]);

  const markAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const getIcon = (type: Notification['type']) => {
    switch (type) {
      case 'success': return <CheckCircle className="w-5 h-5 text-green-400" />;
      case 'error': return <AlertCircle className="w-5 h-5 text-red-400" />;
      case 'warning': return <AlertCircle className="w-5 h-5 text-yellow-400" />;
      default: return <Info className="w-5 h-5 text-blue-400" />;
    }
  };

  const formatTime = (timestamp: number) => {
    const diff = Date.now() - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(diff / 86400000)}d ago`;
  };

  return (
    <div className="relative z-50">
      <button onClick={() => setIsOpen(!isOpen)} className="relative p-2 text-gray-400 hover:text-white">
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 top-full mt-2 w-96 bg-slate-900 border border-white/10 rounded-2xl shadow-2xl z-50">
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
              <h3 className="font-semibold text-white">Notifications</h3>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <button onClick={markAllAsRead} className="text-xs text-blue-400 hover:text-blue-300">
                    Mark all read
                  </button>
                )}
                {notifications.length > 0 && (
                  <button onClick={clearNotifications} className="text-xs text-gray-500 hover:text-gray-400">
                    Clear
                  </button>
                )}
              </div>
            </div>

            <div className="max-h-96 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Bell className="w-12 h-12 mx-auto mb-3 opacity-20" />
                  <p>No notifications yet</p>
                </div>
              ) : (
                notifications.map((n) => (
                  <div
                    key={n.id}
                    className={`flex items-start gap-3 px-4 py-3 border-b border-white/5 hover:bg-white/5 cursor-pointer ${!n.read ? 'bg-blue-500/5' : ''}`}
                    onClick={() => markAsRead(n.id)}
                  >
                    <div className="mt-0.5">{getIcon(n.type)}</div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-white text-sm">{n.title}</p>
                      <p className="text-gray-400 text-sm mt-0.5">{n.message}</p>
                      <p className="text-gray-600 text-xs mt-1">{formatTime(n.timestamp)}</p>
                    </div>
                    <button onClick={(e) => { e.stopPropagation(); removeNotification(n.id); }} className="text-gray-500">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default NotificationProvider;
