/**
 * Test script for voice-only analysis
 */
const axios = require('axios');

// Test data for voice-only analysis
const testData = {
  patientId: '123',
  transcript: "I'm feeling really anxious today. My heart is racing and I can't stop worrying about everything.",
  audioMetadata: {
    speakingRate: "fast",
    pitch: "high",
    volume: "variable",
    tonality: "anxious"
  }
};

// Call the combined analysis API with voice data only
async function testVoiceOnlyAnalysis() {
  try {
    console.log('\n=== TESTING VOICE-ONLY ANALYSIS ===');
    console.log('Sending test request with voice data only...');
    
    const response = await axios.post('http://localhost:5002/api/ai/analyze-combined', testData);
    
    console.log('\n--- API Response ---');
    console.log('Success:', response.data.success);
    
    if (response.data.voiceAnalysis) {
      console.log('\nVoice Analysis:');
      console.log(JSON.stringify(response.data.voiceAnalysis, null, 2));
    }
    
    if (response.data.comprehensiveAnalysis) {
      console.log('\nComprehensive Analysis:');
      console.log('Primary Emotional State:', response.data.comprehensiveAnalysis.primaryEmotionalState);
      console.log('Treatment Plan:', response.data.comprehensiveAnalysis.treatmentPlan.medication);
    }
    
    return true;
  } catch (error) {
    console.error('Error testing voice-only analysis:', error.response ? 
      error.response.data : error.message);
    return false;
  }
}

// Run the test
testVoiceOnlyAnalysis();
