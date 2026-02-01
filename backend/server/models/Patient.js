/**
 * Patient Model
 * Represents patients in the system
 */

const mongoose = require('mongoose');

const PatientSchema = new mongoose.Schema({
  patientId: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  name: {
    type: String,
    required: true
  },
  age: {
    type: Number,
    required: true
  },
  gender: {
    type: String,
    enum: ['Male', 'Female', 'Other'],
    required: true
  },
  contactNumber: {
    type: String
  },
  email: {
    type: String,
    trim: true,
    lowercase: true
  },
  address: {
    type: String
  },
  medicalHistory: {
    type: String
  },
  currentMedications: [{
    medication: String,
    dosage: String,
    startDate: Date,
    endDate: Date
  }],
  diagnosedConditions: [{
    condition: String,
    diagnosedDate: Date,
    notes: String
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  lastCheckIn: {
    type: Date
  },
  assignedDoctor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
});

module.exports = mongoose.model('Patient', PatientSchema);
