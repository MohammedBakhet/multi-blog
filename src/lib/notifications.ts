// Definierar olika notifikationstyper
export enum NotificationType {
  LIKE = 'like',
  COMMENT = 'comment',
  FOLLOW = 'follow',
  SYSTEM = 'system'
}

// Interface för notifikationsobjekt
export interface Notification {
  id: string;
  userId: string;
  relatedUserId?: string; // användaren som utförde åtgärden (t.ex. gillade eller kommenterade)
  relatedUsername?: string; // Användarnamn för den relaterade användaren
  relatedUserImage?: string; // Profilbild för den relaterade användaren
  type: NotificationType;
  message: string;
  postId?: string;
  postTitle?: string;
  isRead: boolean;
  createdAt: string;
  displayTime?: string; // Formatterad tid (t.ex. "2m", "1h", "3d")
}

// Server-side funktion för att skapa en ny notifikation
export interface CreateNotificationParams {
  db: any; // MongoDB-databas
  userId: string; // Mottagaren av notifikationen
  type: NotificationType;
  message: string;
  postId?: string;
  postTitle?: string;
  relatedUserId?: string;
  relatedUsername?: string;
  relatedUserImage?: string;
}

// Skapar en ny notifikation i databasen
export const createNotification = async (params: CreateNotificationParams): Promise<boolean> => {
  try {
    const { db, userId, type, message, postId, postTitle, relatedUserId, relatedUsername, relatedUserImage } = params;
    
    const newNotification = {
      userId,
      type,
      message,
      postId,
      postTitle,
      relatedUserId,
      relatedUsername,
      relatedUserImage,
      isRead: false,
      createdAt: new Date().toISOString()
    };
    
    await db.collection('notifications').insertOne(newNotification);
    return true;
  } catch (error) {
    console.error('Fel vid skapande av notifikation:', error);
    return false;
  }
};

// Klientcache för notifikationer för att minska upprepade anrop
const clientCache = {
  notifications: [] as Notification[],
  lastFetched: 0,
  isFetching: false
};

// Hämta notifikationer för en användare
export const fetchUserNotifications = async (forceRefresh = false): Promise<Notification[]> => {
  try {
    // Om vi redan håller på att hämta, vänta
    if (clientCache.isFetching) {
      console.log('[fetchUserNotifications] En hämtning pågår redan, väntar...');
      // Vänta i 300ms och kolla igen
      await new Promise(resolve => setTimeout(resolve, 300));
      if (!forceRefresh && clientCache.notifications.length > 0) {
        return clientCache.notifications;
      }
    }
    
    // Om det inte har gått 10 sekunder sedan senaste hämtningen och vi har data i cachen
    const now = Date.now();
    if (!forceRefresh && clientCache.notifications.length > 0 && now - clientCache.lastFetched < 10000) {
      console.log('[fetchUserNotifications] Använder cachade notifikationer (klientcache)');
      return clientCache.notifications;
    }
    
    console.log('[fetchUserNotifications] Hämtar från server, force:', forceRefresh);
    clientCache.isFetching = true;
    
    const headers: HeadersInit = {};
    if (forceRefresh) {
      headers['x-no-cache'] = 'true';
    }
    
    const response = await fetch('/api/notifications', { headers });
    if (!response.ok) {
      throw new Error('Kunde inte hämta notifikationer');
    }
    
    const data = await response.json();
    
    // Uppdatera cache
    clientCache.notifications = data;
    clientCache.lastFetched = now;
    clientCache.isFetching = false;
    
    return data;
  } catch (error) {
    console.error('[fetchUserNotifications] Fel vid hämtning av notifikationer:', error);
    clientCache.isFetching = false;
    return clientCache.notifications.length > 0 ? clientCache.notifications : [];
  }
};

// Markera en notifikation som läst
export const markNotificationAsRead = async (notificationId: string): Promise<boolean> => {
  try {
    const response = await fetch(`/api/notifications/${notificationId}/read`, {
      method: 'PATCH',
    });
    return response.ok;
  } catch (error) {
    console.error('Fel vid markering av notifikation som läst:', error);
    return false;
  }
};

// Markera alla notifikationer för en användare som lästa
export const markAllNotificationsAsRead = async (): Promise<boolean> => {
  try {
    const response = await fetch('/api/notifications/read-all', {
      method: 'PATCH',
    });
    return response.ok;
  } catch (error) {
    console.error('Fel vid markering av alla notifikationer som lästa:', error);
    return false;
  }
};

// Formatterar relativ tid för notifikationer
export const formatTimeAgo = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diffInSeconds < 60) {
    return 'Just nu';
  }
  
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes}m`;
  }
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours}h`;
  }
  
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 30) {
    return `${diffInDays}d`;
  }
  
  const diffInMonths = Math.floor(diffInDays / 30);
  return `${diffInMonths}mån`;
}; 