import React, { useState, useRef, useEffect } from 'react';
import { X, Camera, SwitchCamera, Circle } from 'lucide-react';
import { Button } from '@/components/ui/button';

/**
 * CameraCapture - Direct camera access component using getUserMedia
 */
export default function CameraCapture({ 
  isOpen, 
  onClose, 
  onCapture, 
  mode = 'photo', // 'photo' or 'video'
  accentColor = '#3B82F6' 
}) {
  const [stream, setStream] = useState(null);
  const [facingMode, setFacingMode] = useState('environment'); // 'user' for selfie, 'environment' for back
  const [isRecording, setIsRecording] = useState(false);
  const [error, setError] = useState(null);
  
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);

  // Start camera stream
  const startCamera = async () => {
    try {
      // Stop any existing stream
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }

      const constraints = {
        video: {
          facingMode: facingMode,
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        },
        audio: mode === 'video'
      };

      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      setStream(mediaStream);
      setError(null);

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      console.error('Error accessing camera:', err);
      if (err.name === 'NotAllowedError') {
        setError('Camera access denied. Please enable camera permissions in your browser settings.');
      } else if (err.name === 'NotFoundError') {
        setError('No camera found on this device.');
      } else {
        setError('Unable to access camera. Please try again.');
      }
    }
  };

  // Stop camera stream
  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  // Initialize camera when opened
  useEffect(() => {
    if (isOpen) {
      startCamera();
    } else {
      stopCamera();
    }

    return () => stopCamera();
  }, [isOpen, facingMode]);

  // Switch between front and back camera
  const switchCamera = () => {
    setFacingMode(prev => prev === 'user' ? 'environment' : 'user');
  };

  // Capture photo
  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    const ctx = canvas.getContext('2d');
    
    // Mirror if using front camera
    if (facingMode === 'user') {
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
    }
    
    ctx.drawImage(video, 0, 0);
    
    canvas.toBlob((blob) => {
      if (blob) {
        const file = new File([blob], `photo_${Date.now()}.jpg`, { type: 'image/jpeg' });
        onCapture({ type: 'camera', file });
        onClose();
      }
    }, 'image/jpeg', 0.9);
  };

  // Start video recording
  const startRecording = () => {
    if (!stream) return;

    chunksRef.current = [];
    const mediaRecorder = new MediaRecorder(stream, {
      mimeType: 'video/webm;codecs=vp9'
    });

    mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) {
        chunksRef.current.push(e.data);
      }
    };

    mediaRecorder.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: 'video/webm' });
      const file = new File([blob], `video_${Date.now()}.webm`, { type: 'video/webm' });
      onCapture({ type: 'video', file });
      onClose();
    };

    mediaRecorderRef.current = mediaRecorder;
    mediaRecorder.start();
    setIsRecording(true);
  };

  // Stop video recording
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  // Handle capture button click
  const handleCapture = () => {
    if (mode === 'photo') {
      capturePhoto();
    } else {
      if (isRecording) {
        stopRecording();
      } else {
        startRecording();
      }
    }
  };

  if (!isOpen) return null;

  const hexToRgb = (hex) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` : '59, 130, 246';
  };
  const accentRgb = hexToRgb(accentColor);

  return (
    <div className="fixed inset-0 z-[200] bg-black flex flex-col">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between p-4 bg-gradient-to-b from-black/60 to-transparent">
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="h-10 w-10 rounded-full bg-black/40 text-white hover:bg-black/60"
        >
          <X className="h-5 w-5" />
        </Button>
        
        <Button
          variant="ghost"
          size="icon"
          onClick={switchCamera}
          className="h-10 w-10 rounded-full bg-black/40 text-white hover:bg-black/60"
        >
          <SwitchCamera className="h-5 w-5" />
        </Button>
      </div>

      {/* Camera preview */}
      <div className="flex-1 flex items-center justify-center overflow-hidden">
        {error ? (
          <div className="text-center p-6">
            <Camera className="w-16 h-16 mx-auto mb-4 text-white/40" />
            <p className="text-white/70 text-sm max-w-xs">{error}</p>
            <Button 
              onClick={startCamera}
              className="mt-4"
              style={{ backgroundColor: accentColor }}
            >
              Try Again
            </Button>
          </div>
        ) : (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
            style={{
              transform: facingMode === 'user' ? 'scaleX(-1)' : 'none'
            }}
          />
        )}
      </div>

      {/* Hidden canvas for photo capture */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Controls */}
      <div className="absolute bottom-0 left-0 right-0 pb-[env(safe-area-inset-bottom)] bg-gradient-to-t from-black/60 to-transparent">
        <div className="flex items-center justify-center p-6">
          <button
            onClick={handleCapture}
            disabled={!!error}
            className={`
              w-20 h-20 rounded-full 
              flex items-center justify-center
              transition-all duration-200 active:scale-95
              disabled:opacity-40
              ${isRecording ? 'bg-red-500' : ''}
            `}
            style={{
              backgroundColor: isRecording ? undefined : accentColor,
              border: '4px solid white',
              boxShadow: `0 0 30px rgba(${accentRgb}, 0.5)`
            }}
          >
            {mode === 'photo' ? (
              <Camera className="w-8 h-8 text-white" />
            ) : (
              <Circle 
                className={`w-8 h-8 text-white ${isRecording ? 'fill-white' : ''}`}
                style={{ 
                  width: isRecording ? '24px' : '32px',
                  height: isRecording ? '24px' : '32px',
                  borderRadius: isRecording ? '4px' : '50%'
                }}
              />
            )}
          </button>
        </div>
        
        {/* Mode indicator */}
        <div className="text-center pb-4">
          <span className="text-white/60 text-xs uppercase tracking-wider">
            {mode === 'photo' ? 'Photo' : (isRecording ? 'Recording...' : 'Video')}
          </span>
        </div>
      </div>
    </div>
  );
}