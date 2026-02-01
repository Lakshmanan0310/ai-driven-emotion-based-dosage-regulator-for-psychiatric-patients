/**
 * Doctor Dashboard - Emotion Analysis History
 * Shows latest emotion analyses from all patients
 */

import React, { useState, useEffect } from 'react';
import { FaHeart, FaChartLine, FaClock, FaCheckCircle } from 'react-icons/fa';

const EmotionAnalysisDashboard = () => {
  const [analyses, setAnalyses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPatient, setSelectedPatient] = useState(null);

  useEffect(() => {
    fetchEmotionAnalyses();
  }, []);

  const fetchEmotionAnalyses = async () => {
    try {
      const response = await fetch('/api/emotion-analysis/doctor/all');
      const data = await response.json();

      if (data.success) {
        setAnalyses(data.data);
      }
    } catch (error) {
      console.error('Error fetching emotion analyses:', error);
    } finally {
      setLoading(false);
    }
  };

  const getEmotionColor = (emotion) => {
    const colors = {
      happy: 'text-yellow-500',
      sad: 'text-blue-500',
      angry: 'text-red-500',
      surprised: 'text-purple-500',
      disgusted: 'text-green-500',
      fearful: 'text-orange-500',
      neutral: 'text-gray-500'
    };
    return colors[emotion] || 'text-gray-500';
  };

  const getEmotionBg = (emotion) => {
    const bgs = {
      happy: 'bg-yellow-100',
      sad: 'bg-blue-100',
      angry: 'bg-red-100',
      surprised: 'bg-purple-100',
      disgusted: 'bg-green-100',
      fearful: 'bg-orange-100',
      neutral: 'bg-gray-100'
    };
    return bgs[emotion] || 'bg-gray-100';
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleString();
  };

  if (loading) {
    return <div className="p-6 text-center">Loading emotion analysis data...</div>;
  }

  return (
    <div className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl">
      <h2 className="text-3xl font-bold mb-6 text-indigo-900 flex items-center gap-2">
        <FaHeart className="text-red-500" />
        Emotion Analysis Dashboard
      </h2>

      {analyses.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p>No emotion analyses recorded yet</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {analyses.map((patientData) => (
            <div
              key={patientData.patientId}
              className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
            >
              {/* Patient Header */}
              <div className="p-4 bg-gradient-to-r from-blue-500 to-indigo-600 text-white">
                <h3 className="text-xl font-bold">{patientData.patientName}</h3>
                <p className="text-sm text-blue-100">ID: {patientData.patientId}</p>
              </div>

              {/* Latest Analysis */}
              {patientData.latestAnalysis && (
                <div className="p-4">
                  <div className="mb-4">
                    <h4 className="text-sm font-semibold text-gray-600 mb-2">Latest Analysis</h4>
                    <div
                      className={`p-3 rounded-lg ${getEmotionBg(
                        patientData.latestAnalysis.emotion
                      )}`}
                    >
                      <div className="flex items-center justify-between">
                        <span
                          className={`text-2xl font-bold capitalize ${getEmotionColor(
                            patientData.latestAnalysis.emotion
                          )}`}
                        >
                          {patientData.latestAnalysis.emotion}
                        </span>
                        <span className="text-sm font-semibold text-gray-700">
                          {(patientData.latestAnalysis.emotionConfidence * 100).toFixed(1)}%
                        </span>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                      <FaClock size={12} />
                      {formatDate(patientData.latestAnalysis.timestamp)}
                    </p>
                  </div>

                  {/* Recent Emotions Timeline */}
                  {patientData.recentEmotions.length > 0 && (
                    <div className="border-t pt-3">
                      <h4 className="text-sm font-semibold text-gray-600 mb-2">
                        Recent History ({patientData.recentEmotions.length})
                      </h4>
                      <div className="space-y-2">
                        {patientData.recentEmotions.map((analysis, idx) => (
                          <div
                            key={idx}
                            className="flex items-center justify-between text-xs p-2 bg-gray-50 rounded"
                          >
                            <span className={`font-semibold capitalize ${getEmotionColor(analysis.emotion)}`}>
                              {analysis.emotion}
                            </span>
                            <span className="text-gray-600">
                              {(analysis.emotionConfidence * 100).toFixed(0)}%
                            </span>
                            <span className="text-gray-500">
                              {new Date(analysis.timestamp).toLocaleTimeString()}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Doctor Review Status */}
                  <div className="border-t mt-3 pt-3">
                    {patientData.latestAnalysis.doctorReview?.reviewed ? (
                      <div className="flex items-center gap-2 text-xs text-green-600">
                        <FaCheckCircle />
                        <span>Reviewed by {patientData.latestAnalysis.doctorReview.reviewedBy}</span>
                      </div>
                    ) : (
                      <button className="w-full bg-blue-500 text-white py-2 rounded text-sm font-semibold hover:bg-blue-600 transition">
                        Review Analysis
                      </button>
                    )}
                  </div>

                  {/* Recommendation */}
                  {patientData.latestAnalysis.recommendation && (
                    <div className="border-t mt-3 pt-3">
                      <h4 className="text-sm font-semibold text-gray-600 mb-2 flex items-center gap-1">
                        <FaChartLine /> Recommendation
                      </h4>
                      <div className="text-xs bg-blue-50 p-2 rounded">
                        <p>
                          <span className="font-semibold">Medication:</span>{' '}
                          {patientData.latestAnalysis.recommendation.medication || 'None'}
                        </p>
                        <p>
                          <span className="font-semibold">Dosage:</span>{' '}
                          {patientData.latestAnalysis.recommendation.dosage || 'N/A'}
                        </p>
                        <p>
                          <span className="font-semibold">Advice:</span>{' '}
                          {patientData.latestAnalysis.recommendation.advice || 'None'}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default EmotionAnalysisDashboard;
