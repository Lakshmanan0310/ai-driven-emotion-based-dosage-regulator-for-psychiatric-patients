import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import PatientList from './PatientList';
import MedicalPrescription from './MedicalPrescription';

const DoctorDashboard = () => {
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [emotionData, setEmotionData] = useState([]);
  const [medicationHistory, setMedicationHistory] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch patients data from MongoDB
  useEffect(() => {
    const fetchPatients = async () => {
      try {
        // Fetch all emotion analyses to get unique patients
        const response = await fetch('/api/emotion-analysis/doctor/all');
        
        if (response.ok) {
          const data = await response.json();
          const analyses = Array.isArray(data) ? data : (data.data || []);
          
          // Get unique patients from analyses
          const patientMap = {};
          const mockPatients = [
            { patientId: 'lakshmanan', name: 'Lakshmanan', age: 31, gender: 'Male', concern: 'Medium', diagnosis: 'Anxiety Disorder', currentMedication: 'Lorazepam 0.5mg' }
          ];
          
          // Add patients from emotion analyses
          analyses.forEach(analysis => {
            const patientId = analysis.patientId || analysis.patientName;
            if (!patientMap[patientId]) {
              patientMap[patientId] = {
                patientId,
                name: analysis.patientName || patientId,
                age: 31, // Default age
                gender: 'Male', // Default gender
                concern: 'Medium', // Default concern
                diagnosis: 'Anxiety Disorder',
                currentMedication: 'Lorazepam 0.5mg'
              };
            }
          });
          
          // Combine mock and fetched patients
          const allPatients = [...mockPatients, ...Object.values(patientMap).filter(p => p.patientId !== 'lakshmanan')];
          setPatients(allPatients);
          console.log('✅ Loaded patients:', allPatients);
        } else {
          // Fallback to mock patients
          const mockPatients = [
            { patientId: 'lakshmanan', name: 'Lakshmanan', age: 31, gender: 'Male', concern: 'Medium' }
          ];
          setPatients(mockPatients);
        }
      } catch (error) {
        console.error('Error fetching patients:', error);
        // Fallback
        const mockPatients = [
          { patientId: 'lakshmanan', name: 'Lakshmanan', age: 31, gender: 'Male', concern: 'Medium' }
        ];
        setPatients(mockPatients);
      }
    };

    fetchPatients();
    
    // Poll for new patients every 5 seconds
    const interval = setInterval(fetchPatients, 5000);
    return () => clearInterval(interval);
  }, []);

  // Handle patient selection
  const handlePatientSelect = (patient) => {
    setSelectedPatient(patient);
    fetchPatientData(patient.patientId);
  };

  // Fetch patient emotion and medication data from MongoDB
  const fetchPatientData = async (patientId) => {
    try {
      // Fetch real emotion analysis from MongoDB via API
      const response = await fetch(`/api/emotion-analysis/${patientId}`);
      
      if (response.ok) {
        const data = await response.json();
        const analyses = Array.isArray(data) ? data : (data.data || []);
        
        // Transform MongoDB data to chart format
        const chartData = analyses.map((analysis, index) => {
          const emotionMap = {
            happy: { depression: 0.1, aggression: 0.1, anxiety: 0.1 },
            sad: { depression: 0.8, aggression: 0.2, anxiety: 0.4 },
            angry: { depression: 0.3, aggression: 0.9, anxiety: 0.5 },
            fearful: { depression: 0.5, aggression: 0.2, anxiety: 0.9 },
            neutral: { depression: 0.2, aggression: 0.2, anxiety: 0.2 },
            disgusted: { depression: 0.4, aggression: 0.6, anxiety: 0.3 },
            surprised: { depression: 0.2, aggression: 0.1, anxiety: 0.5 }
          };
          
          const emotions = emotionMap[analysis.emotion] || emotionMap.neutral;
          const date = new Date(analysis.timestamp);
          const dateStr = `${date.getMonth() + 1}/${date.getDate()}`;
          
          return {
            date: dateStr,
            depression: emotions.depression * analysis.emotionConfidence,
            aggression: emotions.aggression * analysis.emotionConfidence,
            anxiety: emotions.anxiety * analysis.emotionConfidence,
            ...emotions
          };
        });
        
        setEmotionData(chartData);
        console.log('✅ Loaded emotion data from MongoDB:', chartData);
      } else {
        setEmotionData([]);
      }

      // Build medication history from analyses
      const medHistory = analyses
        .filter(a => a.recommendation)
        .map((analysis, index) => {
          const date = new Date(analysis.timestamp);
          return {
            date: date.toLocaleDateString('en-US', { year: '2-digit', month: '2-digit', day: '2-digit' }),
            medication: analysis.recommendation.medication || 'N/A',
            dosage: analysis.recommendation.dosage || 'N/A',
            prescribedFor: analysis.emotion,
            emotion: analysis.emotion,
            confidence: Math.round(analysis.emotionConfidence * 100)
          };
        });
      
      setMedicationHistory(medHistory);
    } catch (error) {
      console.error('Error fetching patient data:', error);
      setEmotionData([]);
      setMedicationHistory([]);
    }
  };

  // Handle search
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  // Filter patients based on search query
  const filteredPatients = patients.filter(patient => 
    patient.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Calculate patient statistics
  const calculatePatientStats = () => {
    if (!selectedPatient || !emotionData.length) return null;
    
    const totalSessions = emotionData.length;
    
    // Calculate average values
    const avgDepression = emotionData.reduce((sum, data) => sum + data.depression, 0) / totalSessions;
    const avgAggression = emotionData.reduce((sum, data) => sum + data.aggression, 0) / totalSessions;
    const avgAnxiety = emotionData.reduce((sum, data) => sum + data.anxiety, 0) / totalSessions;
    
    // Determine dominant emotion
    const emotionValues = { depression: avgDepression, aggression: avgAggression, anxiety: avgAnxiety };
    const dominantEmotion = Object.keys(emotionValues).reduce((a, b) => emotionValues[a] > emotionValues[b] ? a : b);
    
    return {
      totalSessions,
      dominantEmotion,
      avgDepression,
      avgAggression,
      avgAnxiety
    };
  };

  const patientStats = calculatePatientStats();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
            Doctor Dashboard
          </h1>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <div className="absolute right-0 top-0">
                <span className="flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                </span>
              </div>
              <button className="p-1 rounded-full text-gray-400 hover:text-gray-500">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
              </button>
            </div>
            <div className="flex items-center">
              <div className="h-8 w-8 rounded-full bg-indigo-600 flex items-center justify-center text-white font-semibold">
                DS
              </div>
              <span className="ml-2 text-sm font-medium text-gray-700">Dr. Smith</span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Latest Check-Ins Overview */}
        <div className="mb-8 bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg">
          <h2 className="text-xl font-semibold mb-4">📋 Latest Check-Ins</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {patients.slice(0, 4).map((patient, index) => (
              <div
                key={index}
                onClick={() => handlePatientSelect(patient)}
                className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 border border-indigo-200 rounded-lg cursor-pointer hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-gray-900 capitalize">{patient.name}</h3>
                  <span className="text-2xl">
                    {medicationHistory && medicationHistory[medicationHistory.length - 1]?.emotion === 'angry' ? '😠' :
                     medicationHistory && medicationHistory[medicationHistory.length - 1]?.emotion === 'happy' ? '😊' :
                     medicationHistory && medicationHistory[medicationHistory.length - 1]?.emotion === 'sad' ? '😔' : '😐'}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-2">{patient.age} yrs • {patient.gender}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-gray-500">Concern Level</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                    patient.concern === 'High' ? 'bg-red-100 text-red-800' :
                    patient.concern === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {patient.concern}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

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
              <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg">
                <h2 className="text-xl font-semibold mb-4">{selectedPatient.name}</h2>
                <div className="space-y-6">
                  {/* Patient info */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h3 className="text-sm text-gray-500">Age</h3>
                      <p className="font-medium">{selectedPatient.age} years</p>
                    </div>
                    <div>
                      <h3 className="text-sm text-gray-500">Gender</h3>
                      <p className="font-medium">{selectedPatient.gender}</p>
                    </div>
                    <div>
                      <h3 className="text-sm text-gray-500">Diagnosis</h3>
                      <p className="font-medium">{selectedPatient.diagnosis || 'Anxiety Disorder'}</p>
                    </div>
                    <div>
                      <h3 className="text-sm text-gray-500">Current Medication</h3>
                      <p className="font-medium">{selectedPatient.currentMedication || 'Lorazepam 0.5mg'}</p>
                    </div>
                  </div>
                  
                  {/* Recent emotional state */}
                  <div>
                    <h3 className="text-sm text-gray-500 mb-3">Recent Emotional State</h3>
                    {medicationHistory.length === 0 ? (
                      <p className="text-sm text-gray-400">No analysis data available</p>
                    ) : (
                      <div className="space-y-3">
                        {medicationHistory.slice(-3).reverse().map((item, index) => {
                          const emotionEmojis = {
                            happy: '😊',
                            sad: '😔',
                            angry: '😠',
                            fearful: '😨',
                            disgusted: '🤢',
                            surprised: '😲',
                            neutral: '😐'
                          };
                          
                          const colorMap = {
                            happy: 'bg-green-500',
                            sad: 'bg-blue-500',
                            angry: 'bg-red-500',
                            fearful: 'bg-yellow-500',
                            disgusted: 'bg-green-600',
                            surprised: 'bg-orange-500',
                            neutral: 'bg-gray-500'
                          };
                          
                          return (
                            <div key={index} className="flex items-center justify-between">
                              <div className="flex items-center">
                                <span className="text-xl mr-2">{emotionEmojis[item.emotion] || '❓'}</span>
                                <span className="font-medium capitalize">{item.emotion}</span>
                              </div>
                              <div className="flex items-center">
                                <div className="w-24 h-2 bg-gray-200 rounded-full mr-2 overflow-hidden">
                                  <div className={`h-full ${colorMap[item.emotion]} rounded-full`} style={{ width: `${item.confidence}%` }}></div>
                                </div>
                                <span className="text-xs text-gray-500">{item.date}</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
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
            {selectedPatient ? (
              <div className="space-y-8">
                {/* Emotional trends chart */}
                <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg">
                  <h2 className="text-xl font-semibold mb-4">Emotional Trends</h2>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={emotionData}
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis domain={[0, 1]} />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" dataKey="depression" stroke="#f87171" activeDot={{ r: 8 }} />
                        <Line type="monotone" dataKey="aggression" stroke="#60a5fa" activeDot={{ r: 8 }} />
                        <Line type="monotone" dataKey="anxiety" stroke="#c084fc" activeDot={{ r: 8 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="mt-4 flex justify-center space-x-8">
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-red-400 rounded-full mr-2"></div>
                      <span className="text-sm text-gray-600">Depression</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-blue-400 rounded-full mr-2"></div>
                      <span className="text-sm text-gray-600">Aggression</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-purple-400 rounded-full mr-2"></div>
                      <span className="text-sm text-gray-600">Anxiety</span>
                    </div>
                  </div>
                </div>
                
                {/* Patient summary */}
                {patientStats && (
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 shadow-lg">
                      <h3 className="text-sm font-medium text-gray-500">Total Sessions</h3>
                      <p className="mt-1 text-2xl font-semibold">{patientStats.totalSessions}</p>
                    </div>
                    <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 shadow-lg">
                      <h3 className="text-sm font-medium text-gray-500">Dominant Emotion</h3>
                      <p className="mt-1 text-2xl font-semibold capitalize">{patientStats.dominantEmotion}</p>
                    </div>
                    <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 shadow-lg">
                      <h3 className="text-sm font-medium text-gray-500">Avg. Aggression</h3>
                      <p className="mt-1 text-2xl font-semibold">{patientStats.avgAggression.toFixed(2)}</p>
                    </div>
                    <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 shadow-lg">
                      <h3 className="text-sm font-medium text-gray-500">Avg. Depression</h3>
                      <p className="mt-1 text-2xl font-semibold">{patientStats.avgDepression.toFixed(2)}</p>
                    </div>
                  </div>
                )}
                
                {/* Medication history */}
                <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg">
                  <h2 className="text-xl font-semibold mb-4">💊 Medication History (from Analyses)</h2>
                  {medicationHistory.length === 0 ? (
                    <p className="text-gray-500 text-center py-4">No medication history available</p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date & Time</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Emotion</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Medication</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dosage</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Confidence</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {[...medicationHistory].reverse().map((med, index) => {
                            const emotionEmojis = {
                              happy: '😊',
                              sad: '😔',
                              angry: '😠',
                              fearful: '😨',
                              disgusted: '🤢',
                              surprised: '😲',
                              neutral: '😐'
                            };

                            const emotionColors = {
                              happy: 'bg-green-100 text-green-800',
                              sad: 'bg-blue-100 text-blue-800',
                              angry: 'bg-red-100 text-red-800',
                              fearful: 'bg-purple-100 text-purple-800',
                              disgusted: 'bg-green-600 text-green-100',
                              surprised: 'bg-orange-100 text-orange-800',
                              neutral: 'bg-gray-100 text-gray-800'
                            };

                            return (
                              <tr key={index} className="hover:bg-gray-50 transition">
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">{med.date}</td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${emotionColors[med.emotion]}`}>
                                    <span>{emotionEmojis[med.emotion]}</span>
                                    <span className="capitalize">{med.emotion}</span>
                                  </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">{med.medication}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{med.dosage}</td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="flex items-center gap-2">
                                    <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                                      <div 
                                        className="h-full bg-blue-500 rounded-full" 
                                        style={{ width: `${med.confidence}%` }}
                                      ></div>
                                    </div>
                                    <span className="text-xs font-bold text-gray-700">{med.confidence}%</span>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                {/* Emotion Analysis History */}
                <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg">
                  <h2 className="text-xl font-semibold mb-4">📊 Complete Emotion Analysis History</h2>
                  {emotionData.length === 0 ? (
                    <p className="text-gray-500">No analysis data available</p>
                  ) : (
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      {emotionData.map((data, index) => {
                        // Reconstruct emotion from data
                        const emotions = {
                          happy: { emoji: '😊', color: 'bg-green-100 text-green-800', borderColor: 'border-green-300' },
                          sad: { emoji: '😔', color: 'bg-blue-100 text-blue-800', borderColor: 'border-blue-300' },
                          angry: { emoji: '😠', color: 'bg-red-100 text-red-800', borderColor: 'border-red-300' },
                          fearful: { emoji: '😨', color: 'bg-purple-100 text-purple-800', borderColor: 'border-purple-300' },
                          neutral: { emoji: '😐', color: 'bg-gray-100 text-gray-800', borderColor: 'border-gray-300' }
                        };

                        // Determine emotion from highest value
                        const emotionValues = {
                          happy: data.happy || (1 - data.depression - data.aggression - (data.anxiety || 0)) / 3,
                          sad: data.depression || 0,
                          angry: data.aggression || 0,
                          fearful: data.anxiety || 0,
                          neutral: data.neutral || 0
                        };

                        const dominantEmotion = Object.keys(emotionValues).reduce((a, b) =>
                          emotionValues[a] > emotionValues[b] ? a : b
                        );

                        const emotionInfo = emotions[dominantEmotion] || emotions.neutral;
                        const confidence = Math.round(emotionValues[dominantEmotion] * 100);

                        return (
                          <div key={index} className={`border-l-4 ${emotionInfo.borderColor} pl-4 py-3 rounded-r-lg ${emotionInfo.color}`}>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <span className="text-2xl">{emotionInfo.emoji}</span>
                                <div>
                                  <p className="font-semibold capitalize">{dominantEmotion}</p>
                                  <p className="text-xs opacity-75">Analysis #{index + 1}</p>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="font-bold text-lg">{confidence}%</p>
                                <p className="text-xs opacity-75">{data.date}</p>
                              </div>
                            </div>
                            {/* Emotion breakdown */}
                            <div className="mt-2 flex gap-2 text-xs">
                              <span className="px-2 py-1 bg-white/30 rounded">Depression: {Math.round((data.depression || 0) * 100)}%</span>
                              <span className="px-2 py-1 bg-white/30 rounded">Aggression: {Math.round((data.aggression || 0) * 100)}%</span>
                              <span className="px-2 py-1 bg-white/30 rounded">Anxiety: {Math.round((data.anxiety || 0) * 100)}%</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Medical prescription */}
                <MedicalPrescription 
                  patientId={selectedPatient.patientId}
                  emotionData={emotionData}
                />
              </div>
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center p-12">
                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No patient selected</h3>
                  <p className="mt-1 text-sm text-gray-500">Select a patient from the list to view their details.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default DoctorDashboard;
