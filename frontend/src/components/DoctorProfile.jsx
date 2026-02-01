import React from 'react';
import { FaTimes, FaStar, FaVideo, FaHospital, FaGraduationCap, FaCalendarAlt } from 'react-icons/fa';
import { useTheme } from '../ThemeContext';

const DoctorProfile = ({ doctor, onClose, onBook }) => {
  const { currentTheme, themes } = useTheme();
  const theme = themes[currentTheme];
  
  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <FaStar 
          key={i} 
          className={i <= rating ? 'text-yellow-500' : 'text-gray-300'} 
        />
      );
    }
    return stars;
  };
  
  const renderAvailability = () => {
    if (!doctor.availabilitySchedule || doctor.availabilitySchedule.length === 0) {
      return <p className="text-gray-500">No availability information</p>;
    }
    
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        {doctor.availabilitySchedule.map((schedule, index) => (
          <div key={index} className="flex items-center">
            <div className={`w-24 font-medium ${theme.text}`}>{schedule.day}</div>
            <div className={`${theme.subtext}`}>{schedule.startTime} - {schedule.endTime}</div>
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
          <h2 className={`text-xl font-semibold ${theme.text}`}>Doctor Profile</h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <FaTimes />
          </button>
        </div>
        
        {/* Content */}
        <div className="p-6">
          <div className="flex flex-col md:flex-row">
            {/* Doctor Image and Basic Info */}
            <div className="md:w-1/3 mb-6 md:mb-0 md:pr-6">
              <img 
                src={doctor.profilePhoto || 'https://via.placeholder.com/300x300?text=Doctor+Profile'} 
                alt={doctor.fullName}
                className="w-full h-auto rounded-lg shadow-md mb-4"
              />
              
              <div className="mb-4">
                <h3 className={`text-xl font-semibold ${theme.text} mb-1`}>{doctor.fullName}</h3>
                <p className={`text-sm ${theme.accent} mb-2`}>{doctor.specialization}</p>
                
                <div className="flex items-center mb-2">
                  <div className="flex mr-2">
                    {renderStars(doctor.rating)}
                  </div>
                  <span className={`text-sm ${theme.subtext}`}>({doctor.totalReviews} reviews)</span>
                </div>
                
                <div className={`flex items-center text-sm ${theme.subtext} mb-2`}>
                  <FaGraduationCap className="mr-2" />
                  <span>{doctor.degree}</span>
                </div>
                
                <div className={`flex items-center text-sm ${theme.subtext} mb-2`}>
                  <FaHospital className="mr-2" />
                  <span>{doctor.hospitalAffiliation}</span>
                </div>
                
                <div className={`text-sm ${theme.subtext} mb-4`}>
                  <p>{doctor.yearsOfExperience} years of experience</p>
                </div>
                
                <div className="text-lg font-semibold text-green-600 mb-4">
                  Consultation Fee: ${doctor.consultationFee}
                </div>
                
                <button
                  onClick={onBook}
                  className={`w-full py-2 flex items-center justify-center ${theme.accent} ${theme.accentBg} text-white rounded-md hover:opacity-90 ${!doctor.isOnline && 'opacity-50 cursor-not-allowed'}`}
                  disabled={!doctor.isOnline}
                >
                  <FaVideo className="mr-2" /> 
                  {doctor.isOnline ? 'Book Consultation' : 'Currently Offline'}
                </button>
              </div>
            </div>
            
            {/* Doctor Details */}
            <div className="md:w-2/3">
              {/* Biography */}
              <div className="mb-6">
                <h4 className={`text-lg font-medium ${theme.text} mb-2`}>About</h4>
                <p className={`${theme.subtext} whitespace-pre-line`}>{doctor.biography}</p>
              </div>
              
              {/* Availability */}
              <div className="mb-6">
                <h4 className={`text-lg font-medium ${theme.text} mb-2`}>
                  <FaCalendarAlt className="inline mr-2" />
                  Availability
                </h4>
                {renderAvailability()}
              </div>
              
              {/* Status */}
              <div className="mb-6">
                <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm ${
                  doctor.isOnline 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  <span className={`w-2 h-2 rounded-full mr-2 ${
                    doctor.isOnline ? 'bg-green-500' : 'bg-gray-500'
                  }`}></span>
                  {doctor.isOnline ? 'Available Now' : 'Currently Offline'}
                </div>
              </div>
              
              {/* Reviews (mock data) */}
              <div>
                <h4 className={`text-lg font-medium ${theme.text} mb-2`}>Patient Reviews</h4>
                <div className="space-y-4">
                  <div className={`p-4 rounded-lg ${theme.border} border`}>
                    <div className="flex items-center mb-2">
                      <div className="flex mr-2">
                        {renderStars(5)}
                      </div>
                      <span className={`text-sm ${theme.subtext}`}>John D. - 2 weeks ago</span>
                    </div>
                    <p className={`${theme.text}`}>
                      Dr. {doctor.fullName.split(' ')[1]} was very attentive and took the time to understand my concerns. The video consultation was smooth and I felt like I was getting the same quality of care as an in-person visit.
                    </p>
                  </div>
                  
                  <div className={`p-4 rounded-lg ${theme.border} border`}>
                    <div className="flex items-center mb-2">
                      <div className="flex mr-2">
                        {renderStars(4)}
                      </div>
                      <span className={`text-sm ${theme.subtext}`}>Sarah M. - 1 month ago</span>
                    </div>
                    <p className={`${theme.text}`}>
                      Very professional and knowledgeable. The doctor provided clear explanations and answered all my questions. Would definitely recommend.
                    </p>
                  </div>
                  
                  <div className={`p-4 rounded-lg ${theme.border} border`}>
                    <div className="flex items-center mb-2">
                      <div className="flex mr-2">
                        {renderStars(5)}
                      </div>
                      <span className={`text-sm ${theme.subtext}`}>Michael R. - 2 months ago</span>
                    </div>
                    <p className={`${theme.text}`}>
                      Excellent experience with Dr. {doctor.fullName.split(' ')[1]}. They were very thorough in their assessment and provided a comprehensive treatment plan. The follow-up was also very good.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorProfile;
