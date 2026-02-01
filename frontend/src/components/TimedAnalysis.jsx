import React, { useState, useRef, useEffect } from 'react';
import { FaCamera, FaMicrophone, FaStopCircle, FaVolumeUp } from 'react-icons/fa';
import * as faceapi from 'face-api.js';
import { analyzeTextEmotion, analyzeVoiceTone, speakText } from '../utils/voiceProcessing';
import { getMedicationRecommendation } from '../utils/emotionMapping';
import { sessionService } from '../services/api';

const TimedAnalysis = ({ patientId, onAnalysisComplete }) => {
  const [activeAnalysis, setActiveAnalysis] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [countdown, setCountdown] = useState(20);
  const [error, setError] = useState(null);

  const [currentEmotion, setCurrentEmotion] = useState(null);
  const [emotionConfidence, setEmotionConfidence] = useState(0);
  const [emotionHistory, setEmotionHistory] = useState([]);

  const [transcript, setTranscript] = useState('');
  const [analysisResult, setAnalysisResult] = useState(null);
  const [modelsLoaded, setModelsLoaded] = useState(false);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const detectionIntervalRef = useRef(null);
  const countdownIntervalRef = useRef(null);
  const recognitionRef = useRef(null);

  /* ───────────────── FACE MODELS ───────────────── */
  useEffect(() => {
    const loadModels = async () => {
      const URL = 'https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model';
      await Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri(URL),
        faceapi.nets.faceLandmark68Net.loadFromUri(URL),
        faceapi.nets.faceExpressionNet.loadFromUri(URL),
      ]);
      setModelsLoaded(true);
    };
    loadModels();
    return stopAll;
  }, []);

  const stopAll = () => {
    streamRef.current?.getTracks().forEach(t => t.stop());
    recognitionRef.current?.stop();
    clearInterval(detectionIntervalRef.current);
    clearInterval(countdownIntervalRef.current);
    setIsAnalyzing(false);
    setActiveAnalysis(null);
  };

  /* ───────────────── FACIAL ANALYSIS ───────────────── */
  const startFacialAnalysis = async () => {
    setError(null);
    setEmotionHistory([]);
    setActiveAnalysis('facial');
    setIsAnalyzing(true);
    setCountdown(20);

    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    videoRef.current.srcObject = stream;
    streamRef.current = stream;
    await videoRef.current.play();

    detectionIntervalRef.current = setInterval(async () => {
      const detection = await faceapi
        .detectSingleFace(videoRef.current, new faceapi.TinyFaceDetectorOptions())
        .withFaceExpressions();

      if (!detection) return;

      const expressions = detection.expressions;
      
      // 🔥 DEBUG: Log raw face-api output
      console.log('EXPRESSIONS:', expressions);

      // 🔥 RULE: Ignore neutral dominance
      const nonNeutral = Object.entries(expressions)
        .filter(([e]) => e !== 'neutral')
        .sort((a, b) => b[1] - a[1]);

      if (!nonNeutral.length) {
        console.log('  → SKIP: No non-neutral emotions');
        return;
      }

      const [emotion, confidence] = nonNeutral[0];
      console.log(`  → Top emotion: ${emotion} (${confidence.toFixed(2)}), neutral: ${expressions.neutral.toFixed(2)}`);

      // 🔥 LOWER threshold (0.20 instead of 0.45)
      if (confidence < 0.20) {
        console.log(`  → FILTERED: confidence ${confidence.toFixed(2)} < 0.20 threshold`);
        return;
      }

      // 🔥 ALSO check neutral dominance: skip if neutral > 0.75
      if (expressions.neutral > 0.75) {
        console.log(`  → FILTERED: neutral ${expressions.neutral.toFixed(2)} > 0.75 (too neutral)`);
        return;
      }

      console.log(`  ✅ STORED: ${emotion} (${confidence.toFixed(2)})`);
      setCurrentEmotion(emotion);
      setEmotionConfidence(confidence);

      setEmotionHistory(prev =>
        [...prev, { emotion, confidence }].slice(-30)
      );
    }, 300);

    countdownIntervalRef.current = setInterval(() => {
      setCountdown(c => {
        if (c <= 1) endFacialAnalysis();
        return c - 1;
      });
    }, 1000);
  };

  const endFacialAnalysis = () => {
    clearInterval(detectionIntervalRef.current);
    clearInterval(countdownIntervalRef.current);

    let finalEmotion = 'neutral';
    let finalConfidence = 0.25;

    if (emotionHistory.length > 0) {
      // 🔥 Pick STRONGEST frame (highest confidence), not most frequent
      const strongest = emotionHistory.reduce((best, cur) =>
        cur.confidence > best.confidence ? cur : best
      );

      finalEmotion = strongest.emotion;
      finalConfidence = strongest.confidence;
    }

    const recommendation = getMedicationRecommendation(finalEmotion, finalConfidence);

    const result = {
      type: 'facial',
      dominantEmotion: finalEmotion,
      confidence: finalConfidence,
      recommendation
    };

    setAnalysisResult(result);
    setTimeout(() => onAnalysisComplete?.(result), 0);

    // 🔥 Try to save session, but don't block emotion detection if backend fails
    try {
      sessionService.createSession({
        patientId,
        emotion: finalEmotion,
        emotionIntensity: Math.round(finalConfidence * 100),
        medication: recommendation.medication,
        dosage: recommendation.dosage,
        advice: recommendation.advice,
        analysisType: 'facial'
      }).catch(err => {
        // Silently fail - session save is not critical
        console.warn('Session save skipped (backend unavailable)');
      });
    } catch (err) {
      // Silently fail - session save is not critical
      console.warn('Session save error:', err.message);
    }

    stopAll();
  };

  /* ───────────────── VOICE ANALYSIS ───────────────── */
  const startVoiceAnalysis = () => {
    setTranscript('');
    setActiveAnalysis('voice');
    setIsAnalyzing(true);
    setCountdown(20);

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    recognitionRef.current = new SpeechRecognition();
    recognitionRef.current.continuous = true;

    recognitionRef.current.onresult = e => {
      const text = e.results[e.results.length - 1][0].transcript;
      setTranscript(t => `${t} ${text}`.trim());
    };

    recognitionRef.current.start();

    countdownIntervalRef.current = setInterval(() => {
      setCountdown(c => {
        if (c <= 1) endVoiceAnalysis();
        return c - 1;
      });
    }, 1000);
  };

  const endVoiceAnalysis = () => {
    recognitionRef.current?.stop();
    clearInterval(countdownIntervalRef.current);

    const emotionData = analyzeTextEmotion(transcript);
    const tone = analyzeVoiceTone(transcript);
    const recommendation = getMedicationRecommendation(
      emotionData.primaryEmotion,
      emotionData.confidence
    );

    const result = {
      type: 'voice',
      emotion: emotionData.primaryEmotion,
      confidence: emotionData.confidence,
      voiceTone: tone.tone,
      transcript,
      recommendation
    };

    setAnalysisResult(result);
    setTimeout(() => onAnalysisComplete?.(result), 0);

    sessionService.createSession({
      patientId,
      emotion: result.emotion,
      emotionIntensity: Math.round(result.confidence * 100),
      voiceTone: result.voiceTone,
      transcript,
      medication: recommendation.medication,
      dosage: recommendation.dosage,
      advice: recommendation.advice,
      analysisType: 'voice'
    });

    speakText(`Detected ${result.emotion} emotion`);
    stopAll();
  };

  /* ───────────────── UI ───────────────── */
  return (
    <div className="bg-white p-6 rounded-xl shadow">
      {!isAnalyzing && !analysisResult && (
        <div className="grid grid-cols-2 gap-4">
          <button onClick={startFacialAnalysis}><FaCamera /> Facial</button>
          <button onClick={startVoiceAnalysis}><FaMicrophone /> Voice</button>
        </div>
      )}

      {isAnalyzing && (
        <>
          <p>{countdown}s</p>
          {activeAnalysis === 'facial' && <video ref={videoRef} muted />}
          <button onClick={stopAll}><FaStopCircle /></button>
        </>
      )}

      {analysisResult && (
        <div>
          <h3>Final Emotion: {analysisResult.dominantEmotion || analysisResult.emotion}</h3>
          <p>Confidence: {Math.round(analysisResult.confidence * 100)}%</p>
          <p>Medication: {analysisResult.recommendation.medication}</p>
        </div>
      )}
    </div>
  );
};

export default TimedAnalysis;
