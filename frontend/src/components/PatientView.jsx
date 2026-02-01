import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaRobot } from 'react-icons/fa';
import { useTheme } from '../ThemeContext';
import MoodTracker from './MoodTracker';
import EmotionDetector from './EmotionDetector';
import Chatbot from './Chatbot';
import VoiceBot from './VoiceBot';
import RewardSystem from './RewardSystem';
import CombinedCheckIn from './CombinedCheckIn';
import PatientChatbot from './PatientChatbot';

const PatientView = ({ patientId }) => {
  const { currentTheme, themes } = useTheme();
  const theme = themes[currentTheme];
  const [patient, setPatient] = useState(null);
  const [emotionHistory, setEmotionHistory] = useState([]);
  const [activeTab, setActiveTab] = useState('mood');
  const [recentEmotion, setRecentEmotion] = useState(null);
  const [medicationRecommendation, setMedicationRecommendation] = useState(null);
  const [showPatientChatbot, setShowPatientChatbot] = useState(false);

  // Fetch patient data and emotion history from API
  useEffect(() => {
    const fetchPatientData = async () => {
      try {
        // Mock patient data
        const mockPatient = {
          patientId: patientId || 'lakshmanan',
          name: 'Lakshmanan',
          age: 31,
          gender: 'Male',
          diagnosis: 'Anxiety Disorder',
          currentMedication: 'Lorazepam 0.5mg',
          nextAppointment: '2025-05-25T10:00:00',
          doctor: 'Dr. Smith',
          points: 120
        };
        
        setPatient(mockPatient);

        // Fetch real emotion history from MongoDB
        const response = await fetch(`/api/emotion-analysis/${patientId || 'lakshmanan'}`);
        if (response.ok) {
          const data = await response.json();
          const emotions = Array.isArray(data) ? data : (data.data || []);
          
          // Transform MongoDB data to match UI format
          const formattedEmotions = emotions.map(analysis => ({
            _id: analysis._id,
            date: new Date(analysis.timestamp).toISOString().split('T')[0],
            emotion: analysis.emotion,
            intensity: analysis.emotionConfidence,
            timestamp: analysis.timestamp,
            medication: analysis.recommendation?.medication,
            dosage: analysis.recommendation?.dosage,
            advice: analysis.recommendation?.advice,
            analysisType: analysis.analysisType,
            transcript: analysis.transcript
          }));
          
          setEmotionHistory(formattedEmotions);
          
          // Set most recent emotion
          if (formattedEmotions.length > 0) {
            setRecentEmotion(formattedEmotions[formattedEmotions.length - 1]);
          }
          
          console.log('✅ Loaded emotion history from MongoDB:', formattedEmotions);
        } else {
          console.log('No emotion history found, using empty');
          setEmotionHistory([]);
        }
      } catch (error) {
        console.error('Error fetching emotion history:', error);
        setEmotionHistory([]);
      }
    };

    fetchPatientData();
    
    // Poll for new emotions every 5 seconds
    const interval = setInterval(fetchPatientData, 5000);
    return () => clearInterval(interval);
  }, [patientId]);

  // Handle emotion detection
  const handleEmotionDetected = (emotion) => {
    const newEmotion = {
      date: new Date().toISOString().split('T')[0],
      emotion: emotion.name,
      intensity: emotion.probability
    };
    
    setRecentEmotion(newEmotion);
    setEmotionHistory(prev => [...prev, newEmotion]);
    
    // This would normally send to an API
    console.log('New emotion detected:', newEmotion);
  };

  // Handle combined analysis completion
  const handleCombinedAnalysisComplete = (result) => {
    // Update emotion history with the dominant emotion from facial analysis
    const newEmotion = {
      date: new Date().toISOString().split('T')[0],
      emotion: result.facialAnalysis.dominantEmotion,
      intensity: result.combinedResult.confidence
    };
    
    setRecentEmotion(newEmotion);
    setEmotionHistory(prev => [...prev, newEmotion]);
    
    // Set medication recommendation
    setMedicationRecommendation(result.combinedResult.recommendation);
    
    console.log('Combined analysis complete:', result);
  };

  // Render tab content
  const renderTabContent = () => {
    switch (activeTab) {
      case 'mood':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <MoodTracker 
              emotionHistory={emotionHistory} 
              onMoodUpdate={(mood) => handleEmotionDetected({ name: mood, probability: 0.8 })} 
            />
            <EmotionDetector onEmotionDetected={handleEmotionDetected} />
          </div>
        );
      case 'chat':
        return <Chatbot patientId={patientId} recentEmotion={recentEmotion} />;
      case 'voice':
        return <VoiceBot patientId={patientId} recentEmotion={recentEmotion} />;
      case 'analysis':
        return <CombinedCheckIn patientId={patientId} onAnalysisComplete={handleCombinedAnalysisComplete} />;
      case 'rewards':
        return <RewardSystem points={patient?.points || 0} />;
      default:
        return <div>Select a tab</div>;
    }
  };

  if (!patient) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${theme.background}`}>
      {/* Header */}
      <header className={`${theme.cardBg} shadow-md backdrop-blur-sm`}>
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div className="flex items-center">
              <h1 className={`text-2xl font-bold ${theme.text}`}>Hello, {patient.name}</h1>
              <div className="ml-4 px-3 py-1 rounded-full bg-green-100 text-green-800 text-xs font-semibold">
                Active
              </div>
            </div>
            <div className={`mt-2 md:mt-0 ${theme.subtext}`}>
              Next appointment: {new Date(patient.nextAppointment).toLocaleString()}
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Patient info card */}
        <div className={`mb-8 ${theme.cardBg} rounded-xl shadow-lg backdrop-blur-sm p-6`}>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <h3 className={`text-sm ${theme.subtext}`}>Current Medication</h3>
              <p className={`font-medium ${theme.text}`}>{patient.currentMedication}</p>
            </div>
            <div>
              <h3 className={`text-sm ${theme.subtext}`}>Diagnosis</h3>
              <p className={`font-medium ${theme.text}`}>{patient.diagnosis}</p>
            </div>
            <div>
              <h3 className={`text-sm ${theme.subtext}`}>Doctor</h3>
              <p className={`font-medium ${theme.text}`}>{patient.doctor}</p>
            </div>
            <div>
              <h3 className={`text-sm ${theme.subtext}`}>Reward Points</h3>
              <p className={`font-medium ${theme.text}`}>{patient.points}</p>
            </div>
          </div>
        </div>

        {/* Recent Emotions from MongoDB */}
        <div className={`mb-8 ${theme.cardBg} rounded-xl shadow-lg backdrop-blur-sm p-6`}>
          <h2 className={`text-lg font-semibold mb-4 ${theme.text}`}>📊 Recent Emotions (from MongoDB)</h2>
          {emotionHistory.length === 0 ? (
            <p className={`${theme.subtext}`}>No emotion analyses yet. Start a session to begin tracking.</p>
          ) : (
            <div className="space-y-3">
              {emotionHistory.slice(-5).reverse().map((emotion, index) => {
                const emotionEmojis = {
                  happy: '😊',
                  sad: '😔',
                  angry: '😠',
                  fearful: '😨',
                  disgusted: '🤢',
                  surprised: '😲',
                  neutral: '😐'
                };
                
                return (
                  <div key={emotion._id || index} className={`border-l-4 border-blue-500 pl-4 py-2`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{emotionEmojis[emotion.emotion] || '❓'}</span>
                        <div>
                          <p className={`font-semibold ${theme.text} capitalize`}>{emotion.emotion}</p>
                          <p className={`text-sm ${theme.subtext}`}>
                            {new Date(emotion.timestamp).toLocaleString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`font-bold text-lg text-blue-500`}>
                          {Math.round(emotion.intensity * 100)}%
                        </p>
                        <p className={`text-xs ${theme.subtext} capitalize`}>{emotion.analysisType}</p>
                      </div>
                    </div>
                    {emotion.medication && (
                      <p className={`text-sm mt-2 ${theme.subtext}`}>
                        💊 {emotion.medication} - {emotion.dosage}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
        
        {/* Tabs */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {[
                { id: 'mood', name: 'Mood Tracker' },
                { id: 'chat', name: 'Chat Assistant' },
                { id: 'voice', name: 'Voice Assistant' },
                { id: 'analysis', name: 'Combined Analysis' },
                { id: 'rewards', name: 'Rewards' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`${
                    activeTab === tab.id
                      ? `border-blue-500 ${theme.text}`
                      : `border-transparent ${theme.subtext} hover:border-gray-300`
                  } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                >
                  {tab.name}
                </button>
              ))}
            </nav>
          </div>
        </div>
        
        {/* Tab content */}
        <div className="mt-6">
          {renderTabContent()}
        </div>
      </main>

      {/* Floating Chatbot Button */}
      <AnimatePresence>
        {!showPatientChatbot && (
          <motion.button
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowPatientChatbot(true)}
            className="fixed bottom-6 right-6 w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 text-white rounded-full shadow-2xl flex items-center justify-center font-bold text-2xl hover:shadow-3xl z-40"
            title="Open AI Chatbot"
          >
            <FaRobot className="text-2xl" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Patient Chatbot Modal */}
      <AnimatePresence>
        {showPatientChatbot && (
          <PatientChatbot
            patientId={patientId}
            patientMood={recentEmotion?.emotion}
            onClose={() => setShowPatientChatbot(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default PatientView;
