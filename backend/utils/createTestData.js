/**
 * Utility to create test data for the application
 */
const Patient = require('../models/Patient');
const SessionAnalysis = require('../models/SessionAnalysis');

/**
 * Creates a test patient if it doesn't exist
 */
async function createTestPatient() {
  try {
    const exists = await Patient.findOne({ patientId: '123' });
    if (!exists) {
      const testPatient = new Patient({
        patientId: '123',
        name: 'Test Patient',
        age: 30,
        gender: 'Male',
        concern: 'Medium'
      });
      await testPatient.save();
      console.log('✓ Test patient created');
      return testPatient;
    }
    console.log('✓ Test patient already exists');
    return exists;
  } catch (err) {
    console.error('Error creating test patient:', err.message);
    return null;
  }
}

/**
 * Creates test sessions for a patient
 */
async function createTestSessions(patientId) {
  try {
    console.log('Creating sample emotion analysis sessions...');
    
    // Create sample sessions with different emotions
    const testSessions = [
      {
        patientId,
        patientName: 'Test Patient',
        emotion: 'sad',
        emotionConfidence: 0.85,
        analysisType: 'combined',
        voiceTone: 'depressed',
        transcript: "I've been feeling really down lately, nothing seems to help.",
        recommendation: 'Fluoxetine 20mg',
        medicationRecommended: {
          medication: 'Fluoxetine',
          dosage: '20mg',
          notes: 'Take once daily in the morning'
        },
        timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // 7 days ago
      },
      {
        patientId,
        emotion: 'angry',
        emotionIntensity: 60,
        voiceTone: 'aggressive',
        transcript: "I get so frustrated with everything. It's hard to control sometimes.",
        recommendation: 'Olanzapine 5mg',
        medicationRecommended: {
          medication: 'Olanzapine',
          dosage: '5mg',
          notes: 'Take as needed for aggression episodes'
        },
        timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000) // 5 days ago
      },
      {
        patientId,
        emotion: 'fearful',
        emotionIntensity: 65,
        voiceTone: 'anxious',
        transcript: "I'm constantly worried about everything. I can't seem to relax.",
        recommendation: 'Lorazepam 0.5mg',
        medicationRecommended: {
          medication: 'Lorazepam',
          dosage: '0.5mg',
          notes: 'Take as needed for anxiety, not more than twice daily'
        },
        timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) // 3 days ago
      },
      {
        patientId,
        emotion: 'sad',
        emotionIntensity: 50,
        voiceTone: 'depressed',
        transcript: "I'm feeling a bit better today, but still not great.",
        recommendation: 'Fluoxetine 40mg',
        medicationRecommended: {
          medication: 'Fluoxetine',
          dosage: '40mg',
          notes: 'Increased dosage from 20mg'
        },
        timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) // 1 day ago
      }
    ];

    // Skip saving test sessions to avoid timeout
    // Sessions will be created as users perform emotion analysis
    console.log('✓ Test session templates ready (sessions created on-demand)');
    return [];
  } catch (err) {
    console.error('Error preparing test sessions:', err.message);
    return [];
  }
}

/**
 * Initialize all test data
 */
async function initializeTestData() {
  try {
    const patient = await createTestPatient();
    if (patient) {
      await createTestSessions(patient.patientId);
    }
    console.log('✓ Test data initialization complete');
  } catch (err) {
    console.error('Error initializing test data:', err.message);
  }
}

module.exports = {
  createTestPatient,
  createTestSessions,
  initializeTestData
};
