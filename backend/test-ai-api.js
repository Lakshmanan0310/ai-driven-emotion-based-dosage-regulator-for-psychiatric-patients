/**
 * Test script for the AI emotion analysis API
 */
const axios = require('axios');

// Test data for voice-only analysis (depressed tone)
const voiceOnlyData = {
  transcript: "I've been feeling really down lately. I can't seem to focus on anything and I'm having trouble sleeping. Sometimes I feel like nothing matters anymore.",
  patientId: "123", // Use test patient ID
  audioMetadata: {
    speakingRate: "slow",
    pitch: "low",
    volume: "soft",
    tonality: "sad"
  }
};

// Test data for combined voice and facial analysis (anxious tone)
const combinedData = {
  transcript: "I'm feeling anxious about my upcoming presentation. My heart is racing and I can't stop worrying about everything that could go wrong.",
  facialImage: "data:image/placeholder", // This will trigger the facial analysis code path
  patientId: "123", // Use test patient ID
  audioMetadata: {
    speakingRate: "fast",
    pitch: "high",
    volume: "variable",
    tonality: "anxious"
  }
};

// Test data for neutral words but angry tone
const angryToneData = {
  transcript: "I'm fine. Everything is okay. The meeting went well. I got the project done on time. Nothing to worry about.",
  patientId: "123", // Use test patient ID
  audioMetadata: {
    speakingRate: "fast",
    pitch: "high",
    volume: "loud",
    tonality: "angry"
  }
};

// Call the API for voice-only analysis
async function testVoiceAnalysis() {
  try {
    console.log('\n=== TESTING VOICE-ONLY ANALYSIS ===');
    console.log('Sending test request with transcript only...');
    const response = await axios.post('http://localhost:5002/api/ai/analyze', voiceOnlyData);
    
    console.log('\n--- API Response ---');
    console.log('Success:', response.data.success);
    
    if (response.data.voiceAnalysis) {
      console.log('\nVoice Analysis:');
      console.log(JSON.stringify(response.data.voiceAnalysis, null, 2));
    }
    
    if (response.data.medicationRecommendations) {
      console.log('\nMedication Recommendations:');
      console.log(JSON.stringify(response.data.medicationRecommendations, null, 2));
    }
    
    console.log('\nSession ID:', response.data.sessionId || 'None');
    return true;
  } catch (error) {
    console.error('Error testing voice analysis:', error.response ? error.response.data : error.message);
    return false;
  }
}

// Call the API for combined voice and facial analysis
async function testCombinedAnalysis() {
  try {
    console.log('\n=== TESTING COMBINED VOICE AND FACIAL ANALYSIS ===');
    console.log('Sending test request with transcript and facial image...');
    const response = await axios.post('http://localhost:5002/api/ai/analyze', combinedData);
    
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
    
    console.log('\nSession ID:', response.data.sessionId || 'None');
    return true;
  } catch (error) {
    console.error('Error testing combined analysis:', error.response ? error.response.data : error.message);
    return false;
  }
}

// Call the API for angry tone with neutral words test
async function testAngryToneAnalysis() {
  try {
    console.log('\n=== TESTING ANGRY TONE WITH NEUTRAL WORDS ===');
    console.log('Sending test request with neutral words but angry tone metadata...');
    const response = await axios.post('http://localhost:5002/api/ai/analyze', angryToneData);
    
    console.log('\n--- API Response ---');
    console.log('Success:', response.data.success);
    
    if (response.data.voiceAnalysis) {
      console.log('\nVoice Analysis:');
      console.log(JSON.stringify(response.data.voiceAnalysis, null, 2));
    }
    
    if (response.data.medicationRecommendations) {
      console.log('\nMedication Recommendations:');
      console.log(JSON.stringify(response.data.medicationRecommendations, null, 2));
    }
    
    console.log('\nSession ID:', response.data.sessionId || 'None');
    return true;
  } catch (error) {
    console.error('Error testing angry tone analysis:', error.response ? error.response.data : error.message);
    return false;
  }
}

// Run the tests sequentially
async function runTests() {
  const voiceTestSuccess = await testVoiceAnalysis();
  if (voiceTestSuccess) {
    // Wait a bit before the next test to avoid overwhelming the API
    await new Promise(resolve => setTimeout(resolve, 2000));
    const combinedTestSuccess = await testCombinedAnalysis();
    
    if (combinedTestSuccess) {
      // Wait a bit before the next test
      await new Promise(resolve => setTimeout(resolve, 2000));
      await testAngryToneAnalysis();
    }
  }
}

// Run the tests
runTests();
