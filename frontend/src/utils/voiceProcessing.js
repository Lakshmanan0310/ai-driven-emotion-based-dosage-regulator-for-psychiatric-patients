/**
 * Voice Processing Utility
 * Handles voice recording, speech-to-text, and voice emotion analysis
 */

// Speech recognition setup
let recognition = null;
if ('webkitSpeechRecognition' in window) {
  recognition = new window.webkitSpeechRecognition();
  recognition.continuous = true;
  recognition.interimResults = true;
  recognition.lang = 'en-US';
} else if ('SpeechRecognition' in window) {
  recognition = new window.SpeechRecognition();
  recognition.continuous = true;
  recognition.interimResults = true;
  recognition.lang = 'en-US';
}

// Speech synthesis setup
const synthesis = window.speechSynthesis;

// Voice emotion indicators - words that suggest emotional states
const EMOTION_INDICATORS = {
  angry: [
    'angry', 'mad', 'furious', 'irritated', 'annoyed', 'frustrated', 
    'outraged', 'hate', 'despise', 'resent', 'hostile', 'rage'
  ],
  sad: [
    'sad', 'unhappy', 'miserable', 'depressed', 'down', 'blue', 'gloomy',
    'heartbroken', 'disappointed', 'upset', 'hurt', 'lonely', 'grief'
  ],
  fearful: [
    'afraid', 'scared', 'frightened', 'terrified', 'anxious', 'worried',
    'nervous', 'panic', 'terror', 'horror', 'dread', 'concern'
  ],
  aggressive: [
    'hate', 'kill', 'destroy', 'fight', 'attack', 'hurt', 'violent',
    'threaten', 'break', 'smash', 'hit', 'punch', 'yell', 'scream'
  ],
  depressed: [
    'hopeless', 'worthless', 'empty', 'numb', 'tired', 'exhausted',
    'alone', 'suicide', 'die', 'end', 'nothing', 'pointless', 'meaningless'
  ]
};

// Voice tone characteristics
const VOICE_TONE_CHARACTERISTICS = {
  aggressive: {
    description: 'Loud, harsh, rapid speech with strong emphasis',
    indicators: ['loud', 'shouting', 'yelling', 'harsh', 'rapid']
  },
  depressed: {
    description: 'Slow, quiet, monotone speech with long pauses',
    indicators: ['quiet', 'slow', 'monotone', 'pauses', 'hesitant']
  },
  anxious: {
    description: 'Rapid, shaky speech with frequent pauses and repetition',
    indicators: ['rapid', 'shaky', 'trembling', 'stuttering', 'repeating']
  },
  neutral: {
    description: 'Normal pace and volume with natural intonation',
    indicators: ['normal', 'balanced', 'clear', 'steady']
  }
};

/**
 * Start voice recording and speech recognition
 * @param {Function} onResult - Callback for interim results
 * @param {Function} onFinalResult - Callback for final results
 * @returns {Object} Control functions for the recognition
 */
function startVoiceRecording(onResult, onFinalResult) {
  if (!recognition) {
    console.error('Speech recognition not supported in this browser');
    return {
      stop: () => {},
      isSupported: false
    };
  }

  let finalTranscript = '';

  recognition.onresult = (event) => {
    let interimTranscript = '';
    
    for (let i = event.resultIndex; i < event.results.length; i++) {
      const transcript = event.results[i][0].transcript;
      
      if (event.results[i].isFinal) {
        finalTranscript += transcript + ' ';
        if (onFinalResult) {
          onFinalResult(finalTranscript.trim());
        }
      } else {
        interimTranscript += transcript;
        if (onResult) {
          onResult(interimTranscript);
        }
      }
    }
  };

  recognition.onerror = (event) => {
    console.error('Speech recognition error', event.error);
  };

  recognition.start();

  return {
    stop: () => {
      recognition.stop();
    },
    isSupported: true
  };
}

/**
 * Analyze text for emotional content
 * @param {string} text - Text to analyze
 * @returns {Object} Emotion analysis results
 */
function analyzeTextEmotion(text) {
  if (!text) return { primaryEmotion: 'neutral', confidence: 0, emotions: {} };
  
  const lowerText = text.toLowerCase();
  const words = lowerText.split(/\s+/);
  
  // Initialize emotion counts
  const emotionCounts = {
    angry: 0,
    sad: 0,
    fearful: 0,
    aggressive: 0,
    depressed: 0,
    neutral: 0
  };
  
  // Count emotion indicators
  words.forEach(word => {
    for (const [emotion, indicators] of Object.entries(EMOTION_INDICATORS)) {
      if (indicators.some(indicator => word.includes(indicator))) {
        emotionCounts[emotion]++;
      }
    }
  });
  
  // Calculate total emotion indicators
  const totalEmotionWords = Object.values(emotionCounts).reduce((sum, count) => sum + count, 0);
  
  if (totalEmotionWords === 0) {
  return {
    primaryEmotion: 'neutral',
    confidence: 0.3,
    emotions: { neutral: 0.3 }
  };
}

  // Calculate emotion percentages
  const emotions = {};
  for (const [emotion, count] of Object.entries(emotionCounts)) {
    emotions[emotion] = count / Math.max(words.length * 0.1, 1); // Normalize by text length
  }
  
  // Find primary emotion
  let primaryEmotion = 'neutral';
  let maxScore = 0;
  
  for (const [emotion, score] of Object.entries(emotions)) {
    if (score > maxScore && emotion !== 'neutral') {
      maxScore = score;
      primaryEmotion = emotion;
    }
  }
  
  // If no strong emotion, default to neutral
  if (maxScore < 0.1) {
    primaryEmotion = 'neutral';
    maxScore = 1;
  }
  
  return {
    primaryEmotion,
    confidence: Math.min(maxScore, 1), // Cap at 1
    emotions
  };
}

/**
 * Analyze voice characteristics based on text and audio features
 * @param {string} text - Transcribed text
 * @param {Object} audioFeatures - Audio analysis features (placeholder for future implementation)
 * @returns {Object} Voice tone analysis
 */
function analyzeVoiceTone(text, audioFeatures = null) {
  // This is a simplified version - in a real implementation, 
  // you would analyze actual audio features like volume, pitch, pace, etc.
  
  // For now, we'll infer tone from text content
  const textAnalysis = analyzeTextEmotion(text);
  
  // Map emotional content to voice tone
  let tonePrediction = 'neutral';
  
  if (textAnalysis.primaryEmotion === 'angry' || textAnalysis.primaryEmotion === 'aggressive') {
    tonePrediction = 'aggressive';
  } else if (textAnalysis.primaryEmotion === 'sad' || textAnalysis.primaryEmotion === 'depressed') {
    tonePrediction = 'depressed';
  } else if (textAnalysis.primaryEmotion === 'fearful') {
    tonePrediction = 'anxious';
  }
  
  return {
    tone: tonePrediction,
    confidence: textAnalysis.confidence,
    description: VOICE_TONE_CHARACTERISTICS[tonePrediction].description
  };
}

/**
 * Speak text using text-to-speech
 * @param {string} text - Text to speak
 * @param {Object} options - TTS options
 * @returns {Promise} Promise that resolves when speech is complete
 */
function speakText(text, options = {}) {
  return new Promise((resolve, reject) => {
    if (!synthesis) {
      console.error('Speech synthesis not supported');
      reject(new Error('Speech synthesis not supported'));
      return;
    }
    
    // Cancel any ongoing speech
    synthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    
    // Apply options
    if (options.voice) utterance.voice = options.voice;
    if (options.rate) utterance.rate = options.rate;
    if (options.pitch) utterance.pitch = options.pitch;
    if (options.volume) utterance.volume = options.volume;
    
    utterance.onend = () => resolve();
    utterance.onerror = (error) => reject(error);
    
    synthesis.speak(utterance);
  });
}

/**
 * Get available TTS voices
 * @returns {Array} Array of available voices
 */
function getAvailableVoices() {
  if (!synthesis) return [];
  return synthesis.getVoices();
}

// Export all functions as named exports
export {
  startVoiceRecording,
  analyzeTextEmotion,
  analyzeVoiceTone,
  speakText,
  getAvailableVoices
};
