/**
 * Medication Model
 * Represents medication recommendations and prescriptions
 */

const mongoose = require('mongoose');

const MedicationSchema = new mongoose.Schema({
  patientId: {
    type: String,
    required: true,
    ref: 'Patient'
  },
  medication: {
    type: String,
    required: true
  },
  dosage: {
    type: String,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  reason: {
    type: String,
    required: true
  },
  basedOnEmotion: {
    emotion: String,
    intensity: Number,
    voiceTone: String
  },
  sessionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Session'
  },
  prescribedBy: {
    type: String,
    enum: ['AI', 'doctor'],
    default: 'AI'
  },
  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  notes: {
    type: String
  },
  active: {
    type: Boolean,
    default: true
  },
  endDate: {
    type: Date
  },
  sideEffectsReported: [{
    effect: String,
    severity: {
      type: String,
      enum: ['mild', 'moderate', 'severe']
    },
    reportedDate: Date,
    notes: String
  }]
});

// Index for efficient querying
MedicationSchema.index({ patientId: 1, timestamp: -1 });
MedicationSchema.index({ patientId: 1, active: 1 });

module.exports = mongoose.model('Medication', MedicationSchema);
