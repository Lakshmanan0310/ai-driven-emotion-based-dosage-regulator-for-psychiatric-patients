import React from 'react';

const MedicalPrescription = ({ emotionData, patientData }) => {
  // Determine prescription based on emotion data
  const getPrescriptionSuggestion = () => {
    const { emotion, aggression, depression, anxiety } = emotionData;
    
    if (depression > 0.6) {
      return {
        medication: 'Fluoxetine',
        dosage: depression > 0.8 ? '40mg' : '20mg',
        reason: 'Depression',
        notes: 'Take once daily in the morning. May take 2-4 weeks for full effect.',
        severity: 'High'
      };
    } else if (anxiety > 0.6) {
      return {
        medication: 'Buspirone',
        dosage: anxiety > 0.8 ? '10mg' : '5mg',
        reason: 'Anxiety',
        notes: 'Take twice daily. Avoid caffeine and alcohol.',
        severity: 'Medium'
      };
    } else if (aggression > 0.6) {
      return {
        medication: 'Olanzapine',
        dosage: aggression > 0.8 ? '10mg' : '5mg',
        reason: 'Aggression',
        notes: 'Take once daily in the evening. Monitor for sedation.',
        severity: 'High'
      };
    } else if (depression > 0.4 && anxiety > 0.4) {
      return {
        medication: 'Fluoxetine + Lorazepam',
        dosage: '20mg + 0.5mg',
        reason: 'Depression + Anxiety',
        notes: 'Fluoxetine: daily in morning. Lorazepam: as needed for anxiety, max 3 times daily.',
        severity: 'Medium'
      };
    } else {
      return {
        medication: 'No medication needed',
        dosage: '',
        reason: 'Stable mood',
        notes: 'Continue monitoring. Recommend regular therapy sessions.',
        severity: 'Normal'
      };
    }
  };
  
  const prescription = getPrescriptionSuggestion();
  
  // Get color based on severity
  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'High': return 'bg-red-100 text-red-800';
      case 'Medium': return 'bg-yellow-100 text-yellow-800';
      case 'Normal': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };
  
  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg mb-8">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-semibold text-gray-800">Medical Prescription</h3>
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(prescription.severity)}`}>
          {prescription.severity}
        </span>
      </div>
      
      <div className="p-4 border border-gray-200 rounded-lg">
        <p className="font-medium">{prescription.medication}</p>
        {prescription.dosage && <p className="text-gray-700">{prescription.dosage}</p>}
        <p className="text-gray-500 text-sm">{prescription.notes}</p>
        
        <div className="mt-4">
          <p className="text-sm text-gray-700 font-medium">Reason for Prescription:</p>
          <p className="text-sm text-gray-600">{prescription.reason}</p>
        </div>
      </div>
    </div>
  );
};

export default MedicalPrescription;
