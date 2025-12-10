import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { useTheme } from '@/components/theme/ThemeContext';
import { base44 } from '@/api/base44Client';
import GlassCard from '@/components/theme/GlassCard';
import { Home, Target, CheckSquare, MessageCircle, ArrowRight, Compass } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  const navigate = useNavigate();
  const location = useLocation();
  const { theme, isDarkMode } = useTheme();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const authenticated = await base44.auth.isAuthenticated();
      setIsAuthenticated(authenticated);
      setLoading(false);
    };
    checkAuth();

    // Log 404 for debugging (optional - you can remove this in production)
    console.warn('404 Error:', {
      path: location.pathname,
      referrer: document.referrer,
      timestamp: new Date().toISOString()
    });
  }, [location]);

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isDarkMode ? 'bg-zinc-950' : 'bg-zinc-100'}`}>
        <div 
          className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin"
          style={{ borderColor: theme.accent, borderTopColor: 'transparent' }}
        />
      </div>
    );
  }

  const quickActions = isAuthenticated ? [
    { icon: Home, label: 'Dashboard', page: 'Home' },
    { icon: Target, label: 'My Goals', page: 'Goals' },
    { icon: CheckSquare, label: 'My Habits', page: 'Habits' },
  ] : [
    { icon: Home, label: 'Home', page: 'Landing' },
  ];

  return (
    <div className={`min-h-screen flex items-center justify-center p-6 ${isDarkMode ? 'bg-zinc-950' : 'bg-zinc-100'}`}>
      <div className="max-w-2xl w-full text-center">
        {/* 404 Number */}
        <div className="mb-8">
          <h1 
            className="text-[120px] font-bold leading-none mb-2 opacity-20"
            style={{ color: theme.accent }}
          >
            404
          </h1>
        </div>

        {/* Main Message */}
        <GlassCard className="p-8 mb-6">
          <Compass className="w-12 h-12 mx-auto mb-4 opacity-40" style={{ color: theme.accent }} />
          
          <h2 className="text-2xl font-bold text-white mb-3">
            Page Not Found
          </h2>
          
          <p className="text-white/60 mb-6">
            This page may have moved or never existed. No worries — let's get you back on track.
          </p>

          {/* Primary CTA */}
          <Button
            onClick={() => navigate(createPageUrl(isAuthenticated ? 'Home' : 'Landing'))}
            style={{ backgroundColor: theme.accent }}
            className="text-white w-full mb-4"
            size="lg"
          >
            {isAuthenticated ? 'Go to Dashboard' : 'Go Home'}
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>

          {/* Secondary CTAs */}
          {isAuthenticated && (
            <div className="grid grid-cols-3 gap-3">
              {quickActions.map(({ icon: Icon, label, page }) => (
                <button
                  key={page}
                  onClick={() => navigate(createPageUrl(page))}
                  className={`
                    p-3 rounded-lg text-sm
                    transition-all
                    ${isDarkMode 
                      ? 'bg-white/5 hover:bg-white/10 text-white/70 hover:text-white' 
                      : 'bg-zinc-200/50 hover:bg-zinc-200 text-zinc-700 hover:text-zinc-900'
                    }
                  `}
                >
                  <Icon className="w-5 h-5 mx-auto mb-1" />
                  <span className="block text-xs">{label}</span>
                </button>
              ))}
            </div>
          )}
        </GlassCard>

        {/* Encouragement */}
        <p 
          className="text-sm font-medium"
          style={{ color: theme.accent }}
        >
          You're just one step away from momentum.
        </p>
      </div>
    </div>
  );
}