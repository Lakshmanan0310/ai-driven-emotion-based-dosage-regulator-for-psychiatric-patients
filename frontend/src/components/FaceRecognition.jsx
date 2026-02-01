import React, { useEffect, useRef, useState } from 'react';
import * as faceapi from 'face-api.js';

const FaceRecognition = ({ onEmotionDetected }) => {
  const videoRef = useRef(null);
  const [emotion, setEmotion] = useState('Loading models...');
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [mode, setMode] = useState('webcam'); // 'webcam' | 'image'
  const [imagePreview, setImagePreview] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [detectionData, setDetectionData] = useState(null);
  const [detectionPaused, setDetectionPaused] = useState(false);
  const [detectionInterval, setDetectionIntervalRef] = useState(null);

  // Emotion descriptions for more detailed feedback
  const emotionDescriptions = {
    happy: "You're showing signs of happiness! Your facial expressions indicate joy and contentment.",
    sad: "I'm detecting sadness in your expression. It's okay to feel this way sometimes.",
    angry: "Your expressions suggest you might be feeling angry or frustrated right now.",
    fearful: "I notice signs of fear or anxiety in your expression. Deep breaths can help.",
    disgusted: "Your facial expressions indicate disgust or aversion.",
    surprised: "You appear surprised! Something unexpected must have caught your attention.",
    neutral: "Your expression is neutral, showing a balanced emotional state."
  };

  // Load models
  useEffect(() => {
    const loadModels = async () => {
      try {
        const MODEL_URL = 'https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model';
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
          faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
          faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL),
        ]);
        setModelsLoaded(true);
        setEmotion('Ready for detection');
        console.log('Models loaded successfully');
      } catch (error) {
        console.error('Failed to load models:', error);
        setEmotion('Model loading failed');
      }
    };
    loadModels();
  }, []);

  // Webcam detection setup
  useEffect(() => {
    if (mode !== 'webcam' || !modelsLoaded) return;

    let interval;
    const startVideo = async () => {
      try {
        console.log('Attempting to start webcam...');
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { 
            width: { ideal: 720 },
            height: { ideal: 560 }
          } 
        });
        
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.onloadedmetadata = () => {
            videoRef.current.play();
            console.log('Webcam started successfully');
          };
        }
        
        // Run detection at a higher frequency (500ms instead of 1000ms) for more responsive detection
        interval = setInterval(async () => {
          if (videoRef.current && videoRef.current.readyState === 4 && !detectionPaused) {
            try {
              const detections = await faceapi
                .detectSingleFace(videoRef.current, new faceapi.TinyFaceDetectorOptions())
                .withFaceLandmarks()
                .withFaceExpressions();

              processDetections(detections);
            } catch (err) {
              console.error('Error during face detection:', err);
              // Continue detection even if there's an error
            }
          }
        }, 500); // Faster detection interval for more responsive UI
        
        setDetectionIntervalRef(interval);
      } catch (error) {
        console.error('Webcam error:', error);
        setEmotion('Webcam access required');
      }
    };

    startVideo();
    return () => {
      console.log('Cleaning up webcam resources');
      clearInterval(interval);
      if (videoRef.current?.srcObject) {
        videoRef.current.srcObject.getTracks().forEach(track => track.stop());
      }
    };
  }, [mode, modelsLoaded, detectionPaused]);

  // Unified detection processing
  const processDetections = (detections) => {
    setProcessing(true);
    try {
      if (detections?.expressions) {
        const expressions = detections.expressions;
        
        // Filter out expressions with very low confidence (below 5%)
        const significantExpressions = {};
        Object.entries(expressions).forEach(([emotion, value]) => {
          if (value > 0.05) { // Only consider expressions with >5% confidence
            significantExpressions[emotion] = value;
          }
        });
        
        // Find the dominant expression
        let dominantExpression = Object.keys(expressions).reduce((a, b) => {
          return expressions[a] > expressions[b] ? a : b;
        });
        
        // Format the emotion name
        let formattedEmotion = dominantExpression.charAt(0).toUpperCase() + dominantExpression.slice(1);
        
        // Only update if the confidence is above a threshold (10%)
        if (expressions[dominantExpression] > 0.1) {
          // Update state
          setEmotion(formattedEmotion);
          setDetectionData({
            expressionValues: expressions,
            dominantExpression: formattedEmotion
          });
          
          // Send data to parent component if callback exists
          if (onEmotionDetected) {
            onEmotionDetected({
              emotion: formattedEmotion.toLowerCase(),
              expressionValues: expressions,
              timestamp: new Date().getTime()
            });
          }
        }
      } else {
        console.log('No face detected or no expressions available');
        setEmotion('No face detected');
      }
    } catch (error) {
      console.error('Error processing detections:', error);
      setEmotion('Detection error');
    } finally {
      setProcessing(false);
    }
  };

  // Handle image upload
  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setMode('image');
    setProcessing(true);
    
    try {
      console.log('Processing uploaded image');
      const img = await faceapi.bufferToImage(file);
      setImagePreview(URL.createObjectURL(file));
      
      const detections = await faceapi
        .detectSingleFace(img, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks()
        .withFaceExpressions();

      processDetections(detections);
    } catch (error) {
      console.error('Image processing error:', error);
      setEmotion('Invalid image');
      setProcessing(false);
    }
  };

  // No longer needed since we're continuously detecting
  const handleSuggestionComplete = () => {
    // This function is kept for compatibility but no longer pauses detection
    console.log('Continuing emotion detection');
  };

  // Get appropriate emoji for each emotion
  const getEmotionEmoji = (emotion) => {
    const emojis = {
      'Happy': '😊',
      'Sad': '😢',
      'Angry': '😠',
      'Fearful': '😨',
      'Disgusted': '🤢',
      'Surprised': '😲',
      'Neutral': '😐',
      'No face detected': '❓',
      'Detection error': '⚠️',
      'Model loading failed': '❌',
      'Webcam access required': '🎥',
      'Ready for detection': '🔍',
      'Loading models...': '⏳'
    };
    return emojis[emotion] || '❓';
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-center mb-6 text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
        Real-time Emotion Detection
      </h1>
      
      <div className="flex justify-center gap-4 mb-8">
        <button
          onClick={() => setMode('webcam')}
          disabled={mode === 'webcam'}
          className={`webcam-mode-button px-6 py-3 rounded-lg font-medium transition-all duration-300 ${
            mode === 'webcam' 
              ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg' 
              : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
          }`}
        >
          Webcam Mode
        </button>
        <label className={`px-6 py-3 rounded-lg font-medium transition-all duration-300 cursor-pointer ${
          mode === 'image' 
            ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg' 
            : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
        }`}>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            disabled={processing}
            className="hidden"
          />
          {processing ? 'Processing...' : 'Upload Image'}
        </label>
      </div>

      <div className="relative bg-gray-100 rounded-2xl overflow-hidden shadow-lg aspect-video max-w-3xl mx-auto">
        {mode === 'webcam' ? (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className={`w-full h-full object-cover ${processing ? 'opacity-50' : 'opacity-100'}`}
          />
        ) : (
          imagePreview && (
            <img
              src={imagePreview}
              alt="Upload preview"
              className={`w-full h-full object-cover ${processing ? 'opacity-50' : 'opacity-100'}`}
            />
          )
        )}
        
        {processing && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 backdrop-blur-sm">
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-white text-lg font-medium">Analyzing...</p>
          </div>
        )}
      </div>

      <div className="mt-8 bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-lg">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">Detected Emotion:</h2>
        <div className="flex items-center justify-center">
          <div className={`text-3xl font-bold py-4 px-8 rounded-full flex items-center gap-3 ${
            emotion === 'Happy' || emotion === 'Surprised' 
              ? 'bg-green-100 text-green-700' 
              : emotion === 'Angry' || emotion === 'Disgusted' || emotion === 'Fearful'
                ? 'bg-red-100 text-red-700'
                : emotion === 'Sad'
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-gray-100 text-gray-700'
          }`}>
            <span className="text-4xl">{getEmotionEmoji(emotion)}</span>
            <span>{emotion}</span>
          </div>
        </div>
        
        {emotion && emotionDescriptions[emotion.toLowerCase()] && (
          <p className="text-center text-gray-600 mt-4 max-w-xl mx-auto">
            {emotionDescriptions[emotion.toLowerCase()]}
          </p>
        )}
        
        <p className="text-center text-gray-500 mt-6 text-sm">
          {modelsLoaded 
            ? "The AI is analyzing your facial expressions in real-time to detect emotions."
            : "Loading AI models. This may take a moment..."}
        </p>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-8">
          <div className="flex flex-col items-center p-3 bg-gray-50 rounded-lg">
            <span className="text-2xl mb-1">😊</span>
            <span className="text-sm text-gray-700">Happy</span>
          </div>
          <div className="flex flex-col items-center p-3 bg-gray-50 rounded-lg">
            <span className="text-2xl mb-1">😢</span>
            <span className="text-sm text-gray-700">Sad</span>
          </div>
          <div className="flex flex-col items-center p-3 bg-gray-50 rounded-lg">
            <span className="text-2xl mb-1">😠</span>
            <span className="text-sm text-gray-700">Angry</span>
          </div>
          <div className="flex flex-col items-center p-3 bg-gray-50 rounded-lg">
            <span className="text-2xl mb-1">😨</span>
            <span className="text-sm text-gray-700">Fearful</span>
          </div>
          <div className="flex flex-col items-center p-3 bg-gray-50 rounded-lg">
            <span className="text-2xl mb-1">🤢</span>
            <span className="text-sm text-gray-700">Disgusted</span>
          </div>
          <div className="flex flex-col items-center p-3 bg-gray-50 rounded-lg">
            <span className="text-2xl mb-1">😲</span>
            <span className="text-sm text-gray-700">Surprised</span>
          </div>
          <div className="flex flex-col items-center p-3 bg-gray-50 rounded-lg">
            <span className="text-2xl mb-1">😐</span>
            <span className="text-sm text-gray-700">Neutral</span>
          </div>
          <div className="flex flex-col items-center p-3 bg-gray-50 rounded-lg">
            <span className="text-2xl mb-1">❓</span>
            <span className="text-sm text-gray-700">Not Detected</span>
          </div>
        </div>
      </div>
      
      {/* Removed MoodSuggestions component */}
    </div>
  );
};

export default FaceRecognition;
