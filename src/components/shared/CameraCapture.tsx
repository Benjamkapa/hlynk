import React, { useRef, useState, useEffect } from 'react';
import { Camera, RefreshCw, X, Circle } from 'lucide-react';

interface CameraCaptureProps {
  onCapture: (file: File) => void;
  onClose: () => void;
}

export const CameraCapture: React.FC<CameraCaptureProps> = ({ onCapture, onClose }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
    };
  }, [facingMode]);

  const startCamera = async () => {
    try {
      if (stream) {
        stopCamera();
      }
      const newStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: facingMode, width: { ideal: 1920 }, height: { ideal: 1080 } },
        audio: false
      });
      setStream(newStream);
      if (videoRef.current) {
        videoRef.current.srcObject = newStream;
      }
    } catch (err) {
      console.error('Error accessing camera:', err);
      setError('Could not access camera. Please ensure you have given permission.');
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
  };

  const handleCapture = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const context = canvas.getContext('2d');
      if (context) {
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        canvas.toBlob((blob) => {
          if (blob) {
            const file = new File([blob], `capture_${Date.now()}.jpg`, { type: 'image/jpeg' });
            onCapture(file);
            onClose();
          }
        }, 'image/jpeg', 0.9);
      }
    }
  };

  const toggleFacingMode = () => {
    setFacingMode(prev => (prev === 'user' ? 'environment' : 'user'));
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center">
      {error ? (
        <div className="text-white text-center p-6 bg-red-900/20 rounded-xl border border-red-500/50">
          <p className="font-bold mb-4">{error}</p>
          <button 
            onClick={onClose}
            className="px-6 py-2 bg-white text-black rounded-lg font-bold"
          >
            Go Back
          </button>
        </div>
      ) : (
        <>
          <div className="relative w-full h-full flex items-center justify-center">
            <video 
              ref={videoRef} 
              autoPlay 
              playsInline 
              className="w-full h-full object-cover"
            />
            
            {/* UI Overlay */}
            <div className="absolute inset-0 flex flex-col justify-between p-6">
              <div className="flex justify-between items-center">
                <button 
                  onClick={onClose}
                  className="p-3 bg-black/40 backdrop-blur-md rounded-full text-white hover:bg-black/60 transition-all"
                >
                  <X size={24} />
                </button>
                <div className="bg-emerald-500/80 backdrop-blur-md px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest text-white">
                  Live Preview
                </div>
                <button 
                  onClick={toggleFacingMode}
                  className="p-3 bg-black/40 backdrop-blur-md rounded-full text-white hover:bg-black/60 transition-all"
                >
                  <RefreshCw size={24} />
                </button>
              </div>

              <div className="flex justify-center items-center pb-10">
                <button 
                  onClick={handleCapture}
                  className="group relative flex items-center justify-center"
                >
                  <div className="absolute h-20 w-20 rounded-full border-4 border-white animate-pulse" />
                  <div className="h-16 w-16 bg-white rounded-full flex items-center justify-center group-active:scale-95 transition-transform">
                    <Camera size={32} className="text-emerald-900" />
                  </div>
                </button>
              </div>
            </div>
          </div>
          <canvas ref={canvasRef} className="hidden" />
        </>
      )}
    </div>
  );
};
