import React, { useState, useEffect } from 'react';
import { FaTimes, FaCalendarAlt, FaVideo, FaPhone, FaCommentAlt, FaCheckCircle, FaTimesCircle, FaExternalLinkAlt } from 'react-icons/fa';
import { useTheme } from '../ThemeContext';
import { bookingService, doctorService } from '../services/api';

const MyBookings = ({ patientId, onClose }) => {
  const { currentTheme, themes } = useTheme();
  const theme = themes[currentTheme];
  
  const [activeTab, setActiveTab] = useState('upcoming');
  const [upcomingBookings, setUpcomingBookings] = useState([]);
  const [pastBookings, setPastBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showBookingDetails, setShowBookingDetails] = useState(false);
  
  // Fetch bookings
  useEffect(() => {
    const fetchBookings = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const [upcoming, past] = await Promise.all([
          bookingService.getUpcomingPatientBookings(patientId),
          bookingService.getPastPatientBookings(patientId)
        ]);
        
        setUpcomingBookings(upcoming);
        setPastBookings(past);
      } catch (err) {
        console.error('Error fetching bookings:', err);
        setError('Failed to load your bookings. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchBookings();
  }, [patientId]);
  
  const handleCancelBooking = async (bookingId) => {
    try {
      await bookingService.cancelBooking(bookingId);
      
      // Update the booking in the state
      setUpcomingBookings(upcomingBookings.map(booking => 
        booking._id === bookingId 
          ? { ...booking, status: 'cancelled' } 
          : booking
      ));
      
      // If the selected booking is being cancelled, update it
      if (selectedBooking && selectedBooking._id === bookingId) {
        setSelectedBooking({ ...selectedBooking, status: 'cancelled' });
      }
    } catch (err) {
      console.error('Error cancelling booking:', err);
      setError('Failed to cancel booking. Please try again.');
    }
  };
  
  const handleViewBooking = (booking) => {
    setSelectedBooking(booking);
    setShowBookingDetails(true);
  };
  
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };
  
  const getConsultationTypeIcon = (type) => {
    switch (type) {
      case 'video':
        return <FaVideo className="text-blue-500" />;
      case 'audio':
        return <FaPhone className="text-green-500" />;
      case 'chat':
        return <FaCommentAlt className="text-purple-500" />;
      default:
        return <FaVideo className="text-blue-500" />;
    }
  };
  
  const getStatusBadge = (status) => {
    switch (status) {
      case 'scheduled':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            Scheduled
          </span>
        );
      case 'completed':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            Completed
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            Cancelled
          </span>
        );
      case 'no-show':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            No Show
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            {status}
          </span>
        );
    }
  };
  
  const renderBookingList = (bookings) => {
    if (bookings.length === 0) {
      return (
        <div className="text-center py-8">
          <FaCalendarAlt className="mx-auto text-4xl text-gray-300 mb-2" />
          <p className={`${theme.subtext}`}>
            {activeTab === 'upcoming' 
              ? 'You have no upcoming bookings.' 
              : 'You have no past consultations.'}
          </p>
        </div>
      );
    }
    
    return (
      <div className="space-y-4">
        {bookings.map((booking) => (
          <div 
            key={booking._id} 
            className={`${theme.cardBg} rounded-lg shadow-sm border ${theme.border} p-4 hover:shadow-md transition-shadow cursor-pointer`}
            onClick={() => handleViewBooking(booking)}
          >
            <div className="flex justify-between items-start">
              <div className="flex items-center">
                <div className="mr-4">
                  {getConsultationTypeIcon(booking.consultationType)}
                </div>
                <div>
                  <h3 className={`font-medium ${theme.text}`}>
                    {booking.doctorId.fullName || 'Doctor Name'}
                  </h3>
                  <p className={`text-sm ${theme.subtext}`}>
                    {booking.doctorId.specialization || 'Specialization'}
                  </p>
                  <p className={`text-sm ${theme.accent} mt-1`}>
                    {formatDate(booking.bookingDate)} • {booking.startTime} - {booking.endTime}
                  </p>
                </div>
              </div>
              <div className="text-right">
                {getStatusBadge(booking.status)}
                {booking.status === 'scheduled' && (
                  <p className="text-sm text-green-600 mt-2">
                    ${booking.fee}
                  </p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className={`${theme.cardBg} rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto`}>
        {/* Header */}
        <div className={`px-6 py-4 border-b ${theme.border} flex justify-between items-center sticky top-0 ${theme.cardBg} z-10`}>
          <h2 className={`text-xl font-semibold ${theme.text}`}>My Bookings</h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <FaTimes />
          </button>
        </div>
        
        {/* Content */}
        <div className="p-6">
          {/* Tabs */}
          <div className="flex border-b border-gray-200 mb-6">
            <button
              onClick={() => setActiveTab('upcoming')}
              className={`py-2 px-4 font-medium ${
                activeTab === 'upcoming' 
                  ? `${theme.accent} border-b-2 border-${currentTheme === 'light' ? 'blue-600' : 'blue-400'}` 
                  : `${theme.subtext} hover:${theme.accent}`
              }`}
            >
              Upcoming
            </button>
            <button
              onClick={() => setActiveTab('past')}
              className={`py-2 px-4 font-medium ${
                activeTab === 'past' 
                  ? `${theme.accent} border-b-2 border-${currentTheme === 'light' ? 'blue-600' : 'blue-400'}` 
                  : `${theme.subtext} hover:${theme.accent}`
              }`}
            >
              Past
            </button>
          </div>
          
          {/* Booking List */}
          {isLoading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
          ) : error ? (
            <div className="bg-red-50 text-red-700 p-4 rounded-md">
              {error}
            </div>
          ) : (
            <>
              {activeTab === 'upcoming' ? renderBookingList(upcomingBookings) : renderBookingList(pastBookings)}
            </>
          )}
        </div>
      </div>
      
      {/* Booking Details Modal */}
      {showBookingDetails && selectedBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4">
          <div className={`${theme.cardBg} rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto`}>
            {/* Header */}
            <div className={`px-6 py-4 border-b ${theme.border} flex justify-between items-center sticky top-0 ${theme.cardBg} z-10`}>
              <h2 className={`text-xl font-semibold ${theme.text}`}>Booking Details</h2>
              <button 
                onClick={() => setShowBookingDetails(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <FaTimes />
              </button>
            </div>
            
            {/* Content */}
            <div className="p-6">
              <div className="flex items-center mb-6">
                <div className={`p-3 rounded-full ${theme.accentBg} mr-4`}>
                  {getConsultationTypeIcon(selectedBooking.consultationType)}
                </div>
                <div>
                  <h3 className={`text-lg font-medium ${theme.text}`}>
                    {selectedBooking.consultationType.charAt(0).toUpperCase() + selectedBooking.consultationType.slice(1)} Consultation
                  </h3>
                  <p className={`${theme.subtext}`}>
                    with {selectedBooking.doctorId.fullName || 'Doctor'}
                  </p>
                </div>
                <div className="ml-auto">
                  {getStatusBadge(selectedBooking.status)}
                </div>
              </div>
              
              <div className={`grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 p-4 rounded-lg bg-gray-50 ${theme.border} border`}>
                <div>
                  <p className={`text-sm ${theme.subtext}`}>Date</p>
                  <p className={`font-medium ${theme.text}`}>{formatDate(selectedBooking.bookingDate)}</p>
                </div>
                <div>
                  <p className={`text-sm ${theme.subtext}`}>Time</p>
                  <p className={`font-medium ${theme.text}`}>{selectedBooking.startTime} - {selectedBooking.endTime}</p>
                </div>
                <div>
                  <p className={`text-sm ${theme.subtext}`}>Doctor</p>
                  <p className={`font-medium ${theme.text}`}>{selectedBooking.doctorId.fullName || 'Doctor Name'}</p>
                </div>
                <div>
                  <p className={`text-sm ${theme.subtext}`}>Specialization</p>
                  <p className={`font-medium ${theme.text}`}>{selectedBooking.doctorId.specialization || 'Specialization'}</p>
                </div>
              </div>
              
              {selectedBooking.patientNotes && (
                <div className="mb-6">
                  <h4 className={`text-sm font-medium ${theme.text} mb-2`}>Your Notes</h4>
                  <div className={`p-3 rounded-lg bg-gray-50 ${theme.border} border`}>
                    <p className={`${theme.text}`}>{selectedBooking.patientNotes}</p>
                  </div>
                </div>
              )}
              
              {selectedBooking.doctorNotes && (
                <div className="mb-6">
                  <h4 className={`text-sm font-medium ${theme.text} mb-2`}>Doctor's Notes</h4>
                  <div className={`p-3 rounded-lg bg-blue-50 border border-blue-100`}>
                    <p className={`${theme.text}`}>{selectedBooking.doctorNotes}</p>
                  </div>
                </div>
              )}
              
              <div className="mb-6">
                <h4 className={`text-sm font-medium ${theme.text} mb-2`}>Consultation Fee</h4>
                <p className={`text-lg font-semibold text-green-600`}>${selectedBooking.fee}</p>
                {selectedBooking.isPaid && (
                  <span className="inline-flex items-center text-xs text-green-700 mt-1">
                    <FaCheckCircle className="mr-1" /> Paid
                  </span>
                )}
              </div>
              
              <div className="flex justify-between">
                {selectedBooking.status === 'scheduled' && (
                  <>
                    <button
                      onClick={() => handleCancelBooking(selectedBooking._id)}
                      className="px-4 py-2 border border-red-300 text-red-700 rounded-md hover:bg-red-50"
                    >
                      <FaTimesCircle className="inline mr-2" />
                      Cancel Booking
                    </button>
                    
                    <a
                      href={selectedBooking.meetingLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`px-4 py-2 ${theme.accent} ${theme.accentBg} text-white rounded-md hover:opacity-90`}
                    >
                      <FaExternalLinkAlt className="inline mr-2" />
                      Join Consultation
                    </a>
                  </>
                )}
                
                {selectedBooking.status === 'completed' && (
                  <button
                    className={`px-4 py-2 ${theme.accent} ${theme.accentBg} text-white rounded-md hover:opacity-90 ml-auto`}
                  >
                    Book Again
                  </button>
                )}
                
                {selectedBooking.status === 'cancelled' && (
                  <button
                    className={`px-4 py-2 ${theme.accent} ${theme.accentBg} text-white rounded-md hover:opacity-90 ml-auto`}
                  >
                    Reschedule
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyBookings;
