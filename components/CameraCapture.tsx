import React, { useRef, useEffect, useState, useCallback } from 'react';

interface CameraCaptureProps {
  onCapture: (file: File) => void;
  onClose: () => void;
}

const CameraCapture: React.FC<CameraCaptureProps> = ({ onCapture, onClose }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);

  const cleanupStream = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
    setStream(null);
  }, [stream]);

  useEffect(() => {
    const startCamera = async () => {
      try {
        // First check if we have the permissions API
        if (navigator.permissions && navigator.permissions.query) {
          const result = await navigator.permissions.query({ name: 'camera' as PermissionName });
          if (result.state === 'denied') {
            setError("Camera access is blocked. Please allow camera access in your browser settings.");
            return;
          }
        }

        // Check if mediaDevices API is available
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          setError("Camera API is not supported in this browser.");
          return;
        }

        console.log("Attempting to access rear camera...");
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: { 
            facingMode: 'environment',
            width: { ideal: 1920 },
            height: { ideal: 1080 }
          },
          audio: false,
        });
        
        console.log("Rear camera access successful");
        setStream(mediaStream);
        
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
          // Ensure video starts playing
          try {
            await videoRef.current.play();
            console.log("Video playback started");
          } catch (playError) {
            console.error("Error starting video playback:", playError);
            setError("Error starting video playback. Please refresh and try again.");
          }
        }
      } catch (err) {
        console.error("Error accessing rear camera:", err);
        console.log("Attempting fallback to front camera...");
        
        try {
            const mediaStream = await navigator.mediaDevices.getUserMedia({ 
              video: {
                facingMode: 'user',
                width: { ideal: 1280 },
                height: { ideal: 720 }
              }, 
              audio: false 
            });
            
            console.log("Front camera access successful");
            setStream(mediaStream);
            
            if (videoRef.current) {
              videoRef.current.srcObject = mediaStream;
              try {
                await videoRef.current.play();
                console.log("Video playback started (front camera)");
              } catch (playError) {
                console.error("Error starting video playback (front camera):", playError);
                setError("Error starting video playback. Please refresh and try again.");
              }
            }
        } catch (fallbackErr) {
             console.error("Error accessing front camera:", fallbackErr);
             setError(
               "Could not access the camera. Please ensure:\n\n" +
               "1. You have granted camera permissions\n" +
               "2. Your camera is not being used by another application\n" +
               "3. You are using a secure (HTTPS) connection\n" +
               "4. Your browser supports camera access"
             );
        }
      }
    };

    startCamera();

    return () => {
      cleanupStream();
    };
  }, [cleanupStream]);

  const handleCapture = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const context = canvas.getContext('2d');
    if (context) {
      context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      canvas.toBlob((blob) => {
        if (blob) {
          const file = new File([blob], `capture-${Date.now()}.jpg`, { type: 'image/jpeg' });
          onCapture(file);
          cleanupStream();
          onClose();
        }
      }, 'image/jpeg', 0.9);
    }
  };
  
  const handleClose = () => {
      cleanupStream();
      onClose();
  }

  return (
    <div className="fixed inset-0 bg-black z-[100] flex flex-col items-center justify-center" role="dialog" aria-modal="true">
      <div className="relative w-full h-full">
        {error ? (
            <div className="w-full h-full flex flex-col items-center justify-center text-white p-4 text-center">
                <h2 className="text-xl font-bold text-red-500 mb-4">Camera Error</h2>
                <p>{error}</p>
            </div>
        ) : (
            <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                controls={false}
                className="w-full h-full object-cover"
                onLoadedMetadata={() => {
                  console.log("Video metadata loaded");
                  if (videoRef.current) {
                    videoRef.current.play().catch(err => {
                      console.error("Error playing video after metadata load:", err);
                    });
                  }
                }}
            />
        )}
        
        <div className="absolute bottom-0 left-0 right-0 p-6 bg-black bg-opacity-50 flex justify-center items-center space-x-8">
          <button
            onClick={handleClose}
            className="p-4 rounded-full text-white bg-slate-700 hover:bg-slate-600 transition-colors"
            aria-label="Cancel and close camera"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
          <button
            onClick={handleCapture}
            disabled={!stream}
            className="w-20 h-20 rounded-full border-4 border-white bg-white/30 hover:bg-white/50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-black focus:ring-white disabled:bg-slate-500 disabled:cursor-not-allowed"
            aria-label="Capture photo"
          />
          <div className="w-14 h-14"></div> {/* Spacer to balance the layout */}
        </div>
      </div>
    </div>
  );
};

export default CameraCapture;