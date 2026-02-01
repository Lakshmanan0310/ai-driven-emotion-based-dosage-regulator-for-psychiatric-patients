"""
Simple Python script to test the Google Gemini API for voice emotion analysis
"""
import os
import json
import requests
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Get the API key from environment variables
api_key = os.getenv("GEMINI_API_KEY")
if not api_key:
    print("Error: GEMINI_API_KEY not found in environment variables")
    exit(1)

# Test transcript
test_transcript = "I'm feeling really anxious today. My heart is racing and I can't stop worrying about everything that could go wrong."

# Audio metadata
audio_metadata = {
    "speakingRate": "fast",
    "pitch": "high",
    "volume": "variable",
    "tonality": "anxious"
}

# Function to analyze voice emotion using Gemini API
def analyze_voice_emotion(transcript, audio_metadata):
    print(f"Analyzing transcript: {transcript}")
    print(f"Audio metadata: {json.dumps(audio_metadata, indent=2)}")
    
    # Gemini API endpoint
    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key={api_key}"
    
    # Prepare the prompt
    prompt = f"""
    Analyze the following transcript and audio metadata to determine the emotional state of the speaker.
    
    Transcript: "{transcript}"
    
    Audio Metadata:
    - Speaking Rate: {audio_metadata.get('speakingRate', 'normal')}
    - Pitch: {audio_metadata.get('pitch', 'normal')}
    - Volume: {audio_metadata.get('volume', 'normal')}
    - Tonality: {audio_metadata.get('tonality', 'neutral')}
    
    Based on both the transcript content AND the audio metadata, analyze the speaker's emotional state.
    Pay special attention to the audio metadata as it can reveal emotional tone that might contradict the literal meaning of words.
    
    Return your analysis as a JSON object with the following structure:
    {{
      "aggressive": (value between 0-1),
      "depressed": (value between 0-1),
      "anxious": (value between 0-1),
      "neutral": (value between 0-1),
      "happy": (value between 0-1)
    }}
    
    The sum of all values should be 1.0, representing the probability distribution of emotions.
    """
    
    # Prepare the request payload
    payload = {
        "contents": [
            {
                "parts": [
                    {
                        "text": prompt
                    }
                ]
            }
        ],
        "generationConfig": {
            "temperature": 0.2,
            "topP": 0.8,
            "topK": 40
        }
    }
    
    # Make the API request
    try:
        response = requests.post(url, json=payload)
        response.raise_for_status()  # Raise an exception for HTTP errors
        
        # Parse the response
        result = response.json()
        
        # Extract the generated text
        if "candidates" in result and len(result["candidates"]) > 0:
            generated_text = result["candidates"][0]["content"]["parts"][0]["text"]
            
            # Try to extract JSON from the response
            try:
                # Find JSON object in the text
                start_idx = generated_text.find('{')
                end_idx = generated_text.rfind('}') + 1
                
                if start_idx >= 0 and end_idx > start_idx:
                    json_str = generated_text[start_idx:end_idx]
                    emotion_data = json.loads(json_str)
                    return emotion_data
                else:
                    print("Error: Could not find JSON in the response")
                    print("Raw response:", generated_text)
                    return None
            except json.JSONDecodeError as e:
                print(f"Error parsing JSON: {e}")
                print("Raw response:", generated_text)
                return None
        else:
            print("Error: No candidates in the response")
            print("Raw response:", result)
            return None
    except requests.exceptions.RequestException as e:
        print(f"API request error: {e}")
        return None

# Run the test
if __name__ == "__main__":
    print("=== TESTING GEMINI API FOR VOICE EMOTION ANALYSIS ===")
    result = analyze_voice_emotion(test_transcript, audio_metadata)
    
    if result:
        print("\n=== ANALYSIS RESULT ===")
        print(json.dumps(result, indent=2))
        
        # Verify that the probabilities sum to approximately 1
        total = sum(result.values())
        print(f"\nSum of probabilities: {total:.2f}")
        
        # Find the dominant emotion
        dominant_emotion = max(result.items(), key=lambda x: x[1])
        print(f"Dominant emotion: {dominant_emotion[0]} ({dominant_emotion[1]:.2f})")
    else:
        print("\nAnalysis failed. Please check the error messages above.")
