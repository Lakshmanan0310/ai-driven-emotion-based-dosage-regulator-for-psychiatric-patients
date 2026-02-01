# FER Model Integration Guide

## Overview
This guide explains how to integrate the `FER_static_ResNet50_AffectNet.pt` model into the Mood Tracker application.

## Architecture

### Components
1. **PyTorch FastAPI Server** (`ai/main.py`)
   - Runs on port 8000
   - Handles facial emotion recognition
   - Loads the FER_static_ResNet50_AffectNet.pt model
   - Provides REST API endpoints

2. **Express.js Backend** (`backend/index.js`)
   - Runs on port 5001
   - Communicates with FastAPI server
   - Integrates emotion results with database
   - Provides API endpoints for frontend

3. **React Frontend** (`frontend/src/`)
   - Runs on port 5173
   - Uses face-api.js for real-time facial detection
   - Sends images to backend for FER model analysis

## Setup Instructions

### 1. Install Python Dependencies

```bash
cd backend/ai
pip install -r requirements.txt
```

**Required packages:**
- FastAPI (web framework)
- PyTorch (deep learning)
- torchvision (computer vision)
- Pillow (image processing)
- Python-multipart (file upload handling)

### 2. Start the FastAPI Server

```bash
cd backend/ai
python main.py
```

The server will:
- Load the FER_static_ResNet50_AffectNet.pt model
- Listen on http://localhost:8000
- Automatically detect GPU/CPU availability

### 3. Configure Express Backend

Set environment variables in `.env`:

```env
# FER API Configuration
FER_API_URL=http://localhost:8000
GEMINI_API_KEY=your_gemini_api_key_here
MONGODB_URI=your_mongodb_connection_string
```

### 4. Start Express Server

```bash
cd backend
npm install
npm start
```

### 5. Start Frontend

```bash
cd frontend
npm install
npm run dev
```

## API Endpoints

### FastAPI FER Server (Port 8000)

#### Health Check
```
GET /
GET /health
```

#### Predict Single Image
```
POST /predict-face
Content-Type: multipart/form-data

Response:
{
  "success": true,
  "emotion": "happy",
  "confidence": 0.95,
  "all_emotions": {
    "angry": 0.02,
    "disgusted": 0.01,
    "fearful": 0.02,
    "happy": 0.95,
    "neutral": 0.0,
    "sad": 0.0,
    "surprised": 0.0
  },
  "psychiatric_indicators": {
    "aggressive": 0.015,
    "depressed": 0.0,
    "anxious": 0.0
  }
}
```

#### Batch Prediction
```
POST /predict-batch
Content-Type: multipart/form-data
Files: [file1, file2, ...]
```

#### Model Information
```
GET /model-info
```

#### Supported Emotions
```
GET /emotions
```

## Model Details

### FER_static_ResNet50_AffectNet.pt
- **Architecture:** ResNet50
- **Training Dataset:** AffectNet (large-scale facial expression dataset)
- **Input Size:** 224x224 RGB images
- **Output:** 7 emotion classes
- **Emotions:** angry, disgusted, fearful, happy, neutral, sad, surprised

### Normalization
Images are normalized using ImageNet statistics:
- Mean: [0.485, 0.456, 0.406]
- Std: [0.229, 0.224, 0.225]

## Integration Points

### 1. Frontend to Backend
```javascript
// In aiController.js
const FER_API_URL = process.env.FER_API_URL || 'http://localhost:8000';
const FER_ENDPOINT = `${FER_API_URL}/predict-face`;
```

### 2. Real-time Facial Detection Flow
1. User's webcam feeds video to face-api.js (frontend)
2. Face-api.js detects faces in real-time
3. Captured face image is sent to Express backend
4. Express backend sends image to FastAPI FER server
5. FER model returns emotion predictions
6. Results are combined with voice analysis
7. Final analysis is displayed to user

### 3. Voice + Facial Analysis
```javascript
// Combine facial and voice emotions
combinedAnalysis = {
  facial: facialAnalysisFromFER,
  voice: voiceAnalysisFromGemini,
  combined: dominantEmotion,
  psychiatricIndicators: { aggressive, depressed, anxious }
}
```

## File Changes Summary

### Modified Files

1. **backend/ai/face_emotion_model.py**
   - Updated to properly load FER_static_ResNet50_AffectNet.pt
   - Added model search functionality
   - Added probability prediction methods
   - Added psychiatric indicator calculation

2. **backend/ai/main.py**
   - Created comprehensive FastAPI server
   - Added multiple endpoints for emotion detection
   - Added health checks and error handling
   - Added batch processing support

3. **backend/controllers/aiController.js**
   - Updated to use FER API for facial emotion detection
   - Added FER API availability checking
   - Maintained Gemini API for voice emotion analysis
   - Added fallback mechanisms

### New Files

1. **backend/ai/.env.example**
   - FastAPI server configuration template

2. **backend/ai/requirements.txt**
   - Python dependencies for AI server

3. **FER_MODEL_INTEGRATION.md**
   - This integration guide

## Error Handling

### If FER API is unavailable
- System automatically falls back to generating random emotion values
- Frontend continues to work with mock data
- User is not blocked from using the application

### If Model Loading Fails
1. Check if the model file exists at the correct path
2. Verify Python dependencies are installed
3. Check available disk space (model is ~100MB)
4. Verify CUDA/GPU drivers if using GPU

## Performance Considerations

### Hardware Requirements
- **Minimum:** CPU with 8GB RAM
- **Recommended:** GPU with 4GB VRAM (NVIDIA with CUDA)
- **Model Size:** ~100MB

### Processing Time
- **Per Image:** ~50-200ms (CPU) or ~20-50ms (GPU)
- **Batch Processing:** Scales linearly

### Optimization
- GPU support automatically detected and used if available
- Images cached for repeated processing
- Batch processing available for multiple images

## Troubleshooting

### Port 8000 Already in Use
```bash
# Find and kill process using port 8000
lsof -i :8000
kill -9 <PID>

# Or use different port
python main.py --port 8001
```

### Model File Not Found
```bash
# Verify model exists
ls -la backend/ai/models/FER_static_ResNet50_AffectNet.pt

# Check file permissions
chmod 644 backend/ai/models/FER_static_ResNet50_AffectNet.pt
```

### GPU/CUDA Issues
```python
# Force CPU usage
torch.device("cpu")

# Check GPU availability
python -c "import torch; print(torch.cuda.is_available())"
```

## Testing

### Manual Testing
```bash
# Test FER API health
curl http://localhost:8000/health

# Test emotion detection with an image
curl -F "file=@path/to/image.jpg" http://localhost:8000/predict-face
```

### Integration Testing
1. Start both servers (FastAPI and Express)
2. Open frontend in browser
3. Allow camera access
4. Take a photo or use webcam
5. Verify emotions are detected correctly

## Future Enhancements

1. **Multi-face Detection:** Support for detecting emotions of multiple people
2. **Video Frame Analysis:** Real-time emotion tracking from video
3. **Model Optimization:** Quantization for faster inference
4. **Model Retraining:** Fine-tuning on hospital-specific data
5. **Confidence Threshold:** Adjustable confidence filters

## References

- [AffectNet Dataset](http://mohammadmahoor.com/affectnet/)
- [ResNet Architecture](https://arxiv.org/abs/1512.03385)
- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [PyTorch Documentation](https://pytorch.org/)
