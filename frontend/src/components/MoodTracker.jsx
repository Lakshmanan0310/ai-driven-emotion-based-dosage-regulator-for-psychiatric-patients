// MoodTracker.jsx
import React, { useState, useEffect } from 'react';
import '../index.css'

const MoodTracker = ({ onMoodSubmit, onStreakUpdate, hideStreak = false }) => {
  const [selectedMood, setSelectedMood] = useState(null);
  const [note, setNote] = useState('');
  const [streak, setStreak] = useState(0);
  const [lastSubmission, setLastSubmission] = useState(null);
  const [feedback, setFeedback] = useState('');
  const [showAnimation, setShowAnimation] = useState(false);
  

  const moods = [
    { 
      emoji: "😢", 
      score: 1, 
      label: 'Very Bad', 
      color: 'from-red-400 to-red-500',
      messages: [
        "I hear you're having a tough time",
        "It's okay to not be okay",
        "Remember, this feeling will pass"
      ],
      suggestions: [
        "Try taking slow, deep breaths",
        "Consider talking to someone you trust",
        "Be gentle with yourself today"
      ]
    },
    { 
      emoji: "😐", 
      score: 2, 
      label: 'Bad', 
      color: 'from-orange-400 to-orange-500',
      messages: [
        "Things seem a bit rough right now",
        "You're handling it bravely",
        "Every small step counts"
      ],
      suggestions: [
        "Take a short walk outside",
        "Listen to some calming music",
        "Write down your thoughts"
      ]
    },
    { 
      emoji: "🙂", 
      score: 3, 
      label: 'Okay', 
      color: 'from-yellow-400 to-yellow-500',
      messages: [
        "You're doing alright",
        "Steady as you go",
        "Finding your balance"
      ],
      suggestions: [
        "Try something creative today",
        "Connect with a friend",
        "Practice mindfulness"
      ]
    },
    { 
      emoji: "😊", 
      score: 4, 
      label: 'Good', 
      color: 'from-green-400 to-green-500',
      messages: [
        "That's great to hear!",
        "Keep that positive energy flowing",
        "You're doing wonderful"
      ],
      suggestions: [
        "Share your joy with others",
        "Try something new today",
        "Acknowledge your progress"
      ]
    },
    { 
      emoji: "🥰", 
      score: 5, 
      label: 'Great', 
      color: 'from-blue-400 to-blue-500',
      messages: [
        "Fantastic! You're glowing!",
        "What a wonderful day!",
        "Your positivity is inspiring"
      ],
      suggestions: [
        "Celebrate this moment",
        "Spread the happiness",
        "Remember this feeling"
      ]
    }
  ];

  useEffect(() => {
    // Load streak data from localStorage
    const savedStreak = localStorage.getItem('moodStreak');
    const savedLastSubmission = localStorage.getItem('lastMoodSubmission');
    
    if (savedStreak && savedLastSubmission) {
      setStreak(parseInt(savedStreak));
      setLastSubmission(new Date(savedLastSubmission));
      checkAndUpdateStreak(new Date(savedLastSubmission));
      
      // Notify parent component about streak
      if (onStreakUpdate) {
        onStreakUpdate(parseInt(savedStreak));
      }
    }
  }, [onStreakUpdate]);

  const checkAndUpdateStreak = (lastDate) => {
    const now = new Date();
    const lastSubmissionDate = new Date(lastDate);
    const daysDifference = Math.floor((now - lastSubmissionDate) / (1000 * 60 * 60 * 24));

    if (daysDifference > 1) {
      // Reset streak if more than a day has passed
      setStreak(0);
      localStorage.setItem('moodStreak', '0');
    }
  };

  const getRandomElement = (array) => {
    return array[Math.floor(Math.random() * array.length)];
  };

  const handleMoodSelection = (score) => {
    setSelectedMood(score);
    const moodData = moods.find(m => m.score === score);
    setFeedback(`${getRandomElement(moodData.messages)}. ${getRandomElement(moodData.suggestions)}`);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (selectedMood !== null) {
      const now = new Date();
      const lastDate = lastSubmission ? new Date(lastSubmission) : null;
      
      // Check if this is a new day
      if (!lastDate || lastDate.toDateString() !== now.toDateString()) {
        const newStreak = streak + 1;
        setStreak(newStreak);
        localStorage.setItem('moodStreak', newStreak.toString());
        localStorage.setItem('lastMoodSubmission', now.toString());
        setLastSubmission(now);
        
        // Notify parent component about streak update
        if (onStreakUpdate) {
          onStreakUpdate(newStreak);
        }
        
        // Show streak animation
        setShowAnimation(true);
        setTimeout(() => setShowAnimation(false), 2000);
      }

      const selectedMoodData = moods.find(m => m.score === selectedMood);
      const feedbackMessage = getRandomElement(selectedMoodData.messages);
      const suggestion = getRandomElement(selectedMoodData.suggestions);
      setFeedback(`${feedbackMessage}. ${suggestion}`);

      onMoodSubmit(selectedMood);
      
      // Reset after submission
      setTimeout(() => {
        setSelectedMood(null);
        setNote('');
      }, 1500);
    }
  };

  return (
    <div className="space-y-6 ">
      {/* Streak Display */}
      {!hideStreak && (
        <div className="streak absolute right-0  z-40 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-lg shadow-lg">
          <div className="flex items-center gap-2">
            <span className="text-xl">🔥</span>
            <span className="font-bold">{streak} Day Streak</span>
          </div>
        </div>
      )}

      {showAnimation && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-xl shadow-2xl transform animate-bounce">
            <p className="text-2xl font-bold text-center">
              🎉 {streak} Day Streak! 🎉
            </p>
          </div>
        </div>
      )}

      <h3 className="text-xl font-semibold text-gray-800 text-center">How are you feeling today?</h3>
      
      <div className="grid grid-cols-5 gap-4">
        {moods.map(({ emoji, score, label, color }) => (
          <button
            key={score}
            onClick={() => handleMoodSelection(score)}
            className={`flex flex-col items-center p-4 rounded-xl transition-all duration-300
              ${selectedMood === score 
                ? `bg-gradient-to-br ${color} transform scale-105 shadow-lg` 
                : 'bg-white hover:bg-gray-50 hover:shadow'}`}
          >
            <span className="text-4xl mb-2 transform transition-transform duration-300 hover:scale-110">
              {emoji}
            </span>
            <span className={`text-sm font-medium ${
              selectedMood === score ? 'text-white' : 'text-gray-600'
            }`}>
              {label}
            </span>
          </button>
        ))}
      </div>

      {feedback && (
        <div className="bg-gray-50 p-4 rounded-xl">
          <p className="text-gray-700">{feedback}</p>
        </div>
      )}

      <textarea
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="Add a note about how you're feeling (optional)"
        className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent
          placeholder-gray-400 resize-none transition-shadow duration-300 hover:shadow-sm"
        rows={3}
      />

      {selectedMood !== null && (
        <button
          onClick={handleSubmit}
          className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white py-3 rounded-xl
            font-medium shadow-lg transform transition-all duration-300 hover:scale-105 hover:shadow-xl"
        >
          Save Mood
        </button>
      )}
    </div>
  );
};

export default MoodTracker;