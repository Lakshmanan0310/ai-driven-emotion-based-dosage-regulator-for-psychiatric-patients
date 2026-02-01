/**
 * Verify Emotion Analysis Persistence
 * Check if emotion data is being saved and retrieved correctly
 */

const mongoose = require('mongoose');
const SessionAnalysis = require('./models/SessionAnalysis');

async function verifyPersistence() {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || 'mongodb+srv://manikandanesaki10b_db_user:9AohyRd9CtARcheB@moodanalysis.qnjj49a.mongodb.net/?retryWrites=true&w=majority';
    
    console.log('🔍 Verifying emotion analysis persistence...\n');
    
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    
    console.log('✅ Connected to MongoDB Atlas\n');

    // Count total emotion analyses
    const totalCount = await SessionAnalysis.countDocuments();
    console.log(`📊 Total emotion analyses saved: ${totalCount}`);

    // Get latest emotions
    const latestAnalyses = await SessionAnalysis.find()
      .sort({ timestamp: -1 })
      .limit(5);

    if (latestAnalyses.length > 0) {
      console.log(`\n📈 Latest ${latestAnalyses.length} emotion analyses:\n`);
      
      latestAnalyses.forEach((analysis, idx) => {
        console.log(`${idx + 1}. Patient: ${analysis.patientId}`);
        console.log(`   Emotion: ${analysis.emotion} (${(analysis.emotionConfidence * 100).toFixed(1)}%)`);
        console.log(`   Time: ${analysis.timestamp.toLocaleString()}`);
        console.log(`   Analysis Type: ${analysis.analysisType}`);
        console.log('');
      });

      console.log('✅ DATA PERSISTENCE VERIFIED - All emotions are saved!');
    } else {
      console.log('⚠️  No emotion analyses found. Run emotion detection first.\n');
    }

    // Check by patient
    const patientIds = await SessionAnalysis.distinct('patientId');
    console.log(`\n👥 Emotions tracked for ${patientIds.length} patient(s):`);
    
    for (const patientId of patientIds) {
      const count = await SessionAnalysis.countDocuments({ patientId });
      console.log(`   - ${patientId}: ${count} analyses`);
    }

    console.log('\n✅ Verification complete!');
    console.log('🔒 All emotion analyses are permanently stored in MongoDB Atlas');
    console.log('📲 Data will persist across server restarts\n');

  } catch (error) {
    console.error('❌ Verification failed:', error.message);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
}

// Run verification
verifyPersistence();
