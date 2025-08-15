# Voice Agent Project

## Project Overview
This is a voice-enabled conversational agent built with:
- FastAPI backend
- AssemblyAI for speech-to-text
- Google Gemini for AI conversations
- Murf AI for text-to-speech

## Key Features

### Audio Transcription
- **Endpoint**: `/transcribe/file` (POST)
- **Input**: Audio file upload
- **Output**: Text transcript
- **Service**: AssemblyAI speech-to-text
- **Features**:
  - Supports various audio formats
  - Handles large files efficiently
  - Includes error handling for invalid inputs

### Text-to-Speech
- **Endpoint**: `/tts` (POST)
- **Input**: Text and voice selection
- **Output**: Audio URL
- **Service**: Murf AI
- **Features**:
  - Multiple voice options
  - Natural sounding speech
  - Input validation for empty text

### Chat Conversations
- **Endpoint**: `/chat` (POST)
- **Input**: Messages and optional session ID
- **Output**: AI response and session ID
- **Service**: Google Gemini
- **Features**:
  - Session-based conversation history
  - Context-aware responses
  - Fallback message when services are unavailable

### Session Management
- Automatic session creation
- Persistent conversation history
- Session ID generation and tracking

## Project Structure
```
├── .env - API keys configuration
├── main.py - FastAPI application
├── requirements.txt - Python dependencies
├── schemas.py - Pydantic models
├── services/
│   ├── assemblyai_service.py - AssemblyAI integration
│   ├── gemini_service.py - Gemini AI integration
│   └── murf_service.py - Murf TTS integration
├── static/ - Frontend assets
└── templates/ - HTML templates
```

## Setup Instructions
1. Install dependencies: `pip install -r requirements.txt`
2. Create `.env` file with your API keys
3. Run server: `uvicorn main:app --reload`

## API Endpoints
- `GET /` - Homepage
- `POST /transcribe/file` - Upload audio for transcription
- `POST /tts` - Convert text to speech
- `POST /chat` - Chat with Gemini AI

## Environment Variables
- `MURF_API_KEY` - Murf AI API key
- `ASSEMBLYAI_API_KEY` - AssemblyAI API key
- `GEMINI_API_KEY` - Google Gemini API key