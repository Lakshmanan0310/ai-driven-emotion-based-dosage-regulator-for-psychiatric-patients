/**
 * Display Emotion History from MongoDB Atlas
 * Shows all saved emotion analyses in the terminal
 */

const mongoose = require('mongoose');
const SessionAnalysis = require('./models/SessionAnalysis');

// Load environment variables
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://manikandanesaki10b_db_user:9AohyRd9CtARcheB@moodanalysis.qnjj49a.mongodb.net/?retryWrites=true&w=majority';

async function showEmotionHistory() {
  try {
    console.log('\n🔗 Connecting to MongoDB Atlas...\n');
    
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB Atlas\n');

    // Get all emotion analyses
    const analyses = await SessionAnalysis.find().sort({ timestamp: -1 });

    if (analyses.length === 0) {
      console.log('⚠️  No emotion analyses found in database\n');
      await mongoose.disconnect();
      return;
    }

    console.log(`\n📊 EMOTION ANALYSIS HISTORY (${analyses.length} total)\n`);
    console.log('═'.repeat(100));

    analyses.forEach((analysis, index) => {
      const emotionEmoji = {
        happy: '😊',
        sad: '😔',
        angry: '😠',
        fearful: '😨',
        disgusted: '🤢',
        surprised: '😲',
        neutral: '😐'
      }[analysis.emotion] || '❓';

      const timestamp = new Date(analysis.timestamp).toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });

      console.log(`\n${index + 1}. ${emotionEmoji} ${analysis.emotion.toUpperCase()}`);
      console.log('─'.repeat(100));
      console.log(`   Patient:     ${analysis.patientName || analysis.patientId}`);
      console.log(`   Confidence:  ${Math.round(analysis.emotionConfidence * 100)}%`);
      console.log(`   Time:        ${timestamp}`);
      console.log(`   Type:        ${analysis.analysisType || 'unknown'}`);
      
      if (analysis.recommendation) {
        console.log(`   💊 Medication: ${analysis.recommendation.medication || 'N/A'}`);
        if (analysis.recommendation.dosage) {
          console.log(`      Dosage:    ${analysis.recommendation.dosage}`);
        }
        if (analysis.recommendation.advice) {
          console.log(`      Advice:    ${analysis.recommendation.advice}`);
        }
      }

      if (analysis.transcript) {
        const preview = analysis.transcript.substring(0, 60);
        console.log(`   📝 Transcript: "${preview}${analysis.transcript.length > 60 ? '...' : ''}"`);
      }

      if (analysis.emotionHistory && analysis.emotionHistory.length > 0) {
        console.log(`   📈 History: ${analysis.emotionHistory.length} frames detected`);
      }
    });

    console.log('\n' + '═'.repeat(100));

    // Summary statistics
    console.log('\n📈 SUMMARY STATISTICS\n');
    
    const emotionCounts = {};
    const patientCounts = {};
    
    analyses.forEach(a => {
      emotionCounts[a.emotion] = (emotionCounts[a.emotion] || 0) + 1;
      patientCounts[a.patientName || a.patientId] = (patientCounts[a.patientName || a.patientId] || 0) + 1;
    });

    console.log('Emotions Detected:');
    Object.entries(emotionCounts).sort((a, b) => b[1] - a[1]).forEach(([emotion, count]) => {
      console.log(`   ${emotion.padEnd(15)} : ${count} time(s)`);
    });

    console.log('\nEmotions by Patient:');
    Object.entries(patientCounts).sort((a, b) => b[1] - a[1]).forEach(([patient, count]) => {
      console.log(`   ${patient.padEnd(20)} : ${count} analysis(analyses)`);
    });

    // Average confidence
    const avgConfidence = analyses.reduce((sum, a) => sum + a.emotionConfidence, 0) / analyses.length;
    console.log(`\nAverage Confidence: ${Math.round(avgConfidence * 100)}%`);

    // Date range
    const dates = analyses.map(a => new Date(a.timestamp));
    const earliest = new Date(Math.min(...dates)).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    const latest = new Date(Math.max(...dates)).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    console.log(`Date Range: ${earliest} to ${latest}`);

    console.log('\n✅ Data persists in MongoDB Atlas!\n');

    await mongoose.disconnect();

  } catch (err) {
    console.error('\n❌ Error:', err.message);
    process.exit(1);
  }
}

// Run the function
showEmotionHistory();
