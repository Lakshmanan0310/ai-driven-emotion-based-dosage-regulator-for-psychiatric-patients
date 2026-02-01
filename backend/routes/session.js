/**
 * Session Routes
 * Handles session logging and retrieval
 */

const express = require('express');
const router = express.Router();
const Session = require('../models/Session');
const Patient = require('../models/Patient');
const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');

// Log a new session
router.post('/', async (req, res) => {
  try {
    const { 
      patientId, 
      emotion, 
      emotionIntensity, 
      voiceTone, 
      transcript,
      recommendation,
      notes
    } = req.body;
    
    // Validate required fields
    if (!patientId || !emotion || !voiceTone) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }
    
    try {
      // Try database operations
      // Check if patient exists
      const patient = await Patient.findOne({ patientId });
      if (!patient) {
        return res.status(404).json({ message: 'Patient not found' });
      }
      
      // Create session
      const session = new Session({
        patientId,
        emotion,
        emotionIntensity: emotionIntensity || 50,
        voiceTone,
        transcript,
        recommendation,
        medicationRecommended: {
          medication: recommendation ? recommendation.split(' ')[0] : '',
          dosage: recommendation ? recommendation.split(' ').slice(1).join(' ') : '',
          notes: notes || ''
        }
      });
      
      await session.save();
      
      // Update patient's last check-in
      await Patient.findOneAndUpdate(
        { patientId },
        { $set: { lastCheckIn: Date.now() } }
      );
      
      res.status(201).json(session);
    } catch (dbError) {
      // If database operations fail, create a mock session response
      console.log('Database error, using mock session creation:', dbError.message);
      
      // Create a mock session object
      const mockSession = {
        _id: 'mock_' + Date.now(),
        patientId,
        emotion,
        emotionIntensity: emotionIntensity || 50,
        voiceTone,
        transcript,
        recommendation,
        medicationRecommended: {
          medication: recommendation ? recommendation.split(' ')[0] : '',
          dosage: recommendation ? recommendation.split(' ').slice(1).join(' ') : '',
          notes: notes || ''
        },
        timestamp: new Date(),
        __v: 0
      };
      
      // Add to mock sessions array for future retrieval
      mockSessions.unshift(mockSession);
      
      res.status(201).json(mockSession);
    }
  } catch (error) {
    console.error('Error logging session:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Mock data for when database is unavailable
const mockSessions = [
  {
    patientId: '123',
    timestamp: new Date('2025-05-22T10:30:00'),
    emotion: 'sad',
    emotionIntensity: 75,
    voiceTone: 'depressed',
    transcript: 'I have been feeling very low lately and having trouble sleeping.',
    medicationRecommended: {
      medication: 'Sertraline',
      dosage: '25mg',
      notes: 'Take once daily in the morning. May take 2-4 weeks for full effect.'
    }
  },
  {
    patientId: '123',
    timestamp: new Date('2025-05-20T14:15:00'),
    emotion: 'angry',
    emotionIntensity: 65,
    voiceTone: 'aggressive',
    transcript: 'I feel irritated by small things and can\'t control my temper.',
    medicationRecommended: {
      medication: 'Lorazepam',
      dosage: '0.5mg',
      notes: 'Take once when feeling moderately angry. Avoid alcohol.'
    }
  },
  {
    patientId: '123',
    timestamp: new Date('2025-05-18T09:45:00'),
    emotion: 'fearful',
    emotionIntensity: 80,
    voiceTone: 'anxious',
    transcript: 'I\'m constantly worried about everything and feel on edge.',
    medicationRecommended: {
      medication: 'Buspirone',
      dosage: '5mg',
      notes: 'Take twice daily. Avoid caffeine and alcohol.'
    }
  }
];

// Get sessions for a patient
router.get('/:patientId', async (req, res) => {
  try {
    try {
      // Try to get from database first
      const sessions = await Session.find({ patientId: req.params.patientId })
        .sort({ timestamp: -1 });
      
      res.json(sessions);
    } catch (dbError) {
      // If database error, use mock data
      console.log('Database error, using mock session data:', dbError.message);
      const filteredSessions = mockSessions.filter(s => s.patientId === req.params.patientId);
      res.json(filteredSessions);
    }
  } catch (error) {
    console.error('Error fetching sessions:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get a specific session
router.get('/session/:id', async (req, res) => {
  try {
    const session = await Session.findById(req.params.id);
    
    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }
    
    res.json(session);
  } catch (error) {
    console.error('Error fetching session:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update a session with patient feedback
router.put('/feedback/:id', async (req, res) => {
  try {
    const { rating, comments } = req.body;
    
    if (!rating) {
      return res.status(400).json({ message: 'Please provide a rating' });
    }
    
    const session = await Session.findById(req.params.id);
    
    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }
    
    session.patientFeedback = {
      rating,
      comments: comments || '',
      timestamp: Date.now()
    };
    
    await session.save();
    
    res.json(session);
  } catch (error) {
    console.error('Error updating session feedback:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Export sessions to PDF
router.get('/:patientId/export', async (req, res) => {
  try {
    const { format } = req.query;
    const patientId = req.params.patientId;
    
    // Get patient and sessions
    const patient = await Patient.findOne({ patientId });
    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }
    
    const sessions = await Session.find({ patientId })
      .sort({ timestamp: -1 });
    
    if (sessions.length === 0) {
      return res.status(404).json({ message: 'No sessions found for this patient' });
    }
    
    // Create directory for exports if it doesn't exist
    const exportDir = path.join(__dirname, '../public/exports');
    if (!fs.existsSync(exportDir)) {
      fs.mkdirSync(exportDir, { recursive: true });
    }
    
    if (format === 'pdf') {
      // Generate PDF
      const pdfPath = path.join(exportDir, `${patientId}_sessions.pdf`);
      const doc = new PDFDocument();
      const stream = fs.createWriteStream(pdfPath);
      
      doc.pipe(stream);
      
      // Add title
      doc.fontSize(20).text(`Session Report for ${patient.name}`, { align: 'center' });
      doc.moveDown();
      doc.fontSize(12).text(`Patient ID: ${patientId}`);
      doc.fontSize(12).text(`Generated on: ${new Date().toLocaleString()}`);
      doc.moveDown();
      
      // Add sessions
      sessions.forEach((session, index) => {
        const sessionDate = new Date(session.timestamp).toLocaleString();
        
        doc.fontSize(14).text(`Session ${index + 1} - ${sessionDate}`);
        doc.moveDown(0.5);
        doc.fontSize(12).text(`Emotion: ${session.emotion} (${session.emotionIntensity}% intensity)`);
        doc.fontSize(12).text(`Voice Tone: ${session.voiceTone}`);
        
        if (session.transcript) {
          doc.fontSize(12).text(`Transcript: "${session.transcript}"`);
        }
        
        if (session.recommendation) {
          doc.fontSize(12).text(`Recommendation: ${session.recommendation}`);
        }
        
        if (session.medicationRecommended?.notes) {
          doc.fontSize(12).text(`Notes: ${session.medicationRecommended.notes}`);
        }
        
        doc.moveDown();
        
        // Add a separator line except for the last session
        if (index < sessions.length - 1) {
          doc.moveTo(50, doc.y)
             .lineTo(550, doc.y)
             .stroke();
          doc.moveDown();
        }
      });
      
      doc.end();
      
      // Wait for the PDF to be created
      stream.on('finish', () => {
        const pdfUrl = `/exports/${patientId}_sessions.pdf`;
        res.json({ url: pdfUrl });
      });
    } else if (format === 'csv') {
      // Generate CSV
      const csvPath = path.join(exportDir, `${patientId}_sessions.csv`);
      
      // Create CSV header
      let csvContent = 'Date,Emotion,Intensity,Voice Tone,Recommendation,Transcript\n';
      
      // Add sessions
      sessions.forEach(session => {
        const date = new Date(session.timestamp).toLocaleString();
        const emotion = session.emotion;
        const intensity = session.emotionIntensity;
        const voiceTone = session.voiceTone;
        const recommendation = session.recommendation || '';
        const transcript = session.transcript ? `"${session.transcript.replace(/"/g, '""')}"` : '';
        
        csvContent += `${date},${emotion},${intensity},${voiceTone},${recommendation},${transcript}\n`;
      });
      
      // Write CSV file
      fs.writeFileSync(csvPath, csvContent);
      
      const csvUrl = `/exports/${patientId}_sessions.csv`;
      res.json({ url: csvUrl });
    } else {
      return res.status(400).json({ message: 'Invalid export format. Use "pdf" or "csv".' });
    }
  } catch (error) {
    console.error('Error exporting sessions:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
