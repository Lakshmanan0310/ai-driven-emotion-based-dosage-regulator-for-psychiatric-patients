/**
 * Session Model
 * Stores emotion analysis results with patient and temporal data
 */

const mongoose = require('mongoose');

const SessionSchema = new mongoose.Schema({
  patientId: {
    type: String,
    required: true,
    index: true
  },
  patientName: {
    type: String
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  },
  emotion: {
    type: String,
    enum: ['happy', 'sad', 'angry', 'fearful', 'disgusted', 'surprised', 'neutral'],
    required: true
  },
  emotionConfidence: {
    type: Number,
    min: 0,
    max: 1,
    required: true
  },
  analysisType: {
    type: String,
    enum: ['facial', 'voice', 'combined'],
    default: 'combined'
  },
  voiceTone: {
    type: String,
    enum: ['aggressive', 'depressed', 'anxious', 'neutral', 'happy', 'sad', 'angry', 'surprised'],
    default: 'neutral'
  },
  transcript: {
    type: String,
    default: ''
  },
  duration: {
    type: Number, // in seconds
    default: 20
  },
  emotionHistory: [{
    emotion: String,
    confidence: Number,
    timestamp: { type: Date, default: Date.now }
  }],
  recommendation: {
    medication: String,
    dosage: String,
    advice: String
  },
  notes: {
    type: String,
    default: ''
  },
  doctorReview: {
    reviewed: { type: Boolean, default: false },
    reviewedBy: String,
    reviewNotes: String,
    reviewedAt: Date
  }
});

// Index for faster queries
SessionSchema.index({ patientId: 1, timestamp: -1 });
SessionSchema.index({ timestamp: -1 });

module.exports = mongoose.model('Session', SessionSchema);
