/**
 * API utility functions for communicating with the backend
 */

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

/**
 * Generic request function with authentication
 * @param {string} endpoint - API endpoint
 * @param {string} method - HTTP method
 * @param {object} data - Request body data
 * @returns {Promise} - Response data
 */
const request = async (endpoint, method = 'GET', data = null) => {
  const token = localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json',
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  const config = {
    method,
    headers,
  };
  
  if (data) {
    config.body = JSON.stringify(data);
  }
  
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Something went wrong');
    }
    
    return await response.json();
  } catch (error) {
    console.error('API request error:', error);
    throw error;
  }
};

// Authentication API calls
export const authAPI = {
  login: (credentials) => request('/auth/login', 'POST', credentials),
  register: (userData) => request('/auth/register', 'POST', userData),
  getCurrentUser: () => request('/auth/me'),
};

// Patient API calls
export const patientAPI = {
  getPatients: () => request('/patient'),
  getPatientById: (id) => request(`/patient/${id}`),
  updatePatient: (id, data) => request(`/patient/${id}`, 'PUT', data),
  createPatient: (data) => request('/patient', 'POST', data),
};

// Emotion API calls
export const emotionAPI = {
  getPatientEmotions: (patientId) => request(`/emotion/patient/${patientId}`),
  recordEmotion: (data) => request('/emotion/record', 'POST', data),
  getEmotionStats: (patientId) => request(`/emotion/stats/${patientId}`),
  getEmotionTrends: (patientId) => request(`/emotion/trends/${patientId}`),
};

// Medication API calls
export const medicationAPI = {
  getMedicationHistory: (patientId) => request(`/dosage/history/${patientId}`),
  addMedication: (data) => request('/dosage/add', 'POST', data),
  getMedicationSuggestion: (patientId) => request(`/dosage/suggest/${patientId}`),
};

// Session API calls
export const sessionAPI = {
  getPatientSessions: (patientId) => request(`/session/patient/${patientId}`),
  createSession: (data) => request('/session', 'POST', data),
  updateSession: (id, data) => request(`/session/${id}`, 'PUT', data),
};

export default {
  authAPI,
  patientAPI,
  emotionAPI,
  medicationAPI,
  sessionAPI,
};
