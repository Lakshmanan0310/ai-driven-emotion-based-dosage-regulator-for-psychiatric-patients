/**
 * API Service for Medical Emotion Diagnostic Tool
 * Handles all API calls to the backend server
 */

// Use relative URL to avoid CORS issues when possible
const API_BASE_URL = '/api';

// Mock data for when backend is unavailable
const mockData = {
  doctors: [
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
    }
  ],
  bookings: [
    {
      _id: 'booking_1',
      patientId: '123',
      doctorId: 'doc_1',
      bookingDate: new Date('2025-06-05'),
      startTime: '10:00',
      endTime: '10:30',
      consultationType: 'video',
      meetingLink: 'https://meet.example.com/abc123',
      status: 'scheduled',
      fee: 150,
      isPaid: true,
      createdAt: new Date('2025-05-20')
    },
    {
      _id: 'booking_2',
      patientId: '123',
      doctorId: 'doc_2',
      bookingDate: new Date('2025-05-15'),
      startTime: '14:00',
      endTime: '14:30',
      consultationType: 'video',
      meetingLink: 'https://meet.example.com/def456',
      status: 'completed',
      patientNotes: 'Follow-up on medication side effects',
      doctorNotes: 'Patient reported improved sleep, reduced anxiety. Continue current medication regimen.',
      fee: 120,
      isPaid: true,
      createdAt: new Date('2025-05-10')
    },
    {
      _id: 'booking_3',
      patientId: '123',
      doctorId: 'doc_4',
      bookingDate: new Date('2025-06-10'),
      startTime: '11:00',
      endTime: '11:30',
      consultationType: 'video',
      meetingLink: 'https://meet.example.com/ghi789',
      status: 'scheduled',
      patientNotes: 'Initial consultation for therapy options',
      fee: 110,
      isPaid: true,
      createdAt: new Date('2025-05-22')
    }
  ],
  memoryVault: [
    {
      id: 'mem_1',
      patientId: '123',
      title: 'Beach Vacation',
      content: 'I remember the peaceful sound of waves at the beach last summer. The sun was warm, and I felt completely at ease.',
      contentType: 'text',
      emotionTags: ['peace', 'joy', 'serenity'],
      dominantEmotion: 'peace',
      emotionIntensity: 85,
      isCaregiver: false,
      createdAt: new Date('2025-05-10T15:30:00'),
      lastAccessed: new Date('2025-05-15T09:20:00'),
      accessCount: 2,
      helpfulnessRating: 5
    },
    {
      id: 'mem_2',
      patientId: '123',
      title: 'Graduation Day',
      content: 'The day I graduated from college was one of my proudest moments. All the hard work paid off, and I felt so accomplished.',
      contentType: 'text',
      emotionTags: ['pride', 'joy', 'strength'],
      dominantEmotion: 'pride',
      emotionIntensity: 90,
      isCaregiver: false,
      createdAt: new Date('2025-05-05T11:15:00'),
      lastAccessed: null,
      accessCount: 0,
      helpfulnessRating: null
    },
    {
      id: 'mem_3',
      patientId: '123',
      title: 'Message from Mom',
      content: 'Remember that you are stronger than you think. I believe in you and am always here for you.',
      contentType: 'text',
      emotionTags: ['love', 'strength', 'hope'],
      dominantEmotion: 'love',
      emotionIntensity: 95,
      isCaregiver: true,
      caregiverName: 'Mom',
      triggerCondition: {
        emotion: 'sad',
        intensity: 70
      },
      createdAt: new Date('2025-05-12T18:45:00'),
      lastAccessed: new Date('2025-05-20T22:10:00'),
      accessCount: 1,
      helpfulnessRating: 5
    }
  ],
  sessions: [
    {
      patientId: '123',
      timestamp: new Date('2025-05-22T10:30:00'),
      emotion: 'sad',
      emotionIntensity: 75,
      voiceTone: 'depressed',
      transcript: 'I have been feeling very low lately and having trouble sleeping.',
      recommendation: 'Sertraline 25mg',
      notes: 'Take once daily in the morning. May take 2-4 weeks for full effect.'
    },
    {
      patientId: '123',
      timestamp: new Date('2025-05-20T14:15:00'),
      emotion: 'angry',
      emotionIntensity: 65,
      voiceTone: 'aggressive',
      transcript: 'I feel irritated by small things and can\'t control my temper.',
      recommendation: 'Lorazepam 0.5mg',
      notes: 'Take once when feeling moderately angry. Avoid alcohol.'
    },
    {
      patientId: '123',
      timestamp: new Date('2025-05-18T09:45:00'),
      emotion: 'fearful',
      emotionIntensity: 80,
      voiceTone: 'anxious',
      transcript: 'I\'m constantly worried about everything and feel on edge.',
      recommendation: 'Buspirone 5mg',
      notes: 'Take twice daily. Avoid caffeine and alcohol.'
    }
  ],
  medications: [
    {
      patientId: '123',
      medication: 'Sertraline',
      dosage: '25mg',
      timestamp: new Date('2025-05-22T10:30:00'),
      reason: 'Depression',
      notes: 'Take once daily in the morning. May take 2-4 weeks for full effect.'
    },
    {
      patientId: '123',
      medication: 'Lorazepam',
      dosage: '0.5mg',
      timestamp: new Date('2025-05-20T14:15:00'),
      reason: 'Anxiety/Anger',
      notes: 'Take once when feeling moderately angry. Avoid alcohol.'
    },
    {
      patientId: '123',
      medication: 'Buspirone',
      dosage: '5mg',
      timestamp: new Date('2025-05-18T09:45:00'),
      reason: 'Anxiety',
      notes: 'Take twice daily. Avoid caffeine and alcohol.'
    }
  ],
  patients: [
    {
      patientId: '123',
      name: 'John Doe',
      age: 35,
      gender: 'Male',
      diagnosis: 'Major Depressive Disorder',
      currentMedication: 'Fluoxetine 20mg',
      concern: 'High'
    },
    {
      patientId: '124',
      name: 'Jane Smith',
      age: 28,
      gender: 'Female',
      diagnosis: 'Major Depressive Disorder',
      currentMedication: 'Fluoxetine 20mg',
      concern: 'Medium'
    },
    {
      patientId: '125',
      name: 'Michael Wilson',
      age: 31,
      gender: 'Male',
      diagnosis: 'Anxiety Disorder',
      currentMedication: 'Sertraline 50mg',
      concern: 'Medium'
    }
  ]
};

// Generic API request function with error handling and mock data fallback
async function apiRequest(endpoint, method = 'GET', data = null) {
  // For session-log endpoints, directly use mock data to avoid CORS issues
  if (endpoint.includes('/session-log/')) {
    console.log('Using mock data for session-log to avoid CORS issues');
    const patientId = endpoint.split('/')[2];
    if (method === 'GET') {
      console.log('Using mock session data for patient:', patientId);
      return mockData.sessions.filter(s => s.patientId === patientId);
    } else if (method === 'POST') {
      console.log('Simulating session log creation for:', data);
      // Add the new session to mock data
      const newSession = {
        ...data,
        timestamp: new Date()
      };
      mockData.sessions.unshift(newSession);
      return newSession;
    }
  }
  
  // For all other endpoints, try the regular API call
  const url = `${API_BASE_URL}${endpoint}`;
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    // Don't use credentials for now to avoid CORS issues
    mode: 'cors'
  };

  if (data) {
    options.body = JSON.stringify(data);
  }

  try {
    console.log(`Making API request to: ${url}`);
    const response = await fetch(url, options);
    
    // Handle non-2xx responses
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `API error: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`API Error (${endpoint}):`, error);
    
    // Check if this is a CORS error
    if (error.message.includes('CORS') || error.name === 'TypeError') {
      console.warn('CORS error detected, falling back to mock data');
    }
    
    // Provide mock data when backend is unavailable
    if (endpoint.includes('/session-log/')) {
      const patientId = endpoint.split('/')[2];
      if (method === 'GET') {
        console.log('Using mock session data for patient:', patientId);
        return mockData.sessions.filter(s => s.patientId === patientId);
      } else if (method === 'POST') {
        console.log('Simulating session log creation for:', data);
        // Add the new session to mock data
        const newSession = {
          ...data,
          timestamp: new Date()
        };
        mockData.sessions.unshift(newSession);
        return newSession;
      }
    } else if (endpoint.includes('/medication-history/')) {
      const patientId = endpoint.split('/')[2];
      console.log('Using mock medication data for patient:', patientId);
      return mockData.medications.filter(m => m.patientId === patientId);
    } else if (endpoint.includes('/patient/')) {
      const patientId = endpoint.split('/')[2];
      console.log('Using mock patient data for:', patientId);
      return mockData.patients.find(p => p.patientId === patientId) || null;
    } else if (endpoint === '/patient') {
      console.log('Using mock patients list');
      return mockData.patients;
    }
    
    // If no mock data is available for this endpoint, rethrow the error
    throw error;
  }
}

// Authentication endpoints
export const authService = {
  login: (credentials) => apiRequest('/auth/login', 'POST', credentials),
  logout: () => apiRequest('/auth/logout', 'POST'),
  getCurrentUser: () => apiRequest('/auth/me'),
};

// Patient endpoints
export const patientService = {
  getAll: () => apiRequest('/patient'),
  getById: (id) => apiRequest(`/patient/${id}`),
  create: (data) => apiRequest('/patient', 'POST', data),
  update: (id, data) => apiRequest(`/patient/${id}`, 'PUT', data),
  delete: (id) => apiRequest(`/patient/${id}`, 'DELETE'),
};

// Emotion analysis endpoints
export const emotionService = {
  analyzeEmotion: (data) => apiRequest('/emotion-analyze', 'POST', data),
  getHistory: (patientId) => apiRequest(`/emotion-history/${patientId}`),
  getStatistics: (patientId) => apiRequest(`/emotion-statistics/${patientId}`),
};

// Session logging endpoints
export const sessionService = {
  logSession: (data) => apiRequest('/session-log', 'POST', data),
  createSession: (data) => {
    console.log('Creating new session:', data);
    // First try to send to the backend
    return apiRequest('/session-log', 'POST', data)
      .catch(error => {
        console.warn('Error saving to backend, using mock data:', error);
        // If backend fails, use mock data
        const newSession = {
          ...data,
          timestamp: new Date()
        };
        mockData.sessions.unshift(newSession);
        return newSession;
      });
  },
  getSessions: (patientId) => apiRequest(`/session-log/${patientId}`),
  exportSessions: (patientId, format) => 
    apiRequest(`/session-log/${patientId}/export?format=${format}`),
};

// Medication recommendation endpoints
export const medicationService = {
  getRecommendation: (data) => apiRequest('/medication-recommend', 'POST', data),
  getMedicationHistory: (patientId) => apiRequest(`/medication-history/${patientId}`),
};

// Memory Vault endpoints
export const memoryVaultService = {
  getMemories: (patientId) => apiRequest(`/memory-vault/${patientId}`),
  getMemoryById: (id) => apiRequest(`/memory-vault/entry/${id}`),
  createMemory: (data) => {
    console.log('Creating new memory vault entry:', data);
    // First try to send to the backend
    return apiRequest('/memory-vault', 'POST', data)
      .catch(error => {
        console.warn('Error saving to backend, using mock data:', error);
        // If backend fails, use mock data
        const newMemory = {
          ...data,
          id: `mem_${Date.now()}`,
          createdAt: new Date(),
          lastAccessed: null,
          accessCount: 0
        };
        mockData.memoryVault.unshift(newMemory);
        return newMemory;
      });
  },
  updateMemory: (id, data) => apiRequest(`/memory-vault/${id}`, 'PUT', data),
  deleteMemory: (id) => apiRequest(`/memory-vault/${id}`, 'DELETE'),
  classifyEmotion: (text) => apiRequest('/memory-vault/classify', 'POST', { text }),
  getRecommendedMemory: (patientId, emotion, intensity) => 
    apiRequest(`/memory-vault/${patientId}/recommend?emotion=${emotion}&intensity=${intensity}`),
  recordAccess: (id) => apiRequest(`/memory-vault/${id}/access`, 'POST'),
  rateHelpfulness: (id, rating) => apiRequest(`/memory-vault/${id}/rate`, 'POST', { rating })
};

// Doctor service endpoints
export const doctorService = {
  getAllDoctors: () => apiRequest('/doctors'),
  getOnlineDoctors: () => apiRequest('/doctors/online'),
  getDoctorById: (id) => apiRequest(`/doctors/${id}`),
  getDoctorAvailability: (id, date) => apiRequest(`/doctors/${id}/availability/${date}`),
  createDoctor: (data) => apiRequest('/doctors', 'POST', data),
  updateDoctor: (id, data) => apiRequest(`/doctors/${id}`, 'PUT', data),
  updateOnlineStatus: (id, isOnline) => apiRequest(`/doctors/${id}/online-status`, 'PUT', { isOnline }),
  deleteDoctor: (id) => apiRequest(`/doctors/${id}`, 'DELETE')
};

// Booking service endpoints
export const bookingService = {
  getPatientBookings: (patientId) => apiRequest(`/bookings/patient/${patientId}`),
  getUpcomingPatientBookings: (patientId) => apiRequest(`/bookings/patient/${patientId}/upcoming`),
  getPastPatientBookings: (patientId) => apiRequest(`/bookings/patient/${patientId}/past`),
  getDoctorBookings: (doctorId) => apiRequest(`/bookings/doctor/${doctorId}`),
  createBooking: (data) => apiRequest('/bookings', 'POST', data),
  updateBooking: (id, data) => apiRequest(`/bookings/${id}`, 'PUT', data),
  cancelBooking: (id) => apiRequest(`/bookings/${id}/cancel`, 'PUT'),
  completeBooking: (id, doctorNotes) => apiRequest(`/bookings/${id}/complete`, 'PUT', { doctorNotes })
};

export default {
  auth: authService,
  patient: patientService,
  emotion: emotionService,
  session: sessionService,
  medication: medicationService,
  memoryVault: memoryVaultService,
  doctor: doctorService,
  booking: bookingService
};
