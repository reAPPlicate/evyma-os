import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { WifiOff } from 'lucide-react';

/**
 * OfflineDetector Component
 * Uses toast notifications for connectivity status
 */
export default function OfflineDetector() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [hasShownOnline, setHasShownOnline] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      // Only show "Back online" if we've previously shown offline
      if (hasShownOnline) {
        toast.success('Back online!', { duration: 2000 });
      }
    };
    
    const handleOffline = () => {
      setIsOnline(false);
      setHasShownOnline(true);
      toast.error('You are offline. Some features may not work.', {
        duration: Infinity,
        id: 'offline-toast'
      });
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      // Dismiss offline toast when component unmounts
      toast.dismiss('offline-toast');
    };
  }, [hasShownOnline]);

  // Dismiss offline toast when back online
  useEffect(() => {
    if (isOnline) {
      toast.dismiss('offline-toast');
    }
  }, [isOnline]);

  return null;
}

/**
 * useOnlineStatus Hook
 * Returns current online status
 */
export function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOnline;
}