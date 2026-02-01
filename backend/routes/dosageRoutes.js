const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');

// Get medication history for a patient
router.get('/history/:patientId', auth, (req, res) => {
  // This would connect to a controller function
  // For now, returning mock data
  const medicationHistory = [
    { 
      date: '01/05/2025', 
      medication: 'Fluoxetine', 
      dosage: '20mg', 
      prescribedFor: 'Depression' 
    },
    { 
      date: '07/05/2025', 
      medication: 'Fluoxetine', 
      dosage: '40mg', 
      prescribedFor: 'Depression (Increased)' 
    },
    { 
      date: '15/05/2025', 
      medication: 'Fluoxetine + Lorazepam', 
      dosage: '40mg + 0.5mg', 
      prescribedFor: 'Depression + Anxiety' 
    },
    { 
      date: '19/05/2025', 
      medication: 'Olanzapine', 
      dosage: '5mg', 
      prescribedFor: 'Aggression' 
    }
  ];
  
  res.json(medicationHistory);
});

// Add new medication record
router.post('/add', auth, (req, res) => {
  // This would connect to a controller function
  // For now, just returning success
  res.json({ success: true, message: 'Medication record added successfully' });
});

// Get medication suggestions based on emotion data
router.get('/suggest/:patientId', auth, (req, res) => {
  // This would connect to a controller function
  // For now, returning mock suggestion
  const suggestion = {
    medication: 'Fluoxetine',
    dosage: '20mg',
    reason: 'Depression',
    notes: 'Patient showing consistent signs of depression over the past week'
  };
  
  res.json(suggestion);
});

module.exports = router;
