/**
 * Emotion Analysis Routes
 * Handles saving and retrieving emotion analysis results
 */

const express = require('express');
const router = express.Router();
const SessionAnalysis = require('../models/SessionAnalysis');
const Patient = require('../models/Patient');

/**
 * Save emotion analysis result
 * POST /api/emotion-analysis
 */
router.post('/', async (req, res) => {
  try {
    const {
      patientId,
      patientName,
      emotion,
      emotionConfidence,
      analysisType,
      voiceTone,
      transcript,
      emotionHistory,
      recommendation,
      notes
    } = req.body;

    // Validate required fields
    if (!patientId || !emotion || !emotionConfidence) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: patientId, emotion, emotionConfidence'
      });
    }

    // Create new session analysis
    const sessionAnalysis = new SessionAnalysis({
      patientId,
      patientName: patientName || 'Unknown',
      emotion,
      emotionConfidence,
      analysisType: analysisType || 'combined',
      voiceTone: voiceTone || 'neutral',
      transcript: transcript || '',
      emotionHistory: emotionHistory || [],
      recommendation: recommendation || {},
      notes: notes || ''
    });

    // Save to database
    const savedSession = await sessionAnalysis.save();

    console.log(`✓ Emotion analysis saved for patient ${patientId}`);

    res.status(201).json({
      success: true,
      message: 'Emotion analysis saved successfully',
      data: savedSession
    });

  } catch (error) {
    console.error('Error saving emotion analysis:', error.message);
    res.status(500).json({
      success: false,
      message: 'Error saving emotion analysis',
      error: error.message
    });
  }
});

/**
 * Get emotion analysis history for a patient
 * GET /api/emotion-analysis/:patientId
 */
router.get('/:patientId', async (req, res) => {
  try {
    const { patientId } = req.params;
    const { limit = 10, skip = 0 } = req.query;

    // Fetch emotion analysis records sorted by newest first
    const analyses = await SessionAnalysis.find({ patientId })
      .sort({ timestamp: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(skip));

    // Get total count for pagination
    const total = await SessionAnalysis.countDocuments({ patientId });

    res.json({
      success: true,
      data: analyses,
      pagination: {
        total,
        limit: parseInt(limit),
        skip: parseInt(skip),
        hasMore: parseInt(skip) + parseInt(limit) < total
      }
    });

  } catch (error) {
    console.error('Error fetching emotion analysis:', error.message);
    res.status(500).json({
      success: false,
      message: 'Error fetching emotion analysis',
      error: error.message
    });
  }
});

/**
 * Get latest emotion analysis for a patient
 * GET /api/emotion-analysis/:patientId/latest
 */
router.get('/:patientId/latest', async (req, res) => {
  try {
    const { patientId } = req.params;

    // Fetch the most recent analysis
    const latest = await SessionAnalysis.findOne({ patientId })
      .sort({ timestamp: -1 });

    if (!latest) {
      return res.status(404).json({
        success: false,
        message: 'No emotion analysis found for this patient'
      });
    }

    res.json({
      success: true,
      data: latest
    });

  } catch (error) {
    console.error('Error fetching latest emotion analysis:', error.message);
    res.status(500).json({
      success: false,
      message: 'Error fetching latest emotion analysis',
      error: error.message
    });
  }
});

/**
 * Get emotion analysis for doctor's dashboard
 * GET /api/emotion-analysis/doctor/all
 */
router.get('/doctor/all', async (req, res) => {
  try {
    const { limit = 50 } = req.query;

    // Get latest emotion analyses across all patients
    const allAnalyses = await SessionAnalysis.find()
      .sort({ timestamp: -1 })
      .limit(parseInt(limit));

    // Group by patient
    const groupedByPatient = {};
    allAnalyses.forEach(analysis => {
      if (!groupedByPatient[analysis.patientId]) {
        groupedByPatient[analysis.patientId] = {
          patientId: analysis.patientId,
          patientName: analysis.patientName,
          latestAnalysis: analysis,
          recentEmotions: []
        };
      }
      if (groupedByPatient[analysis.patientId].recentEmotions.length < 5) {
        groupedByPatient[analysis.patientId].recentEmotions.push(analysis);
      }
    });

    res.json({
      success: true,
      data: Object.values(groupedByPatient)
    });

  } catch (error) {
    console.error('Error fetching doctor dashboard data:', error.message);
    res.status(500).json({
      success: false,
      message: 'Error fetching doctor dashboard data',
      error: error.message
    });
  }
});

/**
 * Update emotion analysis with doctor review
 * PUT /api/emotion-analysis/:id/review
 */
router.put('/:id/review', async (req, res) => {
  try {
    const { id } = req.params;
    const { reviewedBy, reviewNotes } = req.body;

    const updated = await SessionAnalysis.findByIdAndUpdate(
      id,
      {
        'doctorReview.reviewed': true,
        'doctorReview.reviewedBy': reviewedBy,
        'doctorReview.reviewNotes': reviewNotes,
        'doctorReview.reviewedAt': new Date()
      },
      { new: true }
    );

    res.json({
      success: true,
      message: 'Analysis reviewed',
      data: updated
    });

  } catch (error) {
    console.error('Error updating analysis:', error.message);
    res.status(500).json({
      success: false,
      message: 'Error updating analysis',
      error: error.message
    });
  }
});

module.exports = router;
