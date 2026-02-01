import React, { useState, useEffect } from 'react';
import { FaSmile, FaSadTear, FaAngry, FaSurprise, FaMeh, FaFlushed, FaEye } from 'react-icons/fa';

const EmotionHistoryDisplay = ({ patientId }) => {
  const [emotionHistory, setEmotionHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Emotion to icon and color mapping
  const emotionMap = {
    happy: { icon: <FaSmile />, color: 'text-yellow-500', bgColor: 'bg-yellow-50', borderColor: 'border-yellow-200' },
    sad: { icon: <FaSadTear />, color: 'text-blue-500', bgColor: 'bg-blue-50', borderColor: 'border-blue-200' },
    angry: { icon: <FaAngry />, color: 'text-red-500', bgColor: 'bg-red-50', borderColor: 'border-red-200' },
    fearful: { icon: <FaSurprise />, color: 'text-purple-500', bgColor: 'bg-purple-50', borderColor: 'border-purple-200' },
    disgusted: { icon: <FaFlushed />, color: 'text-green-600', bgColor: 'bg-green-50', borderColor: 'border-green-200' },
    surprised: { icon: <FaSurprise />, color: 'text-orange-500', bgColor: 'bg-orange-50', borderColor: 'border-orange-200' },
    neutral: { icon: <FaMeh />, color: 'text-gray-500', bgColor: 'bg-gray-50', borderColor: 'border-gray-200' },
  };

  useEffect(() => {
    fetchEmotionHistory();
  }, [patientId]);

  const fetchEmotionHistory = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch emotion analysis history from the database
      const response = await fetch(`/api/emotion-analysis/${patientId}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch emotion history: ${response.status}`);
      }

      const data = await response.json();
      console.log('📊 Fetched emotion history:', data);

      // data could be an array or an object with data property
      const history = Array.isArray(data) ? data : data.data || [];
      setEmotionHistory(history);

      if (history.length === 0) {
        setError('No emotion analysis history found');
      }
    } catch (err) {
      console.error('❌ Error fetching emotion history:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Format timestamp
  const formatTime = (timestamp) => {
    if (!timestamp) return 'Unknown';
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <FaEye className="text-blue-500" />
          Emotion History
        </h3>
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <p className="text-gray-500 mt-2">Loading emotion history...</p>
        </div>
      </div>
    );
  }

  if (error && emotionHistory.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <FaEye className="text-blue-500" />
          Emotion History
        </h3>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
          <p className="text-yellow-800">{error}</p>
          <button
            onClick={fetchEmotionHistory}
            className="mt-3 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-sm"
          >
            Refresh
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <FaEye className="text-blue-500" />
        Emotion History ({emotionHistory.length} analyses)
      </h3>

      {emotionHistory.length === 0 ? (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
          <p className="text-gray-500">No emotion analysis history yet. Start a session to begin tracking!</p>
        </div>
      ) : (
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {emotionHistory.map((analysis, index) => {
            const emotion = analysis.emotion?.toLowerCase() || 'neutral';
            const emotionInfo = emotionMap[emotion] || emotionMap.neutral;
            const confidence = Math.round((analysis.emotionConfidence || 0) * 100);

            return (
              <div
                key={analysis._id || index}
                className={`border-l-4 ${emotionInfo.borderColor} ${emotionInfo.bgColor} rounded-lg p-4 transition-all hover:shadow-md`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    <span className={`text-2xl ${emotionInfo.color} mt-1`}>
                      {emotionInfo.icon}
                    </span>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold text-gray-800 capitalize">
                          {emotion}
                        </h4>
                        <span className="inline-block bg-gray-200 rounded-full px-3 py-1 text-xs font-semibold text-gray-700">
                          {confidence}% confident
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        {formatTime(analysis.timestamp)}
                      </p>

                      {/* Show analysis type */}
                      {analysis.analysisType && (
                        <p className="text-xs text-gray-500 mt-1">
                          Type: <span className="capitalize font-medium">{analysis.analysisType}</span>
                        </p>
                      )}

                      {/* Show recommendation if available */}
                      {analysis.recommendation && (
                        <div className="mt-2 text-sm">
                          <p className="text-gray-700">
                            <span className="font-semibold">💊 Recommendation:</span> {analysis.recommendation.medication || 'No medication'}
                          </p>
                          {analysis.recommendation.dosage && (
                            <p className="text-gray-600">
                              Dosage: {analysis.recommendation.dosage}
                            </p>
                          )}
                          {analysis.recommendation.advice && (
                            <p className="text-gray-600">
                              Advice: {analysis.recommendation.advice}
                            </p>
                          )}
                        </div>
                      )}

                      {/* Show transcript if available */}
                      {analysis.transcript && (
                        <p className="text-sm text-gray-600 mt-2 italic">
                          📝 "{analysis.transcript.substring(0, 80)}{analysis.transcript.length > 80 ? '...' : ''}"
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Confidence progress bar */}
                  <div className="ml-4 min-w-24">
                    <div className="relative h-2 bg-gray-300 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${emotionInfo.color.replace('text', 'bg')} rounded-full transition-all`}
                        style={{ width: `${confidence}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {emotionHistory.length > 0 && (
        <button
          onClick={fetchEmotionHistory}
          className="mt-4 w-full py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-sm font-medium transition"
        >
          Refresh History
        </button>
      )}
    </div>
  );
};

export default EmotionHistoryDisplay;
