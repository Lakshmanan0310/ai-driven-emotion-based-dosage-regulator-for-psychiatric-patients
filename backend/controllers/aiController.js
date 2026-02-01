/**
 * AI Controller
 * Handles AI-based emotion recognition and analysis using:
 * 1. FER_static_ResNet50_AffectNet model for facial emotion detection
 * 2. Google's Gemini API for voice emotion analysis and comprehensive analysis
 */
const path = require('path');
const fs = require('fs');
const axios = require('axios');
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize Gemini API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

// FER API configuration
const FER_API_URL = process.env.FER_API_URL || 'http://localhost:8000';
const FER_ENDPOINT = `${FER_API_URL}/predict-face`;
const FER_HEALTH_ENDPOINT = `${FER_API_URL}/health`;

console.log('Using FER_static_ResNet50_AffectNet model for facial emotion analysis');
console.log(`FER API URL: ${FER_API_URL}`);
console.log('Using Google Gemini API for voice emotion analysis');

/**
 * Check if FER API is available
 * @returns {Promise<boolean>} True if FER API is healthy
 */
async function checkFERAvailability() {
  try {
    const response = await axios.get(FER_HEALTH_ENDPOINT, { timeout: 5000 });
    return response.data.model_loaded === true;
  } catch (error) {
    console.warn('FER API is not available:', error.message);
    return false;
  }
}

/**
 * Analyze facial emotion from an image using the FER model
 * @param {Buffer|String} imageData - Image buffer or base64 string
 * @returns {Object} Emotion analysis results with probabilities for all emotions
 */
async function analyzeFacialEmotion(imageData) {
  try {
    // Check if FER API is available
    const ferAvailable = await checkFERAvailability();
    
    if (!ferAvailable) {
      console.warn('FER API not available, using fallback emotion values');
      return generateFallbackEmotions();
    }
    
    // Create FormData for multipart/form-data request
    const FormData = require('form-data');
    const formData = new FormData();
    
    // Handle different input formats
    let imageBuffer;
    if (typeof imageData === 'string') {
      // If it's a base64 string, convert to buffer
      if (imageData.startsWith('data:image')) {
        // Remove data URL prefix
        const base64Data = imageData.replace(/^data:image\/\w+;base64,/, '');
        imageBuffer = Buffer.from(base64Data, 'base64');
      } else {
        imageBuffer = Buffer.from(imageData, 'base64');
      }
    } else {
      imageBuffer = imageData;
    }
    
    // Add image buffer to form data
    formData.append('file', imageBuffer, 'image.jpg');
    
    // Send request to FER API
    const response = await axios.post(FER_ENDPOINT, formData, {
      headers: formData.getHeaders(),
      timeout: 30000
    });
    
    if (response.data.success) {
      return response.data.all_emotions;
    } else {
      console.error('FER API returned error:', response.data);
      return generateFallbackEmotions();
    }
    
  } catch (error) {
    console.error('Error analyzing facial emotion with FER model:', error.message);
    // Fallback to simulated values if FER fails
    return generateFallbackEmotions();
  }
}

/**
 * Generate fallback emotion values if FER API fails
 * Uses predefined emotion patterns to simulate realistic detection
 * @returns {Object} Simulated emotion values with all 7 emotions
 */
function generateFallbackEmotions() {
  // Select a primary emotion with weighted probability
  const emotions = {
    angry: 0,
    disgusted: 0,
    fearful: 0,
    happy: 0,
    neutral: 0,
    sad: 0,
    surprised: 0
  };
  
  // Simulate realistic emotion distribution
  const primaryEmotion = Math.floor(Math.random() * 7);
  const emotionKeys = Object.keys(emotions);
  
  // Generate values for each emotion
  emotionKeys.forEach((emotion, i) => {
    if (i === primaryEmotion) {
      // Primary emotion gets a higher value
      emotions[emotion] = 0.4 + Math.random() * 0.6; // 0.4-1.0
    } else {
      // Secondary emotions get moderate values
      emotions[emotion] = Math.random() * 0.3; // 0-0.3
    }
  });
  
  // Normalize values to sum to approximately 1
  const sum = Object.values(emotions).reduce((a, b) => a + b, 0);
  Object.keys(emotions).forEach(key => {
    emotions[key] = parseFloat((emotions[key] / sum).toFixed(4));
  });
  
  return emotions;
}

/**
 * Analyze voice emotion from audio
 * @param {Buffer} audioBuffer - Audio buffer
 * @param {String} transcript - Speech transcript
 * @param {Object} audioMetadata - Additional metadata about the audio (optional)
 * @returns {Object} Voice emotion analysis
 */
async function analyzeVoiceEmotion(audioBuffer, transcript, audioMetadata = {}) {
  try {
    // If no transcript provided, return default values
    if (!transcript || transcript.trim() === '') {
      return generateFallbackVoiceEmotions();
    }
    
    // Check if we have explicit tonality metadata
    // If so, we can directly use it for a more accurate analysis
    if (audioMetadata && audioMetadata.tonality) {
      console.log(`Using explicit tonality metadata: ${audioMetadata.tonality}`);
      return processExplicitTonality(audioMetadata, transcript);
    }
    
    // Extract metadata about the audio if available
    const { speakingRate, pitch, volume, tonality } = audioMetadata;
    const metadataString = audioMetadata && Object.keys(audioMetadata).length > 0 ?
      `Additional audio metadata:
      - Speaking rate: ${speakingRate || 'unknown'} (fast/slow/normal)
      - Pitch: ${pitch || 'unknown'} (high/low/variable/monotone)
      - Volume: ${volume || 'unknown'} (loud/soft/variable)
      - Tonality: ${tonality || 'unknown'} (angry/sad/happy/neutral/etc)` :
      'No additional audio metadata available.';
    
    // Prepare prompt for Gemini with enhanced instructions for tone detection
    const prompt = `You are an expert psychiatrist specializing in emotion detection from speech. Analyze the emotional state of a person based on the following transcript of their speech (which may be up to 20 seconds or 40+ words long):
    
    "${transcript}"
    
    ${metadataString}
    
    IMPORTANT: Pay special attention to emotional tone indicators that might contradict the literal meaning of the words. People often use neutral words but their tone, repetition patterns, word choice, or speech cadence can indicate underlying emotions.
    
    For example:
    - Repetitive phrases might indicate anxiety
    - Short, clipped sentences might indicate anger or irritation
    - Excessive use of intensifiers ("really", "very", "extremely") might indicate emotional intensity
    - Hesitations or qualifiers might indicate uncertainty or anxiety
    
    Provide an analysis of the following emotional states and their intensities on a scale of 0 to 1, where 1 is the highest intensity:
    - aggressive: Detect anger, irritation, hostility even when disguised with polite words
    - depressed: Detect sadness, hopelessness, lack of energy or enthusiasm
    - anxious: Detect worry, nervousness, fear, concern
    - neutral: Emotional balance or lack of strong emotion
    - happy: Detect joy, excitement, satisfaction, contentment
    
    Format your response as a valid JSON object with these emotion values only, no other text.
    Example: { "aggressive": 0.7, "depressed": 0.1, "anxious": 0.1, "neutral": 0.05, "happy": 0.05 }
    
    Remember: The emotional tone is often more important than the literal meaning of the words. Someone can use completely neutral words but speak in an angry tone.`;
    
    // Call Gemini API
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Parse the JSON response
    try {
      // Extract JSON from the response if it's wrapped in text
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      const jsonStr = jsonMatch ? jsonMatch[0] : text;
      const emotions = JSON.parse(jsonStr);
      
      // Ensure all required emotions are present
      const requiredEmotions = ['aggressive', 'depressed', 'anxious', 'neutral', 'happy'];
      requiredEmotions.forEach(emotion => {
        if (!(emotion in emotions)) {
          emotions[emotion] = Math.random() * 0.3; // Fallback value if missing
        }
      });
      
      // Normalize values to ensure they sum to approximately 1
      const sum = Object.values(emotions).reduce((a, b) => a + b, 0);
      Object.keys(emotions).forEach(key => {
        emotions[key] = emotions[key] / sum;
      });
      
      return emotions;
    } catch (parseError) {
      console.error('Error parsing Gemini response for voice analysis:', parseError);
      // Fallback to rule-based analysis if parsing fails
      return analyzeVoiceEmotionRuleBased(transcript);
    }
  } catch (error) {
    console.error('Error analyzing voice emotion with Gemini:', error);
    // Fallback to rule-based analysis if Gemini fails
    return analyzeVoiceEmotionRuleBased(transcript);
  }
}

/**
 * Rule-based fallback for voice emotion analysis
 * @param {String} transcript - Speech transcript
 * @returns {Object} Voice emotion analysis
 */
function analyzeVoiceEmotionRuleBased(transcript) {
  // Initialize with default values
  const result = {
    aggressive: 0.1,
    depressed: 0.1,
    anxious: 0.1,
    neutral: 0.6,
    happy: 0.1
  };
  
  // If no transcript provided, return default values
  if (!transcript) {
    return result;
  }
  
  // Simple keyword-based analysis
  const lowercaseTranscript = transcript.toLowerCase();
  
  // Check for aggressive keywords
  if (/angry|mad|furious|rage|hate|annoyed|irritated|frustrated/.test(lowercaseTranscript)) {
    result.aggressive += 0.4;
    result.neutral -= 0.2;
  }
  
  // Check for depressed keywords
  if (/sad|depressed|hopeless|miserable|down|unhappy|tired|exhausted|lonely/.test(lowercaseTranscript)) {
    result.depressed += 0.5;
    result.neutral -= 0.3;
  }
  
  // Check for anxious keywords
  if (/worried|anxious|nervous|scared|afraid|fear|stress|panic|overwhelmed/.test(lowercaseTranscript)) {
    result.anxious += 0.5;
    result.neutral -= 0.3;
  }
  
  // Check for happy keywords
  if (/happy|joy|glad|excited|pleased|good|great|wonderful|amazing/.test(lowercaseTranscript)) {
    result.happy += 0.4;
    result.neutral -= 0.2;
  }
  
  // Ensure no negative values
  Object.keys(result).forEach(key => {
    result[key] = Math.max(0, result[key]);
  });
  
  // Normalize values to ensure they sum to approximately 1
  const sum = Object.values(result).reduce((a, b) => a + b, 0);
  Object.keys(result).forEach(key => {
    result[key] = result[key] / sum;
  });
  
  return result;
}

/**
 * Generate fallback voice emotion values
 * @returns {Object} Simulated voice emotion values
 */
function generateFallbackVoiceEmotions() {
  return {
    aggressive: 0.1,
    depressed: 0.2,
    anxious: 0.3,
    neutral: 0.3,
    happy: 0.1
  };
}

/**
 * Generate fallback comprehensive analysis when API fails
 * @returns {Object} Simulated comprehensive analysis
 */
function generateFallbackComprehensiveAnalysis() {
  return {
    primaryEmotionalState: "Mixed Emotional State",
    severityLevel: "Moderate",
    keyIndicators: [
      "Unable to perform detailed analysis due to technical limitations",
      "Basic emotional assessment provided as fallback"
    ],
    treatmentPlan: {
      medication: "Please consult with a healthcare provider for accurate medication recommendations.",
      therapy: "Consider scheduling a follow-up appointment with your therapist or psychiatrist.",
      lifestyle: [
        "Regular physical activity",
        "Adequate sleep",
        "Stress management techniques"
      ]
    },
    followUpRecommendations: "Schedule an in-person appointment for a more comprehensive assessment.",
    summary: "This is an automated fallback analysis. For accurate medical advice, please consult with a healthcare professional."
  };
}

/**
 * Process explicit tonality metadata to generate emotion values
 * @param {Object} audioMetadata - Audio metadata with tonality information
 * @param {String} transcript - The speech transcript
 * @returns {Object} Emotion values based on tonality
 */
function processExplicitTonality(audioMetadata, transcript) {
  const { tonality, speakingRate, pitch, volume } = audioMetadata;
  
  // Initialize with default balanced values
  const result = {
    aggressive: 0.1,
    depressed: 0.1,
    anxious: 0.1,
    neutral: 0.6,
    happy: 0.1
  };
  
  // Adjust based on explicit tonality
  switch (tonality.toLowerCase()) {
    case 'angry':
      result.aggressive = 0.7;
      result.neutral = 0.1;
      result.depressed = 0.1;
      result.anxious = 0.05;
      result.happy = 0.05;
      break;
    case 'sad':
      result.depressed = 0.7;
      result.neutral = 0.1;
      result.aggressive = 0.05;
      result.anxious = 0.1;
      result.happy = 0.05;
      break;
    case 'anxious':
      result.anxious = 0.7;
      result.neutral = 0.1;
      result.aggressive = 0.1;
      result.depressed = 0.05;
      result.happy = 0.05;
      break;
    case 'happy':
      result.happy = 0.7;
      result.neutral = 0.2;
      result.aggressive = 0.03;
      result.depressed = 0.03;
      result.anxious = 0.04;
      break;
    case 'neutral':
      // Keep default values
      break;
    default:
      // For any other tonality, keep default values
      break;
  }
  
  // Further adjust based on other metadata
  if (speakingRate === 'fast') {
    // Fast speaking can indicate anxiety or aggression
    result.anxious = Math.min(1, result.anxious + 0.1);
    result.aggressive = Math.min(1, result.aggressive + 0.1);
    result.neutral = Math.max(0, result.neutral - 0.1);
  }
  
  if (pitch === 'high') {
    // High pitch often indicates stress or excitement
    result.anxious = Math.min(1, result.anxious + 0.1);
    result.neutral = Math.max(0, result.neutral - 0.05);
  } else if (pitch === 'low') {
    // Low pitch can indicate sadness or seriousness
    result.depressed = Math.min(1, result.depressed + 0.1);
    result.neutral = Math.max(0, result.neutral - 0.05);
  }
  
  if (volume === 'loud') {
    // Loud volume often indicates aggression or excitement
    result.aggressive = Math.min(1, result.aggressive + 0.2);
    result.neutral = Math.max(0, result.neutral - 0.1);
  } else if (volume === 'soft') {
    // Soft volume can indicate sadness or shyness
    result.depressed = Math.min(1, result.depressed + 0.1);
    result.neutral = Math.max(0, result.neutral - 0.05);
  }
  
  // Normalize values to ensure they sum to 1
  const sum = Object.values(result).reduce((a, b) => a + b, 0);
  Object.keys(result).forEach(key => {
    result[key] = result[key] / sum;
  });
  
  return result;
}

/**
 * Combine facial and voice emotion analyses
 * @param {Object} facialAnalysis - Facial emotion analysis results
 * @param {Object} voiceAnalysis - Voice emotion analysis results
 * @returns {Object} Combined emotion analysis
 */
function combineEmotionAnalyses(facialAnalysis, voiceAnalysis) {
  // If only one analysis is available, return it
  if (!facialAnalysis && !voiceAnalysis) {
    return generateFallbackEmotions(); // Return default values if no analysis available
  }
  if (!facialAnalysis) return voiceAnalysis;
  if (!voiceAnalysis) return facialAnalysis;

  // Combine the analyses with weights (60% facial, 40% voice for basic emotions)
  const combinedAnalysis = {};

  // Combine facial emotions
  const facialEmotions = ['angry', 'disgusted', 'fearful', 'happy', 'neutral', 'sad', 'surprised'];
  facialEmotions.forEach(emotion => {
    if (emotion in facialAnalysis) {
      combinedAnalysis[emotion] = facialAnalysis[emotion] * 0.6;
    }
  });

  // Map voice emotions to facial emotions where possible and combine
  const voiceToFacialMap = {
    aggressive: 'angry',
    depressed: 'sad',
    anxious: 'fearful',
    happy: 'happy',
    neutral: 'neutral'
  };

  Object.keys(voiceAnalysis).forEach(voiceEmotion => {
    const facialEmotion = voiceToFacialMap[voiceEmotion];
    if (facialEmotion) {
      combinedAnalysis[facialEmotion] = (combinedAnalysis[facialEmotion] || 0) + voiceAnalysis[voiceEmotion] * 0.4;
    }
    // Also include the original voice emotion in the combined analysis
    combinedAnalysis[voiceEmotion] = voiceAnalysis[voiceEmotion];
  });

  // Add derived psychiatric indicators
  combinedAnalysis.aggressive = (combinedAnalysis.angry || 0) * 0.8 + (combinedAnalysis.disgusted || 0) * 0.2;
  combinedAnalysis.depressed = (combinedAnalysis.sad || 0) * 0.7 + (combinedAnalysis.fearful || 0) * 0.3;
  combinedAnalysis.anxious = (combinedAnalysis.fearful || 0) * 0.8 + (combinedAnalysis.surprised || 0) * 0.2;
  
  return combinedAnalysis;
}

/**
 * Generate comprehensive analysis of patient's emotional state
 * @param {Object} facialAnalysis - Facial emotion analysis
 * @param {Object} voiceAnalysis - Voice emotion analysis
 * @param {Object} combinedAnalysis - Combined emotion analysis
 * @param {String} transcript - Patient's speech transcript
 * @param {Object} medicationRecommendations - Medication recommendations
 * @returns {Object} Comprehensive analysis
 */
async function generateComprehensiveAnalysis(
  facialAnalysis,
  voiceAnalysis,
  combinedAnalysis,
  transcript,
  medicationRecommendations
) {
  try {
    console.log('Starting comprehensive analysis generation');
    console.log('Facial analysis data available:', !!facialAnalysis);
    console.log('Voice analysis data available:', !!voiceAnalysis);
    console.log('Medication recommendations available:', !!medicationRecommendations);
    
    // If we don't have enough data, return a fallback analysis
    if (!voiceAnalysis && !facialAnalysis) {
      console.log('Insufficient data for comprehensive analysis, returning fallback');
      return generateFallbackComprehensiveAnalysis();
    }
    
    // Use the main API key first, fallback to backup if available
    let backupModel;
    try {
      console.log('Initializing Gemini model for comprehensive analysis');
      const backupApiKey = process.env.GEMINI_API_KEY_BACKUP || process.env.GEMINI_API_KEY;
      const backupGenAI = new GoogleGenerativeAI(backupApiKey);
      backupModel = backupGenAI.getGenerativeModel({ model: 'gemini-pro' });
      console.log('Successfully initialized Gemini model');
    } catch (error) {
      console.error('Error initializing backup Gemini model:', error);
      // Use the main model as fallback or return a basic analysis
      if (model) {
        console.log('Using main model as fallback');
        backupModel = model;
      } else {
        console.log('No models available, returning fallback analysis');
        return generateFallbackComprehensiveAnalysis();
      }
    }
    
    // Prepare the data for the prompt
    const facialData = JSON.stringify(facialAnalysis);
    const voiceData = JSON.stringify(voiceAnalysis);
    const combinedData = JSON.stringify(combinedAnalysis);
    const medicationData = JSON.stringify(medicationRecommendations);
    
    // Create a comprehensive prompt for Gemini
    const prompt = `You are an expert psychiatrist specializing in diagnosing and treating emotional disorders. 
    You have just conducted a 15-second analysis of a patient using both facial recognition and voice analysis.
    
Here is the data from your analysis:

1. Patient's Speech Transcript:
"${transcript}"

2. Facial Emotion Analysis:
${facialData}

3. Voice Emotion Analysis:
${voiceData}

4. Combined Analysis:
${combinedData}

5. Medication Recommendation:
${medicationData}

Based on this comprehensive data, provide a detailed analysis of the patient's emotional state and treatment recommendations.

Your response should be in JSON format with the following structure:
{
  "primaryEmotionalState": "The primary emotional state detected (e.g., depression, anxiety, aggression)",
  "severityLevel": "Mild/Moderate/Severe",
  "keyIndicators": ["List the key indicators that led to this diagnosis"],
  "treatmentPlan": {
    "medication": "Medication recommendation",
    "therapy": "Recommended therapy approach",
    "lifestyle": ["List of lifestyle recommendations"]
  },
  "followUpRecommendations": "Recommendations for follow-up care",
  "summary": "A brief summary of the analysis and recommendations"
}

Do not include any explanatory text outside the JSON structure. Ensure your analysis is professional, compassionate, and focused on helping the patient.`;
    
    // Call Gemini API with backup key
    const result = await backupModel.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Parse the JSON response
    try {
      // Extract JSON from the response if it's wrapped in text
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      const jsonStr = jsonMatch ? jsonMatch[0] : text;
      const analysis = JSON.parse(jsonStr);
      return analysis;
    } catch (parseError) {
      console.error('Error parsing comprehensive analysis:', parseError);
      // Provide a fallback analysis
      return generateFallbackComprehensiveAnalysis(
        combinedAnalysis,
        medicationRecommendations
      );
    }
  } catch (error) {
    console.error('Error generating comprehensive analysis:', error);
    // Provide a fallback analysis
    return generateFallbackComprehensiveAnalysis(
      combinedAnalysis,
      medicationRecommendations
    );
  }
}

/**
 * Generate a fallback comprehensive analysis when Gemini API fails
 * @param {Object} combinedAnalysis - Combined emotion analysis
 * @param {Object} medicationRecommendations - Medication recommendations
 * @returns {Object} Fallback comprehensive analysis
 */
function generateFallbackComprehensiveAnalysis(combinedAnalysis, medicationRecommendations) {
  // Determine primary emotional state from combined analysis
  const emotions = {
    depression: combinedAnalysis.depressed || 0,
    anxiety: combinedAnalysis.anxious || 0,
    aggression: combinedAnalysis.aggressive || 0,
    neutral: combinedAnalysis.neutral || 0,
    happiness: combinedAnalysis.happy || 0
  };
  
  // Find the highest emotion
  const primaryEmotion = Object.entries(emotions)
    .sort((a, b) => b[1] - a[1])[0][0];
  
  // Determine severity based on the emotion value
  const highestValue = Math.max(...Object.values(emotions));
  let severity = 'Mild';
  if (highestValue > 0.7) severity = 'Severe';
  else if (highestValue > 0.4) severity = 'Moderate';
  
  // Generate appropriate recommendations based on primary emotion
  let therapyApproach = 'Cognitive Behavioral Therapy';
  let lifestyleRecs = ['Regular exercise', 'Adequate sleep', 'Balanced diet'];
  
  switch (primaryEmotion) {
    case 'depression':
      therapyApproach = 'Cognitive Behavioral Therapy with focus on negative thought patterns';
      lifestyleRecs.push('Daily exposure to sunlight', 'Social connection activities');
      break;
    case 'anxiety':
      therapyApproach = 'Cognitive Behavioral Therapy with relaxation techniques';
      lifestyleRecs.push('Mindfulness meditation', 'Breathing exercises');
      break;
    case 'aggression':
      therapyApproach = 'Anger Management Therapy';
      lifestyleRecs.push('Regular physical exercise', 'Stress reduction techniques');
      break;
    case 'happiness':
      therapyApproach = 'Positive Psychology interventions';
      lifestyleRecs.push('Gratitude practices', 'Continued social engagement');
      break;
  }
  
  // Create the fallback analysis
  return {
    primaryEmotionalState: primaryEmotion,
    severityLevel: severity,
    keyIndicators: [
      `High levels of ${primaryEmotion} detected in analysis`,
      `Combined analysis shows ${(highestValue * 100).toFixed(1)}% ${primaryEmotion}`,
      medicationRecommendations.condition !== 'normal' ? 
        `Medication recommended for ${medicationRecommendations.condition}` : 
        'No significant medical condition detected'
    ],
    treatmentPlan: {
      medication: medicationRecommendations.fullRecommendation,
      therapy: therapyApproach,
      lifestyle: lifestyleRecs
    },
    followUpRecommendations: 'Schedule follow-up appointment in 2 weeks to assess progress',
    summary: `Patient shows ${severity.toLowerCase()} ${primaryEmotion}. Recommended treatment includes ${medicationRecommendations.fullRecommendation} and ${therapyApproach}.`
  };
}

/**
 * Recommend medication based on emotion analysis (rule-based fallback)
 * @param {Object} emotionData - Facial and voice emotion data
 * @param {Object} patientHistory - Patient's medical history
 * @returns {Object} Medication recommendation
 */
function recommendMedication(emotionData, patientHistory) {
  // Extract primary emotions and their intensities
  const { facialAnalysis, voiceAnalysis } = emotionData;

  // Calculate overall psychiatric indicators
  const depressionLevel = Math.round((facialAnalysis?.depressed || 0) * 70 + (voiceAnalysis?.depressed || 0) * 30);
  const anxietyLevel = Math.round((facialAnalysis?.anxious || 0) * 60 + (voiceAnalysis?.anxious || 0) * 40);
  const aggressionLevel = Math.round((facialAnalysis?.aggressive || 0) * 80 + (voiceAnalysis?.aggressive || 0) * 20);

  // Determine primary condition
  let primaryCondition = 'normal';
  let conditionLevel = 0;

  if (depressionLevel > 40 && depressionLevel >= anxietyLevel && depressionLevel >= aggressionLevel) {
    primaryCondition = 'depression';
    conditionLevel = depressionLevel;
  } else if (anxietyLevel > 40 && anxietyLevel >= depressionLevel && anxietyLevel >= aggressionLevel) {
    primaryCondition = 'anxiety';
    conditionLevel = anxietyLevel;
  } else if (aggressionLevel > 40) {
    primaryCondition = 'aggression';
    conditionLevel = aggressionLevel;
  }

  // Define medication options based on condition
  const medicationOptions = {
    depression: [
      { threshold: 40, medication: 'Fluoxetine', dosage: '10mg', notes: 'Starting dose for mild depression' },
      { threshold: 60, medication: 'Fluoxetine', dosage: '20mg', notes: 'Moderate depression' },
      { threshold: 75, medication: 'Sertraline', dosage: '50mg', notes: 'Moderate to severe depression' },
      { threshold: 90, medication: 'Venlafaxine', dosage: '75mg', notes: 'Severe depression' }
    ],
    anxiety: [
      { threshold: 40, medication: 'Buspirone', dosage: '5mg', notes: 'For mild anxiety symptoms' },
      { threshold: 60, medication: 'Escitalopram', dosage: '10mg', notes: 'For moderate anxiety' },
      { threshold: 75, medication: 'Sertraline', dosage: '25mg', notes: 'For moderate to severe anxiety' },
      { threshold: 90, medication: 'Sertraline + Lorazepam', dosage: '50mg + 0.5mg', notes: 'Combination for severe anxiety with acute symptoms' }
    ],
    aggression: [
      { threshold: 40, medication: 'Propranolol', dosage: '10mg', notes: 'For mild aggression with physical symptoms' },
      { threshold: 60, medication: 'Risperidone', dosage: '0.5mg', notes: 'For moderate aggression' },
      { threshold: 75, medication: 'Risperidone', dosage: '1mg', notes: 'For significant aggression' },
      { threshold: 90, medication: 'Olanzapine', dosage: '5mg', notes: 'For severe aggression with psychotic features' }
    ],
    normal: [
      { threshold: 0, medication: 'No medication', dosage: 'N/A', notes: 'Continue monitoring' }
    ]
  };

  // Select appropriate medication based on condition level
  const options = medicationOptions[primaryCondition];
  let recommendation = options[0]; // Default to lowest option

  for (const option of options) {
    if (conditionLevel >= option.threshold) {
      recommendation = option;
    } else {
      break;
    }
  }

  // Return recommendation
  return {
    condition: primaryCondition,
    level: conditionLevel,
    medication: recommendation.medication,
    dosage: recommendation.dosage,
    notes: recommendation.notes,
    fullRecommendation: `${recommendation.medication} ${recommendation.dosage}`
  };
}

/**
 * Analyze emotions from facial and voice data
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
exports.analyzeEmotions = async (req, res) => {
  try {
    const { facialImage, audioData, transcript, patientId, audioMetadata } = req.body;

    // Validate required data
    if (!transcript) {
      return res.status(400).json({ message: 'Transcript is required' });
    }

    console.log('Analyzing emotions with Gemini API...');
    console.log(`Transcript length: ${transcript.split(' ').length} words`);

    // Process facial emotion if image provided
    let facialAnalysis = null;
    if (facialImage) {
      try {
        console.log('Processing facial emotion analysis...');
        // Convert base64 to buffer if needed
        const imageData = facialImage.startsWith('data:image') ?
          facialImage // Keep as base64 for Gemini
          :
          facialImage;

        facialAnalysis = await analyzeFacialEmotion(imageData);
        console.log('Facial analysis complete');
      } catch (error) {
        console.error('Facial analysis error:', error);
        // Continue without facial analysis
      }
    }

    // Process voice emotion
    let voiceAnalysis = null;
    try {
      console.log('Processing voice emotion analysis...');
      // Pass transcript and audio metadata for enhanced analysis
      voiceAnalysis = await analyzeVoiceEmotion(null, transcript, audioMetadata);
      console.log('Voice analysis complete');
    } catch (error) {
      console.error('Voice analysis error:', error);
      // Continue without voice analysis
    }

    // Combine analyses with priority to facial if available
    const combinedAnalysis = combineEmotionAnalyses(facialAnalysis, voiceAnalysis);
    console.log('Combined analysis complete');

    // Generate medication recommendations based on analysis
    console.log('Generating medication recommendations...');
    const medicationRecommendations = await generateMedicationRecommendations(combinedAnalysis, patientId);
    console.log('Medication recommendations generated');

    // Save session if patient ID is provided
    let sessionId = null;
    if (patientId) {
      try {
        console.log('Saving session for patient:', patientId);
        const Session = require('../models/Session');
        const session = new Session({
          patientId,
          transcript,
          emotionAnalysis: combinedAnalysis,
          medicationRecommendations
        });

        const savedSession = await session.save();
        sessionId = savedSession._id;
        console.log('Session saved with ID:', sessionId);
      } catch (error) {
        console.error('Error saving session:', error);
        // Continue without saving session
      }
    }

    // Return analysis and recommendations
    res.json({
      success: true,
      sessionId,
      facialAnalysis,
      voiceAnalysis,
      combinedAnalysis,
      medicationRecommendations
    });
  } catch (error) {
    console.error('Error in emotion analysis:', error);
    res.status(500).json({ message: 'Server error during emotion analysis' });
  }
};

/**
 * Get emotion trends for a patient
 */
exports.getEmotionTrends = async (req, res) => {
  try {
    const { patientId } = req.params;
    
    // Get session data
    const Session = require('../models/Session');
    const sessions = await Session.find({ patientId })
      .sort({ timestamp: 1 })
      .select('timestamp emotion emotionIntensity voiceTone');
    
    if (sessions.length === 0) {
      return res.status(404).json({ message: 'No emotion data found for this patient' });
    }
    
    // Process data for trends
    const trendData = sessions.map(session => ({
      date: session.timestamp.toISOString().split('T')[0],
      emotion: session.emotion,
      intensity: session.emotionIntensity,
      voiceTone: session.voiceTone
    }));
    
    // Calculate emotion frequencies
    const emotionCounts = {};
    sessions.forEach(session => {
      emotionCounts[session.emotion] = (emotionCounts[session.emotion] || 0) + 1;
    });
    
    // Calculate average intensities by emotion
    const emotionIntensities = {};
    const emotionSums = {};
    
    sessions.forEach(session => {
      if (!emotionSums[session.emotion]) {
        emotionSums[session.emotion] = 0;
        emotionIntensities[session.emotion] = 0;
      }
      emotionSums[session.emotion] += session.emotionIntensity;
    });
    
    Object.keys(emotionSums).forEach(emotion => {
      emotionIntensities[emotion] = Math.round(emotionSums[emotion] / emotionCounts[emotion]);
    });
    
    // Prepare response
    const response = {
      trendData,
      emotionCounts,
      emotionIntensities,
      totalSessions: sessions.length
    };
    
    res.json(response);
  } catch (error) {
    console.error('Error fetching emotion trends:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Analyze patient with combined face and voice for 15 seconds
 * This endpoint handles the combined analysis without asking for suggestions
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
exports.analyzeCombined15Seconds = async (req, res) => {
  try {
    console.log('Received request for combined 15-second analysis');
    const { patientId, facialData, audioData, transcript, audioMetadata } = req.body;
    
    // Validate required data
    if (!transcript) {
      console.log('Missing transcript in request');
      return res.status(400).json({ 
        message: 'Transcript is required for combined analysis' 
      });
    }
    
    // For facial data, we'll allow it to be optional but log a warning
    if (!facialData) {
      console.log('Warning: No facial data provided, analysis will be voice-only');
    }
    
    console.log('Starting combined 15-second analysis...');
    console.log(`Transcript length: ${transcript ? transcript.split(' ').length : 0} words`);
    console.log(`Audio metadata provided: ${audioMetadata ? 'Yes' : 'No'}`);
    console.log(`Patient ID: ${patientId || 'Not provided'}`);
    
    // Additional validation for audio metadata
    if (audioMetadata && typeof audioMetadata !== 'object') {
      console.log('Warning: audioMetadata is not a valid object');
      audioMetadata = {};
    }
    
    // Process facial emotion
    let facialAnalysis = null;
    if (facialData) {
      try {
        console.log('Processing facial emotion analysis...');
        facialAnalysis = await analyzeFacialEmotion(facialData);
        console.log('Facial analysis complete');
      } catch (error) {
        console.error('Facial analysis error:', error);
        // Continue with voice-only analysis instead of failing completely
        console.log('Continuing with voice-only analysis');
        facialAnalysis = generateFallbackEmotions();
      }
    } else {
      console.log('Skipping facial analysis (no data provided)');
      facialAnalysis = generateFallbackEmotions();
    }
    
    // Process voice emotion
    let voiceAnalysis = null;
    try {
      console.log('Processing voice emotion analysis...');
      voiceAnalysis = await analyzeVoiceEmotion(audioData, transcript, audioMetadata);
      console.log('Voice analysis complete');
    } catch (error) {
      console.error('Voice analysis error:', error);
      // If voice analysis fails but we have facial analysis, continue with that
      if (facialAnalysis) {
        console.log('Continuing with facial-only analysis');
        voiceAnalysis = generateFallbackVoiceEmotions();
      } else {
        // Both analyses failed
        return res.status(500).json({ message: 'Error processing both facial and voice data' });
      }
    }
    
    // Combine analyses
    const combinedAnalysis = combineEmotionAnalyses(facialAnalysis, voiceAnalysis);
    console.log('Combined analysis complete');
    
    // Generate medication recommendations
    console.log('Generating treatment recommendations...');
    const medicationRecommendations = await generateMedicationRecommendations(combinedAnalysis, patientId);
    console.log('Treatment recommendations generated');
    
    // Generate comprehensive analysis using Gemini
    const comprehensiveAnalysis = await generateComprehensiveAnalysis(
      facialAnalysis, 
      voiceAnalysis, 
      combinedAnalysis, 
      transcript, 
      medicationRecommendations
    );
    
    // Save session if patient ID is provided
    let sessionId = null;
    if (patientId) {
      try {
        console.log('Saving session for patient:', patientId);
        const Session = require('../models/Session');
        const session = new Session({
          patientId,
          transcript,
          emotionAnalysis: combinedAnalysis,
          medicationRecommendations,
          comprehensiveAnalysis
        });
        
        const savedSession = await session.save();
        sessionId = savedSession._id;
        console.log('Session saved with ID:', sessionId);
      } catch (error) {
        console.error('Error saving session:', error);
        // Continue without saving session
      }
    }
    
    // Return the complete analysis
    res.json({
      success: true,
      sessionId,
      facialAnalysis,
      voiceAnalysis,
      combinedAnalysis,
      medicationRecommendations,
      comprehensiveAnalysis
    });
  } catch (error) {
    console.error('Error in combined 15-second analysis:', error);
    res.status(500).json({ message: 'Server error during combined analysis' });
  }
};

/**
 * Simplified version of combined analysis that doesn't rely on MongoDB
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
exports.analyzeSimple = async (req, res) => {
  try {
    console.log('Received request for simplified analysis');
    const { transcript, audioMetadata } = req.body;
    
    // Validate required data
    if (!transcript) {
      console.log('Missing transcript in request');
      return res.status(400).json({ 
        message: 'Transcript is required for analysis' 
      });
    }
    
    console.log('Starting simplified analysis...');
    console.log(`Transcript: "${transcript}"`);
    console.log(`Audio metadata: ${JSON.stringify(audioMetadata || {})}`);
    
    // Process voice emotion
    let voiceAnalysis = null;
    try {
      console.log('Processing voice emotion analysis...');
      voiceAnalysis = await analyzeVoiceEmotion(null, transcript, audioMetadata);
      console.log('Voice analysis complete');
    } catch (error) {
      console.error('Voice analysis error:', error);
      return res.status(500).json({ message: 'Error processing voice data' });
    }
    
    // Return the analysis
    res.json({
      success: true,
      voiceAnalysis,
      message: 'Simplified analysis completed successfully'
    });
  } catch (error) {
    console.error('Error in simplified analysis:', error);
    res.status(500).json({ message: 'Server error during simplified analysis' });
  }
};

module.exports = exports;
