import React, { useState, useEffect } from 'react';
import { FaVideo, FaStar, FaCalendarAlt, FaUserMd, FaFilter, FaSearch, FaHospital, FaGraduationCap, FaUserClock } from 'react-icons/fa';
import { useTheme } from '../ThemeContext';
import { doctorService, bookingService } from '../services/api';
import DoctorProfile from './DoctorProfile';
import BookingModal from './BookingModal';
import MyBookings from './MyBookings';

const LiveDoctor = ({ patientId }) => {
  const { currentTheme, themes } = useTheme();
  const theme = themes[currentTheme];
  
  // State variables
  const [doctors, setDoctors] = useState([]);
  const [filteredDoctors, setFilteredDoctors] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [showDoctorProfile, setShowDoctorProfile] = useState(false);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showMyBookings, setShowMyBookings] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    onlineOnly: false,
    specialization: 'all',
    maxFee: 1000
  });
  
  // Static doctor profiles for immediate display
  const staticDoctors = [
    {
      _id: 'doc_1',
      fullName: 'Dr. Sarah Johnson',
      specialization: 'Psychiatrist',
      degree: 'MD, PhD',
      yearsOfExperience: 15,
      hospitalAffiliation: 'Central Medical Center',
      biography: 'Dr. Sarah Johnson is a board-certified psychiatrist with over 15 years of experience treating depression, anxiety, and mood disorders. She specializes in integrative approaches that combine traditional psychiatry with holistic wellness practices.',
      profilePhoto: 'https://randomuser.me/api/portraits/women/45.jpg',
      consultationFee: 150,
      isOnline: true,
      availabilitySchedule: [
        { day: 'Monday', startTime: '09:00', endTime: '17:00' },
        { day: 'Wednesday', startTime: '09:00', endTime: '17:00' },
        { day: 'Friday', startTime: '09:00', endTime: '13:00' }
      ],
      rating: 4.8,
      totalReviews: 124
    },
    {
      _id: 'doc_2',
      fullName: 'Dr. Michael Chen',
      specialization: 'Clinical Psychologist',
      degree: 'PsyD',
      yearsOfExperience: 10,
      hospitalAffiliation: 'Behavioral Health Institute',
      biography: 'Dr. Michael Chen is a clinical psychologist specializing in cognitive behavioral therapy for depression, anxiety, and trauma. He has extensive experience working with adults and adolescents in both inpatient and outpatient settings.',
      profilePhoto: 'https://randomuser.me/api/portraits/men/32.jpg',
      consultationFee: 120,
      isOnline: true,
      availabilitySchedule: [
        { day: 'Tuesday', startTime: '10:00', endTime: '18:00' },
        { day: 'Thursday', startTime: '10:00', endTime: '18:00' },
        { day: 'Saturday', startTime: '09:00', endTime: '14:00' }
      ],
      rating: 4.7,
      totalReviews: 98
    },
    {
      _id: 'doc_3',
      fullName: 'Dr. Emily Rodriguez',
      specialization: 'Neuropsychiatrist',
      degree: 'MD',
      yearsOfExperience: 12,
      hospitalAffiliation: 'University Medical Center',
      biography: 'Dr. Emily Rodriguez is a neuropsychiatrist with expertise in treating complex mood disorders, ADHD, and neurological conditions affecting mental health. She takes a patient-centered approach, combining medication management with therapeutic interventions.',
      profilePhoto: 'https://randomuser.me/api/portraits/women/68.jpg',
      consultationFee: 175,
      isOnline: false,
      availabilitySchedule: [
        { day: 'Monday', startTime: '13:00', endTime: '19:00' },
        { day: 'Wednesday', startTime: '13:00', endTime: '19:00' },
        { day: 'Friday', startTime: '09:00', endTime: '15:00' }
      ],
      rating: 4.9,
      totalReviews: 156
    },
    {
      _id: 'doc_4',
      fullName: 'Dr. James Wilson',
      specialization: 'Psychotherapist',
      degree: 'PhD',
      yearsOfExperience: 8,
      hospitalAffiliation: 'Mindful Wellness Center',
      biography: 'Dr. James Wilson specializes in psychodynamic therapy and mindfulness-based approaches for depression, anxiety, and relationship issues. He believes in creating a safe, non-judgmental space for clients to explore their thoughts and feelings.',
      profilePhoto: 'https://randomuser.me/api/portraits/men/52.jpg',
      consultationFee: 110,
      isOnline: true,
      availabilitySchedule: [
        { day: 'Monday', startTime: '09:00', endTime: '17:00' },
        { day: 'Thursday', startTime: '09:00', endTime: '17:00' },
        { day: 'Friday', startTime: '09:00', endTime: '13:00' }
      ],
      rating: 4.6,
      totalReviews: 87
    },
    {
      _id: 'doc_5',
      fullName: 'Dr. Aisha Patel',
      specialization: 'Child & Adolescent Psychiatrist',
      degree: 'MD',
      yearsOfExperience: 14,
      hospitalAffiliation: 'Children\'s Medical Center',
      biography: 'Dr. Aisha Patel is a child and adolescent psychiatrist specializing in the treatment of mood disorders, anxiety, ADHD, and behavioral issues in young people. She takes a family-centered approach, working closely with parents and caregivers.',
      profilePhoto: 'https://randomuser.me/api/portraits/women/37.jpg',
      consultationFee: 160,
      isOnline: false,
      availabilitySchedule: [
        { day: 'Tuesday', startTime: '09:00', endTime: '17:00' },
        { day: 'Wednesday', startTime: '09:00', endTime: '17:00' },
        { day: 'Saturday', startTime: '09:00', endTime: '13:00' }
      ],
      rating: 4.9,
      totalReviews: 132
    },
    {
      _id: 'doc_6',
      fullName: 'Dr. Robert Thompson',
      specialization: 'Addiction Psychiatrist',
      degree: 'MD, MPH',
      yearsOfExperience: 18,
      hospitalAffiliation: 'Recovery Health Network',
      biography: 'Dr. Robert Thompson is an addiction psychiatrist with extensive experience in treating substance use disorders and co-occurring mental health conditions. He uses evidence-based approaches including medication-assisted treatment and cognitive-behavioral therapy.',
      profilePhoto: 'https://randomuser.me/api/portraits/men/76.jpg',
      consultationFee: 165,
      isOnline: true,
      availabilitySchedule: [
        { day: 'Monday', startTime: '11:00', endTime: '19:00' },
        { day: 'Wednesday', startTime: '11:00', endTime: '19:00' },
        { day: 'Friday', startTime: '10:00', endTime: '16:00' }
      ],
      rating: 4.7,
      totalReviews: 143
    },
    {
      _id: 'doc_7',
      fullName: 'Dr. Sophia Kim',
      specialization: 'Geriatric Psychiatrist',
      degree: 'MD',
      yearsOfExperience: 16,
      hospitalAffiliation: 'Elder Care Medical Group',
      biography: 'Dr. Sophia Kim specializes in the mental health care of older adults, with particular expertise in dementia, depression, and anxiety in the elderly. She takes a compassionate, holistic approach to geriatric psychiatry, addressing both medical and psychological factors.',
      profilePhoto: 'https://randomuser.me/api/portraits/women/79.jpg',
      consultationFee: 155,
      isOnline: true,
      availabilitySchedule: [
        { day: 'Tuesday', startTime: '09:00', endTime: '15:00' },
        { day: 'Thursday', startTime: '09:00', endTime: '15:00' },
        { day: 'Saturday', startTime: '10:00', endTime: '14:00' }
      ],
      rating: 4.9,
      totalReviews: 118
    },
    {
      _id: 'doc_8',
      fullName: 'Dr. Marcus Johnson',
      specialization: 'Forensic Psychiatrist',
      degree: 'MD, JD',
      yearsOfExperience: 20,
      hospitalAffiliation: 'Legal Medicine Institute',
      biography: 'Dr. Marcus Johnson is a forensic psychiatrist with dual degrees in medicine and law. He specializes in the intersection of mental health and legal issues, providing evaluations and expert testimony in legal cases involving mental health concerns.',
      profilePhoto: 'https://randomuser.me/api/portraits/men/22.jpg',
      consultationFee: 200,
      isOnline: false,
      availabilitySchedule: [
        { day: 'Monday', startTime: '10:00', endTime: '16:00' },
        { day: 'Thursday', startTime: '10:00', endTime: '16:00' }
      ],
      rating: 4.8,
      totalReviews: 95
    }
  ];

  // Fetch doctors
  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        setIsLoading(true);
        let data;
        
        try {
          // Try to fetch from API
          data = await doctorService.getAllDoctors();
        } catch (apiError) {
          console.log('Using static doctor data due to API error:', apiError);
          // Use static data if API fails
          data = staticDoctors;
        }
        
        setDoctors(data);
        setFilteredDoctors(data);
        setIsLoading(false);
      } catch (err) {
        console.error('Error setting up doctors:', err);
        // Fall back to static data in case of any error
        setDoctors(staticDoctors);
        setFilteredDoctors(staticDoctors);
        setIsLoading(false);
      }
    };
    
    fetchDoctors();
  }, []);
  
  // Apply filters and search
  useEffect(() => {
    let result = [...doctors];
    
    // Apply online filter
    if (filters.onlineOnly) {
      result = result.filter(doctor => doctor.isOnline);
    }
    
    // Apply specialization filter
    if (filters.specialization !== 'all') {
      result = result.filter(doctor => 
        doctor.specialization.toLowerCase().includes(filters.specialization.toLowerCase())
      );
    }
    
    // Apply fee filter
    result = result.filter(doctor => doctor.consultationFee <= filters.maxFee);
    
    // Apply search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(doctor => 
        doctor.fullName.toLowerCase().includes(query) ||
        doctor.specialization.toLowerCase().includes(query) ||
        doctor.hospitalAffiliation.toLowerCase().includes(query)
      );
    }
    
    setFilteredDoctors(result);
  }, [doctors, filters, searchQuery]);
  
  const handleDoctorSelect = (doctor) => {
    setSelectedDoctor(doctor);
    setShowDoctorProfile(true);
  };
  
  const handleBookNow = (doctor) => {
    setSelectedDoctor(doctor);
    setShowBookingModal(true);
  };
  
  const handleBookingComplete = () => {
    setShowBookingModal(false);
    // Show a success message or redirect to My Bookings
    setShowMyBookings(true);
  };
  
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
  
  // Generate unique specializations for filter
  const specializations = ['all', ...new Set(doctors.map(doctor => doctor.specialization))];
  
  return (
    <div>
      {/* Header with filters */}
      <div className={`${theme.cardBg} rounded-lg p-6 shadow-md ${theme.shadow} mb-6`}>
        <div className="flex justify-between items-center mb-4">
          <h2 className={`text-xl font-semibold ${theme.text}`}>Live Doctor Consultation</h2>
          <button
            onClick={() => setShowMyBookings(true)}
            className={`${theme.accent} ${theme.accentHover} flex items-center px-4 py-2 rounded-md`}
          >
            <FaCalendarAlt className="mr-2" /> My Bookings
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="col-span-1 md:col-span-2">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search doctors by name, specialization..."
                className={`w-full pl-10 pr-4 py-2 border ${theme.border} rounded-md ${theme.input}`}
              />
              <FaSearch className="absolute left-3 top-3 text-gray-400" />
            </div>
          </div>
          
          {/* Specialization filter */}
          <div>
            <select
              value={filters.specialization}
              onChange={(e) => setFilters({...filters, specialization: e.target.value})}
              className={`w-full px-3 py-2 border ${theme.border} rounded-md ${theme.input}`}
            >
              <option value="all">All Specializations</option>
              {specializations.filter(s => s !== 'all').map((spec, index) => (
                <option key={index} value={spec}>{spec}</option>
              ))}
            </select>
          </div>
          
          {/* Online filter */}
          <div className="flex items-center">
            <label className="inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={filters.onlineOnly}
                onChange={(e) => setFilters({...filters, onlineOnly: e.target.checked})}
                className="sr-only peer"
              />
              <div className={`relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600`}></div>
              <span className={`ml-3 text-sm font-medium ${theme.text}`}>Online Now</span>
            </label>
          </div>
        </div>
      </div>
      
      {/* Doctor list */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      ) : error ? (
        <div className={`${theme.cardBg} rounded-lg shadow-md ${theme.shadow} p-6 text-red-600`}>{error}</div>
      ) : filteredDoctors.length === 0 ? (
        <div className={`${theme.cardBg} rounded-lg shadow-md ${theme.shadow} p-6 text-center ${theme.subtext}`}>
          <FaUserMd className="mx-auto text-4xl mb-2 text-gray-400" />
          <p className="mb-2">No doctors match your search criteria.</p>
          <button
            onClick={() => {
              setSearchQuery('');
              setFilters({
                onlineOnly: false,
                specialization: 'all',
                maxFee: 1000
              });
            }}
            className={`${theme.accent} ${theme.accentHover} px-4 py-2 rounded-md mt-2`}
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDoctors.map((doctor) => (
            <div 
              key={doctor._id} 
              className={`${theme.cardBg} rounded-lg shadow-md ${theme.border} border overflow-hidden hover:shadow-lg transition-all cursor-pointer`}
              onClick={() => handleDoctorSelect(doctor)}
            >
              {/* Doctor header with photo and online status */}
              <div className="relative">
                <img 
                  src={doctor.profilePhoto || 'https://via.placeholder.com/300x150?text=Doctor+Profile'} 
                  alt={doctor.fullName}
                  className="w-full h-40 object-cover"
                />
                <div className={`absolute top-3 right-3 px-2 py-1 rounded-full text-xs font-medium ${doctor.isOnline ? 'bg-green-500 text-white' : 'bg-gray-500 text-white'}`}>
                  {doctor.isOnline ? 'Online' : 'Offline'}
                </div>
              </div>
              
              {/* Doctor info */}
              <div className="p-4">
                <h3 className={`text-lg font-semibold ${theme.text} mb-1`}>{doctor.fullName}</h3>
                <div className="flex items-center mb-3">
                  <FaGraduationCap className={`mr-1 ${theme.accent}`} />
                  <p className={`text-sm ${theme.accent}`}>{doctor.degree}</p>
                </div>
                
                <div className="space-y-2 mb-4">
                  <div className="flex items-start">
                    <FaUserMd className={`mt-1 mr-2 ${theme.subtext}`} />
                    <div>
                      <p className={`text-xs ${theme.subtext}`}>Specialization</p>
                      <p className={`text-sm ${theme.text}`}>{doctor.specialization}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <FaUserClock className={`mt-1 mr-2 ${theme.subtext}`} />
                    <div>
                      <p className={`text-xs ${theme.subtext}`}>Experience</p>
                      <p className={`text-sm ${theme.text}`}>{doctor.yearsOfExperience} years</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <FaHospital className={`mt-1 mr-2 ${theme.subtext}`} />
                    <div>
                      <p className={`text-xs ${theme.subtext}`}>Hospital/Clinic</p>
                      <p className={`text-sm ${theme.text}`}>{doctor.hospitalAffiliation}</p>
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-between items-center pt-3 border-t border-gray-100">
                  <div className="text-lg font-semibold text-green-600">
                    ${doctor.consultationFee}
                  </div>
                  
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleBookNow(doctor);
                    }}
                    className={`px-3 py-1.5 flex items-center ${theme.accent} ${theme.accentBg} text-white rounded-md hover:opacity-90`}
                    disabled={!doctor.isOnline}
                  >
                    <FaVideo className="mr-1" /> Book Now
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* Doctor Profile Modal */}
      {showDoctorProfile && selectedDoctor && (
        <DoctorProfile 
          doctor={selectedDoctor} 
          onClose={() => setShowDoctorProfile(false)}
          onBook={() => {
            setShowDoctorProfile(false);
            setShowBookingModal(true);
          }}
        />
      )}
      
      {/* Booking Modal */}
      {showBookingModal && selectedDoctor && (
        <BookingModal 
          doctor={selectedDoctor}
          patientId={patientId}
          onClose={() => setShowBookingModal(false)}
          onBookingComplete={handleBookingComplete}
        />
      )}
      
      {/* My Bookings Modal */}
      {showMyBookings && (
        <MyBookings 
          patientId={patientId}
          onClose={() => setShowMyBookings(false)}
        />
      )}
    </div>
  );
};

export default LiveDoctor;
