/**
 * AI Routes
 * Handles AI-based emotion analysis and medication recommendations
 */

const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');
const auth = require('../middleware/auth');

// Analyze emotions from facial and voice data
router.post('/analyze', aiController.analyzeEmotions);

// Combined 15-second analysis for both face and voice
router.post('/analyze-combined', aiController.analyzeCombined15Seconds);

// Simplified analysis endpoint for debugging
router.post('/analyze-simple', aiController.analyzeSimple);

// Basic combined analysis endpoint (no MongoDB dependency)
router.post('/analyze-basic', (req, res) => {
  try {
    const { transcript, audioMetadata } = req.body;
    
    if (!transcript) {
      return res.status(400).json({ message: 'Transcript is required' });
    }
    
    // Simplified analysis based on transcript keywords
    let primaryEmotion = 'neutral';
    let intensity = 'moderate';
    
    // Very basic keyword analysis
    const lowerTranscript = transcript.toLowerCase();
    if (lowerTranscript.includes('anxious') || lowerTranscript.includes('worry') || lowerTranscript.includes('nervous')) {
      primaryEmotion = 'anxious';
      intensity = lowerTranscript.includes('really') || lowerTranscript.includes('very') ? 'high' : 'moderate';
    } else if (lowerTranscript.includes('sad') || lowerTranscript.includes('depressed') || lowerTranscript.includes('unhappy')) {
      primaryEmotion = 'depressed';
      intensity = lowerTranscript.includes('really') || lowerTranscript.includes('very') ? 'high' : 'moderate';
    } else if (lowerTranscript.includes('angry') || lowerTranscript.includes('mad') || lowerTranscript.includes('frustrated')) {
      primaryEmotion = 'aggressive';
      intensity = lowerTranscript.includes('really') || lowerTranscript.includes('very') ? 'high' : 'moderate';
    } else if (lowerTranscript.includes('happy') || lowerTranscript.includes('good') || lowerTranscript.includes('great')) {
      primaryEmotion = 'happy';
      intensity = lowerTranscript.includes('really') || lowerTranscript.includes('very') ? 'high' : 'moderate';
    }
    
    // Consider audio metadata if available
    if (audioMetadata && audioMetadata.tonality) {
      if (audioMetadata.tonality === 'anxious') primaryEmotion = 'anxious';
      else if (audioMetadata.tonality === 'sad') primaryEmotion = 'depressed';
      else if (audioMetadata.tonality === 'angry') primaryEmotion = 'aggressive';
      else if (audioMetadata.tonality === 'happy') primaryEmotion = 'happy';
    }
    
    // Generate basic medication recommendation
    let medicationRecommendation = {
      condition: primaryEmotion === 'anxious' ? 'Anxiety' : 
                primaryEmotion === 'depressed' ? 'Depression' : 
                primaryEmotion === 'aggressive' ? 'Aggression' : 'Mood Regulation',
      fullRecommendation: '',
      notes: ''
    };
    
    // Very basic medication recommendations
    if (primaryEmotion === 'anxious') {
      medicationRecommendation.fullRecommendation = intensity === 'high' ? 
        'Alprazolam 0.5mg twice daily' : 'Buspirone 10mg daily';
      medicationRecommendation.notes = 'For anxiety symptoms. Monitor for drowsiness.';
    } else if (primaryEmotion === 'depressed') {
      medicationRecommendation.fullRecommendation = intensity === 'high' ? 
        'Sertraline 50mg daily' : 'Fluoxetine 20mg daily';
      medicationRecommendation.notes = 'For depressive symptoms. May take 2-4 weeks for full effect.';
    } else if (primaryEmotion === 'aggressive') {
      medicationRecommendation.fullRecommendation = intensity === 'high' ? 
        'Risperidone 1mg twice daily' : 'Quetiapine 25mg daily';
      medicationRecommendation.notes = 'For aggression and irritability. Monitor for sedation.';
    } else {
      medicationRecommendation.fullRecommendation = 'No specific medication recommended at this time';
      medicationRecommendation.notes = 'Continue current treatment plan and monitor symptoms.';
    }
    
    // Return the analysis results
    res.json({
      success: true,
      voiceAnalysis: {
        aggressive: primaryEmotion === 'aggressive' ? 0.7 : 0.1,
        depressed: primaryEmotion === 'depressed' ? 0.7 : 0.1,
        anxious: primaryEmotion === 'anxious' ? 0.7 : 0.1,
        neutral: primaryEmotion === 'neutral' ? 0.7 : 0.1,
        happy: primaryEmotion === 'happy' ? 0.7 : 0.1
      },
      medicationRecommendations: medicationRecommendation,
      comprehensiveAnalysis: {
        primaryEmotionalState: primaryEmotion.charAt(0).toUpperCase() + primaryEmotion.slice(1),
        severityLevel: intensity.charAt(0).toUpperCase() + intensity.slice(1),
        keyIndicators: [
          `Patient expressed ${primaryEmotion} feelings in their speech`,
          `Speech pattern indicates ${intensity} intensity`
        ],
        treatmentPlan: {
          medication: medicationRecommendation.fullRecommendation,
          therapy: primaryEmotion === 'anxious' ? 'Cognitive Behavioral Therapy' : 
                  primaryEmotion === 'depressed' ? 'Behavioral Activation Therapy' : 
                  primaryEmotion === 'aggressive' ? 'Anger Management Therapy' : 'Supportive Therapy',
          lifestyle: [
            'Regular physical activity',
            'Adequate sleep hygiene',
            'Stress management techniques'
          ]
        },
        followUpRecommendations: 'Schedule a follow-up appointment in 2 weeks to assess medication effectiveness.',
        summary: `Patient is experiencing ${intensity} ${primaryEmotion} symptoms. Recommended treatment includes medication and therapy.`
      },
      message: 'Basic analysis completed successfully'
    });
  } catch (error) {
    console.error('Error in basic analysis endpoint:', error);
    res.status(500).json({ message: 'Server error during basic analysis' });
  }
});

// Get emotion trends for a patient
router.get('/trends/:patientId', auth, aiController.getEmotionTrends);

module.exports = router;
