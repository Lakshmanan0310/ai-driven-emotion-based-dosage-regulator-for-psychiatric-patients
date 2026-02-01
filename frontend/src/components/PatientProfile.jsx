import React from 'react';
import EmotionHistoryDisplay from './EmotionHistoryDisplay';

const PatientProfile = ({ patient }) => {
  if (!patient) return null;
  
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-bold mb-4">{patient.name}</h2>
      
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
          <p className="font-medium">{patient.diagnosis || 'Major Depressive Disorder'}</p>
        </div>
        <div>
          <h3 className="text-sm text-gray-500">Current Medication</h3>
          <p className="font-medium">{patient.currentMedication || 'Fluoxetine 20mg'}</p>
        </div>
      </div>
      
      <div className="mb-6">
        <h3 className="text-sm text-gray-500 mb-2">Recent Emotional State</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <span className="text-xl mr-2">😔</span>
              <span className="font-medium">Sad</span>
            </div>
            <div className="flex items-center">
              <div className="w-24 h-2 bg-gray-200 rounded-full mr-2 overflow-hidden">
                <div className="h-full bg-green-500 rounded-full" style={{ width: '70%' }}></div>
              </div>
              <span className="text-xs text-gray-500">21/05/2025</span>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <span className="text-xl mr-2">😔</span>
              <span className="font-medium">Sad</span>
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
                <div className="h-full bg-yellow-500 rounded-full" style={{ width: '40%' }}></div>
              </div>
              <span className="text-xs text-gray-500">19/05/2025</span>
            </div>
          </div>
        </div>
      </div>

      {/* Emotion History from Database */}
      <div className="mb-6">
        <EmotionHistoryDisplay patientId={patient.patientId || patient.id || patient._id} />
      </div>
      
      <div className="flex gap-2">
        <button className="flex-1 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 text-sm">
          View Full Profile
        </button>
        <button className="flex-1 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 text-sm">
          Schedule Session
        </button>
      </div>
    </div>
  );
};

export default PatientProfile;
