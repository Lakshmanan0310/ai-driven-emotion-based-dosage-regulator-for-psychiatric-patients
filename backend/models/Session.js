/**
 * Create a session log for emotion analysis
 * Supports facial, voice, and combined analysis
 */
export const sessionService = {
  async createSession({
    patientId,
    emotion,
    emotionIntensity,
    analysisType,
    voiceTone = null,
    transcript = '',
    medication = 'No specific medication',
    dosage = 'N/A',
    advice = 'Continue monitoring symptoms'
  }) {
    try {
      const payload = {
        patientId,
        emotion,
        emotionIntensity,
        analysisType,
        voiceTone,
        transcript,
        medication,
        dosage,
        advice
      };

      console.log('📤 Sending session log:', payload);

      const response = await fetch('/api/session-log', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('✅ Session log saved:', data);
      return data;

    } catch (error) {
      console.error('❌ Session log error:', error.response?.data || error.message);

      // Fallback to mock mode if backend fails
      return {
        status: 'mock',
        message: 'Backend unavailable, mock session saved',
        data: {
          patientId,
          emotion,
          emotionIntensity,
          analysisType,
          medication,
          dosage,
          advice,
          timestamp: new Date().toISOString()
        }
      };
    }
  }
};
