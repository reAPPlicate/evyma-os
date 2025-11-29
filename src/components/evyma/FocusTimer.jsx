import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, Square, RotateCcw, Clock, Timer, Bell, Save, Volume2, VolumeX, Plus, History, Settings, ChevronDown, ChevronUp, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { hexToRgb } from '@/lib/utils';

/**
 * FocusTimer - Integrated timer with multiple modes, techniques, and session tracking
 * Styled to match Evyma's design language
 */
export default function FocusTimer({ 
  accentColor = '#3B82F6',
  isOpen,
  onClose,
  onOpenWidget
}) {
  // State Management
  const [mode, setMode] = useState('timer');
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [time, setTime] = useState(1500);
  const [targetTime, setTargetTime] = useState(1500);
  const [sessionStart, setSessionStart] = useState(null);
  const [sessionEnd, setSessionEnd] = useState(null);
  const [showNotes, setShowNotes] = useState(false);
  const [sessionNotes, setSessionNotes] = useState('');
  const [sessions, setSessions] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  
  // Sound settings
  const [ambientSound, setAmbientSound] = useState('none');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [ambientVolume, setAmbientVolume] = useState(0.3);
  
  // Technique settings
  const [technique, setTechnique] = useState('custom');
  const [intervalMode, setIntervalMode] = useState(false);
  const [workDuration, setWorkDuration] = useState(25);
  const [breakDuration, setBreakDuration] = useState(5);
  const [currentPhase, setCurrentPhase] = useState('work');
  const [cycleCount, setCycleCount] = useState(0);
  
  // Templates
  const [showTemplates, setShowTemplates] = useState(false);
  
  const intervalRef = useRef(null);
  const audioContextRef = useRef(null);
  const oscillatorRef = useRef(null);
  const gainNodeRef = useRef(null);

  const accentRgb = hexToRgb(accentColor);

  const techniques = {
    pomodoro: { work: 25, break: 5, longBreak: 15, cycles: 4, name: 'Pomodoro' },
    '52-17': { work: 52, break: 17, name: '52-17 Method' },
    '90-20': { work: 90, break: 20, name: '90-20 Ultradian' },
    custom: { work: workDuration, break: breakDuration, name: 'Custom' }
  };

  const templates = [
    { name: 'Quick Focus', duration: 15, technique: 'custom' },
    { name: 'Deep Work', duration: 90, technique: '90-20' },
    { name: 'Pomodoro', duration: 25, technique: 'pomodoro' },
    { name: 'Power Hour', duration: 60, technique: 'custom' },
    { name: '52-17 Session', duration: 52, technique: '52-17' }
  ];

  const ambientSounds = [
    { id: 'none', name: 'None', freq: null },
    { id: 'white-noise', name: 'White Noise', freq: 440 },
    { id: 'brown-noise', name: 'Brown Noise', freq: 220 },
    { id: 'rain', name: 'Rain', freq: 330 },
    { id: 'ocean', name: 'Ocean Waves', freq: 280 },
    { id: 'forest', name: 'Forest', freq: 350 }
  ];

  // Timer Logic
  useEffect(() => {
    if (isRunning && !isPaused) {
      intervalRef.current = setInterval(() => {
        setTime(prevTime => {
          if (mode === 'timer') {
            if (prevTime <= 0) {
              handleTimerComplete();
              return 0;
            }
            return prevTime - 1;
          } else if (mode === 'stopwatch') {
            return prevTime + 1;
          } else if (mode === 'alarm') {
            const now = new Date().getTime();
            const target = new Date(targetTime).getTime();
            if (now >= target) {
              handleTimerComplete();
              return 0;
            }
            return Math.floor((target - now) / 1000);
          }
          return prevTime;
        });
      }, 1000);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, isPaused, mode, targetTime]);

  // Ambient Sound Management
  useEffect(() => {
    if (isRunning && !isPaused && ambientSound !== 'none' && soundEnabled) {
      startAmbientSound();
    } else {
      stopAmbientSound();
    }

    return () => stopAmbientSound();
  }, [isRunning, isPaused, ambientSound, soundEnabled, ambientVolume]);

  const startAmbientSound = () => {
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
      }

      const ctx = audioContextRef.current;
      const selectedSound = ambientSounds.find(s => s.id === ambientSound);
      
      if (selectedSound && selectedSound.freq) {
        oscillatorRef.current = ctx.createOscillator();
        gainNodeRef.current = ctx.createGain();
        
        oscillatorRef.current.type = ambientSound === 'white-noise' ? 'white' : 'sine';
        oscillatorRef.current.frequency.setValueAtTime(selectedSound.freq, ctx.currentTime);
        
        gainNodeRef.current.gain.setValueAtTime(ambientVolume, ctx.currentTime);
        
        oscillatorRef.current.connect(gainNodeRef.current);
        gainNodeRef.current.connect(ctx.destination);
        
        oscillatorRef.current.start();
      }
    } catch (error) {
      console.error('Audio context error:', error);
    }
  };

  const stopAmbientSound = () => {
    if (oscillatorRef.current) {
      try {
        oscillatorRef.current.stop();
        oscillatorRef.current.disconnect();
      } catch (e) {}
      oscillatorRef.current = null;
    }
    if (gainNodeRef.current) {
      try {
        gainNodeRef.current.disconnect();
      } catch (e) {}
      gainNodeRef.current = null;
    }
  };

  const playNotificationSound = () => {
    if (!soundEnabled) return;
    
    try {
      const ctx = audioContextRef.current || new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);
      
      oscillator.frequency.setValueAtTime(880, ctx.currentTime);
      gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
      
      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + 0.5);
    } catch (error) {
      console.error('Notification sound error:', error);
    }
  };

  const handleTimerComplete = () => {
    setIsRunning(false);
    setIsPaused(false);
    setSessionEnd(new Date().toISOString());
    playNotificationSound();
    
    if (intervalMode && technique !== 'custom') {
      handleIntervalComplete();
    } else {
      setShowNotes(true);
    }
  };

  const handleIntervalComplete = () => {
    const currentTechnique = techniques[technique];
    
    if (currentPhase === 'work') {
      setCycleCount(prev => prev + 1);
      
      if (technique === 'pomodoro' && (cycleCount + 1) % currentTechnique.cycles === 0) {
        setCurrentPhase('longBreak');
        setTime(currentTechnique.longBreak * 60);
      } else {
        setCurrentPhase('break');
        setTime(currentTechnique.break * 60);
      }
    } else {
      setCurrentPhase('work');
      setTime(currentTechnique.work * 60);
    }
    
    setTimeout(() => {
      setIsRunning(true);
      setSessionStart(new Date().toISOString());
    }, 1000);
  };

  const handleStart = () => {
    if (!isRunning) {
      setSessionStart(new Date().toISOString());
      setIsRunning(true);
      setIsPaused(false);
      playNotificationSound();
    }
  };

  const handlePause = () => {
    setIsPaused(!isPaused);
  };

  const handleStop = () => {
    setIsRunning(false);
    setIsPaused(false);
    setSessionEnd(new Date().toISOString());
    setShowNotes(true);
  };

  const handleReset = () => {
    setIsRunning(false);
    setIsPaused(false);
    setTime(mode === 'timer' ? targetTime : 0);
    setSessionStart(null);
    setSessionEnd(null);
    setCycleCount(0);
    setCurrentPhase('work');
  };

  const saveSession = () => {
    const session = {
      id: Date.now(),
      mode,
      technique: intervalMode ? technique : 'none',
      startTime: sessionStart,
      endTime: sessionEnd || new Date().toISOString(),
      duration: mode === 'stopwatch' ? time : (targetTime - time),
      targetDuration: mode === 'timer' ? targetTime : null,
      completed: mode === 'timer' ? time === 0 : true,
      notes: sessionNotes,
      ambientSound,
      phase: currentPhase,
      cycles: cycleCount
    };
    
    setSessions(prev => [session, ...prev]);
    setSessionNotes('');
    setShowNotes(false);
    handleReset();
  };

  const applyTemplate = (template) => {
    setMode('timer');
    setTechnique(template.technique);
    setTargetTime(template.duration * 60);
    setTime(template.duration * 60);
    
    if (template.technique !== 'custom') {
      setIntervalMode(true);
      const tech = techniques[template.technique];
      setWorkDuration(tech.work);
      setBreakDuration(tech.break);
    }
    
    setShowTemplates(false);
  };

  const formatTime = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hrs > 0) {
      return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDate = (isoString) => {
    if (!isoString) return '';
    const date = new Date(isoString);
    return date.toLocaleString();
  };

  const getProgressPercentage = () => {
    if (mode === 'timer' && targetTime > 0) {
      return ((targetTime - time) / targetTime) * 100;
    }
    return 0;
  };

  // Main panel styles matching your app
  const panelStyle = {
    background: 'rgba(9, 9, 11, 0.95)',
    border: `1px solid rgba(${accentRgb}, 0.2)`,
  };

  const cardStyle = {
    background: 'rgba(255, 255, 255, 0.04)',
    border: '1px solid rgba(255, 255, 255, 0.06)',
  };

  return (
    <div className="space-y-6">
      {/* Status Badge */}
      {isRunning && (
        <div className="flex items-center justify-center">
          <div 
            className="px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2"
            style={{
              background: isPaused ? 'rgba(234, 179, 8, 0.2)' : `rgba(${accentRgb}, 0.2)`,
              border: `1px solid ${isPaused ? 'rgba(234, 179, 8, 0.4)' : `rgba(${accentRgb}, 0.4)`}`,
              color: isPaused ? '#fbbf24' : accentColor
            }}
          >
            <div className={`w-2 h-2 rounded-full ${isPaused ? 'bg-yellow-400' : 'bg-green-400'} animate-pulse`} />
            {isPaused ? 'Paused' : 'Running'}
            {intervalMode && ` • ${currentPhase === 'work' ? 'Work' : 'Break'} • Cycle ${cycleCount + 1}`}
          </div>
        </div>
      )}

      {/* Mode Selector */}
      <div className="grid grid-cols-3 gap-2">
        {[
          { id: 'timer', icon: Timer, label: 'Timer' },
          { id: 'stopwatch', icon: Clock, label: 'Stopwatch' },
          { id: 'alarm', icon: Bell, label: 'Alarm' }
        ].map(({ id, icon: Icon, label }) => (
          <button
            key={id}
            onClick={() => {
              if (!isRunning) {
                setMode(id);
                setTime(id === 'timer' ? targetTime : 0);
              }
            }}
            disabled={isRunning}
            className="p-3 rounded-xl transition-all disabled:opacity-50"
            style={{
              background: mode === id ? `rgba(${accentRgb}, 0.2)` : 'rgba(255, 255, 255, 0.04)',
              border: mode === id ? `1px solid rgba(${accentRgb}, 0.4)` : '1px solid rgba(255, 255, 255, 0.06)',
              color: mode === id ? accentColor : 'rgba(255, 255, 255, 0.7)'
            }}
          >
            <Icon className="mx-auto mb-1" size={20} />
            <div className="text-xs font-medium">{label}</div>
          </button>
        ))}
      </div>

      {/* Main Timer Display */}
      <div className="p-6 rounded-2xl" style={cardStyle}>
        {/* Time Display */}
        <div className="text-center mb-6">
          <div 
            className="text-6xl font-bold mb-2 tracking-wider"
            style={{ color: accentColor }}
          >
            {formatTime(time)}
          </div>
          {intervalMode && (
            <div className="text-white/60 text-sm">
              {currentPhase === 'work' ? '💪 Work Time' : currentPhase === 'break' ? '☕ Break Time' : '🌟 Long Break'}
            </div>
          )}
          {mode === 'timer' && !isRunning && (
            <div className="text-white/40 text-xs mt-2">
              Target: {formatTime(targetTime)}
            </div>
          )}
        </div>

        {/* Progress Bar for Timer */}
        {mode === 'timer' && isRunning && (
          <div className="mb-6">
            <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full transition-all duration-1000"
                style={{ 
                  width: `${getProgressPercentage()}%`,
                  background: `linear-gradient(90deg, ${accentColor}, ${accentColor}cc)`
                }}
              />
            </div>
          </div>
        )}

        {/* Timer Input (Timer Mode Only) */}
        {mode === 'timer' && !isRunning && (
          <div className="mb-6">
            <Slider
              value={[targetTime]}
              min={60}
              max={7200}
              step={60}
              onValueChange={([val]) => {
                setTargetTime(val);
                setTime(val);
              }}
              className="w-full"
            />
            <div className="flex justify-between text-white/40 text-xs mt-2">
              <span>1 min</span>
              <span className="text-white/70 font-medium">{Math.floor(targetTime / 60)} minutes</span>
              <span>120 min</span>
            </div>
          </div>
        )}

        {/* Controls */}
        <div className="flex justify-center gap-3">
          {!isRunning ? (
            <Button
              onClick={handleStart}
              className="h-14 w-14 rounded-full text-white"
              style={{ 
                background: accentColor,
                boxShadow: `0 0 30px rgba(${accentRgb}, 0.4)`
              }}
            >
              <Play size={24} fill="currentColor" />
            </Button>
          ) : (
            <>
              <Button
                onClick={handlePause}
                className="h-14 w-14 rounded-full bg-yellow-600 hover:bg-yellow-500 text-white"
              >
                {isPaused ? <Play size={24} fill="currentColor" /> : <Pause size={24} />}
              </Button>
              <Button
                onClick={handleStop}
                className="h-14 w-14 rounded-full bg-red-600 hover:bg-red-500 text-white"
              >
                <Square size={24} />
              </Button>
            </>
          )}
          <Button
            onClick={handleReset}
            variant="outline"
            className="h-14 w-14 rounded-full bg-white/5 border-white/10 text-white/70 hover:bg-white/10 hover:text-white"
          >
            <RotateCcw size={24} />
          </Button>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-2">
        <Button
          onClick={() => setShowTemplates(!showTemplates)}
          disabled={isRunning}
          variant="outline"
          className="p-3 rounded-xl bg-white/[0.04] border-white/[0.06] text-white/70 hover:bg-white/[0.08] hover:text-white disabled:opacity-50"
        >
          <Plus size={18} className="mr-2" />
          Templates
        </Button>
        <Button
          onClick={() => setSoundEnabled(!soundEnabled)}
          variant="outline"
          className="p-3 rounded-xl"
          style={{
            background: soundEnabled ? `rgba(${accentRgb}, 0.2)` : 'rgba(255, 255, 255, 0.04)',
            borderColor: soundEnabled ? `rgba(${accentRgb}, 0.4)` : 'rgba(255, 255, 255, 0.06)',
            color: soundEnabled ? accentColor : 'rgba(255, 255, 255, 0.7)'
          }}
        >
          {soundEnabled ? <Volume2 size={18} className="mr-2" /> : <VolumeX size={18} className="mr-2" />}
          Sound
        </Button>
      </div>

      {/* Section Toggle Buttons */}
      <div className="flex gap-2">
        <Button
          onClick={() => { setShowHistory(!showHistory); setShowSettings(false); }}
          variant="outline"
          size="sm"
          className={`flex-1 rounded-xl ${showHistory ? 'bg-white/10' : 'bg-white/[0.04]'} border-white/[0.06] text-white/70 hover:bg-white/[0.08]`}
        >
          <History size={16} className="mr-2" />
          History
        </Button>
        <Button
          onClick={() => { setShowSettings(!showSettings); setShowHistory(false); }}
          variant="outline"
          size="sm"
          className={`flex-1 rounded-xl ${showSettings ? 'bg-white/10' : 'bg-white/[0.04]'} border-white/[0.06] text-white/70 hover:bg-white/[0.08]`}
        >
          <Settings size={16} className="mr-2" />
          Settings
        </Button>
      </div>

      {/* Templates Panel */}
      {showTemplates && (
        <div className="p-4 rounded-xl" style={cardStyle}>
          <h4 className="text-sm font-semibold text-white/50 mb-3 uppercase tracking-widest">Quick Start</h4>
          <div className="grid grid-cols-2 gap-2">
            {templates.map((template) => (
              <button
                key={template.name}
                onClick={() => applyTemplate(template)}
                className="p-3 rounded-xl text-left transition-all hover:bg-white/[0.08]"
                style={cardStyle}
              >
                <div className="text-white/90 font-medium text-sm">{template.name}</div>
                <div className="text-white/40 text-xs">{template.duration} min</div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Settings Panel */}
      {showSettings && (
        <div className="p-4 rounded-xl space-y-4" style={cardStyle}>
          <h4 className="text-sm font-semibold text-white/50 uppercase tracking-widest">Settings</h4>
          
          {/* Technique Selection */}
          <div>
            <Label className="text-white/70 text-sm mb-2 block">Focus Technique</Label>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(techniques).map(([key, value]) => (
                <button
                  key={key}
                  onClick={() => {
                    setTechnique(key);
                    if (key !== 'custom') {
                      setIntervalMode(true);
                      setWorkDuration(value.work);
                      setBreakDuration(value.break);
                      setTargetTime(value.work * 60);
                      setTime(value.work * 60);
                    } else {
                      setIntervalMode(false);
                    }
                  }}
                  disabled={isRunning}
                  className="p-2 rounded-lg text-xs transition-all disabled:opacity-50"
                  style={{
                    background: technique === key ? `rgba(${accentRgb}, 0.2)` : 'rgba(255, 255, 255, 0.04)',
                    border: technique === key ? `1px solid rgba(${accentRgb}, 0.4)` : '1px solid rgba(255, 255, 255, 0.06)',
                    color: technique === key ? accentColor : 'rgba(255, 255, 255, 0.7)'
                  }}
                >
                  {value.name}
                </button>
              ))}
            </div>
          </div>

          {/* Ambient Sound */}
          <div>
            <Label className="text-white/70 text-sm mb-2 block">Ambient Sound</Label>
            <Select value={ambientSound} onValueChange={setAmbientSound}>
              <SelectTrigger className="w-full bg-white/[0.04] border-white/[0.06] text-white/90">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-zinc-900 border-white/10">
                {ambientSounds.map((sound) => (
                  <SelectItem key={sound.id} value={sound.id} className="text-white/90">
                    {sound.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            {ambientSound !== 'none' && (
              <div className="mt-3">
                <Label className="text-white/50 text-xs mb-1 block">Volume</Label>
                <Slider
                  value={[ambientVolume]}
                  min={0}
                  max={1}
                  step={0.1}
                  onValueChange={([val]) => setAmbientVolume(val)}
                  className="w-full"
                />
              </div>
            )}
          </div>
        </div>
      )}

      {/* Session Notes Modal */}
      {showNotes && (
        <div className="p-4 rounded-xl" style={cardStyle}>
          <h4 className="text-lg font-bold text-white mb-3">Session Complete! 🎉</h4>
          <div 
            className="mb-4 p-3 rounded-lg"
            style={{ background: `rgba(${accentRgb}, 0.1)`, border: `1px solid rgba(${accentRgb}, 0.2)` }}
          >
            <div className="text-white/50 text-xs mb-1">Duration</div>
            <div className="text-xl font-bold" style={{ color: accentColor }}>
              {formatTime(mode === 'stopwatch' ? time : (targetTime - time))}
            </div>
          </div>
          <Label className="text-white/70 text-sm mb-2 block">Add Notes (Optional)</Label>
          <textarea
            value={sessionNotes}
            onChange={(e) => setSessionNotes(e.target.value)}
            placeholder="How did this session go?"
            className="w-full p-3 rounded-xl bg-white/[0.04] border border-white/[0.06] text-white/90 placeholder-white/30 mb-3 h-24 resize-none text-sm"
          />
          <div className="flex gap-2">
            <Button
              onClick={() => { setShowNotes(false); handleReset(); }}
              variant="outline"
              className="flex-1 bg-white/[0.04] border-white/[0.06] text-white/70 hover:bg-white/[0.08]"
            >
              Skip
            </Button>
            <Button
              onClick={saveSession}
              className="flex-1 text-white"
              style={{ background: accentColor }}
            >
              <Save size={16} className="mr-2" />
              Save
            </Button>
          </div>
        </div>
      )}

      {/* History Panel */}
      {showHistory && (
        <div className="p-4 rounded-xl" style={cardStyle}>
          <h4 className="text-sm font-semibold text-white/50 mb-3 uppercase tracking-widest">Session History</h4>
          
          {sessions.length === 0 ? (
            <div className="text-center py-8 text-white/30 text-sm">
              No sessions yet. Complete a focus session to see your history!
            </div>
          ) : (
            <ScrollArea className="max-h-64">
              <div className="space-y-2">
                {sessions.map((session) => (
                  <div
                    key={session.id}
                    className="p-3 rounded-lg bg-white/[0.02] border border-white/[0.04]"
                  >
                    <div className="flex items-start justify-between mb-1">
                      <div>
                        <div className="text-white/90 font-medium text-sm capitalize">
                          {session.mode}
                          {session.technique !== 'none' && ` • ${techniques[session.technique]?.name}`}
                        </div>
                        <div className="text-white/40 text-xs">
                          {formatDate(session.startTime)}
                        </div>
                      </div>
                      <div className="text-sm font-bold" style={{ color: accentColor }}>
                        {formatTime(session.duration)}
                      </div>
                    </div>
                    {session.notes && (
                      <div className="text-white/50 text-xs mt-2 p-2 bg-white/[0.02] rounded">
                        {session.notes}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </div>
      )}

      {/* Stats Summary */}
      {sessions.length > 0 && !showHistory && !showSettings && (
        <div className="grid grid-cols-3 gap-2">
          <div className="p-3 rounded-xl text-center" style={cardStyle}>
            <div className="text-white/40 text-xs mb-1">Sessions</div>
            <div className="text-white font-bold">{sessions.length}</div>
          </div>
          <div className="p-3 rounded-xl text-center" style={cardStyle}>
            <div className="text-white/40 text-xs mb-1">Total</div>
            <div className="text-white font-bold text-sm">
              {formatTime(sessions.reduce((acc, s) => acc + s.duration, 0))}
            </div>
          </div>
          <div className="p-3 rounded-xl text-center" style={cardStyle}>
            <div className="text-white/40 text-xs mb-1">Avg</div>
            <div className="text-white font-bold text-sm">
              {formatTime(Math.floor(sessions.reduce((acc, s) => acc + s.duration, 0) / sessions.length))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}