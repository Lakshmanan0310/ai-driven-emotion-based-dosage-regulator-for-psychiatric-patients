/**
 * Test script for the simplified analysis API
 */
const axios = require('axios');

// Test data for simplified analysis
const simpleData = {
  transcript: "I'm feeling anxious today. My heart is racing and I can't stop worrying about everything that could go wrong.",
  audioMetadata: {
    speakingRate: "fast",
    pitch: "high",
    volume: "variable",
    tonality: "anxious"
  }
};

// Call the simplified API
async function testSimpleAnalysis() {
  try {
    console.log('\n=== TESTING SIMPLIFIED ANALYSIS ===');
    console.log('Sending test request to simplified analysis endpoint...');
    const response = await axios.post('http://localhost:5002/api/ai/analyze-simple', simpleData);
    
    console.log('\n--- API Response ---');
    console.log('Success:', response.data.success);
    
    if (response.data.voiceAnalysis) {
      console.log('\nVoice Analysis:');
      console.log(JSON.stringify(response.data.voiceAnalysis, null, 2));
    }
    
    console.log('\nMessage:', response.data.message);
    return true;
  } catch (error) {
    console.error('Error testing simplified analysis:', error.response ? 
      JSON.stringify(error.response.data, null, 2) : error.message);
    return false;
  }
}

// Run the test
testSimpleAnalysis();
