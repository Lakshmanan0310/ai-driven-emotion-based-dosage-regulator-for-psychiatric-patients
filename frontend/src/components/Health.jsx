// Health.jsx
import React, { useState, useEffect } from 'react';
import { Tab } from '@headlessui/react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend, PieChart, Pie, Cell } from 'recharts';
import MoodTracker from './MoodTracker';
import Chatbot from './Chatbot';
import RewardSystem from './RewardSystem';
import AnimatedMascot from './AnimatedMascot';
import FaceRecognition from './FaceRecognition';
import BadgeSystem from './BadgeSystem';
import { useTheme } from '../ThemeContext';
import { ThemeSwitcher } from '../ThemeContext';

const Health = () => {
  const [moodHistory, setMoodHistory] = useState([]);
  const [emotionHistory, setEmotionHistory] = useState([]);
  const [emotionStats, setEmotionStats] = useState({
    happy: 0,
    sad: 0,
    angry: 0,
    fearful: 0,
    disgusted: 0,
    surprised: 0,
    neutral: 0
  });
  const [rewards, setRewards] = useState(0);
  const [streakData, setStreakData] = useState(0);
  const { themes, currentTheme } = useTheme();
  const theme = themes[currentTheme];

  const handleMoodSubmit = (mood) => {
    setMoodHistory(prev => [...prev, {
      date: new Date().toLocaleDateString(),
      mood: mood
    }]);
    
    if (mood > 3) {
      setRewards(prev => prev + 1);
    }
  };

  useEffect(() => {
    const savedStreak = localStorage.getItem('moodStreak');
    if (savedStreak) {
      setStreakData(parseInt(savedStreak));
    }
  }, []);

  const handleStreakUpdate = (newStreak) => {
    setStreakData(newStreak);
  };

  const handleEmotionDetected = (emotionData) => {
    setEmotionHistory(prev => [...prev, {
      date: emotionData.timestamp.toLocaleDateString(),
      time: emotionData.timestamp.toLocaleTimeString(),
      emotion: emotionData.emotion.toLowerCase(),
      happy: emotionData.expressionValues.happy,
      sad: emotionData.expressionValues.sad,
      angry: emotionData.expressionValues.angry,
      fearful: emotionData.expressionValues.fearful,
      disgusted: emotionData.expressionValues.disgusted,
      surprised: emotionData.expressionValues.surprised,
      neutral: emotionData.expressionValues.neutral
    }]);

    setEmotionStats(prev => {
      const emotion = emotionData.emotion.toLowerCase();
      return {
        ...prev,
        [emotion]: prev[emotion] + 1
      };
    });
  };

  const pieChartData = Object.entries(emotionStats).map(([name, value]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1),
    value
  })).filter(item => item.value > 0);

  const EMOTION_COLORS = {
    happy: '#4CAF50',
    sad: '#2196F3',
    angry: '#F44336',
    fearful: '#9C27B0',
    disgusted: '#795548',
    surprised: '#FF9800',
    neutral: '#607D8B'
  };

  const COLORS = Object.values(EMOTION_COLORS);

  return (
    <div className={`min-h-screen ${theme.background}`}>
      <ThemeSwitcher />
      <header className={`${theme.cardBg} backdrop-blur-sm shadow-lg sticky top-0`}>
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
            Mental Health Buddy
          </h1>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <Tab.Group>
          <Tab.List className={`flex space-x-4 rounded-2xl ${theme.cardBg} backdrop-blur-sm p-2 shadow-lg mb-8`}>
            {['Mood Tracker', 'Chat Support', 'Progress', 'Face Recognition'].map((tab) => (
              <Tab
                key={tab}
                className={({ selected }) =>
                  `w-full rounded-xl py-3 text-sm font-medium leading-5 transition-all duration-200 ease-out
                  ${selected 
                    ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg transform scale-105'
                    : 'text-gray-600 hover:text-gray-800 hover:bg-white/80'
                  }`
                }
              >
                {tab}
              </Tab>
            ))}
          </Tab.List>
          
          <Tab.Panels>
            <Tab.Panel className="transform transition-all duration-300 ease-out">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-8 hover:shadow-xl transition-shadow duration-300">
                  <MoodTracker onMoodSubmit={handleMoodSubmit} onStreakUpdate={handleStreakUpdate} />
                </div>
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-8 hover:shadow-xl transition-shadow duration-300">
                  <AnimatedMascot mood={moodHistory[moodHistory.length - 1]?.mood || 3} />
                </div>
              </div>
            </Tab.Panel>
            
            <Tab.Panel className="transform transition-all duration-300 ease-out">
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-8 hover:shadow-xl transition-shadow duration-300">
                <Chatbot />
              </div>
            </Tab.Panel>
            
            <Tab.Panel className="transform transition-all duration-300 ease-out">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-8 hover:shadow-xl transition-shadow duration-300">
                  <h3 className="text-xl font-semibold mb-6 text-gray-800">Mood History</h3>
                  <div className="h-[400px] w-full">
                    <ResponsiveContainer>
                      <LineChart data={moodHistory}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                        <XAxis 
                          dataKey="date" 
                          stroke="#64748B"
                          tick={{ fill: '#64748B' }}
                        />
                        <YAxis 
                          domain={[0, 5]} 
                          stroke="#64748B"
                          tick={{ fill: '#64748B' }}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: 'rgba(255, 255, 255, 0.9)',
                            border: 'none',
                            borderRadius: '8px',
                            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                          }}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="mood" 
                          stroke="url(#colorMood)" 
                          strokeWidth={2}
                          dot={{ fill: '#6366F1', strokeWidth: 2 }}
                          activeDot={{ r: 8, fill: '#4F46E5' }}
                        />
                        <defs>
                          <linearGradient id="colorMood" x1="0" y1="0" x2="1" y2="0">
                            <stop offset="0%" stopColor="#6366F1" />
                            <stop offset="100%" stopColor="#A855F7" />
                          </linearGradient>
                        </defs>
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-8 hover:shadow-xl transition-shadow duration-300">
                  <RewardSystem rewards={rewards} />
                </div>
                
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-8 hover:shadow-xl transition-shadow duration-300 md:col-span-2">
                  <BadgeSystem streak={streakData} />
                </div>
                
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-8 hover:shadow-xl transition-shadow duration-300 md:col-span-2">
                  <h3 className="text-xl font-semibold mb-6 text-gray-800">Facial Emotion Analysis</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="bg-white/60 rounded-xl p-4 shadow">
                      <h4 className="text-lg font-medium mb-4 text-gray-700 text-center">Emotion Distribution</h4>
                      <div className="h-[300px] w-full">
                        <ResponsiveContainer>
                          <PieChart>
                            <Pie
                              data={pieChartData}
                              cx="50%"
                              cy="50%"
                              labelLine={true}
                              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                              outerRadius={80}
                              fill="#8884d8"
                              dataKey="value"
                            >
                              {pieChartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                              ))}
                            </Pie>
                            <Tooltip 
                              formatter={(value, name) => [value, name]}
                              contentStyle={{
                                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                                border: 'none',
                                borderRadius: '8px',
                                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                              }}
                            />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                    
                    <div className="bg-white/60 rounded-xl p-4 shadow">
                      <h4 className="text-lg font-medium mb-4 text-gray-700 text-center">Recent Emotions</h4>
                      <div className="h-[300px] w-full">
                        <ResponsiveContainer>
                          <BarChart
                            data={emotionHistory.slice(-10).reverse()}
                            layout="vertical"
                            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                          >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis type="number" domain={[0, 1]} />
                            <YAxis 
                              dataKey="time" 
                              type="category" 
                              scale="band" 
                              tick={{ fontSize: 12 }}
                              width={100}
                            />
                            <Tooltip
                              contentStyle={{
                                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                                border: 'none',
                                borderRadius: '8px',
                                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                              }}
                              formatter={(value, name) => [value.toFixed(2), name.charAt(0).toUpperCase() + name.slice(1)]}
                            />
                            <Legend />
                            <Bar dataKey="happy" fill={EMOTION_COLORS.happy} stackId="a" />
                            <Bar dataKey="sad" fill={EMOTION_COLORS.sad} stackId="a" />
                            <Bar dataKey="angry" fill={EMOTION_COLORS.angry} stackId="a" />
                            <Bar dataKey="fearful" fill={EMOTION_COLORS.fearful} stackId="a" />
                            <Bar dataKey="disgusted" fill={EMOTION_COLORS.disgusted} stackId="a" />
                            <Bar dataKey="surprised" fill={EMOTION_COLORS.surprised} stackId="a" />
                            <Bar dataKey="neutral" fill={EMOTION_COLORS.neutral} stackId="a" />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </div>
                  
                  {emotionHistory.length === 0 && (
                    <div className="text-center text-gray-500 mt-4">
                      <p>No emotion data yet. Use the Face Recognition feature to start tracking your emotions.</p>
                    </div>
                  )}
                </div>
              </div>
            </Tab.Panel>
            
            <Tab.Panel className="transform transition-all duration-300 ease-out">
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-8 hover:shadow-xl transition-shadow duration-300">
                <FaceRecognition onEmotionDetected={handleEmotionDetected} />
              </div>
            </Tab.Panel>
          </Tab.Panels>
        </Tab.Group>
      </main>
    </div>
  );
};

export default Health;