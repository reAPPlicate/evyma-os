import React, { useState, useEffect } from 'react';

import Dock from '../components/evyma/Dock';
import Drawer from '../components/evyma/Drawer';
import AppLauncher from '../components/evyma/AppLauncher';
import FocusTimer from '../components/evyma/FocusTimer';
import { Bell, Check, Columns3, Columns4, Timer } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

/**
 * Home - Evyma's native mobile-style home screen
 */

// Theme options
const THEMES = [
  { id: 'blue', color: '#3B82F6' },
  { id: 'indigo', color: '#6366F1' },
  { id: 'cyan', color: '#06B6D4' },
  { id: 'teal', color: '#14B8A6' },
  { id: 'green', color: '#22C55E' },
  { id: 'purple', color: '#8B5CF6' },
  { id: 'amber', color: '#F59E0B' },
  { id: 'orange', color: '#F97316' },
  { id: 'red', color: '#EF4444' },
  { id: 'rose', color: '#F43F5E' },
  { id: 'pink', color: '#EC4899' },
  { id: 'neutral', color: '#71717A' },
];

// Helper to generate theme gradient classes from color ID
const getThemeGradients = (themeId) => {
  const gradientMap = {
    blue: { gradientFrom: 'from-blue-600/20', gradientVia: 'via-blue-900/10', lightGradientFrom: 'from-blue-100', lightGradientVia: 'via-blue-50/50' },
    indigo: { gradientFrom: 'from-indigo-600/20', gradientVia: 'via-indigo-900/10', lightGradientFrom: 'from-indigo-100', lightGradientVia: 'via-indigo-50/50' },
    cyan: { gradientFrom: 'from-cyan-600/20', gradientVia: 'via-cyan-900/10', lightGradientFrom: 'from-cyan-100', lightGradientVia: 'via-cyan-50/50' },
    teal: { gradientFrom: 'from-teal-600/20', gradientVia: 'via-teal-900/10', lightGradientFrom: 'from-teal-100', lightGradientVia: 'via-teal-50/50' },
    green: { gradientFrom: 'from-green-600/20', gradientVia: 'via-green-900/10', lightGradientFrom: 'from-green-100', lightGradientVia: 'via-green-50/50' },
    purple: { gradientFrom: 'from-purple-600/20', gradientVia: 'via-purple-900/10', lightGradientFrom: 'from-purple-100', lightGradientVia: 'via-purple-50/50' },
    amber: { gradientFrom: 'from-amber-600/20', gradientVia: 'via-amber-900/10', lightGradientFrom: 'from-amber-100', lightGradientVia: 'via-amber-50/50' },
    orange: { gradientFrom: 'from-orange-600/20', gradientVia: 'via-orange-900/10', lightGradientFrom: 'from-orange-100', lightGradientVia: 'via-orange-50/50' },
    red: { gradientFrom: 'from-red-600/20', gradientVia: 'via-red-900/10', lightGradientFrom: 'from-red-100', lightGradientVia: 'via-red-50/50' },
    rose: { gradientFrom: 'from-rose-600/20', gradientVia: 'via-rose-900/10', lightGradientFrom: 'from-rose-100', lightGradientVia: 'via-rose-50/50' },
    pink: { gradientFrom: 'from-pink-600/20', gradientVia: 'via-pink-900/10', lightGradientFrom: 'from-pink-100', lightGradientVia: 'via-pink-50/50' },
    neutral: { gradientFrom: 'from-zinc-600/20', gradientVia: 'via-zinc-900/10', lightGradientFrom: 'from-zinc-200', lightGradientVia: 'via-zinc-100/50' },
  };
  return { ...gradientMap[themeId], gradientTo: 'to-transparent' };
};

export default function Home() {
    const [isDarkMode, setIsDarkMode] = useState(true);
    const [activeTheme, setActiveTheme] = useState('blue');
    const [notificationsOpen, setNotificationsOpen] = useState(false);
    const [settingsOpen, setSettingsOpen] = useState(false);
    const [timerOpen, setTimerOpen] = useState(false);
    const [gridColumns, setGridColumns] = useState(4);
    const [isEditMode, setIsEditMode] = useState(false);
    const [appOrder, setAppOrder] = useState(null);
  const [isAppsVisible, setIsAppsVisible] = useState(true);

  const currentTheme = THEMES.find(t => t.id === activeTheme) || THEMES[0];
  const theme = { accent: currentTheme.color, ...getThemeGradients(activeTheme) };

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const handleDockAction = (action) => {
    console.log('Dock action:', action);
  };

  return (
    <div className={`
      min-h-screen
      transition-colors duration-500 ease-out
      ${isDarkMode ? 'bg-zinc-950' : 'bg-zinc-100'}
    `}>
      {/* Background Gradient Layer */}
      <div 
        className={`
          fixed inset-0 pointer-events-none
          transition-opacity duration-700 ease-out
          ${isDarkMode 
            ? `bg-gradient-to-br ${theme.gradientFrom} ${theme.gradientVia} ${theme.gradientTo}` 
            : `bg-gradient-to-br ${theme.lightGradientFrom} ${theme.lightGradientVia} to-white`
          }
        `} 
        aria-hidden="true"
      />
      




      {/* Main Content Area */}
      <main 
        className="
          relative z-[110]
          min-h-screen
          pt-6 sm:pt-8
          pb-40 sm:pb-44
          px-4 sm:px-6 lg:px-8
        "
        role="main"
        aria-label="Home screen"
      >
        <div className="max-w-lg mx-auto">
          {isAppsVisible && (
            <AppLauncher
              accentColor={theme.accent}
              columns={gridColumns}
              apps={appOrder}
              isEditMode={isEditMode}
              onToggleEditMode={() => setIsEditMode(!isEditMode)}
              onOpenSettings={() => setSettingsOpen(true)}
              onOpenTimer={() => setTimerOpen(true)}
            />
          )}
        </div>
      </main>

      {/* Dock */}
      <Dock 
        accentColor={theme.accent} 
        onAction={handleDockAction}
        onOpenNotifications={() => setNotificationsOpen(true)}
        isAppsVisible={isAppsVisible}
        onToggleAppsVisibility={() => setIsAppsVisible(!isAppsVisible)}
      />

      {/* Notifications Drawer */}
      <Drawer
        isOpen={notificationsOpen}
        onClose={() => setNotificationsOpen(false)}
        side="top"
        title="Notifications"
      >
        <div className="space-y-4">
          <div className="text-center py-12">
            <Bell className="w-12 h-12 mx-auto mb-4 text-white/20" aria-hidden="true" />
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

      {/* Settings Drawer */}
      <Drawer
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        side="top"
        title="Settings"
      >
        <div className="space-y-6">
          {/* Appearance Section */}
          <section aria-labelledby="appearance-heading">
            <h4 
              id="appearance-heading" 
              className="text-xs font-semibold text-white/50 mb-4 uppercase tracking-widest"
            >
              Appearance
            </h4>
            <div className="space-y-4">
              {/* Inline Theme Color Selector */}
              <div className="
                p-4 rounded-xl
                bg-white/[0.04]
                border border-white/[0.06]
              ">
                <Label className="text-sm text-white/80 mb-3 block">Theme Color</Label>
                <div 
                  className="grid grid-cols-6 gap-2"
                  role="radiogroup"
                  aria-label="Theme colors"
                >
                  {THEMES.map((t) => (
                    <button
                      key={t.id}
                      role="radio"
                      aria-checked={activeTheme === t.id}
                      aria-label={`${t.id} theme`}
                      onClick={() => setActiveTheme(t.id)}
                      className={`
                        relative aspect-square rounded-full
                        transition-all duration-200
                        hover:scale-110
                        focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950
                        ${activeTheme === t.id ? 'ring-2 ring-white scale-110' : ''}
                      `}
                      style={{ backgroundColor: t.color }}
                    >
                      {activeTheme === t.id && (
                        <Check className="absolute inset-0 m-auto w-3 h-3 text-white drop-shadow" aria-hidden="true" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="
                w-full p-4 rounded-xl
                flex items-center justify-between
                bg-white/[0.04]
                border border-white/[0.06]
              ">
                <Label 
                  htmlFor="dark-mode-toggle" 
                  className="text-sm text-white/80 cursor-pointer"
                >
                  Dark Mode
                </Label>
                <Switch
                  id="dark-mode-toggle"
                  checked={isDarkMode}
                  onCheckedChange={setIsDarkMode}
                  className="data-[state=checked]:bg-white/30"
                />
              </div>
              </div>
              </section>

              <Separator className="bg-white/[0.06]" />

              {/* Layout Section */}
              <section aria-labelledby="layout-heading">
              <h4 
              id="layout-heading" 
              className="text-xs font-semibold text-white/50 mb-4 uppercase tracking-widest"
              >
              Layout
              </h4>
              <div className="
              p-4 rounded-xl
              bg-white/[0.04]
              border border-white/[0.06]
              ">
              <Label className="text-sm text-white/80 mb-3 block">App Grid Columns</Label>
                  <RadioGroup
                value={String(gridColumns)}
                onValueChange={(val) => setGridColumns(Number(val))}
                className="flex gap-3"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="3" id="col-3" className="border-white/30 text-white" />
                  <Label htmlFor="col-3" className="text-sm text-white/70 cursor-pointer flex items-center gap-1">
                    <Columns3 className="w-4 h-4" /> 3
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="4" id="col-4" className="border-white/30 text-white" />
                  <Label htmlFor="col-4" className="text-sm text-white/70 cursor-pointer flex items-center gap-1">
                    <Columns4 className="w-4 h-4" /> 4
                  </Label>
                </div>
              </RadioGroup>
              </div>

              {/* Edit Apps Toggle */}
              <div className="
                w-full p-4 rounded-xl mt-4
                flex items-center justify-between
                bg-white/[0.04]
                border border-white/[0.06]
              ">
                <Label 
                  htmlFor="edit-apps-toggle" 
                  className="text-sm text-white/80 cursor-pointer"
                >
                  Rearrange Apps
                </Label>
                <Switch
                  id="edit-apps-toggle"
                  checked={isEditMode}
                  onCheckedChange={setIsEditMode}
                  className="data-[state=checked]:bg-white/30"
                />
              </div>
              </section>

          <Separator className="bg-white/[0.06]" />

          {/* Account Section */}
          <section aria-labelledby="account-heading">
            <h4 
              id="account-heading" 
              className="text-xs font-semibold text-white/50 mb-4 uppercase tracking-widest"
            >
              Account
            </h4>
            <div className="
              p-5 rounded-xl 
              bg-white/[0.04] 
              border border-white/[0.06]
              text-center
            ">
              <p className="text-sm text-white/40">Account settings placeholder</p>
            </div>
          </section>

          <Separator className="bg-white/[0.06]" />

          {/* About Section */}
          <section aria-labelledby="about-heading">
            <h4 
              id="about-heading" 
              className="text-xs font-semibold text-white/50 mb-4 uppercase tracking-widest"
            >
              About
            </h4>
            <div className="
              p-5 rounded-xl 
              bg-white/[0.04]
              border border-white/[0.06]
              text-center
            ">
              <p className="text-sm text-white/40 font-medium">Evyma v1.0.0</p>
            </div>
          </section>
        </div>
      </Drawer>


    </div>
  );
}