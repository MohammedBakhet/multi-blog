import React, { useState, useEffect } from 'react';
import { useNotifications } from '../../hooks/useNotifications';
import { Button } from './ui/Button'; // Anta att vi har en Button-komponent

const NotificationsManager: React.FC = () => {
  const { 
    notifications, 
    loading, 
    error, 
    unreadCount, 
    refetch, 
    markAllAsRead 
  } = useNotifications();
  
  // Spara tid för senaste manuella uppdatering
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  
  // Uppdatera tid sedan senaste uppdatering
  const [timeSinceUpdate, setTimeSinceUpdate] = useState<string>('');
  
  // Uppdatera tid sedan senaste uppdatering
  useEffect(() => {
    if (!lastUpdate) return;
    
    const updateTimeSince = () => {
      const now = new Date();
      const diffInSeconds = Math.floor((now.getTime() - lastUpdate.getTime()) / 1000);
      
      if (diffInSeconds < 60) {
        setTimeSinceUpdate(`${diffInSeconds} sekunder sedan`);
      } else if (diffInSeconds < 3600) {
        const minutes = Math.floor(diffInSeconds / 60);
        setTimeSinceUpdate(`${minutes} ${minutes === 1 ? 'minut' : 'minuter'} sedan`);
      } else {
        const hours = Math.floor(diffInSeconds / 3600);
        setTimeSinceUpdate(`${hours} ${hours === 1 ? 'timme' : 'timmar'} sedan`);
      }
    };
    
    updateTimeSince();
    const interval = setInterval(updateTimeSince, 10000);
    
    return () => clearInterval(interval);
  }, [lastUpdate]);
  
  const handleRefresh = async () => {
    console.log('[NotificationsManager] Manuell uppdatering begärd');
    await refetch();
    setLastUpdate(new Date());
  };
  
  // Sätt senaste uppdateringstid när komponenten monteras
  useEffect(() => {
    if (!lastUpdate && notifications.length > 0) {
      setLastUpdate(new Date());
    }
  }, [lastUpdate, notifications]);
  
  return (
    <div className="p-4 bg-gray-800 rounded-lg shadow-lg">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-white">Notifikationer</h2>
        <div className="flex items-center space-x-2">
          {lastUpdate && (
            <span className="text-xs text-gray-400">
              Uppdaterad: {timeSinceUpdate}
            </span>
          )}
          <Button 
            onClick={handleRefresh} 
            disabled={loading}
            className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
          >
            {loading ? 'Uppdaterar...' : 'Uppdatera'}
          </Button>
          {unreadCount > 0 && (
            <Button 
              onClick={markAllAsRead}
              className="px-3 py-1 bg-gray-600 text-white text-sm rounded hover:bg-gray-700 transition-colors"
            >
              Markera alla som lästa
            </Button>
          )}
        </div>
      </div>
      
      {error && (
        <div className="mb-4 p-3 bg-red-800 bg-opacity-50 text-red-200 rounded">
          {error}
        </div>
      )}
      
      {loading && notifications.length === 0 ? (
        <div className="p-6 text-center">
          <div className="flex justify-center space-x-2 mb-4">
            <div className="w-3 h-3 bg-blue-300 rounded-full animate-pulse"></div>
            <div className="w-3 h-3 bg-blue-400 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
            <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
          </div>
          <p className="text-gray-400">Laddar notifikationer...</p>
        </div>
      ) : notifications.length === 0 ? (
        <div className="p-6 text-center text-gray-400">
          <p>Inga notifikationer att visa</p>
          <p className="mt-2 text-sm">
            Klicka på "Uppdatera" för att kontrollera om du har nya notifikationer
          </p>
        </div>
      ) : (
        <div className="max-h-96 overflow-y-auto">
          {notifications.map(notification => (
            <div 
              key={notification.id}
              className={`px-4 py-3 mb-2 rounded ${notification.isRead ? 'bg-gray-700' : 'bg-gray-600 border-l-4 border-blue-500'}`}
            >
              <div className="flex items-start">
                {notification.relatedUserImage ? (
                  <img 
                    src={notification.relatedUserImage} 
                    alt={notification.relatedUsername || 'User'} 
                    className="h-8 w-8 rounded-full mr-3"
                  />
                ) : (
                  <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center mr-3">
                    <span className="text-white font-bold">N</span>
                  </div>
                )}
                
                <div>
                  <p className={`text-sm ${notification.isRead ? 'text-gray-300' : 'text-white font-medium'}`}>
                    {notification.message}
                    {notification.postTitle && (
                      <span className="text-gray-400 ml-1">i "{notification.postTitle}"</span>
                    )}
                  </p>
                  
                  <div className="text-xs text-gray-400 mt-1">
                    {notification.displayTime}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default NotificationsManager; 