

                                        ************                                      ✨       AURAVOX Voice Agent  ✨                          **************         -



# **AuraVox – The AI Voice Agent That Talks, Listens, and Feels Alive 🔊✨**

> *“Not just a bot. This is AuraVox — your always-on, always-chill AI companion.”*

## 🚀 Overview

AuraVox is an **AI-powered voice conversational agent**: speak → transcribe (STT) → think (LLM) → speak back (TTS).
Built during **#30DaysOfVoiceAgents by Murf AI**, the focus is speed, clarity, and a **cozy, modern UI**.

---

## ⚡ Tech Stack

**Frontend**

* Vanilla HTML/JS (single-page), optional React later
* Web Audio API (recording + viz), CSS animations (glassmorphism)

**Backend**

* **FastAPI** (Python) + Uvicorn
* Endpoints for **/agent/chat/{session\_id}**, history, health
* In-memory datastore (prototype-friendly)

**AI & APIs**

* **AssemblyAI (STT)** or your STT provider
* **Google Gemini (LLM)**
* **Murf AI (TTS)**

---

## 🧭 Project Structure (Practical & Clean)



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


#   Auravox Voice Agent Project

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


### `templates/index.html` (UI highlights)

* **Single toggle record button** (Start/Stop) with pulsing & ripple animations
* **Hidden `<audio>`** auto-plays responses
* **Session ID** in URL (`?session_id=`) + copy chip
* **Chat bubbles** (user right, AI left) + smooth fade-in
* **Spacebar** for quick record toggle (optional)

> If you’re serving via FastAPI’s `Jinja2Templates`, `GET /` can render `templates/index.html`.
> Or serve as a static file — both are cool.

---

## 🔌 API Endpoints

### 1) `POST /agent/chat/{session_id}`

**Input:** `multipart/form-data` with `file` (audio/webm/wav)
**Flow:** Audio → STT → Append to history → LLM → Append → TTS → return
**Response:**

```json
{
  "session_id": "abc-123",
  "transcript": "user said ...",
  "response": "ai replied ...",
  "audio_url": "/static/audio/resp_1699.webm"
}
```

### 2) `GET /agent/chat/{session_id}/history`

**Response:**

```json
{
  "message_count": 6,
  "history": [
    {"role":"user","content":"..."},
    {"role":"assistant","content":"..."}
  ]
}
```

### 3) `GET /health`

```json
{"status":"ok"}
```

---

## 🧪 Error Handling 

* Backend: `try/except` around STT/LLM/TTS; logs + safe JSON error
* Frontend: `fetch` error → show friendly text + play `/static/fallback.mp3`
* Simulate errors: comment API keys or break URLs to verify fallback

---

## 💻 Run Locally

### 1) Clone

```bash
git clone https://github.com/your-username/auravox.git
cd auravox
```

### 2) Python venv + deps

```bash
python -m venv venv
# Windows
venv\Scripts\activate
# macOS/Linux
source venv/bin/activate

pip install -r requirements.txt
```

### 3) Environment variables

Create `server/.env` (see `.env.example`):

```
# STT
ASSEMBLYAI_API_KEY=your_assembly_ai_key

# LLM
GEMINI_API_KEY=your_gemini_key

# TTS
MURF_API_KEY=your_murf_key

# General
AURAVOX_HOST=0.0.0.0
AURAVOX_PORT=8000
AURAVOX_BASE_URL=http://localhost:8000
```

### 4) Start server

```bash
uvicorn server.main:app --reload --host 0.0.0.0 --port 8000
```

### 5) Open the UI

* Visit: `http://localhost:8000/?session_id=dev-001`
  (If `session_id` omitted, UI auto-generates and updates URL)

---

## 🧩 Env & File Conventions

* **Uploads:** temp audio stored under `/tmp` or `server/static/audio`
* **TTS outputs:** `server/static/audio/resp_<timestamp>.mp3`
* **History shape:** OpenAI-style: `{role: 'user'|'assistant', content: '...'}`
* **CORS:** If hosting UI separately, enable CORS on FastAPI

---

🌈 Features You'll Love :

🎙️ Live Voice-to-Text: Real-time streaming transcription powered by AssemblyAI, with 🚦 smart turn detection!

🤖 Conversational AI: Ask about weather, current affairs, or anything—get instant, insightful answers.

🔊 Human-like Voice Responses: Choose Murf voices & hear answers!

📝 Transcript History: Track and download every conversation turn.

🎨 Modern UI: Vibrant gradients, easy controls, and responsive design.

🌍 Global Access: Cloud deployed (Render.com), accessible via secure HTTPS.

🔑 Private API Key Entry: Secure, session-only key management

---


🌟 What's New?
🚦 AssemblyAI Turn Detection for natural, chunked transcripts

🤩 Choose from multiple Murf TTS voices

📜 Transcript download & session history container

🌍 Secure cloud deployment—your friends can use it instantly!




⚙️ Tech Stack & Architecture

       Layer	                                             Details

1 . Frontend	                             HTML, CSS, JavaScript (index.html, streaming-raw.js)

2.  Backend	                               FastAPI (Python), AssemblyAI Streaming, Gemini LLM, Murf TTS
  
3.  Hosting	                               🌐 Render.com
  
4.  Features	                              WebSockets, REST endpoints, secure API key modal


💻 Run AuraVox Locally

BASH :

git clone https://github.com/MrFarhan-ninja/AuraVox.git
cd AuraVox
pip install -r requirements.txt
uvicorn main:app --host 0.0.0.0 --port 8000


🚀 Try AuraVox Instantly
🌐 Demo: three0-days-of-ai-voice-agent-challenges.onrender.com

Visit the live link

Add your API keys (AssemblyAI, Gemini, Murf TTS)

Press the mic and start chatting!


🔑 API Keys You Need

AssemblyAI (Speech-To-Text)

Gemini LLM (Conversational AI)

Murf TTS (Voice synthesis)

Your keys are never stored—used securely during your session.


## 📸 Screenshots

<img width="1175" height="891" alt="AuraVox_Final" src="https://github.com/user-attachments/assets/6ce1fff0-3bc0-45b2-acb5-5a4182078991" />

---

## 🗺️ Roadmap

* Multi-language STT + voice cloning
* Sentiment-aware tone changes
* Streaming partial responses (LLM + TTS)
* SQLite/Redis datastore for persistence

---

## 🙌 Credits

* **Murf AI** for the challenge and premium voices
* **AssemblyAI** for transcription
* **Google Gemini** for reasoning
* Community + open-source ❤️

---

🪧 License
MIT – Fork, remix, collab, and launch your own!
Created for #30DaysOfAIVoiceAgents by Farhan.

---

### **.env.example** (copy to `server/.env`)

```ini
ASSEMBLYAI_API_KEY=
GEMINI_API_KEY=
MURF_API_KEY=

AURAVOX_HOST=0.0.0.0
AURAVOX_PORT=8000
AURAVOX_BASE_URL=http://localhost:8000
```

🤝 Connect & Collab
Feel free to connect on " Farhan Ali Khan "
Love AI voice projects? Drop a ⭐ or DM for tips/code!
