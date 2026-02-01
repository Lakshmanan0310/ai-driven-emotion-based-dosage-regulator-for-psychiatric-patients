/**
 * Test script for the combined 15-second analysis API
 */
const axios = require('axios');

// Test data for combined face and voice analysis (15 seconds)
const combinedAnalysisData = {
  transcript: "I've been feeling really stressed lately. Work has been overwhelming and I'm not sleeping well. I keep worrying about deadlines and my heart races when I think about all the things I need to do. Sometimes I feel like I can't catch my breath.",
  facialData: "data:image/placeholder", // This would be a base64 image in a real application
  patientId: "123", // Use test patient ID
  audioMetadata: {
    speakingRate: "fast",
    pitch: "high",
    volume: "variable",
    tonality: "anxious"
  }
};

// Call the API for combined 15-second analysis
async function testCombinedAnalysis() {
  try {
    console.log('\n=== TESTING COMBINED 15-SECOND ANALYSIS ===');
    console.log('Sending test request with facial and voice data for 15-second analysis...');
    const response = await axios.post('http://localhost:5002/api/ai/analyze-combined', combinedAnalysisData);
    
    console.log('\n--- API Response ---');
    console.log('Success:', response.data.success);
    
    if (response.data.facialAnalysis) {
      console.log('\nFacial Analysis:');
      console.log(JSON.stringify(response.data.facialAnalysis, null, 2));
    }
    
    if (response.data.voiceAnalysis) {
      console.log('\nVoice Analysis:');
      console.log(JSON.stringify(response.data.voiceAnalysis, null, 2));
    }
    
    if (response.data.combinedAnalysis) {
      console.log('\nCombined Analysis:');
      console.log(JSON.stringify(response.data.combinedAnalysis, null, 2));
    }
    
    if (response.data.medicationRecommendations) {
      console.log('\nMedication Recommendations:');
      console.log(JSON.stringify(response.data.medicationRecommendations, null, 2));
    }
    
    if (response.data.comprehensiveAnalysis) {
      console.log('\nComprehensive Analysis:');
      console.log(JSON.stringify(response.data.comprehensiveAnalysis, null, 2));
    }
    
    console.log('\nSession ID:', response.data.sessionId || 'None');
    return true;
  } catch (error) {
    console.error('Error testing combined analysis:', error.response ? error.response.data : error.message);
    return false;
  }
}

// Run the test
testCombinedAnalysis();
