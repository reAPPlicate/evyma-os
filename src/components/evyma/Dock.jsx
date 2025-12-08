import React, { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Camera, Upload, Video, Mic, X, Keyboard, Send, Bell, LayoutGrid, Rss, Paperclip, Plus, AlertCircle, Home as HomeIcon } from 'lucide-react';
import CameraCapture from './CameraCapture';
import { useTheme } from '@/components/theme/ThemeContext';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';

/**
 * Dock - Modern glassmorphism bottom navigation
 * Optimized for performance with CSS-only effects
 * Fully responsive for mobile, tablet, and desktop
 */
export default function Dock({ accentColor = '#3B82F6', onAction, onOpenNotifications, onOpenRealtime, isAppsVisible = true, onToggleAppsVisibility }) {
  const { isDarkMode } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const [isTextMode, setIsTextMode] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isPlusMenuOpen, setIsPlusMenuOpen] = useState(false);
  const [interimTranscript, setInterimTranscript] = useState('');
  const [elapsedTime, setElapsedTime] = useState(0);
  const [audioLevel, setAudioLevel] = useState(0);
  const [speechError, setSpeechError] = useState(null);
  const [cameraOpen, setCameraOpen] = useState(false);
  const [cameraMode, setCameraMode] = useState('photo');
  
  const inputRef = useRef(null);
  const recognitionRef = useRef(null);
  const fileInputRef = useRef(null);
  const timeoutRef = useRef(null);
  const timerIntervalRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const animationFrameRef = useRef(null);
  const streamRef = useRef(null);
  const isListeningRef = useRef(false);
  
  const MAX_RECORDING_TIME = 60000;

  // Audio visualization helpers
  const setupAudioVisualization = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
      analyserRef.current = audioContextRef.current.createAnalyser();
      const source = audioContextRef.current.createMediaStreamSource(stream);
      source.connect(analyserRef.current);
      analyserRef.current.fftSize = 256;
      visualizeAudio();
    } catch (err) {
      console.error('Error setting up audio visualization:', err);
    }
  };

  const visualizeAudio = () => {
    if (!analyserRef.current) return;
    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
    const updateLevel = () => {
      analyserRef.current.getByteFrequencyData(dataArray);
      const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
      setAudioLevel(Math.min(100, (average / 128) * 100));
      animationFrameRef.current = requestAnimationFrame(updateLevel);
    };
    updateLevel();
  };

  const stopAudioVisualization = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setAudioLevel(0);
  };

  const stopDictation = () => {
    isListeningRef.current = false;
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (err) {
        console.error('Error stopping recognition:', err);
      }
    }
    setIsListening(false);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    stopAudioVisualization();
    setInterimTranscript('');
    setElapsedTime(0);
  };

  // Initialize Web Speech API
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = true;
        recognitionRef.current.interimResults = true;
        recognitionRef.current.lang = 'en-US';
        recognitionRef.current.maxAlternatives = 1;

        recognitionRef.current.onresult = (event) => {
          let finalText = '';
          let interimText = '';
          
          for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcriptPiece = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
              finalText += transcriptPiece + ' ';
            } else {
              interimText += transcriptPiece;
            }
          }
          
          if (finalText) {
            setInputValue(prev => prev + finalText);
            setInterimTranscript('');
          } else {
            setInterimTranscript(interimText);
          }
        };

        recognitionRef.current.onend = () => {
          if (isListeningRef.current) {
            try {
              recognitionRef.current.start();
            } catch (err) {
              console.error('Error restarting recognition:', err);
              stopDictation();
            }
          }
        };

        recognitionRef.current.onerror = (event) => {
          console.error('Speech recognition error:', event.error);
          
          let errorMessage = 'An error occurred with speech recognition.';
          switch(event.error) {
            case 'no-speech':
              errorMessage = 'No speech detected. Please try again.';
              break;
            case 'audio-capture':
              errorMessage = 'No microphone found or microphone access denied.';
              break;
            case 'not-allowed':
              errorMessage = 'Microphone permission denied. Please enable microphone access in your browser settings.';
              break;
            case 'network':
              errorMessage = 'Network error occurred. Please check your connection.';
              break;
            case 'aborted':
              return;
            default:
              errorMessage = `Speech recognition error: ${event.error}`;
          }
          
          setSpeechError(errorMessage);
          stopDictation();
        };
      }
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
      stopAudioVisualization();
    };
  }, []);

  useEffect(() => {
    if (isTextMode && inputRef.current) {
      inputRef.current.focus();
      setTimeout(() => {
        window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
      }, 100);
    }
  }, [isTextMode]);

  useEffect(() => {
    if (isTextMode && inputRef.current) {
      const textarea = inputRef.current;
      const maxHeight = window.innerHeight * 0.5;
      
      textarea.style.height = 'auto';
      const newHeight = Math.min(textarea.scrollHeight, maxHeight);
      textarea.style.height = newHeight + 'px';
      textarea.style.overflowY = textarea.scrollHeight > maxHeight ? 'auto' : 'hidden';
    }
  }, [inputValue, interimTranscript, isTextMode]);

  useEffect(() => {
    if (!isTextMode) return;
    
    const handleResize = () => {
      if (inputRef.current) {
        inputRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
      }
    };

    window.visualViewport?.addEventListener('resize', handleResize);
    return () => window.visualViewport?.removeEventListener('resize', handleResize);
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
    if (onOpenRealtime) {
      onOpenRealtime();
    } else {
      setIsRecording(!isRecording);
      handleAction('voice');
    }
  };

  const toggleDictation = () => {
    if (!recognitionRef.current) {
      setSpeechError('Speech recognition is not supported in this browser. Please use Chrome, Edge, or Safari.');
      return;
    }

    if (isListening) {
      stopDictation();
    } else {
      try {
        recognitionRef.current.start();
        isListeningRef.current = true;
        setIsListening(true);
        setElapsedTime(0);
        
        setupAudioVisualization();
        
        timerIntervalRef.current = setInterval(() => {
          setElapsedTime(prev => prev + 100);
        }, 100);
        
        timeoutRef.current = setTimeout(() => {
          stopDictation();
        }, MAX_RECORDING_TIME);
      } catch (err) {
        console.error('Error starting recognition:', err);
        setSpeechError('Failed to start recording. Please try again.');
      }
    }
  };

  const formatTime = (milliseconds) => {
    const seconds = Math.floor(milliseconds / 1000);
    const ms = Math.floor((milliseconds % 1000) / 100);
    return `${seconds}.${ms}s`;
  };

  const handleCameraCapture = () => {
    setCameraMode('photo');
    setCameraOpen(true);
  };

  const handleVideoCapture = () => {
    setCameraMode('video');
    setCameraOpen(true);
  };

  const handleCameraCaptureComplete = (result) => {
    handleAction(result);
    setCameraOpen(false);
  };

  const handleFileUpload = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e, type) => {
    const file = e.target.files?.[0];
    if (file) {
      handleAction({ type, file });
    }
    e.target.value = '';
  };

  const plusMenuItems = [
    { icon: Upload, label: 'Upload file', action: 'upload' },
    { icon: Camera, label: 'Camera', action: 'camera' },
    { icon: Video, label: 'Video', action: 'video' },
  ];

  const hexToRgb = (hex) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` : '59, 130, 246';
  };
  const accentRgb = hexToRgb(accentColor);

  // Dynamic Feed/Home button logic
  const currentPath = location.pathname.toLowerCase();
  const isOnHome = currentPath === '/' || currentPath === '/home';
  const feedButtonIcon = isOnHome ? Rss : HomeIcon;
  const feedButtonLabel = isOnHome ? 'Feed' : 'Home';
  const feedButtonTarget = isOnHome ? '/feed' : '/home';

  const handleFeedButtonClick = () => {
    navigate(feedButtonTarget);
  };

  return (
    <TooltipProvider delayDuration={400}>
      <CameraCapture
        isOpen={cameraOpen}
        onClose={() => setCameraOpen(false)}
        onCapture={handleCameraCaptureComplete}
        mode={cameraMode}
        accentColor={accentColor}
      />

      <Dialog open={!!speechError} onOpenChange={() => setSpeechError(null)}>
        <DialogContent className={`max-w-sm ${isDarkMode ? 'bg-zinc-900 border-white/10 text-white' : 'bg-white border-zinc-200 text-zinc-900'}`}>
          <DialogHeader>
            <DialogTitle className={`flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-zinc-900'}`}>
              <AlertCircle className="h-5 w-5 text-red-400" />
              Voice Input Error
            </DialogTitle>
            <DialogDescription className={isDarkMode ? 'text-white/70' : 'text-zinc-600'}>
              {speechError}
            </DialogDescription>
          </DialogHeader>
          <Button 
            onClick={() => setSpeechError(null)}
            className="w-full mt-2 text-white"
            style={{ backgroundColor: accentColor }}
          >
            Close
          </Button>
        </DialogContent>
      </Dialog>

      <nav 
        className="fixed bottom-0 left-0 right-0 z-[140] pb-[env(safe-area-inset-bottom)] flex justify-center pointer-events-none"
        role="navigation"
        aria-label="Main actions"
      >
        {/* Hidden file input for file upload */}
        <input
          ref={fileInputRef}
          type="file"
          accept="*/*"
          className="hidden"
          onChange={(e) => handleFileChange(e, 'file')}
        />

        {isTextMode ? (
          /* Text Input Mode */
          <div className="pointer-events-auto mb-3 sm:mb-4 md:mb-6 mx-3 sm:mx-4 w-full max-w-[95vw] sm:max-w-[700px] md:max-w-[900px]">
            <div 
              className={`relative p-3 sm:p-4 rounded-2xl backdrop-blur-xl shadow-2xl ${
                isDarkMode 
                  ? 'bg-gradient-to-br from-zinc-900/95 to-zinc-950/95 border border-white/10' 
                  : 'bg-white/90 border border-zinc-200/80'
              }`}
              style={{
                boxShadow: isDarkMode 
                  ? `0 0 40px rgba(${accentRgb}, 0.15), 0 20px 60px rgba(0,0,0,0.5)`
                  : `0 0 40px rgba(${accentRgb}, 0.1), 0 20px 60px rgba(0,0,0,0.15)`
              }}
            >
              <div className="flex flex-col gap-3">
                {/* Text Input */}
                <div className="relative">
                  <Textarea
                    ref={inputRef}
                    placeholder="Type your message..."
                    value={inputValue + interimTranscript}
                    onChange={(e) => {
                      setInputValue(e.target.value);
                      setInterimTranscript('');
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSend();
                      }
                      if (e.key === 'Escape') {
                        setIsTextMode(false);
                        setInputValue('');
                        stopDictation();
                      }
                    }}
                    rows={1}
                    className={`w-full min-h-[44px] pr-10 py-3 rounded-xl focus-visible:ring-1 focus-visible:ring-offset-0 resize-none transition-all ${
                      isDarkMode 
                        ? 'bg-white/[0.05] border-white/[0.08] text-white placeholder:text-white/40' 
                        : 'bg-zinc-100/80 border-zinc-200 text-zinc-900 placeholder:text-zinc-400'
                    }`}
                    style={{
                      minHeight: '44px',
                      maxHeight: '50vh',
                      boxShadow: `0 0 0 1px rgba(${accentRgb}, 0.1)`
                    }}
                    onInput={(e) => {
                      const maxHeight = window.innerHeight * 0.5;
                      e.target.style.height = 'auto';
                      const newHeight = Math.min(e.target.scrollHeight, maxHeight);
                      e.target.style.height = newHeight + 'px';
                      e.target.style.overflowY = e.target.scrollHeight > maxHeight ? 'auto' : 'hidden';
                    }}
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      setIsTextMode(false);
                      setInputValue('');
                      setIsPlusMenuOpen(false);
                      stopDictation();
                    }}
                    className={`absolute right-1 top-2 h-8 w-8 rounded-full ${
                      isDarkMode 
                        ? 'text-white/40 hover:text-white/70 hover:bg-white/10' 
                        : 'text-zinc-400 hover:text-zinc-600 hover:bg-zinc-200/50'
                    }`}
                    aria-label="Close text input"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                {/* Action Buttons Row */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <IconButton icon={Camera} label="Camera" onClick={handleCameraCapture} accentColor={accentColor} isDarkMode={isDarkMode} />
                    <IconButton icon={Paperclip} label="Attach file" onClick={handleFileUpload} accentColor={accentColor} isDarkMode={isDarkMode} />
                    <IconButton icon={Video} label="Video" onClick={handleVideoCapture} accentColor={accentColor} isDarkMode={isDarkMode} />
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {/* Recording indicators */}
                    {isListening && (
                      <div className="flex items-center gap-2 mr-1">
                        <div className="flex items-end gap-0.5 h-6">
                          {[...Array(5)].map((_, i) => (
                            <div
                              key={i}
                              className="w-1 rounded-full transition-all duration-75"
                              style={{
                                height: `${Math.max(20, audioLevel * (0.5 + Math.random() * 0.5))}%`,
                                backgroundColor: accentColor,
                                opacity: 0.8
                              }}
                            />
                          ))}
                        </div>
                        <span className={`text-xs font-mono min-w-[40px] ${isDarkMode ? 'text-white/60' : 'text-zinc-500'}`}>
                          {formatTime(elapsedTime)}
                        </span>
                      </div>
                    )}
                    
                    {/* Mic Button */}
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button
                          onClick={toggleDictation}
                          className="h-11 w-11 rounded-full flex items-center justify-center relative transition-all duration-300 active:scale-95 hover:scale-105"
                          style={{
                            backgroundColor: isListening 
                              ? `rgba(${accentRgb}, 0.2)` 
                              : isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
                            border: `2px solid ${isListening ? `rgba(${accentRgb}, 0.8)` : isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
                            boxShadow: isListening ? `0 0 20px rgba(${accentRgb}, 0.4)` : 'none'
                          }}
                          aria-label={isListening ? 'Stop dictation' : 'Start dictation'}
                        >
                          <Mic 
                            className="h-5 w-5 transition-colors"
                            style={{ color: isListening ? accentColor : isDarkMode ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.5)' }}
                          />
                          {isListening && (
                            <>
                              <div 
                                className="absolute inset-0 rounded-full animate-ping opacity-30"
                                style={{ borderWidth: 2, borderColor: accentColor, borderStyle: 'solid' }}
                              />
                              <div 
                                className="absolute inset-0 rounded-full animate-ping opacity-20"
                                style={{ borderWidth: 2, borderColor: accentColor, borderStyle: 'solid', animationDelay: '0.5s' }}
                              />
                            </>
                          )}
                        </button>
                      </TooltipTrigger>
                      <TooltipContent side="top" className={isDarkMode ? 'bg-zinc-900 text-white border-white/10' : 'bg-white text-zinc-900 border-zinc-200'}>
                        <p>{isListening ? 'Stop dictation' : 'Dictate'}</p>
                      </TooltipContent>
                    </Tooltip>

                    {/* Send Button */}
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          onClick={handleSend}
                          disabled={!inputValue.trim()}
                          className="h-11 w-11 rounded-full text-white border-0 active:scale-95 transition-all duration-200 disabled:opacity-40 hover:scale-105"
                          style={{ 
                            backgroundColor: accentColor,
                            boxShadow: inputValue.trim() ? `0 0 20px rgba(${accentRgb}, 0.5)` : 'none'
                          }}
                          aria-label="Send message"
                        >
                          <Send className="h-5 w-5" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="top" className={isDarkMode ? 'bg-zinc-900 text-white border-white/10' : 'bg-white text-zinc-900 border-zinc-200'}>
                        <p>Send</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Default Mode - Glassmorphism Dock */
          <div className="relative pointer-events-auto mb-2 sm:mb-4 md:mb-6 mx-2 sm:mx-4 w-[calc(100%-16px)] sm:w-auto">
            {/* Main Dock Container */}
            <div 
              className={`relative px-2 sm:px-6 md:px-8 py-2.5 sm:py-4 md:py-5 rounded-full backdrop-blur-2xl ${
                isDarkMode 
                  ? 'bg-gradient-to-r from-zinc-900/90 via-zinc-900/95 to-zinc-900/90 border border-white/10' 
                  : 'bg-white/80 border border-zinc-200/80'
              }`}
              style={{
                boxShadow: isDarkMode 
                  ? `0 0 60px rgba(${accentRgb}, 0.2), 0 20px 80px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.1)`
                  : `0 0 60px rgba(${accentRgb}, 0.15), 0 20px 80px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.8)`
              }}
            >
              <div className="flex items-center justify-between sm:gap-4 md:gap-6">
                {/* MOBILE LAYOUT (< 640px) - 5 buttons */}
                <div className="flex sm:hidden items-center justify-between w-full gap-2">
                  <DockButton 
                    icon={Bell} 
                    label="Notifications" 
                    onClick={onOpenNotifications} 
                    accentColor={accentColor}
                    isDarkMode={isDarkMode}
                    size="large"
                  />
                  <DockButton 
                    icon={isPlusMenuOpen ? X : Plus} 
                    label={isPlusMenuOpen ? 'Close' : 'Attachments'} 
                    onClick={() => setIsPlusMenuOpen(!isPlusMenuOpen)} 
                    accentColor={accentColor}
                    isDarkMode={isDarkMode}
                    isActive={isPlusMenuOpen}
                    size="large"
                  />
                  
                  {/* Center - Large Voice Button */}
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        onClick={handleRecordClick}
                        className="relative w-16 h-16 rounded-full transition-all duration-300 hover:scale-105 active:scale-95 group"
                        style={{
                          background: `linear-gradient(135deg, ${accentColor}ee, ${accentColor}cc)`,
                          boxShadow: isRecording 
                            ? `0 0 40px rgba(${accentRgb}, 0.6), 0 0 80px rgba(${accentRgb}, 0.3)` 
                            : `0 0 30px rgba(${accentRgb}, 0.4), 0 10px 40px rgba(0,0,0,0.3)`
                        }}
                        aria-label={isRecording ? 'Stop recording' : 'Start recording'}
                      >
                        <div className="absolute -inset-3 flex items-center justify-center">
                              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 612 792" fill="currentColor" aria-hidden="true">
  <path d="M187.9 167.2c4.6-1.5 7.7-4.1 10.8-6.8 12-10.6 25.9-17.4 42.3-19.7 43.7-8.1 72.1 45.3 54.7 83-3.5 9.3-3.6 17.4.6 26.7 8.9 19.4 4.1 40-8.6 56.8-8.4 8.7 18.6 17.6 12.3 56.7-9.3-9.9-13-22-20.2-33.2-4.2-8.8-13.9-13.5-24.4-12.7-36.4-3.4-47.7 29.3-48.5 56.7 1.3 8.1-7.7 9.6-9 1.4-18.4-49.5-61.6-6.1-64.2-33.5 5.2-.3 22.1 2.5 15.7-7.1-12.7-14.8-2.4-31-13.7-39.6-1.6-1.2-3.2-2.7-3.2-5 2.7-1.8 5.6-2.2 8.9-1.9 8.7 1.2 22.5-14.7 11.5-19.5-11.1-2.4-18.5-9-23.6-18.2-.7-1.2-2-2.6-3.4-3-23.9 13.8-33.5 34.1-31.4 59.8.2 3 .4 6.3 5.2 5.6 8.4-1.1 9.9-2.4 8.7-7.5-2.9-11.3.8-27.5 14.1-30.1 1.5 2.5 1.4 5-.2 7.2-18.7 23.1 17.9 35.4.4 53.3-23.4-39.2-79.5 32.5-44.2 65.5-1.6-7-3.8-12.9-4.3-19.2-3.7-24.8 30-50.9 48.2-28.5 9.8 14.6 25.8 10.5 40.5 8.8 31 1.7 26.3 48.3 37.1 69.1 27.6-24.3 12.3-60.2 26.1-78.6 6.3 10.1 12.5 19.7 18.3 29.4 3.3 20.1-17 54.4-29.7 70.2-12.2 16.1-35.4 15.8-39-8.1-2.6-16.4-5.1-32.9-12.5-48.2-7.1-18.5-26.3-3.5-45.6-17.8-19.3-14.9-23.1 14.7-9 20.4 10 3.7 29.7-3.9 28.7 12.7.8 21.1-35.4.3-36.6 21-.4 5-2.1 10.9 3.8 14 11.8 6.4 21.5-15.1 43.5-12.2 16.2-.6 14.9 17.4 20.6 28.2 7.3 16.8 25.7 20.2 38.7 10.8 21.3-14 44.9-17.2 44-48.3-.8-7.3 9.9-6.3 10.7-1.1-.9 13.9 16.1 21.9 13.1 33.9-22.7-20.1-7.9 4-45.2 18.3-26.3 7.7-22.6 42.7 2.4 50.3 14.8 4.1 30.3 14.5 31.2 31 .6 3.6-1.8 6.5-5.8 7.5-11.5 2.1-7.6-13.4-14.2-18.8-2.2-2.2-4.4-4.3-7.7-4.8-11.6-1.9-21.3-7-28.9-15.6-1.6-1.7-2.6-2.6-5-3.4-5.9 6.1-12.9 11-21.7 13.2-3.8 1.9-11.9.9-6.4-4.2 10.2-8.6 22.4-16.6 23.4-30.9.9-6-.7-8.9-7.1-9.5-7.4-.8-13.4-3.8-19.8-6.9-21-11-28.8 11.4-36.3 3.3-3.5-4.2 1.1-7.7 4-10.6 3.4-6 23.4-7.2 14.9-15.9-9.3-7.9-22 2.6-28.7 9-11.9 11.6-30 11.2-40.9-1.2-12.1-13.4-9.4-29.4-6.7-45.2-23.4 31.9 1.2 78.3 40.6 80.3 18.7 1.6 26.9 6.2 42.6-7.4 4.4 11.9-14.6 16.1-5.6 27.3 3.7 5.8 4 12.4 3.3 19.1-.7 12.5-17.5 9.6-13.8-1.6 3.1-16.4-16.8-24.8-31-24-4.8.1-6.8 2.1-7 6.5-1.9 27.2 16.7 56.9 44.1 64.1 3.1.7 7.4 2.9 8.2-2.8 1-7.1-.9-10-6.9-10.2-17-.7-35.5-15.6-26.6-33.6 3.6 1.4 3 4.9 3.8 7.5 4 12.2 11.8 17.8 24.3 17.2 11.1-1.6 16.9-11.8 27.1-15.9-47.2 68.3 108.5 130.5 103.2 39.2-14.7 14.8-43.4 17.5-57.9.8-2.9-3.3-3.7-6.7-.3-10.1 3.5-3.4 6.2-1 9.1 1.2 41.8 30.3 72.7-46.3 27.3-60.2-3.5-1.4-9.5-1.1-9.3-5.5.1-4.8 6.1-4.8 10-5.6 36.2-9.8 24.4-46.1 26.5-72.8 0-3.9-.9-7.3-3-10.7-16.8-27.9-33.3-56.1-52-82.8-4.2-5.3-4-6.4 1.8-10.3 11.1-7.4 29.3-7.8 37.5 8 10.8 19.1 20.7 39.3 34.3 56.6 16.3-22.6 29-47.5 43.3-71.3 3.5-6.2 7.9-9.2 15.5-8.4 5.7-.7 20.8 3.4 20.7-4.8.1-15.9.1-31.8.1-47.6-1.9-8.4-14.7-8.8-9.9-24.3 10.1-26.4 48.9-1 27.4 17.4-5.6 3.6-6.4 8.2-6.4 13.8.1 16.7-.1 33.4.1 50 .8 11-8.8 2.4-12.5 10-16 25.9-31.4 52.1-48.5 77.3-27.1 36.2 4.2 77.5-26.7 100.6-7.5 6.7-10.1 14.4-10.1 23.9 0 10.9-1.5 21.8-1.8 32.7 20.9 86.9-82.2 110.8-128.6 45.3-18.1-17.8-34.4-.7-64.7-39.4-24.3-28.1-2.6-51.1-26.2-69.4-56.1-50-5.8-81.1-18.2-100-14-26.1-11-51.4 8.9-74.2 25.3-23.2-10.2-51.9 40.1-88.6 8.8-6.7 13-14 13.4-24.7 4-30.6 35.3-49.2 65.1-49.6zm95.8 18.9c-7.1-64.2-120-15.5-75.6 31.3 7.8 5.9 14.7-.7 22-3.3 4.9-.9 9.7 5.3 5.6 9.1-52.6 33.8 12.2 61.2-41.8 85.6-10.6 4.3-13 3.7-12.3 15.7-13.8-4.1-10.5-24.2 3.3-27.2 17.3-5.7 20.2-11.9 15.4-28.6-8-22.6 9.7-33.6 0-40.6-5.5-4.7-10.5-9.7-13.6-16.3-1.4-3.1-4-3.8-7.3-2.8-7.4 2.3-13.6 6.2-19 11.4-2.4 2.3-2.1 6.3-5.4 8.6-2-11.3 4.8-22.1 17-27.3 5.7-2.4 10.8-5.2 12.5-11.5 5.2-30.7-80.4 26.4-35.6 63.2 7.1 5.8 19.8 1.2 18.2-8.7-5.7-25.6 21.7-4.3 6.8 18.2-1.4 2.5-3.9 5.5-1.6 8.2 2.9 4 10.8-6.5 15.7.3 2.5 4.3-2.6 8.8-6.6 9.7-24.8 5.7-38 38.7-13.1 52.7 10.2 5.4 21.8 8.2 30.6 16.4 4.6-4.3 5.2-9.6 6.9-14.4 4.4-21.8 37.8-25.4 33-50.7-.7-5.3-4.4-13.7 3.6-15.3 12.1-1.2 11.5 17.8 10.4 25.8-3.9 13.2 14.8 9.7 20.6 4.2 19.7-19.6 13.7-58.6-16.8-70.6-2.9-1.9-2.9-4.7-2.2-7.5 3.5-6.9 15.4-1.8 20.1 1.2 11.4 6.5 10.7-29.9 9.2-36.8zm113.4 64.1c4.4-5.7-6-11.4-9.3-5.8-4.8 5.4 4.6 12 9.3 5.8z"/>
  <path d="M313.2 611.1c-2.1-26.8-.1-52.9-.9-79.6 0-3.9 1.2-6.7 4.1-9.5 7.6-8.5 21.2-15.1 22.6-27.3-.1-17.5.7-35-.3-52.4-.6-11 3.8-19 12-27.5v71c11-4.4 17.9-16.5 31.2-10.8-.6 2.8-3.2 4.4-5.3 6.1-18 14.4-33.8 30.9-49.8 47.2-2 2.1-2.4 4.5-2.4 7.1 0 22.8.2 45.7-.1 68.5-.1 10 8.1 14.5 13.5 21.8 5.2-21-5.3-78.1 5.7-89.4 11.7-10.8 23.3-21.9 34.8-32.9 9.3-8.9 17.3-18.9 28.2-26.2 7-6.6 1-18.2 3.7-26.6 10.4-1.9 10.8-1.4 11 7.8.4 19-2.7 16.3 17.4 16.4 19.4.1 38.8-.2 58.1.1 6.1.1 8.6-1.7 7.7-7.4-.8-5.1 1.2-7.5 7-6.8 3.7.3 4.9 2.3 4.7 5.6 0 21.3 2.9 18.1-18.6 18.2-25.7.1-51.4 0-77.1-.2-9.5-1.1-13.3 8.1-20.1 12.6-15.2 9.1-11.2 24-11.5 38.7-3.7 1-6.7.8-9.8.2-2.1-4.2.4-8.8-1.8-12.8-6.9-.1-16.8 15.4-24.2 19.2-2.1 1.5-2.1 3.3-2.1 5.2 0 28.8 0 57.6-.1 86.4.7 9.3 14.3 5.8 20.6 6.4 4.9-.1 6.7-2.1 6.7-7-.3-27.5-.1-55-.1-82.5 3.8-2 7-1.6 10.8-.3v79.7c0 7.4 1.4 8.3 8.4 4.8 6.3-3.1 12.3-6.8 18.4-10.4 1.9-1.1 1.6-3.1 1.6-4.9 0-8.5-.1-17.1.1-25.6 0-2.8-1.1-4.2-3.5-5.7-11-7-11.9-18.5-1.5-26.3 4-3 5.1-6 5-10.5.9-67.1-11.8-45.6 52.8-49.4 14.9-1.7-1.4 33.7 10.5 37.8 14.8 7.7 8.3 28.9-8.1 28.4-13.6 2.6-25-10.6-18-23.3 4.2-7.1 10.8-2.9 10.4-15.6-.1-15.8.2-15.8-16.1-15.8-6.2 1.2-19.8-3.9-19.8 5.9.3 11.7.2 23.4 0 35.1 0 2.8.9 4.6 3.4 6.4 10.3 7.2 10.2 20.4-.1 27.4-2.3 1.6-3.4 3.2-3.3 5.8.2 5.5 0 11 0 17.3 5.8-3 8.2-7.2 9.3-11.7 3.7-14.2 36.7 2.5 53.2-25.5 25-25.5 14.9-23.4 19-54.4 1.7-6.9-13-3.1-17.1-3.8-7.9 1.2-7.7-13.2.2-11.4 15.3 1.5 27.2.2 37.5-12 8.4-8.7 15.7-17.4 15.4-29.9-1.2-1-2.7-.8-4.2-.9-10-.7-10-.7-12.4-9.8-1.3-5.2-.8-11.9-4.9-15-4.1-3.1-11-.8-16.6-1-5-.1-10 0-15.2 0-8.1 37.1-2.4 23.1-47.6 25.8-4.3 0-5.9-1.4-5.9-5.6.2-16.1.1-32.2.1-49.2-26.3 43.3-23.7 38.2-51.1.6v40.8c0 14.8 0 14.8-16.1 13.5-3.3-.3-4.9-1.2-4.9-4.7.1-23.6-.2-47.3.2-70.9.1-7.1 5.7-12.6 10-18.1 2.3-3 11.9-.7 14.1 3 8.2 11.8 13.4 25.9 23.2 36.2 7.1-9.4 13.3-19.4 18-29.8 5.4-13.4 16.7-11 28.6-9.8v88.8c.5.1.9.1 1.4.2 10.7-34.1 21.6-68.2 30.7-102.8 1.2-2.9 2.8-4.3 6-4.1 20.5-.9 21.4-1.3 28.1 17.5 4.9 11.2 6.2 23.5 12.4 34 16.9-18.4 8.2-66-17.7-71.3-5.4 1.2-22.8-1.8-24.5 3.4-1.2 3.9-4.8 2.5-7.5 2.3-5.1.4-2-14.9-2.8-19 4.4-.7 7.6-.7 11.6 1.3 2.3 2.1 23.8 3.6 22.2-1.7-2.9-14.8 2.2-32.8-6.9-45.8-14.3 10-24.8 24.4-37.7 35.9-7.3 6.5-2.4 32.2-3.7 43 .1 3.8-1.2 5.3-5.4 5.3s-6.2-1.1-6.2-5.4c.1-13.3.1-26.6 0-39.9 1.1-11.6 25.4-25.3 32.7-36.7 3.8-4.6 10.5-6.7 13.2-13.2-4.3-2.1-13.8-14.7-17.4-10.2-9.2 11-50.8 41.1-50 51.3-1.3 12.1 4.4 34.7-5.4 42.5-5.1 3.6-8.2 10.7-15.1 10.9-9.7.1-19.4.3-29.1.5-1.4 0-3 .1-4-1.2 2.5-8.6 4.2-9.9 13.2-9.9 48.5 3.8 19.5-33.9 34.2-56.1 6.3-11.9 55.8-44.1 48-52.9-6.3-11 2-26-10.4-34.2-3.8-2.8-7.4-6-10.2-9.7-15.7-21.4-35.8-3.1-56.8-22.9-13.4-12-5 38.6-7.1 45.6 1.2 7.9-12.6 7.7-11.2-.2-3.9-67.1 14.8-62.6-38.1-61.8-6.7.3-10.1 6-14.2 10-10.8 7.9-10.3 18.9-10.2 30.2.3 29.8.1 59.6.1 89.3 0 7.3.5 7.9 8.2 7.8 16.6-.2 14.2 2.4 14.3-13.5.1-17.7 0-35.3.1-53 0-3.8-1-6.5-4.6-9-20.5-15.8 6-41.9 23.5-25 7.4 7.2 6.8 18.1-2.1 24.5-4 2.9-5.3 5.9-5.3 10.5.2 19.9.2 39.7 0 59.6-1.4 12.7 18.1-.5 17.7 11.5-.1 4.5-2 5.8-6.5 5.8-12.6-.2-25.3.2-37.9-.1-6-.2-7.6 1.9-7.4 7.2.4 11.7-.3 23.4.3 35.1.5 9.5-6.1 15.3-10.8 22.9-4-60.3 0-122.4-1.6-183.4-1.3-16.6 12.7-25.6 22.2-36.9 9.1-8.3 37-4.6 49.1-3.5 26.8 4.9 29.1 32.4 64.1 27.2 15.7-.7 25.1 19.4 37.3 27.4 4.7 4 5.8 9.5 6.3 15.1-.2 23.9 6.5 25.4 24.1 38.8 28.9 22.3 6.2 60.6 30.9 82.9 18.2 16.5 20.5 56.5 4.9 75.8-3.9 4.6-.6 8.6 1.5 12.6 31.7 72.2-34.6 74.4-31.1 115.4 4.7 22.7-15.8 40.7-30.7 56.2-15.7 16.9-38.8 3-50.2 24.1-20.9 27.5-82.6 53.5-107.7 19.6-6-8.6-16.6-14-19.4-25.4zM508 380.9c-3.4 11.5-7.5 22.8-9.5 35.2h22c-2.9-6.1-7.9-36.1-12.5-35.2zm-82.9 187.9c-6.9-2.6-10.9 7.8-3.9 10.3 6.6 2.6 11.5-6.8 3.9-10.3zm51.4-17.6c-1.8-4.6-9.7-4.7-11.3 0-2.7 8.8 13.2 9.6 11.3 0zM347.3 200.4c.6 7.2 12.1 5.9 11.6-.9-1.1-6.6-10.9-6.4-11.6.9z"/>
  <path d="M407.2 309.5c0-10.7.2-20.9-.1-31 .1-13.3 18.7-11.1 16.8-32-1-15.2-.1-30.6-.3-45.8-.1-4.6 1.7-5.2 6.3-5.4 17.4-.8 25 11.8 34.7 21.5 3.1 5.5.4 13.7 1.3 20 0 9.5-.4 9.8-11.9 7.9-.8-10.9 3.7-23.8-8.3-30.5-2.8-1.7-4.5-6.7-8.3-5.1-4 1.6-2.4 6.2-2.4 9.7.1 12.9-.1 25.8.2 38.7.1 5.4-2.5 9-7 11.8-7 4.4-10.6 10-10.2 18.4.6 11.1.3 22.2.2 33.3 0 9.6-.1 9.6-11.1 7.3.1-6 .1-12.1.1-18.8zm-191.3 312c-29.8-12.9-35.8-44.4-16.2-66.3 2.5-3.4 6.2-4.4 9.8-1.8 9.2 6.6-8.7 16.1-8.1 26.7-3.1 22.8 20.1 38 41.3 37.7 1.5.1 3.2.2 3.5 1.9-1.2 7.8-24.5 5.1-30.3 1.8zm55.5-134.1c-11.3 9.9-30.9 2-36.7 18.7-.4 1.1-1.4 2-2.8 2.1-10-12.2 8.5-25 20.5-25.4 7.9-1.1 16.3-.8 22.8-7.4 2 5.7-1.2 8.5-3.8 12zm-20.1-306c-9.5-2.6-14.2-.5-18.1 7.5-1.9 5.9-9.5 14.1-16 8 5.7-4.9 7.4-11.9 10.5-18.3 11.2-18.8 49.2-3.9 39.7 19.1-5.7-5.2-7-14-16.1-16.3zm9.9 69.2c9.4 8.2 11.1 16.1 4.6 23.9-5-18-16-24.7-34.5-15.8-1.6-5.1 2-7 4.8-8.8 8.3-5.3 16.6-4.6 25.1.7z"/>
</svg>
                            </div>
                        {isRecording && (
                          <>
                            <div className="absolute inset-0 rounded-full border-2 border-white/50 animate-ping opacity-75" />
                            <div className="absolute inset-0 rounded-full border-2 border-white/30 animate-ping opacity-50" style={{ animationDelay: '0.5s' }} />
                          </>
                        )}
                        <div 
                          className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-xl"
                          style={{ backgroundColor: accentColor }}
                        />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="top" className={isDarkMode ? 'bg-zinc-900 text-white border-white/10' : 'bg-white text-zinc-900 border-zinc-200'}>
                      <p>Live conversation</p>
                    </TooltipContent>
                  </Tooltip>

                  <DockButton 
                    icon={Keyboard} 
                    label="Type message" 
                    onClick={() => setIsTextMode(true)} 
                    accentColor={accentColor}
                    isDarkMode={isDarkMode}
                    size="large"
                  />
                  <DockButton 
                    icon={feedButtonIcon}
                    label={feedButtonLabel} 
                    onClick={handleFeedButtonClick}
                    accentColor={accentColor}
                    isDarkMode={isDarkMode}
                    size="large"
                  />
                </div>

                {/* TABLET & DESKTOP LAYOUT (>= 640px) */}
                <div className="hidden sm:flex items-center justify-between w-full gap-3 md:gap-4">
                  <div className="flex items-center gap-2 md:gap-3">
                    <DockButton icon={Bell} label="Notifications" onClick={onOpenNotifications} accentColor={accentColor} isDarkMode={isDarkMode} size="medium" />
                    <DockButton icon={Camera} label="Camera" onClick={handleCameraCapture} accentColor={accentColor} isDarkMode={isDarkMode} size="medium" />
                    <DockButton icon={Paperclip} label="Attach file" onClick={handleFileUpload} accentColor={accentColor} isDarkMode={isDarkMode} size="medium" />
                    <DockButton icon={Video} label="Video" onClick={handleVideoCapture} accentColor={accentColor} isDarkMode={isDarkMode} size="medium" />
                  </div>

                  <div className={`h-12 md:h-14 w-px bg-gradient-to-b from-transparent ${isDarkMode ? 'via-white/20' : 'via-zinc-300'} to-transparent`} />

                  {/* Center - Voice Button */}
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        onClick={handleRecordClick}
                        className="relative w-16 h-16 md:w-20 md:h-20 rounded-full transition-all duration-300 hover:scale-105 active:scale-95 group flex-shrink-0"
                        style={{
                          background: `linear-gradient(135deg, ${accentColor}ee, ${accentColor}cc)`,
                          boxShadow: isRecording 
                            ? `0 0 40px rgba(${accentRgb}, 0.6), 0 0 80px rgba(${accentRgb}, 0.3)` 
                            : `0 0 30px rgba(${accentRgb}, 0.4), 0 10px 40px rgba(0,0,0,0.3)`
                        }}
                        aria-label={isRecording ? 'Stop recording' : 'Start recording'}
                      >
                        <div className="absolute -inset-3 flex items-center justify-center">
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 612 792" fill="currentColor" aria-hidden="true">
  <path d="M187.9 167.2c4.6-1.5 7.7-4.1 10.8-6.8 12-10.6 25.9-17.4 42.3-19.7 43.7-8.1 72.1 45.3 54.7 83-3.5 9.3-3.6 17.4.6 26.7 8.9 19.4 4.1 40-8.6 56.8-8.4 8.7 18.6 17.6 12.3 56.7-9.3-9.9-13-22-20.2-33.2-4.2-8.8-13.9-13.5-24.4-12.7-36.4-3.4-47.7 29.3-48.5 56.7 1.3 8.1-7.7 9.6-9 1.4-18.4-49.5-61.6-6.1-64.2-33.5 5.2-.3 22.1 2.5 15.7-7.1-12.7-14.8-2.4-31-13.7-39.6-1.6-1.2-3.2-2.7-3.2-5 2.7-1.8 5.6-2.2 8.9-1.9 8.7 1.2 22.5-14.7 11.5-19.5-11.1-2.4-18.5-9-23.6-18.2-.7-1.2-2-2.6-3.4-3-23.9 13.8-33.5 34.1-31.4 59.8.2 3 .4 6.3 5.2 5.6 8.4-1.1 9.9-2.4 8.7-7.5-2.9-11.3.8-27.5 14.1-30.1 1.5 2.5 1.4 5-.2 7.2-18.7 23.1 17.9 35.4.4 53.3-23.4-39.2-79.5 32.5-44.2 65.5-1.6-7-3.8-12.9-4.3-19.2-3.7-24.8 30-50.9 48.2-28.5 9.8 14.6 25.8 10.5 40.5 8.8 31 1.7 26.3 48.3 37.1 69.1 27.6-24.3 12.3-60.2 26.1-78.6 6.3 10.1 12.5 19.7 18.3 29.4 3.3 20.1-17 54.4-29.7 70.2-12.2 16.1-35.4 15.8-39-8.1-2.6-16.4-5.1-32.9-12.5-48.2-7.1-18.5-26.3-3.5-45.6-17.8-19.3-14.9-23.1 14.7-9 20.4 10 3.7 29.7-3.9 28.7 12.7.8 21.1-35.4.3-36.6 21-.4 5-2.1 10.9 3.8 14 11.8 6.4 21.5-15.1 43.5-12.2 16.2-.6 14.9 17.4 20.6 28.2 7.3 16.8 25.7 20.2 38.7 10.8 21.3-14 44.9-17.2 44-48.3-.8-7.3 9.9-6.3 10.7-1.1-.9 13.9 16.1 21.9 13.1 33.9-22.7-20.1-7.9 4-45.2 18.3-26.3 7.7-22.6 42.7 2.4 50.3 14.8 4.1 30.3 14.5 31.2 31 .6 3.6-1.8 6.5-5.8 7.5-11.5 2.1-7.6-13.4-14.2-18.8-2.2-2.2-4.4-4.3-7.7-4.8-11.6-1.9-21.3-7-28.9-15.6-1.6-1.7-2.6-2.6-5-3.4-5.9 6.1-12.9 11-21.7 13.2-3.8 1.9-11.9.9-6.4-4.2 10.2-8.6 22.4-16.6 23.4-30.9.9-6-.7-8.9-7.1-9.5-7.4-.8-13.4-3.8-19.8-6.9-21-11-28.8 11.4-36.3 3.3-3.5-4.2 1.1-7.7 4-10.6 3.4-6 23.4-7.2 14.9-15.9-9.3-7.9-22 2.6-28.7 9-11.9 11.6-30 11.2-40.9-1.2-12.1-13.4-9.4-29.4-6.7-45.2-23.4 31.9 1.2 78.3 40.6 80.3 18.7 1.6 26.9 6.2 42.6-7.4 4.4 11.9-14.6 16.1-5.6 27.3 3.7 5.8 4 12.4 3.3 19.1-.7 12.5-17.5 9.6-13.8-1.6 3.1-16.4-16.8-24.8-31-24-4.8.1-6.8 2.1-7 6.5-1.9 27.2 16.7 56.9 44.1 64.1 3.1.7 7.4 2.9 8.2-2.8 1-7.1-.9-10-6.9-10.2-17-.7-35.5-15.6-26.6-33.6 3.6 1.4 3 4.9 3.8 7.5 4 12.2 11.8 17.8 24.3 17.2 11.1-1.6 16.9-11.8 27.1-15.9-47.2 68.3 108.5 130.5 103.2 39.2-14.7 14.8-43.4 17.5-57.9.8-2.9-3.3-3.7-6.7-.3-10.1 3.5-3.4 6.2-1 9.1 1.2 41.8 30.3 72.7-46.3 27.3-60.2-3.5-1.4-9.5-1.1-9.3-5.5.1-4.8 6.1-4.8 10-5.6 36.2-9.8 24.4-46.1 26.5-72.8 0-3.9-.9-7.3-3-10.7-16.8-27.9-33.3-56.1-52-82.8-4.2-5.3-4-6.4 1.8-10.3 11.1-7.4 29.3-7.8 37.5 8 10.8 19.1 20.7 39.3 34.3 56.6 16.3-22.6 29-47.5 43.3-71.3 3.5-6.2 7.9-9.2 15.5-8.4 5.7-.7 20.8 3.4 20.7-4.8.1-15.9.1-31.8.1-47.6-1.9-8.4-14.7-8.8-9.9-24.3 10.1-26.4 48.9-1 27.4 17.4-5.6 3.6-6.4 8.2-6.4 13.8.1 16.7-.1 33.4.1 50 .8 11-8.8 2.4-12.5 10-16 25.9-31.4 52.1-48.5 77.3-27.1 36.2 4.2 77.5-26.7 100.6-7.5 6.7-10.1 14.4-10.1 23.9 0 10.9-1.5 21.8-1.8 32.7 20.9 86.9-82.2 110.8-128.6 45.3-18.1-17.8-34.4-.7-64.7-39.4-24.3-28.1-2.6-51.1-26.2-69.4-56.1-50-5.8-81.1-18.2-100-14-26.1-11-51.4 8.9-74.2 25.3-23.2-10.2-51.9 40.1-88.6 8.8-6.7 13-14 13.4-24.7 4-30.6 35.3-49.2 65.1-49.6zm95.8 18.9c-7.1-64.2-120-15.5-75.6 31.3 7.8 5.9 14.7-.7 22-3.3 4.9-.9 9.7 5.3 5.6 9.1-52.6 33.8 12.2 61.2-41.8 85.6-10.6 4.3-13 3.7-12.3 15.7-13.8-4.1-10.5-24.2 3.3-27.2 17.3-5.7 20.2-11.9 15.4-28.6-8-22.6 9.7-33.6 0-40.6-5.5-4.7-10.5-9.7-13.6-16.3-1.4-3.1-4-3.8-7.3-2.8-7.4 2.3-13.6 6.2-19 11.4-2.4 2.3-2.1 6.3-5.4 8.6-2-11.3 4.8-22.1 17-27.3 5.7-2.4 10.8-5.2 12.5-11.5 5.2-30.7-80.4 26.4-35.6 63.2 7.1 5.8 19.8 1.2 18.2-8.7-5.7-25.6 21.7-4.3 6.8 18.2-1.4 2.5-3.9 5.5-1.6 8.2 2.9 4 10.8-6.5 15.7.3 2.5 4.3-2.6 8.8-6.6 9.7-24.8 5.7-38 38.7-13.1 52.7 10.2 5.4 21.8 8.2 30.6 16.4 4.6-4.3 5.2-9.6 6.9-14.4 4.4-21.8 37.8-25.4 33-50.7-.7-5.3-4.4-13.7 3.6-15.3 12.1-1.2 11.5 17.8 10.4 25.8-3.9 13.2 14.8 9.7 20.6 4.2 19.7-19.6 13.7-58.6-16.8-70.6-2.9-1.9-2.9-4.7-2.2-7.5 3.5-6.9 15.4-1.8 20.1 1.2 11.4 6.5 10.7-29.9 9.2-36.8zm113.4 64.1c4.4-5.7-6-11.4-9.3-5.8-4.8 5.4 4.6 12 9.3 5.8z"/>
  <path d="M313.2 611.1c-2.1-26.8-.1-52.9-.9-79.6 0-3.9 1.2-6.7 4.1-9.5 7.6-8.5 21.2-15.1 22.6-27.3-.1-17.5.7-35-.3-52.4-.6-11 3.8-19 12-27.5v71c11-4.4 17.9-16.5 31.2-10.8-.6 2.8-3.2 4.4-5.3 6.1-18 14.4-33.8 30.9-49.8 47.2-2 2.1-2.4 4.5-2.4 7.1 0 22.8.2 45.7-.1 68.5-.1 10 8.1 14.5 13.5 21.8 5.2-21-5.3-78.1 5.7-89.4 11.7-10.8 23.3-21.9 34.8-32.9 9.3-8.9 17.3-18.9 28.2-26.2 7-6.6 1-18.2 3.7-26.6 10.4-1.9 10.8-1.4 11 7.8.4 19-2.7 16.3 17.4 16.4 19.4.1 38.8-.2 58.1.1 6.1.1 8.6-1.7 7.7-7.4-.8-5.1 1.2-7.5 7-6.8 3.7.3 4.9 2.3 4.7 5.6 0 21.3 2.9 18.1-18.6 18.2-25.7.1-51.4 0-77.1-.2-9.5-1.1-13.3 8.1-20.1 12.6-15.2 9.1-11.2 24-11.5 38.7-3.7 1-6.7.8-9.8.2-2.1-4.2.4-8.8-1.8-12.8-6.9-.1-16.8 15.4-24.2 19.2-2.1 1.5-2.1 3.3-2.1 5.2 0 28.8 0 57.6-.1 86.4.7 9.3 14.3 5.8 20.6 6.4 4.9-.1 6.7-2.1 6.7-7-.3-27.5-.1-55-.1-82.5 3.8-2 7-1.6 10.8-.3v79.7c0 7.4 1.4 8.3 8.4 4.8 6.3-3.1 12.3-6.8 18.4-10.4 1.9-1.1 1.6-3.1 1.6-4.9 0-8.5-.1-17.1.1-25.6 0-2.8-1.1-4.2-3.5-5.7-11-7-11.9-18.5-1.5-26.3 4-3 5.1-6 5-10.5.9-67.1-11.8-45.6 52.8-49.4 14.9-1.7-1.4 33.7 10.5 37.8 14.8 7.7 8.3 28.9-8.1 28.4-13.6 2.6-25-10.6-18-23.3 4.2-7.1 10.8-2.9 10.4-15.6-.1-15.8.2-15.8-16.1-15.8-6.2 1.2-19.8-3.9-19.8 5.9.3 11.7.2 23.4 0 35.1 0 2.8.9 4.6 3.4 6.4 10.3 7.2 10.2 20.4-.1 27.4-2.3 1.6-3.4 3.2-3.3 5.8.2 5.5 0 11 0 17.3 5.8-3 8.2-7.2 9.3-11.7 3.7-14.2 36.7 2.5 53.2-25.5 25-25.5 14.9-23.4 19-54.4 1.7-6.9-13-3.1-17.1-3.8-7.9 1.2-7.7-13.2.2-11.4 15.3 1.5 27.2.2 37.5-12 8.4-8.7 15.7-17.4 15.4-29.9-1.2-1-2.7-.8-4.2-.9-10-.7-10-.7-12.4-9.8-1.3-5.2-.8-11.9-4.9-15-4.1-3.1-11-.8-16.6-1-5-.1-10 0-15.2 0-8.1 37.1-2.4 23.1-47.6 25.8-4.3 0-5.9-1.4-5.9-5.6.2-16.1.1-32.2.1-49.2-26.3 43.3-23.7 38.2-51.1.6v40.8c0 14.8 0 14.8-16.1 13.5-3.3-.3-4.9-1.2-4.9-4.7.1-23.6-.2-47.3.2-70.9.1-7.1 5.7-12.6 10-18.1 2.3-3 11.9-.7 14.1 3 8.2 11.8 13.4 25.9 23.2 36.2 7.1-9.4 13.3-19.4 18-29.8 5.4-13.4 16.7-11 28.6-9.8v88.8c.5.1.9.1 1.4.2 10.7-34.1 21.6-68.2 30.7-102.8 1.2-2.9 2.8-4.3 6-4.1 20.5-.9 21.4-1.3 28.1 17.5 4.9 11.2 6.2 23.5 12.4 34 16.9-18.4 8.2-66-17.7-71.3-5.4 1.2-22.8-1.8-24.5 3.4-1.2 3.9-4.8 2.5-7.5 2.3-5.1.4-2-14.9-2.8-19 4.4-.7 7.6-.7 11.6 1.3 2.3 2.1 23.8 3.6 22.2-1.7-2.9-14.8 2.2-32.8-6.9-45.8-14.3 10-24.8 24.4-37.7 35.9-7.3 6.5-2.4 32.2-3.7 43 .1 3.8-1.2 5.3-5.4 5.3s-6.2-1.1-6.2-5.4c.1-13.3.1-26.6 0-39.9 1.1-11.6 25.4-25.3 32.7-36.7 3.8-4.6 10.5-6.7 13.2-13.2-4.3-2.1-13.8-14.7-17.4-10.2-9.2 11-50.8 41.1-50 51.3-1.3 12.1 4.4 34.7-5.4 42.5-5.1 3.6-8.2 10.7-15.1 10.9-9.7.1-19.4.3-29.1.5-1.4 0-3 .1-4-1.2 2.5-8.6 4.2-9.9 13.2-9.9 48.5 3.8 19.5-33.9 34.2-56.1 6.3-11.9 55.8-44.1 48-52.9-6.3-11 2-26-10.4-34.2-3.8-2.8-7.4-6-10.2-9.7-15.7-21.4-35.8-3.1-56.8-22.9-13.4-12-5 38.6-7.1 45.6 1.2 7.9-12.6 7.7-11.2-.2-3.9-67.1 14.8-62.6-38.1-61.8-6.7.3-10.1 6-14.2 10-10.8 7.9-10.3 18.9-10.2 30.2.3 29.8.1 59.6.1 89.3 0 7.3.5 7.9 8.2 7.8 16.6-.2 14.2 2.4 14.3-13.5.1-17.7 0-35.3.1-53 0-3.8-1-6.5-4.6-9-20.5-15.8 6-41.9 23.5-25 7.4 7.2 6.8 18.1-2.1 24.5-4 2.9-5.3 5.9-5.3 10.5.2 19.9.2 39.7 0 59.6-1.4 12.7 18.1-.5 17.7 11.5-.1 4.5-2 5.8-6.5 5.8-12.6-.2-25.3.2-37.9-.1-6-.2-7.6 1.9-7.4 7.2.4 11.7-.3 23.4.3 35.1.5 9.5-6.1 15.3-10.8 22.9-4-60.3 0-122.4-1.6-183.4-1.3-16.6 12.7-25.6 22.2-36.9 9.1-8.3 37-4.6 49.1-3.5 26.8 4.9 29.1 32.4 64.1 27.2 15.7-.7 25.1 19.4 37.3 27.4 4.7 4 5.8 9.5 6.3 15.1-.2 23.9 6.5 25.4 24.1 38.8 28.9 22.3 6.2 60.6 30.9 82.9 18.2 16.5 20.5 56.5 4.9 75.8-3.9 4.6-.6 8.6 1.5 12.6 31.7 72.2-34.6 74.4-31.1 115.4 4.7 22.7-15.8 40.7-30.7 56.2-15.7 16.9-38.8 3-50.2 24.1-20.9 27.5-82.6 53.5-107.7 19.6-6-8.6-16.6-14-19.4-25.4zM508 380.9c-3.4 11.5-7.5 22.8-9.5 35.2h22c-2.9-6.1-7.9-36.1-12.5-35.2zm-82.9 187.9c-6.9-2.6-10.9 7.8-3.9 10.3 6.6 2.6 11.5-6.8 3.9-10.3zm51.4-17.6c-1.8-4.6-9.7-4.7-11.3 0-2.7 8.8 13.2 9.6 11.3 0zM347.3 200.4c.6 7.2 12.1 5.9 11.6-.9-1.1-6.6-10.9-6.4-11.6.9z"/>
  <path d="M407.2 309.5c0-10.7.2-20.9-.1-31 .1-13.3 18.7-11.1 16.8-32-1-15.2-.1-30.6-.3-45.8-.1-4.6 1.7-5.2 6.3-5.4 17.4-.8 25 11.8 34.7 21.5 3.1 5.5.4 13.7 1.3 20 0 9.5-.4 9.8-11.9 7.9-.8-10.9 3.7-23.8-8.3-30.5-2.8-1.7-4.5-6.7-8.3-5.1-4 1.6-2.4 6.2-2.4 9.7.1 12.9-.1 25.8.2 38.7.1 5.4-2.5 9-7 11.8-7 4.4-10.6 10-10.2 18.4.6 11.1.3 22.2.2 33.3 0 9.6-.1 9.6-11.1 7.3.1-6 .1-12.1.1-18.8zm-191.3 312c-29.8-12.9-35.8-44.4-16.2-66.3 2.5-3.4 6.2-4.4 9.8-1.8 9.2 6.6-8.7 16.1-8.1 26.7-3.1 22.8 20.1 38 41.3 37.7 1.5.1 3.2.2 3.5 1.9-1.2 7.8-24.5 5.1-30.3 1.8zm55.5-134.1c-11.3 9.9-30.9 2-36.7 18.7-.4 1.1-1.4 2-2.8 2.1-10-12.2 8.5-25 20.5-25.4 7.9-1.1 16.3-.8 22.8-7.4 2 5.7-1.2 8.5-3.8 12zm-20.1-306c-9.5-2.6-14.2-.5-18.1 7.5-1.9 5.9-9.5 14.1-16 8 5.7-4.9 7.4-11.9 10.5-18.3 11.2-18.8 49.2-3.9 39.7 19.1-5.7-5.2-7-14-16.1-16.3zm9.9 69.2c9.4 8.2 11.1 16.1 4.6 23.9-5-18-16-24.7-34.5-15.8-1.6-5.1 2-7 4.8-8.8 8.3-5.3 16.6-4.6 25.1.7z"/>
</svg>
                          </div>
                        {isRecording && (
                          <>
                            <div className="absolute inset-0 rounded-full border-2 border-white/50 animate-ping opacity-75" />
                            <div className="absolute inset-0 rounded-full border-2 border-white/30 animate-ping opacity-50" style={{ animationDelay: '0.5s' }} />
                          </>
                        )}
                        <div className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-xl" style={{ backgroundColor: accentColor }} />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="top" className={isDarkMode ? 'bg-zinc-900 text-white border-white/10' : 'bg-white text-zinc-900 border-zinc-200'}>
                      <p>Live conversation</p>
                    </TooltipContent>
                  </Tooltip>

                  <div className={`h-12 md:h-14 w-px bg-gradient-to-b from-transparent ${isDarkMode ? 'via-white/20' : 'via-zinc-300'} to-transparent`} />

                  {/* Right Section */}
                  <div className="flex items-center gap-2 md:gap-3">
                    <div className="relative">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button
                            onClick={() => setIsTextMode(true)}
                            className="relative h-12 md:h-14 pl-4 md:pl-6 pr-12 md:pr-14 rounded-full flex items-center transition-all duration-200 hover:scale-[1.02] active:scale-95 group w-40 md:w-48"
                            style={{
                              backgroundColor: isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
                              border: `1.5px solid ${isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = `rgba(${accentRgb}, 0.1)`;
                              e.currentTarget.style.borderColor = `rgba(${accentRgb}, 0.4)`;
                              e.currentTarget.style.boxShadow = `0 0 20px rgba(${accentRgb}, 0.2)`;
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)';
                              e.currentTarget.style.borderColor = isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)';
                              e.currentTarget.style.boxShadow = 'none';
                            }}
                            aria-label="Type message"
                          >
                            <span className={`text-sm md:text-base truncate flex-1 ${isDarkMode ? 'text-white/40' : 'text-zinc-400'}`}>Type here...</span>
                          </button>
                        </TooltipTrigger>
                        <TooltipContent side="top" className={isDarkMode ? 'bg-zinc-900 text-white border-white/10' : 'bg-white text-zinc-900 border-zinc-200'}>
                          <p>Type message</p>
                        </TooltipContent>
                      </Tooltip>

                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setIsTextMode(true);
                              setTimeout(() => toggleDictation(), 100);
                            }}
                            className="absolute right-1 top-1/2 -translate-y-1/2 w-9 h-9 md:w-10 md:h-10 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95 z-10"
                            style={{
                              backgroundColor: isDarkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)',
                              border: `1px solid ${isDarkMode ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.15)'}`
                            }}
                            onMouseEnter={(e) => {
                              e.stopPropagation();
                              e.currentTarget.style.backgroundColor = `rgba(${accentRgb}, 0.2)`;
                              e.currentTarget.style.borderColor = `rgba(${accentRgb}, 0.6)`;
                              e.currentTarget.style.boxShadow = `0 0 15px rgba(${accentRgb}, 0.3)`;
                            }}
                            onMouseLeave={(e) => {
                              e.stopPropagation();
                              e.currentTarget.style.backgroundColor = isDarkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)';
                              e.currentTarget.style.borderColor = isDarkMode ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.15)';
                              e.currentTarget.style.boxShadow = 'none';
                            }}
                            aria-label="Start dictation"
                          >
                            <Mic className={`w-4 h-4 md:w-5 md:h-5 ${isDarkMode ? 'text-white/70' : 'text-zinc-500'}`} />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent side="top" className={isDarkMode ? 'bg-zinc-900 text-white border-white/10' : 'bg-white text-zinc-900 border-zinc-200'}>
                          <p>Voice dictation</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>

                    <DockButton 
                      icon={feedButtonIcon}
                      label={feedButtonLabel} 
                      onClick={handleFeedButtonClick}
                      accentColor={accentColor}
                      isDarkMode={isDarkMode}
                      size="medium"
                    />
                  </div>
                </div>
              </div>

              {/* Subtle accent line at bottom */}
              <div 
                className="absolute bottom-0 left-1/4 right-1/4 h-px"
                style={{
                  background: `linear-gradient(90deg, transparent, rgba(${accentRgb}, 0.6), transparent)`
                }}
              />
            </div>

            {/* Plus Menu Popup - Only shows on mobile */}
            {isPlusMenuOpen && (
              <div 
                className={`sm:hidden absolute bottom-full left-1/2 -translate-x-1/2 mb-3 flex gap-2 p-3 backdrop-blur-xl rounded-2xl animate-in fade-in slide-in-from-bottom-2 duration-200 ${
                  isDarkMode 
                    ? 'bg-zinc-900/95 border border-white/10' 
                    : 'bg-white/95 border border-zinc-200'
                }`}
                style={{
                  boxShadow: isDarkMode 
                    ? `0 8px 32px rgba(0,0,0,0.5), 0 0 20px rgba(${accentRgb}, 0.2)`
                    : `0 8px 32px rgba(0,0,0,0.15), 0 0 20px rgba(${accentRgb}, 0.1)`
                }}
              >
                {plusMenuItems.map(({ icon: Icon, label, action }) => (
                  <Tooltip key={action}>
                    <TooltipTrigger asChild>
                      <button
                        onClick={() => handleAction(action)}
                        className="h-14 w-14 rounded-xl flex items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95"
                        style={{
                          backgroundColor: isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
                          border: `1px solid ${isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = `rgba(${accentRgb}, 0.15)`;
                          e.currentTarget.style.borderColor = `rgba(${accentRgb}, 0.4)`;
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)';
                          e.currentTarget.style.borderColor = isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)';
                        }}
                        aria-label={label}
                      >
                        <Icon className={`h-6 w-6 ${isDarkMode ? 'text-white/70' : 'text-zinc-500'}`} />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="top" className={isDarkMode ? 'bg-zinc-900 text-white border-white/10' : 'bg-white text-zinc-900 border-zinc-200'}>
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

/* Icon Button Component */
function IconButton({ icon: Icon, label, onClick, accentColor, isDarkMode }) {
  const hexToRgb = (hex) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` : '59, 130, 246';
  };
  const accentRgb = hexToRgb(accentColor);

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          onClick={onClick}
          className="h-9 w-9 rounded-lg flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95"
          style={{
            backgroundColor: isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
            border: `1px solid ${isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = `rgba(${accentRgb}, 0.15)`;
            e.currentTarget.style.borderColor = `rgba(${accentRgb}, 0.4)`;
            e.currentTarget.style.boxShadow = `0 0 15px rgba(${accentRgb}, 0.3)`;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)';
            e.currentTarget.style.borderColor = isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)';
            e.currentTarget.style.boxShadow = 'none';
          }}
          aria-label={label}
        >
          <Icon className={`h-4 w-4 ${isDarkMode ? 'text-white/70' : 'text-zinc-500'}`} />
        </button>
      </TooltipTrigger>
      <TooltipContent side="top" className={isDarkMode ? 'bg-zinc-900 text-white border-white/10' : 'bg-white text-zinc-900 border-zinc-200'}>
        <p>{label}</p>
      </TooltipContent>
    </Tooltip>
  );
}

/* Dock Button Component */
function DockButton({ icon: Icon, label, onClick, accentColor, isDarkMode, isActive = false, size = 'medium' }) {
  const hexToRgb = (hex) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` : '59, 130, 246';
  };
  const accentRgb = hexToRgb(accentColor);

  const sizeClasses = {
    large: 'w-14 h-14',
    medium: 'w-12 h-12 md:w-14 md:h-14'
  };

  const iconSizeClasses = {
    large: 'w-6 h-6',
    medium: 'w-5 h-5 md:w-6 md:h-6'
  };

  const defaultBg = isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)';
  const defaultBorder = isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)';
  const defaultIconColor = isDarkMode ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.5)';

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          onClick={onClick}
          className={`${sizeClasses[size]} rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95 relative group flex-shrink-0`}
          style={{
            backgroundColor: isActive ? `rgba(${accentRgb}, 0.2)` : defaultBg,
            border: `1.5px solid ${isActive ? `rgba(${accentRgb}, 0.6)` : defaultBorder}`,
            boxShadow: isActive ? `0 0 20px rgba(${accentRgb}, 0.3)` : 'none'
          }}
          onMouseEnter={(e) => {
            if (!isActive) {
              e.currentTarget.style.backgroundColor = `rgba(${accentRgb}, 0.15)`;
              e.currentTarget.style.borderColor = `rgba(${accentRgb}, 0.5)`;
              e.currentTarget.style.boxShadow = `0 0 15px rgba(${accentRgb}, 0.3)`;
            }
          }}
          onMouseLeave={(e) => {
            if (!isActive) {
              e.currentTarget.style.backgroundColor = defaultBg;
              e.currentTarget.style.borderColor = defaultBorder;
              e.currentTarget.style.boxShadow = 'none';
            }
          }}
          aria-label={label}
        >
          <Icon 
            className={`${iconSizeClasses[size]} transition-colors`}
            style={{ color: isActive ? accentColor : defaultIconColor }}
          />
          <div 
            className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-lg pointer-events-none"
            style={{ backgroundColor: accentColor }}
          />
        </button>
      </TooltipTrigger>
      <TooltipContent side="top" className={isDarkMode ? 'bg-zinc-900 text-white border-white/10' : 'bg-white text-zinc-900 border-zinc-200'}>
        <p>{label}</p>
      </TooltipContent>
    </Tooltip>
  );
}