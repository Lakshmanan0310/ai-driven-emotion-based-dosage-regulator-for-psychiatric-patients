import React, { useState, useRef, useEffect } from 'react';
import { FaPlay, FaStopCircle, FaVolumeUp } from 'react-icons/fa';
import * as faceapi from 'face-api.js';
import { analyzeTextEmotion, analyzeVoiceTone, speakText } from '../utils/voiceProcessing';
import { getMedicationRecommendation } from '../utils/emotionMapping';
import { sessionService } from '../services/api';
import EmotionHistoryDisplay from './EmotionHistoryDisplay';

const CombinedAnalysis = ({ patientId, onAnalysisComplete }) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [countdown, setCountdown] = useState(20);
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [error, setError] = useState(null);

  const [currentEmotion, setCurrentEmotion] = useState(null);
  const [emotionConfidence, setEmotionConfidence] = useState(0);
  const [emotionHistoryUI, setEmotionHistoryUI] = useState([]);

  const [transcript, setTranscript] = useState('');
  const [voiceEmotion, setVoiceEmotion] = useState(null);
  const [voiceTone, setVoiceTone] = useState(null);
  const [analysisResult, setAnalysisResult] = useState(null);

  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const recognitionRef = useRef(null);
  const detectionIntervalRef = useRef(null);
  const countdownIntervalRef = useRef(null);

  // 🔥 CRITICAL FIX
  const emotionHistoryRef = useRef([]);

  /* ───────── LOAD MODELS ───────── */
  useEffect(() => {
    const loadModels = async () => {
      const URL = 'https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model';
      await Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri(URL),
        faceapi.nets.faceLandmark68Net.loadFromUri(URL),
        faceapi.nets.faceExpressionNet.loadFromUri(URL)
      ]);
      setModelsLoaded(true);
    };
    loadModels();
    return stopAll;
  }, []);

  /* ───────── CLEANUP ───────── */
  const stopAll = () => {
    streamRef.current?.getTracks().forEach(t => t.stop());
    recognitionRef.current?.stop();
    clearInterval(detectionIntervalRef.current);
    clearInterval(countdownIntervalRef.current);
    setIsAnalyzing(false);
  };

  /* ───────── START ───────── */
  const startCombinedAnalysis = async () => {
    if (!modelsLoaded) return;

    setError(null);
    setIsAnalyzing(true);
    setCountdown(20);
    setTranscript('');
    setVoiceEmotion(null);
    setVoiceTone(null);
    setAnalysisResult(null);

    emotionHistoryRef.current = [];
    setEmotionHistoryUI([]);

    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    videoRef.current.srcObject = stream;
    streamRef.current = stream;
    await videoRef.current.play();

    startEmotionDetection();
    startVoiceRecognition();

    countdownIntervalRef.current = setInterval(() => {
      setCountdown(c => {
        if (c <= 1) endCombinedAnalysis();
        return c - 1;
      });
    }, 1000);
  };

  /* ───────── FACE DETECTION ───────── */
  const startEmotionDetection = () => {
    detectionIntervalRef.current = setInterval(async () => {
      const detection = await faceapi
        .detectSingleFace(videoRef.current, new faceapi.TinyFaceDetectorOptions())
        .withFaceExpressions();

      if (!detection) return;

      const expressions = detection.expressions;
      const nonNeutral = Object.entries(expressions)
        .filter(([e]) => e !== 'neutral')
        .sort((a, b) => b[1] - a[1]);

      if (!nonNeutral.length) return;

      const [emotion, confidence] = nonNeutral[0];
      if (confidence < 0.2 || expressions.neutral > 0.75) return;

      const frame = { emotion, confidence };

      // 🔥 STORE IN REF (SYNC)
      emotionHistoryRef.current.push(frame);

      // UI only
      setCurrentEmotion(emotion);
      setEmotionConfidence(confidence);
      setEmotionHistoryUI([...emotionHistoryRef.current].slice(-30));

    }, 300);
  };

  /* ───────── VOICE ───────── */
  const startVoiceRecognition = () => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return;

    const rec = new SR();
    rec.continuous = true;
    rec.interimResults = true;

    rec.onresult = e => {
      let text = '';
      for (let i = e.resultIndex; i < e.results.length; i++) {
        if (e.results[i].isFinal) text += e.results[i][0].transcript;
      }
      if (text) {
        setTranscript(text);
        const emo = analyzeTextEmotion(text);
        setVoiceEmotion(emo.primaryEmotion);
        setVoiceTone(analyzeVoiceTone(text).tone);
      }
    };

    rec.start();
    recognitionRef.current = rec;
  };

  /* ───────── FINAL FUSION ───────── */
  const endCombinedAnalysis = () => {
    clearInterval(detectionIntervalRef.current);
    clearInterval(countdownIntervalRef.current);

    const history = emotionHistoryRef.current;

    let finalEmotion = 'neutral';
    let finalConfidence = 0.3;

    if (history.length > 0) {
      const strongest = history.reduce((a, b) =>
        b.confidence > a.confidence ? b : a
      );
      finalEmotion = strongest.emotion;
      finalConfidence = strongest.confidence;
    }

    if (finalEmotion === 'neutral' && voiceEmotion && voiceEmotion !== 'neutral') {
      finalEmotion = voiceEmotion;
      finalConfidence = 0.5;
    }

    const recommendation = getMedicationRecommendation(finalEmotion, finalConfidence);

    const result = {
      combinedResult: { emotion: finalEmotion, confidence: finalConfidence },
      recommendation
    };

    setAnalysisResult(result);
    setTimeout(() => onAnalysisComplete?.(result), 0);

    // 🔥 Save emotion analysis to database for permanent storage
    try {
      const payload = {
        patientId,
        patientName: patientId, // Replace with actual patient name if available
        emotion: finalEmotion,
        emotionConfidence: finalConfidence,
        analysisType: 'combined',
        emotionHistory: history,
        recommendation: {
          medication: recommendation?.medication || 'No medication',
          dosage: recommendation?.dosage || 'N/A',
          advice: recommendation?.advice || 'Continue monitoring'
        }
      };

      fetch('/api/emotion-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
        .then(res => res.json())
        .then(data => {
          console.log('✅ Emotion analysis saved to database:', data);
        })
        .catch(err => {
          console.warn('⚠️ Could not save to database:', err.message);
        });
    } catch (err) {
      console.warn('Error saving emotion analysis:', err);
    }

    sessionService.createSession({
      patientId,
      emotion: finalEmotion,
      emotionIntensity: Math.round(finalConfidence * 100),
      analysisType: 'combined'
    }).catch(() => {});

    speakText(`Detected ${finalEmotion} emotion`);
    stopAll();
  };

  /* ───────── UI ───────── */
  return (
    <div className="p-6 bg-white rounded-xl shadow">
      {!isAnalyzing && !analysisResult && (
        <button onClick={startCombinedAnalysis}>
          <FaPlay /> Start Combined Analysis
        </button>
      )}

      {isAnalyzing && (
        <>
          <video ref={videoRef} muted />
          <p>{currentEmotion} ({Math.round(emotionConfidence * 100)}%)</p>
          <p>{countdown}s</p>
          <button onClick={endCombinedAnalysis}><FaStopCircle /></button>
        </>
      )}

      {analysisResult && (
        <div>
          <h3>Final Emotion: {analysisResult.combinedResult.emotion}</h3>
          <p>Confidence: {Math.round(analysisResult.combinedResult.confidence * 100)}%</p>
          <p>Medication: {analysisResult.recommendation.medication}</p>
          <button onClick={() => speakText(`Final emotion ${analysisResult.combinedResult.emotion}`)}>
            <FaVolumeUp /> Replay
          </button>

          {/* Show emotion history after analysis */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <EmotionHistoryDisplay patientId={patientId} />
          </div>
        </div>
      )}
    </div>
  );
};

export default CombinedAnalysis;
