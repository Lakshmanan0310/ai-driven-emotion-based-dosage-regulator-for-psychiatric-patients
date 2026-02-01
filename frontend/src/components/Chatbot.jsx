import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaMicrophone, FaMicrophoneSlash, FaVolumeUp, FaVolumeMute } from 'react-icons/fa';

const CloudMessage = ({ message, isAI }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0 }}
    className={`flex ${isAI ? 'flex-row' : 'flex-row-reverse'} items-end gap-2 mb-4`}
  >
    {isAI && (
      <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
        <img
          src="/assets/icon.webp"
          alt="AI Avatar"
          className="w-full h-full object-cover"
        />
      </div>
    )}
    <div
      className={`relative max-w-[80%] p-4 ${
        isAI 
          ? 'bg-gradient-to-br from-blue-100 to-purple-100' 
          : 'bg-gradient-to-br from-purple-100 to-pink-100'
      } rounded-2xl
      ${isAI ? 'rounded-tl-sm' : 'rounded-tr-sm'}
      shadow-md`}
    >
      <div className={`
        absolute ${isAI ? '-left-2' : '-right-2'} bottom-2
        w-4 h-4 
        transform ${isAI ? 'rotate-45' : '-rotate-45'}
        ${isAI ? 'bg-blue-100' : 'bg-purple-100'}
      `}></div>
      <p className="text-gray-800">{message}</p>
    </div>
  </motion.div>
);

const EnhancedChatbot = () => {
  const [messages, setMessages] = useState([
    { text: "Hi! I'm your empathetic chat companion. How are you feeling today?", isAI: true }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [speechQueue, setSpeechQueue] = useState([]);
  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);
  const synthRef = useRef(window.speechSynthesis);

  const chatRules = {
    greetings: {
      patterns: ['hi', 'hello', 'hey', 'good morning', 'good afternoon', 'good evening', 'wassup', 'yo', 'hiya', 'howdy', 'greetings'],
      responses: [
        "Hi there! How are you feeling today?",
        "Hello! I'm here to listen. What's on your mind?",
        "Hey! How's your day going so far?",
        "Hi friend! It's great to chat with you. How are you doing?",
        "Hello there! I'm happy to see you. How's everything going?",
        "Hey! I was just thinking about you. How have you been?",
        "Good to see you! How's life treating you today?"
      ]
    },
    
    aboutSelf: {
      patterns: ['who are you', 'what are you', 'what is your name', 'who created you', 'who made you', 'your creator', 'your purpose', 'what do you do', 'why do you exist', 'what is your job', 'tell me about yourself', 'introduce yourself', 'your function', 'what can you do', 'how do you work', 'who built you', 'who designed you', 'how were you made', 'what are you for'],
      responses: [
        "I'm your Mental Health Buddy, designed to be a supportive friend. I was created to help you express your feelings and provide a listening ear whenever you need it.",
        "I'm a friendly AI companion created to chat with you about your feelings and provide support. Think of me as a friend who's always here to listen.",
        "I'm your digital friend, built to help you process emotions and have meaningful conversations. I was created by a team who wanted to make mental wellness more accessible.",
        "I'm a conversational companion designed to help with emotional well-being. My purpose is to be here for you whenever you need someone to talk to.",
        "I'm your AI friend, created to provide emotional support and a judgment-free space to express yourself. I'm here to listen and chat whenever you need me."
      ]
    },
    
    doingNow: {
      patterns: ['what are you doing', 'what you up to', 'what are you up to', 'what you doing', 'are you busy', 'doing anything'],
      responses: [
        "I'm here chatting with you! It's the highlight of my day. How about you?",
        "Just enjoying our conversation! I'm always here when you want to talk. What are you up to?",
        "I'm focused on our chat right now. It's nice to connect with you. What's keeping you busy today?",
        "I'm here for you! That's what I'm doing right now and happy to be doing it. What about you?",
        "Just being your friend and chat companion! How about you? Anything interesting happening in your world?"
      ]
    },
    
    howAreYou: {
      patterns: ['how are you', 'how are you doing', 'how are you feeling', 'how you doing', 'how do you feel', 'are you ok', 'are you okay', 'you good', 'you alright'],
      responses: [
        "I'm doing well, thanks for asking! But I'm more interested in how you're feeling today?",
        "I'm great! It's nice of you to ask. How about yourself? How's your day going?",
        "I'm feeling good and happy to be chatting with you! How about you? How's your day been?",
        "I'm always good when I get to talk with you! But enough about me - how are you feeling?",
        "Thanks for asking - I'm doing well! But I'd love to know how you're doing today?"
      ]
    },
    
    likes: {
      patterns: ['what do you like', 'your favorite', 'do you enjoy', 'do you like', 'things you like', 'your hobbies', 'what you enjoy'],
      responses: [
        "I enjoy meaningful conversations like this one! I also like helping people feel better. What about you? Any favorite activities?",
        "I love connecting with people and learning about their day. What are some things you enjoy doing?",
        "I really like listening and being helpful. It makes my day when I can brighten someone else's! What do you enjoy?",
        "Conversations like this are my favorite thing! I also enjoy learning new things. What do you like to do?",
        "I enjoy being a supportive friend and having interesting chats. What kinds of things do you like?"
      ]
    },
    
    jokes: {
      patterns: ['tell me a joke', 'say something funny', 'make me laugh', 'tell joke', 'know any jokes', 'be funny'],
      responses: [
        "Why don't scientists trust atoms? Because they make up everything! 😄 Did that make you smile?",
        "What did the ocean say to the beach? Nothing, it just waved! 🌊 How's your sense of humor today?",
        "Why did the scarecrow win an award? Because he was outstanding in his field! 🌾 Too corny?",
        "What's the best thing about Switzerland? I don't know, but the flag is a big plus! 🇨🇭 Did that get a smile?",
        "I told my wife she was drawing her eyebrows too high. She looked surprised! 😲 How about that one?"
      ]
    },
    
    thanks: {
      patterns: ['thank you', 'thanks', 'appreciate it', 'grateful', 'thank', 'thx'],
      responses: [
        "You're very welcome! I'm always here when you need someone to talk to.",
        "Anytime! That's what friends are for. Is there anything else on your mind?",
        "I'm glad I could help! Remember, I'm here whenever you need a chat.",
        "No problem at all! It's always nice talking with you.",
        "You're welcome! Your well-being is important to me. Anything else you'd like to discuss?"
      ]
    },
    
    goodbye: {
      patterns: ['bye', 'goodbye', 'see you', 'talk later', 'gotta go', 'have to go', 'leaving', 'cya', 'farewell'],
      responses: [
        "Take care! I'll be here when you want to chat again.",
        "Goodbye for now! Looking forward to our next conversation.",
        "See you soon! Remember, I'm always here if you need to talk.",
        "Take it easy! Come back anytime - I'll be here.",
        "Bye for now! Have a wonderful rest of your day!"
      ]
    },
    
    sadness: {
      patterns: ['sad','sadness', 'depressed', 'depress','depression','broken', 'down', 'unhappy', 'terrible',' breakup', 'awful','break up', 'bad day','not good','boring','despondent','doleful','dispirite','lonely','miserable','gloomy','heartbroken','discouraged','discourage','low','disappointed','hurt','terrible','pain','sorrow','blew','embarrassed','embarrass','grief','tears','cry','unwell','sick','ill','unwell','horrible', 'unhealthy'],
      responses: [
        {
          "message": "I’m here for you. Sometimes sharing your feelings helps. Want to talk about it?",
          "suggestion": "💬 I'm ready to listen whenever you're comfortable."
        },
        {
          "message": "You’re stronger than you think. Would you like me to suggest a relaxing activity?",
          "suggestion": "☕ Make yourself a cup of tea and take a moment to pause."
        },
        {
          "message": "Rough days happen to the best of us. Can I recommend a funny podcast or audiobook?",
          "suggestion": "🎧 Try 'No Such Thing as a Fish' or 'The Moth' for some lighthearted stories."
        },
        {
          "message": "It’s okay to feel sad. How about focusing on something small that brings you joy?",
          "suggestion": "🌱 Water a plant, pet an animal, or enjoy a favorite snack."
        },
        {
          "message": "Bad days can feel overwhelming. Would you like me to guide you through a breathing exercise?",
          "suggestion": "🌬 Inhale deeply for 5 seconds, hold for 3, exhale slowly for 7 seconds."
        },
        {
          "message": "I'm sorry you're feeling this way. Want me to share an inspiring quote with you?",
          "suggestion": "🌟 'Keep your face to the sunshine and you cannot see a shadow.' - Helen Keller"
        },
        {
          "message": "You’re not alone in this. Can I suggest a comforting playlist for tough times?",
          "suggestion": "🎵 'Calm Vibes' on Spotify or any acoustic playlist could be soothing."
        },
        {
          "message": "Sometimes sadness comes in waves. Would you like to explore a gratitude exercise?",
          "suggestion": "💡 Write down one thing that made you smile today, even if it’s small."
        },
        {
          "message": "I understand that things feel tough. Can I help you brainstorm something fun to do?",
          "suggestion": "🎨 Maybe try drawing, coloring, or creating something small."
        },
        {
          "message": "It’s okay to take things slow. Would you like some self-care tips to try right now?",
          "suggestion": "🛏 Rest in a cozy space, light a candle, or listen to soft music."
        },
        {
          "message": "Hard days don’t last forever. Would you like some movie recommendations to cheer up?",
          "suggestion": "🎥 'Paddington' or 'The Secret Life of Walter Mitty' are feel-good picks."
        },
        {
          "message": "Sometimes we all need support. Want to hear how others cope with hard times?",
          "suggestion": "📖 Stories of resilience can inspire. Check out blogs or uplifting articles."
        },
        {
          "message": "I know it’s tough right now. How about some light stretching to ease your mind?",
          "suggestion": "🧘 Try a simple child’s pose or roll your shoulders to release tension."
        },
        {
          "message": "I’m sorry you’re having a hard time. Want me to suggest a game to distract you?",
          "suggestion": "🎮 Puzzle games like 'Monument Valley' or 'Stardew Valley' can be relaxing."
        },
        {
          "message": "Feeling low is natural sometimes. Want a tip to improve your mood a little?",
          "suggestion": "😊 Practice smiling for a minute – it can actually lift your spirits!"
        },
        {
          "message": "You’re important, even if you don’t feel it right now. Need help finding something inspiring to read?",
          "suggestion": "📚 Try 'The Alchemist' by Paulo Coelho for a motivational boost."
        },
        {
          "message": "Sometimes small victories can help. Would you like to set a tiny goal together?",
          "suggestion": "📝 For example, drink a glass of water or organize your desk."
        },
        {
          "message": "You are valued, even on tough days. Would you like help finding uplifting stories or videos?",
          "suggestion": "🌟 Watch a TED Talk or inspiring animal rescue stories online."
        }
    ]

    },
    stress: {
      patterns: ['stress', 'anxious', 'overwhelmed', 'worried', 'panic', 'pressure','tense','nervous','tense','uneasy','restless','fearful','agitated','frustrated','irritated','edgy','jittery','uneasy','uptight','rattled','frazzled','panicked','frightened','scared','terrified','alarmed','distressed','disturbed','troubled','perturbed','bothered','upset','distraught','aggravated','displeased','disgruntled','discontented','disappointed','dismayed','discouraged','disheartened','despondent','dejected','downcast','miserable','wretched','woeful','forlorn','crestfallen','heartbroken','grief-stricken','anguished','hurt','painful','sorrowful','mournful','melancholy','doleful','dismal','gloomy','despairing','hopeless','desperate','fearful','terrified','scared','frightened','panicky','horrified','alarmed','worried','anxious','nervous','tense','uneasy','edgy','jittery','restless','agitated','fidgety','fearful','apprehensive','disquieted','disturbed','perturbed','troubled','bothered','upset','distressed','distraught','aggravated','irritated','frustrated','exasperated','angry','outraged','infuriated','incensed','enraged','livid','furious','irate','wrathful','indignant','annoyed','irritated','exasperated','impatient','cross','cranky','grumpy','sullen','surly','moody','testy','touchy','peevish','petulant','snappish','cantankerous','crabby','crusty','crotchety','ornery','irascible','cantankerous','displeased','disgruntled','discontented','disappointed','dismayed','discouraged','disheartened','despondent','dejected','downcast','miserable','wretched','woeful','forlorn','crestfallen','heartbroken','grief-stricken','anguished','hurt','painful','sorrowful','mournful','melancholy','doleful','dismal','gloomy','despairing','hopeless','desperate','fearful','terrified'],
      "responses": [
        {
            "message": "I can tell you're under a lot of pressure. Let's take a moment to breathe together.",
            "suggestion": "Try this: Take 3 deep breaths, counting to 4 as you inhale and 6 as you exhale. 🫁"
        },
        {
            "message": "Stress can feel overwhelming. Want to try a simple grounding exercise?",
            "suggestion": "🧘 Name 5 things you see, 4 things you can touch, 3 you can hear, 2 you can smell, and 1 you can taste."
        },
        {
            "message": "It’s okay to feel this way. Would you like to take a short break to refocus?",
            "suggestion": "🚶 Go for a 5-minute walk or stretch to clear your mind."
        },
        {
            "message": "When things feel too much, slowing down helps. Want to hear a calming quote?",
            "suggestion": "🌟 'You don’t have to control your thoughts. You just have to stop letting them control you.' – Dan Millman"
        },
        {
            "message": "I’m here for you. Would you like tips to manage stress?",
            "suggestion": "📝 Break your tasks into smaller steps and tackle one at a time."
        },
        {
            "message": "Stress can take a toll. How about a distraction? I can suggest a fun activity.",
            "suggestion": "🎨 Try doodling, coloring, or creating something small."
        },
        {
            "message": "It’s tough to feel this way. Would you like help organizing your thoughts?",
            "suggestion": "📝 Write down everything on your mind to create a to-do list or brain dump."
        },
        {
            "message": "Feeling anxious can be heavy. How about we focus on a calming visualization?",
            "suggestion": "🌊 Imagine yourself by a peaceful beach, with waves lapping the shore."
        },
        {
            "message": "Let’s ease your mind. Want me to share a quick relaxation technique?",
            "suggestion": "🧘 Close your eyes and picture your favorite place in vivid detail."
        },
        {
            "message": "Sometimes stress means you care a lot. Would you like a moment of lightheartedness?",
            "suggestion": "😊 How about a funny joke or interesting fact?"
        },
        {
            "message": "Stress can make everything feel urgent. Want help prioritizing tasks?",
            "suggestion": "🔑 Focus on what’s most important or urgent right now."
        },
        {
            "message": "I hear you’re feeling overwhelmed. Would you like to take a mental break?",
            "suggestion": "🎧 Listen to calming nature sounds or lo-fi beats for a few minutes."
        },
        {
            "message": "It’s okay to take a pause. Want to try progressive muscle relaxation?",
            "suggestion": "🧘 Tense each muscle group for 5 seconds, then release, starting with your toes."
        },
        {
            "message": "When anxiety hits, grounding helps. Want to try focusing on your surroundings?",
            "suggestion": "🪟 Describe three things you see, hear, and feel right now."
        },
        {
            "message": "Feeling this way can be exhausting. Would you like some motivational words?",
            "suggestion": "🌟 'You are braver than you believe, stronger than you seem, and smarter than you think.' - A.A. Milne"
        },
        {
            "message": "Sometimes letting it out helps. Would you like to share what’s on your mind?",
            "suggestion": "💬 Talking or journaling about your feelings can make them more manageable."
        },
        {
            "message": "It’s okay to feel worried. Would you like to hear about ways to calm racing thoughts?",
            "suggestion": "✨ Try repeating, 'I am safe. I am calm. I am in control.'"
        },
        {
            "message": "Stress can feel overwhelming. Can I suggest a short mindfulness exercise?",
            "suggestion": "🌿 Sit quietly and focus on your breath for 2 minutes, noticing each inhale and exhale."
        },
        {
            "message": "Pressure can be intense. Would you like tips on handling it step by step?",
            "suggestion": "🚧 Break tasks into smaller parts and focus on one at a time."
        },
        {
            "message": "Anxiety can cloud our thoughts. Want help finding something uplifting to do?",
            "suggestion": "📚 Read an inspiring story or watch a TED Talk for motivation."
        },
        {
            "message": "Worry can feel paralyzing. Would you like help reframing your thoughts?",
            "suggestion": "💡 Replace 'I can’t handle this' with 'I’ll take it one step at a time.'"
        },
        {
            "message": "It’s okay to pause and recharge. Would you like suggestions for a self-care activity?",
            "suggestion": "🛁 Try taking a warm bath or lighting a calming scented candle."
        },
        {
            "message": "Feeling panicked is hard. Would you like guidance on slowing down your thoughts?",
            "suggestion": "🌙 Imagine you’re watching clouds pass by—let each worry drift away like a cloud."
        },
        {
            "message": "Stress is tough, but you’re tougher. Want to try a quick motivational exercise?",
            "suggestion": "💪 List three times you overcame challenges in the past."
        },
        {
            "message": "Anxious thoughts can snowball. Want me to help you focus on what’s in your control?",
            "suggestion": "🔑 Ask yourself: 'What’s one small step I can take right now?'"
        },
        {
            "message": "I understand you're feeling pressured. Want to hear about stress-reducing foods?",
            "suggestion": "🥑 Avocados, bananas, or a handful of nuts can help balance your mood."
        },
        {
            "message": "When panic strikes, grounding helps. Want to try focusing on your surroundings?",
            "suggestion": "🪟 Describe three things you see, hear, and feel right now."
        },
        {
            "message": "Stress can feel endless, but it’s temporary. Would you like a reminder of your strengths?",
            "suggestion": "🌟 You’ve faced challenges before, and you’ll overcome this too."
        },
        {
            "message": "Overwhelm happens to the best of us. Want me to suggest a calming hobby?",
            "suggestion": "🧶 Knitting, puzzles, or gardening can be great stress relievers."
        },
        {
            "message": "Pressure builds up quickly. Want help releasing it with a quick stretch?",
            "suggestion": "🙆‍♂ Stretch your arms overhead, roll your shoulders, and shake out your hands."
        },
        {
            "message": "Feeling on edge is exhausting. Want me to suggest a mindfulness app?",
            "suggestion": "📱 Try 'Headspace' or 'Calm' for guided meditations."
        },
        {
            "message": "Worry can weigh you down. Want help focusing on something positive?",
            "suggestion": "🌈 Think of one thing that went well today, no matter how small."
        },
        {
            "message": "It’s okay to feel stressed. Would you like to talk about what’s causing it?",
            "suggestion": "💬 I’m here to listen if you’d like to share."
        }
    ]

    },
    happiness: {
      patterns: ['happy', 'great', 'amazing', 'wonderful', 'good', 'excited','joyful','delighted','pleased','content','cheerful','merry','jovial','jolly','lighthearted','gleeful','carefree','blissful','ecstatic','elated','overjoyed','thrilled','exhilarated','euphoric','radiant','sunny','upbeat','chipper','buoyant','bubbly','effervescent','sparkling','vivacious','lively','animated','spirited','peppy','perky','sprightly','zesty','zippy','zappy','full of beans','on cloud nine','over the moon','walking on air','in seventh heaven','tickled pink','on top of the world','in high spirits','in good spirits','in a good mood','in a fine mood','in a merry mood','in a festive mood','in a jovial mood','in a cheerful mood','in a happy mood','in a joyful mood','in a delighted mood','in a pleased mood','in a content mood','in a blissful mood','in a carefree mood','in a lighthearted mood','in a merry mood','in a jolly mood','in a jovial mood','in a gleeful mood','in a sunny mood','in an upbeat mood','in a chipper mood','in a buoyant mood','in a bubbly mood','in an effervescent mood','in a sparkling mood','in a vivacious mood','in a lively mood','in an animated mood','in a spirited mood','in a peppy mood','in a perky mood','in a sprightly mood','in a zesty mood','in a zippy mood','in a zappy mood','full of beans','on cloud nine','over the moon','walking on air','in seventh heaven','tickled pink','on top of the world','in high spirits','in good spirits','in a good mood','in a fine mood','in a merry mood','in a festive mood','in a jovial mood','in a cheerful mood','in a happy mood','in a joyful mood','in a delighted mood','in a pleased mood','in a content mood','in a blissful mood','in a carefree mood','in a lighthearted mood','in a merry mood','in a jolly mood','in a jovial mood','in a gleeful mood','in a sunny mood'],
      "responses": [
        "You’re radiating positivity! What’s the best thing that happened to you today?",
        "I love hearing that you’re happy! What’s been putting a smile on your face?",
        "Fantastic news! What’s keeping your spirits so high?",
        "It’s great to see you feeling wonderful! Have you shared your joy with someone?",
        "You’re glowing with happiness! What’s made your day extra special?",
        "That’s amazing to hear! Joy is the best kind of energy! ✨",
        "So happy to hear that! Want to share your good vibes with me? 😊",
        "Wonderful! Life is always brighter with moments like this!",
        "Happiness suits you perfectly! Any fun plans to keep the excitement going?",
        "Your energy is so uplifting! Tell me more about what’s got you feeling this way.",
        "I’m thrilled to hear you’re doing great! What’s the most exciting thing today?",
        "You’ve got that joyful glow! What’s been your secret to staying positive?",
        "Amazing vibes coming from you! What’s been the highlight of your week?",
        "So glad you’re feeling good! Any upcoming plans adding to your excitement?",
        "Happiness looks great on you! Have you celebrated this moment yet?",
        "Your joy is infectious! What’s the best part of your day so far?",
        "You’re riding a wave of positivity! What’s keeping your spirits so high?",
        "I’m so excited for you! Want to tell me more about what’s making you smile?",
        "It’s always refreshing to see someone so happy! What’s been the source of your joy?",
        "You’re a bundle of happiness today! Any tips for spreading the good energy?",
        "Sounds like you’re having a fantastic day! What’s something that added to it?",
        "Your enthusiasm is contagious! What’s your favorite moment from today?",
        "You’re glowing with good energy! How are you planning to keep this vibe going?",
        "I’m loving your happy energy! Want to share what’s fueling it?",
        "Hearing about your joy brightens my day! What’s been the best part of yours?",
        "You’re radiating joy! Any exciting news or accomplishments you’d like to share?",
        "Your happiness lights up the conversation! What’s made your day so great?",
        "It’s wonderful to hear you’re doing amazing! What’s been the highlight?",
        "I’m overjoyed to hear about your good mood! What’s your recipe for happiness?",
        "Your positive vibes are incredible! Any special moments adding to your joy?",
        "I’m so glad to hear you’re feeling this way! What’s been your proudest moment today?",
        "You’re a beacon of happiness! Want to spread some of those good vibes?",
        "It’s great to see you so excited! What’s something you’re looking forward to?",
        "Your energy is amazing! What’s made today so wonderful for you?",
        "Hearing you’re happy makes me happy too! What’s brought you the most excitement?",
        "Your cheerfulness is inspiring! What’s something small that made your day better?",
        "I can feel your excitement through the conversation! What’s made you so thrilled?",
        "Your happiness is like sunshine! What’s the best part of your week so far?",
        "You’re bringing such great energy! What’s got you in such high spirits?",
        "Joyful moments like this are worth celebrating! How are you celebrating yours?"
    ]

    },
    default: [
      "I'm here to listen. Could you tell me more about how you're feeling?",
      "I want to understand better. Could you explain what's on your mind?",
      "I'm always here to help. What would you like to talk about today?",
      "I'm interested in hearing more. What's been on your mind lately?",
      "I'm all ears! What would you like to chat about?",
      "I'm here for you. Is there something specific you'd like to discuss?"
    ]
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Initialize speech recognition
  useEffect(() => {
    // Check if browser supports SpeechRecognition
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';
      
      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInputText(transcript);
        // Auto-submit after voice input
        handleVoiceSubmit(transcript);
      };
      
      recognition.onend = () => {
        setIsListening(false);
      };
      
      recognition.onerror = (event) => {
        console.error('Speech recognition error', event.error);
        setIsListening(false);
      };
      
      recognitionRef.current = recognition;
    } else {
      console.warn('Speech recognition not supported in this browser');
    }
    
    // Clean up
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
      if (synthRef.current) {
        synthRef.current.cancel();
      }
    };
  }, []);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert('Speech recognition is not supported in your browser');
      return;
    }
    
    if (isListening) {
      recognitionRef.current.abort();
      setIsListening(false);
    } else {
      setInputText('');
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  const speakText = (text) => {
    if (!voiceEnabled) return;
    
    // Add to speech queue instead of speaking immediately
    setSpeechQueue(prev => [...prev, text]);
  };

  // Process speech queue
  useEffect(() => {
    if (speechQueue.length > 0 && !isSpeaking && voiceEnabled) {
      const textToSpeak = speechQueue[0];
      
      if (synthRef.current) {
        // Cancel any ongoing speech
        synthRef.current.cancel();
        
        const utterance = new SpeechSynthesisUtterance(textToSpeak);
        utterance.rate = 1.0;
        utterance.pitch = 1.0;
        utterance.volume = 1.0;
        
        // Use a more natural female voice if available
        const voices = synthRef.current.getVoices();
        const preferredVoice = voices.find(voice => 
          voice.name.includes('Female') || 
          voice.name.includes('Samantha') || 
          voice.name.includes('Google UK English Female')
        );
        
        if (preferredVoice) {
          utterance.voice = preferredVoice;
        }
        
        utterance.onstart = () => {
          setIsSpeaking(true);
        };
        
        utterance.onend = () => {
          setIsSpeaking(false);
          // Remove the spoken text from the queue
          setSpeechQueue(prev => prev.slice(1));
        };
        
        utterance.onerror = (event) => {
          console.error('Speech synthesis error', event);
          setIsSpeaking(false);
          // Remove the text that failed from the queue
          setSpeechQueue(prev => prev.slice(1));
        };
        
        synthRef.current.speak(utterance);
      }
    }
  }, [speechQueue, isSpeaking, voiceEnabled]);

  const toggleVoice = () => {
    if (isSpeaking && synthRef.current) {
      synthRef.current.cancel();
      setIsSpeaking(false);
      // Clear the speech queue when voice is disabled
      if (voiceEnabled) {
        setSpeechQueue([]);
      }
    }
    setVoiceEnabled(!voiceEnabled);
  };

  const handleVoiceSubmit = (transcript) => {
    if (!transcript.trim()) return;

    // Add user message
    setMessages(prev => [...prev, { text: transcript, isAI: false }]);
    setInputText('');
    setIsTyping(true);

    // Get responses
    const responses = findResponse(transcript);
    
    // Add each response with a delay
    responses.forEach((response, index) => {
      setTimeout(() => {
        setMessages(prev => [...prev, { text: response, isAI: true }]);
        
        // Queue the AI response for speech
        if (voiceEnabled) {
          speakText(response);
        }
        
        if (index === responses.length - 1) {
          setIsTyping(false);
        }
      }, (index + 1) * 1000);
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    // Add user message
    setMessages(prev => [...prev, { text: inputText, isAI: false }]);
    setInputText('');
    setIsTyping(true);

    // Get responses
    const responses = findResponse(inputText);
    
    // Add each response with a delay
    responses.forEach((response, index) => {
      setTimeout(() => {
        setMessages(prev => [...prev, { text: response, isAI: true }]);
        
        // Queue the AI response for speech
        if (voiceEnabled) {
          speakText(response);
        }
        
        if (index === responses.length - 1) {
          setIsTyping(false);
        }
      }, (index + 1) * 1000);
    });
  };

  const debugMatch = (input) => {
    console.log("Input received:", input);
    
    const cleanInput = input.toLowerCase().replace(/[^\w\s]/g, '');
    console.log("Cleaned input:", cleanInput);
    
    // Log which category matches
    for (const [category, data] of Object.entries(chatRules)) {
      if (category === 'default') continue;
      
      const matchingPatterns = data.patterns?.filter(pattern => {
        const cleanPattern = pattern.toLowerCase().replace(/[^\w\s]/g, '');
        return cleanInput.includes(cleanPattern);
      });
      
      if (matchingPatterns && matchingPatterns.length > 0) {
        console.log(`Matched category: ${category}, with patterns:`, matchingPatterns);
      }
    }
  };

  const findResponse = (input) => {
    // Debug the matching process
    debugMatch(input);
    
    // Remove punctuation and convert to lowercase for better matching
    const cleanInput = input.toLowerCase().replace(/[^\w\s]/g, '');
    
    // First, check for exact matches to common questions
    if (/who are you/i.test(input)) {
      const responses = chatRules.aboutSelf.responses;
      return [responses[Math.floor(Math.random() * responses.length)]];
    }
    
    if (/what are you/i.test(input)) {
      const responses = chatRules.aboutSelf.responses;
      return [responses[Math.floor(Math.random() * responses.length)]];
    }
    
    if (/how are you/i.test(input)) {
      const responses = chatRules.howAreYou.responses;
      return [responses[Math.floor(Math.random() * responses.length)]];
    }
    
    if (/what.*doing/i.test(input)) {
      const responses = chatRules.doingNow.responses;
      return [responses[Math.floor(Math.random() * responses.length)]];
    }
    
    // Check for question patterns
    const isQuestion = input.includes('?') || 
                      cleanInput.startsWith('what') || 
                      cleanInput.startsWith('who') || 
                      cleanInput.startsWith('how') || 
                      cleanInput.startsWith('why') || 
                      cleanInput.startsWith('when') || 
                      cleanInput.startsWith('where') || 
                      cleanInput.startsWith('can') || 
                      cleanInput.startsWith('do') || 
                      cleanInput.startsWith('are');
    
    // Now check for pattern matches in each category
    for (const [category, data] of Object.entries(chatRules)) {
      if (category === 'default') continue;
      
      const matchesPattern = data.patterns?.some(pattern => {
        // Clean the pattern as well for comparison
        const cleanPattern = pattern.toLowerCase().replace(/[^\w\s]/g, '');
        return cleanInput.includes(cleanPattern);
      });
      
      if (matchesPattern && data.responses?.length > 0) {
        const responses = data.responses;
        const randomResponse = responses[Math.floor(Math.random() * responses.length)];
        
        if (typeof randomResponse === 'object') {
          return [randomResponse.message, randomResponse.suggestion];
        }
        return [randomResponse];
      }
    }
    
    // If it's a question but no specific pattern matched, give a more thoughtful response
    if (isQuestion) {
      if (cleanInput.includes('who')) {
        return ["I'm your Mental Health Buddy, a friendly AI designed to chat with you and provide emotional support. Is there something specific you'd like to know about me?"];
      }
      
      if (cleanInput.includes('what')) {
        return ["I'm here to chat with you and provide support. My purpose is to be a friendly companion who listens and responds to your thoughts and feelings. Is there something specific you're curious about?"];
      }
      
      return ["That's an interesting question. While I don't have a specific answer, I'd love to hear more about what made you think of that. What's on your mind?"];
    }
    
    const defaultResponses = chatRules.default;
    return [defaultResponses[Math.floor(Math.random() * defaultResponses.length)]];
  };

  return (
    <div className="flex flex-col h-[600px] bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl shadow-xl">
      {/* Chat Header */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-500 p-4 rounded-t-2xl flex justify-between items-center">
        <h2 className="text-white text-lg font-semibold">Mental Health Buddy</h2>
        <div className="flex items-center space-x-2">
          <button 
            onClick={toggleVoice}
            className="p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors text-white"
            title={voiceEnabled ? "Mute voice" : "Enable voice"}
          >
            {voiceEnabled ? <FaVolumeUp size={18} /> : <FaVolumeMute size={18} />}
          </button>
        </div>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <AnimatePresence>
          {messages.map((message, index) => (
            <CloudMessage
              key={index}
              message={message.text}
              isAI={message.isAI}
            />
          ))}
          {isTyping && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center space-x-2 text-gray-500"
            >
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                <span className="animate-pulse">...</span>
              </div>
              <span>AI is {isSpeaking ? 'speaking...' : 'typing...'}</span>
            </motion.div>
          )}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <form onSubmit={handleSubmit} className="p-4 border-t border-gray-200 bg-white/50 rounded-b-2xl">
        <div className="flex gap-2 items-center">
          <button
            type="button"
            onClick={toggleListening}
            className={`p-3 rounded-xl transition-colors ${
              isListening 
                ? 'bg-red-500 text-white animate-pulse' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
            title={isListening ? "Stop listening" : "Start voice input"}
          >
            {isListening ? <FaMicrophoneSlash size={20} /> : <FaMicrophone size={20} />}
          </button>
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={isListening ? "Listening..." : "Type your message..."}
            className="flex-1 p-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white"
            disabled={isListening}
          />
          <button
            type="submit"
            className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl hover:opacity-90 transition-opacity"
            disabled={isListening || !inputText.trim()}
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
};

export default EnhancedChatbot;