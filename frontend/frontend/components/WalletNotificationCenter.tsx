import React, { useState } from 'react';
import { X, Bell, AlertCircle, Info, CheckCircle, XCircle, BellRing } from 'lucide-react';
import { useNotifications, type NotificationType } from '@/contexts/NotificationContext';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const getNotificationIcon = (type: NotificationType) => {
  switch (type) {
    case 'success':
      return <CheckCircle className="h-5 w-5 text-green-500" />;
    case 'error':
      return <XCircle className="h-5 w-5 text-red-500" />;
    case 'warning':
      return <AlertCircle className="h-5 w-5 text-yellow-500" />;
    default:
      return <Info className="h-5 w-5 text-blue-500" />;
  }
};

export const WalletNotificationCenter: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { state, markAllAsRead, removeNotification, clearAll } = useNotifications();
  const { notifications, unreadCount } = state;

  const formatTimeAgo = (timestamp: number) => {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    
    const intervals = {
      year: 31536000,
      month: 2592000,
      week: 604800,
      day: 86400,
      hour: 3600,
      minute: 60,
      second: 1
    };
    
    for (const [unit, secondsInUnit] of Object.entries(intervals)) {
      const interval = Math.floor(seconds / secondsInUnit);
      if (interval >= 1) {
        return interval === 1 ? `1 ${unit} ago` : `${interval} ${unit}s ago`;
      }
    }
    
    return 'just now';
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-400 hover:text-gray-500 focus:outline-none"
        aria-label="Notifications"
      >
        <Bell className="h-6 w-6" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-medium text-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">Notifications</h3>
              <div className="flex space-x-2">
                <button
                  onClick={markAllAsRead}
                  disabled={unreadCount === 0}
                  className="text-sm text-blue-600 hover:text-blue-800 disabled:opacity-50"
                >
                  Mark all as read
                </button>
                <button
                  onClick={clearAll}
                  disabled={notifications.length === 0}
                  className="text-sm text-red-600 hover:text-red-800 disabled:opacity-50"
                >
                  Clear all
                </button>
              </div>
            </div>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                <BellRing className="mx-auto h-8 w-8 text-gray-300 mb-2" />
                <p>No notifications yet</p>
              </div>
            ) : (
              <ul className="divide-y divide-gray-200">
                {notifications.map((notification) => (
                  <li
                    key={notification.id}
                    className={cn(
                      'p-4 hover:bg-gray-50 transition-colors',
                      !notification.read && 'bg-blue-50'
                    )}
                  >
                    <div className="flex items-start">
                      <div className="flex-shrink-0 pt-0.5">
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="ml-3 flex-1">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium text-gray-900">
                            {notification.title}
                          </p>
                          <div className="flex space-x-2">
                            <span className="text-xs text-gray-500">
                              {formatTimeAgo(notification.timestamp)}
                            </span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                removeNotification(notification.id);
                              }}
                              className="text-gray-400 hover:text-gray-500"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                        <p className="mt-1 text-sm text-gray-600">
                          {notification.message}
                        </p>
                        {notification.action && (
                          <div className="mt-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                notification.action?.onClick();
                              }}
                            >
                              {notification.action.label}
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default WalletNotificationCenter;
