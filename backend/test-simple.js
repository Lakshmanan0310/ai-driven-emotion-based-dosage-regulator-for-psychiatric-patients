/**
 * Simplified test script for debugging the combined analysis API
 */
const axios = require('axios');

// Minimal test data for debugging
const simpleData = {
  transcript: "I'm feeling anxious today.",
  audioMetadata: {
    tonality: "anxious"
  }
};

// Call the API with minimal data
async function testSimpleAnalysis() {
  try {
    console.log('Sending minimal test request...');
    const response = await axios.post('http://localhost:5002/api/ai/analyze-combined', simpleData);
    
    console.log('\n--- API Response ---');
    console.log('Success:', response.data.success);
    console.log('Response data:', JSON.stringify(response.data, null, 2));
    
    return true;
  } catch (error) {
    console.error('Error testing API:', error.response ? 
      JSON.stringify(error.response.data, null, 2) : error.message);
    return false;
  }
}

// Run the test
testSimpleAnalysis();
