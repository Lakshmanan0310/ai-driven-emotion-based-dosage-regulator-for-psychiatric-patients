"""
Face Emotion Detection Model
Uses FER_static_ResNet50_AffectNet.pt pre-trained model for emotion recognition
"""

import torch
import torch.nn.functional as F
from torchvision import models
import os
from pathlib import Path

class FaceEmotionDetector:
    """
    Face Emotion Detector using ResNet50 model trained on AffectNet dataset
    Detects 7 basic emotions and derived psychiatric indicators
    """
    
    def __init__(self, model_path=None):
        """
        Initialize the FaceEmotionDetector with the pre-trained model
        
        Args:
            model_path: Path to the FER_static_ResNet50_AffectNet.pt model
                       If None, searches for it in default locations
        """
        # List of 7 basic emotions
        self.emotions = [
            "angry", "disgust", "fear",
            "happy", "sad", "surprise", "neutral"
        ]
        
        # Initialize device (GPU if available, else CPU)
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        print(f"Using device: {self.device}")
        
        # Find model path if not provided
        if model_path is None:
            model_path = self._find_model_path()
        
        # Load the pre-trained ResNet50 model
        self._load_model(model_path)
    
    def _find_model_path(self):
        """
        Search for FER_static_ResNet50_AffectNet.pt in common locations
        
        Returns:
            str: Path to the model file
            
        Raises:
            FileNotFoundError: If model file cannot be found
        """
        # Possible locations for the model
        possible_paths = [
            "models/FER_static_ResNet50_AffectNet.pt",
            "./models/FER_static_ResNet50_AffectNet.pt",
            "../models/FER_static_ResNet50_AffectNet.pt",
            "ai/models/FER_static_ResNet50_AffectNet.pt",
            "./ai/models/FER_static_ResNet50_AffectNet.pt",
            "/app/backend/ai/models/FER_static_ResNet50_AffectNet.pt",
        ]
        
        # Add current file's directory based search
        current_dir = Path(__file__).parent
        possible_paths.insert(0, str(current_dir / "models" / "FER_static_ResNet50_AffectNet.pt"))
        
        for path in possible_paths:
            if os.path.exists(path):
                print(f"Found model at: {path}")
                return path
        
        raise FileNotFoundError(
            f"Model file 'FER_static_ResNet50_AffectNet.pt' not found. "
            f"Searched in: {possible_paths}"
        )
    
    def _load_model(self, model_path):
        """
        Load the pre-trained FER model
        The model file contains the complete model architecture and weights
        trained on AffectNet dataset
        
        Args:
            model_path: Path to the model file
        """
        try:
            print(f"Loading model from: {model_path}")
            
            # Try loading as a complete model first
            try:
                self.model = torch.load(model_path, map_location=self.device)
                self.model = self.model.to(self.device)
                self.model.eval()
                print("✓ Model loaded successfully (complete model)")
                return
            except Exception as e1:
                print(f"  Could not load as complete model: {e1}")
                print("  Trying alternative loading method...")
            
            # Alternative: Try loading state dict with flexible architecture
            checkpoint = torch.load(model_path, map_location=self.device)
            
            # Initialize ResNet50 architecture with 7 emotion classes
            self.model = models.resnet50(weights=None)
            num_emotions = len(self.emotions)
            self.model.fc = torch.nn.Linear(self.model.fc.in_features, num_emotions)
            
            # Load with strict=False to allow architecture mismatches
            if isinstance(checkpoint, dict):
                if 'state_dict' in checkpoint:
                    self.model.load_state_dict(checkpoint['state_dict'], strict=False)
                else:
                    self.model.load_state_dict(checkpoint, strict=False)
            else:
                self.model.load_state_dict(checkpoint, strict=False)
            
            # Move model to device and set to evaluation mode
            self.model = self.model.to(self.device)
            self.model.eval()
            print("✓ Model loaded successfully (state dict with flexible loading)")
            
            print("Model loaded successfully!")
            self.model_loaded = True
            
        except Exception as e:
            print(f"Error loading model: {e}")
            raise
    
    def predict_tensor(self, img_tensor):
        """
        Predict emotion from a PyTorch tensor
        
        Args:
            img_tensor: Input image as PyTorch tensor (batch_size, 3, 224, 224)
            
        Returns:
            tuple: (emotion_label, confidence_score)
        """
        with torch.no_grad():
            # Move tensor to device
            img_tensor = img_tensor.to(self.device)
            
            # Forward pass through model
            outputs = self.model(img_tensor)
            
            # Apply softmax to get probabilities
            probs = F.softmax(outputs, dim=1)
            
            # Get predicted emotion and confidence
            confidence, predicted = torch.max(probs, 1)
            
            emotion = self.emotions[predicted.item()]
            confidence = confidence.item()
            
            return emotion, confidence
    
    def predict_with_probabilities(self, img_tensor):
        """
        Get emotion predictions with probabilities for all emotions
        
        Args:
            img_tensor: Input image as PyTorch tensor (batch_size, 3, 224, 224)
            
        Returns:
            dict: Dictionary with emotion labels and their probabilities
        """
        with torch.no_grad():
            # Move tensor to device
            img_tensor = img_tensor.to(self.device)
            
            # Forward pass through model
            outputs = self.model(img_tensor)
            
            # Apply softmax to get probabilities
            probs = F.softmax(outputs, dim=1)
            
            # Create dictionary of emotion probabilities
            emotion_probs = {}
            for i, emotion in enumerate(self.emotions):
                emotion_probs[emotion] = probs[0, i].item()
            
            # Calculate derived psychiatric indicators
            emotion_probs['aggressive'] = (emotion_probs['angry'] * 0.7 + 
                                          emotion_probs['disgust'] * 0.3)
            emotion_probs['depressed'] = (emotion_probs['sad'] * 0.6 + 
                                         emotion_probs['fear'] * 0.3 + 
                                         emotion_probs['disgust'] * 0.1)
            emotion_probs['anxious'] = (emotion_probs['fear'] * 0.8 + 
                                       emotion_probs['surprise'] * 0.2)
            
            return emotion_probs
    
    def get_emotion_mapping(self):
        """
        Get the emotion class mapping
        
        Returns:
            dict: Mapping of emotion indices to emotion names
        """
        return {i: emotion for i, emotion in enumerate(self.emotions)}
