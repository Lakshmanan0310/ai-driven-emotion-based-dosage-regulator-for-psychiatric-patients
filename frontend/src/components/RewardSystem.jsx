import React from 'react';

const RewardSystem = ({ rewards }) => {
  const milestones = [
    { emoji: "⭐", count: 5, label: 'Rising Star' },
    { emoji: "🏅", count: 10, label: 'Wellness Warrior' },
    { emoji: "🏆", count: 20, label: 'Mental Health Champion' }
  ];

  return (
    <div>
      <h3 className="text-lg font-medium mb-4">Your Achievements</h3>
      <div className="mb-4">
        <p className="text-2xl font-bold text-blue-600">{rewards} Points</p>
        <p className="text-gray-600">Keep tracking your mood to earn more!</p>
      </div>
      <div className="space-y-4">
        {milestones.map(({ emoji, count, label }) => (
          <div
            key={label}
            className={`flex items-center p-3 rounded-lg border
              ${rewards >= count ? 'bg-blue-50 border-blue-200' : 'bg-gray-50 border-gray-200'}`}
          >
            <span className="text-2xl mr-3">{emoji}</span>
            <div>
              <p className="font-medium">{label}</p>
              <p className="text-sm text-gray-600">{count} points needed</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RewardSystem;