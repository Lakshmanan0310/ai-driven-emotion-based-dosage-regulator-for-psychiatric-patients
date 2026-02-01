import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { FaSearch, FaBell, FaSignOutAlt } from 'react-icons/fa';
import { useTheme, ThemeSwitcher } from '../ThemeContext';
import { patientService, sessionService, medicationService } from '../services/api';
import PatientList from '../components/PatientList';
import PatientProfile from '../components/PatientProfile';
import MedicalPrescription from '../components/MedicalPrescription';
import ContactPatientModal from '../components/ContactPatientModal';
import ScheduleAppointmentModal from '../components/ScheduleAppointmentModal';

/**
 * DoctorDashboard Component
 * 
 * This component provides a dashboard for doctors to monitor patients,
 * view their emotional trends, and manage prescriptions.
 */
const DoctorMode = () => {
  const { currentTheme, themes } = useTheme();
  const theme = themes[currentTheme];
  // State variables
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [emotionHistory, setEmotionHistory] = useState([]);
  const [medicationHistory, setMedicationHistory] = useState([
    { date: '01/05/2025', medication: 'Fluoxetine', dosage: '20mg', prescribedFor: 'Depression' },
    { date: '07/05/2025', medication: 'Fluoxetine', dosage: '40mg', prescribedFor: 'Depression (increased)' },
    { date: '15/05/2025', medication: 'Fluoxetine + Lorazepam', dosage: '40mg + 0.5mg', prescribedFor: 'Depression + Anxiety' },
    { date: '19/05/2025', medication: 'Olanzapine', dosage: '5mg', prescribedFor: 'Aggression' }
  ]);
  const [aggregatedData, setAggregatedData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showContactModal, setShowContactModal] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [contactHistory, setContactHistory] = useState([]);
  const [appointmentHistory, setAppointmentHistory] = useState([]);
  
  const navigate = useNavigate();
  
  // Fetch patient data from server
  useEffect(() => {
    const fetchPatients = async () => {
      try {
        setIsLoading(true);
        const data = await patientService.getAll();
        console.log('Fetched patients:', data);
        
        // Map the data to include initials for the avatar
        const patientsWithInitials = data.map(patient => ({
          ...patient,
          id: patient.name.split(' ').map(n => n[0]).join(''),
          status: patient.concern === 'High' ? 'Alert' : 
                 patient.concern === 'Medium' ? 'Concern' : 'Stable',
          lastCheckIn: '2025-05-22' // Mock date for now
        }));
        
        setPatients(patientsWithInitials);
        
        // Select the first patient by default if we have patients
        if (patientsWithInitials.length > 0 && !selectedPatient) {
          handlePatientSelect(patientsWithInitials[0]);
        }
        
        setIsLoading(false);
      } catch (err) {
        console.error('Error fetching patients:', err);
        setError('Failed to load patients');
        setIsLoading(false);
      }
    };
    
    fetchPatients();
  }, [selectedPatient]);
  
  // Update data when patient is selected
  useEffect(() => {
    if (selectedPatient) {
      fetchPatientEmotionHistory(selectedPatient.patientId);
    }
  }, [selectedPatient]);
  
  // Mock function to fetch patient emotion history
  const fetchPatientEmotionHistory = (patientId) => {
    // This would be an API call in a real application
    // Mock data for demonstration
    const mockEmotionData = [
      { date: '5/1', sadness: 0.3, anger: 0.5, fear: 0.2 },
      { date: '5/3', sadness: 0.5, anger: 0.3, fear: 0.4 },
      { date: '5/5', sadness: 0.7, anger: 0.4, fear: 0.3 },
      { date: '5/7', sadness: 0.4, anger: 0.3, fear: 0.25 },
      { date: '5/9', sadness: 0.6, anger: 0.5, fear: 0.35 },
      { date: '5/11', sadness: 0.3, anger: 0.25, fear: 0.4 },
      { date: '5/13', sadness: 0.2, anger: 0.1, fear: 0.3 },
      { date: '5/15', sadness: 0.4, anger: 0.3, fear: 0.5 },
      { date: '5/17', sadness: 0.5, anger: 0.6, fear: 0.4 },
      { date: '5/19', sadness: 0.8, anger: 0.4, fear: 0.5 },
      { date: '5/21', sadness: 0.4, anger: 0.35, fear: 0.7 },
    ];
    
    setEmotionHistory(mockEmotionData);
    
    // Calculate aggregated data for the summary
    const aggregated = {
      totalSessions: mockEmotionData.length,
      dominantEmotion: 'sad',
      averageAggression: calculateAverage(mockEmotionData, 'anger'),
      averageDepression: calculateAverage(mockEmotionData, 'sadness'),
      averageAnxiety: calculateAverage(mockEmotionData, 'fear'),
      lastSession: mockEmotionData[mockEmotionData.length - 1].date
    };
    
    setAggregatedData(aggregated);
  };
  
  // Helper function to calculate average for a property
  const calculateAverage = (data, property) => {
    if (!data || data.length === 0) return 0;
    
    const sum = data.reduce((total, item) => total + (item[property] || 0), 0);
    return sum / data.length;
  };
  
  // Get emotion emoji
  const getEmotionEmoji = (emotion) => {
    switch (emotion) {
      case 'happy': return '😊';
      case 'sad': return '😢';
      case 'angry': return '😠';
      case 'fearful': return '😨';
      case 'disgusted': return '🤢';
      case 'surprised': return '😲';
      case 'neutral': return '😐';
      default: return '❓';
    }
  };
  
  // Handle patient selection
  const handlePatientSelect = (patient) => {
    setSelectedPatient(patient);
  };
  
  // Filter patients based on search query
  const filteredPatients = patients.filter(patient => 
    patient.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  // Handle search input change
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };
  
  // Handle logout
  const handleLogout = () => {
    navigate('/');
  };
  
  // Handle mode switch
  const handleModeSwitch = (mode) => {
    if (mode === 'patient') {
      navigate('/patient/default');
    }
  };
  
  // Calculate mood swing index
  const calculateMoodSwingIndex = (emotionHistory) => {
    if (!emotionHistory || emotionHistory.length < 3) return 0;
    
    let swingSum = 0;
    
    for (let i = 1; i < emotionHistory.length; i++) {
      const current = emotionHistory[i];
      const previous = emotionHistory[i - 1];
      
      // Calculate difference in sadness, anger, and fear
      const sadnessDiff = Math.abs(current.sadness - previous.sadness);
      const angerDiff = Math.abs(current.anger - previous.anger);
      const fearDiff = Math.abs(current.fear - previous.fear);
      
      // Average the differences
      const avgDiff = (sadnessDiff + angerDiff + fearDiff) / 3;
      
      swingSum += avgDiff;
    }
    
    // Normalize to 0-1 range
    return Math.min(1, swingSum / (emotionHistory.length - 1));
  };
  
  return (
    <div className={`min-h-screen ${theme.background}`}>
      {/* Header */}
      <header className={`${theme.header} border-b ${theme.border}`}>
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <h1 className={`text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r ${theme.primary}`}>
              Doctor Dashboard
            </h1>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <ThemeSwitcher />
              </div>
              <div className="relative">
                <button className={`p-2 rounded-full ${theme.accentBg} ${theme.accent} ${theme.accentHover}`}>
                  <FaBell className="w-6 h-6" />
                </button>
                <span className="absolute top-0 right-0 w-4 h-4 bg-red-500 rounded-full text-xs text-white flex items-center justify-center">
                  3
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <div className={`w-10 h-10 bg-gradient-to-r ${theme.primary} rounded-full flex items-center justify-center text-white font-medium`}>
                  DR
                </div>
                <span className={`${theme.text} font-medium`}>Dr. Smith</span>
              </div>
              <button 
                onClick={handleLogout}
                className="flex items-center space-x-1 px-3 py-1.5 bg-red-50 text-red-600 rounded-md hover:bg-red-100 transition-colors"
              >
                <FaSignOutAlt size={14} />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left column - Patient list and profile */}
          <div className="lg:col-span-1 space-y-8">
            {/* Patient list */}
            <PatientList 
              patients={filteredPatients}
              selectedPatient={selectedPatient}
              onSelectPatient={handlePatientSelect}
              searchQuery={searchQuery}
              onSearchChange={handleSearchChange}
            />
            
            {/* Patient profile card */}
            {selectedPatient && (
              <div className={`${theme.cardBg} backdrop-blur-sm rounded-xl p-6 shadow-lg ${theme.shadow}`}>
                <h2 className={`text-xl font-semibold mb-4 ${theme.text}`}>{selectedPatient.name}</h2>
                <div className="space-y-6">
                  {/* Patient info */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h3 className={`text-sm ${theme.subtext}`}>Age</h3>
                      <p className={`font-medium ${theme.text}`}>{selectedPatient.age} years</p>
                    </div>
                    <div>
                      <h3 className={`text-sm ${theme.subtext}`}>Gender</h3>
                      <p className={`font-medium ${theme.text}`}>{selectedPatient.gender}</p>
                    </div>
                    <div>
                      <h3 className={`text-sm ${theme.subtext}`}>Diagnosis</h3>
                      <p className={`font-medium ${theme.text}`}>{selectedPatient.diagnosis || 'Anxiety Disorder'}</p>
                    </div>
                    <div>
                      <h3 className="text-sm text-gray-500">Current Medication</h3>
                      <p className="font-medium">{selectedPatient.currentMedication || 'Lorazepam 0.5mg'}</p>
                    </div>
                  </div>
                  
                  {/* Recent emotional state */}
                  <div>
                    <h3 className="text-sm text-gray-500 mb-3">Recent Emotional State</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <span className="text-xl mr-2">😐</span>
                          <span className="font-medium">Neutral</span>
                        </div>
                        <div className="flex items-center">
                          <div className="w-24 h-2 bg-gray-200 rounded-full mr-2 overflow-hidden">
                            <div className="h-full bg-green-500 rounded-full" style={{ width: '60%' }}></div>
                          </div>
                          <span className="text-xs text-gray-500">20/05/2025</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <span className="text-xl mr-2">😔</span>
                          <span className="font-medium">Sad</span>
                        </div>
                        <div className="flex items-center">
                          <div className="w-24 h-2 bg-gray-200 rounded-full mr-2 overflow-hidden">
                            <div className="h-full bg-yellow-500 rounded-full" style={{ width: '70%' }}></div>
                          </div>
                          <span className="text-xs text-gray-500">19/05/2025</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <span className="text-xl mr-2">😨</span>
                          <span className="font-medium">Fearful</span>
                        </div>
                        <div className="flex items-center">
                          <div className="w-24 h-2 bg-gray-200 rounded-full mr-2 overflow-hidden">
                            <div className="h-full bg-yellow-500 rounded-full" style={{ width: '65%' }}></div>
                          </div>
                          <span className="text-xs text-gray-500">18/05/2025</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Action buttons */}
                  <div className="grid grid-cols-2 gap-2">
                    <button className="py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 text-sm">
                      View Full Profile
                    </button>
                    <button className="py-2 bg-green-500 text-white rounded-md hover:bg-green-600 text-sm">
                      Schedule Session
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {/* Right column - Patient details and charts */}
          <div className="lg:col-span-2">
            {isLoading ? (
              <div className="flex justify-center items-center h-64">
                <div className="text-gray-500">Loading...</div>
              </div>
            ) : error ? (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            ) : !selectedPatient ? (
              <div className="bg-white/80 backdrop-blur-sm rounded-xl p-12 shadow-lg text-center">
                <svg className="w-24 h-24 mx-auto text-gray-400 mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
                <h3 className="text-xl font-semibold text-gray-700 mb-2">No Patient Selected</h3>
                <p className="text-gray-500 max-w-md mx-auto">
                  Select a patient from the list to view their emotional trends, medication history, and prescription suggestions.
                </p>
              </div>
            ) : (
              <>
                {/* Patient summary */}
                <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg mb-8">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-800">{selectedPatient.name}</h2>
                      <p className="text-gray-600">{selectedPatient.age} years, {selectedPatient.gender}</p>
                    </div>
                    <div className="flex space-x-2">
                      <button 
                        onClick={() => setShowContactModal(true)}
                        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                      >
                        Contact
                      </button>
                      <button 
                        onClick={() => setShowScheduleModal(true)}
                        className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                      >
                        Schedule
                      </button>
                    </div>
                  </div>
                  
                  {aggregatedData && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <p className="text-sm text-blue-700 font-medium">Sessions</p>
                        <p className="text-2xl font-bold text-blue-800">{aggregatedData.totalSessions}</p>
                      </div>
                      <div className="bg-purple-50 p-4 rounded-lg">
                        <p className="text-sm text-purple-700 font-medium">Dominant Emotion</p>
                        <p className="text-2xl font-bold text-purple-800 flex items-center">
                          <span className="mr-2">{getEmotionEmoji(aggregatedData.dominantEmotion)}</span>
                          <span className="capitalize">Sad</span>
                        </p>
                      </div>
                      <div className="bg-red-50 p-4 rounded-lg">
                        <p className="text-sm text-red-700 font-medium">Avg. Aggression</p>
                        <p className="text-2xl font-bold text-red-800">{Math.round(aggregatedData.averageAggression * 100)}%</p>
                      </div>
                      <div className="bg-indigo-50 p-4 rounded-lg">
                        <p className="text-sm text-indigo-700 font-medium">Avg. Depression</p>
                        <p className="text-2xl font-bold text-indigo-800">{Math.round(aggregatedData.averageDepression * 100)}%</p>
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Emotion trends chart */}
                <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg mb-8">
                  <h3 className="text-xl font-semibold mb-4 text-gray-800">Emotional Trends</h3>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={emotionHistory}
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis domain={[0, 1]} />
                        <Tooltip 
                          formatter={(value) => [`${Math.round(value * 100)}%`]}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="anger" 
                          stroke="#F44336" 
                          name="Aggression"
                          strokeWidth={2}
                          dot={{ r: 4 }}
                          activeDot={{ r: 6 }}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="sadness" 
                          stroke="#2196F3" 
                          name="Depression"
                          strokeWidth={2}
                          dot={{ r: 4 }}
                          activeDot={{ r: 6 }}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="fear" 
                          stroke="#9C27B0" 
                          name="Anxiety"
                          strokeWidth={2}
                          dot={{ r: 4 }}
                          activeDot={{ r: 6 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                
                {/* Medication history */}
                <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg mb-8">
                  <h3 className="text-xl font-semibold mb-4 text-gray-800">Medication History</h3>
                  
                  <div className="overflow-hidden rounded-lg border border-gray-200">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Date
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Medication
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Dosage
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Prescribed For
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {medicationHistory.map((med, index) => (
                          <tr key={index}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {med.date}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {med.medication}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {med.dosage}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {med.prescribedFor}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
                
                {/* Current prescription suggestion */}
                {emotionHistory.length > 0 && (
                  <MedicalPrescription 
                    emotionData={{
                      emotion: 'sad',
                      aggression: emotionHistory[emotionHistory.length - 1].anger,
                      depression: emotionHistory[emotionHistory.length - 1].sadness,
                      anxiety: emotionHistory[emotionHistory.length - 1].fear,
                      expressionValues: {
                        sad: 0.8
                      }
                    }}
                    patientData={{
                      age: selectedPatient.age,
                      conditions: [],
                      moodSwings: calculateMoodSwingIndex(emotionHistory)
                    }}
                  />
                )}
              </>
            )}
          </div>
        </div>
      </main>
      
      {/* Contact Modal */}
      {showContactModal && selectedPatient && (
        <ContactPatientModal 
          patient={selectedPatient}
          onClose={() => setShowContactModal(false)}
          onSend={(contactData) => {
            console.log('Contact data:', contactData);
            setContactHistory([contactData, ...contactHistory]);
            // In a real app, this would be saved to the database
          }}
        />
      )}
      
      {/* Schedule Modal */}
      {showScheduleModal && selectedPatient && (
        <ScheduleAppointmentModal 
          patient={selectedPatient}
          onClose={() => setShowScheduleModal(false)}
          onSchedule={(appointmentData) => {
            console.log('Appointment data:', appointmentData);
            setAppointmentHistory([appointmentData, ...appointmentHistory]);
            // In a real app, this would be saved to the database
          }}
        />
      )}
    </div>
  );
};

export default DoctorMode;
