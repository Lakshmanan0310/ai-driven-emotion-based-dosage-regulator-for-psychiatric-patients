/**
 * Booking Model
 * Represents a patient's booking with a doctor
 */

const mongoose = require('mongoose');

const BookingSchema = new mongoose.Schema({
  patientId: {
    type: String,
    required: true,
    ref: 'Patient'
  },
  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Doctor'
  },
  bookingDate: {
    type: Date,
    required: true
  },
  startTime: {
    type: String,
    required: true
  },
  endTime: {
    type: String,
    required: true
  },
  consultationType: {
    type: String,
    enum: ['video', 'audio', 'chat'],
    default: 'video'
  },
  meetingLink: {
    type: String
  },
  status: {
    type: String,
    enum: ['scheduled', 'completed', 'cancelled', 'no-show'],
    default: 'scheduled'
  },
  patientNotes: {
    type: String
  },
  doctorNotes: {
    type: String
  },
  fee: {
    type: Number,
    required: true
  },
  isPaid: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Index for efficient querying
BookingSchema.index({ patientId: 1, bookingDate: -1 });
BookingSchema.index({ doctorId: 1, bookingDate: -1 });

module.exports = mongoose.model('Booking', BookingSchema);
