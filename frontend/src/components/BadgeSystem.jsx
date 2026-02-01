import React from 'react';

const BadgeSystem = ({ streak }) => {
  // Badge milestones
  const badges = [
    { days: 5, emoji: "🥉", name: "Bronze Achiever", description: "Completed 5 days of mood tracking" },
    { days: 10, emoji: "🥈", name: "Silver Tracker", description: "Completed 10 days of mood tracking" },
    { days: 20, emoji: "🥇", name: "Gold Enthusiast", description: "Completed 20 days of mood tracking" },
    { days: 50, emoji: "💎", name: "Diamond Devotee", description: "Completed 50 days of mood tracking" },
    { days: 100, emoji: "👑", name: "Mood Master", description: "Completed 100 days of mood tracking" }
  ];

  // Get all earned badges
  const earnedBadges = badges.filter(badge => streak >= badge.days);
  // Get the next badge to earn
  const nextBadge = badges.find(badge => streak < badge.days);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Your Streak Badges</h3>
        <div className="flex items-center gap-2">
          <span className="text-xl">🔥</span>
          <span className="font-bold">{streak} Day Streak</span>
        </div>
      </div>

      {/* Earned badges */}
      {earnedBadges.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {earnedBadges.map((badge) => (
            <div 
              key={badge.days}
              className="flex items-center p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-100 shadow-sm"
            >
              <div className="flex-shrink-0 mr-4">
                <span className="text-4xl">{badge.emoji}</span>
              </div>
              <div>
                <h4 className="font-semibold text-blue-800">{badge.name}</h4>
                <p className="text-sm text-gray-600">{badge.description}</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-500 italic">Keep tracking your mood to earn badges!</p>
      )}

      {/* Next badge to earn */}
      {nextBadge && (
        <div className="mt-6">
          <h4 className="text-md font-medium text-gray-700 mb-2">Next Badge:</h4>
          <div className="flex items-center p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex-shrink-0 mr-4 opacity-50">
              <span className="text-4xl">{nextBadge.emoji}</span>
            </div>
            <div>
              <h4 className="font-semibold text-gray-600">{nextBadge.name}</h4>
              <p className="text-sm text-gray-500">
                {nextBadge.description} - {nextBadge.days - streak} more days to go!
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BadgeSystem;
