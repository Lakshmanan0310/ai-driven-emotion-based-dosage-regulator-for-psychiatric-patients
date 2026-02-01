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
const PORT = process.env.PORT || 5000;
// Add this near the bottom of index.js before app.listen()
// Create test patient if it doesn't exist
const Patient = require('./models/Patient');
async function createTestPatient() {
  try {
    const exists = await Patient.findOne({ patientId: '123' });
    if (!exists) {
      const testPatient = new Patient({
        patientId: '123',
        name: 'Test Patient',
        age: 30,
        gender: 'Male'
      });
      await testPatient.save();
      console.log('Test patient created');
    }
  } catch (err) {
    console.error('Error creating test patient:', err);
  }
}
createTestPatient();

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/emotion-diagnostic-tool', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected'))
.catch(err => console.error('MongoDB connection error:', err));

// Import routes
const authRoutes = require('./routes/auth');
const patientRoutes = require('./routes/patient');
const emotionRoutes = require('./routes/emotion');
const sessionRoutes = require('./routes/session');
const medicationRoutes = require('./routes/medication');

// Use routes
app.use('/api/auth', authRoutes);
app.use('/api/patient', patientRoutes);
app.use('/api/emotion-analyze', emotionRoutes);
app.use('/api/session-log', sessionRoutes);
app.use('/api/medication-recommend', medicationRoutes);

// Default route
app.get('/', (req, res) => {
  res.send('AI Emotion & Voice Diagnostic Tool API');
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;
