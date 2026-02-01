/**
 * Memory Vault Controller
 * Handles API endpoints for the Memory Vault feature
 */

const MemoryVault = require('../models/MemoryVault');
const axios = require('axios');
require('dotenv').config();

// Get all memories for a patient
exports.getMemories = async (req, res) => {
  try {
    const { patientId } = req.params;
    const memories = await MemoryVault.find({ patientId }).sort({ createdAt: -1 });
    res.json(memories);
  } catch (err) {
    console.error('Error fetching memories:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get a specific memory by ID
exports.getMemoryById = async (req, res) => {
  try {
    const { id } = req.params;
    const memory = await MemoryVault.findById(id);
    
    if (!memory) {
      return res.status(404).json({ message: 'Memory not found' });
    }
    
    res.json(memory);
  } catch (err) {
    console.error('Error fetching memory:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Create a new memory
exports.createMemory = async (req, res) => {
  try {
    const memoryData = req.body;
    
    // If emotion tags aren't provided, classify them using Gemini API
    if (!memoryData.emotionTags || !memoryData.dominantEmotion) {
      try {
        const emotionData = await classifyEmotions(memoryData.content);
        memoryData.emotionTags = emotionData.emotionTags;
        memoryData.dominantEmotion = emotionData.dominantEmotion;
        memoryData.emotionIntensity = emotionData.emotionIntensity;
      } catch (classifyErr) {
        console.error('Error classifying emotions:', classifyErr);
        // Fallback classification
        memoryData.emotionTags = ['joy', 'peace', 'hope'];
        memoryData.dominantEmotion = 'joy';
        memoryData.emotionIntensity = 75;
      }
    }
    
    const newMemory = new MemoryVault(memoryData);
    await newMemory.save();
    
    res.status(201).json(newMemory);
  } catch (err) {
    console.error('Error creating memory:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update a memory
exports.updateMemory = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    const memory = await MemoryVault.findByIdAndUpdate(
      id,
      { $set: updates },
      { new: true, runValidators: true }
    );
    
    if (!memory) {
      return res.status(404).json({ message: 'Memory not found' });
    }
    
    res.json(memory);
  } catch (err) {
    console.error('Error updating memory:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete a memory
exports.deleteMemory = async (req, res) => {
  try {
    const { id } = req.params;
    const memory = await MemoryVault.findByIdAndDelete(id);
    
    if (!memory) {
      return res.status(404).json({ message: 'Memory not found' });
    }
    
    res.json({ message: 'Memory deleted successfully' });
  } catch (err) {
    console.error('Error deleting memory:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Classify emotions in text using Gemini API
const classifyEmotions = async (text) => {
  try {
    const geminiApiKey = process.env.GEMINI_API_KEY;
    
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${geminiApiKey}`,
      {
        contents: [{
          parts: [{
            text: `Analyze the following text and identify the top 3 positive emotions expressed (choose from: joy, peace, pride, strength, love, gratitude, hope, serenity, amusement, awe). Also determine which one is the dominant emotion and assign an intensity score from 0-100. Format your response as JSON with fields: emotionTags (array), dominantEmotion (string), and emotionIntensity (number).
            
            Text to analyze: "${text}"`
          }]
        }]
      },
      {
        headers: {
          'Content-Type': 'application/json',
        }
      }
    );
    
    const textResponse = response.data.candidates[0].content.parts[0].text;
    
    // Extract JSON from the response
    const jsonMatch = textResponse.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    
    // Fallback if JSON parsing fails
    return {
      emotionTags: ['joy', 'peace', 'hope'],
      dominantEmotion: 'joy',
      emotionIntensity: 75
    };
  } catch (err) {
    console.error('Error calling Gemini API:', err);
    throw err;
  }
};

// Get a recommended memory based on current emotion
exports.getRecommendedMemory = async (req, res) => {
  try {
    const { patientId } = req.params;
    const { emotion, intensity } = req.query;
    
    // First try to find caregiver messages specifically for this emotion
    let memory = null;
    
    if (emotion && intensity) {
      // Look for caregiver messages specifically for this emotion and intensity
      memory = await MemoryVault.findOne({
        patientId,
        isCaregiver: true,
        'triggerCondition.emotion': { $in: [emotion, 'any'] },
        'triggerCondition.intensity': { $lte: intensity }
      }).sort({ 'triggerCondition.intensity': -1 });
      
      if (!memory) {
        // If no caregiver message, find a memory with contrasting positive emotion
        const contrastingEmotions = {
          'sad': ['joy', 'hope', 'gratitude'],
          'angry': ['peace', 'serenity', 'love'],
          'fearful': ['strength', 'peace', 'serenity'],
          'disgusted': ['awe', 'gratitude', 'joy'],
          'depressed': ['joy', 'hope', 'gratitude'],
          'anxious': ['peace', 'serenity', 'love'],
          'aggressive': ['peace', 'serenity', 'love']
        };
        
        const targetEmotions = contrastingEmotions[emotion] || ['joy', 'peace', 'hope'];
        
        memory = await MemoryVault.findOne({
          patientId,
          dominantEmotion: { $in: targetEmotions }
        }).sort({ emotionIntensity: -1 });
      }
    }
    
    // If still no memory found, just return the most recent one
    if (!memory) {
      memory = await MemoryVault.findOne({ patientId }).sort({ createdAt: -1 });
    }
    
    if (!memory) {
      return res.status(404).json({ message: 'No memories found' });
    }
    
    res.json(memory);
  } catch (err) {
    console.error('Error getting recommended memory:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Record memory access
exports.recordAccess = async (req, res) => {
  try {
    const { id } = req.params;
    
    const memory = await MemoryVault.findByIdAndUpdate(
      id,
      { 
        $inc: { accessCount: 1 },
        $set: { lastAccessed: new Date() }
      },
      { new: true }
    );
    
    if (!memory) {
      return res.status(404).json({ message: 'Memory not found' });
    }
    
    res.json(memory);
  } catch (err) {
    console.error('Error recording memory access:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Rate memory helpfulness
exports.rateHelpfulness = async (req, res) => {
  try {
    const { id } = req.params;
    const { rating } = req.body;
    
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Invalid rating. Must be between 1 and 5.' });
    }
    
    const memory = await MemoryVault.findByIdAndUpdate(
      id,
      { $set: { helpfulnessRating: rating } },
      { new: true }
    );
    
    if (!memory) {
      return res.status(404).json({ message: 'Memory not found' });
    }
    
    res.json(memory);
  } catch (err) {
    console.error('Error rating memory:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Classify emotions in text (direct API endpoint)
exports.classifyEmotion = async (req, res) => {
  try {
    const { text } = req.body;
    
    if (!text) {
      return res.status(400).json({ message: 'Text is required' });
    }
    
    const emotionData = await classifyEmotions(text);
    res.json(emotionData);
  } catch (err) {
    console.error('Error classifying emotion:', err);
    res.status(500).json({ message: 'Server error' });
  }
};
