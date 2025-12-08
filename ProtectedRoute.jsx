import { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import LoadingSpinner from './LoadingSpinner';

/**
 * ProtectedRoute Component
 * Wraps routes that require authentication using Base44's built-in auth
 * Redirects to login if user is not authenticated
 */
export default function ProtectedRoute({ 
  children, 
  requireOnboarding = false, 
  requirePremium = false 
}) {
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const isAuth = await base44.auth.isAuthenticated();
        
        if (!isAuth) {
          setIsLoading(false);
          return;
        }

        const userData = await base44.auth.me();
        setUser(userData);
      } catch (error) {
        console.error('Auth check error:', error);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  if (isLoading) {
    return <LoadingSpinner fullScreen text="Loading..." />;
  }

  if (!user) {
    base44.auth.redirectToLogin(location.pathname);
    return null;
  }

  if (requireOnboarding && !user.onboarding_complete) {
    return <Navigate to="/onboarding" replace />;
  }

  if (requirePremium && user.subscription_tier === 'free') {
    return <Navigate to="/upgrade" replace />;
  }

  return children;
}

/**
 * PublicRoute Component
 * Wraps routes that should only be accessible when NOT authenticated
 * Redirects to home if user is already authenticated
 */
export function PublicRoute({ children }) {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuth, setIsAuth] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const authenticated = await base44.auth.isAuthenticated();
        setIsAuth(authenticated);
      } catch (error) {
        setIsAuth(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  if (isLoading) {
    return <LoadingSpinner fullScreen />;
  }

  if (isAuth) {
    return <Navigate to="/" replace />;
  }

  return children;
}