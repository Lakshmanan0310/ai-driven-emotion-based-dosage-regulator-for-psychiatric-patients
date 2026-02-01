import React, { useState, useEffect, useRef } from 'react';
import { useTheme } from '../ThemeContext';

const EmotionDetector = ({ onEmotionDetected }) => {
  const { currentTheme, themes } = useTheme();
  const theme = themes[currentTheme];
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [isDetecting, setIsDetecting] = useState(false);
  const [detectedEmotion, setDetectedEmotion] = useState(null);
  const [countdown, setCountdown] = useState(3);
  const [showCountdown, setShowCountdown] = useState(false);

  // Start the emotion detection process
  const startDetection = () => {
    setShowCountdown(true);
    setCountdown(3);
    
    const countdownInterval = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(countdownInterval);
          setShowCountdown(false);
          captureAndDetect();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // Initialize webcam
  useEffect(() => {
    const setupCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false
        });
        
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.error('Error accessing webcam:', err);
      }
    };
    
    setupCamera();
    
    return () => {
      // Clean up video stream when component unmounts
      if (videoRef.current && videoRef.current.srcObject) {
        videoRef.current.srcObject.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  // Capture image and detect emotion
  const captureAndDetect = () => {
    setIsDetecting(true);
    
    // Draw current video frame to canvas
    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    if (video && canvas) {
      const context = canvas.getContext('2d');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      // Get image data from canvas
      canvas.toBlob(async (blob) => {
        try {
          // In a real implementation, this would send the blob to the server
          // For now, we'll simulate a response
          
          // Simulate API call delay
          await new Promise(resolve => setTimeout(resolve, 1500));
          
          // Mock emotions with probabilities
          const emotions = [
            { name: 'happy', probability: 0.1 },
            { name: 'sad', probability: 0.2 },
            { name: 'angry', probability: 0.05 },
            { name: 'fearful', probability: 0.15 },
            { name: 'disgusted', probability: 0.05 },
            { name: 'surprised', probability: 0.05 },
            { name: 'neutral', probability: 0.4 }
          ];
          
          // Find emotion with highest probability
          const highestEmotion = emotions.reduce((prev, current) => 
            (prev.probability > current.probability) ? prev : current
          );
          
          setDetectedEmotion(highestEmotion);
          
          if (onEmotionDetected) {
            onEmotionDetected(highestEmotion);
          }
          
          setIsDetecting(false);
        } catch (error) {
          console.error('Error detecting emotion:', error);
          setIsDetecting(false);
        }
      }, 'image/jpeg');
    }
  };

  // Map emotion to emoji
  const getEmotionEmoji = (emotion) => {
    if (!emotion) return '❓';
    
    const emojiMap = {
      happy: '😊',
      sad: '😔',
      angry: '😠',
      fearful: '😨',
      disgusted: '🤢',
      surprised: '😲',
      neutral: '😐'
    };
    
    return emojiMap[emotion.name] || '❓';
  };

  return (
    <div className={`rounded-xl overflow-hidden shadow-lg ${theme.cardBg}`}>
      <div className="relative">
        {/* Video feed */}
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-auto"
        />
        
        {/* Canvas for capturing (hidden) */}
        <canvas ref={canvasRef} className="hidden" />
        
        {/* Overlay for countdown and loading */}
        {(showCountdown || isDetecting) && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
            {showCountdown ? (
              <div className="text-6xl font-bold text-white">{countdown}</div>
            ) : (
              <div className="flex flex-col items-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
                <div className="mt-4 text-white font-medium">Analyzing...</div>
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* Controls and results */}
      <div className="p-4">
        <h2 className={`text-xl font-bold mb-4 ${theme.text}`}>Emotion Detector</h2>
        
        {detectedEmotion ? (
          <div className="mb-4">
            <div className="flex items-center justify-between">
              <div className={`${theme.text} font-medium`}>Detected Emotion:</div>
              <div className="flex items-center">
                <span className="text-3xl mr-2">{getEmotionEmoji(detectedEmotion)}</span>
                <span className={`${theme.text} font-bold capitalize`}>{detectedEmotion.name}</span>
              </div>
            </div>
            <div className="mt-2">
              <div className={`${theme.subtext} text-sm mb-1`}>Confidence: {Math.round(detectedEmotion.probability * 100)}%</div>
              <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                <div className="bg-gradient-to-r from-blue-500 to-purple-500 h-2.5 rounded-full" style={{ width: `${detectedEmotion.probability * 100}%` }}></div>
              </div>
            </div>
          </div>
        ) : (
          <p className={`${theme.subtext} mb-4`}>No emotion detected yet. Click the button below to start.</p>
        )}
        
        <button
          onClick={startDetection}
          disabled={isDetecting || showCountdown}
          className={`w-full py-2 px-4 rounded-lg bg-gradient-to-r ${theme.primary} text-white font-medium transition-all 
            ${(isDetecting || showCountdown) ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-lg'}`}
        >
          {isDetecting ? 'Detecting...' : 'Detect Emotion'}
        </button>
      </div>
    </div>
  );
};

export default EmotionDetector;
