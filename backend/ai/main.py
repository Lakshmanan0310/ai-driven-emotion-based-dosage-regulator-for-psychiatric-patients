"""
FastAPI server for facial emotion recognition using FER_static_ResNet50_AffectNet model
Provides REST API endpoints for emotion detection from face images
"""

from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from face_emotion_model import FaceEmotionDetector
import torchvision.transforms as transforms
from PIL import Image
import io
import traceback
import os

# Initialize FastAPI application
app = FastAPI(
    title="Face Emotion Recognition API",
    description="API for detecting emotions from face images using ResNet50 model trained on AffectNet",
    version="1.0.0"
)

# Add CORS middleware to allow cross-origin requests
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_credentials=True,
    allow_headers=["*"],
)

# Initialize the face emotion detector with the FER model
try:
    # Try to load the model from the models directory
    detector = FaceEmotionDetector(
        model_path="models/FER_static_ResNet50_AffectNet.pt"
    )
except FileNotFoundError:
    try:
        # Fallback: try finding the model in parent directory
        detector = FaceEmotionDetector()
    except Exception as e:
        print(f"Failed to initialize detector: {e}")
        detector = None

# Image preprocessing pipeline
# ResNet50 expects 224x224 RGB images normalized with ImageNet statistics
transform = transforms.Compose([
    transforms.Resize((224, 224)),  # Resize to required input size
    transforms.ToTensor(),  # Convert PIL Image to tensor
    transforms.Normalize(
        mean=[0.485, 0.456, 0.406],  # ImageNet normalization
        std=[0.229, 0.224, 0.225]
    )
])

# Health check endpoint
@app.get("/")
def root():
    """Health check endpoint"""
    return {
        "status": "Face Emotion Recognition API is running",
        "model": "FER_static_ResNet50_AffectNet",
        "model_loaded": detector is not None
    }

# Health check endpoint with detailed status
@app.get("/health")
def health_check():
    """Detailed health check endpoint"""
    return {
        "status": "healthy" if detector else "unhealthy",
        "model_loaded": detector is not None,
        "message": "Ready for emotion detection" if detector else "Model failed to load"
    }

# Main emotion prediction endpoint
@app.post("/predict-face")
async def predict_face(file: UploadFile = File(...)):
    """
    Predict emotion from a face image
    
    Args:
        file: Image file containing a face
        
    Returns:
        JSON object with:
        - emotion: Detected primary emotion
        - confidence: Confidence score (0-1)
        - all_emotions: Probabilities for all emotion classes
        - psychiatric_indicators: Derived psychiatric indicators
    """
    if detector is None:
        raise HTTPException(
            status_code=500,
            detail="Emotion detection model is not loaded"
        )
    
    try:
        # Read image file
        image_bytes = await file.read()
        if not image_bytes:
            raise HTTPException(
                status_code=400,
                detail="Empty image file"
            )
        
        # Open and convert image to RGB
        image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
        
        # Apply preprocessing transformations
        tensor = transform(image).unsqueeze(0)  # Add batch dimension
        
        # Get emotion prediction with all probabilities
        emotion_probs = detector.predict_with_probabilities(tensor)
        
        # Get primary emotion and confidence
        emotion, confidence = detector.predict_tensor(tensor)
        
        # Extract individual emotions
        emotions = {
            "angry": emotion_probs.get("angry", 0),
            "disgusted": emotion_probs.get("disgust", 0),
            "fearful": emotion_probs.get("fear", 0),
            "happy": emotion_probs.get("happy", 0),
            "neutral": emotion_probs.get("neutral", 0),
            "sad": emotion_probs.get("sad", 0),
            "surprised": emotion_probs.get("surprise", 0),
        }
        
        # Extract psychiatric indicators
        psychiatric_indicators = {
            "aggressive": emotion_probs.get("aggressive", 0),
            "depressed": emotion_probs.get("depressed", 0),
            "anxious": emotion_probs.get("anxious", 0),
        }
        
        return {
            "success": True,
            "emotion": emotion,
            "confidence": round(confidence, 4),
            "all_emotions": {k: round(v, 4) for k, v in emotions.items()},
            "psychiatric_indicators": {k: round(v, 4) for k, v in psychiatric_indicators.items()}
        }
        
    except Image.UnidentifiedImageError:
        raise HTTPException(
            status_code=400,
            detail="Invalid image file format"
        )
    except Exception as e:
        print(f"Error during emotion prediction: {e}")
        traceback.print_exc()
        raise HTTPException(
            status_code=500,
            detail=f"Error processing image: {str(e)}"
        )

# Batch emotion prediction endpoint
@app.post("/predict-batch")
async def predict_batch(files: list[UploadFile] = File(...)):
    """
    Predict emotions from multiple face images
    
    Args:
        files: List of image files
        
    Returns:
        List of emotion predictions for each image
    """
    if detector is None:
        raise HTTPException(
            status_code=500,
            detail="Emotion detection model is not loaded"
        )
    
    results = []
    
    for file in files:
        try:
            image_bytes = await file.read()
            image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
            tensor = transform(image).unsqueeze(0)
            
            emotion, confidence = detector.predict_tensor(tensor)
            emotion_probs = detector.predict_with_probabilities(tensor)
            
            results.append({
                "filename": file.filename,
                "emotion": emotion,
                "confidence": round(confidence, 4),
                "all_emotions": {k: round(v, 4) for k, v in emotion_probs.items() if k in ["angry", "disgust", "fear", "happy", "neutral", "sad", "surprise"]}
            })
        except Exception as e:
            results.append({
                "filename": file.filename,
                "error": str(e)
            })
    
    return {"results": results}

# Get supported emotions endpoint
@app.get("/emotions")
def get_emotions():
    """Get list of supported emotion classes"""
    return {
        "basic_emotions": [
            "angry", "disgust", "fear", "happy", "neutral", "sad", "surprise"
        ],
        "psychiatric_indicators": [
            "aggressive", "depressed", "anxious"
        ]
    }

# Model information endpoint
@app.get("/model-info")
def get_model_info():
    """Get information about the loaded model"""
    if detector is None:
        return {"model_loaded": False}
    
    return {
        "model_name": "FER_static_ResNet50_AffectNet",
        "architecture": "ResNet50",
        "dataset": "AffectNet",
        "input_size": [3, 224, 224],
        "emotion_classes": 7,
        "device": str(detector.device),
        "model_loaded": True
    }

if __name__ == "__main__":
    import uvicorn
    # Run the FastAPI server
    uvicorn.run(
        app,
        host="0.0.0.0",
        port=8000,
        log_level="info"
    )
