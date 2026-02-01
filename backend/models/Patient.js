const mongoose = require('mongoose');

const PatientSchema = new mongoose.Schema({
  patientId: {
    type: String,
    required: true,
    unique: true
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
    required: true
  },
  diagnosis: {
    type: String,
    default: 'Undiagnosed'
  },
  currentMedication: {
    type: String,
    default: 'None'
  },
  concern: {
    type: String,
    enum: ['Low', 'Medium', 'High'],
    default: 'Low'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Patient', PatientSchema);
