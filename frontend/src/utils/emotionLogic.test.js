/**
 * emotionLogic.test.js
 * -----------------------------------------
 * Logic-level test suite for CombinedAnalysis
 * emotion decision logic (NO React required)
 *
 * Purpose:
 * - Prevent neutral override
 * - Preserve last strong emotion
 * - Verify voice fallback
 * - Safe empty history handling
 *
 * Run manually via browser console:
 *   import { runTests } from './emotionLogic.test';
 *   runTests();
 */

// =======================
// Mock Emotion Scenarios
// =======================
export const emotionScenarios = {
  happySession: [
    { emotion: 'happy', confidence: 0.92 },
    { emotion: 'happy', confidence: 0.88 },
    { emotion: 'happy', confidence: 0.85 },
    { emotion: 'happy', confidence: 0.90 },
    { emotion: 'happy', confidence: 0.87 },
  ],

  sadThenNeutral: [
    { emotion: 'sad', confidence: 0.78 },
    { emotion: 'sad', confidence: 0.82 },
    { emotion: 'sad', confidence: 0.75 },
  ],

  allNeutral: [
    { emotion: 'neutral', confidence: 0.55 },
    { emotion: 'neutral', confidence: 0.60 },
    { emotion: 'neutral', confidence: 0.58 },
  ],

  mixedEmotions: [
    { emotion: 'angry', confidence: 0.75 },
    { emotion: 'angry', confidence: 0.78 },
    { emotion: 'happy', confidence: 0.88 },
    { emotion: 'happy', confidence: 0.91 },
    { emotion: 'happy', confidence: 0.89 },
  ],

  lowConfidenceNoSpam: [
    { emotion: 'happy', confidence: 0.88 },
    { emotion: 'happy', confidence: 0.85 },
  ],
};

// ========================================
// Core Logic (Matches CombinedAnalysis.jsx)
// ========================================
export function processEmotionLogic(emotionHistory, voiceEmotion = null) {
  let dominantEmotion = 'neutral';
  let facialConfidence = 0;

  if (emotionHistory && emotionHistory.length > 0) {
    const recent = emotionHistory[emotionHistory.length - 1];

    if (recent.emotion !== 'neutral') {
      dominantEmotion = recent.emotion;
      facialConfidence = recent.confidence;
    } else {
      const lastNonNeutral = [...emotionHistory]
        .reverse()
        .find(e => e.emotion !== 'neutral');

      if (lastNonNeutral) {
        dominantEmotion = lastNonNeutral.emotion;
        facialConfidence = lastNonNeutral.confidence;
      } else {
        dominantEmotion = recent.emotion;
        facialConfidence = recent.confidence;
      }
    }
  }

  let combinedEmotion = 'neutral';
  let combinedConfidence = 0.4;

  if (dominantEmotion !== 'neutral') {
    combinedEmotion = dominantEmotion;
    combinedConfidence = Math.max(facialConfidence, 0.25);
  } else if (voiceEmotion && voiceEmotion !== 'neutral') {
    combinedEmotion = voiceEmotion;
    combinedConfidence = 0.5;
  }

  return {
    facialAnalysis: {
      dominantEmotion,
      confidence: facialConfidence,
    },
    combinedResult: {
      emotion: combinedEmotion,
      confidence: combinedConfidence,
    },
  };
}

// =======================
// Test Runner
// =======================
export function runTests() {
  console.clear();
  console.log('🧪 Emotion Logic Tests');
  console.log('════════════════════════════════════════════\n');

  let pass = 0;
  let total = 0;

  const assert = (condition, label) => {
    total++;
    if (condition) {
      pass++;
      console.log(`✅ ${label}`);
    } else {
      console.error(`❌ ${label}`);
    }
  };

  // Test 1: Happy preserved
  const t1 = processEmotionLogic(emotionScenarios.happySession);
  assert(
    t1.facialAnalysis.dominantEmotion === 'happy' &&
      t1.facialAnalysis.confidence > 0.8,
    'Happy emotion preserved'
  );

  // Test 2: Sad then neutral
  const t2 = processEmotionLogic(emotionScenarios.sadThenNeutral);
  assert(
    t2.facialAnalysis.dominantEmotion === 'sad',
    'Most recent non-neutral (sad) preserved'
  );

  // Test 3: All neutral
  const t3 = processEmotionLogic(emotionScenarios.allNeutral);
  assert(
    t3.facialAnalysis.dominantEmotion === 'neutral',
    'All-neutral session returns neutral'
  );

  // Test 4: Mixed emotions
  const t4 = processEmotionLogic(emotionScenarios.mixedEmotions);
  assert(
    t4.facialAnalysis.dominantEmotion === 'happy',
    'Latest strong emotion (happy) selected'
  );

  // Test 5: Voice fallback
  const t5 = processEmotionLogic(emotionScenarios.allNeutral, 'happy');
  assert(
    t5.combinedResult.emotion === 'happy',
    'Voice fallback activates when facial is neutral'
  );

  // Test 6: Facial preferred over voice
  const t6 = processEmotionLogic(emotionScenarios.sadThenNeutral, 'happy');
  assert(
    t6.combinedResult.emotion === 'sad',
    'Facial emotion preferred over voice'
  );

  // Test 7: Empty history
  const t7 = processEmotionLogic([], null);
  assert(
    t7.combinedResult.emotion === 'neutral',
    'Empty emotion history handled safely'
  );

  console.log('\n════════════════════════════════════════════');
  console.log(`📊 ${pass}/${total} tests passed`);

  if (pass === total) {
    console.log('🎉 All emotion logic tests PASSED');
  } else {
    console.warn('⚠️ Some tests FAILED');
  }

  return { pass, total };
}
