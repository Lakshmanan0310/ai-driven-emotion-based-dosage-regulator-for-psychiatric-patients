import React, { useState, useEffect } from 'react';
import { 
  LineChart, Line, BarChart, Bar, PieChart, Pie, 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, 
  ResponsiveContainer, Cell, RadarChart, Radar, PolarGrid, 
  PolarAngleAxis, PolarRadiusAxis
} from 'recharts';
import { emotionService, sessionService } from '../services/api';

const EMOTION_COLORS = {
  happy: '#4ade80',
  sad: '#60a5fa',
  angry: '#f87171',
  fearful: '#a78bfa',
  disgusted: '#fbbf24',
  surprised: '#f472b6',
  neutral: '#94a3b8',
  aggressive: '#ef4444',
  depressed: '#3b82f6',
  anxious: '#8b5cf6'
};

const EmotionAnalytics = ({ patientId }) => {
  const [emotionData, setEmotionData] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeRange, setTimeRange] = useState('month'); // week, month, all
  const [chartType, setChartType] = useState('line'); // line, radar, pie, bar
  
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Fetch emotion trends
        const trends = await emotionService.getHistory(patientId);
        
        // Fetch sessions
        const sessionData = await sessionService.getSessions(patientId);
        
        // Process data
        setEmotionData(trends);
        setSessions(sessionData);
      } catch (err) {
        console.error('Error fetching emotion data:', err);
        setError('Failed to load emotion data');
      } finally {
        setIsLoading(false);
      }
    };
    
    if (patientId) {
      fetchData();
    }
  }, [patientId]);
  
  // Filter data based on time range
  const getFilteredData = () => {
    if (!sessions || sessions.length === 0) return [];
    
    const now = new Date();
    let cutoffDate;
    
    switch (timeRange) {
      case 'week':
        cutoffDate = new Date(now.setDate(now.getDate() - 7));
        break;
      case 'month':
        cutoffDate = new Date(now.setMonth(now.getMonth() - 1));
        break;
      default:
        cutoffDate = new Date(0); // All data
    }
    
    return sessions
      .filter(session => new Date(session.timestamp) >= cutoffDate)
      .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
      .map(session => ({
        date: new Date(session.timestamp).toLocaleDateString(),
        timestamp: session.timestamp,
        emotion: session.emotion,
        intensity: session.emotionIntensity,
        voiceTone: session.voiceTone,
        // Map emotions to values for radar chart
        happy: session.emotion === 'happy' ? session.emotionIntensity : 0,
        sad: session.emotion === 'sad' ? session.emotionIntensity : 0,
        angry: session.emotion === 'angry' ? session.emotionIntensity : 0,
        fearful: session.emotion === 'fearful' ? session.emotionIntensity : 0,
        disgusted: session.emotion === 'disgusted' ? session.emotionIntensity : 0,
        surprised: session.emotion === 'surprised' ? session.emotionIntensity : 0,
        neutral: session.emotion === 'neutral' ? session.emotionIntensity : 0,
      }));
  };
  
  // Calculate emotion distribution for pie chart
  const getEmotionDistribution = () => {
    const filteredData = getFilteredData();
    const distribution = {};
    
    filteredData.forEach(session => {
      distribution[session.emotion] = (distribution[session.emotion] || 0) + 1;
    });
    
    return Object.entries(distribution).map(([emotion, count]) => ({
      name: emotion,
      value: count,
      color: EMOTION_COLORS[emotion] || '#cbd5e1'
    }));
  };
  
  // Calculate average intensity by emotion
  const getAverageIntensities = () => {
    const filteredData = getFilteredData();
    const sums = {};
    const counts = {};
    
    filteredData.forEach(session => {
      sums[session.emotion] = (sums[session.emotion] || 0) + session.intensity;
      counts[session.emotion] = (counts[session.emotion] || 0) + 1;
    });
    
    return Object.entries(sums).map(([emotion, sum]) => ({
      name: emotion,
      value: Math.round(sum / counts[emotion]),
      color: EMOTION_COLORS[emotion] || '#cbd5e1'
    }));
  };
  
  // Calculate emotion trends over time
  const getEmotionTrends = () => {
    const filteredData = getFilteredData();
    
    // Group by date
    const groupedByDate = {};
    filteredData.forEach(session => {
      if (!groupedByDate[session.date]) {
        groupedByDate[session.date] = {
          date: session.date,
          happy: 0,
          sad: 0,
          angry: 0,
          fearful: 0,
          disgusted: 0,
          surprised: 0,
          neutral: 0,
          count: 0
        };
      }
      
      groupedByDate[session.date][session.emotion] += session.intensity;
      groupedByDate[session.date].count += 1;
    });
    
    // Average intensities per day
    return Object.values(groupedByDate).map(day => {
      const result = { date: day.date };
      
      ['happy', 'sad', 'angry', 'fearful', 'disgusted', 'surprised', 'neutral'].forEach(emotion => {
        result[emotion] = day[emotion] > 0 ? Math.round(day[emotion] / day.count) : 0;
      });
      
      return result;
    });
  };
  
  // Get radar data (most recent session)
  const getRadarData = () => {
    const filteredData = getFilteredData();
    if (filteredData.length === 0) return [];
    
    // Get most recent session
    const mostRecent = filteredData[filteredData.length - 1];
    
    return [
      { subject: 'Happy', A: mostRecent.happy, fullMark: 100 },
      { subject: 'Sad', A: mostRecent.sad, fullMark: 100 },
      { subject: 'Angry', A: mostRecent.angry, fullMark: 100 },
      { subject: 'Fearful', A: mostRecent.fearful, fullMark: 100 },
      { subject: 'Disgusted', A: mostRecent.disgusted, fullMark: 100 },
      { subject: 'Surprised', A: mostRecent.surprised, fullMark: 100 },
      { subject: 'Neutral', A: mostRecent.neutral, fullMark: 100 }
    ];
  };
  
  // Calculate emotion trends for psychiatric indicators
  const getPsychiatricIndicators = () => {
    const filteredData = getFilteredData();
    
    // Group by date
    const groupedByDate = {};
    filteredData.forEach(session => {
      if (!groupedByDate[session.date]) {
        groupedByDate[session.date] = {
          date: session.date,
          depression: 0,
          aggression: 0,
          anxiety: 0,
          count: 0
        };
      }
      
      // Map emotions to psychiatric indicators
      if (session.emotion === 'sad') {
        groupedByDate[session.date].depression += session.intensity;
      } else if (session.emotion === 'angry') {
        groupedByDate[session.date].aggression += session.intensity;
      } else if (session.emotion === 'fearful') {
        groupedByDate[session.date].anxiety += session.intensity;
      }
      
      groupedByDate[session.date].count += 1;
    });
    
    // Average intensities per day
    return Object.values(groupedByDate).map(day => {
      return {
        date: day.date,
        depression: day.depression > 0 ? Math.round(day.depression / day.count) : 0,
        aggression: day.aggression > 0 ? Math.round(day.aggression / day.count) : 0,
        anxiety: day.anxiety > 0 ? Math.round(day.anxiety / day.count) : 0
      };
    });
  };
  
  // Render loading state
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  // Render error state
  if (error) {
    return (
      <div className="bg-red-50 p-4 rounded-lg text-red-700">
        <p className="font-medium">Error loading emotion data</p>
        <p className="text-sm">{error}</p>
      </div>
    );
  }
  
  // Render no data state
  if (!sessions || sessions.length === 0) {
    return (
      <div className="bg-blue-50 p-4 rounded-lg text-blue-700">
        <p className="font-medium">No emotion data available</p>
        <p className="text-sm">This patient hasn't completed any emotion check-ins yet.</p>
      </div>
    );
  }
  
  return (
    <div className="bg-white rounded-lg shadow p-4">
      <div className="flex flex-wrap justify-between items-center mb-6">
        <h3 className="text-lg font-semibold">Emotion Analytics</h3>
        
        <div className="flex gap-2 mt-2 sm:mt-0">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="border rounded-md px-3 py-1 text-sm"
          >
            <option value="week">Last 7 Days</option>
            <option value="month">Last 30 Days</option>
            <option value="all">All Time</option>
          </select>
          
          <select
            value={chartType}
            onChange={(e) => setChartType(e.target.value)}
            className="border rounded-md px-3 py-1 text-sm"
          >
            <option value="line">Line Chart</option>
            <option value="radar">Radar Chart</option>
            <option value="pie">Pie Chart</option>
            <option value="bar">Bar Chart</option>
          </select>
        </div>
      </div>
      
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          {chartType === 'line' && (
            <LineChart data={getEmotionTrends()}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis domain={[0, 100]} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="happy" stroke={EMOTION_COLORS.happy} name="Happy" />
              <Line type="monotone" dataKey="sad" stroke={EMOTION_COLORS.sad} name="Sad" />
              <Line type="monotone" dataKey="angry" stroke={EMOTION_COLORS.angry} name="Angry" />
              <Line type="monotone" dataKey="fearful" stroke={EMOTION_COLORS.fearful} name="Fearful" />
            </LineChart>
          )}
          
          {chartType === 'radar' && (
            <RadarChart outerRadius={90} data={getRadarData()}>
              <PolarGrid />
              <PolarAngleAxis dataKey="subject" />
              <PolarRadiusAxis angle={30} domain={[0, 100]} />
              <Radar name="Emotions" dataKey="A" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
              <Legend />
            </RadarChart>
          )}
          
          {chartType === 'pie' && (
            <PieChart>
              <Pie
                data={getEmotionDistribution()}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={80}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {getEmotionDistribution().map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => [`${value} sessions`, 'Count']} />
              <Legend />
            </PieChart>
          )}
          
          {chartType === 'bar' && (
            <BarChart data={getAverageIntensities()}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis domain={[0, 100]} />
              <Tooltip formatter={(value) => [`${value}%`, 'Intensity']} />
              <Bar dataKey="value">
                {getAverageIntensities().map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>
      
      <div className="mt-8">
        <h3 className="text-lg font-semibold mb-4">Psychiatric Indicators</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={getPsychiatricIndicators()}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis domain={[0, 100]} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="depression" stroke="#3b82f6" name="Depression" />
              <Line type="monotone" dataKey="aggression" stroke="#ef4444" name="Aggression" />
              <Line type="monotone" dataKey="anxiety" stroke="#8b5cf6" name="Anxiety" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
      
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-blue-50 rounded-lg p-4">
          <h4 className="font-medium text-blue-800 mb-1">Depression Risk</h4>
          <div className="flex items-center">
            <div className="text-2xl font-bold text-blue-700">
              {getFilteredData().length > 0 
                ? Math.round(getFilteredData().reduce((sum, session) => 
                    sum + (session.emotion === 'sad' ? session.intensity : 0), 0) / 
                    getFilteredData().filter(s => s.emotion === 'sad').length || 0) 
                : 0}%
            </div>
            <div className="ml-2 text-sm text-blue-600">
              {getFilteredData().filter(s => s.emotion === 'sad').length} sessions
            </div>
          </div>
        </div>
        
        <div className="bg-red-50 rounded-lg p-4">
          <h4 className="font-medium text-red-800 mb-1">Aggression Risk</h4>
          <div className="flex items-center">
            <div className="text-2xl font-bold text-red-700">
              {getFilteredData().length > 0 
                ? Math.round(getFilteredData().reduce((sum, session) => 
                    sum + (session.emotion === 'angry' ? session.intensity : 0), 0) / 
                    getFilteredData().filter(s => s.emotion === 'angry').length || 0) 
                : 0}%
            </div>
            <div className="ml-2 text-sm text-red-600">
              {getFilteredData().filter(s => s.emotion === 'angry').length} sessions
            </div>
          </div>
        </div>
        
        <div className="bg-purple-50 rounded-lg p-4">
          <h4 className="font-medium text-purple-800 mb-1">Anxiety Risk</h4>
          <div className="flex items-center">
            <div className="text-2xl font-bold text-purple-700">
              {getFilteredData().length > 0 
                ? Math.round(getFilteredData().reduce((sum, session) => 
                    sum + (session.emotion === 'fearful' ? session.intensity : 0), 0) / 
                    getFilteredData().filter(s => s.emotion === 'fearful').length || 0) 
                : 0}%
            </div>
            <div className="ml-2 text-sm text-purple-600">
              {getFilteredData().filter(s => s.emotion === 'fearful').length} sessions
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmotionAnalytics;
