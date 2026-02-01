/**
 * Test script for the complete 15-second combined analysis workflow
 * This demonstrates how the frontend will interact with the backend
 */
const axios = require('axios');

// Simulated frontend data
const simulatedData = {
  patientId: '123',
  transcript: "I'm feeling really anxious today. My heart is racing and I can't stop worrying about everything. I haven't been sleeping well and I feel overwhelmed by all my responsibilities.",
  audioMetadata: {
    speakingRate: "fast",
    pitch: "high",
    volume: "variable",
    tonality: "anxious"
  },
  // In a real scenario, this would be a base64-encoded image from the webcam
  facialData: null
};

// Function to simulate the 15-second analysis workflow
async function simulate15SecondAnalysis() {
  console.log('\n=== SIMULATING 15-SECOND COMBINED ANALYSIS WORKFLOW ===');
  console.log('Starting 15-second recording period...');
  
  // Simulate 15-second wait
  await new Promise(resolve => {
    console.log('Recording in progress...');
    setTimeout(() => {
      console.log('Recording complete after 15 seconds');
      resolve();
    }, 2000); // We'll use 2 seconds instead of 15 for the simulation
  });
  
  // Send the data to the basic analysis endpoint
  try {
    console.log('\nSending recorded data to analysis endpoint...');
    const response = await axios.post('http://localhost:5002/api/ai/analyze-basic', simulatedData);
    
    console.log('\n--- ANALYSIS RESULTS ---');
    console.log('Primary Emotional State:', response.data.comprehensiveAnalysis.primaryEmotionalState);
    console.log('Severity Level:', response.data.comprehensiveAnalysis.severityLevel);
    
    console.log('\nMedication Recommendation:');
    console.log(response.data.medicationRecommendations.fullRecommendation);
    
    console.log('\nTherapy Recommendation:');
    console.log(response.data.comprehensiveAnalysis.treatmentPlan.therapy);
    
    console.log('\nLifestyle Recommendations:');
    response.data.comprehensiveAnalysis.treatmentPlan.lifestyle.forEach(item => {
      console.log(`- ${item}`);
    });
    
    console.log('\nFollow-up:');
    console.log(response.data.comprehensiveAnalysis.followUpRecommendations);
    
    console.log('\nSummary:');
    console.log(response.data.comprehensiveAnalysis.summary);
    
    return true;
  } catch (error) {
    console.error('Error in 15-second analysis workflow:', error.response ? 
      error.response.data : error.message);
    return false;
  }
}

// Run the simulation
simulate15SecondAnalysis();
