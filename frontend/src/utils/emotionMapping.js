/**
 * Emotion Mapping Utility
 * Maps detected emotions to medication recommendations and advice
 */

// Emotion intensity thresholds
export const INTENSITY_THRESHOLDS = {
  LOW: 0.3,
  MEDIUM: 0.6,
  HIGH: 0.8,
};

// Emotion to color mapping (for UI visualization)
export const EMOTION_COLORS = {
  happy: '#4CAF50',
  sad: '#2196F3',
  angry: '#F44336',
  fearful: '#9C27B0',
  disgusted: '#795548',
  surprised: '#FF9800',
  neutral: '#607D8B',
  aggressive: '#D32F2F',
  depressed: '#1565C0',
  anxious: '#7B1FA2',
};

// Detailed emotion descriptions
export const EMOTION_DESCRIPTIONS = {
  happy: "Showing signs of happiness with joy and contentment.",
  sad: "Displaying sadness or low mood.",
  angry: "Exhibiting anger or frustration.",
  fearful: "Showing signs of fear or anxiety.",
  disgusted: "Displaying disgust or aversion.",
  surprised: "Exhibiting surprise or astonishment.",
  neutral: "Showing a balanced emotional state.",
  aggressive: "Displaying aggressive behavior or hostility.",
  depressed: "Showing signs of depression or prolonged sadness.",
  anxious: "Exhibiting anxiety or nervousness.",
};

// Medication recommendations based on emotion and intensity
export const MEDICATION_RECOMMENDATIONS = {
  angry: {
    low: {
      medication: 'Mild relaxant',
      dosage: '5mg',
      advice: 'Take as needed for mild irritability. Practice deep breathing exercises.',
    },
    medium: {
      medication: 'Lorazepam',
      dosage: '0.5mg',
      advice: 'Take once when feeling moderately angry. Avoid alcohol.',
    },
    high: {
      medication: 'Olanzapine',
      dosage: '5-10mg',
      advice: 'Take once daily at night. Consult doctor if aggression increases.',
    },
  },
  sad: {
    low: {
      medication: 'St. John\'s Wort',
      dosage: '300mg',
      advice: 'Take once daily. Consider light therapy and regular exercise.',
    },
    medium: {
      medication: 'Sertraline',
      dosage: '25mg',
      advice: 'Take once daily in the morning. May take 2-4 weeks for full effect.',
    },
    high: {
      medication: 'Sertraline',
      dosage: '50-100mg',
      advice: 'Take once daily in the morning. Schedule follow-up with doctor in 2 weeks.',
    },
  },
  fearful: {
    low: {
      medication: 'L-theanine',
      dosage: '200mg',
      advice: 'Take as needed for mild anxiety. Practice mindfulness meditation.',
    },
    medium: {
      medication: 'Buspirone',
      dosage: '5mg',
      advice: 'Take twice daily. Avoid caffeine and alcohol.',
    },
    high: {
      medication: 'Alprazolam',
      dosage: '0.25-0.5mg',
      advice: 'Take as needed for acute anxiety. Do not drive after taking.',
    },
  },
  depressed: {
    low: {
      medication: 'Vitamin D',
      dosage: '2000 IU',
      advice: 'Take daily with food. Increase outdoor activities.',
    },
    medium: {
      medication: 'Escitalopram',
      dosage: '10mg',
      advice: 'Take once daily. May cause initial increase in anxiety.',
    },
    high: {
      medication: 'Venlafaxine',
      dosage: '75-150mg',
      advice: 'Take once daily with food. Do not stop medication abruptly.',
    },
  },
  aggressive: {
    low: {
      medication: 'Propranolol',
      dosage: '10mg',
      advice: 'Take as needed before stressful situations.',
    },
    medium: {
      medication: 'Risperidone',
      dosage: '0.5mg',
      advice: 'Take twice daily. Monitor for sedation.',
    },
    high: {
      medication: 'Risperidone',
      dosage: '1-2mg',
      advice: 'Take twice daily. Urgent psychiatric consultation recommended.',
    },
  },
};

// Get intensity level based on emotion value
export function getIntensityLevel(value) {
  if (value >= INTENSITY_THRESHOLDS.HIGH) return 'high';
  if (value >= INTENSITY_THRESHOLDS.MEDIUM) return 'medium';
  return 'low';
}

// Get medication recommendation based on emotion and intensity
export function getMedicationRecommendation(emotion, intensity) {
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
    advice: 'No medication recommended. Continue monitoring symptoms.',
  };
}

function mapToBaseEmotion(emotion) {
  if (!emotion) return 'neutral';

  const normalized = emotion.toLowerCase();

  const emotionMap = {
    angry: 'angry',
    sad: 'sad',
    fearful: 'fearful',
    fear: 'fearful',
    disgusted: 'disgusted',
    disgust: 'disgusted',
    happy: 'happy',
    surprised: 'surprised',
    aggressive: 'aggressive',
    depressed: 'depressed',
    anxious: 'fearful'
  };

  return emotionMap[normalized] ?? normalized;
}

