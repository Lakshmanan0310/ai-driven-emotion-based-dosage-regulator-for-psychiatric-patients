import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUserMd, FaChartLine, FaHistory, FaSearch, FaCalendarAlt, FaFileMedical, FaBell, FaSignOutAlt } from 'react-icons/fa';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { patientService, sessionService, medicationService } from '../services/api';
import PatientProfile from '../components/PatientProfile';
import PatientList from '../components/PatientList';

const DoctorMode = () => {
  // State variables
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [medicationHistory, setMedicationHistory] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [emotionalTrendData, setEmotionalTrendData] = useState([]);
  const [statistics, setStatistics] = useState({
    dominantEmotion: 'neutral',
    avgAggression: 0,
    avgDepression: 0,
    avgAnxiety: 0
  });
  
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
          lastCheckIn: new Date().toISOString().split('T')[0] // Today's date as default
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
  }, []);
  
  // Handle patient selection
  const handlePatientSelect = (patient) => {
    setSelectedPatient(patient);
    fetchPatientDetails(patient.patientId);
  };
  
  // Fetch patient details including medication history and sessions
  const fetchPatientDetails = async (patientId) => {
    try {
      setIsLoading(true);
      
      // Fetch medication history
      const medications = await medicationService.getMedicationHistory(patientId);
      const formattedMedications = medications.map(med => ({
        date: new Date(med.timestamp).toLocaleDateString(),
        medication: med.medication,
        dosage: med.dosage,
        prescribedFor: med.reason
      }));
      setMedicationHistory(formattedMedications);
      
      // Fetch session history
      const sessionData = await sessionService.getSessions(patientId);
      setSessions(sessionData);
      
      // Generate emotional trend data from sessions
      if (sessionData.length > 0) {
        const trendData = generateEmotionalTrendData(sessionData);
        setEmotionalTrendData(trendData);
        
        // Calculate statistics
        const stats = calculateStatistics(sessionData);
        setStatistics(stats);
      }
      
      setIsLoading(false);
    } catch (err) {
      console.error('Error fetching patient details:', err);
      setError('Failed to load patient details');
      setIsLoading(false);
    }
  };
  
  // Generate emotional trend data from sessions
  const generateEmotionalTrendData = (sessions) => {
    // Sort sessions by timestamp
    const sortedSessions = [...sessions].sort((a, b) => 
      new Date(a.timestamp) - new Date(b.timestamp)
    );
    
    // Map sessions to trend data points
    return sortedSessions.map(session => {
      // Format date as MM/DD
      const date = new Date(session.timestamp).toLocaleDateString('en-US', {
        month: 'numeric',
        day: 'numeric'
      });
      
      // Map emotions to data points
      const emotionMap = {
        'sad': 'sadness',
        'angry': 'anger',
        'fearful': 'fear'
      };
      
      // Create data point with all emotions initialized to 0
      const dataPoint = { date, sadness: 0, anger: 0, fear: 0 };
      
      // Set the detected emotion's intensity
      const emotionKey = emotionMap[session.emotion] || session.emotion;
      if (dataPoint[emotionKey] !== undefined) {
        dataPoint[emotionKey] = session.emotionIntensity / 100; // Convert to 0-1 scale
      }
      
      return dataPoint;
    });
  };
  
  // Calculate statistics from sessions
  const calculateStatistics = (sessions) => {
    if (!sessions || sessions.length === 0) {
      return {
        dominantEmotion: 'neutral',
        avgAggression: 0,
        avgDepression: 0,
        avgAnxiety: 0
      };
    }
    
    // Count emotions
    const emotionCounts = {};
    let totalAggression = 0;
    let totalDepression = 0;
    let totalAnxiety = 0;
    
    sessions.forEach(session => {
      // Count emotions
      emotionCounts[session.emotion] = (emotionCounts[session.emotion] || 0) + 1;
      
      // Sum intensities based on emotion type
      if (session.emotion === 'angry') {
        totalAggression += session.emotionIntensity;
      } else if (session.emotion === 'sad') {
        totalDepression += session.emotionIntensity;
      } else if (session.emotion === 'fearful') {
        totalAnxiety += session.emotionIntensity;
      }
    });
    
    // Find dominant emotion
    let dominantEmotion = 'neutral';
    let maxCount = 0;
    
    for (const [emotion, count] of Object.entries(emotionCounts)) {
      if (count > maxCount) {
        maxCount = count;
        dominantEmotion = emotion;
      }
    }
    
    // Calculate averages
    const angrySessions = sessions.filter(s => s.emotion === 'angry').length || 1;
    const sadSessions = sessions.filter(s => s.emotion === 'sad').length || 1;
    const fearfulSessions = sessions.filter(s => s.emotion === 'fearful').length || 1;
    
    return {
      dominantEmotion,
      avgAggression: Math.round(totalAggression / angrySessions),
      avgDepression: Math.round(totalDepression / sadSessions),
      avgAnxiety: Math.round(totalAnxiety / fearfulSessions)
    };
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
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="fixed inset-y-0 left-0 bg-white shadow-md w-64 z-10">
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between px-6 py-4 border-b">
            <div className="flex items-center">
              <div className="p-2 bg-blue-500 text-white rounded-lg mr-2">
                <FaUserMd className="text-xl" />
              </div>
              <div>
                <h2 className="font-bold text-gray-800">MedAssist AI</h2>
                <p className="text-xs text-gray-500">Doctor Dashboard</p>
              </div>
            </div>
          </div>
          
          <nav className="flex-1 px-4 py-4">
            <div className="mb-6">
              <button
                className="flex items-center w-full px-4 py-2 text-left rounded-lg bg-blue-50 text-blue-700"
                onClick={() => setActiveTab('overview')}
              >
                <FaChartLine className="mr-3" />
                <span>Patient Overview</span>
              </button>
            </div>
            
            <div className="mb-6">
              <button
                className="flex items-center w-full px-4 py-2 text-left rounded-lg hover:bg-gray-100"
                onClick={() => setActiveTab('history')}
              >
                <FaHistory className="mr-3" />
                <span>Session History</span>
              </button>
            </div>
            
            <div className="mb-6">
              <button 
                className="flex items-center w-full px-4 py-2 text-left rounded-lg hover:bg-gray-100"
                onClick={() => handleModeSwitch('patient')}
              >
                <FaUserMd className="mr-3" />
                <span>Switch to Patient Mode</span>
              </button>
            </div>
            
            <div className="mt-auto pt-6 border-t">
              <button 
                className="flex items-center w-full px-4 py-2 text-left rounded-lg hover:bg-red-50 text-red-600"
                onClick={handleLogout}
              >
                <FaSignOutAlt className="mr-3" />
                <span>Logout</span>
              </button>
            </div>
          </nav>
        </div>
      </aside>
      
      {/* Main content */}
      <main className="ml-64 p-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-gray-800">Doctor Dashboard</h1>
          <div className="flex items-center">
            <div className="relative mr-4">
              <input
                type="text"
                placeholder="Search patients..."
                className="pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={searchQuery}
                onChange={handleSearchChange}
              />
              <FaSearch className="absolute left-3 top-3 text-gray-400" />
            </div>
            <button className="p-2 rounded-full bg-gray-200 text-gray-600 hover:bg-gray-300 mr-2">
              <FaCalendarAlt />
            </button>
            <button className="p-2 rounded-full bg-gray-200 text-gray-600 hover:bg-gray-300 mr-2">
              <FaFileMedical />
            </button>
            <button className="p-2 rounded-full bg-gray-200 text-gray-600 hover:bg-gray-300">
              <FaBell />
            </button>
          </div>
        </div>
        
        <div className="flex">
          {/* Patient list */}
          <div className="w-1/4 pr-6">
            <div className="bg-white rounded-xl shadow-md p-4 mb-6">
              <h2 className="text-lg font-semibold mb-4">Patients</h2>
              
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                </div>
              ) : error ? (
                <div className="text-red-500 text-center py-4">{error}</div>
              ) : (
                <PatientList 
                  patients={filteredPatients} 
                  selectedPatientId={selectedPatient?.patientId} 
                  onSelectPatient={handlePatientSelect} 
                />
              )}
            </div>
          </div>
          
          {/* Patient details */}
          <div className="w-3/4">
            {selectedPatient ? (
              <div>
                <div className="bg-white rounded-xl shadow-md p-6 mb-6">
                  <PatientProfile patient={selectedPatient} />
                  
                  <div className="flex justify-end mt-4">
                    <div className="space-x-2">
                      <button className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600">
                        Contact
                      </button>
                      <button className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600">
                        Schedule
                      </button>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-4 gap-4 mt-6">
                    <div className="bg-blue-50 rounded-lg p-4 text-center">
                      <div className="text-sm font-medium text-blue-700 mb-1">Sessions</div>
                      <div className="text-2xl font-bold text-blue-800">{sessions.length || 0}</div>
                    </div>
                    <div className="bg-purple-50 rounded-lg p-4 text-center">
                      <div className="text-sm font-medium text-purple-700 mb-1">Dominant Emotion</div>
                      <div className="flex items-center justify-center gap-2">
                        <span className="text-xl">{statistics.dominantEmotion === 'sad' ? '😔' : 
                                                    statistics.dominantEmotion === 'angry' ? '😠' : 
                                                    statistics.dominantEmotion === 'fearful' ? '😨' : 
                                                    statistics.dominantEmotion === 'happy' ? '😊' : '😐'}</span>
                        <span className="text-xl font-bold text-purple-800">
                          {statistics.dominantEmotion.charAt(0).toUpperCase() + statistics.dominantEmotion.slice(1)}
                        </span>
                      </div>
                    </div>
                    <div className="bg-red-50 rounded-lg p-4 text-center">
                      <div className="text-sm font-medium text-red-700 mb-1">Avg. Aggression</div>
                      <div className="text-2xl font-bold text-red-800">{statistics.avgAggression}%</div>
                    </div>
                    <div className="bg-blue-50 rounded-lg p-4 text-center">
                      <div className="text-sm font-medium text-blue-700 mb-1">Avg. Depression</div>
                      <div className="text-2xl font-bold text-blue-800">{statistics.avgDepression}%</div>
                    </div>
                  </div>
                </div>
                
                {/* Emotional trends chart */}
                <div className="bg-white rounded-lg shadow p-6 mb-6">
                  <h3 className="text-lg font-semibold mb-4">Emotional Trends</h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={emotionalTrendData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis domain={[0, 1]} />
                        <Tooltip />
                        <Line type="monotone" dataKey="sadness" stroke="#8884d8" name="Depression" activeDot={{ r: 8 }} />
                        <Line type="monotone" dataKey="anger" stroke="#ff5252" name="Aggression" />
                        <Line type="monotone" dataKey="fear" stroke="#4299e1" name="Anxiety" />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                  {emotionalTrendData.length === 0 && (
                    <div className="text-center text-gray-500 mt-4">
                      No emotional trend data available for this patient
                    </div>
                  )}
                </div>
                
                {/* Medication history */}
                <div className="bg-white rounded-lg shadow p-6 mb-6">
                  <h3 className="text-lg font-semibold mb-4">Medication History</h3>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Medication</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dosage</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Prescribed For</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {medicationHistory.length > 0 ? (
                          medicationHistory.map((med, index) => (
                            <tr key={index}>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{med.date}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{med.medication}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{med.dosage}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{med.prescribedFor}</td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan="4" className="px-6 py-4 text-center text-sm text-gray-500">
                              No medication history available for this patient
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-md p-6 flex flex-col items-center justify-center h-64">
                <div className="text-gray-400 mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <p className="text-gray-500 text-lg">Select a patient to view details</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default DoctorMode;
