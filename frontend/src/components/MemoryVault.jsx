import React, { useState, useEffect } from 'react';
import { FaPlus, FaTrash, FaEdit, FaPlay, FaHeart, FaStar, FaUser, FaUserFriends } from 'react-icons/fa';
import { useTheme } from '../ThemeContext';
import { memoryVaultService } from '../services/api';

const MemoryVault = ({ patientId, currentEmotion = null }) => {
  const { currentTheme, themes } = useTheme();
  const theme = themes[currentTheme];
  
  // State variables
  const [memories, setMemories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showViewMemory, setShowViewMemory] = useState(false);
  const [selectedMemory, setSelectedMemory] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    contentType: 'text',
    mediaUrl: '',
    isCaregiver: false,
    caregiverName: '',
    triggerCondition: {
      emotion: 'any',
      intensity: 50
    }
  });
  const [isClassifying, setIsClassifying] = useState(false);
  const [recommendedMemory, setRecommendedMemory] = useState(null);
  const [geminiApiKey, setGeminiApiKey] = useState('AIzaSyA8RUqM1U1cYIdfNVPKvQGB-Esa7ZMLQ1g');
  
  // Fetch memories
  useEffect(() => {
    const fetchMemories = async () => {
      try {
        setIsLoading(true);
        const data = await memoryVaultService.getMemories(patientId);
        setMemories(data);
        setIsLoading(false);
      } catch (err) {
        console.error('Error fetching memories:', err);
        setError('Failed to load your memory vault');
        setIsLoading(false);
      }
    };
    
    fetchMemories();
  }, [patientId]);
  
  // Check for emotional dip and recommend memory
  useEffect(() => {
    if (currentEmotion && 
        ['sad', 'angry', 'fearful', 'disgusted', 'depressed', 'anxious', 'aggressive'].includes(currentEmotion.emotion) && 
        currentEmotion.intensity > 60) {
      getRecommendedMemory(currentEmotion.emotion, currentEmotion.intensity);
    }
  }, [currentEmotion]);
  
  const getRecommendedMemory = async (emotion, intensity) => {
    try {
      const recommended = await memoryVaultService.getRecommendedMemory(patientId, emotion, intensity);
      setRecommendedMemory(recommended);
    } catch (err) {
      console.error('Error getting recommended memory:', err);
    }
  };
  
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData({
        ...formData,
        [parent]: {
          ...formData[parent],
          [child]: type === 'checkbox' ? checked : value
        }
      });
    } else if (type === 'checkbox') {
      setFormData({
        ...formData,
        [name]: checked
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };
  
  const classifyEmotions = async () => {
    if (!formData.content) return;
    
    setIsClassifying(true);
    try {
      // Use Gemini API directly for emotion classification
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${geminiApiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `Analyze the following text and identify the top 3 positive emotions expressed (choose from: joy, peace, pride, strength, love, gratitude, hope, serenity, amusement, awe). Also determine which one is the dominant emotion and assign an intensity score from 0-100. Format your response as JSON with fields: emotionTags (array), dominantEmotion (string), and emotionIntensity (number).
              
              Text to analyze: "${formData.content}"`
            }]
          }]
        })
      });
      
      const data = await response.json();
      const textResponse = data.candidates[0].content.parts[0].text;
      
      // Extract JSON from the response
      const jsonMatch = textResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const emotionData = JSON.parse(jsonMatch[0]);
        setFormData({
          ...formData,
          emotionTags: emotionData.emotionTags,
          dominantEmotion: emotionData.dominantEmotion,
          emotionIntensity: emotionData.emotionIntensity
        });
      }
    } catch (err) {
      console.error('Error classifying emotions:', err);
      // Fallback classification if API fails
      setFormData({
        ...formData,
        emotionTags: ['joy', 'peace', 'hope'],
        dominantEmotion: 'joy',
        emotionIntensity: 75
      });
    } finally {
      setIsClassifying(false);
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      // Classify emotions if not already done
      if (!formData.emotionTags || !formData.dominantEmotion) {
        await classifyEmotions();
      }
      
      const memoryData = {
        ...formData,
        patientId
      };
      
      const newMemory = await memoryVaultService.createMemory(memoryData);
      setMemories([newMemory, ...memories]);
      setShowAddForm(false);
      setFormData({
        title: '',
        content: '',
        contentType: 'text',
        mediaUrl: '',
        isCaregiver: false,
        caregiverName: '',
        triggerCondition: {
          emotion: 'any',
          intensity: 50
        }
      });
    } catch (err) {
      console.error('Error saving memory:', err);
      setError('Failed to save your memory');
    }
  };
  
  const handleViewMemory = async (memory) => {
    setSelectedMemory(memory);
    setShowViewMemory(true);
    
    // Record access
    try {
      await memoryVaultService.recordAccess(memory.id);
    } catch (err) {
      console.error('Error recording memory access:', err);
    }
  };
  
  const handleRateHelpfulness = async (rating) => {
    try {
      await memoryVaultService.rateHelpfulness(selectedMemory.id, rating);
      setSelectedMemory({
        ...selectedMemory,
        helpfulnessRating: rating
      });
    } catch (err) {
      console.error('Error rating memory:', err);
    }
  };
  
  const handleDeleteMemory = async (id) => {
    try {
      await memoryVaultService.deleteMemory(id);
      setMemories(memories.filter(memory => memory.id !== id));
      if (selectedMemory && selectedMemory.id === id) {
        setShowViewMemory(false);
        setSelectedMemory(null);
      }
    } catch (err) {
      console.error('Error deleting memory:', err);
      setError('Failed to delete memory');
    }
  };
  
  const getEmotionColor = (emotion) => {
    const emotionColors = {
      joy: 'bg-yellow-100 text-yellow-800',
      peace: 'bg-blue-100 text-blue-800',
      pride: 'bg-purple-100 text-purple-800',
      strength: 'bg-red-100 text-red-800',
      love: 'bg-pink-100 text-pink-800',
      gratitude: 'bg-green-100 text-green-800',
      hope: 'bg-teal-100 text-teal-800',
      serenity: 'bg-indigo-100 text-indigo-800',
      amusement: 'bg-orange-100 text-orange-800',
      awe: 'bg-cyan-100 text-cyan-800'
    };
    
    return emotionColors[emotion] || 'bg-gray-100 text-gray-800';
  };
  
  return (
    <div>
      {/* Recommended Memory Alert */}
      {recommendedMemory && (
        <div className={`${theme.cardBg} border-l-4 border-green-500 p-4 mb-6 rounded-md shadow-md`}>
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-lg font-medium mb-2">We found a memory that might help you right now</h3>
              <p className="text-sm mb-3">{recommendedMemory.title}</p>
            </div>
            <button 
              onClick={() => handleViewMemory(recommendedMemory)}
              className={`${theme.accent} ${theme.accentHover} px-3 py-1 rounded-md text-sm`}
            >
              View Memory
            </button>
          </div>
        </div>
      )}
      
      {/* Header with Add Button */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Memory Vault for Emotional Anchoring</h2>
        <button
          onClick={() => setShowAddForm(true)}
          className={`${theme.accent} ${theme.accentHover} flex items-center px-3 py-2 rounded-md`}
        >
          <FaPlus className="mr-1" /> Add Memory
        </button>
      </div>
      
      {/* Description */}
      <div className={`${theme.cardBg} rounded-lg p-4 mb-6 shadow-md ${theme.shadow}`}>
        <p className={`${theme.subtext}`}>
          Your Memory Vault stores positive memories that can help anchor you during emotional challenges. 
          Add memories from times when you felt strong, peaceful, or joyful. The system will automatically 
          suggest these memories when you need emotional support.
        </p>
      </div>
      
      {/* Add Memory Form */}
      {showAddForm && (
        <div className={`${theme.cardBg} rounded-lg p-6 mb-6 shadow-md ${theme.shadow}`}>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium">Add New Memory</h3>
            <button 
              onClick={() => setShowAddForm(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>
          
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className={`block ${theme.text} text-sm font-medium mb-1`}>
                Memory Title
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border ${theme.border} rounded-md ${theme.input}`}
                required
              />
            </div>
            
            <div className="mb-4">
              <label className={`block ${theme.text} text-sm font-medium mb-1`}>
                Memory Content
              </label>
              <textarea
                name="content"
                value={formData.content}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border ${theme.border} rounded-md ${theme.input} min-h-[100px]`}
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Describe a memory that made you feel strong, peaceful, or joyful.
              </p>
            </div>
            
            <div className="mb-4">
              <label className={`block ${theme.text} text-sm font-medium mb-1`}>
                Content Type
              </label>
              <select
                name="contentType"
                value={formData.contentType}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border ${theme.border} rounded-md ${theme.input}`}
              >
                <option value="text">Text</option>
                <option value="audio">Audio</option>
                <option value="video">Video</option>
              </select>
            </div>
            
            {formData.contentType !== 'text' && (
              <div className="mb-4">
                <label className={`block ${theme.text} text-sm font-medium mb-1`}>
                  Media URL
                </label>
                <input
                  type="text"
                  name="mediaUrl"
                  value={formData.mediaUrl}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border ${theme.border} rounded-md ${theme.input}`}
                  placeholder="Enter URL to your audio or video file"
                />
              </div>
            )}
            
            <div className="mb-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="isCaregiver"
                  checked={formData.isCaregiver}
                  onChange={handleInputChange}
                  className="mr-2"
                />
                <label className={`${theme.text} text-sm font-medium`}>
                  This is a caregiver message
                </label>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Check this if you're a caregiver adding a supportive message for the patient.
              </p>
            </div>
            
            {formData.isCaregiver && (
              <>
                <div className="mb-4">
                  <label className={`block ${theme.text} text-sm font-medium mb-1`}>
                    Caregiver Name
                  </label>
                  <input
                    type="text"
                    name="caregiverName"
                    value={formData.caregiverName}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border ${theme.border} rounded-md ${theme.input}`}
                    required={formData.isCaregiver}
                  />
                </div>
                
                <div className="mb-4">
                  <label className={`block ${theme.text} text-sm font-medium mb-1`}>
                    Trigger Emotion
                  </label>
                  <select
                    name="triggerCondition.emotion"
                    value={formData.triggerCondition.emotion}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border ${theme.border} rounded-md ${theme.input}`}
                  >
                    <option value="any">Any Negative Emotion</option>
                    <option value="sad">Sadness</option>
                    <option value="angry">Anger</option>
                    <option value="fearful">Fear</option>
                    <option value="disgusted">Disgust</option>
                    <option value="depressed">Depression</option>
                    <option value="anxious">Anxiety</option>
                    <option value="aggressive">Aggression</option>
                  </select>
                </div>
                
                <div className="mb-4">
                  <label className={`block ${theme.text} text-sm font-medium mb-1`}>
                    Trigger Intensity (Minimum %)
                  </label>
                  <input
                    type="range"
                    name="triggerCondition.intensity"
                    value={formData.triggerCondition.intensity}
                    onChange={handleInputChange}
                    min="0"
                    max="100"
                    step="5"
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>0%</span>
                    <span>{formData.triggerCondition.intensity}%</span>
                    <span>100%</span>
                  </div>
                </div>
              </>
            )}
            
            <div className="flex justify-end mt-6">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2 border border-gray-300 rounded-md mr-2 text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className={`${theme.accent} ${theme.accentHover} px-4 py-2 rounded-md flex items-center`}
                disabled={isClassifying}
              >
                {isClassifying ? (
                  <>
                    <span className="animate-spin h-4 w-4 mr-2 border-t-2 border-b-2 border-white rounded-full"></span>
                    Analyzing...
                  </>
                ) : (
                  <>Save Memory</>
                )}
              </button>
            </div>
          </form>
        </div>
      )}
      
      {/* View Memory Modal */}
      {showViewMemory && selectedMemory && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className={`${theme.cardBg} rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto`}>
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-medium">{selectedMemory.title}</h3>
              <button 
                onClick={() => setShowViewMemory(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            
            <div className="mb-4">
              {selectedMemory.isCaregiver && (
                <div className="flex items-center mb-2">
                  <FaUserFriends className="text-blue-500 mr-2" />
                  <span className="text-sm font-medium text-blue-500">
                    Message from {selectedMemory.caregiverName}
                  </span>
                </div>
              )}
              
              {selectedMemory.contentType === 'text' ? (
                <p className={`${theme.text} whitespace-pre-line`}>{selectedMemory.content}</p>
              ) : selectedMemory.contentType === 'audio' ? (
                <audio 
                  controls 
                  className="w-full mt-2"
                  src={selectedMemory.mediaUrl}
                >
                  Your browser does not support the audio element.
                </audio>
              ) : (
                <video
                  controls
                  className="w-full mt-2 rounded-md"
                  src={selectedMemory.mediaUrl}
                >
                  Your browser does not support the video element.
                </video>
              )}
            </div>
            
            <div className="flex flex-wrap gap-2 mb-4">
              {selectedMemory.emotionTags && selectedMemory.emotionTags.map((tag, index) => (
                <span 
                  key={index}
                  className={`text-xs px-2 py-1 rounded-full ${getEmotionColor(tag)}`}
                >
                  {tag}
                </span>
              ))}
            </div>
            
            <div className="flex justify-between items-center text-sm text-gray-500 mb-6">
              <div>
                Created: {new Date(selectedMemory.createdAt).toLocaleDateString()}
              </div>
              <div>
                Accessed: {selectedMemory.accessCount} times
              </div>
            </div>
            
            <div className="border-t border-gray-200 pt-4">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm mb-1">Was this memory helpful?</p>
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((rating) => (
                      <button
                        key={rating}
                        onClick={() => handleRateHelpfulness(rating)}
                        className={`mr-1 ${
                          selectedMemory.helpfulnessRating >= rating 
                            ? 'text-yellow-500' 
                            : 'text-gray-300 hover:text-yellow-500'
                        }`}
                      >
                        <FaStar />
                      </button>
                    ))}
                  </div>
                </div>
                
                <button
                  onClick={() => handleDeleteMemory(selectedMemory.id)}
                  className="text-red-500 hover:text-red-700 flex items-center"
                >
                  <FaTrash className="mr-1" /> Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Memory List */}
      {isLoading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      ) : error ? (
        <div className={`${theme.cardBg} rounded-lg shadow-md ${theme.shadow} p-6 text-red-600`}>{error}</div>
      ) : memories.length === 0 ? (
        <div className={`${theme.cardBg} rounded-lg shadow-md ${theme.shadow} p-6 ${theme.subtext} text-center`}>
          <p className="mb-4">Your memory vault is empty. Add your first positive memory!</p>
          <button
            onClick={() => setShowAddForm(true)}
            className={`${theme.accent} ${theme.accentHover} flex items-center px-3 py-2 rounded-md mx-auto`}
          >
            <FaPlus className="mr-1" /> Add Memory
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {memories.map((memory) => (
            <div 
              key={memory.id} 
              className={`${theme.cardBg} rounded-lg shadow-md ${theme.shadow} p-4 cursor-pointer hover:shadow-lg transition-shadow`}
              onClick={() => handleViewMemory(memory)}
            >
              <div className="flex justify-between items-start mb-2">
                <h3 className={`${theme.text} font-medium truncate`}>{memory.title}</h3>
                {memory.isCaregiver && (
                  <FaUserFriends className="text-blue-500 ml-2 flex-shrink-0" />
                )}
              </div>
              
              <p className={`${theme.subtext} text-sm mb-3 line-clamp-3`}>{memory.content}</p>
              
              <div className="flex flex-wrap gap-1 mb-3">
                {memory.emotionTags && memory.emotionTags.slice(0, 3).map((tag, index) => (
                  <span 
                    key={index}
                    className={`text-xs px-2 py-0.5 rounded-full ${getEmotionColor(tag)}`}
                  >
                    {tag}
                  </span>
                ))}
              </div>
              
              <div className="flex justify-between items-center text-xs text-gray-500">
                <div>
                  {new Date(memory.createdAt).toLocaleDateString()}
                </div>
                <div className="flex items-center">
                  <FaHeart className="text-pink-500 mr-1" />
                  <span>{memory.dominantEmotion}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MemoryVault;
