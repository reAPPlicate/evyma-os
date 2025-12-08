import { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { Loader2 } from 'lucide-react';

/**
 * ProtectedRoute Component
 * Wraps routes that require authentication
 * Redirects to /auth if user is not authenticated
 */
export default function ProtectedRoute({ children, requireOnboarding = false, requirePremium = false }) {
  const location = useLocation();
  const { isAuthenticated, profile, isLoading, canAccessPremium } = useAuthStore();

  // If still loading, show loading spinner
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  // If not authenticated, redirect to auth page
  if (!isAuthenticated) {
    return <Navigate to={`/auth?redirect=${encodeURIComponent(location.pathname)}`} replace />;
  }

  // If onboarding required but not complete, redirect to onboarding
  if (requireOnboarding && profile && !profile.onboardingComplete) {
    return <Navigate to="/onboarding" replace />;
  }

  // If premium access required but not available, redirect to upgrade page
  if (requirePremium && !canAccessPremium()) {
    return <Navigate to="/upgrade" replace />;
  }

  // All checks passed, render the protected content
  return children;
}

/**
 * PublicRoute Component
 * Wraps routes that should only be accessible when NOT authenticated
 * Redirects to home if user is already authenticated
 */
export function PublicRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuthStore();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return children;
}
