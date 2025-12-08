import { useEffect, useState } from 'react';
import { WifiOff, Wifi } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * OfflineDetector Component
 * Displays a banner when the user goes offline
 */
export default function OfflineDetector() {
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

  return (
    <AnimatePresence>
      {!isOnline && (
        <motion.div
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          className="fixed top-0 left-0 right-0 z-[200] bg-red-500 text-white py-3 px-4 flex items-center justify-center gap-2 shadow-lg"
        >
          <WifiOff className="w-5 h-5" />
          <span className="font-medium">You are offline. Some features may not work.</span>
        </motion.div>
      )}
      {isOnline && (
        <motion.div
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          className="fixed top-0 left-0 right-0 z-[200] bg-green-500 text-white py-3 px-4 flex items-center justify-center gap-2 shadow-lg"
          onAnimationComplete={() => {
            setTimeout(() => setIsOnline(navigator.onLine), 2000);
          }}
        >
          <Wifi className="w-5 h-5" />
          <span className="font-medium">Back online!</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
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