import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaMicrophone, FaMicrophoneSlash, FaVolumeUp, FaVolumeMute } from 'react-icons/fa';
import { startVoiceRecording, analyzeTextEmotion, analyzeVoiceTone, speakText } from '../utils/voiceProcessing';
import { getMedicationRecommendation } from '../utils/emotionMapping';

const VoiceBot = ({ onAnalysisComplete }) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [analysis, setAnalysis] = useState(null);
  const [error, setError] = useState(null);
  
  const recognitionRef = useRef(null);
  
  // Start/stop voice recording
  const toggleListening = () => {
    if (isListening) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
        recognitionRef.current = null;
      }
      setIsListening(false);
      
      // Analyze final transcript when stopping
      if (transcript) {
        analyzeVoiceInput(transcript);
      }
    } else {
      try {
        recognitionRef.current = startVoiceRecording(
          (interim) => setInterimTranscript(interim),
          (final) => {
            setTranscript(final);
            setInterimTranscript('');
          }
        );
        
        if (!recognitionRef.current.isSupported) {
          setError('Speech recognition is not supported in your browser');
          return;
        }
        
        setIsListening(true);
        setError(null);
      } catch (err) {
        console.error('Error starting voice recording:', err);
        setError('Failed to start voice recording');
      }
    }
  };
  
  // Toggle text-to-speech
  const toggleVoice = () => {
    setVoiceEnabled(!voiceEnabled);
  };
  
  // Analyze voice input for emotion and tone
  const analyzeVoiceInput = (text) => {
    if (!text) return;
    
    // Analyze text for emotional content
    const emotionAnalysis = analyzeTextEmotion(text);
    
    // Analyze voice tone (simplified version using text)
    const toneAnalysis = analyzeVoiceTone(text);
    
    // Get medication recommendation based on detected emotion
    const recommendation = getMedicationRecommendation(
      emotionAnalysis.primaryEmotion, 
      emotionAnalysis.confidence
    );
    
    // Combine analyses
    const fullAnalysis = {
      transcript: text,
      timestamp: new Date(),
      emotion: {
        primary: emotionAnalysis.primaryEmotion,
        confidence: emotionAnalysis.confidence,
        distribution: emotionAnalysis.emotions
      },
      voiceTone: {
        tone: toneAnalysis.tone,
        confidence: toneAnalysis.confidence,
        description: toneAnalysis.description
      },
      recommendation
    };
    
    setAnalysis(fullAnalysis);
    
    // Pass analysis to parent component
    if (onAnalysisComplete) {
      onAnalysisComplete(fullAnalysis);
    }
    
    // Provide voice feedback if enabled
    if (voiceEnabled) {
      provideVoiceFeedback(fullAnalysis);
    }
  };
  
  // Provide voice feedback based on analysis
  const provideVoiceFeedback = async (analysis) => {
    setIsSpeaking(true);
    
    const feedback = `I detected ${analysis.emotion.primary} in your voice with ${Math.round(analysis.emotion.confidence * 100)}% confidence. 
                     Your voice tone sounds ${analysis.voiceTone.tone}. 
                     ${analysis.recommendation.medication ? `Based on this, I would suggest ${analysis.recommendation.medication} at ${analysis.recommendation.dosage}.` : ''}
                     ${analysis.recommendation.advice}`;
    
    try {
      await speakText(feedback, { rate: 1, pitch: 1 });
    } catch (err) {
      console.error('Text-to-speech error:', err);
    } finally {
      setIsSpeaking(false);
    }
  };
  
  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);
  
  return (
    <div className="flex flex-col items-center w-full max-w-3xl mx-auto">
      <div className="w-full bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl shadow-lg p-6 mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Voice Analysis</h2>
        
        {/* Voice controls */}
        <div className="flex justify-center gap-4 mb-4">
          <button
            onClick={toggleListening}
            className={`microphone-button w-12 h-12 rounded-full flex items-center justify-center ${isListening ? 'bg-red-500 hover:bg-red-600 stop-recording-button' : 'bg-blue-500 hover:bg-blue-600'} text-white transition-colors shadow-md`}
            disabled={isSpeaking}
          >
            {isListening ? <FaMicrophoneSlash size={20} /> : <FaMicrophone size={20} />}
          </button>
          
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={toggleVoice}
            className="flex items-center justify-center p-4 rounded-full shadow-md bg-purple-500 hover:bg-purple-600 text-white transition-colors"
          >
            {voiceEnabled ? <FaVolumeUp size={24} /> : <FaVolumeMute size={24} />}
          </motion.button>
        </div>
        
        {/* Status indicator */}
        <div className="text-center mb-4">
          {isListening && (
            <div className="flex items-center justify-center gap-2">
              <span className="text-blue-600 font-medium">Listening</span>
              <div className="flex gap-1">
                {[...Array(3)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="w-2 h-2 bg-blue-600 rounded-full"
                    animate={{
                      scale: [1, 1.5, 1],
                      opacity: [1, 0.8, 1]
                    }}
                    transition={{
                      duration: 1,
                      repeat: Infinity,
                      delay: i * 0.2
                    }}
                  />
                ))}
              </div>
            </div>
          )}
          
          {isSpeaking && (
            <div className="flex items-center justify-center gap-2">
              <span className="text-purple-600 font-medium">Speaking</span>
              <div className="flex gap-1">
                {[...Array(3)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="w-2 h-2 bg-purple-600 rounded-full"
                    animate={{
                      scale: [1, 1.5, 1],
                      opacity: [1, 0.8, 1]
                    }}
                    transition={{
                      duration: 1,
                      repeat: Infinity,
                      delay: i * 0.2
                    }}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
        
        {/* Transcript display */}
        <div className="bg-white rounded-xl p-4 shadow-inner min-h-[100px] mb-4">
          <p className="transcript-text text-gray-800">
            {transcript}
            {interimTranscript && (
              <span className="text-gray-400 italic">{interimTranscript}</span>
            )}
          </p>
        </div>
        
        {/* Error message */}
        {error && (
          <div className="bg-red-100 text-red-800 p-3 rounded-lg mb-4">
            {error}
          </div>
        )}
        
        {/* Analysis results */}
        <AnimatePresence>
          {analysis && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="bg-gradient-to-r from-blue-100 to-purple-100 rounded-xl p-4 shadow-md"
            >
              <h3 className="font-semibold text-lg text-gray-800 mb-2">Analysis Results</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white/80 rounded-lg p-3">
                  <h4 className="font-medium text-gray-700">Emotion Analysis</h4>
                  <p className="capitalize text-blue-600 font-semibold">
                    {analysis.emotion.primary} 
                    <span className="text-gray-500 font-normal ml-2">
                      ({Math.round(analysis.emotion.confidence * 100)}%)
                    </span>
                  </p>
                </div>
                
                <div className="bg-white/80 rounded-lg p-3">
                  <h4 className="font-medium text-gray-700">Voice Tone</h4>
                  <p className="capitalize text-purple-600 font-semibold">
                    {analysis.voiceTone.tone}
                    <span className="text-gray-500 font-normal ml-2">
                      ({Math.round(analysis.voiceTone.confidence * 100)}%)
                    </span>
                  </p>
                </div>
              </div>
              
              {analysis.recommendation.medication && (
                <div className="mt-4 bg-white/80 rounded-lg p-3">
                  <h4 className="font-medium text-gray-700">Recommendation</h4>
                  <p className="text-gray-800">
                    <span className="font-semibold">{analysis.recommendation.medication}</span> 
                    <span className="text-gray-600 ml-2">{analysis.recommendation.dosage}</span>
                  </p>
                  <p className="text-gray-600 text-sm mt-1">{analysis.recommendation.advice}</p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
      <div className="text-center text-gray-500 text-sm">
        <p>Click the microphone button to start/stop voice recording</p>
        <p>Click the speaker button to toggle voice feedback</p>
      </div>
    </div>
  );
};

export default VoiceBot;
