import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaHome, FaArrowLeft, FaSignOutAlt, FaEdit } from 'react-icons/fa';
import { useTheme, ThemeSwitcher } from '../ThemeContext';

const PatientProfilePage = () => {
  const { patientId } = useParams();
  const navigate = useNavigate();
  const [patient, setPatient] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const { currentTheme, themes } = useTheme();
  const theme = themes[currentTheme];

  useEffect(() => {
    // In a real app, this would fetch from your API
    // For now, we'll use mock data
    const fetchPatient = async () => {
      try {
        setIsLoading(true);
        // Mock patient data
        const mockPatient = {
          id: patientId || '123',
          name: 'John Doe',
          age: 32,
          gender: 'Male',
          diagnosis: 'Major Depressive Disorder',
          currentMedication: 'Fluoxetine 20mg',
          contactInfo: {
            email: 'john.doe@example.com',
            phone: '+1 (555) 123-4567',
            address: '123 Main St, Anytown, USA'
          },
          emergencyContact: {
            name: 'Jane Doe',
            relationship: 'Spouse',
            phone: '+1 (555) 987-6543'
          },
          medicalHistory: [
            { condition: 'Hypertension', diagnosedYear: 2018, status: 'Ongoing' },
            { condition: 'Anxiety Disorder', diagnosedYear: 2020, status: 'Ongoing' }
          ],
          allergies: ['Penicillin', 'Peanuts']
        };
        
        setPatient(mockPatient);
        setIsLoading(false);
      } catch (err) {
        console.error('Error fetching patient:', err);
        setError('Failed to load patient profile');
        setIsLoading(false);
      }
    };
    
    fetchPatient();
  }, [patientId]);

  const handleBackToDashboard = () => {
    navigate(`/patient/${patientId}`);
  };

  const handleLogout = () => {
    navigate('/');
  };

  return (
    <div className={`min-h-screen ${theme.background}`}>
      {/* Header */}
      <header className={`${theme.header}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className={`text-2xl font-bold ${theme.text}`}>Patient Profile</h1>
          <div className="flex items-center space-x-4">
            <ThemeSwitcher className="mr-2" />
            <button
              onClick={handleBackToDashboard}
              className={`${theme.subtext} hover:${theme.accent} flex items-center`}
            >
              <FaHome className="mr-1" /> Dashboard
            </button>
            <button
              onClick={handleLogout}
              className={`${theme.subtext} hover:text-red-500 flex items-center`}
            >
              <FaSignOutAlt className="mr-1" /> Logout
            </button>
          </div>
        </div>
      </header>
      
      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button
          onClick={handleBackToDashboard}
          className={`mb-6 flex items-center ${theme.accent} hover:${theme.accentHover}`}
        >
          <FaArrowLeft className="mr-2" /> Back to Dashboard
        </button>
        
        {isLoading ? (
          <div className={`${theme.cardBg} rounded-lg shadow p-6 flex justify-center`}>
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        ) : error ? (
          <div className={`${theme.cardBg} rounded-lg shadow p-6 text-red-600`}>{error}</div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1">
              <div className={`${theme.cardBg} rounded-lg shadow p-6`}>
                <div className="flex justify-center mb-6">
                  <div className="w-32 h-32 rounded-full bg-blue-100 flex items-center justify-center text-blue-500 text-4xl font-bold">
                    {patient.name.charAt(0)}
                  </div>
                </div>
                <h2 className={`text-xl font-bold text-center mb-4 ${theme.text}`}>{patient.name}</h2>
                
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div>
                    <h3 className="text-sm text-gray-500">Age</h3>
                    <p className="font-medium">{patient.age} years</p>
                  </div>
                  <div>
                    <h3 className="text-sm text-gray-500">Gender</h3>
                    <p className="font-medium">{patient.gender}</p>
                  </div>
                  <div>
                    <h3 className="text-sm text-gray-500">Diagnosis</h3>
                    <p className="font-medium">{patient.diagnosis}</p>
                  </div>
                  <div>
                    <h3 className="text-sm text-gray-500">Current Medication</h3>
                    <p className="font-medium">{patient.currentMedication}</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="lg:col-span-2">
              <div className={`${theme.cardBg} rounded-lg shadow overflow-hidden mb-6`}>
                <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                  <h2 className={`text-lg font-medium ${theme.text}`}>Contact Information</h2>
                  <button className="text-blue-600 hover:text-blue-800 flex items-center text-sm">
                    <FaEdit className="mr-1" /> Edit
                  </button>
                </div>
                
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className={`text-sm ${theme.subtext}`}>Email</p>
                      <p className={`font-medium ${theme.text}`}>{patient.contactInfo.email}</p>
                    </div>
                    <div>
                      <p className={`text-sm ${theme.subtext}`}>Phone</p>
                      <p className={`font-medium ${theme.text}`}>{patient.contactInfo.phone}</p>
                    </div>
                    <div className="md:col-span-2">
                      <p className={`text-sm ${theme.subtext}`}>Address</p>
                      <p className={`font-medium ${theme.text}`}>{patient.contactInfo.address}</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className={`${theme.cardBg} rounded-lg shadow overflow-hidden mb-6`}>
                <div className={`px-6 py-4 border-b ${theme.border}`}>
                  <h2 className={`text-lg font-medium ${theme.text}`}>Emergency Contact</h2>
                </div>
                
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <p className={`text-sm ${theme.subtext}`}>Name</p>
                      <p className={`font-medium ${theme.text}`}>{patient.emergencyContact.name}</p>
                    </div>
                    <div>
                      <p className={`text-sm ${theme.subtext}`}>Relationship</p>
                      <p className={`font-medium ${theme.text}`}>{patient.emergencyContact.relationship}</p>
                    </div>
                    <div>
                      <p className={`text-sm ${theme.subtext}`}>Phone</p>
                      <p className={`font-medium ${theme.text}`}>{patient.emergencyContact.phone}</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className={`${theme.cardBg} rounded-lg shadow overflow-hidden mb-6`}>
                <div className={`px-6 py-4 border-b ${theme.border}`}>
                  <h2 className={`text-lg font-medium ${theme.text}`}>Medical History</h2>
                </div>
                
                <div className="p-6">
                  {patient.medicalHistory.length > 0 ? (
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Condition</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Diagnosed</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {patient.medicalHistory.map((item, index) => (
                          <tr key={index}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.condition}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.diagnosedYear}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.status}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <p className="text-gray-500">No medical history recorded.</p>
                  )}
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className={`px-6 py-4 border-b ${theme.border}`}>
                  <h2 className={`text-lg font-medium ${theme.text}`}>Allergies</h2>
                </div>
                
                <div className="p-6">
                  {patient.allergies.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {patient.allergies.map((allergy, index) => (
                        <span key={index} className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm">
                          {allergy}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500">No allergies recorded.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default PatientProfilePage;
