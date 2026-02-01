import React, { useState, useEffect } from 'react';
import { FaPills, FaEdit, FaCheck, FaTimes, FaHistory, FaFilePdf, FaFileExport } from 'react-icons/fa';
import { medicationService, sessionService } from '../services/api';

const MedicationRecommendation = ({ patientId, doctorMode = false }) => {
  const [medicationHistory, setMedicationHistory] = useState([]);
  const [currentRecommendation, setCurrentRecommendation] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedMedication, setEditedMedication] = useState({
    medication: '',
    dosage: '',
    notes: ''
  });
  const [showHistory, setShowHistory] = useState(false);
  
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Get sessions which contain medication recommendations
        const sessions = await sessionService.getSessions(patientId);
        
        // Filter sessions with medication recommendations
        const sessionsWithMeds = sessions.filter(session => 
          session.medicationRecommended || session.recommendation
        );
        
        // Convert sessions to medication history format
        const history = sessionsWithMeds.map(session => ({
          patientId: session.patientId,
          medication: session.medicationRecommended?.medication || session.recommendation || 'No medication',
          dosage: session.medicationRecommended?.dosage || '',
          timestamp: session.timestamp,
          reason: `Based on ${session.emotion} emotion`,
          notes: session.medicationRecommended?.notes || '',
          emotion: session.emotion,
          emotionIntensity: session.emotionIntensity,
          sessionId: session._id || session.id
        }));
        
        setMedicationHistory(history);
        
        // Set current recommendation from the most recent session with medication
        if (sessionsWithMeds.length > 0) {
          const latestSession = sessionsWithMeds[0]; // Assuming sorted by date desc
          setCurrentRecommendation({
            medication: latestSession.medicationRecommended?.medication || latestSession.recommendation || 'No medication',
            dosage: latestSession.medicationRecommended?.dosage || '',
            notes: latestSession.medicationRecommended?.notes || '',
            timestamp: latestSession.timestamp,
            emotion: latestSession.emotion,
            emotionIntensity: latestSession.emotionIntensity,
            sessionId: latestSession._id || latestSession.id
          });
        }
      } catch (err) {
        console.error('Error fetching medication data:', err);
        setError('Failed to load medication data');
      } finally {
        setIsLoading(false);
      }
    };
    
    if (patientId) {
      fetchData();
    }
  }, [patientId]);
  
  // Handle medication edit
  const handleEditToggle = () => {
    if (isEditing) {
      setIsEditing(false);
    } else {
      setEditedMedication({
        medication: currentRecommendation?.medication || '',
        dosage: currentRecommendation?.dosage || '',
        notes: currentRecommendation?.notes || ''
      });
      setIsEditing(true);
    }
  };
  
  // Handle input change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedMedication(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Save edited medication
  const handleSaveMedication = async () => {
    if (!currentRecommendation?.sessionId) return;
    
    setIsLoading(true);
    try {
      // Update medication recommendation
      await medicationService.updateRecommendation(currentRecommendation.sessionId, {
        ...editedMedication,
        doctorOverride: true
      });
      
      // Update local state
      setCurrentRecommendation(prev => ({
        ...prev,
        medication: editedMedication.medication,
        dosage: editedMedication.dosage,
        notes: editedMedication.notes,
        doctorOverride: true
      }));
      
      setIsEditing(false);
    } catch (err) {
      console.error('Error updating medication:', err);
      setError('Failed to update medication recommendation');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Export medication history
  const handleExport = async (format) => {
    try {
      const response = await sessionService.exportSessions(patientId, format);
      
      if (response && response.url) {
        // Open in new tab
        window.open(`/api${response.url}`, '_blank');
      }
    } catch (err) {
      console.error(`Error exporting ${format}:`, err);
      setError(`Failed to export ${format}`);
    }
  };
  
  // Format date
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };
  
  // Render loading state
  if (isLoading && !currentRecommendation) {
    return (
      <div className="flex justify-center items-center h-48">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  // Render error state
  if (error && !currentRecommendation) {
    return (
      <div className="bg-red-50 p-4 rounded-lg text-red-700">
        <p className="font-medium">Error loading medication data</p>
        <p className="text-sm">{error}</p>
      </div>
    );
  }
  
  // Render no data state
  if (!currentRecommendation) {
    return (
      <div className="bg-blue-50 p-4 rounded-lg text-blue-700">
        <p className="font-medium">No medication data available</p>
        <p className="text-sm">This patient hasn't received any medication recommendations yet.</p>
        <p className="text-sm mt-2">Complete an emotion analysis to receive medication recommendations.</p>
      </div>
    );
  }
  
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-start mb-6">
        <h3 className="text-lg font-semibold flex items-center">
          <FaPills className="mr-2 text-blue-600" /> 
          {doctorMode ? 'Medication Management' : 'Your Medication'}
        </h3>
        
        {doctorMode && (
          <div className="flex gap-2">
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="text-gray-600 hover:text-blue-600 flex items-center text-sm"
            >
              <FaHistory className="mr-1" /> {showHistory ? 'Hide History' : 'Show History'}
            </button>
            <button
              onClick={() => handleExport('pdf')}
              className="text-gray-600 hover:text-blue-600 flex items-center text-sm"
            >
              <FaFilePdf className="mr-1" /> PDF
            </button>
            <button
              onClick={() => handleExport('csv')}
              className="text-gray-600 hover:text-blue-600 flex items-center text-sm"
            >
              <FaFileExport className="mr-1" /> CSV
            </button>
          </div>
        )}
      </div>
      
      <div className="bg-blue-50 rounded-lg p-5 mb-6">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm text-blue-700 mb-1">Current Recommendation</p>
            {!isEditing ? (
              <>
                <h4 className="text-xl font-bold text-gray-800">
                  {currentRecommendation.medication} {currentRecommendation.dosage}
                </h4>
                <p className="text-gray-600 mt-1">{currentRecommendation.notes}</p>
                <p className="text-sm text-gray-500 mt-2">
                  Based on {currentRecommendation.emotion} emotion ({currentRecommendation.emotionIntensity}% intensity) 
                  on {formatDate(currentRecommendation.timestamp)}
                </p>
              </>
            ) : (
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Medication</label>
                  <input
                    type="text"
                    name="medication"
                    value={editedMedication.medication}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Dosage</label>
                  <input
                    type="text"
                    name="dosage"
                    value={editedMedication.dosage}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Notes</label>
                  <textarea
                    name="notes"
                    value={editedMedication.notes}
                    onChange={handleInputChange}
                    rows={2}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  />
                </div>
              </div>
            )}
          </div>
          
          {doctorMode && (
            <div>
              {!isEditing ? (
                <button
                  onClick={handleEditToggle}
                  className="text-blue-600 hover:text-blue-800 flex items-center"
                >
                  <FaEdit className="mr-1" /> Override
                </button>
              ) : (
                <div className="flex gap-2">
                  <button
                    onClick={handleSaveMedication}
                    className="bg-green-600 text-white p-2 rounded-md hover:bg-green-700"
                  >
                    <FaCheck />
                  </button>
                  <button
                    onClick={handleEditToggle}
                    className="bg-red-600 text-white p-2 rounded-md hover:bg-red-700"
                  >
                    <FaTimes />
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      
      {showHistory && (
        <div>
          <h4 className="font-medium text-gray-700 mb-3">Medication History</h4>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Medication</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dosage</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Notes</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Emotion</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {medicationHistory.map((med, index) => (
                  <tr key={index} className={index === 0 ? 'bg-blue-50' : ''}>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(med.timestamp)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                      {med.medication}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                      {med.dosage}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500 max-w-xs truncate">
                      {med.notes}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                      {med.emotion} ({med.emotionIntensity}%)
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      
      {!doctorMode && (
        <div className="mt-6">
          <h4 className="font-medium text-gray-700 mb-2">Important Information</h4>
          <ul className="list-disc pl-5 text-sm text-gray-600 space-y-1">
            <li>Take your medication exactly as prescribed by your doctor.</li>
            <li>Do not adjust dosage without consulting your healthcare provider.</li>
            <li>Report any side effects during your next check-in or appointment.</li>
            <li>This recommendation is based on your emotional state and may be adjusted by your doctor.</li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default MedicationRecommendation;
