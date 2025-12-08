import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';

import { Separator } from '@/components/ui/separator';

/**
 * Drawer - A sliding panel component using Shadcn components
 * Implements focus trap and proper ARIA patterns
 */
export default function Drawer({ 
  isOpen, 
  onClose, 
  side = "right", 
  title, 
  headerExtra,
  children 
}) {
  const drawerRef = useRef(null);
  const closeButtonRef = useRef(null);

  // Focus management
  useEffect(() => {
    if (isOpen && closeButtonRef.current) {
      closeButtonRef.current.focus();
    }
  }, [isOpen]);

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Prevent body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const getSlideClasses = () => {
    switch (side) {
      case "left":
        return `left-0 top-0 bottom-0 
          w-[90vw] sm:w-[70vw] lg:w-[45vw] 
          max-w-[95vw] sm:max-w-[480px] lg:max-w-[540px]
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}`;
      case "right":
        return `right-0 top-0 bottom-0 
          w-[90vw] sm:w-[70vw] lg:w-[45vw] 
          max-w-[95vw] sm:max-w-[480px] lg:max-w-[540px]
          ${isOpen ? 'translate-x-0' : 'translate-x-full'}`;
      case "top":
        return `top-0 left-1/2 -translate-x-1/2
          w-[90vw] sm:w-[70vw] lg:w-[45vw] 
          max-w-[95vw] sm:max-w-[480px] lg:max-w-[540px]
          max-h-[85vh] rounded-b-3xl
          ${isOpen ? 'translate-y-0' : '-translate-y-full'}`;
      default:
        return `right-0 top-0 bottom-0 
          w-[90vw] sm:w-[70vw] lg:w-[45vw] 
          max-w-[95vw] sm:max-w-[480px] lg:max-w-[540px]
          ${isOpen ? 'translate-x-0' : 'translate-x-full'}`;
    }
  };

  const getBorderClass = () => {
    switch (side) {
      case "left": return "border-r border-white/[0.08] rounded-r-3xl sm:rounded-r-2xl";
      case "right": return "border-l border-white/[0.08] rounded-l-3xl sm:rounded-l-2xl";
      case "top": return "border-b border-white/[0.08]";
      default: return "border-l border-white/[0.08] rounded-l-3xl sm:rounded-l-2xl";
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className={`
          fixed inset-0 z-[140]
          bg-black/60 backdrop-blur-md
          transition-all duration-300 ease-out
          ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}
        `}
        onClick={onClose}
        aria-hidden="true"
      />
      
      {/* Drawer Panel */}
      <aside
        ref={drawerRef}
        className={`
          fixed z-[150]
          bg-zinc-950/90 dark:bg-zinc-950/90
          backdrop-blur-3xl backdrop-saturate-150
          shadow-2xl shadow-black/50
          transition-transform duration-300 ease-out
          flex flex-col
          ${getSlideClasses()}
          ${getBorderClass()}
        `}
        role="dialog"
        aria-modal="true"
        aria-labelledby="drawer-title"
        tabIndex={-1}
      >
        {/* Header */}
        <header className="flex items-center justify-between p-4 sm:p-5">
          <div className="flex items-center gap-3">
            <h2 
              id="drawer-title" 
              className="text-lg font-semibold text-white tracking-tight"
            >
              {title}
            </h2>
            {headerExtra}
          </div>
          <Button
            ref={closeButtonRef}
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="
              h-9 w-9 rounded-xl
              text-white/60 hover:text-white
              hover:bg-white/10
              focus-visible:ring-2 focus-visible:ring-white/30 focus-visible:ring-offset-0
              transition-all duration-200
            "
            aria-label="Close drawer"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </Button>
        </header>
        
        <Separator className="bg-white/[0.08]" />
        
        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-4 sm:p-5 pb-24">
            {children}
          </div>
        </div>
      </aside>
    </>
  );
}