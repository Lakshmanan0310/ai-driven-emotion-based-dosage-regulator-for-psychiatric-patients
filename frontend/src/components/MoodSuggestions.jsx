import React, { useState, useRef } from 'react';

const MoodSuggestions = ({ emotion, expressionValues, onComplete }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [audioURL, setAudioURL] = useState(null);
  const [thoughtText, setThoughtText] = useState('');
  const [savedThoughts, setSavedThoughts] = useState([]);
  const [isCompleted, setIsCompleted] = useState(false);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  
  // Immediately complete the interaction when emotion is detected
  useEffect(() => {
    if (emotion && onComplete) {
      onComplete();
    }
  }, [emotion, onComplete]);


  // Start recording audio
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        const url = URL.createObjectURL(audioBlob);
        setAudioURL(url);
        
        // Release the microphone
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (error) {
      console.error("Error accessing microphone:", error);
      alert("Could not access your microphone. Please check your permissions.");
    }
  };

  // Stop recording audio
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  // Save the thought (text or audio)
  const saveThought = () => {
    const timestamp = new Date();
    const newThought = {
      id: timestamp.getTime(),
      date: timestamp.toLocaleDateString(),
      time: timestamp.toLocaleTimeString(),
      emotion: emotion,
      audioURL: audioURL,
      text: thoughtText,
      type: audioURL ? 'audio' : 'text'
    };
    
    setSavedThoughts(prev => [newThought, ...prev]);
    setAudioURL(null);
    setThoughtText('');
    setIsCompleted(true);
    
    // Notify parent that user has completed the interaction
    if (onComplete) {
      onComplete();
    }
  };
  
  // Handle completion for negative emotions
  const handleNegativeComplete = () => {
    setIsCompleted(true);
    if (onComplete) {
      onComplete();
    }
  };

  // If already completed, don't show anything
  if (isCompleted) {
    return null;
  }

  return (
    <div className="space-y-6">
      {needsSuggestions && (
        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-md">
          <h3 className="text-xl font-semibold mb-4 text-gray-800">
            Songs to Match Your Mood
          </h3>
          <p className="text-gray-600 mb-4">
            Music can help process emotions. Here are some suggestions for when you're feeling {emotion}:
          </p>
          
          <div className="space-y-3">
            {getSuggestionsForEmotion().map((song, index) => (
              <div key={index} className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <p className="font-medium">{song.title}</p>
                <p className="text-gray-500 text-sm">{song.artist}</p>
                <a 
                  href={song.link} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:text-blue-700 text-sm inline-block mt-1"
                >
                  Listen
                </a>
              </div>
            ))}
          </div>
          
          <button
            onClick={handleNegativeComplete}
            className="mt-6 w-full bg-green-500 text-white py-3 rounded-xl font-medium shadow-lg transform transition-all duration-300 hover:scale-105 hover:shadow-xl"
          >
            Continue
          </button>
        </div>
      )}

      {/* Saved thoughts */}
      {savedThoughts.length > 0 && (
        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-md mt-6">
          <h3 className="text-xl font-semibold mb-4 text-gray-800">Your Saved Moments</h3>
          <div className="space-y-4">
            {savedThoughts.map((thought) => (
              <div key={thought.id} className="p-4 border border-gray-200 rounded-lg">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <span className="font-medium">{thought.date} at {thought.time}</span>
                    <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                      {thought.emotion}
                    </span>
                  </div>
                </div>
                
                {thought.type === 'text' && (
                  <p className="text-gray-700">{thought.text}</p>
                )}
                
                {thought.type === 'audio' && (
                  <audio src={thought.audioURL} controls className="w-full mt-2"></audio>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default MoodSuggestions;
