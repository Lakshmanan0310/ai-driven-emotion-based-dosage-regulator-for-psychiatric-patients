/**
 * Memory Vault Model
 * Represents a patient's memory vault entry for emotional anchoring
 */

const mongoose = require('mongoose');

const MemoryVaultSchema = new mongoose.Schema({
  patientId: {
    type: String,
    required: true,
    ref: 'Patient'
  },
  title: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: true
  },
  contentType: {
    type: String,
    enum: ['text', 'audio', 'video'],
    default: 'text'
  },
  mediaUrl: {
    type: String
  },
  emotionTags: [{
    type: String,
    enum: ['joy', 'peace', 'pride', 'strength', 'love', 'gratitude', 'hope', 'serenity', 'amusement', 'awe'],
  }],
  dominantEmotion: {
    type: String
  },
  emotionIntensity: {
    type: Number,
    min: 0,
    max: 100,
    default: 70
  },
  isCaregiver: {
    type: Boolean,
    default: false
  },
  caregiverName: {
    type: String
  },
  triggerCondition: {
    emotion: {
      type: String,
      enum: ['sad', 'angry', 'fearful', 'disgusted', 'depressed', 'anxious', 'aggressive', 'any'],
      default: 'any'
    },
    intensity: {
      type: Number,
      min: 0,
      max: 100,
      default: 50
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  lastAccessed: {
    type: Date
  },
  accessCount: {
    type: Number,
    default: 0
  },
  helpfulnessRating: {
    type: Number,
    min: 1,
    max: 5
  }
});

// Index for efficient querying by patient and emotions
MemoryVaultSchema.index({ patientId: 1, createdAt: -1 });
MemoryVaultSchema.index({ patientId: 1, emotionTags: 1 });
MemoryVaultSchema.index({ patientId: 1, dominantEmotion: 1 });

module.exports = mongoose.model('MemoryVault', MemoryVaultSchema);
