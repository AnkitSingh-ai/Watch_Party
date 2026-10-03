import React, { useState, useEffect, useRef } from 'react';
import { Camera, CameraOff, Mic, MicOff, User } from 'lucide-react';
import { useRoom } from '../context/RoomContext';

export function ParticipantWebcams({
  onEmit,
}: {
  onEmit: (event: string, data: unknown) => void;
}) {
  const { currentUser, roomState } = useRoom();
  const [cameraOn, setCameraOn] = useState(false);
  const [micOn, setMicOn] = useState(true);
  const [streamError, setStreamError] = useState<string | null>(null);

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const localStreamRef = useRef<MediaStream | null>(null);

  // Toggle Camera
  const toggleCamera = async () => {
    if (cameraOn) {
      // Turn off camera
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((t) => t.stop());
        localStreamRef.current = null;
      }
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = null;
      }
      setCameraOn(false);
      setStreamError(null);
    } else {
      // Turn on camera
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 320, height: 240 },
          audio: true,
        });
        localStreamRef.current = stream;
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }
        setCameraOn(true);
        setStreamError(null);
      } catch (err: any) {
        console.warn('Webcam permission error:', err);
        setStreamError('Camera access denied or unavailable');
        setCameraOn(false);
      }
    }
  };

  // Toggle Audio Track
  const toggleMic = () => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !micOn;
        setMicOn(!micOn);
      }
    }
  };

  // Clean up stream on unmount
  useEffect(() => {
    return () => {
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((t) => t.stop());
      }
    };
  }, []);

  return (
    <div className="flex flex-col gap-2">
      {/* Controls Bar */}
      <div className="flex items-center gap-2">
        <button
          onClick={toggleCamera}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border ${
            cameraOn
              ? 'bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-400 shadow-md'
              : 'bg-white/5 hover:bg-white/10 text-gray-300 border-white/10'
          }`}
          title={cameraOn ? 'Turn Off Camera' : 'Turn On Camera'}
        >
          {cameraOn ? <Camera className="w-3.5 h-3.5" /> : <CameraOff className="w-3.5 h-3.5 text-gray-400" />}
          <span>{cameraOn ? 'Cam On' : 'Start Cam'}</span>
        </button>

        {cameraOn && (
          <button
            onClick={toggleMic}
            className={`p-1.5 rounded-xl text-xs transition-all border ${
              micOn
                ? 'bg-white/10 text-gray-200 border-white/10 hover:bg-white/20'
                : 'bg-red-900/50 text-red-300 border-red-500/30'
            }`}
            title={micOn ? 'Mute Microphone' : 'Unmute Microphone'}
          >
            {micOn ? <Mic className="w-3.5 h-3.5" /> : <MicOff className="w-3.5 h-3.5" />}
          </button>
        )}
      </div>

      {streamError && (
        <p className="text-[11px] text-red-400 bg-red-950/40 px-2 py-1 rounded border border-red-500/20">
          {streamError}
        </p>
      )}

      {/* Floating Local Camera Feed */}
      {cameraOn && (
        <div className="relative w-36 h-24 sm:w-44 sm:h-28 bg-black rounded-xl overflow-hidden border border-emerald-500/40 shadow-xl group">
          <video
            ref={localVideoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover transform -scale-x-100"
          />
          <div className="absolute bottom-1 left-1 bg-black/70 backdrop-blur-sm px-1.5 py-0.5 rounded text-[10px] text-white font-medium flex items-center gap-1">
            <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
            <span>{currentUser?.username || 'You'}</span>
          </div>
        </div>
      )}
    </div>
  );
}
