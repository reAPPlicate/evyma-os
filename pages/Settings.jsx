import React from 'react';
import { Settings as SettingsIcon, User, Bell, Lock, Palette, HelpCircle } from 'lucide-react';
import { useTheme, THEMES } from '@/components/theme/ThemeContext';
import GlassCard from '@/components/theme/GlassCard';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Check } from 'lucide-react';

export default function Settings() {
  const { isDarkMode, setIsDarkMode, activeTheme, setActiveTheme, theme } = useTheme();
  const accentColor = theme.accent;

  return (
    <div className="min-h-screen p-6 pb-32">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <div 
            className="w-16 h-16 rounded-3xl flex items-center justify-center"
            style={{ backgroundColor: `${accentColor}20` }}
          >
            <SettingsIcon className="w-8 h-8" style={{ color: accentColor }} />
          </div>
          <div>
            <h1 className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-zinc-900'}`}>
              Settings
            </h1>
            <p className={`text-sm ${isDarkMode ? 'text-white/60' : 'text-zinc-500'}`}>
              Customize your experience
            </p>
          </div>
        </div>

        {/* Appearance */}
        <GlassCard className="p-5">
          <div className="flex items-center gap-2 mb-4">
            <Palette className="w-5 h-5" style={{ color: accentColor }} />
            <h2 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-zinc-900'}`}>
              Appearance
            </h2>
          </div>

          <div className="space-y-4">
            {/* Theme Colors */}
            <div>
              <Label className={`text-sm mb-3 block ${isDarkMode ? 'text-white/80' : 'text-zinc-700'}`}>
                Theme Color
              </Label>
              <div className="grid grid-cols-6 gap-2">
                {THEMES.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setActiveTheme(t.id)}
                    className={`
                      relative aspect-square rounded-full
                      transition-all duration-200
                      hover:scale-110
                      ${activeTheme === t.id ? 'ring-2 ring-offset-2 scale-110' : ''}
                    `}
                    style={{ 
                      backgroundColor: t.color,
                      ringColor: accentColor,
                      ringOffsetColor: isDarkMode ? '#18181b' : '#ffffff'
                    }}
                  >
                    {activeTheme === t.id && (
                      <Check className="absolute inset-0 m-auto w-3 h-3 text-white drop-shadow" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            <Separator className={isDarkMode ? 'bg-white/10' : 'bg-zinc-200'} />

            {/* Dark Mode */}
            <div className="flex items-center justify-between">
              <Label htmlFor="dark-mode" className={`text-sm ${isDarkMode ? 'text-white/80' : 'text-zinc-700'}`}>
                Dark Mode
              </Label>
              <Switch
                id="dark-mode"
                checked={isDarkMode}
                onCheckedChange={setIsDarkMode}
              />
            </div>
          </div>
        </GlassCard>

        {/* Account */}
        <GlassCard className="p-5">
          <div className="flex items-center gap-2 mb-4">
            <User className="w-5 h-5" style={{ color: accentColor }} />
            <h2 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-zinc-900'}`}>
              Account
            </h2>
          </div>
          <p className={`text-sm ${isDarkMode ? 'text-white/60' : 'text-zinc-500'}`}>
            Profile and account management coming soon.
          </p>
        </GlassCard>

        {/* Notifications */}
        <GlassCard className="p-5">
          <div className="flex items-center gap-2 mb-4">
            <Bell className="w-5 h-5" style={{ color: accentColor }} />
            <h2 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-zinc-900'}`}>
              Notifications
            </h2>
          </div>
          <p className={`text-sm ${isDarkMode ? 'text-white/60' : 'text-zinc-500'}`}>
            Notification preferences coming soon.
          </p>
        </GlassCard>

        {/* Privacy */}
        <GlassCard className="p-5">
          <div className="flex items-center gap-2 mb-4">
            <Lock className="w-5 h-5" style={{ color: accentColor }} />
            <h2 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-zinc-900'}`}>
              Privacy & Security
            </h2>
          </div>
          <p className={`text-sm ${isDarkMode ? 'text-white/60' : 'text-zinc-500'}`}>
            Privacy settings and security options coming soon.
          </p>
        </GlassCard>

        {/* Help */}
        <GlassCard className="p-5">
          <div className="flex items-center gap-2 mb-4">
            <HelpCircle className="w-5 h-5" style={{ color: accentColor }} />
            <h2 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-zinc-900'}`}>
              Help & Support
            </h2>
          </div>
          <p className={`text-sm ${isDarkMode ? 'text-white/60' : 'text-zinc-500'}`}>
            Help resources and support options coming soon.
          </p>
        </GlassCard>
      </div>
    </div>
  );
}