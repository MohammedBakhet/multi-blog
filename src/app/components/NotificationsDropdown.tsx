import React from 'react';
import NotificationItem from './NotificationItem';
import { Notification, NotificationType } from '../../lib/notifications';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface NotificationsDropdownProps {
  notifications: Notification[];
  loading: boolean;
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  isRealtimeConnected?: boolean; // Visa om realtidsanslutningen är aktiv
}

const NotificationsDropdown: React.FC<NotificationsDropdownProps> = ({
  notifications,
  loading,
  onMarkAsRead,
  onMarkAllAsRead,
  isRealtimeConnected
}) => {
  const router = useRouter();

  // Hantera klick på en notifikation baserat på dess typ
  const handleNotificationClick = (notification: Notification) => {
    if (notification.postId) {
      // Om notifikationen är relaterad till ett inlägg, navigera dit
      router.push(`/post/${notification.postId}`);
    } else if (notification.type === NotificationType.FOLLOW && notification.relatedUserId) {
      // Om det är en följarnotifikation, navigera till användarens profil
      router.push(`/user/${notification.relatedUserId}`);
    }
  };
 
  return (
    <div className="absolute right-0 mt-2 w-80 bg-gray-900 rounded-lg shadow-lg ring-1 ring-black ring-opacity-5 z-50 animate-fadeIn">
      <div className="py-2 px-3 border-b border-gray-800 flex justify-between items-center">
        <div className="flex items-center">
          <h3 className="text-sm font-medium text-white">Notifikationer</h3>
         
          {/* Indikator för realtidsanslutning */}
          {isRealtimeConnected && (
            <div className="ml-2 flex items-center" title="Realtidsuppdateringar aktiva">
              <span className="h-2 w-2 bg-green-500 rounded-full mr-1 animate-pulse"></span>
              <span className="text-xs text-green-500">Live</span>
            </div>
          )}
        </div>
       
        {/* Länk till notifikationssidan */}
        <Link
          href="/notifications"
          className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
        >
          Visa alla notifikationer
        </Link>
      </div>
     
      <div className="max-h-60 overflow-y-auto">
        {loading ? (
          <div className="flex justify-center items-center py-6">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-blue-300 rounded-full animate-pulse"></div>
              <div className="w-3 h-3 bg-blue-400 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
              <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
            </div>
          </div>
        ) : notifications.length === 0 ? (
          <div className="py-6 text-center text-gray-400 text-sm">
            <p>Inga notifikationer att visa</p>
          </div>
        ) : (
          notifications.map(notification => (
            <NotificationItem
              key={notification.id}
              notification={notification}
              onMarkAsRead={onMarkAsRead}
              onClick={handleNotificationClick}
            />
          ))
        )}
      </div>
     
      {notifications.length > 0 && (
        <div className="py-2 px-3 border-t border-gray-800 text-center">
          <button
            onClick={onMarkAllAsRead}
            className="text-xs text-blue-400 hover:text-blue-300 transition-colors py-1 px-2 hover:bg-blue-900 hover:bg-opacity-30 rounded"
          >
            Markera alla som lästa
          </button>
        </div>
      )}
    </div>
  );
};

export default NotificationsDropdown;
