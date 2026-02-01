/**
 * Patient Routes
 * Handles patient CRUD operations
 */

const express = require('express');
const router = express.Router();
const Patient = require('../models/Patient');

// Get all patients
router.get('/', async (req, res) => {
  try {
    const patients = await Patient.find().sort({ name: 1 });
    res.json(patients);
  } catch (error) {
    console.error('Error fetching patients:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get patient by ID
router.get('/:id', async (req, res) => {
  try {
    const patient = await Patient.findOne({ patientId: req.params.id });
    
    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }
    
    res.json(patient);
  } catch (error) {
    console.error('Error fetching patient:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create new patient
router.post('/', async (req, res) => {
  try {
    const { 
      patientId, 
      name, 
      age, 
      gender, 
      contactNumber, 
      email, 
      address, 
      medicalHistory,
      assignedDoctor 
    } = req.body;
    
    // Validate required fields
    if (!patientId || !name || !age || !gender) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }
    
    // Check if patient exists
    let patient = await Patient.findOne({ patientId });
    if (patient) {
      return res.status(400).json({ message: 'Patient ID already exists' });
    }
    
    // Create patient
    patient = new Patient({
      patientId,
      name,
      age,
      gender,
      contactNumber,
      email,
      address,
      medicalHistory,
      assignedDoctor
    });
    
    await patient.save();
    
    res.status(201).json(patient);
  } catch (error) {
    console.error('Error creating patient:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update patient
router.put('/:id', async (req, res) => {
  try {
    const { 
      name, 
      age, 
      gender, 
      contactNumber, 
      email, 
      address, 
      medicalHistory,
      currentMedications,
      diagnosedConditions,
      assignedDoctor 
    } = req.body;
    
    // Build patient object
    const patientFields = {};
    if (name) patientFields.name = name;
    if (age) patientFields.age = age;
    if (gender) patientFields.gender = gender;
    if (contactNumber) patientFields.contactNumber = contactNumber;
    if (email) patientFields.email = email;
    if (address) patientFields.address = address;
    if (medicalHistory) patientFields.medicalHistory = medicalHistory;
    if (currentMedications) patientFields.currentMedications = currentMedications;
    if (diagnosedConditions) patientFields.diagnosedConditions = diagnosedConditions;
    if (assignedDoctor) patientFields.assignedDoctor = assignedDoctor;
    
    // Update patient
    let patient = await Patient.findOne({ patientId: req.params.id });
    
    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }
    
    patient = await Patient.findOneAndUpdate(
      { patientId: req.params.id },
      { $set: patientFields },
      { new: true }
    );
    
    res.json(patient);
  } catch (error) {
    console.error('Error updating patient:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete patient
router.delete('/:id', async (req, res) => {
  try {
    // Find patient
    const patient = await Patient.findOne({ patientId: req.params.id });
    
    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }
    
    // Delete patient
    await Patient.findOneAndRemove({ patientId: req.params.id });
    
    res.json({ message: 'Patient removed' });
  } catch (error) {
    console.error('Error deleting patient:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
