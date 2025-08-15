# 🎤 AuraVox Echo Bot - Voice Agent Project

A comprehensive voice agent application with real-time audio recording, transcription, and text-to-speech capabilities. Built with FastAPI, AssemblyAI, and modern web technologies.

## ✨ Features

### 🎧 Echo Bot (Voice Recording & Playback)
- **Real-time audio recording** with microphone selection
- **Automatic audio playback** after recording
- **Bluetooth device support** for audio input
- **Audio file upload** to server
- **Multiple audio format support** (WebM, MP3, WAV)

### 📝 Speech-to-Text Transcription
- **Automatic transcription** of recorded audio using AssemblyAI
- **File upload transcription** for any audio file
- **Real-time transcription status** updates
- **Test transcription system** with known audio files

### 🔊 Text-to-Speech Generation
- **Multiple voice options** (Natalie, Aria, Guy, Davis, Sara)
- **High-quality audio generation** using Murf AI
- **Customizable voice parameters**
- **Instant audio playback**

### 🧪 Testing & Debugging Tools
- **Test audio generation** for transcription verification
- **Detailed error logging** and status messages
- **Browser console debugging** information
- **Audio device detection** and selection

## 🚀 Quick Start

### Prerequisites
- Python 3.8+
- Modern web browser (Chrome, Edge, Firefox)
- Microphone or audio input device

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd voice-agent-bootcamp
   ```

2. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

3. **Set up API keys**
   Create a `.env` file in the project root:
   ```env
   # AssemblyAI API Key (Required for transcription)
   ASSEMBLYAI_API_KEY=your_assemblyai_api_key_here
   
   # Murf AI API Key (Optional for TTS)
   MURF_API_KEY=your_murf_api_key_here
   ```

4. **Run the application**
   ```bash
   python main.py
   ```

5. **Access the application**
   Open your browser and go to: `http://localhost:8000`

## 🔧 API Keys Setup

### AssemblyAI (Required for Transcription)
1. Go to [AssemblyAI](https://www.assemblyai.com/)
2. Sign up for a free account
3. Get your API key from the dashboard
4. Add it to your `.env` file
5. **Free tier**: 3 hours of audio transcription per month

### Murf AI (Optional for TTS)
1. Go to [Murf AI](https://murf.ai/)
2. Sign up for an account
3. Get your API key
4. Add it to your `.env` file

## 🎯 How to Use

### Echo Bot Recording
1. **Select your microphone** from the dropdown
2. **Click "Start Recording"** and allow microphone access
3. **Speak clearly** into your microphone
4. **Click "Stop Recording"** when done
5. **Audio will play back automatically**
6. **Transcription will appear** in the transcription section

### File Upload Transcription
1. **Click "Choose File"** in the upload section
2. **Select any audio file** (MP3, WAV, M4A, etc.)
3. **Click "Transcribe File"**
4. **View the transcription** in the main transcription area

### Test Transcription System
1. **Click "Generate Test Audio"** to create a known audio file
2. **Click "Test Transcription"** to verify the system works
3. **Compare expected vs actual transcription**

### Text-to-Speech
1. **Type text** in the text input field
2. **Select a voice** from the dropdown
3. **Click "Generate Voice"**
4. **Listen to the generated audio**

## 🛠️ Technical Architecture

### Backend (FastAPI)
- **FastAPI framework** for high-performance API
- **AssemblyAI integration** for speech-to-text
- **Murf AI integration** for text-to-speech
- **File upload handling** with proper validation
- **Error handling** and detailed logging

### Frontend (HTML/CSS/JavaScript)
- **Modern responsive design** with CSS Grid/Flexbox
- **Real-time audio recording** using MediaRecorder API
- **Device enumeration** for microphone selection
- **Asynchronous transcription** with status updates
- **Error handling** and user feedback

### Key Technologies
- **FastAPI**: Modern Python web framework
- **AssemblyAI**: Advanced speech recognition
- **Murf AI**: High-quality text-to-speech
- **MediaRecorder API**: Browser-based audio recording
- **Web Audio API**: Audio processing and playback

## 🔍 Troubleshooting Guide

### Common Issues & Solutions

#### 1. Microphone Not Working
**Problem**: Can't access microphone or no audio recording
**Solutions**:
- Check browser permissions (allow microphone access)
- Try different browsers (Chrome, Edge, Firefox)
- Verify Bluetooth device connection
- Check system audio settings

#### 2. Transcription Not Working
**Problem**: Audio recorded but no transcription appears
**Solutions**:
- Verify AssemblyAI API key is correct
- Check audio quality (speak clearly, reduce background noise)
- Try the test transcription feature
- Check server logs for detailed error messages

#### 3. JavaScript Errors
**Problem**: Console shows JavaScript errors
**Solutions**:
- Clear browser cache and reload
- Check browser console (F12) for specific errors
- Ensure all HTML elements are properly loaded
- Verify JavaScript file is being served correctly

#### 4. Audio Playback Issues
**Problem**: Audio doesn't play after recording
**Solutions**:
- Check browser audio settings
- Try different audio formats
- Verify audio file size and quality
- Check browser console for playback errors

### Debugging Steps

1. **Check Browser Console** (F12)
   - Look for JavaScript errors
   - Verify element loading
   - Check API responses

2. **Check Server Logs**
   - Look for Python errors
   - Verify API key configuration
   - Check file upload status

3. **Test Individual Components**
   - Use the test transcription feature
   - Try file upload instead of recording
   - Test TTS generation separately

## 🆕 Day 10: Chat History Feature

### Chat History System
- **In-memory chat storage**: Global dictionary storing chat history by session ID
- **Session-based conversations**: Each session maintains its own conversation history
- **Auto-recording**: Automatically starts recording after LLM response playback
- **Session management**: Clear chat history and create new sessions

### New API Endpoints

#### `POST /agent/chat/{session_id}`
Main chat endpoint that:
1. Transcribes audio to text (STT)
2. Appends transcript to chat history
3. Sends chat history + new message to LLM
4. Stores LLM response in chat history
5. Converts response to audio (TTS)
6. Returns audio URL and response text

#### `GET /agent/chat/{session_id}/history`
Retrieves chat history for a specific session.

#### `DELETE /agent/chat/{session_id}`
Clears chat history for a specific session.

### Frontend Updates
- **Session ID in URL**: Automatically managed via query parameters (?session=xxx)
- **Session management UI**: Display current session ID with clear/new session buttons
- **Auto-recording**: Starts recording automatically after response audio finishes
- **Chat history persistence**: Maintains conversation context across page reloads

### Usage
1. Open the application - session ID is auto-generated and added to URL
2. Use the LLM Agent section for voice conversations
3. Each interaction builds upon previous messages
4. Manage sessions: clear history or create new sessions as needed

## 🐛 Issues We Solved

### 1. JavaScript DOM Loading Issues
**Problem**: Event listeners not attached because DOM elements weren't loaded
**Solution**: Wrapped all element access in `DOMContentLoaded` event listener

```javascript
document.addEventListener('DOMContentLoaded', function() {
  // All element access and event listeners here
});
```

### 2. AssemblyAI Integration Problems
**Problem**: Transcription completing but returning empty text
**Solution**: 
- Added detailed error logging
- Improved audio format handling
- Created test audio generation system
- Added proper error status checking

### 3. Audio Recording Issues
**Problem**: Recording not working due to timing issues
**Solution**:
- Fixed MediaRecorder initialization
- Added proper audio stream handling
- Improved MIME type detection
- Enhanced error handling

### 4. API Key Configuration
**Problem**: API keys not loading properly
**Solution**:
- Created proper `.env` file structure
- Added configuration validation
- Implemented fallback error messages
- Added startup checks

## 📁 Project Structure

```
voice-agent-bootcamp/
├── main.py                 # FastAPI application
├── config.py              # Configuration and API key management
├── requirements.txt        # Python dependencies
├── .env                   # Environment variables (create this)
├── templates/
│   └── index.html         # Main web interface
├── static/
│   ├── script.js          # Frontend JavaScript
│   ├── style.css          # CSS styling
│   └── favicon.ico        # Browser icon
├── uploads/               # Audio file storage
├── images/                # Application images
└── README.md             # This file
```

## 🎓 Learning Outcomes

### Technical Skills Developed
- **FastAPI development** with async/await
- **Real-time audio processing** with Web APIs
- **Third-party API integration** (AssemblyAI, Murf AI)
- **Frontend-backend communication** with fetch API
- **Error handling** and debugging techniques
- **Audio format handling** and conversion

### Problem-Solving Skills
- **Systematic debugging** approach
- **API integration troubleshooting**
- **Browser compatibility** issues
- **Audio processing** challenges
- **User experience** optimization

## 🚀 Future Enhancements

### Potential Improvements
- **Real-time streaming transcription**
- **Voice command recognition**
- **Multi-language support**
- **Audio file format conversion**
- **Cloud storage integration**
- **Mobile app development**

### Advanced Features
- **Speech-to-speech translation**
- **Voice cloning capabilities**
- **Audio analysis and insights**
- **Custom voice model training**
- **Integration with other AI services**

## 📞 Support

If you encounter any issues:
1. Check the troubleshooting guide above
2. Review browser console for errors
3. Check server logs for backend issues
4. Verify API key configuration
5. Test with the provided test features

## 🎉 Success Story

This project demonstrates a complete voice agent system with:
- ✅ Real-time audio recording and playback
- ✅ Advanced speech-to-text transcription
- ✅ High-quality text-to-speech generation
- ✅ Comprehensive error handling and debugging
- ✅ User-friendly web interface
- ✅ Robust testing and validation systems

The journey from initial setup to fully functional voice agent involved solving multiple technical challenges, from JavaScript DOM loading issues to API integration problems. The final result is a production-ready voice agent application that can handle real-world audio processing tasks.

---

**Happy coding! 🎤✨**