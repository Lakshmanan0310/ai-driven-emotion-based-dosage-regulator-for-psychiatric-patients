/**
 * Test script for the improved combined 15-second analysis API
 */
const axios = require('axios');
const fs = require('fs');
const path = require('path');

// Test data for combined analysis
const testData = {
  patientId: '123',
  transcript: "I'm feeling really anxious today. My heart is racing and I can't stop worrying about everything that could go wrong. I haven't been sleeping well and I feel overwhelmed.",
  audioMetadata: {
    speakingRate: "fast",
    pitch: "high",
    volume: "variable",
    tonality: "anxious"
  }
};

// Try to load a sample facial image if available
try {
  const sampleImagePath = path.join(__dirname, 'test-data', 'sample-face.jpg');
  if (fs.existsSync(sampleImagePath)) {
    const imageBuffer = fs.readFileSync(sampleImagePath);
    testData.facialData = `data:image/jpeg;base64,${imageBuffer.toString('base64')}`;
    console.log('Loaded sample facial image');
  } else {
    console.log('No sample facial image found, proceeding with voice-only analysis');
  }
} catch (error) {
  console.log('Error loading sample image:', error.message);
}

// Call the combined analysis API
async function testCombinedAnalysis() {
  try {
    console.log('\n=== TESTING IMPROVED COMBINED 15-SECOND ANALYSIS ===');
    console.log('Sending test request with the following data:');
    console.log('- Patient ID:', testData.patientId);
    console.log('- Transcript length:', testData.transcript.length, 'characters');
    console.log('- Facial data included:', !!testData.facialData);
    console.log('- Audio metadata included:', !!testData.audioMetadata);
    
    const response = await axios.post('http://localhost:5002/api/ai/analyze-combined', testData);
    
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
    
    if (response.data.comprehensiveAnalysis) {
      console.log('\nComprehensive Analysis:');
      console.log('Primary Emotional State:', response.data.comprehensiveAnalysis.primaryEmotionalState);
      console.log('Severity Level:', response.data.comprehensiveAnalysis.severityLevel);
      console.log('Key Indicators:', response.data.comprehensiveAnalysis.keyIndicators);
      
      console.log('\nTreatment Plan:');
      console.log('Medication:', response.data.comprehensiveAnalysis.treatmentPlan.medication);
      console.log('Therapy:', response.data.comprehensiveAnalysis.treatmentPlan.therapy);
      console.log('Lifestyle Recommendations:', response.data.comprehensiveAnalysis.treatmentPlan.lifestyle);
      
      console.log('\nFollow-up Recommendations:');
      console.log(response.data.comprehensiveAnalysis.followUpRecommendations);
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
    console.error('Error testing combined analysis:', error.response ? 
      error.response.data : error.message);
    return false;
  }
}

// Run the test
testCombinedAnalysis();
