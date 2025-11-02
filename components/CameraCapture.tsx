import React, { useRef, useEffect, useState, useCallback } from 'react';

interface CameraCaptureProps {
  onCapture: (file: File) => void;
  onClose: () => void;
}

const CameraCapture: React.FC<CameraCaptureProps> = ({ onCapture, onClose }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isRetrying, setIsRetrying] = useState(false);
  const [errorType, setErrorType] = useState<'permission' | 'device' | 'other' | null>(null);

  const cleanupStream = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
    setStream(null);
  }, [stream]);

  const getErrorMessage = (err: any): { message: string; type: 'permission' | 'device' | 'other' } => {
    const errorName = err?.name || '';
    const errorMessage = err?.message || '';

    // Check for permission denied errors
    if (errorName === 'NotAllowedError' || errorName === 'PermissionDeniedError' || 
        errorMessage.includes('permission') || errorMessage.includes('denied')) {
      return {
        type: 'permission',
        message: "Camera access was denied. To fix this:\n\n" +
                 "1. Click the camera/lock icon in your browser's address bar\n" +
                 "2. Change camera permission from 'Block' to 'Allow'\n" +
                 "3. Refresh the page or click Retry below\n\n" +
                 "Or clear site permissions:\n" +
                 "• Chrome: Settings → Privacy → Site Settings → Camera → Remove this site\n" +
                 "• Firefox: Settings → Privacy → Permissions → Camera → Remove site\n" +
                 "• Edge: Settings → Cookies → Camera → Clear site data"
      };
    }

    // Check for device not found errors
    if (errorName === 'NotFoundError' || errorName === 'DevicesNotFoundError') {
      return {
        type: 'device',
        message: "No camera found. Please ensure:\n\n" +
                 "1. A camera is connected to your device\n" +
                 "2. No other application is using the camera\n" +
                 "3. Camera drivers are properly installed"
      };
    }

    // Check for device busy/overconstrained errors
    if (errorName === 'NotReadableError' || errorName === 'TrackStartError' || 
        errorMessage.includes('busy') || errorMessage.includes('in use')) {
      return {
        type: 'device',
        message: "Camera is being used by another application. Please:\n\n" +
                 "1. Close other applications using the camera\n" +
                 "2. Wait a few seconds\n" +
                 "3. Click Retry below"
      };
    }

    // Generic error
    return {
      type: 'other',
      message: "Could not access the camera. Please ensure:\n\n" +
               "1. You have granted camera permissions\n" +
               "2. Your camera is not being used by another application\n" +
               "3. You are using a secure (HTTPS) connection\n" +
               "4. Your browser supports camera access\n" +
               "5. Camera drivers are properly installed"
    };
  };

  const startCamera = useCallback(async (preferRearCamera = true) => {
    setError(null);
    setErrorType(null);
    setIsRetrying(true);

    try {
      // Check if mediaDevices API is available
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setError("Camera API is not supported in this browser.");
        setErrorType('other');
        setIsRetrying(false);
        return;
      }

      // Clean up any existing stream first
      cleanupStream();

      console.log(`Attempting to access ${preferRearCamera ? 'rear' : 'front'} camera...`);
      
      const constraints = preferRearCamera ? {
        video: { 
          facingMode: 'environment',
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        },
        audio: false,
      } : {
        video: {
          facingMode: 'user',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }, 
        audio: false 
      };

      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      
      console.log(`${preferRearCamera ? 'Rear' : 'Front'} camera access successful`);
      setStream(mediaStream);
      setIsRetrying(false);
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        // Ensure video starts playing
        try {
          await videoRef.current.play();
          console.log("Video playback started");
        } catch (playError) {
          console.error("Error starting video playback:", playError);
          setError("Error starting video playback. Please try refreshing the page.");
          setErrorType('other');
          cleanupStream();
        }
      }
    } catch (err: any) {
      console.error(`Error accessing ${preferRearCamera ? 'rear' : 'front'} camera:`, err);
      
      // If rear camera failed, try front camera (only on first attempt)
      if (preferRearCamera) {
        console.log("Attempting fallback to front camera...");
        try {
          await startCamera(false);
          return;
        } catch (fallbackErr) {
          // Fall through to error handling below
          err = fallbackErr;
        }
      }

      const errorInfo = getErrorMessage(err);
      setError(errorInfo.message);
      setErrorType(errorInfo.type);
      setIsRetrying(false);
    }
  }, [cleanupStream]);

  useEffect(() => {
    startCamera(true);

    return () => {
      cleanupStream();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run once on mount

  const handleRetry = () => {
    startCamera(true);
  };

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
                <div className="whitespace-pre-line text-sm max-w-2xl mb-6 px-4">
                  {error}
                </div>
                <button
                  onClick={handleRetry}
                  disabled={isRetrying}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors flex items-center gap-2"
                >
                  {isRetrying ? (
                    <>
                      <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Retrying...
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      Retry Camera Access
                    </>
                  )}
                </button>
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
          {!error && (
            <button
              onClick={handleCapture}
              disabled={!stream}
              className="w-20 h-20 rounded-full border-4 border-white bg-white/30 hover:bg-white/50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-black focus:ring-white disabled:bg-slate-500 disabled:cursor-not-allowed"
              aria-label="Capture photo"
            />
          )}
          <div className="w-14 h-14"></div> {/* Spacer to balance the layout */}
        </div>
      </div>
    </div>
  );
};

export default CameraCapture;