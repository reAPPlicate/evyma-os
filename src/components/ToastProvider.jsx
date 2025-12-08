import { Toaster, toast } from 'react-hot-toast';
import { X } from 'lucide-react';

/**
 * Global Toast Provider with auto-dismiss and close button
 */
export default function ToastProvider() {
  return (
    <Toaster
      position="top-center"
      toastOptions={{
        duration: 4000,
        style: {
          background: '#18181b',
          color: '#fff',
          borderRadius: '12px',
          padding: '12px 16px',
          fontSize: '14px',
          maxWidth: '400px',
        },
        success: {
          duration: 3000,
          iconTheme: {
            primary: '#22c55e',
            secondary: '#fff',
          },
        },
        error: {
          duration: 5000,
          iconTheme: {
            primary: '#ef4444',
            secondary: '#fff',
          },
        },
      }}
      containerStyle={{
        top: 20,
      }}
    >
      {(t) => (
        <div className="flex items-center gap-3 w-full">
          <div className="flex-1">{t.message}</div>
          <button
            onClick={() => toast.dismiss(t.id)}
            className="flex-shrink-0 p-1 rounded-lg hover:bg-white/10 transition-colors"
            aria-label="Close notification"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </Toaster>
  );
}