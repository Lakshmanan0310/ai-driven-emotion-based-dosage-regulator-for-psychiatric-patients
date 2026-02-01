/**
 * Doctor Routes
 * API routes for doctor profiles and availability
 */

const express = require('express');
const router = express.Router();
const doctorController = require('../controllers/doctorController');

// Get all doctors
router.get('/', doctorController.getAllDoctors);

// Get online doctors
router.get('/online', doctorController.getOnlineDoctors);

// Get a specific doctor by ID
router.get('/:id', doctorController.getDoctorById);

// Create a new doctor profile
router.post('/', doctorController.createDoctor);

// Update a doctor profile
router.put('/:id', doctorController.updateDoctor);

// Delete a doctor profile
router.delete('/:id', doctorController.deleteDoctor);

// Get doctor availability for a specific date
router.get('/:id/availability/:date', doctorController.getDoctorAvailability);

// Update doctor online status
router.put('/:id/online-status', doctorController.updateOnlineStatus);

module.exports = router;
