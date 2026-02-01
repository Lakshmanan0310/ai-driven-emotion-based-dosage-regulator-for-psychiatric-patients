import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FaHome, FaCalendarCheck, FaChartLine, FaPills, FaSignOutAlt, FaUserMd, FaCamera, FaMicrophone, FaFlask, FaLayerGroup, FaUser, FaMemory, FaHeart, FaVideo } from 'react-icons/fa';
import { useTheme, ThemeSwitcher } from '../ThemeContext';
import PatientCheckIn from '../components/PatientCheckIn';
import MedicationRecommendation from '../components/MedicationRecommendation';
import TimedAnalysis from '../components/TimedAnalysis';
import CombinedAnalysis from '../components/CombinedAnalysis';
import MemoryVault from '../components/MemoryVault';
import LiveDoctor from '../components/LiveDoctor';
import { sessionService } from '../services/api';

const PatientDashboard = () => {
  const { currentTheme, themes } = useTheme();
  const theme = themes[currentTheme];
  // State variables
  const [activeTab, setActiveTab] = useState('home');
  const [activeAnalysisTab, setActiveAnalysisTab] = useState('facial');
  const { patientId } = useParams();
  const [localPatientId, setLocalPatientId] = useState(patientId || '123'); // Default test patient
  const [sessions, setSessions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [analysisResult, setAnalysisResult] = useState(null);
  const navigate = useNavigate();
  
  // Fetch patient sessions
  useEffect(() => {
    const fetchSessions = async () => {
      try {
        setIsLoading(true);
        const data = await sessionService.getSessions(localPatientId);
        setSessions(data);
        setIsLoading(false);
      } catch (err) {
        console.error('Error fetching sessions:', err);
        setError('Failed to load your session history');
        setIsLoading(false);
      }
    };
    
    fetchSessions();
  }, [localPatientId]);
  
  // Handle logout
  const handleLogout = () => {
    navigate('/');
  };
  
  // Handle profile navigation
  const handleProfileNavigation = () => {
    navigate(`/patient/${localPatientId}/profile`);
  };
  
  // Format date
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };
  
  // Get emotion emoji
  const getEmotionEmoji = (emotion) => {
    switch (emotion) {
      case 'happy': return '😊';
      case 'sad': return '😔';
      case 'angry': return '😠';
      case 'fearful': return '😨';
      case 'disgusted': return '🤢';
      case 'surprised': return '😲';
      case 'neutral': return '😐';
      default: return '🤔';
    }
  };
  
  // Get last check-in date
  const getLastCheckInDate = () => {
    if (sessions.length === 0) return 'No check-ins yet';
    return formatDate(sessions[0].timestamp);
  };
  
  // Get mood trend
  const getMoodTrend = () => {
    if (sessions.length < 2) return 'Not enough data';
    
    const latest = sessions[0].emotionIntensity;
    const previous = sessions[1].emotionIntensity;
    
    if (sessions[0].emotion === 'happy') {
      if (latest > previous) return 'Improving';
      if (latest < previous) return 'Declining';
      return 'Stable';
    } else {
      if (latest > previous) return 'Worsening';
      if (latest < previous) return 'Improving';
      return 'Stable';
    }
  };
  
  // Get trend color
  const getTrendColor = () => {
    const trend = getMoodTrend();
    if (trend === 'Improving') return 'text-green-600';
    if (trend === 'Worsening') return 'text-red-600';
    if (trend === 'Declining') return 'text-yellow-600';
    return 'text-blue-600';
  };
  
  return (
    <div className={`min-h-screen ${theme.background}`}>
      {/* Header */}
      <header className={`${theme.header}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className={`text-2xl font-bold ${theme.text}`}>Patient Dashboard</h1>
          <div className="flex items-center space-x-4">
            <ThemeSwitcher className="mr-2" />
            <button
              onClick={handleProfileNavigation}
              className={`${theme.accent} ${theme.accentHover} flex items-center px-3 py-1 rounded-md`}
            >
              <FaUser className="mr-1" /> Patient Profile
            </button>
            <button
              onClick={handleLogout}
              className="text-red-500 hover:text-red-600 flex items-center px-3 py-1 rounded-md"
            >
              <FaSignOutAlt className="mr-1" /> Logout
            </button>
          </div>
        </div>
      </header>
      
      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row">
          {/* Sidebar */}
          <div className="w-full md:w-64 mb-6 md:mb-0">
            <div className={`${theme.cardBg} rounded-lg shadow overflow-hidden`}>
              <div className={`px-6 py-4 border-b ${theme.border}`}>
                <h2 className={`text-lg font-medium ${theme.text}`}>Navigation</h2>
              </div>
              <nav className="px-3 py-4">
                <ul className="space-y-2">
                  <li>
                    <button
                      onClick={() => setActiveTab('home')}
                      className={`w-full flex items-center px-4 py-2 rounded-lg transition-colors ${activeTab === 'home' ? theme.navActive : `${theme.text} ${theme.navHover}`}`}
                    >
                      <FaHome className="mr-3" />
                      Dashboard
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => setActiveTab('check-in')}
                      className={`w-full flex items-center px-4 py-2 rounded-lg transition-colors ${activeTab === 'check-in' ? theme.navActive : `${theme.text} ${theme.navHover}`}`}
                    >
                      <FaCalendarCheck className="mr-3" />
                      Check-In
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => setActiveTab('analysis')}
                      className={`w-full flex items-center px-4 py-2 rounded-lg transition-colors ${activeTab === 'analysis' ? theme.navActive : `${theme.text} ${theme.navHover}`}`}
                    >
                      <FaFlask className="mr-3" />
                      Analysis
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => setActiveTab('history')}
                      className={`w-full flex items-center px-4 py-2 rounded-lg transition-colors ${activeTab === 'history' ? theme.navActive : `${theme.text} ${theme.navHover}`}`}
                    >
                      <FaChartLine className="mr-3" />
                      History
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => setActiveTab('medication')}
                      className={`w-full flex items-center px-4 py-2 rounded-lg transition-colors ${activeTab === 'medication' ? theme.navActive : `${theme.text} ${theme.navHover}`}`}
                    >
                      <FaPills className="mr-3" />
                      Medication
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => setActiveTab('memory-vault')}
                      className={`w-full flex items-center px-4 py-2 rounded-lg transition-colors ${activeTab === 'memory-vault' ? theme.navActive : `${theme.text} ${theme.navHover}`}`}
                    >
                      <FaHeart className="mr-3" />
                      Memory Vault
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => setActiveTab('live-doctor')}
                      className={`w-full flex items-center px-4 py-2 rounded-lg transition-colors ${activeTab === 'live-doctor' ? theme.navActive : `${theme.text} ${theme.navHover}`}`}
                    >
                      <FaVideo className="mr-3" />
                      Live Doctor
                    </button>
                  </li>
                </ul>
              </nav>
            </div>
          </div>
          
          {/* Content area */}
          <div className="md:ml-8 flex-1">
            {/* Home tab */}
            {activeTab === 'home' && (
              <div>
                <h2 className="text-xl font-semibold mb-6">Welcome to Your Dashboard</h2>
                
                {/* Summary cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <div className={`${theme.cardBg} rounded-lg shadow-md ${theme.shadow} p-6`}>
                    <h3 className={`text-sm font-medium ${theme.subtext} mb-1`}>Last Check-In</h3>
                    <p className={`text-xl font-semibold ${theme.text}`}>{getLastCheckInDate()}</p>
                    {sessions.length > 0 && (
                      <div className="mt-2 flex items-center">
                        <span className="text-2xl mr-2">{getEmotionEmoji(sessions[0].emotion)}</span>
                        <span className="capitalize">{sessions[0].emotion}</span>
                      </div>
                    )}
                  </div>
                  
                  <div className={`${theme.cardBg} rounded-lg shadow-md ${theme.shadow} p-6`}>
                    <h3 className={`text-sm font-medium ${theme.subtext} mb-1`}>Mood Trend</h3>
                    <p className={`text-xl font-semibold ${getTrendColor()}`}>{getMoodTrend()}</p>
                    {sessions.length > 1 && (
                      <p className="text-sm text-gray-600 mt-2">
                        Based on your last {Math.min(sessions.length, 5)} check-ins
                      </p>
                    )}
                  </div>
                  
                  <div className={`${theme.cardBg} rounded-lg shadow-md ${theme.shadow} p-6`}>
                    <h3 className={`text-sm font-medium ${theme.subtext} mb-1`}>Current Medication</h3>
                    {sessions.length > 0 && sessions[0].medicationRecommended ? (
                      <p className="text-xl font-semibold">
                        {sessions[0].medicationRecommended.medication} {sessions[0].medicationRecommended.dosage}
                      </p>
                    ) : (
                      <p className="text-xl font-semibold">None prescribed</p>
                    )}
                  </div>
                </div>
                
                {/* Recent check-ins */}
                <div className={`${theme.cardBg} rounded-lg shadow-md ${theme.shadow} overflow-hidden`}>
                  <div className={`px-6 py-4 border-b ${theme.border}`}>
                    <h3 className={`text-lg font-medium ${theme.text}`}>Recent Check-Ins</h3>
                  </div>
                  
                  {isLoading ? (
                    <div className="p-6 flex justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                    </div>
                  ) : error ? (
                    <div className="p-6 text-red-600">{error}</div>
                  ) : sessions.length === 0 ? (
                    <div className="p-6 text-gray-600">No check-ins recorded yet. Start your first check-in today!</div>
                  ) : (
                    <ul className="divide-y divide-gray-200">
                      {sessions.slice(0, 5).map((session, index) => (
                        <li key={index} className="px-6 py-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <span className="text-2xl mr-3">{getEmotionEmoji(session.emotion)}</span>
                              <div>
                                <p className="font-medium capitalize">{session.emotion}</p>
                                <p className="text-sm text-gray-600">{formatDate(session.timestamp)}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-medium">Intensity: {session.emotionIntensity}%</p>
                              <p className="text-sm text-gray-600 capitalize">Voice: {session.voiceTone}</p>
                            </div>
                          </div>
                          {session.transcript && (
                            <p className="mt-2 text-sm text-gray-600 italic">"{session.transcript.substring(0, 100)}..."</p>
                          )}
                        </li>
                      ))}
                    </ul>
                  )}
                  
                  {sessions.length > 5 && (
                    <div className="px-6 py-3 bg-gray-50 text-right">
                      <button
                        onClick={() => setActiveTab('history')}
                        className="text-sm text-blue-600 hover:text-blue-800"
                      >
                        View all check-ins
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
            
            {/* Check-in tab */}
            {activeTab === 'check-in' && (
              <div>
                <h2 className="text-xl font-semibold mb-6">Daily Emotion Check-In</h2>
                <PatientCheckIn patientId={localPatientId} />
              </div>
            )}
            
            {/* History tab */}
            {activeTab === 'history' && (
              <div>
                <h2 className="text-xl font-semibold mb-6">Your Emotion History</h2>
                
                {isLoading ? (
                  <div className={`${theme.cardBg} rounded-lg shadow-md ${theme.shadow} p-6 flex justify-center`}>
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                  </div>
                ) : error ? (
                  <div className={`${theme.cardBg} rounded-lg shadow-md ${theme.shadow} p-6 text-red-600`}>{error}</div>
                ) : sessions.length === 0 ? (
                  <div className={`${theme.cardBg} rounded-lg shadow-md ${theme.shadow} p-6 ${theme.subtext}`}>
                    No check-ins recorded yet. Start your first check-in today!
                  </div>
                ) : (
                  <div className={`${theme.cardBg} rounded-lg shadow-md ${theme.shadow} overflow-hidden`}>
                    <ul className={`divide-y ${theme.border}`}>
                      {sessions.map((session, index) => (
                        <li key={index} className="px-6 py-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <span className="text-2xl mr-3">{getEmotionEmoji(session.emotion)}</span>
                              <div>
                                <p className="font-medium capitalize">{session.emotion}</p>
                                <p className="text-sm text-gray-600">{formatDate(session.timestamp)}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-medium">Intensity: {session.emotionIntensity}%</p>
                              <p className="text-sm text-gray-600 capitalize">Voice: {session.voiceTone}</p>
                            </div>
                          </div>
                          {session.transcript && (
                            <p className="mt-2 text-sm text-gray-600 italic">"{session.transcript}"</p>
                          )}
                          {session.medicationRecommended && (
                            <div className="mt-3 pt-3 border-t border-gray-100">
                              <p className="text-sm font-medium text-gray-700">Recommended Medication:</p>
                              <p className="text-sm">
                                {session.medicationRecommended.medication} {session.medicationRecommended.dosage}
                                {session.medicationRecommended.notes && (
                                  <span className="block text-gray-600 text-xs mt-1">
                                    {session.medicationRecommended.notes}
                                  </span>
                                )}
                              </p>
                            </div>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
            
            {/* Medication tab */}
            {activeTab === 'medication' && (
              <div>
                <h2 className="text-xl font-semibold mb-6">Your Medication</h2>
                <MedicationRecommendation patientId={localPatientId} doctorMode={false} />
              </div>
            )}
            
            {/* Memory Vault tab */}
            {activeTab === 'memory-vault' && (
              <div>
                <h2 className="text-xl font-semibold mb-6">Emotional Memory Vault</h2>
                <MemoryVault 
                  patientId={localPatientId} 
                  currentEmotion={sessions.length > 0 ? {
                    emotion: sessions[0].emotion,
                    intensity: sessions[0].emotionIntensity
                  } : null}
                />
              </div>
            )}
            
            {/* Live Doctor tab */}
            {activeTab === 'live-doctor' && (
              <div>
                <h2 className="text-xl font-semibold mb-6">Live Doctor Consultation</h2>
                <LiveDoctor patientId={localPatientId} />
              </div>
            )}
            
            {/* Analysis tab */}
            {activeTab === 'analysis' && (
              <div>
                <h2 className="text-xl font-semibold mb-6">Emotion Analysis</h2>
                <div className="grid grid-cols-1 gap-6 mb-8">
                  <div className={`bg-gradient-to-r ${currentTheme === 'light' ? 'from-pink-50 to-purple-50' : 'from-blue-900/50 to-purple-900/50'} rounded-lg p-6 shadow-md ${theme.shadow}`}>
                    <h3 className={`text-lg font-medium ${theme.text} mb-4`}>AI-Powered Emotion Analysis</h3>
                    <p className={`${theme.subtext} mb-4`}>
                      Our AI system can analyze your emotions through facial expressions and voice patterns to provide personalized medication recommendations.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                      <div className={`${theme.cardBg} rounded-lg p-4 shadow-sm flex items-center`}>
                        <div className={`${currentTheme === 'light' ? 'bg-pink-100' : 'bg-blue-800'} p-3 rounded-full mr-4`}>
                          <FaCamera className={`${currentTheme === 'light' ? 'text-purple-600' : 'text-purple-400'} text-xl`} />
                        </div>
                        <div>
                          <h4 className={`font-medium ${theme.text}`}>Facial Analysis</h4>
                          <p className={`text-sm ${theme.subtext}`}>Analyzes your facial expressions for 20 seconds</p>
                        </div>
                      </div>
                      <div className={`${theme.cardBg} rounded-lg p-4 shadow-sm flex items-center`}>
                        <div className={`${currentTheme === 'light' ? 'bg-purple-100' : 'bg-purple-800'} p-3 rounded-full mr-4`}>
                          <FaMicrophone className={`${currentTheme === 'light' ? 'text-purple-600' : 'text-purple-400'} text-xl`} />
                        </div>
                        <div>
                          <h4 className={`font-medium ${theme.text}`}>Voice Analysis</h4>
                          <p className={`text-sm ${theme.subtext}`}>Analyzes your speech and voice tone for 20 seconds</p>
                        </div>
                      </div>
                      <div className={`${theme.cardBg} rounded-lg p-4 shadow-sm flex items-center`}>
                        <div className={`bg-gradient-to-r ${currentTheme === 'light' ? 'from-pink-100 to-purple-100' : 'from-blue-800 to-purple-800'} p-3 rounded-full mr-4`}>
                          <FaLayerGroup className={`${currentTheme === 'light' ? 'text-purple-600' : 'text-purple-400'} text-xl`} />
                        </div>
                        <div>
                          <h4 className={`font-medium ${theme.text}`}>Combined Analysis</h4>
                          <p className={`text-sm ${theme.subtext}`}>Analyzes both face and voice simultaneously</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Analysis Type Tabs */}
                <div className="mb-6">
                  <div className="flex border-b border-gray-200">
                    <button
                      onClick={() => setActiveAnalysisTab('facial')}
                      className={`py-2 px-4 font-medium ${
                        activeAnalysisTab === 'facial' 
                          ? `${theme.accent} border-b-2 border-${currentTheme === 'light' ? 'purple-600' : 'purple-400'}` 
                          : `${theme.subtext} hover:${theme.accent}`
                      }`}
                    >
                      <FaCamera className="inline mr-1" /> Facial Analysis
                    </button>
                    <button
                      onClick={() => setActiveAnalysisTab('voice')}
                      className={`py-2 px-4 font-medium ${
                        activeAnalysisTab === 'voice' 
                          ? `${theme.accent} border-b-2 border-${currentTheme === 'light' ? 'purple-600' : 'purple-400'}` 
                          : `${theme.subtext} hover:${theme.accent}`
                      }`}
                    >
                      <FaMicrophone className="inline mr-1" /> Voice Analysis
                    </button>
                    <button
                      onClick={() => setActiveAnalysisTab('combined')}
                      className={`py-2 px-4 font-medium ${
                        activeAnalysisTab === 'combined' 
                          ? `${theme.accent} border-b-2 border-${currentTheme === 'light' ? 'purple-600' : 'purple-400'}` 
                          : `${theme.subtext} hover:${theme.accent}`
                      }`}
                    >
                      <FaLayerGroup className="inline mr-1" /> Combined Analysis
                    </button>
                  </div>
                </div>
                
                {activeAnalysisTab === 'facial' && (
                  <TimedAnalysis 
                    patientId={localPatientId} 
                    onAnalysisComplete={(result) => {
                      setAnalysisResult(result);
                      // Save analysis to session history
                      const sessionData = {
                        patientId: localPatientId,
                        timestamp: new Date(),
                        emotion: result.type === 'facial' ? result.dominantEmotion : result.emotion,
                        emotionIntensity: result.type === 'facial' ? result.confidence * 100 : result.confidence * 100,
                        voiceTone: result.type === 'voice' ? result.voiceTone : 'N/A',
                        transcript: result.type === 'voice' ? result.transcript : '',
                        medicationRecommended: result.recommendation,
                        analysisType: result.type
                      };
                      
                      // Add to local state
                      setSessions(prev => [sessionData, ...prev]);
                      
                      // Save to backend (would be implemented in a real system)
                      // sessionService.createSession(sessionData);
                    }}
                  />
                )}
                
                {activeAnalysisTab === 'voice' && (
                  <TimedAnalysis 
                    patientId={localPatientId} 
                    onAnalysisComplete={(result) => {
                      setAnalysisResult(result);
                      // Save analysis to session history
                      const sessionData = {
                        patientId: localPatientId,
                        timestamp: new Date(),
                        emotion: result.type === 'facial' ? result.dominantEmotion : result.emotion,
                        emotionIntensity: result.type === 'facial' ? result.confidence * 100 : result.confidence * 100,
                        voiceTone: result.type === 'voice' ? result.voiceTone : 'N/A',
                        transcript: result.type === 'voice' ? result.transcript : '',
                        medicationRecommended: result.recommendation,
                        analysisType: result.type
                      };
                      
                      // Add to local state
                      setSessions(prev => [sessionData, ...prev]);
                      
                      // Save to backend (would be implemented in a real system)
                      // sessionService.createSession(sessionData);
                    }}
                  />
                )}
                
                {activeAnalysisTab === 'combined' && (
                  <CombinedAnalysis 
                    patientId={localPatientId} 
                    onAnalysisComplete={(result) => {
                      setAnalysisResult(result);
                      // Save analysis to session history
                      const sessionData = {
                        patientId: localPatientId,
                        timestamp: new Date(),
                        emotion: result.combinedResult.emotion,
                        emotionIntensity: result.combinedResult.confidence * 100,
                        voiceTone: result.voiceAnalysis.voiceTone,
                        transcript: result.voiceAnalysis.transcript,
                        medicationRecommended: result.recommendation,
                        analysisType: 'combined'
                      };
                      
                      // Add to local state
                      setSessions(prev => [sessionData, ...prev]);
                      
                      // Save to backend (would be implemented in a real system)
                      // sessionService.createSession(sessionData);
                    }}
                  />
                )}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default PatientDashboard;
