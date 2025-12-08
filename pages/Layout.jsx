
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ThemeProvider, useTheme } from '@/components/theme/ThemeContext';
import ThemedBackground from '@/components/theme/ThemedBackground';
import Dock from '@/components/evyma/Dock';
import Drawer from '@/components/evyma/Drawer';
import FocusTimer from '@/components/evyma/FocusTimer';
import RealtimeConversation from '@/components/evyma/RealtimeConversation';
import OfflineDetector from '@/components/OfflineDetector';
import ToastProvider from '@/components/ToastProvider';
import PageTransition from '@/components/PageTransition';
import { Clock, Bell, Home as HomeIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';

// Context for page-aware actions
const DockContext = createContext(null);

export function useDockContext() {
  return useContext(DockContext);
}

function RealtimeSessionTimer({ isOpen, accentColor }) {
  const [seconds, setSeconds] = useState(0);
  
  useEffect(() => {
    if (!isOpen) {
      setSeconds(0);
      return;
    }
    const interval = setInterval(() => setSeconds(s => s + 1), 1000);
    return () => clearInterval(interval);
  }, [isOpen]);

  const formatTime = (s) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!isOpen) return null;

  return (
    <div className="flex items-center gap-1.5 text-sm text-white/60">
      <Clock className="w-3.5 h-3.5" style={{ color: accentColor }} />
      <span className="font-mono">{formatTime(seconds)}</span>
    </div>
  );
}

function LayoutContent({ children }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { isDarkMode, theme } = useTheme();
  
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [timerOpen, setTimerOpen] = useState(false);
  const [realtimeOpen, setRealtimeOpen] = useState(false);

  // Determine current page context
  const currentRoute = location.pathname;
  const pageContext = {
    route: currentRoute,
    actions: getActionsForRoute(currentRoute),
    pageGreeting: getPageGreeting(currentRoute)
  };

  // Pages where Dock should NOT appear
  const noDockPages = ['/auth', '/onboarding', '/trial-expired'];
  const shouldShowDock = !noDockPages.some(path => currentRoute.startsWith(path));

  // Pages where Home button should NOT appear (removed - using dynamic Dock button instead)
  const shouldShowHomeButton = false;

  const handleDockAction = (action) => {
    console.log('Dock action:', action, 'on page:', currentRoute);
  };

  return (
    <DockContext.Provider value={pageContext}>
      <div className={`
        min-h-screen
        transition-colors duration-500 ease-out
        ${isDarkMode ? 'bg-zinc-950' : 'bg-zinc-100'}
      `}>
        <ThemedBackground />
        <OfflineDetector />
        <ToastProvider />



        {/* Main Content with Page Transitions */}
        <main className="relative z-10">
          <PageTransition>
            {children}
          </PageTransition>
        </main>

        {/* Global Dock */}
        {shouldShowDock && (
          <Dock 
            accentColor={theme.accent} 
            onAction={handleDockAction}
            onOpenNotifications={() => setNotificationsOpen(true)}
            onOpenRealtime={() => setRealtimeOpen(true)}
          />
        )}

        {/* Notifications Drawer */}
        <Drawer
          isOpen={notificationsOpen}
          onClose={() => setNotificationsOpen(false)}
          side="top"
          title="Notifications"
        >
          <div className="space-y-4">
            <div className="text-center py-12">
              <Bell className="w-12 h-12 mx-auto mb-4 text-white/20" />
              <p className="text-white/40 text-sm">No notifications yet</p>
            </div>
          </div>
        </Drawer>

        {/* Focus Timer Drawer */}
        <Drawer
          isOpen={timerOpen}
          onClose={() => setTimerOpen(false)}
          side="top"
          title="Focus Timer"
        >
          <FocusTimer 
            accentColor={theme.accent}
            isOpen={timerOpen}
            onClose={() => setTimerOpen(false)}
          />
        </Drawer>

        {/* Realtime Conversation Drawer */}
        <Drawer
          isOpen={realtimeOpen}
          onClose={() => setRealtimeOpen(false)}
          side="top"
          title="Live Session"
          headerExtra={
            <RealtimeSessionTimer isOpen={realtimeOpen} accentColor={theme.accent} />
          }
        >
          <RealtimeConversation 
            accentColor={theme.accent}
            isOpen={realtimeOpen}
            onClose={() => setRealtimeOpen(false)}
            pageContext={pageContext}
          />
        </Drawer>
      </div>
    </DockContext.Provider>
  );
}

// Map routes to available voice actions (for future voice command integration)
function getActionsForRoute(route) {
  const actionsMap = {
    '/goals': ['create_goal', 'update_progress', 'complete_goal', 'show_details'],
    '/habits': ['add_habit', 'track_habit', 'show_streak', 'check_in'],
    '/dashboard': ['summarize_week', 'start_session', 'show_insights'],
    '/admin': ['view_metrics', 'manage_users', 'export_data'],
    '/': ['show_apps', 'start_session', 'open_timer']
  };

  return actionsMap[route] || [];
}

// Context-aware greetings for AI agent
function getPageGreeting(route) {
  const greetingsMap = {
    '/goals': 'Welcome back. What goal would you like to work on today?',
    '/habits': 'Ready to build your habits? Let me help you stay consistent.',
    '/dashboard': 'Welcome back! How are you feeling today?',
    '/admin': 'Hello admin. What would you like to manage today?',
    '/': 'Hi there! What would you like to do today?'
  };

  return greetingsMap[route] || 'Hi there! How can I help you today?';
}

export default function Layout({ children }) {
  return (
    <ThemeProvider>
      <LayoutContent>{children}</LayoutContent>
    </ThemeProvider>
  );
}
