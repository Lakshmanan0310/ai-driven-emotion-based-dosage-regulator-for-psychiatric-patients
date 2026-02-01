import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const AnimatedMascot = ({ mood }) => {
  const [isAnimating, setIsAnimating] = useState(false);
  
  const messages = {
    1: {
      text: "I'm here for you. Remember, tough times don't last forever.",
      animation: "shake",
      emoji: "😢",
      color: "bg-blue-100"
    },
    2: {
      text: "Things will get better. Let's focus on self-care today.",
      animation: "pulse",
      emoji: "😐",
      color: "bg-yellow-100"
    },
    3: {
      text: "You're doing okay! Take it one step at a time.",
      animation: "bounce",
      emoji: "🙂",
      color: "bg-green-100"
    },
    4: {
      text: "Great to see you're feeling good! Keep up the positive energy!",
      animation: "jump",
      emoji: "😊",
      color: "bg-pink-100"
    },
    5: {
      text: "Amazing! Your happiness is contagious!",
      animation: "dance",
      emoji: "🥰",
      color: "bg-purple-100"
    }
  };

  useEffect(() => {
    setIsAnimating(true);
    const timer = setTimeout(() => setIsAnimating(false), 1000);
    return () => clearTimeout(timer);
  }, [mood]);

  const currentMessage = messages[mood] || messages[3];

  const containerVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: { duration: 0.5 }
    },
    exit: { 
      opacity: 0,
      scale: 0.8,
      transition: { duration: 0.3 }
    }
  };

  const bubbleVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { delay: 0.3, duration: 0.5 }
    }
  };

  const emojiVariants = {
    shake: {
      rotate: [0, -10, 10, -10, 10, 0],
      transition: { duration: 0.5 }
    },
    pulse: {
      scale: [1, 1.1, 1],
      transition: { duration: 0.5 }
    },
    bounce: {
      y: [0, -20, 0],
      transition: { duration: 0.5 }
    },
    jump: {
      y: [0, -30, 0],
      transition: { duration: 0.8, times: [0, 0.5, 1] }
    },
    dance: {
      rotate: [0, -15, 15, -15, 15, 0],
      scale: [1, 1.1, 1, 1.1, 1],
      transition: { duration: 0.8 }
    }
  };

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={mood}
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        className="flex flex-col items-center justify-center p-6 rounded-3xl"
      >
        <motion.div
          className="text-8xl mb-6"
          variants={emojiVariants}
          animate={isAnimating ? currentMessage.animation : ""}
        >
          {currentMessage.emoji}
        </motion.div>

        <motion.div
          variants={bubbleVariants}
          className={`relative p-6 rounded-2xl ${currentMessage.color} max-w-md`}
        >
          <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
            <div className={`w-6 h-6 ${currentMessage.color} rotate-45`}></div>
          </div>
          <div className="text-center">
            <h3 className="text-xl font-medium mb-2">Your Buddy Says:</h3>
            <p className="text-gray-700">{currentMessage.text}</p>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default AnimatedMascot;