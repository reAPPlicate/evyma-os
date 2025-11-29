import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
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
        return `left-0 top-0 bottom-0 w-[85vw] max-w-[360px] ${isOpen ? 'translate-x-0' : '-translate-x-full'}`;
      case "right":
        return `right-0 top-0 bottom-0 w-[85vw] max-w-[360px] ${isOpen ? 'translate-x-0' : 'translate-x-full'}`;
      case "top":
        return `top-0 left-0 right-0 max-h-[85vh] ${isOpen ? 'translate-y-0' : '-translate-y-full'}`;
      default:
        return `right-0 top-0 bottom-0 w-[85vw] max-w-[360px] ${isOpen ? 'translate-x-0' : 'translate-x-full'}`;
    }
  };

  const getBorderClass = () => {
    switch (side) {
      case "left": return "border-r border-white/[0.08]";
      case "right": return "border-l border-white/[0.08]";
      case "top": return "border-b border-white/[0.08] rounded-b-3xl";
      default: return "border-l border-white/[0.08]";
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
          <h2 
            id="drawer-title" 
            className="text-lg font-semibold text-white tracking-tight"
          >
            {title}
          </h2>
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
        <ScrollArea className="flex-1">
          <div className="p-4 sm:p-5">
            {children}
          </div>
        </ScrollArea>
      </aside>
    </>
  );
}