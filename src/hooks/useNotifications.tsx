import { useState, useEffect, useCallback, useRef } from 'react';
import { 
  Notification, 
  fetchUserNotifications, 
  markNotificationAsRead, 
  markAllNotificationsAsRead,
  formatTimeAgo
} from '../lib/notifications';
import { useNotificationStream } from './useNotificationStream';

interface UseNotificationsResult {
  notifications: Notification[];
  loading: boolean;
  error: string | null;
  unreadCount: number;
  refetch: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  isRealtimeConnected: boolean;
}

// Använd en global variabel för att lagra notifikationer och deras status
type GlobalNotificationsState = {
  initialized: boolean;
  fetchPromise: Promise<void> | null;
  lastFetched: number;
  notifications: Notification[];
};

const globalState: GlobalNotificationsState = {
  initialized: false,
  fetchPromise: null,
  lastFetched: 0,
  notifications: []
};

export const useNotifications = (): UseNotificationsResult => {
  const [notifications, setNotifications] = useState<Notification[]>(globalState.notifications);
  const [loading, setLoading] = useState<boolean>(!globalState.initialized);
  const [error, setError] = useState<string | null>(null);
  const initialFetchDone = useRef(false);
  
  // Integrera med realtidsnotifikationer via SSE 
  // (inaktiverad eftersom SSE används inte aktivt)
  const { 
    realtimeNotifications, 
    connected: isRealtimeConnected, 
    error: realtimeError 
  } = useNotificationStream();
  
  // Hämta notifikationer
  const fetchNotifications = useCallback(async (forceRefresh = false) => {
    // Om en hämtning redan pågår, återanvänd det befintliga löftet
    if (globalState.fetchPromise && !forceRefresh) {
      await globalState.fetchPromise;
      setNotifications(globalState.notifications);
      return;
    }
    
    // Om det gått mindre än 10 sekunder sedan senaste hämtningen och vi inte tvingar en uppdatering
    const now = Date.now();
    if (!forceRefresh && globalState.initialized && now - globalState.lastFetched < 10000) {
      setNotifications(globalState.notifications);
      return;
    }
    
    setLoading(true);
    setError(null);
    
    // Skapa ett nytt löfte för hämtning
    const fetchPromise = (async () => {
      try {
        console.log('[useNotifications] Hämtar notifikationer, force:', forceRefresh);
        const fetchedNotifications = await fetchUserNotifications(forceRefresh);
        
        // Lägg till displayTime för varje notifikation
        const formattedNotifications = fetchedNotifications.map(notification => ({
          ...notification,
          displayTime: formatTimeAgo(notification.createdAt)
        }));
        
        // Uppdatera globalt tillstånd
        globalState.notifications = formattedNotifications;
        globalState.lastFetched = Date.now();
        globalState.initialized = true;
        
        // Uppdatera lokalt tillstånd
        setNotifications(formattedNotifications);
      } catch (err) {
        console.error('Fel vid hämtning av notifikationer:', err);
        setError('Kunde inte hämta notifikationer');
      } finally {
        setLoading(false);
        globalState.fetchPromise = null;
      }
    })();
    
    // Spara löftet globalt
    globalState.fetchPromise = fetchPromise;
    await fetchPromise;
  }, []);
  
  // Funktion för att uppdatera displayTime för alla notifikationer
  const updateNotificationTimes = useCallback(() => {
    const updatedNotifications = notifications.map(notification => ({
      ...notification,
      displayTime: formatTimeAgo(notification.createdAt)
    }));
    
    setNotifications(updatedNotifications);
    globalState.notifications = updatedNotifications;
  }, [notifications]);
  
  // Initiera hook och gör alltid första hämtningen
  useEffect(() => {
    // Kör bara en gång
    if (!initialFetchDone.current) {
      initialFetchDone.current = true;
      
      // Om redan initialiserad globalt, använd det cachade resultatet
      if (globalState.initialized) {
        console.log('[useNotifications] Använder cachade notifikationer');
        setNotifications(globalState.notifications);
        setLoading(false);
        return;
      }
      
      // Annars, gör den första hämtningen efter kort fördröjning 
      // för att undvika race conditions med flera komponenter
      const timer = setTimeout(() => {
        // Kontrollera igen om någon annan har initierat en hämtning under denna fördröjning
        if (!globalState.initialized && !globalState.fetchPromise) {
          console.log('[useNotifications] Gör första hämtningen med fördröjning');
          fetchNotifications(true);
        } else if (globalState.fetchPromise) {
          console.log('[useNotifications] En annan instans har redan påbörjat hämtning');
          // Vänta på att hämtningen ska slutföras och uppdatera sedan denna instans
          globalState.fetchPromise.then(() => {
            setNotifications(globalState.notifications);
            setLoading(false);
          });
        }
      }, 300);
      
      return () => clearTimeout(timer);
    }
    
    // Uppdatera formateringen av tid var 60:e sekund
    const timeUpdateInterval = setInterval(() => {
      updateNotificationTimes();
    }, 60000);
    
    return () => {
      clearInterval(timeUpdateInterval);
    };
  }, [fetchNotifications, updateNotificationTimes]);
  
  // Beräkna antalet olästa notifikationer
  const unreadCount = notifications.filter(notification => !notification.isRead).length;
  
  // Markera en notifikation som läst
  const markAsRead = async (id: string) => {
    try {
      const success = await markNotificationAsRead(id);
      
      if (success) {
        // Uppdatera både lokalt och globalt tillstånd
        const updatedNotifications = notifications.map(notification => 
          notification.id === id 
            ? { ...notification, isRead: true } 
            : notification
        );
        
        setNotifications(updatedNotifications);
        globalState.notifications = updatedNotifications;
      }
    } catch (err) {
      console.error('Fel vid markering av notifikation som läst:', err);
    }
  };
  
  // Markera alla notifikationer som lästa
  const markAllAsRead = async () => {
    try {
      const success = await markAllNotificationsAsRead();
      
      if (success) {
        // Uppdatera både lokalt och globalt tillstånd
        const updatedNotifications = notifications.map(notification => 
          ({ ...notification, isRead: true })
        );
        
        setNotifications(updatedNotifications);
        globalState.notifications = updatedNotifications;
      }
    } catch (err) {
      console.error('Fel vid markering av alla notifikationer som lästa:', err);
    }
  };

  return {
    notifications,
    loading,
    error,
    unreadCount,
    refetch: () => fetchNotifications(true),
    markAsRead,
    markAllAsRead,
    isRealtimeConnected: false // Alltid returnera false eftersom vi inte använder realtidsanslutningar
  };
}; 