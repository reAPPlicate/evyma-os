import React from 'react';
import { 
  Settings, User, Calendar, Target, Flag, 
  BarChart3, CreditCard, Gift, Repeat, Heart,
  BookOpen, Bell, Compass, Zap, Star, Timer, Shield
} from 'lucide-react';

// Icon mapping
const ICON_MAP = {
  settings: Settings,
  profile: User,
  calendar: Calendar,
  goals: Target,
  milestones: Flag,
  stats: BarChart3,
  billing: CreditCard,
  rewards: Gift,
  habits: Repeat,
  health: Heart,
  journal: BookOpen,
  notifications: Bell,
  explore: Compass,
  energy: Zap,
  favorites: Star,
  timer: Timer,
  admin: Shield,
};

/**
 * AppIcon - Single app launcher icon with label
 */
export default function AppIcon({ 
  id,
  label, 
  icon = 'settings',
  accentColor = '#3B82F6',
  onClick,
  isDragging = false,
}) {
  const IconComponent = ICON_MAP[icon] || Settings;

  return (
    <button
      onClick={onClick}
      className={`
        flex flex-col items-center justify-center gap-2
        p-4 rounded-2xl
        transition-all duration-200
        hover:scale-105 active:scale-95
        focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2
        ${isDragging 
          ? 'opacity-50 scale-105 shadow-2xl' 
          : 'opacity-100'
        }
      `}
      style={{
        focusVisibleRingColor: accentColor,
      }}
      aria-label={`Open ${label}`}
    >
      {/* Icon Container */}
      <div 
        className="
          w-14 h-14 sm:w-16 sm:h-16
          rounded-2xl
          flex items-center justify-center
          shadow-lg
          transition-all duration-200
        "
        style={{
          backgroundColor: `${accentColor}20`,
          border: `1.5px solid ${accentColor}40`,
        }}
      >
        <IconComponent 
          className="w-7 h-7 sm:w-8 sm:h-8" 
          style={{ color: accentColor }}
          aria-hidden="true" 
        />
      </div>
      
      {/* Label */}
      <span className="
        text-xs sm:text-sm font-medium
        text-zinc-600 dark:text-white/70
        text-center truncate w-full
      ">
        {label}
      </span>
    </button>
  );
}