
# Day 16 scaffold: will add WebSocket /ws/audio endpoint here

from fastapi import FastAPI, Form, Request, UploadFile, File
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from fastapi import FastAPI, WebSocket,WebSocketDisconnect
from fastapi.responses import HTMLResponse
import json
from typing import Optional
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
import logging
logger = logging.getLogger("uvicorn")
import time
import assemblyai as aai
import google.generativeai as genai
from typing import List, Dict
import io
import tempfile
import requests
import uvicorn
# from config import HOST, PORT, check_api_key, check_assemblyai_api_key
import shutil
import os
from dotenv import load_dotenv

load_dotenv()

ASSEMBLYAI_API_KEY = os.getenv("ASSEMBLYAI_API_KEY")
MURF_API_KEY = os.getenv("MURF_API_KEY")
FALLBACK_MESSAGE = "I'm having trouble connecting right now. Please try again in a moment."
# AssemblyAI Configuration
if ASSEMBLYAI_API_KEY:
    aai.settings.api_key = ASSEMBLYAI_API_KEY
    transcriber = aai.Transcriber()
else:
    transcriber = None

# Gemini Configuration
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)
else:
    print("Warning: GEMINI_API_KEY not found in .env file.")

# In-memory chat history store (session_id -> list of messages)
chat_history_store = {}
# it is saved if its is visible
# for model in genai.list_models():
#     print(f"Available model: {model.name}")
#     print(model.name)

app = FastAPI()

# Mount static and template directories
app.mount("/static", StaticFiles(directory="static"), name="static")
app.mount("/images", StaticFiles(directory="images"), name="images")
templates = Jinja2Templates(directory="templates")

chat_history_store = {}

async def transcribe_with_assemblyai(audio_path: str) -> str:
    """Helper function to transcribe audio using AssemblyAI"""
    if not ASSEMBLYAI_API_KEY:
        raise RuntimeError("AssemblyAI API key not configured")
    
    transcriber = aai.Transcriber()
    transcript = transcriber.transcribe(audio_path)
    
    if transcript.status != 'completed':
        raise RuntimeError(f"Transcription failed: {transcript.error}")
    
    return transcript.text

async def call_gemini(messages: List[Dict[str, str]]) -> str:
    """Helper function to call Gemini API with chat history"""
    if not GEMINI_API_KEY:
        raise RuntimeError("Gemini API key not configured")
    
    try:
        # Use the Python client
        model = genai.GenerativeModel('gemini-1.5-flash')
        chat = model.start_chat(history=[])
        
        # Convert messages to Gemini format
        for msg in messages[:-1]:  # Exclude the last message
            if msg["role"] == "user":
                chat.send_message(msg["content"])
            elif msg["role"] == "assistant":
                # Gemini handles history internally
                pass
        
        # Send the last message
        response = chat.send_message(messages[-1]["content"])
        return response.text
        
    except Exception as e:
        raise RuntimeError(f"Failed to call Gemini API: {str(e)}")

async def generate_murf_tts_and_save(text: str) -> str:
    """Helper function to generate TTS audio with Murf"""
    if not MURF_API_KEY:
        raise RuntimeError("MURF API key not configured")
    
    url = "https://api.murf.ai/v1/speech/generate"
    headers = {
        "Accept": "application/json",
        "Content-Type": "application/json",
        "api-key": MURF_API_KEY
    }
    
    payload = {
        "text": text,
        "voiceId": "en-US-natalie",
        "format": "MP3",
        "sampleRate": 24000,
        "channelType": "STEREO"
    }
    
    response = requests.post(url, json=payload, headers=headers)
    
    if response.status_code != 200:
        raise RuntimeError(f"TTS generation failed: {response.text}")
    
    response_data = response.json()
    audio_url = response_data.get("audioFile") or response_data.get("audio_url")
    
    if not audio_url:
        raise RuntimeError("No audio URL in TTS response")
    
    return audio_url



@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    """
    Establishes a WebSocket connection and echoes back any message it receives.
    """
    await websocket.accept()
    logger.info("WebSocket connection established.")
    try:
        while True:
            # Wait for a message from the client
            data = await websocket.receive_text()
            logger.info(f"WebSocket received message: '{data}'")
            
            # Echo the received message back to the client
            await websocket.send_text(f"Echo: {data}")
            logger.info(f"WebSocket sent echo message back.")
            
    except WebSocketDisconnect:
        logger.info("Client disconnected from WebSocket.")
    except Exception as e:
        logger.error(f"An error occurred in the WebSocket connection: {e}")
    finally:
        logger.info("Closing WebSocket connection.")

#@app.websocket("/ws/audio")
#async def websocket_audio_endpoint(websocket: WebSocket):

 #   Receives streaming audio data from the client and saves it to a file.
    
#    await websocket.accept()
 #   uploads_dir = "uploads"
    #os.makedirs(uploads_dir, exist_ok=True)
    #filename = f"recording_{int(time.time())}.webm"
    #file_path = os.path.join(uploads_dir, filename)
    #with open(file_path, "wb") as audio_file:
        #try:
            #while True:
             #   data = await websocket.receive_bytes()
              #  audio_file.write(data)
        #except WebSocketDisconnect:
            #logger.info(f"WebSocket audio stream disconnected. Audio saved to {file_path}")
        #except Exception as e:
            #logger.error(f"Error in audio WebSocket: {e}")
        #finally:
            #audio_file.flush()
            #audio_file.close()
            #logger.info(f"Audio file closed: {file_path}")

#@app.websocket("/ws/audio")
#async def websocket_audio_endpoint(websocket: WebSocket):
 #   """
  #  Receives streaming audio data from the client and saves it to a file.
    #"""
   # await websocket.accept()
    #uploads_dir = "uploads"
    #os.makedirs(uploads_dir, exist_ok=True)
    #filename = f"recording_{int(time.time())}.webm"
    #file_path = os.path.join(uploads_dir, filename)

   # try:
       # with open(file_path, "wb") as audio_file:
           # while True:
             #   data = await websocket.receive_bytes()
              #  audio_file.write(data)
               # logger.info(f"Received {len(data)} bytes")  # debug line
   # except WebSocketDisconnect:
        #logger.info(f"🔌 WebSocket disconnected. Audio saved: {file_path}")
   # except Exception as e:
        #logger.error(f"⚠️ Error in audio WebSocket: {type(e).__name__}: {e}")
    #finally:
        #logger.info(f"✅ Audio file closed: {file_path}")

@app.websocket("/ws/audio")
async def websocket_audio_endpoint(websocket: WebSocket):
    await websocket.accept()
    uploads_dir = "uploads"
    os.makedirs(uploads_dir, exist_ok=True)
    filename = f"recording_{int(time.time())}.webm"
    file_path = os.path.join(uploads_dir, filename)

    try:
        with open(file_path, "wb") as audio_file:
            while True:
                msg = await websocket.receive()

                # If it's binary → audio data
                if msg["type"] == "websocket.receive" and "bytes" in msg:
                    audio_file.write(msg["bytes"])
                    logger.info(f"Received {len(msg['bytes'])} bytes")

                # If it's text → check control messages (start/stop)
                elif msg["type"] == "websocket.receive" and "text" in msg:
                    try:
                        payload = json.loads(msg["text"])
                        if payload.get("type") == "stop":
                            logger.info("🛑 Stop signal received from client.")
                            break
                    except Exception:
                        pass

                # If client disconnects
                elif msg["type"] == "websocket.disconnect":
                    logger.info("🔌 Client disconnected.")
                    break

    except Exception as e:
        logger.error(f"⚠️ Error in audio WebSocket: {e}")
    finally:
        logger.info(f"✅ Audio file closed: {file_path}")

@app.post("/transcribe/file")
async def transcribe_audio(file: UploadFile = File(...)):
    try:
        if not ASSEMBLYAI_API_KEY:
            return JSONResponse(
                status_code=500, 
                content={"error": "AssemblyAI API key not configured. Please set ASSEMBLYAI_API_KEY in .env file."}
            )
        
        if not transcriber:
            return JSONResponse(
                status_code=500, 
                content={"error": "Transcriber not initialized. Please check your AssemblyAI API key."}
            )
        
        # Read the uploaded file
        audio_bytes = await file.read()
        
        if len(audio_bytes) == 0:
            return JSONResponse(
                status_code=400, 
                content={"error": "Empty audio file provided."}
            )
        
        # Write bytes to a temporary file and transcribe using AssemblyAI
        print(f"Transcribing audio file of size: {len(audio_bytes)} bytes")
        print(f"File content type: {file.content_type}")
        print(f"File name: {file.filename}")

        # Pick a suitable suffix based on filename or content type
        temp_suffix = ".webm"
        if file and file.filename and "." in file.filename:
            temp_suffix = os.path.splitext(file.filename)[1]
        elif file and file.content_type:
            if "mp3" in file.content_type:
                temp_suffix = ".mp3"
            elif "wav" in file.content_type:
                temp_suffix = ".wav"
            elif "ogg" in file.content_type:
                temp_suffix = ".ogg"

        with tempfile.NamedTemporaryFile(suffix=temp_suffix, delete=False) as tmp:
            tmp.write(audio_bytes)
            tmp_path = tmp.name

        try:
            transcript = transcriber.transcribe(tmp_path)
        finally:
            try:
                os.unlink(tmp_path)
            except Exception:
                pass
        
        print(f"Transcription result: {transcript}")
        print(f"Transcription status: {transcript.status if transcript else 'None'}")
        print(f"Transcription text: '{transcript.text if transcript else 'None'}'")
        print(f"Transcription error: {transcript.error if transcript else 'None'}")
        print(f"Transcription confidence: {transcript.confidence if hasattr(transcript, 'confidence') else 'N/A'}")
        
        if transcript and transcript.status == 'completed' and transcript.text:
            return {"transcript": transcript.text}
        elif transcript and transcript.status == 'error':
            return JSONResponse(
                status_code=500, 
                content={"error": f"AssemblyAI transcription error: {transcript.error}"}
            )
        else:
            return JSONResponse(
                status_code=500, 
                content={"error": f"Transcription not completed. Status: {transcript.status if transcript else 'None'}, Text: {transcript.text if transcript else 'None'}"}
            )
            
    except Exception as e:
        print(f"Transcription error: {str(e)}")
        return JSONResponse(
            status_code=500, 
            content={"error": f"Transcription failed: {str(e)}"}
        )

@app.get("/")
async def home(request: Request):
    return templates.TemplateResponse("index.html", {"request": request})
@app.post("/tts")
async def tts(text: str = Form(...), voiceId: str = Form("en-US-natalie")):
    # Check if API key is set
    if not MURF_API_KEY:
        return JSONResponse(status_code=500, content={"error": "API key not configured. Please set MURF_API_KEY in .env file."})

    # Correct Murf API endpoint
    url = "https://api.murf.ai/v1/speech/generate"
    
    headers = {
        "Accept": "application/json",
        "Content-Type": "application/json",
        "api-key": MURF_API_KEY
    }

    # Use the voiceId provided by the frontend
    payload = {
        "text": text,
        "voiceId": voiceId,
        "format": "MP3",
        "sampleRate": 24000,
        "channelType": "STEREO"
    }

    try:
        response = requests.post(url, json=payload, headers=headers)
        
        if response.status_code == 200:
            response_data = response.json()
            audio_url = response_data.get("audioFile") or response_data.get("audio_url")
            
            if audio_url:
                return JSONResponse(content={"audio_url": audio_url})
            else:
                return JSONResponse(status_code=500, content={
                    "error": "No audio URL in the API response.", 
                    "response": response_data
                })
        else:
            return JSONResponse(status_code=response.status_code, content={
                "error": "TTS generation failed.", 
                "details": response.text
            })
    except Exception as e:
        return JSONResponse(status_code=500, content={"error": "A server error occurred.", "details": str(e)})

@app.post("/upload-audio")
async def upload_audio(file: UploadFile = File(...)):
    uploads_dir = "uploads"
    os.makedirs(uploads_dir, exist_ok=True)
    filename = file.filename if file.filename is not None else "uploaded_audio"
    file_location = os.path.join(uploads_dir, filename)
    # Save the uploaded file
    with open(file_location, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    # Get file size after closing
    size = os.path.getsize(file_location)
    return {
        "filename": file.filename,
        "content_type": file.content_type,
        "size": size
    }

@app.get("/voices")
async def get_voices():
    if not MURF_API_KEY:
        return JSONResponse(status_code=500, content={"error": "API key not configured. Please set MURF_API_KEY in .env file."})

    url = "https://api.murf.ai/v1/speech/voices"
    headers = {
        "Accept": "application/json",
        "api-key": MURF_API_KEY
    }

    try:
        response = requests.get(url, headers=headers)
        if response.status_code == 200:
            return JSONResponse(content=response.json())
        else:
            return JSONResponse(status_code=500, content={
                "error": "Failed to fetch voices.", 
                "details": response.text
            })
    except Exception as e:
        return JSONResponse(status_code=500, content={"error": "A server error occurred.", "details": str(e)})

@app.post("/tts/echo")
async def tts_echo(file: UploadFile = File(...), voiceId: str = Form("en-US-natalie")):
    """
    Echo Bot v2: Transcribe audio and generate new audio with Murf voice
    """
    try:
        # Check API keys are configured
        if not ASSEMBLYAI_API_KEY:
            return JSONResponse(
                status_code=500,
                content={"error": "AssemblyAI API key not configured. Please set ASSEMBLYAI_API_KEY in .env file."}
            )

        if not MURF_API_KEY:
            return JSONResponse(
                status_code=500,
                content={"error": "MURF API key not configured. Please set MURF_API_KEY in .env file."}
            )

        if not transcriber:
            return JSONResponse(
                status_code=500,
                content={"error": "Transcriber not initialized. Please check your AssemblyAI API key."}
            )

        # Read the uploaded audio file
        audio_bytes = await file.read()
        if len(audio_bytes) == 0:
            return JSONResponse(
                status_code=400,
                content={"error": "Empty audio file provided."}
            )

        print(f"Echo Bot v2: Processing audio file of size: {len(audio_bytes)} bytes")
        print(f"File content type: {file.content_type}")
        print(f"File name: {file.filename}")
        print(f"Selected voice: {voiceId}")

        # Persist to temp file for AssemblyAI
        temp_suffix = ".webm"
        if file and file.filename and "." in file.filename:
            temp_suffix = os.path.splitext(file.filename)[1]
        elif file and file.content_type:
            if "mp3" in file.content_type:
                temp_suffix = ".mp3"
            elif "wav" in file.content_type:
                temp_suffix = ".wav"
            elif "ogg" in file.content_type:
                temp_suffix = ".ogg"

        with tempfile.NamedTemporaryFile(suffix=temp_suffix, delete=False) as tmp:
            tmp.write(audio_bytes)
            tmp_path = tmp.name

        try:
            # Step 1: Transcribe the audio using AssemblyAI
            print("Step 1: Transcribing audio...")
            transcript = transcriber.transcribe(tmp_path)

            if not transcript or transcript.status != 'completed' or not transcript.text:
                error_msg = f"Transcription failed. Status: {transcript.status if transcript else 'None'}, Error: {transcript.error if transcript else 'None'}"
                print(f"Transcription error: {error_msg}")
                return JSONResponse(
                    status_code=500,
                    content={"error": f"Transcription failed: {error_msg}"}
                )

            transcription_text = transcript.text.strip()
            print(f"Transcription successful: '{transcription_text}'")

            # Step 2: Generate new audio with Murf using the transcription
            print("Step 2: Generating TTS audio...")
            url = "https://api.murf.ai/v1/speech/generate"
            headers = {
                "Accept": "application/json",
                "Content-Type": "application/json",
                "api-key": MURF_API_KEY
            }
            payload = {
                "text": transcription_text,
                "voiceId": voiceId,
                "format": "MP3",
                "sampleRate": 24000,
                "channelType": "STEREO"
            }
            response = requests.post(url, json=payload, headers=headers)
            if response.status_code != 200:
                return JSONResponse(
                    status_code=500,
                    content={"error": f"TTS generation failed: {response.text}"}
                )
            response_data = response.json()
            audio_url = response_data.get("audioFile") or response_data.get("audio_url")
            if not audio_url:
                return JSONResponse(status_code=500, content={"error": "No audio URL in the TTS response."})

            print(f"TTS generation successful: {audio_url}")
            return JSONResponse(content={
                "audio_url": audio_url,
                "transcription": transcription_text,
                "voice_used": voiceId
            })
        finally:
            try:
                os.unlink(tmp_path)
            except Exception:
                pass
    except Exception as e:
        print(f"Echo Bot v2 error: {str(e)}")
        return JSONResponse(
            status_code=500,
            content={"error": f"Echo Bot processing failed: {str(e)}"}
        )

@app.post("/agent/chat/{session_id}")
async def agent_chat(session_id: str, file: UploadFile = File(...), voice_id: str = Form("en-US-natalie")):
    """
    Chat endpoint with history for LLM voice agent
    
    Process:
    1. Transcribe audio to text (STT)
    2. Append transcript to chat history
    3. Send chat history + new message to LLM
    4. Store LLM response in chat history
    5. Convert response to audio (TTS)
    6. Return audio URL and response text
    """
    try:
        # Check API keys
        if not ASSEMBLYAI_API_KEY:
            return JSONResponse(
                status_code=500, 
                content={"error": "AssemblyAI API key not configured. Please set ASSEMBLYAI_API_KEY in .env file."}
            )
        
        if not GEMINI_API_KEY:
            return JSONResponse(
                status_code=500, 
                content={"error": "Gemini API key not configured. Please set GEMINI_API_KEY in .env file."}
            )
            
        # Murf API key is optional for chat; if missing we'll skip TTS and return text-only

        # Read audio file
        audio_bytes = await file.read()
        if len(audio_bytes) == 0:
            # Graceful fallback when no audio
            assistant_response = FALLBACK_MESSAGE
            if session_id not in chat_history_store:
                chat_history_store[session_id] = []
            chat_history_store[session_id].append({"role": "assistant", "content": assistant_response})
            return {
                "session_id": session_id,
                "user_message": None,
                "assistant_response": assistant_response,
                "audio_url": None,
                "tts_warning": "Empty audio file provided.",
                "chat_history": chat_history_store[session_id],
                "message_count": len(chat_history_store[session_id])
            }

        # Save temporary audio file for transcription
        with tempfile.NamedTemporaryFile(suffix=".webm", delete=False) as temp_audio:
            temp_audio.write(audio_bytes)
            temp_audio_path = temp_audio.name

        try:
            # Step 1: Transcribe audio (STT)
            try:
                transcriber = aai.Transcriber()
                transcript = transcriber.transcribe(temp_audio_path)
                if transcript.status != 'completed' or not transcript.text:
                    raise RuntimeError(getattr(transcript, 'error', 'transcription incomplete or empty'))
                user_message = transcript.text.strip()
            except Exception as stt_error:
                # STT failed — return graceful fallback
                assistant_response = FALLBACK_MESSAGE
                if session_id not in chat_history_store:
                    chat_history_store[session_id] = []
                # store assistant fallback only (no user text available)
                chat_history_store[session_id].append({"role": "assistant", "content": assistant_response})
                return {
                    "session_id": session_id,
                    "user_message": None,
                    "assistant_response": assistant_response,
                    "audio_url": None,
                    "tts_warning": f"STT failed: {str(stt_error)}",
                    "chat_history": chat_history_store[session_id],
                    "message_count": len(chat_history_store[session_id])
                }

            # Step 2: Initialize chat history for session if not exists
            if session_id not in chat_history_store:
                chat_history_store[session_id] = []
            
            # Step 3: Add user message to chat history
            chat_history_store[session_id].append({
                "role": "user",
                "content": user_message
            })

            # Step 4: Prepare messages for Gemini
            messages = chat_history_store[session_id]
            
            # Step 5: Call Gemini API
            try:
                model = genai.GenerativeModel('gemini-1.5-flash')
                chat = model.start_chat(history=[])
                # Send context and current message
                context_prompt = "You are a helpful AI assistant. Keep responses concise and natural."
                full_prompt = f"{context_prompt}\n\nPrevious conversation:\n"
                for msg in messages[:-1]:
                    if msg["role"] == "user":
                        full_prompt += f"User: {msg['content']}\n"
                    elif msg["role"] == "assistant":
                        full_prompt += f"Assistant: {msg['content']}\n"
                full_prompt += f"\nCurrent user message: {user_message}\nAssistant:"
                response = chat.send_message(full_prompt)
                assistant_response = (response.text or "").strip()
                if not assistant_response:
                    assistant_response = FALLBACK_MESSAGE
                    llm_warning = "Empty response from LLM"
                else:
                    llm_warning = None
            except Exception as e:
                assistant_response = FALLBACK_MESSAGE
                llm_warning = f"Failed to call Gemini API: {str(e)}"

            # Step 6: Add assistant response to chat history
            chat_history_store[session_id].append({
                "role": "assistant", 
                "content": assistant_response
            })

            # Step 7: Generate TTS for response (best-effort)
            audio_url = None
            tts_warning = None
            if MURF_API_KEY:
                try:
                    url = "https://api.murf.ai/v1/speech/generate"
                    headers = {
                        "Accept": "application/json",
                        "Content-Type": "application/json",
                        "api-key": MURF_API_KEY
                    }
                    payload = {
                        "text": assistant_response,
                        "voiceId": voice_id,
                        "format": "MP3",
                        "sampleRate": 24000,
                        "channelType": "STEREO"
                    }
                    tts_response = requests.post(url, json=payload, headers=headers)
                    if tts_response.status_code == 200:
                        response_data = tts_response.json()
                        audio_url = response_data.get("audioFile") or response_data.get("audio_url")
                        if not audio_url:
                            tts_warning = "No audio URL in TTS response"
                    else:
                        tts_warning = f"TTS generation failed: {tts_response.text}"
                except Exception as e:
                    tts_warning = f"TTS generation failed: {str(e)}"
            else:
                tts_warning = "MURF_API_KEY not configured; returning text-only"

            # Return success response
            return {
                "session_id": session_id,
                "user_message": user_message,
                "assistant_response": assistant_response,
                "audio_url": audio_url,
                **({"tts_warning": tts_warning} if tts_warning else {}),
                **({"llm_warning": llm_warning} if 'llm_warning' in locals() and llm_warning else {}),
                "chat_history": chat_history_store[session_id],
                "message_count": len(chat_history_store[session_id])
            }

        finally:
            # Clean up temporary file
            try:
                os.unlink(temp_audio_path)
            except:
                pass

    except Exception as e:
        return JSONResponse(
            status_code=500, 
            content={"error": f"Processing failed: {str(e)}"}
        )

@app.get("/agent/chat/{session_id}/history")
async def get_chat_history(session_id: str):
    """Get chat history for a specific session"""
    if session_id not in chat_history_store:
        return {"session_id": session_id, "history": [], "message_count": 0}
    
    return {
        "session_id": session_id,
        "history": chat_history_store[session_id],
        "message_count": len(chat_history_store[session_id])
    }

@app.delete("/agent/chat/{session_id}")
async def clear_chat_history(session_id: str):
    """Clear chat history for a specific session"""
    if session_id in chat_history_store:
        del chat_history_store[session_id]
        return {"message": f"Chat history cleared for session {session_id}"}
    
    return {"message": f"No chat history found for session {session_id}"}
    


# (Removed duplicate /agent/chat/{session_id} endpoint with conflicting signature)








@app.post("/llm/query")
async def llm_query(request: Request, text: str = Form(None), audio: UploadFile = File(None), voice_id: str = Form("en-US-katie")):
    
    if not GEMINI_API_KEY:
        return JSONResponse(status_code=500, content={"error": "GEMINI API key not configured."})

    def murf_tts(text_to_speak, voice_id):
        if not MURF_API_KEY:
            raise RuntimeError("MURF API key not configured.")
        
        # Check if text exceeds Murf's 3000 character limit
        if len(text_to_speak) > 3000:
            print(f"Warning: Text exceeds Murf's 3000 character limit ({len(text_to_speak)} chars). Truncating...")
            text_to_speak = text_to_speak[:3000]
            
        murf_url = "https://api.murf.ai/v1/speech/generate"
        murf_headers = {"Accept": "application/json", "Content-Type": "application/json", "api-key": MURF_API_KEY}
        murf_payload = {
            "text": text_to_speak, 
            "voiceId": voice_id, 
            "format": "MP3", 
            "sampleRate": 24000,
            "channelType": "STEREO"
        }
        murf_response = requests.post(murf_url, json=murf_payload, headers=murf_headers)
        murf_response.raise_for_status()
        murf_audio_url = murf_response.json().get("audioFile")
        if not murf_audio_url:
            raise RuntimeError("No audioFile returned from Murf.")
        return murf_audio_url

    try:
        print(f"LLM Query received - Text: {text is not None}, Audio: {audio is not None}, Voice ID: {voice_id}")
        
        # Check for required API keys
        if not ASSEMBLYAI_API_KEY or not MURF_API_KEY or not GEMINI_API_KEY:
            return JSONResponse(status_code=500, content={"error": "One or more required API keys are not configured."})

        # Process audio input
        if audio is not None:
            print(f"Processing audio input: {audio.filename}, {audio.content_type}")
            
            # Read audio data
            audio_data = await audio.read()
            if len(audio_data) == 0:
                return JSONResponse(status_code=400, content={"error": "Empty audio file provided."})
            
            print(f"Audio data size: {len(audio_data)} bytes")
            
            # Transcribe using AssemblyAI (via temporary file)
            print("Transcribing audio with AssemblyAI...")
            temp_suffix = ".webm"
            if audio and audio.filename and "." in audio.filename:
                temp_suffix = os.path.splitext(audio.filename)[1]
            elif audio and audio.content_type:
                if "mp3" in audio.content_type:
                    temp_suffix = ".mp3"
                elif "wav" in audio.content_type:
                    temp_suffix = ".wav"
                elif "ogg" in audio.content_type:
                    temp_suffix = ".ogg"

            with tempfile.NamedTemporaryFile(delete=False, suffix=temp_suffix) as tmp:
                tmp.write(audio_data)
                tmp_path = tmp.name

            transcriber = aai.Transcriber()
            try:
                transcript = transcriber.transcribe(tmp_path)
            finally:
                try:
                    os.unlink(tmp_path)
                except Exception:
                    pass
            
            if transcript.status != 'completed':
                error_msg = f"Transcription failed. Status: {transcript.status}, Error: {transcript.error if hasattr(transcript, 'error') else 'Unknown'}"
                print(f"Transcription error: {error_msg}")
                return JSONResponse(status_code=500, content={"error": error_msg})
            
            transcribed_text = transcript.text
            if not transcribed_text:
                return JSONResponse(status_code=400, content={"error": "Transcription returned no text. Please speak clearly."})
            
            print(f"Transcription successful: '{transcribed_text}'")
            
            # Send to Gemini LLM
            print("Sending to Gemini LLM...")
            llm_response_text = None
            try:
                # Try using the Python client first
                model = genai.GenerativeModel('gemini-1.5-flash')
                llm_obj = model.generate_content(transcribed_text)
                llm_response_text = llm_obj.text
            except Exception as e:
                print(f"Gemini Python client failed: {e}, falling back to REST API")
                # Fallback to REST API
                try:
                    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key={GEMINI_API_KEY}"
                    payload = {"contents": [{"parts": [{"text": transcribed_text}]}]}
                    resp = requests.post(url, json=payload)
                    resp.raise_for_status()
                    resp_json = resp.json()
                    llm_response_text = resp_json["candidates"][0]["content"]["parts"][0]["text"]
                except Exception as e:
                    raise Exception(f"Failed to call Gemini API: {e}")

            if not llm_response_text:
                return JSONResponse(status_code=500, content={"error": "LLM returned empty response."})
            
            print(f"LLM response received: '{llm_response_text[:100]}...'")

            # Generate audio via Murf
            print(f"Generating audio with Murf using voice ID: {voice_id}")
            murf_audio_url = murf_tts(llm_response_text, voice_id)
            print(f"Murf audio URL: {murf_audio_url}")

            return JSONResponse(content={
                "transcription": transcribed_text,
                "llm_response": llm_response_text,
                "audio_url": murf_audio_url
            })

        # Process text input
        elif text is not None:
            print(f"Processing text input: '{text[:100]}...'")
            
            # Send to Gemini LLM
            url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key={GEMINI_API_KEY}"
            payload = {
                "contents": [
                    {
                        "parts": [
                            {
                                "text": text
                            }
                        ]
                    }
                ]
            }
            try:
                response = requests.post(url, json=payload)
                response.raise_for_status()
                response_data = response.json()
                llm_response = response_data["candidates"][0]["content"]["parts"][0]["text"]
                
                # Generate audio via Murf
                murf_audio_url = murf_tts(llm_response, voice_id)
                
                return JSONResponse(content={
                    "llm_response": llm_response, 
                    "audio_url": murf_audio_url
                })
            except requests.exceptions.RequestException as e:
                return JSONResponse(status_code=500, content={"error": "Failed to call the Gemini API.", "details": str(e)})
            except (KeyError, IndexError) as e:
                return JSONResponse(status_code=500, content={"error": "Failed to parse the Gemini API response.", "details": str(e)})
        else:
            return JSONResponse(status_code=400, content={"error": "No 'text' or 'audio' provided."})

    except Exception as e:
        print(f"LLM query error: {str(e)}")
        return JSONResponse(status_code=500, content={"error": f"LLM processing failed: {str(e)}"})
    finally:
        if audio is not None:
            try:
                await audio.close()
            except Exception:
                pass

@app.get("/test-audio")
async def generate_test_audio():
    """Generate a simple test audio file for transcription testing"""
    try:
        # Create a simple test audio using text-to-speech
        if not MURF_API_KEY:
            return JSONResponse(
                status_code=500, 
                content={"error": "MURF_API_KEY not configured for test audio generation"}
            )
        
        url = "https://api.murf.ai/v1/speech/generate"
        headers = {
            "Accept": "application/json",
            "Content-Type": "application/json",
            "api-key": MURF_API_KEY
        }
        
        payload = {
            "text": "Hello, this is a test audio file for transcription. The weather is nice today and I hope you are having a great day.",
            "voiceId": "en-US-natalie",
            "format": "MP3",
            "sampleRate": 24000,
            "channelType": "STEREO"
        }
        
        response = requests.post(url, json=payload, headers=headers)
        
        if response.status_code == 200:
            data = response.json()
            audio_url = data.get("audioFile") or data.get("audio_url")
            
            if audio_url:
                return JSONResponse(content={
                    "message": "Test audio generated successfully",
                    "audio_url": audio_url,
                    "text": payload["text"]
                })
            else:
                return JSONResponse(
                    status_code=500, 
                    content={"error": "No audio URL in response"}
                )
        else:
            return JSONResponse(
                status_code=500, 
                content={"error": f"TTS generation failed: {response.text}"}
            )
            
    except Exception as e:
        return JSONResponse(
            status_code=500, 
            content={"error": f"Test audio generation failed: {str(e)}"}
        )


if __name__ == "__main__":
    print("🚀 Starting AuraVox Echo Bot...")
    
    # Check API key configuration
    # murf_configured = check_api_key()
    # assemblyai_configured = check_assemblyai_api_key()
    
    # if not murf_configured:
    #     print("\n💡 You can still test the Echo Bot functionality without TTS!")
    #     print("   The voice recording and playback will work fine.")
    
    # if not assemblyai_configured:
    #     print("\n⚠️  Transcription feature will not work without AssemblyAI API key!")
    #     print("   Please set ASSEMBLYAI_API_KEY in your .env file.")

    print(f"📡 Server will be available at: http://127.0.0.1:8080")
    print("🌐 Use ngrok_tunnel.py to create a public URL")
    print("🎧 Echo Bot is ready to record, transcribe, and play back your voice!")

    uvicorn.run("main:app", host="127.0.0.1", port=8080, reload=True)




