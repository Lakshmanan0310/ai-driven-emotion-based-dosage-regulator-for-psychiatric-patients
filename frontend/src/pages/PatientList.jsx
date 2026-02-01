// src/components/PatientList.jsx
import React from 'react';
import { FaSearch } from 'react-icons/fa';

const PatientList = ({ patients, selectedPatient, onSelectPatient, searchQuery, onSearchChange }) => {
  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="p-4 border-b">
        <div className="relative">
          <input
            type="text"
            placeholder="Search patients..."
            className="w-full pl-10 pr-4 py-2 border rounded-lg"
            value={searchQuery}
            onChange={onSearchChange}
          />
          <div className="absolute left-3 top-2.5 text-gray-400">
            <FaSearch />
          </div>
        </div>
      </div>
      <ul className="divide-y divide-gray-200 max-h-[calc(100vh-220px)] overflow-y-auto">
        {patients.map((patient) => (
          <li 
            key={patient.patientId}
            className={`p-4 cursor-pointer hover:bg-gray-50 ${selectedPatient?.patientId === patient.patientId ? 'bg-blue-50' : ''}`}
            onClick={() => onSelectPatient(patient)}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="flex-shrink-0 h-10 w-10 bg-gray-200 rounded-full flex items-center justify-center text-gray-500 font-bold">
                  {patient.id}
                </div>
                <div className="ml-4">
                  <div className="font-medium">{patient.name}</div>
                  <div className="text-sm text-gray-500">{patient.age} yrs, {patient.gender}</div>
                </div>
              </div>
              {patient.concern && (
                <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                  patient.concern === 'High' ? 'bg-red-100 text-red-800' : 
                  patient.concern === 'Medium' ? 'bg-yellow-100 text-yellow-800' : 
                  'bg-green-100 text-green-800'
                }`}>
                  Concern
                </div>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default PatientList;