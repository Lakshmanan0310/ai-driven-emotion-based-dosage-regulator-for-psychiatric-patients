/**
 * Emotion Analysis Routes
 * Handles emotion analysis and recommendations
 */

const express = require('express');
const router = express.Router();
const Session = require('../models/Session');
const Medication = require('../models/Medication');
const Patient = require('../models/Patient');

// Emotion intensity thresholds
const INTENSITY_THRESHOLDS = {
  LOW: 0.3,
  MEDIUM: 0.6,
  HIGH: 0.8
};

// Medication recommendations based on emotion and intensity
const MEDICATION_RECOMMENDATIONS = {
  angry: {
    low: {
      medication: 'Mild relaxant',
      dosage: '5mg',
      advice: 'Take as needed for mild irritability. Practice deep breathing exercises.'
    },
    medium: {
      medication: 'Lorazepam',
      dosage: '0.5mg',
      advice: 'Take once when feeling moderately angry. Avoid alcohol.'
    },
    high: {
      medication: 'Olanzapine',
      dosage: '5-10mg',
      advice: 'Take once daily at night. Consult doctor if aggression increases.'
    }
  },
  sad: {
    low: {
      medication: 'St. John\'s Wort',
      dosage: '300mg',
      advice: 'Take once daily. Consider light therapy and regular exercise.'
    },
    medium: {
      medication: 'Sertraline',
      dosage: '25mg',
      advice: 'Take once daily in the morning. May take 2-4 weeks for full effect.'
    },
    high: {
      medication: 'Sertraline',
      dosage: '50-100mg',
      advice: 'Take once daily in the morning. Schedule follow-up with doctor in 2 weeks.'
    }
  },
  fearful: {
    low: {
      medication: 'L-theanine',
      dosage: '200mg',
      advice: 'Take as needed for mild anxiety. Practice mindfulness meditation.'
    },
    medium: {
      medication: 'Buspirone',
      dosage: '5mg',
      advice: 'Take twice daily. Avoid caffeine and alcohol.'
    },
    high: {
      medication: 'Alprazolam',
      dosage: '0.25-0.5mg',
      advice: 'Take as needed for acute anxiety. Do not drive after taking.'
    }
  },
  depressed: {
    low: {
      medication: 'Vitamin D',
      dosage: '2000 IU',
      advice: 'Take daily with food. Increase outdoor activities.'
    },
    medium: {
      medication: 'Escitalopram',
      dosage: '10mg',
      advice: 'Take once daily. May cause initial increase in anxiety.'
    },
    high: {
      medication: 'Venlafaxine',
      dosage: '75-150mg',
      advice: 'Take once daily with food. Do not stop medication abruptly.'
    }
  },
  aggressive: {
    low: {
      medication: 'Propranolol',
      dosage: '10mg',
      advice: 'Take as needed before stressful situations.'
    },
    medium: {
      medication: 'Risperidone',
      dosage: '0.5mg',
      advice: 'Take twice daily. Monitor for sedation.'
    },
    high: {
      medication: 'Risperidone',
      dosage: '1-2mg',
      advice: 'Take twice daily. Urgent psychiatric consultation recommended.'
    }
  }
};

// Map detected emotions to base emotion categories
function mapToBaseEmotion(emotion) {
  const emotionMap = {
    // Direct mappings
    angry: 'angry',
    sad: 'sad',
    fearful: 'fearful',
    depressed: 'depressed',
    aggressive: 'aggressive',
    
    // Similar emotion mappings
    fury: 'angry',
    rage: 'angry',
    irritated: 'angry',
    annoyed: 'angry',
    
    unhappy: 'sad',
    gloomy: 'sad',
    melancholy: 'sad',
    
    scared: 'fearful',
    afraid: 'fearful',
    anxious: 'fearful',
    nervous: 'fearful',
    worried: 'fearful',
    
    violent: 'aggressive',
    hostile: 'aggressive',
    threatening: 'aggressive',
    
    hopeless: 'depressed',
    despondent: 'depressed',
    miserable: 'depressed'
  };
  
  return emotionMap[emotion.toLowerCase()] || 'neutral';
}

// Get intensity level based on emotion value
function getIntensityLevel(value) {
  if (value >= INTENSITY_THRESHOLDS.HIGH) return 'high';
  if (value >= INTENSITY_THRESHOLDS.MEDIUM) return 'medium';
  return 'low';
}

// Get medication recommendation based on emotion and intensity
function getMedicationRecommendation(emotion, intensity) {
  // Map similar emotions to our defined categories
  const mappedEmotion = mapToBaseEmotion(emotion);
  
  // Get intensity level
  const intensityLevel = typeof intensity === 'string' 
    ? intensity 
    : getIntensityLevel(intensity);
  
  // Return recommendation if available
  return MEDICATION_RECOMMENDATIONS[mappedEmotion]?.[intensityLevel] || {
    medication: 'No specific medication',
    dosage: 'N/A',
    advice: 'No medication recommended. Continue monitoring symptoms.'
  };
}

// Analyze emotion and provide recommendation
router.post('/', async (req, res) => {
  try {
    const { 
      patientId, 
      emotion, 
      intensity, 
      voiceTone, 
      transcription,
      facialAnalysis,
      voiceAnalysis,
      overrideMedication,
      overrideDosage,
      notes,
      doctorOverride,
      doctorId
    } = req.body;
    
    // Validate required fields
    if (!patientId || !emotion) {
      return res.status(400).json({ message: 'Please provide patient ID and emotion data' });
    }
    
    // Check if patient exists
    const patient = await Patient.findOne({ patientId });
    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }
    
    // Get recommendation
    let recommendation;
    let reason = '';
    
    if (doctorOverride && overrideMedication && overrideDosage) {
      // Use doctor override
      recommendation = {
        medication: overrideMedication,
        dosage: overrideDosage,
        advice: notes || 'Follow doctor\'s instructions.'
      };
      reason = 'Doctor override';
    } else {
      // Use AI recommendation
      recommendation = getMedicationRecommendation(emotion, intensity);
      reason = `Based on ${emotion} emotion with ${typeof intensity === 'string' ? intensity : Math.round(intensity * 100) + '%'} intensity`;
    }
    
    // Create session record
    const session = new Session({
      patientId,
      emotion: mapToBaseEmotion(emotion) || emotion,
      emotionIntensity: typeof intensity === 'number' ? intensity * 100 : parseFloat(intensity) || 50,
      voiceTone: voiceTone || 'neutral',
      transcript: transcription || '',
      facialAnalysis,
      voiceAnalysis,
      recommendation: `${recommendation.medication} ${recommendation.dosage}`,
      medicationRecommended: {
        medication: recommendation.medication,
        dosage: recommendation.dosage,
        notes: recommendation.advice
      },
      doctorOverride: doctorOverride ? {
        overridden: true,
        doctorId,
        notes,
        timestamp: Date.now()
      } : undefined
    });
    
    await session.save();
    
    // Update patient's last check-in
    await Patient.findOneAndUpdate(
      { patientId },
      { $set: { lastCheckIn: Date.now() } }
    );
    
    // Create medication record
    const medication = new Medication({
      patientId,
      medication: recommendation.medication,
      dosage: recommendation.dosage,
      reason,
      basedOnEmotion: {
        emotion: mapToBaseEmotion(emotion) || emotion,
        intensity: typeof intensity === 'number' ? intensity * 100 : parseFloat(intensity) || 50,
        voiceTone: voiceTone || 'neutral'
      },
      sessionId: session._id,
      prescribedBy: doctorOverride ? 'doctor' : 'AI',
      doctorId: doctorOverride ? doctorId : undefined,
      notes: recommendation.advice || notes
    });
    
    await medication.save();
    
    // Send response
    res.json({
      session: session._id,
      recommendation,
      timestamp: session.timestamp
    });
  } catch (error) {
    console.error('Emotion analysis error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get emotion history for a patient
router.get('/history/:patientId', async (req, res) => {
  try {
    const sessions = await Session.find({ patientId: req.params.patientId })
      .sort({ timestamp: -1 })
      .limit(30);
    
    res.json(sessions);
  } catch (error) {
    console.error('Error fetching emotion history:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get emotion statistics for a patient
router.get('/statistics/:patientId', async (req, res) => {
  try {
    const sessions = await Session.find({ patientId: req.params.patientId });
    
    // Calculate emotion distribution
    const emotionCounts = {};
    sessions.forEach(session => {
      emotionCounts[session.emotion] = (emotionCounts[session.emotion] || 0) + 1;
    });
    
    // Calculate average intensity
    const intensitySum = sessions.reduce((sum, session) => sum + session.emotionIntensity, 0);
    const averageIntensity = sessions.length > 0 ? intensitySum / sessions.length : 0;
    
    // Calculate trend (last 7 days vs previous 7 days)
    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
    
    const lastWeekSessions = sessions.filter(s => new Date(s.timestamp) >= oneWeekAgo);
    const previousWeekSessions = sessions.filter(s => 
      new Date(s.timestamp) >= twoWeeksAgo && new Date(s.timestamp) < oneWeekAgo
    );
    
    const lastWeekIntensity = lastWeekSessions.reduce((sum, s) => sum + s.emotionIntensity, 0) / 
      (lastWeekSessions.length || 1);
    const previousWeekIntensity = previousWeekSessions.reduce((sum, s) => sum + s.emotionIntensity, 0) / 
      (previousWeekSessions.length || 1);
    
    const intensityTrend = lastWeekIntensity - previousWeekIntensity;
    
    // Send statistics
    res.json({
      totalSessions: sessions.length,
      emotionDistribution: emotionCounts,
      averageIntensity,
      intensityTrend,
      lastCheckIn: sessions.length > 0 ? sessions[0].timestamp : null
    });
  } catch (error) {
    console.error('Error fetching emotion statistics:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
