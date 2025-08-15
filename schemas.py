from typing import List, Dict, Optional
from pydantic import BaseModel

class Message(BaseModel):
    """Represents a single message in the chat."""
    role: str  # 'user' or 'assistant'
    content: str

class ChatRequest(BaseModel):
    """Request schema for chat endpoint."""
    messages: List[Message]
    session_id: Optional[str] = None

class ChatResponse(BaseModel):
    """Response schema for chat endpoint."""
    message: str
    session_id: str

class TranscriptionResponse(BaseModel):
    """Response schema for transcription endpoint."""
    transcript: str

class TTSRequest(BaseModel):
    """Request schema for TTS endpoint."""
    text: str
    voice_id: str = "en-US-natalie"

class TTSResponse(BaseModel):
    """Response schema for TTS endpoint."""
    audio_url: str

class AudioUploadResponse(BaseModel):
    """Response schema for audio upload endpoint."""
    success: bool
    message: str
    transcript: Optional[str] = None