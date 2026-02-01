// Emotion controller for handling emotion-related operations

// Get emotions for a specific patient
exports.getPatientEmotions = async (req, res) => {
  try {
    const { patientId } = req.params;
    
    // This would normally fetch from a database
    // For now, returning mock data
    const emotions = [
      { date: '2025-05-01', emotion: 'neutral', intensity: 0.4 },
      { date: '2025-05-03', emotion: 'sad', intensity: 0.3 },
      { date: '2025-05-05', emotion: 'happy', intensity: 0.6 },
      { date: '2025-05-07', emotion: 'anxious', intensity: 0.5 },
      { date: '2025-05-09', emotion: 'sad', intensity: 0.4 },
      { date: '2025-05-11', emotion: 'angry', intensity: 0.3 },
      { date: '2025-05-13', emotion: 'neutral', intensity: 0.2 },
      { date: '2025-05-15', emotion: 'happy', intensity: 0.5 },
      { date: '2025-05-17', emotion: 'sad', intensity: 0.3 },
      { date: '2025-05-19', emotion: 'anxious', intensity: 0.6 },
      { date: '2025-05-21', emotion: 'happy', intensity: 0.7 }
    ];
    
    res.json(emotions);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Record a new emotion
exports.recordEmotion = async (req, res) => {
  try {
    const { patientId, emotion, intensity, source } = req.body;
    
    // This would normally save to a database
    // For now, just returning success
    res.json({ 
      success: true, 
      message: 'Emotion recorded successfully',
      data: { patientId, emotion, intensity, source, timestamp: new Date() }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get emotion statistics
exports.getEmotionStats = async (req, res) => {
  try {
    const { patientId } = req.params;
    
    // This would normally calculate from database
    // For now, returning mock stats
    const stats = {
      totalSessions: 24,
      dominantEmotion: 'sad',
      averageAggression: 0.35,
      averageDepression: 0.42,
      averageAnxiety: 0.51,
      recentTrend: 'improving'
    };
    
    res.json(stats);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get emotion trends
exports.getEmotionTrends = async (req, res) => {
  try {
    const { patientId } = req.params;
    
    // This would normally calculate from database
    // For now, returning mock trend data
    const trends = [
      { date: '2025-05-01', depression: 0.2, aggression: 0.5, anxiety: 0.2 },
      { date: '2025-05-03', depression: 0.3, aggression: 0.4, anxiety: 0.4 },
      { date: '2025-05-05', depression: 0.4, aggression: 0.3, anxiety: 0.3 },
      { date: '2025-05-07', depression: 0.3, aggression: 0.3, anxiety: 0.2 },
      { date: '2025-05-09', depression: 0.5, aggression: 0.4, anxiety: 0.3 },
      { date: '2025-05-11', depression: 0.6, aggression: 0.2, anxiety: 0.4 },
      { date: '2025-05-13', depression: 0.4, aggression: 0.1, anxiety: 0.3 },
      { date: '2025-05-15', depression: 0.3, aggression: 0.3, anxiety: 0.5 },
      { date: '2025-05-17', depression: 0.2, aggression: 0.4, anxiety: 0.4 },
      { date: '2025-05-19', depression: 0.3, aggression: 0.5, anxiety: 0.6 },
      { date: '2025-05-21', depression: 0.4, aggression: 0.7, anxiety: 0.5 }
    ];
    
    res.json(trends);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};
