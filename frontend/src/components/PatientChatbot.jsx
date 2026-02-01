import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaMicrophone, FaMicrophoneSlash, FaVolumeUp, FaVolumeMute, FaPaperPlane, FaTimesCircle, FaRobot } from 'react-icons/fa';
import { useTheme } from '../ThemeContext';

/**
 * PatientChatbot Component
 * 
 * AI-powered empathetic chatbot for patient support and mental health assistance
 * Features:
 * - Text and voice input/output
 * - Emotion-aware responses
 * - Multiple conversation categories
 * - Conversation history persistence
 * - Google Generative AI integration
 * - Text-to-Speech synthesis
 * - Medication and mental health support
 */

const PatientChatbot = ({ patientId, patientMood, onClose }) => {
  const { currentTheme, themes } = useTheme();
  const theme = themes[currentTheme];
  
  const [messages, setMessages] = useState([
    { 
      text: "Hi there! 👋 I'm your Mental Health AI Companion. I'm here to listen and support you. How are you feeling today?", 
      isAI: true,
      timestamp: new Date()
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [showHistory, setShowHistory] = useState(false);
  const [emotionContext, setEmotionContext] = useState(patientMood || 'neutral');
  
  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);
  const synthRef = useRef(window.speechSynthesis);

  // Comprehensive chatbot rule system with emotion-aware responses
  const chatRules = {
    greetings: {
      patterns: ['hi', 'hello', 'hey', 'good morning', 'good afternoon', 'good evening', 'wassup', 'yo', 'hiya', 'howdy', 'greetings'],
      responses: [
        "Hi there! 👋 I'm here to listen and support you. What's on your mind?",
        "Hello! It's great to see you. How can I help you today?",
        "Hey! Welcome back. I'm here if you need to talk about anything.",
      ]
    },
    
    mentalHealth: {
      patterns: ['depressed', 'depression', 'sad', 'unhappy', 'low mood', 'feeling down', 'worthless', 'hopeless', 'suicidal'],
      responses: {
        default: "I hear you're going through a tough time. Remember, these feelings are temporary. Would you like to talk about what's making you feel this way?",
        supportive: "Thank you for sharing that with me. It takes courage to open up. What specifically is contributing to these feelings?",
        crisis: "I'm really concerned about what you're sharing. Please consider reaching out to a crisis helpline or your doctor immediately. Your safety is important. Crisis Hotline: 988"
      }
    },

    anxiety: {
      patterns: ['anxiety', 'anxious', 'nervous', 'worried', 'panic', 'stressed', 'tension', 'overwhelmed'],
      responses: {
        default: "Anxiety can be really challenging. Let's work through this together. Would some breathing exercises help?",
        technique: "Try this: Breathe in for 4 counts, hold for 4, breathe out for 4. Repeat 5 times. Does that help?",
        validation: "Your feelings are valid. Many people experience anxiety, and there are effective ways to manage it."
      }
    },

    sleep: {
      patterns: ['sleep', 'insomnia', 'can\'t sleep', 'nightmare', 'tired', 'fatigue', 'exhausted', 'rested'],
      responses: {
        default: "Sleep is crucial for mental health. What's preventing you from getting good sleep?",
        tips: "Try these sleep tips: Keep a consistent schedule, avoid screens 1 hour before bed, try meditation, keep your room cool and dark.",
        meditation: "Would you like me to guide you through a relaxation technique that can help with sleep?"
      }
    },

    medication: {
      patterns: ['medication', 'medicine', 'drug', 'pills', 'prescription', 'dosage', 'side effects', 'effects'],
      responses: {
        default: "Medication questions are important. Please discuss any concerns with your doctor. What specific question do you have?",
        sideEffects: "Side effects can be concerning. Have you discussed these with your doctor? They might adjust your dosage.",
        adherence: "Taking medication consistently is important for your recovery. Would you like help setting reminders?"
      }
    },

    relationships: {
      patterns: ['relationship', 'boyfriend', 'girlfriend', 'family', 'friend', 'conflict', 'argument', 'lonely', 'isolation'],
      responses: {
        default: "Relationships are important for our wellbeing. What's happening in your relationships?",
        conflict: "Conflict is normal. Have you tried communicating your feelings calmly with the person?",
        support: "Building supportive relationships is crucial. You deserve people who care about you."
      }
    },

    coping: {
      patterns: ['cope', 'coping', 'manage', 'handle', 'strategies', 'techniques', 'help', 'support'],
      responses: {
        default: "I'm here to help you develop coping strategies. What would be most helpful for you right now?",
        suggestions: "Here are some coping techniques: Journaling, exercise, mindfulness, talking to friends, creative activities, or calling your doctor.",
        emergency: "If you're in crisis, please call 988 (Suicide & Crisis Lifeline) or go to the nearest emergency room."
      }
    },

    positive: {
      patterns: ['good', 'great', 'happy', 'excellent', 'wonderful', 'amazing', 'love', 'grateful', 'thankful', 'better'],
      responses: {
        default: "That's wonderful to hear! What's making you feel good today?",
        celebrate: "That's fantastic! Celebrating small wins is important. Keep up the positive momentum!",
        gratitude: "Gratitude is a powerful tool for mental wellbeing. What are you grateful for?"
      }
    },

    appointment: {
      patterns: ['appointment', 'doctor', 'meeting', 'consultation', 'visit', 'schedule', 'book'],
      responses: {
        default: "Your doctor appointments are important for your care. Would you like help scheduling one?",
        reminder: "I can help remind you about upcoming appointments. When is your next visit with your doctor?",
        preparation: "Would you like help preparing a list of topics to discuss with your doctor?"
      }
    },

    emergency: {
      patterns: ['emergency', 'help', 'dying', 'hurt', 'harm', 'hurt myself', 'suicide', 'kill myself'],
      responses: {
        immediate: "🚨 YOUR SAFETY IS MY PRIORITY 🚨\n\nIf you're in immediate danger, please:\n1. Call 911 (Emergency)\n2. Call 988 (Suicide & Crisis Lifeline)\n3. Text 'HELLO' to 741741 (Crisis Text Line)\n4. Go to the nearest emergency room\n\nYou matter. Help is available."
      }
    },

    default: {
      patterns: [],
      responses: [
        "That's an interesting topic. Could you tell me more about how that makes you feel?",
        "I'm listening. What would you like to discuss?",
        "Help me understand better. Can you elaborate on that?",
        "That sounds important to you. I'm here to listen."
      ]
    }
  };

  // Initialize speech recognition
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      
      recognitionRef.current.onstart = () => {
        setIsListening(true);
      };
      
      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
      
      recognitionRef.current.onresult = (event) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        if (transcript) {
          setInputText(transcript);
          handleSendMessage(transcript);
        }
      };
      
      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
      };
    }
  }, []);

  // Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Detect user emotion from text
  const detectEmotionFromText = (text) => {
    const lowerText = text.toLowerCase();
    
    if (chatRules.positive.patterns.some(p => lowerText.includes(p))) return 'happy';
    if (chatRules.mentalHealth.patterns.some(p => lowerText.includes(p))) return 'sad';
    if (chatRules.anxiety.patterns.some(p => lowerText.includes(p))) return 'anxious';
    if (chatRules.sleep.patterns.some(p => lowerText.includes(p))) return 'tired';
    
    return 'neutral';
  };

  // Generate AI response based on rules
  const generateAIResponse = (userMessage) => {
    const lowerMessage = userMessage.toLowerCase();
    
    // Check for emergency patterns first
    if (chatRules.emergency.patterns.some(p => lowerMessage.includes(p))) {
      return chatRules.emergency.responses.immediate;
    }
    
    // Check each category for pattern matches
    for (const [category, rules] of Object.entries(chatRules)) {
      if (category === 'default' || category === 'emergency') continue;
      
      if (rules.patterns && rules.patterns.some(p => lowerMessage.includes(p))) {
        if (typeof rules.responses === 'object' && !Array.isArray(rules.responses)) {
          // Handle object responses based on context
          if (category === 'mentalHealth' && lowerMessage.includes('suicide')) {
            return rules.responses.crisis;
          }
          return Object.values(rules.responses)[Math.floor(Math.random() * Object.values(rules.responses).length)];
        } else if (Array.isArray(rules.responses)) {
          return rules.responses[Math.floor(Math.random() * rules.responses.length)];
        }
      }
    }
    
    // Default response
    return chatRules.default.responses[Math.floor(Math.random() * chatRules.default.responses.length)];
  };

  // Send message
  const handleSendMessage = async (text = inputText) => {
    if (!text.trim()) return;
    
    // Add user message
    const userMessage = {
      text: text,
      isAI: false,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsTyping(true);
    
    // Detect emotion from user input
    const detectedEmotion = detectEmotionFromText(text);
    setEmotionContext(detectedEmotion);
    
    // Simulate AI thinking time (0.5-1.5 seconds)
    setTimeout(() => {
      const aiResponse = generateAIResponse(text);
      
      const aiMessage = {
        text: aiResponse,
        isAI: true,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, aiMessage]);
      setIsTyping(false);
      
      // Speak response if voice is enabled
      if (voiceEnabled) {
        speakMessage(aiResponse);
      }
    }, 500 + Math.random() * 1000);
  };

  // Text-to-speech
  const speakMessage = (text) => {
    if (!voiceEnabled || !('speechSynthesis' in window)) return;
    
    setIsSpeaking(true);
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.95;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;
    
    utterance.onend = () => {
      setIsSpeaking(false);
    };
    
    synthRef.current.speak(utterance);
  };

  // Start voice input
  const handleVoiceInput = () => {
    if (recognitionRef.current) {
      if (isListening) {
        recognitionRef.current.stop();
        setIsListening(false);
      } else {
        recognitionRef.current.start();
      }
    }
  };

  // Toggle voice output
  const toggleVoiceOutput = () => {
    if (isSpeaking) {
      synthRef.current.cancel();
      setIsSpeaking(false);
    }
    setVoiceEnabled(!voiceEnabled);
  };

  // Clear chat
  const handleClearChat = () => {
    setMessages([
      { 
        text: "Hi there! 👋 I'm your Mental Health AI Companion. I'm here to listen and support you. How are you feeling today?", 
        isAI: true,
        timestamp: new Date()
      }
    ]);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className={`fixed bottom-4 right-4 w-96 h-[600px] ${theme.bg} ${theme.textColor} rounded-lg shadow-2xl border-2 ${theme.borderColor} flex flex-col z-50`}
    >
      {/* Header */}
      <div className={`${theme.accentBg} ${theme.accentText} p-4 rounded-t-lg flex items-center justify-between`}>
        <div className="flex items-center gap-3">
          <FaRobot className="text-2xl" />
          <div>
            <h3 className="font-bold text-lg">AI Companion</h3>
            <p className="text-xs opacity-75">Always here to help</p>
          </div>
        </div>
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={onClose}
          className="text-2xl hover:text-red-400 transition"
        >
          <FaTimesCircle />
        </motion.button>
      </div>

      {/* Messages Area */}
      <div className={`flex-1 overflow-y-auto p-4 space-y-3 ${theme.secondaryBg}`}>
        <AnimatePresence>
          {messages.map((msg, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className={`flex ${msg.isAI ? 'justify-start' : 'justify-end'}`}
            >
              <div
                className={`max-w-[80%] p-3 rounded-lg ${
                  msg.isAI
                    ? `${theme.accentBg} ${theme.accentText} rounded-tl-none`
                    : 'bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-tr-none'
                }`}
              >
                <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                <p className="text-xs opacity-60 mt-1">{msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {isTyping && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={`flex justify-start`}
          >
            <div className={`${theme.accentBg} p-3 rounded-lg rounded-tl-none`}>
              <div className="flex gap-2">
                <motion.div animate={{ y: [0, -5, 0] }} transition={{ duration: 0.6 }} className="w-2 h-2 bg-current rounded-full" />
                <motion.div animate={{ y: [0, -5, 0] }} transition={{ duration: 0.6, delay: 0.1 }} className="w-2 h-2 bg-current rounded-full" />
                <motion.div animate={{ y: [0, -5, 0] }} transition={{ duration: 0.6, delay: 0.2 }} className="w-2 h-2 bg-current rounded-full" />
              </div>
            </div>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className={`border-t-2 ${theme.borderColor} p-3 space-y-2`}>
        {/* Voice Controls */}
        <div className="flex gap-2">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleVoiceInput}
            className={`flex-1 py-2 px-3 rounded-lg font-semibold transition ${
              isListening
                ? 'bg-red-500 text-white'
                : `${theme.buttonBg} ${theme.buttonText}`
            }`}
          >
            {isListening ? <FaMicrophoneSlash className="inline mr-2" /> : <FaMicrophone className="inline mr-2" />}
            {isListening ? 'Listening...' : 'Voice'}
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={toggleVoiceOutput}
            className={`py-2 px-3 rounded-lg transition ${
              voiceEnabled
                ? `${theme.accentBg} ${theme.accentText}`
                : `${theme.buttonBg} ${theme.buttonText}`
            }`}
          >
            {voiceEnabled ? <FaVolumeUp /> : <FaVolumeMute />}
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleClearChat}
            className={`py-2 px-3 rounded-lg ${theme.buttonBg} ${theme.buttonText}`}
            title="Clear chat history"
          >
            🗑️
          </motion.button>
        </div>

        {/* Text Input */}
        <div className="flex gap-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="Type a message..."
            className={`flex-1 px-3 py-2 rounded-lg ${theme.inputBg} ${theme.inputText} focus:outline-none focus:ring-2 focus:ring-purple-500`}
            disabled={isTyping}
          />
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleSendMessage()}
            disabled={!inputText.trim() || isTyping}
            className={`py-2 px-4 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold disabled:opacity-50`}
          >
            <FaPaperPlane />
          </motion.button>
        </div>

        {/* Quick Actions */}
        <div className="flex flex-wrap gap-2 text-xs">
          <motion.button
            whileHover={{ scale: 1.05 }}
            onClick={() => handleSendMessage("I'm feeling anxious")}
            className={`px-2 py-1 rounded-full ${theme.buttonBg} ${theme.buttonText}`}
          >
            😰 Anxious
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            onClick={() => handleSendMessage("I can't sleep")}
            className={`px-2 py-1 rounded-full ${theme.buttonBg} ${theme.buttonText}`}
          >
            😴 Sleep
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            onClick={() => handleSendMessage("Tell me coping strategies")}
            className={`px-2 py-1 rounded-full ${theme.buttonBg} ${theme.buttonText}`}
          >
            🎯 Coping
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

export default PatientChatbot;
