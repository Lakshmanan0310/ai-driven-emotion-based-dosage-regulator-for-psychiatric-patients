// Configuration settings for the application

module.exports = {
  // MongoDB connection string
  mongoURI: process.env.MONGO_URI || 'mongodb://localhost:27017/mood_tracker',
  
  // JWT settings
  jwt: {
    secret: process.env.JWT_SECRET || 'mood_tracker_secret_key',
    expiresIn: '24h'
  },
  
  // Server settings
  server: {
    port: process.env.PORT || 5000,
    env: process.env.NODE_ENV || 'development'
  },
  
  // CORS settings
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    credentials: true
  },
  
  // AI model settings
  aiModels: {
    faceEmotionModel: {
      path: './ai/models/face_emotion_model.h5',
      threshold: 0.6
    },
    voiceEmotionModel: {
      path: './ai/models/voice_emotion_model.h5',
      threshold: 0.7
    }
  },
  
  // Logging settings
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    file: './logs/app.log'
  }
};
