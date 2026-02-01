import React, { useState, useEffect } from 'react';
import { FaTimes, FaCalendarAlt, FaClock, FaVideo, FaPhone, FaCommentAlt } from 'react-icons/fa';
import { useTheme } from '../ThemeContext';
import { doctorService, bookingService } from '../services/api';

const BookingModal = ({ doctor, patientId, onClose, onBookingComplete }) => {
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
  
  const [bookingDate, setBookingDate] = useState(formatDateForInput(tomorrow));
  const [availableTimeSlots, setAvailableTimeSlots] = useState([]);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState('');
  const [consultationType, setConsultationType] = useState('video');
  const [notes, setNotes] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isAvailabilityLoading, setIsAvailabilityLoading] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  
  // Fetch available time slots when date changes
  useEffect(() => {
    const fetchAvailability = async () => {
      try {
        setIsAvailabilityLoading(true);
        setError(null);
        
        const response = await doctorService.getDoctorAvailability(doctor._id, bookingDate);
        
        if (response.available) {
          setAvailableTimeSlots(response.timeSlots);
          setSelectedTimeSlot(response.timeSlots[0] || '');
        } else {
          setAvailableTimeSlots([]);
          setSelectedTimeSlot('');
          setError('No available time slots for the selected date.');
        }
      } catch (err) {
        console.error('Error fetching availability:', err);
        setError('Failed to load availability. Please try again.');
        setAvailableTimeSlots([]);
        setSelectedTimeSlot('');
      } finally {
        setIsAvailabilityLoading(false);
      }
    };
    
    if (bookingDate) {
      fetchAvailability();
    }
  }, [doctor._id, bookingDate]);
  
  const handleBooking = async () => {
    if (!selectedTimeSlot) {
      setError('Please select a time slot.');
      return;
    }
    
    try {
      setIsLoading(true);
      setError(null);
      
      // Calculate end time (30 minutes after start time)
      const [hours, minutes] = selectedTimeSlot.split(':').map(Number);
      let endHours = hours;
      let endMinutes = minutes + 30;
      
      if (endMinutes >= 60) {
        endHours += 1;
        endMinutes -= 60;
      }
      
      const endTime = `${endHours.toString().padStart(2, '0')}:${endMinutes.toString().padStart(2, '0')}`;
      
      const bookingData = {
        patientId,
        doctorId: doctor._id,
        bookingDate,
        startTime: selectedTimeSlot,
        endTime,
        consultationType,
        patientNotes: notes,
        fee: doctor.consultationFee,
        isPaid: true // In a real app, this would be set after payment processing
      };
      
      await bookingService.createBooking(bookingData);
      
      setBookingSuccess(true);
      
      // Notify parent component
      setTimeout(() => {
        if (onBookingComplete) {
          onBookingComplete();
        }
      }, 2000);
    } catch (err) {
      console.error('Error creating booking:', err);
      setError('Failed to book appointment. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className={`${theme.cardBg} rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto`}>
        {/* Header */}
        <div className={`px-6 py-4 border-b ${theme.border} flex justify-between items-center sticky top-0 ${theme.cardBg} z-10`}>
          <h2 className={`text-xl font-semibold ${theme.text}`}>Book Consultation</h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <FaTimes />
          </button>
        </div>
        
        {/* Content */}
        <div className="p-6">
          {bookingSuccess ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className={`text-lg font-medium ${theme.text} mb-2`}>Booking Confirmed!</h3>
              <p className={`${theme.subtext} mb-2`}>
                Your consultation with {doctor.fullName} has been scheduled for:
              </p>
              <p className={`font-medium ${theme.text} mb-4`}>
                {new Date(bookingDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} at {selectedTimeSlot}
              </p>
              <p className={`text-sm ${theme.subtext}`}>
                You can view your booking details and join the consultation from the "My Bookings" section.
              </p>
            </div>
          ) : (
            <>
              <div className="mb-6">
                <div className={`flex items-center mb-4 ${theme.text}`}>
                  <img 
                    src={doctor.profilePhoto || 'https://via.placeholder.com/300x300?text=Doctor+Profile'} 
                    alt={doctor.fullName}
                    className="w-12 h-12 rounded-full object-cover mr-4"
                  />
                  <div>
                    <h3 className="font-medium">{doctor.fullName}</h3>
                    <p className={`text-sm ${theme.accent}`}>{doctor.specialization}</p>
                  </div>
                </div>
                
                <div className={`flex justify-between items-center mb-4 px-4 py-3 bg-gray-50 rounded-lg ${theme.border} border`}>
                  <div>
                    <p className={`text-sm ${theme.subtext}`}>Consultation Fee</p>
                    <p className={`text-lg font-semibold text-green-600`}>${doctor.consultationFee}</p>
                  </div>
                  <div>
                    <p className={`text-sm ${theme.subtext}`}>Duration</p>
                    <p className={`font-medium ${theme.text}`}>30 minutes</p>
                  </div>
                </div>
                
                <div className="mb-4">
                  <label className={`block text-sm font-medium mb-2 ${theme.text}`}>
                    <FaCalendarAlt className="inline mr-2" />
                    Select Date
                  </label>
                  <input
                    type="date"
                    value={bookingDate}
                    onChange={(e) => setBookingDate(e.target.value)}
                    min={formatDateForInput(today)}
                    className={`w-full px-3 py-2 border ${theme.border} rounded-md ${theme.input}`}
                  />
                </div>
                
                <div className="mb-4">
                  <label className={`block text-sm font-medium mb-2 ${theme.text}`}>
                    <FaClock className="inline mr-2" />
                    Select Time
                  </label>
                  
                  {isAvailabilityLoading ? (
                    <div className="flex justify-center py-4">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                    </div>
                  ) : availableTimeSlots.length === 0 ? (
                    <div className="text-center py-4 bg-gray-50 rounded-lg border border-gray-200">
                      <p className="text-gray-500">No available time slots for the selected date.</p>
                      <p className="text-sm text-gray-400 mt-1">Please select a different date.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-3 gap-2">
                      {availableTimeSlots.map((timeSlot) => (
                        <button
                          key={timeSlot}
                          type="button"
                          onClick={() => setSelectedTimeSlot(timeSlot)}
                          className={`py-2 px-3 text-center rounded-md text-sm ${
                            selectedTimeSlot === timeSlot
                              ? `${theme.accent} ${theme.accentBg} text-white`
                              : `border ${theme.border} ${theme.text} hover:bg-gray-50`
                          }`}
                        >
                          {timeSlot}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                
                <div className="mb-4">
                  <label className={`block text-sm font-medium mb-2 ${theme.text}`}>
                    Consultation Type
                  </label>
                  <div className="flex space-x-2">
                    <button
                      type="button"
                      onClick={() => setConsultationType('video')}
                      className={`flex items-center px-3 py-2 rounded-md ${
                        consultationType === 'video' 
                          ? `${theme.accent} ${theme.accentBg} text-white` 
                          : `${theme.border} border ${theme.text} hover:bg-gray-50`
                      }`}
                    >
                      <FaVideo className="mr-2" />
                      Video
                    </button>
                    <button
                      type="button"
                      onClick={() => setConsultationType('audio')}
                      className={`flex items-center px-3 py-2 rounded-md ${
                        consultationType === 'audio' 
                          ? `${theme.accent} ${theme.accentBg} text-white` 
                          : `${theme.border} border ${theme.text} hover:bg-gray-50`
                      }`}
                    >
                      <FaPhone className="mr-2" />
                      Audio
                    </button>
                    <button
                      type="button"
                      onClick={() => setConsultationType('chat')}
                      className={`flex items-center px-3 py-2 rounded-md ${
                        consultationType === 'chat' 
                          ? `${theme.accent} ${theme.accentBg} text-white` 
                          : `${theme.border} border ${theme.text} hover:bg-gray-50`
                      }`}
                    >
                      <FaCommentAlt className="mr-2" />
                      Chat
                    </button>
                  </div>
                </div>
                
                <div className="mb-4">
                  <label className={`block text-sm font-medium mb-2 ${theme.text}`}>
                    Notes (Optional)
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Describe your symptoms or reason for consultation..."
                    className={`w-full px-3 py-2 border ${theme.border} rounded-md ${theme.input} min-h-[100px]`}
                  />
                </div>
                
                {error && (
                  <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md border border-red-200">
                    {error}
                  </div>
                )}
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
                  onClick={handleBooking}
                  disabled={isLoading || !selectedTimeSlot}
                  className={`px-4 py-2 ${theme.accent} ${theme.accentBg} text-white rounded-md hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center`}
                >
                  {isLoading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Processing...
                    </>
                  ) : (
                    'Confirm Booking'
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

export default BookingModal;
