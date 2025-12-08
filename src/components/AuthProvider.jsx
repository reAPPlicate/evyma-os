import { useEffect } from 'react';
import { useAuthStore } from '../stores/authStore';

/**
 * AuthProvider Component
 * Initializes authentication state on app load
 * Wraps the entire app to ensure auth state is available everywhere
 */
export default function AuthProvider({ children }) {
  const { login, isLoading } = useAuthStore();

  useEffect(() => {
    // Check authentication status on mount
    login();
  }, [login]);

  // Always render children - loading states are handled by ProtectedRoute
  return children;
}
