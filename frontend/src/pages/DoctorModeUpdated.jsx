import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUserMd, FaChartLine, FaHistory, FaSearch, FaCalendarAlt, FaFileMedical, FaBell } from 'react-icons/fa';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { patientService, sessionService, medicationService } from '../services/api';

const DoctorMode = () => {
  const [patients, setPatients] = useState([
    { id: 'JD', patientId: '123', name: 'John Doe', age: 35, gender: 'Male', status: 'Stable', lastCheckIn: '2025-05-22' },
    { id: 'JS', patientId: '124', name: 'Jane Smith', age: 78, gender: 'Female', status: 'Concern', lastCheckIn: '2025-05-21' },
    { id: 'RJ', patientId: '125', name: 'Robert Johnson', age: 45, gender: 'Male', status: 'Alert', lastCheckIn: '2025-05-20' },
    { id: 'ED', patientId: '126', name: 'Emily Davis', age: 23, gender: 'Female', status: 'Stable', lastCheckIn: '2025-05-19' },
    { id: 'MW', patientId: '127', name: 'Michael Wilson', age: 31, gender: 'Male', status: 'Concern', lastCheckIn: '2025-05-18' }
  ]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [medicationHistory, setMedicationHistory] = useState([
    { date: '01/05/2025', medication: 'Fluoxetine', dosage: '20mg', prescribedFor: 'Depression' },
    { date: '07/05/2025', medication: 'Fluoxetine', dosage: '40mg', prescribedFor: 'Depression (increased)' },
    { date: '15/05/2025', medication: 'Fluoxetine + Lorazepam', dosage: '40mg + 0.5mg', prescribedFor: 'Depression + Anxiety' },
    { date: '19/05/2025', medication: 'Olanzapine', dosage: '5mg', prescribedFor: 'Aggression' }
  ]);
  
  const navigate = useNavigate();
  
  // Mock emotional trend data
  const emotionalTrendData = [
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
  
  // Fetch patient data from server
  useEffect(() => {
    const fetchPatients = async () => {
      try {
        setIsLoading(true);
        // In a real app, fetch from API
        // const data = await patientService.getAll();
        // setPatients(data);
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
    // In a real app, fetch patient details
    // fetchPatientDetails(patient.patientId);
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
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-blue-600">Doctor Dashboard</h1>
          <div className="flex items-center gap-4">
            <div className="relative">
              <FaBell className="text-gray-400 hover:text-blue-500 cursor-pointer text-xl" />
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">2</span>
            </div>
            <div className="flex gap-2">
              <button 
                onClick={() => handleModeSwitch('patient')}
                className="px-3 py-1 rounded-full text-sm border border-blue-500 text-blue-500 hover:bg-blue-50"
              >
                Patient Mode
              </button>
              <button 
                className="px-3 py-1 rounded-full text-sm bg-green-500 text-white hover:bg-green-600"
              >
                Doctor Mode
              </button>
            </div>
          </div>
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Patient list sidebar */}
          <div className="bg-white rounded-lg shadow p-4">
            <h2 className="text-lg font-semibold mb-4">Patient List</h2>
            <div className="relative mb-4">
              <input
                type="text"
                placeholder="Search patients by name"
                value={searchQuery}
                onChange={handleSearchChange}
                className="w-full px-3 py-2 pl-9 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              <FaSearch className="absolute left-3 top-3 text-gray-400" />
            </div>
            <div className="mb-4">
              <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500">
                <option>All Statuses</option>
                <option>Stable</option>
                <option>Concern</option>
                <option>Alert</option>
              </select>
            </div>
            
            <div className="overflow-hidden">
              <div className="grid grid-cols-3 text-xs font-medium text-gray-500 mb-2 px-2">
                <div>PATIENT</div>
                <div className="text-center">STATUS</div>
                <div className="text-right">DATE</div>
              </div>
              
              <div className="space-y-2 max-h-[500px] overflow-y-auto">
                {filteredPatients.map(patient => (
                  <div 
                    key={patient.patientId}
                    onClick={() => handlePatientSelect(patient)}
                    className={`flex items-center p-2 rounded-lg cursor-pointer hover:bg-gray-50 ${
                      selectedPatient?.patientId === patient.patientId ? 'bg-blue-50 border border-blue-200' : ''
                    }`}
                  >
                    <div className="flex items-center gap-3 flex-1">
                      <div className={`w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-700 font-medium`}>
                        {patient.id}
                      </div>
                      <div>
                        <div className="font-medium text-sm">{patient.name}</div>
                        <div className="text-xs text-gray-500">{patient.age} yrs, {patient.gender}</div>
                      </div>
                    </div>
                    <div className="flex-1 text-center">
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        patient.status === 'Stable' ? 'bg-green-100 text-green-800' :
                        patient.status === 'Concern' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {patient.status}
                      </span>
                    </div>
                    <div className="flex-1 text-right text-xs text-gray-500">
                      {patient.lastCheckIn}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          {/* Main content area */}
          <div className="md:col-span-3 space-y-6">
            {!selectedPatient ? (
              <div className="bg-white rounded-lg shadow p-8 text-center">
                <FaUserMd className="text-5xl text-gray-300 mx-auto mb-4" />
                <h2 className="text-xl font-semibold text-gray-700 mb-2">Welcome, Dr. Smith</h2>
                <p className="text-gray-500 mb-4">Select a patient from the list to view their details</p>
              </div>
            ) : (
              <>
                {/* Patient overview card */}
                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <h2 className="text-xl font-bold">{selectedPatient.name}</h2>
                      <p className="text-gray-500">{selectedPatient.age} years, {selectedPatient.gender}</p>
                    </div>
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
                      <div className="text-2xl font-bold text-blue-800">11</div>
                    </div>
                    <div className="bg-purple-50 rounded-lg p-4 text-center">
                      <div className="text-sm font-medium text-purple-700 mb-1">Dominant Emotion</div>
                      <div className="flex items-center justify-center gap-2">
                        <span className="text-xl">😔</span>
                        <span className="text-xl font-bold text-purple-800">Sad</span>
                      </div>
                    </div>
                    <div className="bg-red-50 rounded-lg p-4 text-center">
                      <div className="text-sm font-medium text-red-700 mb-1">Avg. Aggression</div>
                      <div className="text-2xl font-bold text-red-800">44%</div>
                    </div>
                    <div className="bg-blue-50 rounded-lg p-4 text-center">
                      <div className="text-sm font-medium text-blue-700 mb-1">Avg. Depression</div>
                      <div className="text-2xl font-bold text-blue-800">49%</div>
                    </div>
                  </div>
                </div>
                
                {/* Emotional trends chart */}
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-semibold mb-4">Emotional Trends</h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={emotionalTrendData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis domain={[0, 1]} />
                        <Tooltip />
                        <Line type="monotone" dataKey="sadness" stroke="#8884d8" activeDot={{ r: 8 }} />
                        <Line type="monotone" dataKey="anger" stroke="#ff5252" />
                        <Line type="monotone" dataKey="fear" stroke="#4299e1" />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                
                {/* Medication history */}
                <div className="bg-white rounded-lg shadow p-6">
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
                        {medicationHistory.map((med, index) => (
                          <tr key={index}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{med.date}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{med.medication}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{med.dosage}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{med.prescribedFor}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
                
                {/* Medical Prescription */}
                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold">Medical Prescription</h3>
                    <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">Normal</span>
                  </div>
                  <div className="p-4 border border-gray-200 rounded-lg">
                    <p className="font-medium">No medication needed</p>
                    <p className="text-gray-500 text-sm">Continue monitoring</p>
                    <div className="mt-4">
                      <p className="text-sm text-gray-700 font-medium">Reason for Prescription:</p>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default DoctorMode;
