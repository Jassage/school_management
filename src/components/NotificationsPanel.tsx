import React from 'react';
import { useAuthStore } from '../lib/store';
import { X, Info, CheckCircle, AlertTriangle, AlertCircle, Trash2, Check } from 'lucide-react';

interface NotificationsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const iconMap = {
  info: Info,
  success: CheckCircle,
  warning: AlertTriangle,
  error: AlertCircle,
};

const colorMap = {
  info: 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/50',
  success: 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/50',
  warning: 'text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/50',
  error: 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/50',
};

export default function NotificationsPanel({ isOpen, onClose }: NotificationsPanelProps) {
  const { notifications, markNotificationAsRead, clearAllNotifications, markAllNotificationsAsRead } = useAuthStore();
  const unreadCount = notifications.filter((n) => !n.read).length;

  if (!isOpen) return null;

  return (
    <div className="absolute right-0 mt-2 w-96 bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden z-50">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-semibold">Notifications</h3>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <X size={20} />
          </button>
        </div>
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {unreadCount} non lues
          </p>
          <div className="flex space-x-2">
            <button
              onClick={markAllNotificationsAsRead}
              className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 flex items-center space-x-1"
            >
              <Check size={16} />
              <span>Tout marquer comme lu</span>
            </button>
            <button
              onClick={clearAllNotifications}
              className="text-sm text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 flex items-center space-x-1"
            >
              <Trash2 size={16} />
              <span>Tout effacer</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-h-96 overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="p-4 text-center text-gray-500 dark:text-gray-400">
            Aucune notification
          </div>
        ) : (
          notifications.map((notification) => {
            const Icon = iconMap[notification.type];
            return (
              <div
                key={notification.id}
                className={`p-4 border-b border-gray-200 dark:border-gray-700 ${
                  !notification.read ? 'bg-gray-50 dark:bg-gray-700/50' : ''
                }`}
                onClick={() => markNotificationAsRead(notification.id)}
              >
                <div className="flex space-x-4">
                  <div
                    className={`p-2 rounded-lg ${colorMap[notification.type]}`}
                  >
                    <Icon size={20} />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium">{notification.title}</h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {notification.message}
                    </p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                      {new Date(notification.createdAt).toLocaleDateString()} {new Date(notification.createdAt).toLocaleTimeString()}
                    </p>
                  </div>
                  {!notification.read && (
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}