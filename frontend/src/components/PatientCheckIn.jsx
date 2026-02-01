import React, { useState } from 'react';
import { FaSmile, FaSadTear, FaAngry, FaSurprise, FaMeh } from 'react-icons/fa';
import { getMedicationRecommendation } from '../utils/emotionMapping';
import EmotionHistoryDisplay from './EmotionHistoryDisplay';

const PatientCheckIn = ({ patientId }) => {
  const [selectedEmotion, setSelectedEmotion] = useState(null);
  const [intensity, setIntensity] = useState(50);
  const [notes, setNotes] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [recommendation, setRecommendation] = useState(null);
  
  // Emotion options
  const emotions = [
    { id: 'happy', icon: <FaSmile />, label: 'Happy', color: 'bg-green-100 text-green-600 border-green-300' },
    { id: 'sad', icon: <FaSadTear />, label: 'Sad', color: 'bg-blue-100 text-blue-600 border-blue-300' },
    { id: 'angry', icon: <FaAngry />, label: 'Angry', color: 'bg-red-100 text-red-600 border-red-300' },
    { id: 'fearful', icon: <FaSurprise />, label: 'Anxious', color: 'bg-purple-100 text-purple-600 border-purple-300' },
    { id: 'neutral', icon: <FaMeh />, label: 'Neutral', color: 'bg-gray-100 text-gray-600 border-gray-300' },
  ];
  
  // Handle emotion selection
  const handleEmotionSelect = (emotion) => {
    setSelectedEmotion(emotion);
  };
  
  // Handle check-in submission
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!selectedEmotion) return;
    
    // Get medication recommendation based on emotion and intensity
    const medicationRec = getMedicationRecommendation(selectedEmotion, intensity / 100);
    setRecommendation(medicationRec);
    
    // In a real app, we would send this data to the backend
    // sessionService.createSession({
    //   patientId,
    //   emotion: selectedEmotion,
    //   emotionIntensity: intensity,
    //   notes,
    //   timestamp: new Date(),
    //   medicationRecommended: medicationRec
    // });
    
    setSubmitted(true);
  };
  
  // Reset form
  const handleReset = () => {
    setSelectedEmotion(null);
    setIntensity(50);
    setNotes('');
    setSubmitted(false);
    setRecommendation(null);
  };
  
  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      {!submitted ? (
        <form onSubmit={handleSubmit}>
          <h3 className="text-lg font-medium mb-6">How are you feeling today?</h3>
          
          {/* Emotion selection */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
            {emotions.map((emotion) => (
              <button
                key={emotion.id}
                type="button"
                onClick={() => handleEmotionSelect(emotion.id)}
                className={`flex flex-col items-center justify-center p-4 rounded-lg border-2 transition-all ${
                  selectedEmotion === emotion.id 
                    ? `${emotion.color} border-current` 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <span className="text-3xl mb-2">{emotion.icon}</span>
                <span className="font-medium">{emotion.label}</span>
              </button>
            ))}
          </div>
          
          {/* Intensity slider */}
          {selectedEmotion && (
            <div className="mb-8 animate-fade-in">
              <label className="block text-gray-700 font-medium mb-2">
                How intense is this feeling? ({intensity}%)
              </label>
              <input
                type="range"
                min="1"
                max="100"
                value={intensity}
                onChange={(e) => setIntensity(parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>Mild</span>
                <span>Moderate</span>
                <span>Severe</span>
              </div>
            </div>
          )}
          
          {/* Notes */}
          {selectedEmotion && (
            <div className="mb-8 animate-fade-in">
              <label className="block text-gray-700 font-medium mb-2">
                Any additional notes about how you're feeling?
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows="3"
                placeholder="Optional: Share more about your mood, triggers, or concerns..."
              ></textarea>
            </div>
          )}
          
          {/* Submit button */}
          <div className="flex justify-center">
            <button
              type="submit"
              disabled={!selectedEmotion}
              className={`px-6 py-2 rounded-lg font-medium ${
                selectedEmotion 
                  ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                  : 'bg-gray-200 text-gray-500 cursor-not-allowed'
              }`}
            >
              Submit Check-In
            </button>
          </div>
        </form>
      ) : (
        <div>
          <div className="flex items-center justify-center mb-6">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center text-green-600 text-2xl">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
          
          <h3 className="text-xl font-medium text-center mb-6">Check-In Recorded</h3>
          
          <div className="bg-blue-50 rounded-lg p-4 mb-6">
            <p className="text-blue-800 font-medium">Thank you for checking in today!</p>
            <p className="text-blue-600 mt-2">Your emotional well-being is important to us. Based on your input, we've provided a personalized recommendation below.</p>
          </div>
          
          {recommendation && (
            <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6 shadow-sm">
              <h4 className="font-medium text-gray-800 mb-2">Recommended Medication</h4>
              <div className="flex justify-between items-center mb-2">
                <p className="text-lg font-semibold">{recommendation.medication}</p>
                <span className="bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded-full">
                  {recommendation.dosage}
                </span>
              </div>
              <p className="text-gray-600">{recommendation.advice}</p>
            </div>
          )}
          
          <div className="flex justify-center">
            <button
              onClick={handleReset}
              className="px-6 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium rounded-lg"
            >
              New Check-In
            </button>
          </div>
        </div>
      )}

      {/* Display emotion history from database */}
      <div className="mt-8 pt-8 border-t border-gray-200">
        <EmotionHistoryDisplay patientId={patientId} />
      </div>
    </div>
  );
};

export default PatientCheckIn;
