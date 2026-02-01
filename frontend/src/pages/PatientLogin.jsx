import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaUser, FaLock, FaArrowLeft } from 'react-icons/fa';
import { useTheme, ThemeSwitcher } from '../ThemeContext';
import { authService } from '../services/api';

const PatientLogin = () => {
  const { currentTheme, themes } = useTheme();
  const theme = themes[currentTheme];
  const [credentials, setCredentials] = useState({
    username: '',
    password: ''
  });
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const navigate = useNavigate();
  
  // Handle input change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCredentials(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Handle login submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    
    if (!credentials.username || !credentials.password) {
      setError('Please enter both username and password');
      return;
    }
    
    setIsLoading(true);
    
    try {
      // In a real app, authenticate with the backend
      // For now, we'll just navigate to the patient page
      // const response = await authService.patientLogin(credentials);
      navigate(`/patient/${credentials.username}`);
    } catch (err) {
      console.error('Login error:', err);
      setError('Invalid credentials. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className={`min-h-screen ${theme.background} flex flex-col`}>
      <header className="py-6 px-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className={`text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r ${theme.primary}`}>
            AI Emotion & Voice Diagnostic Tool
          </h1>
          <ThemeSwitcher />
        </div>
      </header>
      
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`${theme.cardBg} rounded-2xl ${theme.shadow} overflow-hidden`}
          >
            <div className="p-8">
              <div className="flex items-center mb-6">
                <button 
                  onClick={() => navigate('/')}
                  className={`mr-4 p-2 rounded-full ${theme.accentHover}`}
                >
                  <FaArrowLeft className={theme.accent} />
                </button>
                <h2 className={`text-2xl font-bold ${theme.text}`}>
                  Patient Login
                </h2>
              </div>
              
              {error && (
                <div className="bg-red-100 text-red-800 p-4 rounded-lg mb-6">
                  {error}
                </div>
              )}
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="username" className={`block text-sm font-medium ${theme.text} mb-1`}>
                    Username
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      id="username"
                      name="username"
                      value={credentials.username}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-2 pl-10 border ${theme.border} rounded-lg focus:ring-purple-500 focus:border-purple-500 ${theme.inputBg} ${theme.inputText}`}
                      placeholder="Enter your username"
                    />
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FaUser className={theme.icon} />
                    </div>
                  </div>
                </div>
                
                <div>
                  <label htmlFor="password" className={`block text-sm font-medium ${theme.text} mb-1`}>
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type="password"
                      id="password"
                      name="password"
                      value={credentials.password}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-2 pl-10 border ${theme.border} rounded-lg focus:ring-purple-500 focus:border-purple-500 ${theme.inputBg} ${theme.inputText}`}
                      placeholder="Enter your password"
                    />
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FaLock className={theme.icon} />
                    </div>
                  </div>
                </div>
                
                <div>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className={`w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-white font-medium ${currentTheme === 'light' ? 'bg-purple-600 hover:bg-purple-700 focus:ring-purple-500' : 'bg-purple-700 hover:bg-purple-800 focus:ring-purple-600'} focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors`}
                  >
                    {isLoading ? (
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    ) : (
                      'Login'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </div>
      </main>
      
      <footer className={`py-6 px-4 text-center ${theme.subtext} text-sm`}>
        <p>AI Emotion & Voice Diagnostic Tool for Mental Healthcare © {new Date().getFullYear()}</p>
      </footer>
    </div>
  );
};

export default PatientLogin;
