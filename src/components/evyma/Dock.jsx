import React, { useState, useRef, useEffect } from 'react';
import { Plus, Camera, Upload, Video, Mic, X, Keyboard, Send, Bell, LayoutGrid, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { hexToRgb } from '@/lib/utils';

/**
 * Dock - Futuristic hexagonal shield-shaped bottom bar with voice interface
 * Fully responsive for mobile, tablet, and desktop
 */
export default function Dock({ accentColor = '#3B82F6', onAction, onOpenNotifications, isAppsVisible = true, onToggleAppsVisibility }) {
  const [isPlusMenuOpen, setIsPlusMenuOpen] = useState(false);
  const [isTextMode, setIsTextMode] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const inputRef = useRef(null);

  useEffect(() => {
    if (isTextMode && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isTextMode]);

  const handleAction = (action) => {
    if (onAction) {
      onAction(action);
    }
    setIsPlusMenuOpen(false);
  };

  const handleSend = () => {
    if (inputValue.trim()) {
      handleAction({ type: 'message', text: inputValue });
      setInputValue('');
    }
  };

  const handleRecordClick = () => {
    setIsRecording(!isRecording);
    handleAction('voice');
  };

  const plusMenuItems = [
    { icon: Upload, label: 'Upload file', action: 'upload' },
    { icon: Camera, label: 'Camera', action: 'camera' },
    { icon: Video, label: 'Video', action: 'video' },
  ];

  const accentRgb = hexToRgb(accentColor);

  return (
    <TooltipProvider delayDuration={400}>
      <nav 
        className="fixed bottom-0 left-0 right-0 z-[140] pb-[env(safe-area-inset-bottom)] flex justify-center pointer-events-none"
        role="navigation"
        aria-label="Main actions"
      >
        {/* Text Input Mode */}
        {isTextMode ? (
          <div 
            className="pointer-events-auto mb-3 sm:mb-4 md:mb-6 mx-3 sm:mx-4 w-full max-w-[95vw] sm:max-w-[500px] p-3 sm:p-4 rounded-2xl bg-slate-950/80 backdrop-blur-xl"
            style={{
              border: `1.5px solid rgba(${accentRgb}, 0.4)`,
              boxShadow: `0 0 40px rgba(${accentRgb}, 0.2)`
            }}
          >
            <div className="flex flex-col gap-3">
              {/* Text Input */}
              <div className="relative">
                <Input
                  ref={inputRef}
                  type="text"
                  placeholder="Type here what you want to know..."
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSend();
                    if (e.key === 'Escape') {
                      setIsTextMode(false);
                      setInputValue('');
                    }
                  }}
                  className="w-full h-11 sm:h-12 pr-10 bg-white/[0.08] border-white/[0.1] rounded-xl text-white placeholder:text-white/40 focus-visible:ring-1 focus-visible:ring-white/20"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    setIsTextMode(false);
                    setInputValue('');
                    setIsPlusMenuOpen(false);
                  }}
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full text-white/40 hover:text-white/70 hover:bg-white/10"
                  aria-label="Close text input"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {/* Action Buttons Row */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <DockButton icon={Bell} label="Notifications" onClick={onOpenNotifications} accentRgb={accentRgb} size="sm" />
                  <DockButton icon={Plus} label="Attachments" onClick={() => setIsPlusMenuOpen(!isPlusMenuOpen)} accentRgb={accentRgb} isActive={isPlusMenuOpen} size="sm" />
                  <DockButton icon={Mic} label="Dictate" onClick={() => handleAction('dictate')} accentRgb={accentRgb} size="sm" />
                </div>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      onClick={handleSend}
                      disabled={!inputValue.trim()}
                      className="h-11 w-11 sm:h-12 sm:w-12 rounded-full text-white border-0 active:scale-95 transition-all duration-200 disabled:opacity-40"
                      style={{ 
                        backgroundColor: accentColor,
                        boxShadow: inputValue.trim() ? `0 0 20px rgba(${accentRgb}, 0.5)` : 'none'
                      }}
                      aria-label="Send message"
                    >
                      <Send className="h-4 w-4 sm:h-5 sm:w-5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="bg-zinc-900 text-white border-white/10">
                    <p>Send</p>
                  </TooltipContent>
                </Tooltip>
              </div>
            </div>

            {/* Plus Menu Popup */}
            {isPlusMenuOpen && (
              <div 
                className="absolute bottom-full left-3 sm:left-4 mb-3 flex gap-2 p-2.5 bg-zinc-900/95 backdrop-blur-xl rounded-2xl"
                style={{
                  border: `1px solid rgba(${accentRgb}, 0.3)`,
                  boxShadow: `0 8px 32px rgba(0,0,0,0.4), 0 0 20px rgba(${accentRgb}, 0.2)`
                }}
              >
                {plusMenuItems.map(({ icon: Icon, label, action }) => (
                  <Tooltip key={action}>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleAction(action)}
                        className="h-10 w-10 rounded-lg text-white/70 hover:text-white hover:bg-white/10"
                        aria-label={label}
                      >
                        <Icon className="h-5 w-5" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="top" className="bg-zinc-900 text-white border-white/10">
                      <p>{label}</p>
                    </TooltipContent>
                  </Tooltip>
                ))}
              </div>
            )}
          </div>
        ) : (
          /* Default Mode - Hexagonal Shield Shape - Responsive */
          <div className="relative pointer-events-auto w-[min(95vw,480px)] aspect-[2.4/1] max-w-[480px] mb-3 sm:mb-4 md:mb-6">
            {/* Outer glow */}
            <div 
              className="absolute inset-0 blur-3xl"
              style={{ background: `linear-gradient(135deg, rgba(${accentRgb}, 0.2), transparent, rgba(${accentRgb}, 0.2))` }}
            />
            
            {/* SVG Badge Shape with Circles - Responsive viewBox */}
            <svg className="absolute inset-0 w-full h-full" viewBox="230 210 230 90" preserveAspectRatio="xMidYMid meet">
              <defs>
                <linearGradient id="badgeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="rgba(10, 15, 30, 0.95)" />
                  <stop offset="50%" stopColor="rgba(15, 23, 42, 0.9)" />
                  <stop offset="100%" stopColor="rgba(10, 15, 30, 0.95)" />
                </linearGradient>
                <linearGradient id="borderGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor={`rgba(${accentRgb}, 0.4)`} />
                  <stop offset="50%" stopColor={`rgba(${accentRgb}, 0.8)`} />
                  <stop offset="100%" stopColor={`rgba(${accentRgb}, 0.4)`} />
                </linearGradient>
                <filter id="glow">
                  <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                  <feMerge>
                    <feMergeNode in="coloredBlur"/>
                    <feMergeNode in="SourceGraphic"/>
                  </feMerge>
                </filter>
              </defs>
              
              {/* Bottom curved path - main badge shape */}
              <path 
                d="M380.83636,251.45455C380.46253,247.15548 447.01818,253.27273 447.01818,253.27273C450.7565,253.45965 445.92727,282.36364 445.81818,282.18182C445.1796,287.59728 375.74545,288.54545 375.63636,288.36364C375.74545,288.54545 369.56363,294.36364 369.45455,294.18182C369.56363,294.36364 317.92727,294 317.81818,293.81818C317.92727,294 311.01818,288.18182 310.90909,288C242.60696,287.62107 242.2909,283.09091 242.18182,282.90909C237.43109,253.37128 240.83636,253.27273 240.72727,253.09091C307.1915,247.85217 307.01818,251.45455 307.01818,251.45455"
                fill="url(#badgeGradient)"
                stroke="url(#borderGradient)"
                strokeWidth="1"
                filter="url(#glow)"
              />
              
              {/* Main large circle - for primary button */}
              <path 
                d="M308.0528636276722,251.10100936889648 C308.0528636276722,230.65902041862023 324.38711777131863,214.10100936889648 344.5528636276722,214.10100936889648 C364.71860948402576,214.10100936889648 381.0528636276722,230.65902041862023 381.0528636276722,251.10100936889648 C381.0528636276722,271.54299831917274 364.71860948402576,288.1010093688965 344.5528636276722,288.1010093688965 C324.38711777131863,288.1010093688965 308.0528636276722,271.54299831917274 308.0528636276722,251.10100936889648 z"
                fill="none"
                stroke="url(#borderGradient)"
                strokeWidth="0"
                opacity="0"
              />
              
              {/* Small circles - for secondary buttons */}
              {/* Left button 1 */}
              <path 
                d="M248.1515104448124,268.22727180017546 C248.1515104448124,261.4216463575336 253.6640670533523,255.90908974899367 260.4696924959942,255.90908974899367 C267.2753179386361,255.90908974899367 272.787874547176,261.4216463575336 272.787874547176,268.22727180017546 C272.787874547176,275.03289724281734 267.2753179386361,280.54545385135725 260.4696924959942,280.54545385135725 C253.6640670533523,280.54545385135725 248.1515104448124,275.03289724281734 248.1515104448124,268.22727180017546 z"
                fill="none"
                stroke="url(#borderGradient)"
                strokeWidth="0"
                opacity="0"
              />
              
              {/* Left button 2 */}
              <path 
                d="M279.86868732922517,268.59090817464903 C279.86868732922517,261.78528273200715 285.3812439377651,256.27272612346724 292.18686938040696,256.27272612346724 C298.99249482304884,256.27272612346724 304.50505143158875,261.78528273200715 304.50505143158875,268.59090817464903 C304.50505143158875,275.3965336172909 298.99249482304884,280.9090902258308 292.18686938040696,280.9090902258308 C285.3812439377651,280.9090902258308 279.86868732922517,275.3965336172909 279.86868732922517,268.59090817464903 z"
                fill="none"
                stroke="url(#borderGradient)"
                strokeWidth="0"
                opacity="0"
              />
              
              {/* Right button 1 */}
              <path 
                d="M385.12121525161706,268.59090435995176 C385.12121525161706,261.7852789173099 390.63377186015697,256.27272230876997 397.43939730279885,256.27272230876997 C404.24502274544074,256.27272230876997 409.75757935398065,261.7852789173099 409.75757935398065,268.59090435995176 C409.75757935398065,275.39652980259365 404.24502274544074,280.90908641113356 397.43939730279885,280.90908641113356 C390.63377186015697,280.90908641113356 385.12121525161706,275.39652980259365 385.12121525161706,268.59090435995176 z"
                fill="none"
                stroke="url(#borderGradient)"
                strokeWidth="0"
                opacity="0"
              />
              
              {/* Right button 2 */}
              <path 
                d="M416.6363722657486,268.59090817464903 C416.6363722657486,261.78528273200715 422.1489288742885,256.27272612346724 428.9545543169304,256.27272612346724 C435.7601797595723,256.27272612346724 441.2727363681122,261.78528273200715 441.2727363681122,268.59090817464903 C441.2727363681122,275.3965336172909 435.7601797595723,280.9090902258308 428.9545543169304,280.9090902258308 C422.1489288742885,280.9090902258308 416.6363722657486,275.3965336172909 416.6363722657486,268.59090817464903 z"
                fill="none"
                stroke="url(#borderGradient)"
                strokeWidth="0"
                opacity="0"
              />
              
              {/* Bottom decorative line */}
              <line
                x1="250"
                y1="285"
                x2="440"
                y2="285"
                stroke={`rgba(${accentRgb}, 0.6)`}
                strokeWidth="0.75"
                filter="url(#glow)"
              />
            </svg>

            {/* Content - Responsive Sizing */}
            <div className="absolute inset-0 flex items-center justify-center pt-8 sm:pt-10 md:pt-12">
              <div className="relative flex items-center gap-2 sm:gap-3 md:gap-4">
                {/* Left buttons */}
                <div className="flex gap-1.5 sm:gap-2 mb-0">
                  <DockButton icon={Bell} label="Notifications" onClick={onOpenNotifications} accentRgb={accentRgb} />
                  <DockButton 
                    icon={isPlusMenuOpen ? X : Plus} 
                    label={isPlusMenuOpen ? 'Close' : 'Attachments'} 
                    onClick={() => setIsPlusMenuOpen(!isPlusMenuOpen)} 
                    accentRgb={accentRgb} 
                    isActive={isPlusMenuOpen}
                  />
                </div>

                {/* Center recording button - Responsive sizing */}
                <div className="relative mb-2 sm:mb-3 md:mb-4">
                  {/* Glow effect */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div 
                      className={`w-32 h-32 sm:w-40 sm:h-40 md:w-48 md:h-48 rounded-full blur-3xl transition-all duration-500 ${isRecording ? 'opacity-40' : 'opacity-25'}`}
                      style={{ backgroundColor: accentColor }}
                    />
                  </div>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        onClick={handleRecordClick}
                        className="relative w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 rounded-full transition-all duration-500 hover:scale-105 active:scale-95"
                        style={{
                          background: `linear-gradient(135deg, ${accentColor}, ${accentColor}cc)`,
                          boxShadow: isRecording 
                            ? `0 0 60px rgba(${accentRgb}, 0.6)` 
                            : `0 0 40px rgba(${accentRgb}, 0.5)`
                        }}
                        aria-label={isRecording ? 'Stop recording' : 'Start recording'}
                      >
                        {/* Waveform icon - Responsive sizing */}
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="flex items-end gap-1 sm:gap-1.5 md:gap-2">
                            <div className={`w-1.5 sm:w-2 bg-white rounded-full transition-all duration-300 ${isRecording ? 'h-4 sm:h-6 animate-pulse' : 'h-5 sm:h-8'}`} />
                            <div className={`w-1.5 sm:w-2 bg-white rounded-full transition-all duration-300 ${isRecording ? 'h-7 sm:h-10 animate-pulse' : 'h-10 sm:h-14'}`} style={{ animationDelay: '0.1s' }} />
                            <div className={`w-1.5 sm:w-2 bg-white rounded-full transition-all duration-300 ${isRecording ? 'h-11 sm:h-16 animate-pulse' : 'h-14 sm:h-20'}`} style={{ animationDelay: '0.2s' }} />
                            <div className={`w-1.5 sm:w-2 bg-white rounded-full transition-all duration-300 ${isRecording ? 'h-7 sm:h-10 animate-pulse' : 'h-10 sm:h-14'}`} style={{ animationDelay: '0.3s' }} />
                            <div className={`w-1.5 sm:w-2 bg-white rounded-full transition-all duration-300 ${isRecording ? 'h-4 sm:h-6 animate-pulse' : 'h-5 sm:h-8'}`} style={{ animationDelay: '0.4s' }} />
                          </div>
                        </div>

                        {/* Pulse rings when recording */}
                        {isRecording && (
                          <>
                            <div className="absolute inset-0 rounded-full border-2 border-blue-300 animate-ping opacity-75" />
                            <div className="absolute inset-0 rounded-full border-2 border-blue-300 animate-ping opacity-50" style={{ animationDelay: '0.5s' }} />
                          </>
                        )}
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="top" className="bg-zinc-900 text-white border-white/10">
                      <p>Live conversation</p>
                    </TooltipContent>
                  </Tooltip>
                </div>

                {/* Right buttons */}
                <div className="flex gap-1.5 sm:gap-2">
                  <DockButton icon={Keyboard} label="Type message" onClick={() => setIsTextMode(true)} accentRgb={accentRgb} />
                  <DockButton 
                    icon={isAppsVisible ? EyeOff : LayoutGrid} 
                    label={isAppsVisible ? "Hide apps" : "Show apps"} 
                    onClick={onToggleAppsVisibility} 
                    accentRgb={accentRgb}
                    isWarning={!isAppsVisible}
                  />
                </div>
              </div>
            </div>

            {/* Plus Menu Popup */}
            {isPlusMenuOpen && (
              <div 
                className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 flex gap-2 p-2.5 bg-zinc-900/95 backdrop-blur-xl rounded-2xl"
                style={{
                  border: `1px solid rgba(${accentRgb}, 0.3)`,
                  boxShadow: `0 8px 32px rgba(0,0,0,0.4), 0 0 20px rgba(${accentRgb}, 0.2)`
                }}
              >
                {plusMenuItems.map(({ icon: Icon, label, action }) => (
                  <Tooltip key={action}>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleAction(action)}
                        className="h-10 w-10 rounded-lg text-white/70 hover:text-white hover:bg-white/10"
                        aria-label={label}
                      >
                        <Icon className="h-5 w-5" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="top" className="bg-zinc-900 text-white border-white/10">
                      <p>{label}</p>
                    </TooltipContent>
                  </Tooltip>
                ))}
              </div>
            )}
          </div>
        )}
      </nav>
    </TooltipProvider>
  );
}

/* Circular dock button - Responsive */
function DockButton({ icon: Icon, label, onClick, accentRgb, isActive = false, isWarning = false, size = 'responsive' }) {
  // Responsive sizing: smaller on mobile, larger on desktop
  const sizeClasses = size === 'sm' 
    ? 'w-10 h-10' 
    : 'w-11 h-11 sm:w-12 sm:h-12 md:w-14 md:h-14';
  
  const iconSize = size === 'sm' 
    ? 'w-4 h-4' 
    : 'w-4 h-4 sm:w-4 sm:h-4 md:w-5 md:h-5';
  
  const borderColor = isWarning 
    ? 'rgba(239, 68, 68, 0.5)' 
    : isActive 
      ? `rgba(${accentRgb}, 0.7)` 
      : `rgba(${accentRgb}, 0.4)`;
  
  const hoverShadow = isWarning
    ? '0 0 20px rgba(239, 68, 68, 0.3)'
    : `0 0 20px rgba(${accentRgb}, 0.3)`;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          onClick={onClick}
          className={`
            ${sizeClasses} rounded-full 
            bg-slate-950/60 backdrop-blur-sm 
            flex items-center justify-center 
            transition-all duration-300 
            hover:scale-110 active:scale-95
            ${isActive ? 'scale-105' : ''}
          `}
          style={{
            border: `2px solid ${borderColor}`,
            boxShadow: isActive ? hoverShadow : 'none'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.boxShadow = hoverShadow;
            e.currentTarget.style.borderColor = isWarning ? 'rgba(239, 68, 68, 0.7)' : `rgba(${accentRgb}, 0.7)`;
            e.currentTarget.style.backgroundColor = isWarning ? 'rgba(239, 68, 68, 0.1)' : `rgba(${accentRgb}, 0.1)`;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.boxShadow = isActive ? hoverShadow : 'none';
            e.currentTarget.style.borderColor = borderColor;
            e.currentTarget.style.backgroundColor = 'rgba(2, 6, 23, 0.6)';
          }}
          aria-label={label}
        >
          <Icon className={`${iconSize} ${isWarning ? 'text-red-400' : ''}`} style={{ color: isWarning ? undefined : `rgba(${accentRgb}, 1)` }} />
        </button>
      </TooltipTrigger>
      <TooltipContent side="top" className="bg-zinc-900 text-white border-white/10">
        <p>{label}</p>
      </TooltipContent>
    </Tooltip>
  );
}