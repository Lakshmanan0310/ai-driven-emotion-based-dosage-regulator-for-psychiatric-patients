/**
 * Booking Routes
 * API routes for doctor bookings
 */

const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');

// Get all bookings for a patient
router.get('/patient/:patientId', bookingController.getPatientBookings);

// Get upcoming bookings for a patient
router.get('/patient/:patientId/upcoming', bookingController.getUpcomingPatientBookings);

// Get past bookings for a patient
router.get('/patient/:patientId/past', bookingController.getPastPatientBookings);

// Get all bookings for a doctor
router.get('/doctor/:doctorId', bookingController.getDoctorBookings);

// Create a new booking
router.post('/', bookingController.createBooking);

// Update a booking
router.put('/:id', bookingController.updateBooking);

// Cancel a booking
router.put('/:id/cancel', bookingController.cancelBooking);

// Complete a booking
router.put('/:id/complete', bookingController.completeBooking);

module.exports = router;
