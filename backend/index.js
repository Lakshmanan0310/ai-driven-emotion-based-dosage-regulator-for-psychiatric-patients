/**
 * AI Emotion & Voice Diagnostic Tool - Backend Server
 * Express.js server with MongoDB integration
 */

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 5001;
// Initialize test data for the application
const { initializeTestData } = require('./utils/createTestData');

// Middleware
// Use our custom CORS middleware first
const corsMiddleware = require('./middleware/cors');
app.use(corsMiddleware);

// Then apply other middleware
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// MongoDB connection with fallback to mock data mode
let dbConnected = false;

// Check if offline mode is forced
if (process.env.FORCE_OFFLINE_MODE === 'true') {
  console.log('Forced offline mode enabled. Using mock data.');
  initializeOfflineMode();
} else {
  // Try multiple connection options in sequence
  connectWithFallback();
}

async function connectWithFallback() {
  const connectionOptions = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 10000,
    connectTimeoutMS: 10000
  };

  try {
    // First attempt - standard connection
    console.log('Attempting MongoDB Atlas connection...');
    await mongoose.connect(process.env.MONGODB_URI, connectionOptions);
    console.log('MongoDB connected successfully');
    dbConnected = true;
    // Initialize test data after successful connection
    try {
      await initializeTestData();
    } catch (error) {
      console.log('Error initializing test data:', error.message);
    }
  } catch (err1) {
    console.error('Primary MongoDB connection failed:', err1.message);
    
    try {
      // Second attempt - direct connection
      console.log('Attempting direct connection to MongoDB...');
      await mongoose.connect(process.env.MONGODB_URI_DIRECT, connectionOptions);
      console.log('MongoDB connected via direct connection');
      dbConnected = true;
    } catch (err2) {
      console.error('Direct MongoDB connection failed:', err2.message);
      
      try {
        // Third attempt - local fallback
        console.log('Attempting local MongoDB connection...');
        await mongoose.connect(process.env.MONGODB_URI_LOCAL, connectionOptions);
        console.log('Connected to local MongoDB instance');
        dbConnected = true;
      } catch (err3) {
        console.error('All MongoDB connection attempts failed');
        console.log('Running in offline mode with mock data');
        initializeOfflineMode();
      }
    }
  }
}

function initializeOfflineMode() {
  // Set up mock data and offline functionality
  console.log('Initializing offline mode with mock data');
  
  // Create mock models and data structures
  global.offlineMode = true;
  
  // Setup mock data after successful connection or in offline mode
  setTimeout(() => {
    console.log('Test data initialization complete');
  }, 1000);
}

// Import routes
const authRoutes = require('./routes/auth');
const patientRoutes = require('./routes/patient');
const emotionRoutes = require('./routes/emotion');
const emotionAnalysisRoutes = require('./routes/emotionAnalysisRoutes');
const sessionRoutes = require('./routes/session');
const medicationRoutes = require('./routes/medication');
const aiRoutes = require('./routes/aiRoutes');
const memoryVaultRoutes = require('./routes/memoryVaultRoutes');
const doctorRoutes = require('./routes/doctorRoutes');
const bookingRoutes = require('./routes/bookingRoutes');

// Use routes
app.use('/api/auth', authRoutes);
app.use('/api/patient', patientRoutes);
app.use('/api/emotion-analyze', emotionRoutes);
app.use('/api/emotion-analysis', emotionAnalysisRoutes);
app.use('/api/session-log', sessionRoutes);
app.use('/api/medication-recommend', medicationRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/memory-vault', memoryVaultRoutes);
app.use('/api/doctors', doctorRoutes);
app.use('/api/bookings', bookingRoutes);

// Default route
app.get('/', (req, res) => {
  res.send('AI Emotion & Voice Diagnostic Tool API');
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;
