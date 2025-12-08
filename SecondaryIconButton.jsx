import React from 'react';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

/**
 * SecondaryIconButton - Reusable outlined icon button with accent color
 */
export default function SecondaryIconButton({ 
  icon: Icon, 
  label, 
  onClick, 
  accentColor = '#3B82F6',
  isActive = false,
  className = '',
  size = 'default' // 'default' | 'small'
}) {
  const sizeClasses = size === 'small' 
    ? 'h-10 w-10' 
    : 'h-12 w-12';
  
  const iconSize = size === 'small' ? 'h-4 w-4' : 'h-5 w-5';

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClick}
          className={`
            ${sizeClasses}
            rounded-full
            bg-transparent
            border-2
            active:scale-95
            transition-all duration-200
            ${isActive ? 'bg-white/10' : ''}
            ${className}
          `}
          style={{ 
            borderColor: accentColor,
            color: accentColor,
          }}
          aria-label={label}
        >
          <Icon className={iconSize} aria-hidden="true" />
        </Button>
      </TooltipTrigger>
      <TooltipContent side="top" className="bg-zinc-900 text-white border-white/10">
        <p>{label}</p>
      </TooltipContent>
    </Tooltip>
  );
}