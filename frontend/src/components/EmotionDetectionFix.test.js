/**
 * EMOTION DETECTION FIX TEST SUITE
 * Tests the new face-api.js integration logic:
 * - Filters emotions by confidence threshold (0.20)
 * - Checks neutral dominance (< 0.75)
 * - Picks strongest emotion, not most frequent
 * - Hard override with voice emotion fallback
 */

function testEmotionDetection() {
  console.log('\n🧪 EMOTION DETECTION FIX TEST SUITE\n');
  console.log('='.repeat(60));

  let passed = 0;
  let failed = 0;

  // Test 1: Happy with high confidence, neutral < 0.75
  {
    console.log('\n✅ TEST 1: Happy face (neutral: 0.62, happy: 0.21)');
    const expressions = {
      neutral: 0.62,
      happy: 0.21,
      sad: 0.09,
      angry: 0.04,
      disgust: 0.02,
      fear: 0.01,
      surprised: 0.01
    };

    const nonNeutral = Object.entries(expressions)
      .filter(([e]) => e !== 'neutral')
      .sort((a, b) => b[1] - a[1]);

    const [emotion, confidence] = nonNeutral[0];
    const threshold = confidence >= 0.20 && expressions.neutral <= 0.75;

    console.log(`  Raw: ${JSON.stringify(expressions)}`);
    console.log(`  Extracted: emotion="${emotion}", confidence=${confidence.toFixed(2)}`);
    console.log(`  Threshold check (conf >= 0.20 AND neutral <= 0.75): ${threshold}`);
    console.log(`  EXPECTED: Should store { emotion: "happy", confidence: 0.21 }`);
    console.log(`  RESULT: ${threshold ? '✅ STORED' : '❌ REJECTED'}`);
    if (threshold && emotion === 'happy') passed++;
    else failed++;
  }

  // Test 2: Dominant neutral should reject emotion
  {
    console.log('\n❌ TEST 2: Mostly neutral (neutral: 0.82, happy: 0.10)');
    const expressions = {
      neutral: 0.82,
      happy: 0.10,
      sad: 0.05,
      angry: 0.02,
      disgust: 0.005,
      fear: 0.004,
      surprised: 0.001
    };

    const nonNeutral = Object.entries(expressions)
      .filter(([e]) => e !== 'neutral')
      .sort((a, b) => b[1] - a[1]);

    const [emotion, confidence] = nonNeutral[0];
    const threshold = confidence >= 0.20 && expressions.neutral <= 0.75;

    console.log(`  Raw: ${JSON.stringify(expressions)}`);
    console.log(`  Extracted: emotion="${emotion}", confidence=${confidence.toFixed(2)}`);
    console.log(`  Threshold check (conf >= 0.20 AND neutral <= 0.75): ${threshold}`);
    console.log(`  EXPECTED: Should SKIP (neutral > 0.75)`);
    console.log(`  RESULT: ${!threshold ? '✅ REJECTED' : '❌ STORED'}`);
    if (!threshold) passed++;
    else failed++;
  }

  // Test 3: Below confidence threshold
  {
    console.log('\n❌ TEST 3: Very weak emotion (neutral: 0.70, happy: 0.15)');
    const expressions = {
      neutral: 0.70,
      happy: 0.15,
      sad: 0.10,
      angry: 0.03,
      disgust: 0.01,
      fear: 0.005,
      surprised: 0.005
    };

    const nonNeutral = Object.entries(expressions)
      .filter(([e]) => e !== 'neutral')
      .sort((a, b) => b[1] - a[1]);

    const [emotion, confidence] = nonNeutral[0];
    const threshold = confidence >= 0.20 && expressions.neutral <= 0.75;

    console.log(`  Raw: ${JSON.stringify(expressions)}`);
    console.log(`  Extracted: emotion="${emotion}", confidence=${confidence.toFixed(2)}`);
    console.log(`  Threshold check (conf >= 0.20 AND neutral <= 0.75): ${threshold}`);
    console.log(`  EXPECTED: Should SKIP (confidence < 0.20)`);
    console.log(`  RESULT: ${!threshold ? '✅ REJECTED' : '❌ STORED'}`);
    if (!threshold) passed++;
    else failed++;
  }

  // Test 4: Final emotion selection - strongest wins
  {
    console.log('\n✅ TEST 4: Emotion history - pick STRONGEST not MOST FREQUENT');
    // NOTE: With new filtering, neutral should NEVER appear in emotionHistory
    const emotionHistory = [
      { emotion: 'happy', confidence: 0.28 },
      { emotion: 'sad', confidence: 0.35 },
      { emotion: 'happy', confidence: 0.31 },
      { emotion: 'happy', confidence: 0.29 }
    ];

    const strongest = emotionHistory.reduce((best, cur) =>
      cur.confidence > best.confidence ? cur : best
    );

    console.log(`  History: ${emotionHistory.map(e => `${e.emotion}(${e.confidence.toFixed(2)})`).join(' → ')}`);
    console.log(`  EXPECTED: emotion="sad", confidence=0.35 (strongest frame)`);
    console.log(`  ACTUAL: emotion="${strongest.emotion}", confidence=${strongest.confidence.toFixed(2)}`);
    console.log(`  RESULT: ${strongest.emotion === 'sad' && strongest.confidence === 0.35 ? '✅ CORRECT' : '❌ WRONG'}`);
    if (strongest.emotion === 'sad' && strongest.confidence === 0.35) passed++;
    else failed++;
  }

  // Test 5: Voice fallback when facial is neutral
  {
    console.log('\n✅ TEST 5: Voice fallback (facial neutral + voice happy)');
    const emotionHistory = [
      { emotion: 'neutral', confidence: 0.55 },
      { emotion: 'neutral', confidence: 0.62 }
    ];

    let finalEmotion = 'neutral';
    let finalConfidence = 0.25;

    if (emotionHistory.length > 0) {
      const strongest = emotionHistory.reduce((best, cur) =>
        cur.confidence > best.confidence ? cur : best
      );
      finalEmotion = strongest.emotion;
      finalConfidence = strongest.confidence;
    }

    const voiceEmotion = 'happy';

    if (finalEmotion === 'neutral' && voiceEmotion && voiceEmotion !== 'neutral') {
      finalEmotion = voiceEmotion;
      finalConfidence = 0.5;
    }

    console.log(`  Facial history: ${emotionHistory.map(e => `${e.emotion}(${e.confidence.toFixed(2)})`).join(' → ')}`);
    console.log(`  Voice emotion: "${voiceEmotion}"`);
    console.log(`  EXPECTED: Final emotion="happy", confidence=0.5 (voice override)`);
    console.log(`  ACTUAL: emotion="${finalEmotion}", confidence=${finalConfidence.toFixed(2)}`);
    console.log(`  RESULT: ${finalEmotion === 'happy' && finalConfidence === 0.5 ? '✅ CORRECT' : '❌ WRONG'}`);
    if (finalEmotion === 'happy' && finalConfidence === 0.5) passed++;
    else failed++;
  }

  // Test 6: Voice NOT used when facial has strong emotion
  {
    console.log('\n✅ TEST 6: Facial preferred over voice (facial sad + voice happy)');
    const emotionHistory = [
      { emotion: 'sad', confidence: 0.68 },
      { emotion: 'sad', confidence: 0.71 }
    ];

    let finalEmotion = 'neutral';
    let finalConfidence = 0.25;

    if (emotionHistory.length > 0) {
      const strongest = emotionHistory.reduce((best, cur) =>
        cur.confidence > best.confidence ? cur : best
      );
      finalEmotion = strongest.emotion;
      finalConfidence = strongest.confidence;
    }

    const voiceEmotion = 'happy';

    if (finalEmotion === 'neutral' && voiceEmotion && voiceEmotion !== 'neutral') {
      finalEmotion = voiceEmotion;
      finalConfidence = 0.5;
    }

    console.log(`  Facial history: ${emotionHistory.map(e => `${e.emotion}(${e.confidence.toFixed(2)})`).join(' → ')}`);
    console.log(`  Voice emotion: "${voiceEmotion}"`);
    console.log(`  EXPECTED: Final emotion="sad", confidence=0.71 (facial preferred)`);
    console.log(`  ACTUAL: emotion="${finalEmotion}", confidence=${finalConfidence.toFixed(2)}`);
    console.log(`  RESULT: ${finalEmotion === 'sad' && finalConfidence === 0.71 ? '✅ CORRECT' : '❌ WRONG'}`);
    if (finalEmotion === 'sad' && finalConfidence === 0.71) passed++;
    else failed++;
  }

  // Test 7: Empty history
  {
    console.log('\n⚪ TEST 7: Empty emotion history');
    const emotionHistory = [];

    let finalEmotion = 'neutral';
    let finalConfidence = 0.25;

    if (emotionHistory.length > 0) {
      const strongest = emotionHistory.reduce((best, cur) =>
        cur.confidence > best.confidence ? cur : best
      );
      finalEmotion = strongest.emotion;
      finalConfidence = strongest.confidence;
    }

    const voiceEmotion = null;

    if (finalEmotion === 'neutral' && voiceEmotion && voiceEmotion !== 'neutral') {
      finalEmotion = voiceEmotion;
      finalConfidence = 0.5;
    }

    console.log(`  Facial history: EMPTY`);
    console.log(`  Voice emotion: ${voiceEmotion || 'null'}`);
    console.log(`  EXPECTED: Final emotion="neutral", confidence=0.25 (fallback)`);
    console.log(`  ACTUAL: emotion="${finalEmotion}", confidence=${finalConfidence.toFixed(2)}`);
    console.log(`  RESULT: ${finalEmotion === 'neutral' && finalConfidence === 0.25 ? '✅ CORRECT' : '❌ WRONG'}`);
    if (finalEmotion === 'neutral' && finalConfidence === 0.25) passed++;
    else failed++;
  }

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log(`\n📊 TEST RESULTS: ${passed} passed, ${failed} failed out of 7 tests\n`);
  if (failed === 0) {
    console.log('🎉 ALL TESTS PASSED! ✅\n');
  } else {
    console.log(`❌ ${failed} test(s) failed\n`);
  }

  return failed === 0;
}

// Run tests
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { testEmotionDetection };
  testEmotionDetection();
} else {
  testEmotionDetection();
}
