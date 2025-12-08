import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';

import Dock from '../components/evyma/Dock';
import Drawer from '../components/evyma/Drawer';
import AppLauncher from '../components/evyma/AppLauncher';
import DynamicFeed from '../components/evyma/DynamicFeed';
import EvymaInsights from '../components/evyma/EvymaInsights';
import { useTheme, THEMES } from '@/components/theme/ThemeContext';
import { Check, Columns3, Columns4 } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

export default function Home() {
    const { isDarkMode, setIsDarkMode, activeTheme, setActiveTheme, theme } = useTheme();
    const [settingsOpen, setSettingsOpen] = useState(false);
    const [gridColumns, setGridColumns] = useState(4);
    const [isEditMode, setIsEditMode] = useState(false);
    const [appOrder, setAppOrder] = useState(null);
    const [isAppsVisible, setIsAppsVisible] = useState(true);
    const [authChecked, setAuthChecked] = useState(false);

  // Auth check
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const isAuth = await base44.auth.isAuthenticated();
        if (!isAuth) {
          base44.auth.redirectToLogin('/Home');
          return;
        }
        setAuthChecked(true);
      } catch {
        base44.auth.redirectToLogin('/Home');
      }
    };
    checkAuth();
  }, []);

  if (!authChecked) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isDarkMode ? 'bg-zinc-950' : 'bg-zinc-100'}`}>
        <div 
          className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin"
          style={{ borderColor: theme.accent, borderTopColor: 'transparent' }}
        />
      </div>
    );
  }

  const handleDockAction = (action) => {
    console.log('Dock action:', action);
  };

  const handleAppsReorder = (newOrder) => {
    setAppOrder(newOrder);
    // TODO: Persist to user entity
    console.log('New app order:', newOrder);
  };

  return (
    <div className="relative">{/* Home content only - Layout handles background/dock */}
      




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
          {isAppsVisible ? (
            <AppLauncher
              accentColor={theme.accent}
              columns={gridColumns}
              apps={appOrder}
              onAppsReorder={handleAppsReorder}
              isEditMode={isEditMode}
              onToggleEditMode={() => setIsEditMode(!isEditMode)}
              onOpenSettings={() => setSettingsOpen(true)}
              onOpenTimer={() => setTimerOpen(true)}
            />
          ) : (
            <DynamicFeed accentColor={theme.accent} />
          )}
        </div>
      </main>

      {/* Evyma Insights - Sticky above dock when feed is visible */}
      {!isAppsVisible && (
        <div className="fixed bottom-36 sm:bottom-40 md:bottom-44 left-0 right-0 z-[130] px-4">
          <div className="max-w-lg mx-auto">
            <EvymaInsights accentColor={theme.accent} />
          </div>
        </div>
      )}

      {/* Home-specific Dock integration */}
      <Dock 
        accentColor={theme.accent} 
        onAction={handleDockAction}
        isAppsVisible={isAppsVisible}
        onToggleAppsVisibility={() => setIsAppsVisible(!isAppsVisible)}
      />

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