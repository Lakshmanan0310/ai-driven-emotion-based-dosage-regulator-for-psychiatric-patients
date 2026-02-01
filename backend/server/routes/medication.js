/**
 * Medication Routes
 * Handles medication recommendations and history
 */

const express = require('express');
const router = express.Router();
const Medication = require('../models/Medication');
const Patient = require('../models/Patient');

// Get medication recommendation
router.post('/', async (req, res) => {
  try {
    const { 
      patientId, 
      emotion, 
      intensity, 
      voiceTone,
      overrideMedication,
      overrideDosage,
      notes,
      doctorOverride,
      doctorId
    } = req.body;
    
    // Validate required fields
    if (!patientId) {
      return res.status(400).json({ message: 'Please provide patient ID' });
    }
    
    // Check if patient exists
    const patient = await Patient.findOne({ patientId });
    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }
    
    // If this is a doctor override, create a direct medication entry
    if (doctorOverride && overrideMedication && overrideDosage) {
      const medication = new Medication({
        patientId,
        medication: overrideMedication,
        dosage: overrideDosage,
        reason: 'Doctor prescription',
        prescribedBy: 'doctor',
        doctorId,
        notes: notes || 'Prescribed by doctor'
      });
      
      await medication.save();
      
      // Update patient's current medications
      await Patient.findOneAndUpdate(
        { patientId },
        { 
          $push: { 
            currentMedications: {
              medication: overrideMedication,
              dosage: overrideDosage,
              startDate: new Date()
            } 
          } 
        }
      );
      
      return res.json({
        medication: overrideMedication,
        dosage: overrideDosage,
        advice: notes || 'Follow doctor\'s instructions',
        prescribedBy: 'doctor'
      });
    }
    
    // For AI recommendations, we would typically use the emotion analysis service
    // Here we'll just forward to the emotion analysis endpoint
    // In a real app, you might have more sophisticated logic here
    
    res.json({
      message: 'Please use the emotion analysis endpoint for AI recommendations'
    });
  } catch (error) {
    console.error('Medication recommendation error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get medication history for a patient
router.get('/history/:patientId', async (req, res) => {
  try {
    const medications = await Medication.find({ patientId: req.params.patientId })
      .sort({ timestamp: -1 });
    
    res.json(medications);
  } catch (error) {
    console.error('Error fetching medication history:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get current medication for a patient
router.get('/current/:patientId', async (req, res) => {
  try {
    const medication = await Medication.findOne({ 
      patientId: req.params.patientId,
      active: true
    }).sort({ timestamp: -1 });
    
    if (!medication) {
      return res.status(404).json({ message: 'No active medication found' });
    }
    
    res.json(medication);
  } catch (error) {
    console.error('Error fetching current medication:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Report side effects for a medication
router.post('/side-effects/:id', async (req, res) => {
  try {
    const { effect, severity, notes } = req.body;
    
    if (!effect || !severity) {
      return res.status(400).json({ message: 'Please provide effect and severity' });
    }
    
    const medication = await Medication.findById(req.params.id);
    
    if (!medication) {
      return res.status(404).json({ message: 'Medication not found' });
    }
    
    medication.sideEffectsReported.push({
      effect,
      severity,
      reportedDate: new Date(),
      notes: notes || ''
    });
    
    await medication.save();
    
    res.json(medication);
  } catch (error) {
    console.error('Error reporting side effects:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Discontinue a medication
router.put('/discontinue/:id', async (req, res) => {
  try {
    const { reason } = req.body;
    
    const medication = await Medication.findById(req.params.id);
    
    if (!medication) {
      return res.status(404).json({ message: 'Medication not found' });
    }
    
    medication.active = false;
    medication.endDate = new Date();
    
    if (reason) {
      medication.notes = medication.notes 
        ? `${medication.notes}\nDiscontinued: ${reason}`
        : `Discontinued: ${reason}`;
    }
    
    await medication.save();
    
    // Update patient's current medications
    await Patient.findOneAndUpdate(
      { patientId: medication.patientId, 'currentMedications.medication': medication.medication },
      { $set: { 'currentMedications.$.endDate': new Date() } }
    );
    
    res.json(medication);
  } catch (error) {
    console.error('Error discontinuing medication:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
