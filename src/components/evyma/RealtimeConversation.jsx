import React, { useState, useRef, useEffect } from 'react';
import { Mic, MicOff, Volume2, VolumeX, MessageSquare, Info, Keyboard, PhoneOff, Loader } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { base44 } from '@/api/base44Client';
import { useTheme } from '@/components/theme/ThemeContext';
import GlassCard from '@/components/theme/GlassCard';

export default function RealtimeConversation({ accentColor, isOpen, onClose }) {
  const { isDarkMode } = useTheme();
  const [isConnected, setIsConnected] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState([]);
  const [currentUserTranscript, setCurrentUserTranscript] = useState('');
  const [status, setStatus] = useState('disconnected');
  const [sessionDuration, setSessionDuration] = useState(0);
  const [textInput, setTextInput] = useState('');
  
  // Session preferences
  const [preferences, setPreferences] = useState({
    show_session_details: false,
    coach_voice_enabled: true,
    show_transcript: true,
    show_keyboard: false
  });
  
  const wsRef = useRef(null);
  const audioContextRef = useRef(null);
  const captureAudioContextRef = useRef(null);
  const mediaStreamRef = useRef(null);
  const audioQueueRef = useRef([]);
  const isPlayingRef = useRef(false);
  const currentAudioSourceRef = useRef(null);
  const currentPlayingItemRef = useRef(null);
  const audioStartTimeRef = useRef(null);
  const transcriptEndRef = useRef(null);
  const processorRef = useRef(null);
  const sessionTimerRef = useRef(null);

  // Load user preferences on mount
  useEffect(() => {
    const loadPreferences = async () => {
      try {
        const user = await base44.auth.me();
        if (user?.session_preferences) {
          setPreferences(prev => ({ ...prev, ...user.session_preferences }));
        }
      } catch (e) {
        // User not logged in or no preferences
      }
    };
    loadPreferences();
  }, []);

  // Save preferences when they change
  const updatePreference = async (key, value) => {
    const newPrefs = { ...preferences, [key]: value };
    setPreferences(newPrefs);
    try {
      await base44.auth.updateMe({ session_preferences: newPrefs });
    } catch (e) {
      // Silent fail
    }
  };

  // Session timer
  useEffect(() => {
    if (isConnected) {
      setSessionDuration(0);
      sessionTimerRef.current = setInterval(() => {
        setSessionDuration(prev => prev + 1);
      }, 1000);
    } else {
      if (sessionTimerRef.current) {
        clearInterval(sessionTimerRef.current);
        sessionTimerRef.current = null;
      }
      setSessionDuration(0);
    }
    return () => {
      if (sessionTimerRef.current) {
        clearInterval(sessionTimerRef.current);
      }
    };
  }, [isConnected]);

  // Auto-scroll to bottom when transcript updates
  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [transcript, currentUserTranscript]);

  // Auto-connect when drawer opens, cleanup when closes
  useEffect(() => {
    if (isOpen && !isConnected && status === 'disconnected') {
      connectToRealtime();
    } else if (!isOpen && isConnected) {
      disconnect();
    }
    return () => disconnect();
  }, [isOpen]);

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const connectToRealtime = async () => {
    try {
      setStatus('connecting');
      
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;

      const { data: sessionData } = await base44.functions.invoke('realtimeSession', {});
      
      if (!sessionData.success || !sessionData.apiKey) {
        throw new Error(sessionData.error || 'Failed to get API key');
      }

      // Connect to WebSocket
      const ws = new WebSocket(
        `wss://api.openai.com/v1/realtime?model=gpt-realtime-mini-2025-10-06`,
        ['realtime', `openai-insecure-api-key.${sessionData.apiKey}`]
      );

      ws.onopen = () => {
        setIsConnected(true);
        setStatus('connected');
      };

      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);

        if (data.type === 'error') {
          console.error('OpenAI API Error:', data.error);
        }

        // Configure session after creation
        if (data.type === 'session.created') {
          ws.send(JSON.stringify({
            type: 'session.update',
            session: {
              type: 'realtime',
              model: 'gpt-realtime-mini-2025-10-06',
              instructions: 'You are Evyma, a warm and supportive AI life coach. Start the conversation by greeting the user warmly and asking how you can help them today. Keep responses concise and conversational.',
              output_modalities: ['audio'],
              audio: {
                input: {
                  format: {
                    type: 'audio/pcm',
                    rate: 24000
                  },
                  transcription: {
                    model: 'whisper-1'
                  },
                  turn_detection: {
                    type: 'server_vad',
                    threshold: 0.5,
                    prefix_padding_ms: 300,
                    silence_duration_ms: 200
                  }
                },
                output: {
                  format: {
                    type: 'audio/pcm',
                    rate: 24000
                  },
                  voice: 'alloy',
                  speed: 1.0
                }
              }
            }
          }));
        }

        // After session is updated, send initial greeting trigger
        if (data.type === 'session.updated') {
          // Small delay to ensure session is ready
          setTimeout(() => {
            if (ws.readyState === WebSocket.OPEN) {
              // Add a user message to trigger AI response
              ws.send(JSON.stringify({
                type: 'conversation.item.create',
                item: {
                  type: 'message',
                  role: 'user',
                  content: [{ type: 'input_text', text: 'Hello' }]
                }
              }));
              // Request AI to respond
              ws.send(JSON.stringify({ type: 'response.create' }));
            }
          }, 300);
        }

        if (data.type === 'input_audio_buffer.speech_started') {
          setIsRecording(true);
          setCurrentUserTranscript('');

          if (isPlayingRef.current && currentAudioSourceRef.current && currentPlayingItemRef.current) {
            currentAudioSourceRef.current.stop();
            currentAudioSourceRef.current = null;

            const playedDuration = audioStartTimeRef.current 
              ? Math.floor((Date.now() - audioStartTimeRef.current))
              : 0;

            audioQueueRef.current = [];
            isPlayingRef.current = false;

            if (ws.readyState === WebSocket.OPEN && playedDuration > 0) {
              ws.send(JSON.stringify({
                type: 'conversation.item.truncate',
                item_id: currentPlayingItemRef.current.itemId,
                content_index: 0,
                audio_end_ms: playedDuration
              }));
            }

            currentPlayingItemRef.current = null;
            audioStartTimeRef.current = null;
          }
        }

        if (data.type === 'input_audio_buffer.speech_stopped') {
          setIsRecording(false);
        }

        if (data.type === 'conversation.item.input_audio_transcription.delta') {
          setCurrentUserTranscript(prev => prev + data.delta);
        }

        if (data.type === 'conversation.item.input_audio_transcription.completed') {
          setTranscript(prev => [...prev, {
            role: 'user',
            text: data.transcript,
            timestamp: new Date()
          }]);
          setCurrentUserTranscript('');
        }

        if (data.type === 'response.output_audio_transcript.delta') {
          setTranscript(prev => {
            const last = prev[prev.length - 1];
            if (last && last.role === 'assistant' && last.isStreaming) {
              return [...prev.slice(0, -1), { ...last, text: last.text + data.delta }];
            } else {
              return [...prev, { role: 'assistant', text: data.delta, timestamp: new Date(), isStreaming: true }];
            }
          });
        }

        if (data.type === 'response.output_audio_transcript.done') {
          setTranscript(prev => {
            const last = prev[prev.length - 1];
            if (last && last.isStreaming) {
              return [...prev.slice(0, -1), { ...last, isStreaming: false }];
            }
            return prev;
          });
        }

        if (data.type === 'response.output_audio.delta' && data.delta) {
          if (preferences.coach_voice_enabled) {
            playAudioChunk(data.delta, data.item_id);
          }
        }
      };

      ws.onerror = () => setStatus('error');
      ws.onclose = () => {
        setIsConnected(false);
        setStatus('disconnected');
      };

      wsRef.current = ws;

      // Create playback audio context (separate from capture)
      const PlaybackAudioContext = window.AudioContext || window.webkitAudioContext;
      audioContextRef.current = new PlaybackAudioContext({ sampleRate: 24000 });
      
      // iOS requires user gesture to resume audio context
      if (audioContextRef.current.state === 'suspended') {
        await audioContextRef.current.resume();
      }
      
      startAudioCapture(stream, ws);

    } catch (error) {
      console.error('Failed to connect:', error);
      setStatus('error');
    }
  };

  const startAudioCapture = async (stream, ws) => {
    // Use webkitAudioContext for iOS Safari compatibility
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    const audioContext = new AudioContextClass({ sampleRate: 24000 });
    captureAudioContextRef.current = audioContext;
    
    // iOS requires resuming audio context after user gesture
    if (audioContext.state === 'suspended') {
      await audioContext.resume();
    }
    
    const source = audioContext.createMediaStreamSource(stream);
    const processor = audioContext.createScriptProcessor(4096, 1, 1);
    processorRef.current = processor;

    source.connect(processor);
    processor.connect(audioContext.destination);

    processor.onaudioprocess = (e) => {
      if (ws.readyState === WebSocket.OPEN) {
        const inputData = e.inputBuffer.getChannelData(0);
        const pcm16 = new Int16Array(inputData.length);
        
        for (let i = 0; i < inputData.length; i++) {
          const s = Math.max(-1, Math.min(1, inputData[i]));
          pcm16[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
        }

        const base64Audio = btoa(String.fromCharCode(...new Uint8Array(pcm16.buffer)));
        ws.send(JSON.stringify({ type: 'input_audio_buffer.append', audio: base64Audio }));
      }
    };
  };

  const playAudioChunk = async (base64Audio, itemId) => {
    if (!audioContextRef.current) return;

    try {
      const binaryString = atob(base64Audio);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      const audioData = new Int16Array(bytes.buffer);
      const floatData = new Float32Array(audioData.length);
      for (let i = 0; i < audioData.length; i++) {
        floatData[i] = audioData[i] / 32768.0;
      }

      const audioBuffer = audioContextRef.current.createBuffer(1, floatData.length, 24000);
      audioBuffer.getChannelData(0).set(floatData);

      audioQueueRef.current.push({ buffer: audioBuffer, itemId });
      
      if (!isPlayingRef.current) {
        playNextInQueue();
      }
    } catch (error) {
      console.error('Error playing audio chunk:', error);
    }
  };

  const playNextInQueue = async () => {
    if (audioQueueRef.current.length === 0) {
      isPlayingRef.current = false;
      currentPlayingItemRef.current = null;
      audioStartTimeRef.current = null;
      return;
    }

    isPlayingRef.current = true;
    const { buffer: audioBuffer, itemId } = audioQueueRef.current.shift();
    
    if (!currentPlayingItemRef.current || currentPlayingItemRef.current.itemId !== itemId) {
      currentPlayingItemRef.current = { itemId };
      audioStartTimeRef.current = Date.now();
    }

    if (audioContextRef.current.state === 'suspended') {
      await audioContextRef.current.resume();
    }

    const source = audioContextRef.current.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(audioContextRef.current.destination);
    currentAudioSourceRef.current = source;
    
    source.onended = () => {
      currentAudioSourceRef.current = null;
      playNextInQueue();
    };
    
    source.start();
  };

  const disconnect = () => {
    if (currentAudioSourceRef.current) {
      try { currentAudioSourceRef.current.stop(); } catch (e) {}
      currentAudioSourceRef.current = null;
    }
    
    if (processorRef.current) {
      processorRef.current.disconnect();
      processorRef.current = null;
    }
    
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
      mediaStreamRef.current = null;
    }
    if (captureAudioContextRef.current && captureAudioContextRef.current.state !== 'closed') {
      try { captureAudioContextRef.current.close(); } catch (e) {}
      captureAudioContextRef.current = null;
    }
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      try { audioContextRef.current.close(); } catch (e) {}
      audioContextRef.current = null;
    }
    audioQueueRef.current = [];
    isPlayingRef.current = false;
    currentPlayingItemRef.current = null;
    audioStartTimeRef.current = null;
    setIsConnected(false);
    setStatus('disconnected');
    setTranscript([]);
  };

  const handleEndSession = () => {
    disconnect();
    onClose();
  };

  const sendTextMessage = () => {
    if (!textInput.trim() || !wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;
    
    wsRef.current.send(JSON.stringify({
      type: 'conversation.item.create',
      item: {
        type: 'message',
        role: 'user',
        content: [{ type: 'input_text', text: textInput }]
      }
    }));
    wsRef.current.send(JSON.stringify({ type: 'response.create' }));
    
    setTranscript(prev => [...prev, {
      role: 'user',
      text: textInput,
      timestamp: new Date()
    }]);
    setTextInput('');
  };

  const hexToRgb = (hex) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` : '59, 130, 246';
  };
  const accentRgb = hexToRgb(accentColor);

  return (
    <div className="flex flex-col h-full min-h-0">
      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto space-y-4 pb-4">
        {/* Connecting State */}
        {status === 'connecting' && (
          <GlassCard className="p-6">
            <div className="flex flex-col items-center justify-center gap-3">
              <Loader className="w-8 h-8 animate-spin" style={{ color: accentColor }} />
              <span className={`text-sm ${isDarkMode ? 'text-white/60' : 'text-zinc-500'}`}>
                Connecting to your coach...
              </span>
            </div>
          </GlassCard>
        )}

        {/* Recording Status */}
        {isConnected && (
          <GlassCard className="p-4">
            <div className="flex items-center justify-center gap-3">
              {isRecording ? (
                <>
                  <div className="relative">
                    <Mic className="w-5 h-5" style={{ color: accentColor }} />
                    <div 
                      className="absolute inset-0 rounded-full animate-ping opacity-50"
                      style={{ backgroundColor: accentColor }}
                    />
                  </div>
                  <span className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-zinc-900'}`}>Listening...</span>
                </>
              ) : (
                <>
                  <MicOff className={`w-5 h-5 ${isDarkMode ? 'text-white/40' : 'text-zinc-400'}`} />
                  <span className={`text-sm ${isDarkMode ? 'text-white/60' : 'text-zinc-500'}`}>Waiting for speech...</span>
                </>
              )}
            </div>
          </GlassCard>
        )}

        {/* Session Details */}
        {preferences.show_session_details && isConnected && (
          <GlassCard className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Info className="w-4 h-4" style={{ color: accentColor }} />
              <span className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-zinc-900'}`}>Session Details</span>
            </div>
            <div className={`text-xs space-y-1 ${isDarkMode ? 'text-white/60' : 'text-zinc-500'}`}>
              <p>Duration: {formatDuration(sessionDuration)}</p>
              <p>Status: {status}</p>
              <p>Messages: {transcript.length}</p>
            </div>
          </GlassCard>
        )}

        {/* Transcript */}
        {preferences.show_transcript && (
          <GlassCard className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <MessageSquare className="w-4 h-4" style={{ color: accentColor }} />
              <span className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-zinc-900'}`}>Conversation</span>
            </div>

            <div 
              className={`rounded-xl p-3 min-h-[150px] max-h-[300px] overflow-y-auto ${
                isDarkMode ? 'bg-white/5' : 'bg-zinc-100/50'
              }`}
            >
              {transcript.length === 0 && !currentUserTranscript ? (
                <div className="text-center py-8">
                  <Mic className={`w-10 h-10 mx-auto mb-2 ${isDarkMode ? 'text-white/20' : 'text-zinc-300'}`} />
                  <p className={`text-sm ${isDarkMode ? 'text-white/40' : 'text-zinc-400'}`}>
                    {isConnected ? 'Start speaking...' : 'Connecting...'}
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {transcript.map((msg, idx) => (
                    <div
                      key={idx}
                      className={`p-2.5 rounded-xl text-sm ${
                        msg.role === 'assistant' ? 'mr-8' : 'ml-8'
                      }`}
                      style={{
                        backgroundColor: msg.role === 'assistant' 
                          ? (isDarkMode ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.8)')
                          : `rgba(${accentRgb}, 0.9)`,
                        color: msg.role === 'assistant' 
                          ? (isDarkMode ? 'rgba(255,255,255,0.9)' : '#1f2937')
                          : 'white'
                      }}
                    >
                      <div className="text-[10px] mb-1 opacity-60">
                        {msg.role === 'assistant' ? 'Evyma' : 'You'} • {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                      <div>{msg.text}</div>
                    </div>
                  ))}

                  {currentUserTranscript && (
                    <div
                      className="p-2.5 rounded-xl text-sm ml-8 opacity-70"
                      style={{ backgroundColor: `rgba(${accentRgb}, 0.7)`, color: 'white' }}
                    >
                      <div className="text-[10px] mb-1 opacity-60">You • Speaking...</div>
                      <div>{currentUserTranscript}</div>
                    </div>
                  )}
                  <div ref={transcriptEndRef} />
                </div>
              )}
            </div>
          </GlassCard>
        )}

        {/* Keyboard Input */}
        {preferences.show_keyboard && isConnected && (
          <GlassCard className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <Keyboard className="w-4 h-4" style={{ color: accentColor }} />
              <span className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-zinc-900'}`}>Type a message</span>
            </div>
            <div className="flex gap-2">
              <Textarea
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                placeholder="Type your message..."
                className={`flex-1 min-h-[44px] resize-none ${
                  isDarkMode 
                    ? 'bg-white/5 border-white/10 text-white placeholder:text-white/40' 
                    : 'bg-zinc-100 border-zinc-200 text-zinc-900'
                }`}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    sendTextMessage();
                  }
                }}
              />
              <Button
                onClick={sendTextMessage}
                disabled={!textInput.trim()}
                className="h-11 px-4 text-white"
                style={{ backgroundColor: accentColor }}
              >
                Send
              </Button>
            </div>
          </GlassCard>
        )}
      </div>

      {/* Bottom Controls Dock */}
      <div 
        className={`sticky bottom-0 left-0 right-0 p-3 backdrop-blur-xl rounded-t-2xl border-t ${
          isDarkMode 
            ? 'bg-zinc-900/90 border-white/10' 
            : 'bg-white/90 border-zinc-200'
        }`}
      >
        <div className="flex items-center justify-between gap-2">
          {/* Toggle Buttons */}
          <div className="flex items-center gap-1">
            <ToggleButton
              icon={Info}
              active={preferences.show_session_details}
              onClick={() => updatePreference('show_session_details', !preferences.show_session_details)}
              accentColor={accentColor}
              isDarkMode={isDarkMode}
              label="Details"
            />
            <ToggleButton
              icon={preferences.coach_voice_enabled ? Volume2 : VolumeX}
              active={preferences.coach_voice_enabled}
              onClick={() => updatePreference('coach_voice_enabled', !preferences.coach_voice_enabled)}
              accentColor={accentColor}
              isDarkMode={isDarkMode}
              label="Voice"
            />
            <ToggleButton
              icon={MessageSquare}
              active={preferences.show_transcript}
              onClick={() => updatePreference('show_transcript', !preferences.show_transcript)}
              accentColor={accentColor}
              isDarkMode={isDarkMode}
              label="Chat"
            />
            <ToggleButton
              icon={Keyboard}
              active={preferences.show_keyboard}
              onClick={() => updatePreference('show_keyboard', !preferences.show_keyboard)}
              accentColor={accentColor}
              isDarkMode={isDarkMode}
              label="Type"
            />
          </div>

          {/* End Session Button */}
          <Button
            onClick={handleEndSession}
            variant="ghost"
            size="icon"
            className="h-10 w-10 rounded-full bg-red-500/20 hover:bg-red-500/30 text-red-400 hover:text-red-300"
          >
            <PhoneOff className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}

function ToggleButton({ icon: Icon, active, onClick, accentColor, isDarkMode, label }) {
  const hexToRgb = (hex) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` : '59, 130, 246';
  };
  const accentRgb = hexToRgb(accentColor);

  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-lg transition-all ${
        active 
          ? '' 
          : isDarkMode ? 'text-white/40 hover:text-white/60' : 'text-zinc-400 hover:text-zinc-600'
      }`}
      style={{
        backgroundColor: active ? `rgba(${accentRgb}, 0.15)` : 'transparent',
        color: active ? accentColor : undefined
      }}
    >
      <Icon className="w-4 h-4" />
      <span className="text-[10px]">{label}</span>
    </button>
  );
}