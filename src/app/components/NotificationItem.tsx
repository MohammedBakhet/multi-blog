import React from 'react';
import { Notification, NotificationType } from '../../lib/notifications';
import Link from 'next/link';

interface NotificationItemProps {
  notification: Notification;
  onMarkAsRead: (id: string) => void;
  onClick?: (notification: Notification) => void;
}

const NotificationItem: React.FC<NotificationItemProps> = ({ 
  notification, 
  onMarkAsRead,
  onClick 
}) => {
  const handleClick = () => {
    if (!notification.isRead) {
      onMarkAsRead(notification.id);
    }
    
    if (onClick) {
      onClick(notification);
    }
  };
  
  // Ger olika färger beroende på notifikationstyp
  const getBorderColor = () => {
    switch (notification.type) {
      case NotificationType.LIKE:
        return 'border-pink-500';
      case NotificationType.COMMENT:
        return 'border-blue-500';
      case NotificationType.FOLLOW:
        return 'border-green-500';
      case NotificationType.SYSTEM:
        return 'border-purple-500';
      default:
        return 'border-gray-500';
    }
  };
  
  // Ger olika ikoner beroende på notifikationstyp
  const getIcon = () => {
    switch (notification.type) {
      case NotificationType.LIKE:
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-pink-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        );
      case NotificationType.COMMENT:
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
        );
      case NotificationType.FOLLOW:
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
          </svg>
        );
      case NotificationType.SYSTEM:
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      default:
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
        );
    }
  };

  return (
    <div 
      onClick={handleClick}
      className={`px-4 py-3 hover:bg-gray-800 transition-colors duration-200 cursor-pointer border-l-2 ${getBorderColor()} ${
        notification.isRead ? 'bg-gray-900' : 'bg-gray-800'
      }`}
    >
      <div className="flex items-start">
        {/* Profilbild eller ikon */}
        {notification.relatedUserImage ? (
          <img 
            src={notification.relatedUserImage} 
            alt={notification.relatedUsername || 'Användare'} 
            className="h-8 w-8 rounded-full mr-3"
          />
        ) : (
          <div className="h-8 w-8 rounded-full flex items-center justify-center mr-3 bg-gray-700">
            {getIcon()}
          </div>
        )}
        
        <div className="flex-1">
          {/* Notifikationstext */}
          <p className={`text-sm ${notification.isRead ? 'text-gray-300' : 'text-white font-medium'}`}>
            {notification.message}
            {notification.postTitle && (
              <span className="text-gray-400"> i "{notification.postTitle}"</span>
            )}
          </p>
          
          {/* Tidsangivelse */}
          <p className="text-xs text-gray-400 mt-1">
            {notification.displayTime || ''}
          </p>
        </div>
        
        {/* Indikator för oläst */}
        {!notification.isRead && (
          <div className="h-2 w-2 rounded-full bg-blue-500 mt-1"></div>
        )}
      </div>
    </div>
  );
};

export default NotificationItem; 