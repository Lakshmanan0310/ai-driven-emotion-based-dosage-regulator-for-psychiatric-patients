/**
 * Test script for the basic combined analysis API
 */
const axios = require('axios');

// Test data for basic analysis
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

// Call the basic analysis API
async function testBasicAnalysis() {
  try {
    console.log('\n=== TESTING BASIC COMBINED ANALYSIS ===');
    console.log('Sending test request to basic analysis endpoint...');
    
    const response = await axios.post('http://localhost:5002/api/ai/analyze-basic', testData);
    
    console.log('\n--- API Response ---');
    console.log('Success:', response.data.success);
    
    if (response.data.voiceAnalysis) {
      console.log('\nVoice Analysis:');
      console.log(JSON.stringify(response.data.voiceAnalysis, null, 2));
    }
    
    if (response.data.comprehensiveAnalysis) {
      console.log('\nComprehensive Analysis:');
      console.log('Primary Emotional State:', response.data.comprehensiveAnalysis.primaryEmotionalState);
      console.log('Severity Level:', response.data.comprehensiveAnalysis.severityLevel);
      console.log('Key Indicators:', response.data.comprehensiveAnalysis.keyIndicators);
      
      console.log('\nTreatment Plan:');
      console.log('Medication:', response.data.comprehensiveAnalysis.treatmentPlan.medication);
      console.log('Therapy:', response.data.comprehensiveAnalysis.treatmentPlan.therapy);
    }
    
    if (response.data.medicationRecommendations) {
      console.log('\nMedication Recommendations:');
      console.log('Condition:', response.data.medicationRecommendations.condition);
      console.log('Recommendation:', response.data.medicationRecommendations.fullRecommendation);
      console.log('Notes:', response.data.medicationRecommendations.notes);
    }
    
    console.log('\nMessage:', response.data.message);
    return true;
  } catch (error) {
    console.error('Error testing basic analysis:', error.response ? 
      error.response.data : error.message);
    return false;
  }
}

// Run the test
testBasicAnalysis();
