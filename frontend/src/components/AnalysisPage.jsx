import React, { useState } from 'react';
import { FaCamera, FaMicrophone, FaLayerGroup } from 'react-icons/fa';

const AnalysisPage = () => {
  // State to track the active tab
  const [activeTab, setActiveTab] = useState('facial'); // 'facial', 'voice', or 'combined'

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden">
      {/* Tab Navigation */}
      <div className="flex border-b">
        <button
          className={`flex items-center px-4 py-3 ${
            activeTab === 'facial'
              ? 'text-blue-500 border-b-2 border-blue-500 font-medium'
              : 'text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => setActiveTab('facial')}
        >
          <FaCamera className="mr-2" /> Facial Analysis
        </button>
        <button
          className={`flex items-center px-4 py-3 ${
            activeTab === 'voice'
              ? 'text-purple-500 border-b-2 border-purple-500 font-medium'
              : 'text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => setActiveTab('voice')}
        >
          <FaMicrophone className="mr-2" /> Voice Analysis
        </button>
        <button
          className={`flex items-center px-4 py-3 ${
            activeTab === 'combined'
              ? 'text-gray-700 border-b-2 border-gray-700 font-medium'
              : 'text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => setActiveTab('combined')}
        >
          <FaLayerGroup className="mr-2" /> Combined Analysis
        </button>
      </div>

      {/* Content Area */}
      <div className="p-6">
        <h2 className="text-2xl font-bold mb-6">Emotion Analysis</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Facial Analysis Box - Only show when facial tab is active */}
          {(activeTab === 'facial' || activeTab === 'combined') && (
            <div className="bg-white border rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex justify-center mb-4">
                <div className="bg-blue-100 p-4 rounded-full">
                  <FaCamera className="text-blue-500 text-2xl" />
                </div>
              </div>
              <h3 className="text-xl font-bold text-center mb-2">Facial Analysis</h3>
              <p className="text-gray-600 text-center">
                Analyze your facial expressions to detect emotions
              </p>
            </div>
          )}

          {/* Voice Analysis Box - Only show when voice tab is active */}
          {(activeTab === 'voice' || activeTab === 'combined') && (
            <div className="bg-white border rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex justify-center mb-4">
                <div className="bg-purple-100 p-4 rounded-full">
                  <FaMicrophone className="text-purple-500 text-2xl" />
                </div>
              </div>
              <h3 className="text-xl font-bold text-center mb-2">Voice Analysis</h3>
              <p className="text-gray-600 text-center">
                Analyze your voice and speech to detect emotions
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AnalysisPage;
