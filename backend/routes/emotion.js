const express = require('express');
const axios = require('axios');
const router = express.Router();

const auth = require('../middleware/auth');
const emotionController = require('../controllers/emotionController');

/**
 * ================================
 * EXISTING ROUTES (DO NOT CHANGE)
 * ================================
 */

// Get emotions for a patient
router.get(
  '/patient/:patientId',
  auth,
  emotionController.getPatientEmotions
);

// Record new emotion
router.post(
  '/record',
  auth,
  emotionController.recordEmotion
);

// Get emotion statistics
router.get(
  '/stats/:patientId',
  auth,
  emotionController.getEmotionStats
);

// Get emotion trends
router.get(
  '/trends/:patientId',
  auth,
  emotionController.getEmotionTrends
);

/**
 * =========================================
 * NEW AI ROUTE (HuggingFace / Python backend)
 * =========================================
 *
 * Frontend sends final frame as base64
 * Node forwards it to Python AI service
 * Python returns emotion + confidence
 */

// Final AI-based face emotion analysis
router.post('/ai/final-face', auth, async (req, res) => {
  try {
    const { image } = req.body;

    if (!image) {
      return res.status(400).json({
        error: 'Image (base64) is required'
      });
    }

    // Forward image to Python AI service
    const aiResponse = await axios.post(
      'http://localhost:8000/analyze-face',
      { image },
      {
        timeout: 15000,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    // Return AI result to frontend
    return res.json({
      source: 'huggingface-affectnet',
      emotion: aiResponse.data.emotion,
      confidence: aiResponse.data.confidence,
      raw: aiResponse.data
    });

  } catch (error) {
    console.error('AI face emotion error:', error.message);

    return res.status(500).json({
      error: 'AI emotion analysis failed',
      details: error.message
    });
  }
});

module.exports = router;
