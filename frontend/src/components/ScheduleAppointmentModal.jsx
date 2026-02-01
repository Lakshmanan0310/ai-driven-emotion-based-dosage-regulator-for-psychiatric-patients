import React, { useState } from 'react';
import { FaTimes, FaCalendar, FaClock, FaVideo, FaClinicMedical, FaHome } from 'react-icons/fa';
import { useTheme } from '../ThemeContext';

const ScheduleAppointmentModal = ({ patient, onClose, onSchedule }) => {
  const { currentTheme, themes } = useTheme();
  const theme = themes[currentTheme];
  
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  // Format date to YYYY-MM-DD for input
  const formatDateForInput = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };
  
  const [appointmentType, setAppointmentType] = useState('video');
  const [appointmentDate, setAppointmentDate] = useState(formatDateForInput(tomorrow));
  const [appointmentTime, setAppointmentTime] = useState('09:00');
  const [duration, setDuration] = useState('30');
  const [notes, setNotes] = useState('');
  const [isScheduling, setIsScheduling] = useState(false);
  const [scheduleSuccess, setScheduleSuccess] = useState(false);
  
  const handleSchedule = async () => {
    setIsScheduling(true);
    
    try {
      // In a real application, this would be an API call
      // Simulate API call with timeout
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Format the appointment data
      const appointmentData = {
        patientId: patient.patientId,
        patientName: patient.name,
        type: appointmentType,
        date: appointmentDate,
        time: appointmentTime,
        duration: parseInt(duration),
        notes: notes,
        doctorName: 'Dr. Smith', // In a real app, this would come from auth context
        status: 'scheduled',
        createdAt: new Date().toISOString()
      };
      
      // Call the onSchedule callback with the appointment data
      if (onSchedule) {
        onSchedule(appointmentData);
      }
      
      setScheduleSuccess(true);
      
      // Close the modal after showing success message
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (error) {
      console.error('Error scheduling appointment:', error);
    } finally {
      setIsScheduling(false);
    }
  };
  
  const getAppointmentTypeIcon = () => {
    switch (appointmentType) {
      case 'video':
        return <FaVideo className="mr-2" />;
      case 'in-person':
        return <FaClinicMedical className="mr-2" />;
      case 'home':
        return <FaHome className="mr-2" />;
      default:
        return <FaVideo className="mr-2" />;
    }
  };
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className={`${theme.cardBg} rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto`}>
        {/* Header */}
        <div className={`px-6 py-4 border-b ${theme.border} flex justify-between items-center`}>
          <h2 className={`text-xl font-semibold ${theme.text}`}>Schedule Appointment</h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <FaTimes />
          </button>
        </div>
        
        {/* Content */}
        <div className="p-6">
          {scheduleSuccess ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className={`text-lg font-medium ${theme.text} mb-2`}>Appointment Scheduled!</h3>
              <p className={`${theme.subtext} mb-2`}>
                Your appointment with {patient.name} has been scheduled for:
              </p>
              <p className={`font-medium ${theme.text}`}>
                {new Date(appointmentDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} at {appointmentTime}
              </p>
            </div>
          ) : (
            <>
              <div className="mb-6">
                <div className={`flex items-center mb-4 ${theme.text}`}>
                  <div className={`w-12 h-12 rounded-full ${theme.accentBg} flex items-center justify-center mr-4`}>
                    {patient.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <h3 className="font-medium text-lg">{patient.name}</h3>
                    <p className={`text-sm ${theme.subtext}`}>Patient ID: {patient.patientId}</p>
                  </div>
                </div>
                
                <div className="mb-4">
                  <label className={`block text-sm font-medium mb-2 ${theme.text}`}>
                    Appointment Type
                  </label>
                  <div className="flex space-x-2">
                    <button
                      type="button"
                      onClick={() => setAppointmentType('video')}
                      className={`flex items-center px-3 py-2 rounded-md ${
                        appointmentType === 'video' 
                          ? `${theme.accent} ${theme.accentBg} text-white` 
                          : `${theme.border} ${theme.text} hover:bg-gray-100`
                      }`}
                    >
                      <FaVideo className="mr-2" />
                      Video Call
                    </button>
                    <button
                      type="button"
                      onClick={() => setAppointmentType('in-person')}
                      className={`flex items-center px-3 py-2 rounded-md ${
                        appointmentType === 'in-person' 
                          ? `${theme.accent} ${theme.accentBg} text-white` 
                          : `${theme.border} ${theme.text} hover:bg-gray-100`
                      }`}
                    >
                      <FaClinicMedical className="mr-2" />
                      In-Person
                    </button>
                    <button
                      type="button"
                      onClick={() => setAppointmentType('home')}
                      className={`flex items-center px-3 py-2 rounded-md ${
                        appointmentType === 'home' 
                          ? `${theme.accent} ${theme.accentBg} text-white` 
                          : `${theme.border} ${theme.text} hover:bg-gray-100`
                      }`}
                    >
                      <FaHome className="mr-2" />
                      Home Visit
                    </button>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${theme.text}`}>
                      <FaCalendar className="inline mr-2" />
                      Date
                    </label>
                    <input
                      type="date"
                      value={appointmentDate}
                      onChange={(e) => setAppointmentDate(e.target.value)}
                      min={formatDateForInput(today)}
                      className={`w-full px-3 py-2 border ${theme.border} rounded-md ${theme.input}`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${theme.text}`}>
                      <FaClock className="inline mr-2" />
                      Time
                    </label>
                    <input
                      type="time"
                      value={appointmentTime}
                      onChange={(e) => setAppointmentTime(e.target.value)}
                      className={`w-full px-3 py-2 border ${theme.border} rounded-md ${theme.input}`}
                    />
                  </div>
                </div>
                
                <div className="mb-4">
                  <label className={`block text-sm font-medium mb-2 ${theme.text}`}>
                    Duration
                  </label>
                  <select
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    className={`w-full px-3 py-2 border ${theme.border} rounded-md ${theme.input}`}
                  >
                    <option value="15">15 minutes</option>
                    <option value="30">30 minutes</option>
                    <option value="45">45 minutes</option>
                    <option value="60">1 hour</option>
                    <option value="90">1.5 hours</option>
                  </select>
                </div>
                
                <div className="mb-4">
                  <label className={`block text-sm font-medium mb-2 ${theme.text}`}>
                    Notes (Optional)
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className={`w-full px-3 py-2 border ${theme.border} rounded-md ${theme.input} min-h-[80px]`}
                    placeholder="Add notes about the appointment (reason, topics to discuss, etc.)"
                  />
                </div>
              </div>
              
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={onClose}
                  className={`px-4 py-2 border ${theme.border} rounded-md ${theme.text} hover:bg-gray-100`}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSchedule}
                  disabled={isScheduling || !appointmentDate || !appointmentTime}
                  className={`px-4 py-2 ${theme.accent} ${theme.accentBg} text-white rounded-md hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center`}
                >
                  {isScheduling ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Scheduling...
                    </>
                  ) : (
                    <>
                      {getAppointmentTypeIcon()}
                      Schedule {appointmentType === 'video' ? 'Video Call' : appointmentType === 'in-person' ? 'In-Person Visit' : 'Home Visit'}
                    </>
                  )}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ScheduleAppointmentModal;
