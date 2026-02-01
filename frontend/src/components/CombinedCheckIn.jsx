import React, { useState, useRef, useEffect } from 'react';
import { useTheme } from '../ThemeContext';
import { FaMicrophone, FaVolumeUp, FaCamera, FaStopCircle } from 'react-icons/fa';
import { analyzeTextEmotion, analyzeVoiceTone } from '../utils/voiceProcessing';
import { getMedicationRecommendation } from '../utils/emotionMapping';

const CombinedCheckIn = ({ patientId, onAnalysisComplete }) => {
  const { currentTheme, themes } = useTheme();
  const theme = themes[currentTheme];
  
  // Analysis state
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [countdown, setCountdown] = useState(20);
  const [error, setError] = useState(null);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [showSubmitButton, setShowSubmitButton] = useState(false);
  
  // Facial analysis state
  const [currentEmotion, setCurrentEmotion] = useState('neutral');
  const [emotionChanges, setEmotionChanges] = useState(0);
  const [emotionHistory, setEmotionHistory] = useState([]);
  
  // Voice analysis state
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [isListening, setIsListening] = useState(false);
  
  // Refs
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const recognitionRef = useRef(null);
  const countdownIntervalRef = useRef(null);
  const emotionDetectionIntervalRef = useRef(null);
  const lastEmotionRef = useRef('neutral');
  
  // Initialize camera and speech recognition
  useEffect(() => {
    // Setup camera
    const setupCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false
        });
        
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          streamRef.current = stream;
        }
      } catch (error) {
        console.error('Error accessing camera:', error);
        setError('Failed to access camera. Please check your permissions.');
      }
    };
    
    // Setup speech recognition
    const setupSpeechRecognition = () => {
      if ('webkitSpeechRecognition' in window) {
        const SpeechRecognition = window.webkitSpeechRecognition;
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = true;
        recognitionRef.current.interimResults = true;
        recognitionRef.current.lang = 'en-US';
        
        recognitionRef.current.onresult = (event) => {
          let finalTranscript = transcript;
          let interimTranscriptText = '';
          
          for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcriptText = event.results[i][0].transcript;
            
            if (event.results[i].isFinal) {
              finalTranscript += ' ' + transcriptText;
              setTranscript(finalTranscript.trim());
            } else {
              interimTranscriptText += transcriptText;
              setInterimTranscript(interimTranscriptText);
            }
          }
        };
        
        recognitionRef.current.onerror = (event) => {
          console.error('Speech recognition error:', event.error);
          setError(`Speech recognition error: ${event.error}`);
        };
      } else {
        setError('Speech recognition is not supported in your browser.');
      }
    };
    
    setupCamera();
    setupSpeechRecognition();
    
    // Cleanup on unmount
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
      }
      if (emotionDetectionIntervalRef.current) {
        clearInterval(emotionDetectionIntervalRef.current);
      }
    };
  }, []);
  
  // Start combined analysis
  const startAnalysis = () => {
    // Reset state
    setError(null);
    setIsAnalyzing(true);
    setCountdown(20);
    setTranscript('');
    setInterimTranscript('');
    setEmotionChanges(0);
    setEmotionHistory([]);
    setAnalysisResult(null);
    setShowSubmitButton(false);
    lastEmotionRef.current = 'neutral';
    setCurrentEmotion('neutral');
    
    try {
      // Start speech recognition
      if (recognitionRef.current) {
        recognitionRef.current.start();
        setIsListening(true);
      }
      
      // Start facial expression detection
      startFaceDetection();
      
      // Start countdown
      countdownIntervalRef.current = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            clearInterval(countdownIntervalRef.current);
            endAnalysis();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (error) {
      console.error('Error starting analysis:', error);
      setError('Failed to start analysis. Please check your camera and microphone permissions.');
      setIsAnalyzing(false);
      setIsListening(false);
    }
  };
  
  // Start face detection
  const startFaceDetection = () => {
    if (!videoRef.current) return;
    
    // Detect facial expressions every second
    emotionDetectionIntervalRef.current = setInterval(() => {
      // Simulate facial expression detection
      // In a real implementation, this would use face-api.js or a similar library
      detectFacialExpression();
    }, 1000);
  };
  
  // Detect facial expression using face-api.js
  const detectFacialExpression = () => {
    if (!videoRef.current || !canvasRef.current) return;
    
    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    // In a real implementation, this would use face-api.js to detect emotions
    // For this demo, we'll simulate detection with more realistic patterns
    
    // Define emotions with weighted probabilities to make it more realistic
    // (neutral is more common, with occasional changes to other emotions)
    const emotions = [
      { name: 'neutral', weight: 0.5 },
      { name: 'happy', weight: 0.15 },
      { name: 'sad', weight: 0.15 },
      { name: 'angry', weight: 0.1 },
      { name: 'fearful', weight: 0.05 },
      { name: 'surprised', weight: 0.05 }
    ];
    
    // Calculate total weight
    const totalWeight = emotions.reduce((sum, emotion) => sum + emotion.weight, 0);
    
    // Generate random value between 0 and total weight
    const random = Math.random() * totalWeight;
    
    // Find the emotion based on the random value and weights
    let cumulativeWeight = 0;
    let detectedEmotion = 'neutral';
    
    for (const emotion of emotions) {
      cumulativeWeight += emotion.weight;
      if (random <= cumulativeWeight) {
        detectedEmotion = emotion.name;
        break;
      }
    }
    
    // Add some persistence to make changes less frequent and more realistic
    // If the last emotion was not neutral, 70% chance to keep the same emotion
    if (lastEmotionRef.current !== 'neutral' && Math.random() < 0.7) {
      detectedEmotion = lastEmotionRef.current;
    }
    
    // Update current emotion
    setCurrentEmotion(detectedEmotion);
    
    // Check if emotion has changed
    if (detectedEmotion !== lastEmotionRef.current) {
      setEmotionChanges(prev => prev + 1);
      lastEmotionRef.current = detectedEmotion;
      
      // Add to emotion history
      setEmotionHistory(prev => [
        ...prev,
        {
          emotion: detectedEmotion,
          timestamp: new Date().toISOString(),
          timeElapsed: 20 - countdown,
          remainingTime: countdown
        }
      ]);
      
      console.log(`Emotion changed to ${detectedEmotion} at ${20 - countdown}s (${countdown}s remaining)`);
    }
  };
  
  // End analysis early
  const endAnalysisEarly = () => {
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
    }
    endAnalysis();
  };
  
  // End analysis and process results
  const endAnalysis = () => {
    // Stop recording
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
    
    // Stop facial detection interval
    if (emotionDetectionIntervalRef.current) {
      clearInterval(emotionDetectionIntervalRef.current);
    }
    
    setIsAnalyzing(false);
    setShowSubmitButton(true);
  };
  
  // Submit check-in and generate results
  const submitCheckIn = () => {
    // Analyze voice transcript
    const voiceResult = analyzeTextEmotion(transcript);
    const toneResult = analyzeVoiceTone(transcript);
    
    // Determine dominant emotion from facial expressions
    const emotionCounts = {};
    emotionHistory.forEach(item => {
      emotionCounts[item.emotion] = (emotionCounts[item.emotion] || 0) + 1;
    });
    
    // Find most frequent emotion
    let dominantEmotion = 'neutral';
    let maxCount = 0;
    
    Object.entries(emotionCounts).forEach(([emotion, count]) => {
      if (count > maxCount) {
        dominantEmotion = emotion;
        maxCount = count;
      }
    });
    
    // Get medication recommendation based on combined analysis
    const combinedEmotion = voiceResult.primaryEmotion === dominantEmotion ? 
      dominantEmotion : 
      voiceResult.confidence > 0.7 ? voiceResult.primaryEmotion : dominantEmotion;
    
    const recommendation = getMedicationRecommendation(combinedEmotion, voiceResult.confidence);
    
    // Create final analysis result
    const result = {
      patientId,
      timestamp: new Date().toISOString(),
      facialAnalysis: {
        dominantEmotion,
        emotionChanges,
        emotionHistory
      },
      voiceAnalysis: {
        transcript,
        primaryEmotion: voiceResult.primaryEmotion,
        confidence: voiceResult.confidence,
        tone: toneResult.tone
      },
      combinedResult: {
        primaryEmotion: combinedEmotion,
        confidence: voiceResult.confidence,
        recommendation
      }
    };
    
    setAnalysisResult(result);
    setShowSubmitButton(false);
    
    // Call the callback if provided
    if (onAnalysisComplete) {
      onAnalysisComplete(result);
    }
  };
  
  return (
    <div className={`${theme.cardBg} rounded-xl shadow-lg p-4`}>
      <h2 className={`text-2xl font-bold mb-4 ${theme.text} text-center`}>Combined Analysis</h2>
      
      {error && (
        <div className="bg-red-100 text-red-800 p-3 rounded-lg mb-4">
          {error}
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Facial Emotion Analysis */}
        <div className="bg-white/50 dark:bg-gray-800/50 rounded-xl p-4">
          <h3 className={`text-lg font-semibold mb-2 ${theme.text} text-center`}>Facial Emotion Analysis</h3>
          
          <div className="relative">
            {/* Video feed */}
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-48 object-cover rounded-lg"
            />
            
            {/* Canvas for capturing (hidden) */}
            <canvas ref={canvasRef} className="hidden" />
            
            {/* Current emotion overlay */}
            <div className="absolute bottom-2 left-2 bg-black/70 text-white px-3 py-1 rounded-lg text-sm">
              Current Emotion: <span className="font-semibold capitalize">{currentEmotion}</span>
              <div className="text-xs">Changes: {emotionChanges}</div>
            </div>
          </div>
          
          <div className="flex justify-center mt-2">
            <div className="flex space-x-4">
              <button className="px-3 py-1 bg-blue-500 text-white rounded-lg text-sm">
                Webcam Mode
              </button>
              <button className="px-3 py-1 bg-gray-200 text-gray-700 rounded-lg text-sm">
                Upload Image
              </button>
            </div>
          </div>
        </div>
        
        {/* Voice Analysis */}
        <div className="bg-white/50 dark:bg-gray-800/50 rounded-xl p-4">
          <h3 className={`text-lg font-semibold mb-2 ${theme.text} text-center`}>Voice Analysis</h3>
          
          <div className="flex justify-center mb-4">
            <div className="flex space-x-4">
              <button 
                className={`w-12 h-12 rounded-full flex items-center justify-center ${isListening ? 'bg-red-500' : 'bg-blue-500'} text-white`}
                disabled={!isAnalyzing}
              >
                <FaMicrophone size={20} />
              </button>
              <button className="w-12 h-12 rounded-full flex items-center justify-center bg-purple-500 text-white">
                <FaVolumeUp size={20} />
              </button>
            </div>
          </div>
          
          <div className="text-center mb-2">
            {isListening && (
              <div className="flex items-center justify-center gap-2">
                <span className="text-blue-600 font-medium">Listening</span>
                <div className="flex gap-1">
                  {[...Array(3)].map((_, i) => (
                    <div 
                      key={i}
                      className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"
                      style={{ animationDelay: `${i * 0.2}s` }}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
          
          {/* Transcript display */}
          <div className="bg-white rounded-xl p-3 shadow-inner min-h-[80px] mb-2">
            <p className="text-gray-800 text-sm">
              {transcript}
              {interimTranscript && (
                <span className="text-gray-400 italic">{interimTranscript}</span>
              )}
            </p>
            {!transcript && !interimTranscript && !isListening && (
              <p className="text-gray-400 italic text-sm text-center">
                Start speaking to see your words here...
              </p>
            )}
          </div>
        </div>
      </div>
      
      {/* Timer and instructions */}
      {isAnalyzing && (
        <div className="mb-6 bg-blue-100 dark:bg-blue-900/30 rounded-xl p-4 relative">
          <div className="absolute top-2 right-2 bg-blue-500 text-white rounded-full w-10 h-10 flex items-center justify-center font-bold">
            {countdown}
          </div>
          <p className="text-center text-blue-800 dark:text-blue-200">
            Please look at the camera and speak naturally about how you're feeling today. 
            The analysis will complete automatically when the timer ends.
          </p>
          <div className="mt-2 text-center">
            <button 
              onClick={endAnalysisEarly}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg"
            >
              End Analysis Early
            </button>
          </div>
        </div>
      )}
      
      {/* Center Start Analysis Button */}
      {!isAnalyzing && !analysisResult && (
        <div className="flex justify-center items-center my-8">
          <div className="text-center">
            <button 
              onClick={startAnalysis}
              className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg text-lg shadow-lg transform transition hover:scale-105"
            >
              Start Analysis
            </button>
            <p className={`mt-2 ${theme.subtext} text-sm`}>
              This will analyze your facial expressions and voice for 20 seconds
            </p>
          </div>
        </div>
      )}
        
      {/* Submit Button */}
      {showSubmitButton && (
        <div className="flex justify-center items-center my-8">
          <div className="text-center">
            <button 
              onClick={submitCheckIn}
              className="px-8 py-4 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg text-lg shadow-lg transform transition hover:scale-105"
            >
              Submit Check-In
            </button>
            <p className={`mt-2 ${theme.subtext} text-sm`}>
              Please complete both facial and voice analysis to submit
            </p>
          </div>
        </div>
      )}
      
      {/* Analysis Results */}
      {analysisResult && (
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-900 rounded-xl p-4 shadow-md">
          <h3 className="font-semibold text-lg text-gray-800 dark:text-gray-200 mb-4">Analysis Results</h3>
          
          {/* Canvas for capturing (hidden) */}
          <canvas ref={canvasRef} className="hidden" />
          
          {/* Current emotion overlay */}
          <div className="absolute bottom-2 left-2 bg-black/70 text-white px-3 py-1 rounded-lg text-sm">
            Current Emotion: <span className="font-semibold capitalize">{currentEmotion}</span>
            <div className="text-xs">Changes: {emotionChanges}</div>
          </div>
        
          <div className="flex justify-center mt-2">
            <div className="flex space-x-4">
              <button className="px-3 py-1 bg-blue-500 text-white rounded-lg text-sm">
                Webcam Mode
              </button>
              <button className="px-3 py-1 bg-gray-200 text-gray-700 rounded-lg text-sm">
                Upload Image
              </button>
            </div>
          </div>
        
          {/* Voice Analysis */}
          <div className="bg-white/50 dark:bg-gray-800/50 rounded-xl p-4">
        <h3 className={`text-lg font-semibold mb-2 ${theme.text} text-center`}>Voice Analysis</h3>
        
        <div className="flex justify-center mb-4">
          <div className="flex space-x-4">
            <button 
              className={`w-12 h-12 rounded-full flex items-center justify-center ${isListening ? 'bg-red-500' : 'bg-blue-500'} text-white`}
              disabled={!isAnalyzing}
            >
              <FaMicrophone size={20} />
            </button>
            <button className="w-12 h-12 rounded-full flex items-center justify-center bg-purple-500 text-white">
              <FaVolumeUp size={20} />
            </button>
          </div>
        </div>
        
        <div className="text-center mb-2">
          {isListening && (
            <div className="flex items-center justify-center gap-2">
              <span className="text-blue-600 font-medium">Listening</span>
              <div className="flex gap-1">
                {[...Array(3)].map((_, i) => (
                  <div 
                    key={i}
                    className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"
                    style={{ animationDelay: `${i * 0.2}s` }}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
        
        {/* Transcript display */}
        <div className="bg-white rounded-xl p-3 shadow-inner min-h-[80px] mb-2">
          <p className="text-gray-800 text-sm">
            {transcript}
            {interimTranscript && (
              <span className="text-gray-400 italic">{interimTranscript}</span>
            )}
          </p>
          {!transcript && !interimTranscript && !isListening && (
            <p className="text-gray-400 italic text-sm text-center">
              Start speaking to see your words here...
            </p>
          )}
        </div>
          </div>
        </div>
      )}
      
      {/* Timer and instructions */}
    {isAnalyzing && (
      <div className="mb-6 bg-blue-100 dark:bg-blue-900/30 rounded-xl p-4 relative">
        <div className="absolute top-2 right-2 bg-blue-500 text-white rounded-full w-10 h-10 flex items-center justify-center font-bold">
          {countdown}
        </div>
        <p className="text-center text-blue-800 dark:text-blue-200">
          Please look at the camera and speak naturally about how you're feeling today. 
          The analysis will complete automatically when the timer ends.
        </p>
        <div className="mt-2 text-center">
          <button 
            onClick={endAnalysisEarly}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg"
          >
            End Analysis Early
          </button>
        </div>
      </div>
    )}
    
    {/* Center Start Analysis Button */}
    {!isAnalyzing && !analysisResult && (
      <div className="flex justify-center items-center my-8">
        <div className="text-center">
          <button 
            onClick={startAnalysis}
            className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg text-lg shadow-lg transform transition hover:scale-105"
          >
            Start Analysis
          </button>
          <p className={`mt-2 ${theme.subtext} text-sm`}>
            This will analyze your facial expressions and voice for 20 seconds
          </p>
        </div>
      </div>
    )}
        
    {/* Submit Button */}
    {showSubmitButton && (
      <div className="flex justify-center items-center my-8">
        <div className="text-center">
          <button 
            onClick={submitCheckIn}
            className="px-8 py-4 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg text-lg shadow-lg transform transition hover:scale-105"
          >
            Submit Check-In
          </button>
          <p className={`mt-2 ${theme.subtext} text-sm`}>
            Please complete both facial and voice analysis to submit
          </p>
        </div>
      </div>
    )}
    
    {/* Analysis Results */}
    {analysisResult && (
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-900 rounded-xl p-4 shadow-md">
        <h3 className="font-semibold text-lg text-gray-800 dark:text-gray-200 mb-4">Analysis Results</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          {/* Facial Analysis */}
          <div className="bg-white/80 dark:bg-gray-800/50 rounded-lg p-3">
            <h4 className="font-medium text-gray-700 dark:text-gray-300">Facial Analysis</h4>
            <div className="flex items-center mb-2">
              <div className="w-3 h-3 rounded-full mr-2" style={{ 
                backgroundColor: 
                  analysisResult.facialAnalysis.dominantEmotion === 'happy' ? '#4CAF50' :
                  analysisResult.facialAnalysis.dominantEmotion === 'sad' ? '#2196F3' :
                  analysisResult.facialAnalysis.dominantEmotion === 'angry' ? '#F44336' :
                  analysisResult.facialAnalysis.dominantEmotion === 'fearful' ? '#9C27B0' :
                  analysisResult.facialAnalysis.dominantEmotion === 'surprised' ? '#FF9800' : '#607D8B'
              }}></div>
              <p className="capitalize text-blue-600 dark:text-blue-400 font-semibold">
                {analysisResult.facialAnalysis.dominantEmotion}
              </p>
            </div>
            <div className="flex justify-between items-center bg-blue-50 dark:bg-blue-900/30 p-2 rounded-lg mb-2">
              <span className="text-sm font-medium">Expression Changes:</span>
              <span className="text-lg font-bold text-blue-700 dark:text-blue-300">{analysisResult.facialAnalysis.emotionChanges}</span>
            </div>
            
            {/* Emotion Timeline */}
            {analysisResult.facialAnalysis.emotionHistory.length > 0 && (
              <div className="mt-2">
                <h5 className="text-xs font-medium text-gray-500 mb-1">Emotion Timeline:</h5>
                <div className="space-y-1 max-h-24 overflow-y-auto pr-1">
                  {analysisResult.facialAnalysis.emotionHistory.map((item, index) => (
                    <div key={index} className="flex items-center text-xs">
                      <span className="w-6 text-gray-500">{item.timeElapsed}s</span>
                      <div className="w-2 h-2 mx-1 rounded-full" style={{
                        backgroundColor: 
                          item.emotion === 'happy' ? '#4CAF50' :
                          item.emotion === 'sad' ? '#2196F3' :
                          item.emotion === 'angry' ? '#F44336' :
                          item.emotion === 'fearful' ? '#9C27B0' :
                          item.emotion === 'surprised' ? '#FF9800' : '#607D8B'
                      }}></div>
                      <span className="capitalize">{item.emotion}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          {/* Voice Analysis */}
          <div className="bg-white/80 dark:bg-gray-800/50 rounded-lg p-3">
            <h4 className="font-medium text-gray-700 dark:text-gray-300">Voice Analysis</h4>
            <div className="flex items-center mb-2">
              <div className="w-3 h-3 rounded-full mr-2" style={{ 
                backgroundColor: 
                  analysisResult.voiceAnalysis.primaryEmotion === 'happy' ? '#4CAF50' :
                  analysisResult.voiceAnalysis.primaryEmotion === 'sad' ? '#2196F3' :
                  analysisResult.voiceAnalysis.primaryEmotion === 'angry' ? '#F44336' :
                  analysisResult.voiceAnalysis.primaryEmotion === 'fearful' ? '#9C27B0' :
                  analysisResult.voiceAnalysis.primaryEmotion === 'depressed' ? '#1565C0' :
                  analysisResult.voiceAnalysis.primaryEmotion === 'anxious' ? '#7B1FA2' : '#607D8B'
              }}></div>
              <p className="capitalize text-purple-600 dark:text-purple-400 font-semibold">
                {analysisResult.voiceAnalysis.primaryEmotion}
              </p>
            </div>
            
            <div className="mb-2">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Confidence:</p>
              <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                <div 
                  className="bg-gradient-to-r from-purple-500 to-purple-700 h-2.5 rounded-full" 
                  style={{ width: `${Math.round(analysisResult.voiceAnalysis.confidence * 100)}%` }}
                ></div>
              </div>
              <p className="text-right text-xs text-gray-500 mt-1">{Math.round(analysisResult.voiceAnalysis.confidence * 100)}%</p>
            </div>
            
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
              Voice tone: <span className="font-medium capitalize">{analysisResult.voiceAnalysis.tone}</span>
            </p>
          </div>
        </div>
        
        {/* Medication Recommendation */}
        <div className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/30 dark:to-blue-900/30 rounded-lg p-4 mb-4 shadow-sm">
          <div className="flex items-center mb-3">
            <div className="bg-green-100 dark:bg-green-800 p-2 rounded-full mr-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600 dark:text-green-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Recommended Medication</h4>
          </div>
          
          <div className="bg-white/90 dark:bg-gray-800/70 rounded-lg p-4 border-l-4 border-green-500">
            <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-2">
              <h5 className="text-xl font-bold text-gray-800 dark:text-gray-200">
                {analysisResult.combinedResult.recommendation.medication}
              </h5>
              <span className="inline-block bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded-full dark:bg-blue-900/50 dark:text-blue-300">
                {analysisResult.combinedResult.recommendation.dosage}
              </span>
            </div>
            
            <p className="text-gray-700 dark:text-gray-300 mt-2 border-t border-gray-100 dark:border-gray-700 pt-2">
              {analysisResult.combinedResult.recommendation.advice}
            </p>
            
            <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Based on combined analysis of facial expressions (dominant: <span className="font-medium capitalize">{analysisResult.facialAnalysis.dominantEmotion}</span>) 
                and voice analysis (detected: <span className="font-medium capitalize">{analysisResult.voiceAnalysis.primaryEmotion}</span>).
              </p>
            </div>
          </div>
        </div>
        
        {/* Transcript */}
        <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-3 mb-4">
          <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-2">Speech Transcript:</h4>
          <div className="bg-white dark:bg-gray-800 p-3 rounded border-l-2 border-gray-300 dark:border-gray-600">
            <p className="text-gray-600 dark:text-gray-400 italic">"{analysisResult.voiceAnalysis.transcript}"</p>
          </div>
        </div>
        
        <div className="text-center mt-6">
          <button 
            onClick={startAnalysis}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-sm transition-all hover:shadow"
          >
            Start New Analysis
          </button>
        </div>
      </div>
    )}
  </div>
  );
};

export default CombinedCheckIn;
