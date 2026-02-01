/**
 * Session Model
 * Represents a patient check-in session with emotion and voice analysis
 */

const mongoose = require('mongoose');

const SessionSchema = new mongoose.Schema({
  patientId: {
    type: String,
    required: true,
    ref: 'Patient'
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  emotion: {
    type: String,
    enum: ['happy', 'sad', 'angry', 'fearful', 'disgusted', 'surprised', 'neutral', 'aggressive', 'depressed', 'anxious'],
    required: true
  },
  emotionIntensity: {
    type: Number,
    min: 0,
    max: 100,
    required: true
  },
  voiceTone: {
    type: String,
    enum: ['aggressive', 'depressed', 'anxious', 'neutral', 'happy', 'sad', 'angry'],
    required: true
  },
  transcript: {
    type: String
  },
  facialAnalysis: {
    happy: Number,
    sad: Number,
    angry: Number,
    fearful: Number,
    disgusted: Number,
    surprised: Number,
    neutral: Number
  },
  voiceAnalysis: {
    aggressiveness: Number,
    depression: Number,
    anxiety: Number
  },
  recommendation: {
    type: String
  },
  medicationRecommended: {
    medication: String,
    dosage: String,
    notes: String
  },
  doctorOverride: {
    overridden: {
      type: Boolean,
      default: false
    },
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    notes: String,
    timestamp: Date
  },
  patientFeedback: {
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    comments: String,
    timestamp: Date
  }
});

// Index for efficient querying by patient
SessionSchema.index({ patientId: 1, timestamp: -1 });

module.exports = mongoose.model('Session', SessionSchema);
