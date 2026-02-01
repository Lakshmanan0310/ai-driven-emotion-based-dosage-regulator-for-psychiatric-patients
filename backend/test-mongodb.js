const mongoose = require('mongoose');

const uri = 'mongodb+srv://tharunbabu006:Ykq4BHuJJ5Tjj9w0@moodtracker3.9fglazi.mongodb.net/?retryWrites=true&w=majority&appName=moodtracker3';

console.log('🔍 Testing MongoDB connection...\n');

mongoose.connect(uri, { 
  connectTimeoutMS: 10000,
  serverSelectionTimeoutMS: 10000
})
.then(() => {
  console.log('✅ MONGODB IS ACTIVE AND WORKING!');
  console.log('✅ Database connection successful!');
  process.exit(0);
})
.catch(err => {
  console.log('❌ MONGODB CONNECTION FAILED!');
  console.log('Error:', err.message);
  console.log('\n📋 Details:', err.reason || err);
  process.exit(1);
});

// Timeout handler
setTimeout(() => {
  console.log('❌ Connection timeout - MongoDB may be inactive or unreachable');
  process.exit(1);
}, 15000);
