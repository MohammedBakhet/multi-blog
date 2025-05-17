import { useState, useEffect, useCallback, useRef } from 'react';
import { Notification, formatTimeAgo } from '../lib/notifications';

// Helt inaktiverad - returnerar bara en tom implementering
interface UseNotificationStreamResult {
  realtimeNotifications: Notification[];
  error: string | null;
  connected: boolean;
}

export const useNotificationStream = (): UseNotificationStreamResult => {
  // Returnera bara standardvärden, ingen logik
  return {
    realtimeNotifications: [],
    error: null,
    connected: false
  };
}; 