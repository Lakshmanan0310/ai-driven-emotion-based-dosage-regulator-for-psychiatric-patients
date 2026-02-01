import React, { useState } from 'react';
import { FaSearch } from 'react-icons/fa';

const PatientList = ({ patients, selectedPatient, onSelectPatient, searchQuery, onSearchChange }) => {
  const [statusFilter, setStatusFilter] = useState('All Statuses');
  
  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'Stable': return 'bg-green-100 text-green-800';
      case 'Concern': return 'bg-yellow-100 text-yellow-800';
      case 'Alert': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };
  
  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg overflow-hidden">
      <div className="p-6">
        <h2 className="text-xl font-semibold mb-4">Patient List</h2>
        
        <div className="space-y-4">
          {/* Search input */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search patients by name"
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={searchQuery}
              onChange={onSearchChange}
            />
            <div className="absolute left-3 top-2.5 text-gray-400">
              <FaSearch />
            </div>
          </div>
          
          {/* Status filter */}
          <select 
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option>All Statuses</option>
            <option>Stable</option>
            <option>Concern</option>
            <option>Alert</option>
          </select>
        </div>
      </div>
      
      {/* Patient list */}
      <div className="overflow-hidden">
        {/* Column headers */}
        <div className="grid grid-cols-3 text-xs font-medium text-gray-500 mb-2 px-4">
          <div>PATIENT</div>
          <div className="text-center">STATUS</div>
          <div className="text-right">DATE</div>
        </div>
        
        {/* Patient items */}
        <div className="space-y-2 max-h-[500px] overflow-y-auto p-4">
          {patients.map((patient) => {
            // Apply status filter
            if (statusFilter !== 'All Statuses' && patient.status !== statusFilter) {
              return null;
            }
            
            return (
              <div 
                key={patient.patientId}
                onClick={() => onSelectPatient(patient)}
                className={`flex items-center p-2 rounded-lg cursor-pointer hover:bg-gray-50 ${selectedPatient?.patientId === patient.patientId ? 'bg-blue-50 border border-blue-200' : ''}`}
              >
                <div className="flex items-center gap-3 flex-1">
                  <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-700 font-medium">
                    {patient.id}
                  </div>
                  <div>
                    <div className="font-medium text-sm">{patient.name}</div>
                    <div className="text-xs text-gray-500">{patient.age} yrs, {patient.gender}</div>
                  </div>
                </div>
                <div className="flex-1 text-center">
                  <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(patient.status)}`}>
                    {patient.status}
                  </span>
                </div>
                <div className="flex-1 text-right text-xs text-gray-500">
                  {patient.lastCheckIn}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default PatientList;
