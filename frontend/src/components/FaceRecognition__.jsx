import React, { useEffect, useRef, useState } from 'react';
import * as faceapi from 'face-api.js';

const FaceRecognition = () => {
  const videoRef = useRef(null);
  const [emotion, setEmotion] = useState('Loading models...');
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [mode, setMode] = useState('webcam'); // 'webcam' | 'image'
  const [imagePreview, setImagePreview] = useState(null);
  const [processing, setProcessing] = useState(false);

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
        
        interval = setInterval(async () => {
          if (videoRef.current && videoRef.current.readyState === 4) {
            console.log('Detecting face...');
            const detections = await faceapi
              .detectSingleFace(videoRef.current, new faceapi.TinyFaceDetectorOptions())
              .withFaceLandmarks()
              .withFaceExpressions();

            processDetections(detections);
          }
        }, 1000);
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
  }, [mode, modelsLoaded]);

  // Unified detection processing
  const processDetections = (detections) => {
    setProcessing(true);
    try {
      if (detections?.expressions) {
        console.log('Face detected with expressions:', detections.expressions);
        const expressions = detections.expressions;
        
        // Lower the threshold for sad, fear, and disgust emotions
        // These emotions are often more subtle and need a lower threshold
        const thresholds = {
          sad: 0.2,
          fear: 0.2,
          disgusted: 0.2,
          angry: 0.5,
          surprised: 0.5,
          happy: 0.5,
          neutral: 0.5
        };
        
        // Find the emotion with the highest value relative to its threshold
        let maxEmotion = 'neutral';
        let maxRatio = 0;
        
        Object.entries(expressions).forEach(([emotion, value]) => {
          const threshold = thresholds[emotion] || 0.5;
          const ratio = value / threshold;
          
          if (ratio > maxRatio) {
            maxRatio = ratio;
            maxEmotion = emotion;
          }
        });
        
        // Log the detected emotion with its value for debugging
        console.log(`Detected emotion: ${maxEmotion} with value ${expressions[maxEmotion]}`);
        
        setEmotion(`${maxEmotion.charAt(0).toUpperCase() + maxEmotion.slice(1)}`);
      } else {
        console.log('No face detected in frame');
        setEmotion('No face detected');
      }
    } catch (error) {
      console.error('Detection error:', error);
      setEmotion('Detection error');
    }
    setProcessing(false);
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

  return (
    <div className="face-recognition-container">
      <h1>Real-time Emotion Detection</h1>
      
      <div className="detection-mode-toggle">
        <button
          onClick={() => setMode('webcam')}
          disabled={mode === 'webcam'}
          className="mode-button"
        >
          Webcam Mode
        </button>
        <label className="upload-label mode-button">
          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            disabled={processing}
            style={{ display: 'none' }}
          />
          {processing ? 'Processing...' : 'Upload Image'}
        </label>
      </div>

      <div className="preview-container">
        {mode === 'webcam' ? (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            style={{ display: processing ? 'none' : 'block' }}
          />
        ) : (
          imagePreview && (
            <img
              src={imagePreview}
              alt="Upload preview"
              style={{ display: processing ? 'none' : 'block' }}
            />
          )
        )}
        
        {processing && (
          <div className="processing-overlay">
            <div className="spinner"></div>
            Analyzing...
          </div>
        )}
      </div>

      <div className="emotion-display">
        <h2>Detected Emotion:</h2>
        <p className="emotion-text">{emotion}</p>
      </div>

      <style jsx>{`
        .face-recognition-container {
          max-width: 800px;
          margin: 2rem auto;
          padding: 1rem;
          text-align: center;
          font-family: Arial, sans-serif;
        }

        .detection-mode-toggle {
          display: flex;
          gap: 1rem;
          justify-content: center;
          margin: 2rem 0;
        }

        .mode-button {
          padding: 10px 20px;
          background-color: #4CAF50;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 16px;
          transition: background-color 0.3s;
        }

        .mode-button:hover {
          background-color: #45a049;
        }

        .mode-button:disabled {
          background-color: #cccccc;
          cursor: not-allowed;
        }

        .preview-container {
          position: relative;
          margin: 2rem auto;
          width: 720px;
          height: 560px;
          background: #f0f0f0;
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 4px 8px rgba(0,0,0,0.1);
        }

        video, img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .processing-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          background: rgba(0, 0, 0, 0.7);
          color: white;
          font-size: 1.2rem;
        }

        .spinner {
          border: 4px solid #f3f3f3;
          border-top: 4px solid #3498db;
          border-radius: 50%;
          width: 40px;
          height: 40px;
          animation: spin 1s linear infinite;
          margin-bottom: 1rem;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .emotion-display {
          margin-top: 2rem;
          padding: 1rem;
          background: #f8f9fa;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.05);
        }

        .emotion-text {
          font-size: 1.5rem;
          color: #2c3e50;
          margin: 0.5rem 0;
          font-weight: bold;
        }

        @media (max-width: 768px) {
          .preview-container {
            width: 100%;
            height: 400px;
          }
        }
      `}</style>
    </div>
  );
};

export default FaceRecognition;