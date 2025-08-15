
// === Voice Echo Bot Setup ===
let mediaRecorder;
let recordedChunks = [];
let audioStream = null;
let currentEchoMode = 'v1'; // Track current echo mode
let echoPlayer; // Global variable for audio player

// === LLM Voice Agent Setup ===
let llmMediaRecorder;
let llmRecordedChunks = [];
let llmAudioStream = null;
let llmAudioContext;
let llmAnalyser;
let llmVisualizationActive = false;
let llmVisualizationAnimationFrame;

// Wait for DOM to be fully loaded before accessing elements
document.addEventListener('DOMContentLoaded', function() {
  // Theme toggle
  const themeBtn = document.getElementById('themeToggle');
  try {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) document.body.setAttribute('data-theme', savedTheme);
  } catch (e) {}
  if (themeBtn) {
    themeBtn.addEventListener('click', () => {
      const current = document.body.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
      const next = current === 'dark' ? 'light' : 'dark';
      document.body.setAttribute('data-theme', next);
      try { localStorage.setItem('theme', next); } catch (e) {}
    });
  }

  // Tabs
  const tabButtons = Array.from(document.querySelectorAll('.tab-button'));
  const tabPanels = Array.from(document.querySelectorAll('.tab-panel'));
  function activateTab(targetId) {
    tabButtons.forEach(btn => btn.classList.toggle('active', btn.dataset.target === targetId));
    tabPanels.forEach(panel => panel.classList.toggle('active', panel.id === targetId));
  }
  tabButtons.forEach(btn => btn.addEventListener('click', () => activateTab(btn.dataset.target)));

  // Display current session ID
  const sessionIdDisplay = document.getElementById('session-id-display');
  if (sessionIdDisplay) {
    sessionIdDisplay.textContent = currentSessionId;
  }
  
  // Handle session management buttons
  const clearChatBtn = document.getElementById('clear-chat-btn');
  const newSessionBtn = document.getElementById('new-session-btn');
  
  if (clearChatBtn) {
    clearChatBtn.addEventListener('click', async () => {
      if (confirm('Are you sure you want to clear the chat history for this session?')) {
        try {
          const response = await fetch(`/agent/chat/${currentSessionId}`, {
            method: 'DELETE'
          });
          const result = await response.json();
          alert(result.message);
          
          // Clear UI elements
          const llmTranscriptionResult = document.getElementById('llm-transcription-result');
          const llmResponseText = document.getElementById('llm-response-text');
          const llmAudioPlayer = document.getElementById('llm-audio-player');
          
          if (llmTranscriptionResult) llmTranscriptionResult.textContent = '';
          if (llmResponseText) llmResponseText.textContent = '';
          if (llmAudioPlayer) llmAudioPlayer.src = '';
          
          // Refresh chat history display
          updateChatHistory();
          
        } catch (error) {
          console.error('Error clearing chat:', error);
          alert('Error clearing chat history');
        }
      }
    });
  }
  
  if (newSessionBtn) {
    newSessionBtn.addEventListener('click', () => {
      // Generate new session ID
      const newSessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      
      // Update URL
      const newUrl = new URL(window.location);
      newUrl.searchParams.set('session', newSessionId);
      window.history.replaceState({}, '', newUrl);
      
      // Update current session ID
      currentSessionId = newSessionId;
      
      // Update display
      if (sessionIdDisplay) {
        sessionIdDisplay.textContent = currentSessionId;
      }
      
      // Clear UI elements
      const llmTranscriptionResult = document.getElementById('llm-transcription-result');
      const llmResponseText = document.getElementById('llm-response-text');
      const llmAudioPlayer = document.getElementById('llm-audio-player');
      
      if (llmTranscriptionResult) llmTranscriptionResult.textContent = '';
      if (llmResponseText) llmResponseText.textContent = '';
      if (llmAudioPlayer) llmAudioPlayer.src = '';
      
      // Refresh chat history display
      updateChatHistory();
      
      alert('New session created: ' + currentSessionId);
    });
  }
  
  // Load chat history on page load
  async function loadChatHistory() {
    try {
      const response = await fetch(`/agent/chat/${currentSessionId}/history`);
      const result = await response.json();
      
      const chatHistoryContainer = document.getElementById('llm-chat-history-content');
      if (chatHistoryContainer) {
        chatHistoryContainer.innerHTML = '';
        
        if (result.message_count > 0) {
          console.log(`Loaded ${result.message_count} messages from chat history`);
          
          result.history.forEach((message, index) => {
            const messageDiv = document.createElement('div');
            messageDiv.style.marginBottom = '10px';
            messageDiv.style.padding = '8px';
            messageDiv.style.borderRadius = '4px';
            messageDiv.style.backgroundColor = message.role === 'user' ? '#e3f2fd' : '#e8f5e9';
            messageDiv.style.borderLeft = message.role === 'user' ? '4px solid #2196F3' : '4px solid #4CAF50';
            
            const roleSpan = document.createElement('span');
            roleSpan.style.fontWeight = 'bold';
            roleSpan.textContent = message.role === 'user' ? 'You: ' : 'AI: ';
            
            const contentSpan = document.createElement('span');
            contentSpan.textContent = message.content;
            
            messageDiv.appendChild(roleSpan);
            messageDiv.appendChild(contentSpan);
            chatHistoryContainer.appendChild(messageDiv);
          });
        } else {
          chatHistoryContainer.textContent = 'No chat history yet. Start a conversation!';
        }
      }
    } catch (error) {
      console.error('Error loading chat history:', error);
    }
  }
  
  // Load chat history when page loads
  loadChatHistory();
  
  // Also update chat history after each response
  async function updateChatHistory() {
    try {
      const response = await fetch(`/agent/chat/${currentSessionId}/history`);
      const result = await response.json();
      
      const chatHistoryContainer = document.getElementById('llm-chat-history-content');
      if (chatHistoryContainer) {
        chatHistoryContainer.innerHTML = '';
        
        if (result.message_count > 0) {
          result.history.forEach((message, index) => {
            const messageDiv = document.createElement('div');
            messageDiv.style.marginBottom = '10px';
            messageDiv.style.padding = '8px';
            messageDiv.style.borderRadius = '4px';
            messageDiv.style.backgroundColor = message.role === 'user' ? '#e3f2fd' : '#e8f5e9';
            messageDiv.style.borderLeft = message.role === 'user' ? '4px solid #2196F3' : '4px solid #4CAF50';
            
            const roleSpan = document.createElement('span');
            roleSpan.style.fontWeight = 'bold';
            roleSpan.textContent = message.role === 'user' ? 'You: ' : 'AI: ';
            
            const contentSpan = document.createElement('span');
            contentSpan.textContent = message.content;
            
            messageDiv.appendChild(roleSpan);
            messageDiv.appendChild(contentSpan);
            chatHistoryContainer.appendChild(messageDiv);
          });
        }
      }
    } catch (error) {
      console.error('Error updating chat history:', error);
    }
  }
  // Expose globally so other handlers outside this scope can call it
  window.updateChatHistory = updateChatHistory;
  console.log('DOM loaded, initializing Echo Bot...');
  
  const startBtn = document.getElementById("startBtn");
  const stopBtn = document.getElementById("stopBtn");
  echoPlayer = document.getElementById("echoPlayer"); // Assign to global variable
  const fileNameInputArea = document.getElementById('fileNameInputArea');
  const fileNameInput = document.getElementById('fileNameInput');
  const uploadBtn = document.getElementById('uploadBtn');
  const uploadStatus = document.getElementById('uploadStatus');
  const playBtn = document.getElementById('playBtn');
  const stopBtnCustom = document.getElementById('stopBtnCustom');
  const deviceSelect = document.getElementById('audioDeviceSelect');


// New LLM Bot elements
  const llmStartRecordingBtn = document.getElementById('llm-start-recording-btn');
  const llmStopRecordingBtn = document.getElementById('llm-stop-recording-btn');
  const llmRecordingStatus = document.getElementById('llm-recording-status');
// Removed unused llmLoadingIndicator declaration
  const llmTranscriptionResult = document.getElementById('llm-transcription-result');
  const llmTranscriptionContainer = document.getElementById('llm-transcription-container');
  const llmResponseContainer = document.getElementById('llm-response-container');
  const llmResponseText = document.getElementById('llm-response-text');
  const llmAudioContainer = document.getElementById('llm-audio-container');
  const llmAudioPlayer = document.getElementById('llm-audio-player');
  const llmVoiceSelector = document.getElementById('llmVoiceSelector');

  console.log('LLM elements found:', {
    llmStartRecordingBtn: !!llmStartRecordingBtn,
    llmStopRecordingBtn: !!llmStopRecordingBtn,
    llmAudioPlayer: !!llmAudioPlayer,
    llmVoiceSelector: !!llmVoiceSelector
  });

  // LLM Voice Agent functionality
  if (llmStartRecordingBtn && llmStopRecordingBtn && llmAudioPlayer) {
    // Start recording button for LLM
    llmStartRecordingBtn.addEventListener("click", async () => {
      console.log('LLM Start recording clicked');
      try {
        showLLMStatus("🎙️ Requesting microphone access...");
        let selectedDeviceId = deviceSelect ? deviceSelect.value : '';
        
        const constraints = {
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            sampleRate: 44100,
            autoGainControl: true,
            ...(selectedDeviceId && { deviceId: { exact: selectedDeviceId } })
          }
        };
        
        console.log('Getting user media with constraints for LLM:', constraints);
        llmAudioStream = await navigator.mediaDevices.getUserMedia(constraints);
        
        const audioTrack = llmAudioStream.getAudioTracks()[0];
        if (!audioTrack) {
          showLLMStatus("❌ No audio track available!", true);
          return;
        }
        
        console.log('LLM Audio track settings:', audioTrack.getSettings());
        
        showLLMStatus("✅ Microphone access granted!");
        showLLMStatus(`🎤 Recording your question...`);
        
        // Reset recording
        llmRecordedChunks = [];
        
        // Setup audio visualization
        setupLLMAudioVisualization(llmAudioStream);
        
        // Try different MIME types for better compatibility
        let mimeType = 'audio/webm;codecs=opus';
        if (!MediaRecorder.isTypeSupported(mimeType)) {
          mimeType = 'audio/webm';
        }
        if (!MediaRecorder.isTypeSupported(mimeType)) {
          mimeType = 'audio/mp4';
        }
        
        console.log('Using MIME type for LLM:', mimeType);
        
        llmMediaRecorder = new MediaRecorder(llmAudioStream, {
          mimeType: mimeType
        });
        
        // Show visualization container
        const visualizationContainer = document.getElementById('llm-visualization-container');
        if (visualizationContainer) {
          visualizationContainer.style.display = 'block';
        }

        llmMediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            llmRecordedChunks.push(event.data);
            console.log(`📊 LLM Recording chunk: ${event.data.size} bytes`);
          }
        };

        llmMediaRecorder.onstop = async () => {
          console.log('LLM Recording stopped, processing...');
          showLLMStatus("🎵 Processing your question...");
          
          // Stop audio visualization
          stopLLMAudioVisualization();
          
          // Hide visualization container
          const visualizationContainer = document.getElementById('llm-visualization-container');
          if (visualizationContainer) {
            visualizationContainer.style.display = 'none';
          }
          
          if (llmRecordedChunks.length === 0) {
            showLLMStatus("❌ No audio data recorded!", true);
            return;
          }
          
          const totalSize = llmRecordedChunks.reduce((sum, chunk) => sum + chunk.size, 0);
          console.log(`Total LLM recorded data: ${totalSize} bytes`);
          
          const blob = new Blob(llmRecordedChunks, { type: mimeType });
          
          // Process the recording with LLM
          await processLLMQuery(blob, mimeType);
          
          // Clean up stream
          if (llmAudioStream) {
            llmAudioStream.getTracks().forEach(track => {
              console.log('Stopping LLM track:', track.label);
              track.stop();
            });
            llmAudioStream = null;
          }
        };

        llmMediaRecorder.onerror = (event) => {
          console.error('LLM MediaRecorder error:', event.error);
          showLLMStatus("❌ Recording error: " + event.error, true);
        };

        // Start recording
        llmMediaRecorder.start(500);
        llmStartRecordingBtn.disabled = true;
        llmStopRecordingBtn.disabled = false;
        showLLMStatus("🎙️ Recording started! Ask your question...");
        
      } catch (error) {
        console.error("LLM Microphone access error:", error);
        
        if (error.name === 'NotAllowedError') {
          showLLMStatus("❌ Microphone access denied! Please allow microphone access in your browser.", true);
        } else if (error.name === 'NotFoundError') {
          showLLMStatus("❌ No microphone found! Please check your device connection.", true);
        } else if (error.name === 'NotReadableError') {
          showLLMStatus("❌ Microphone is busy! Please close other applications using the microphone.", true);
        } else {
          showLLMStatus("❌ Failed to access microphone: " + error.message, true);
        }
      }
    });

    // Stop recording button for LLM
    llmStopRecordingBtn.addEventListener("click", () => {
      console.log('LLM Stop recording clicked');
      if (llmMediaRecorder && llmMediaRecorder.state !== 'inactive') {
        showLLMStatus("⏹️ Stopping recording...");
        llmMediaRecorder.stop();
        llmStartRecordingBtn.disabled = false;
        llmStopRecordingBtn.disabled = true;
      } else {
        showLLMStatus("❌ No active recording to stop!", true);
      }
    });
  }



  // Echo Bot mode toggle elements
  const echoV1Radio = document.getElementById('echoV1');
  const echoV2Radio = document.getElementById('echoV2');
  const echoVoiceSelection = document.getElementById('echoVoiceSelection');
  const echoVoiceSelector = document.getElementById('echoVoiceSelector');

  console.log('Elements found:', {
    startBtn: !!startBtn,
    stopBtn: !!stopBtn,
    echoPlayer: !!echoPlayer,
    playBtn: !!playBtn,
    stopBtnCustom: !!stopBtnCustom,
    deviceSelect: !!deviceSelect,
    echoV1Radio: !!echoV1Radio,
    echoV2Radio: !!echoV2Radio
  });

  if (!startBtn || !stopBtn || !echoPlayer) {
    console.error('Required elements not found!');
    return;
  }

  // Handle Echo Bot mode toggle
  if (echoV1Radio && echoV2Radio) {
    echoV1Radio.addEventListener('change', function() {
      if (this.checked) {
        currentEchoMode = 'v1';
        echoVoiceSelection.style.display = 'none';
        console.log('Echo Bot mode switched to V1 (Original Playback)');
      }
    });

    echoV2Radio.addEventListener('change', function() {
      if (this.checked) {
        currentEchoMode = 'v2';
        echoVoiceSelection.style.display = 'block';
        console.log('Echo Bot mode switched to V2 (Murf Voice Echo)');
      }
    });
  }

  // Play button functionality
  if (playBtn) {
    playBtn.addEventListener('click', () => {
      console.log('Play button clicked');
      if (echoPlayer.src) {
        echoPlayer.play();
      }
    });
  }

  // Stop button functionality
  if (stopBtnCustom) {
    stopBtnCustom.addEventListener('click', () => {
      console.log('Stop button clicked');
      echoPlayer.pause();
      echoPlayer.currentTime = 0;
    });
  }

  // Audio player event listeners
  echoPlayer.addEventListener('ended', () => {
    console.log('Audio playback ended');
  });

  // Initialize device selector
  populateDeviceSelector();

  // Start recording button
  startBtn.addEventListener("click", async () => {
    console.log('Start recording clicked');
    try {
      showStatus("🎙️ Requesting microphone access...");
      let selectedDeviceId = deviceSelect ? deviceSelect.value : '';
      
      const constraints = {
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100,
          autoGainControl: true,
          ...(selectedDeviceId && { deviceId: { exact: selectedDeviceId } })
        }
      };
      
      console.log('Getting user media with constraints:', constraints);
      audioStream = await navigator.mediaDevices.getUserMedia(constraints);
      
      const audioTrack = audioStream.getAudioTracks()[0];
      if (!audioTrack) {
        showStatus("❌ No audio track available!", true);
        return;
      }
      
      console.log('Audio track settings:', audioTrack.getSettings());
      console.log('Audio track enabled:', audioTrack.enabled);
      
      showStatus("✅ Microphone access granted!");
      showStatus(`🎤 Using: ${audioTrack.label || 'Default microphone'}`);
      
      // Reset recording
      recordedChunks = [];
      
      // Try different MIME types for better compatibility
      let mimeType = 'audio/webm;codecs=opus';
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        mimeType = 'audio/webm';
      }
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        mimeType = 'audio/mp4';
      }
      
      console.log('Using MIME type:', mimeType);
      
      mediaRecorder = new MediaRecorder(audioStream, {
        mimeType: mimeType
      });

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          recordedChunks.push(event.data);
          console.log(`📊 Recording chunk: ${event.data.size} bytes`);
          showStatus(`📊 Recording... (${recordedChunks.length} chunks, ${event.data.size} bytes)`);
        }
      };

      mediaRecorder.onstop = async () => {
        console.log('Recording stopped, processing...');
        showStatus("🎵 Processing recording...");
        if (recordedChunks.length === 0) {
          showStatus("❌ No audio data recorded!", true);
          return;
        }
        const totalSize = recordedChunks.reduce((sum, chunk) => sum + chunk.size, 0);
        console.log(`Total recorded data: ${totalSize} bytes`);
        const blob = new Blob(recordedChunks, { type: mimeType });
        
        console.log(`Current Echo Bot mode: ${currentEchoMode}`);
        
        // Process based on Echo Bot mode
        if (currentEchoMode === 'v1') {
          // V1: Original playback
          await processEchoV1(blob, mimeType);
        } else {
          // V2: Murf voice echo
          await processEchoV2(blob, mimeType);
        }
        
        // Clean up stream
        if (audioStream) {
          audioStream.getTracks().forEach(track => {
            console.log('Stopping track:', track.label);
            track.stop();
          });
          audioStream = null;
        }
      };

      mediaRecorder.onerror = (event) => {
        console.error('MediaRecorder error:', event.error);
        showStatus("❌ Recording error: " + event.error, true);
      };

      // Start recording
      mediaRecorder.start(500);
      startBtn.disabled = true;
      stopBtn.disabled = false;
      showStatus("🎙️ Recording started! Speak now...");
      
    } catch (error) {
      console.error("Microphone access error:", error);
      
      if (error.name === 'NotAllowedError') {
        showStatus("❌ Microphone access denied! Please allow microphone access in your browser.", true);
      } else if (error.name === 'NotFoundError') {
        showStatus("❌ No microphone found! Please check your Bluetooth device connection.", true);
      } else if (error.name === 'NotReadableError') {
        showStatus("❌ Microphone is busy! Please close other applications using the microphone.", true);
      } else {
        showStatus("❌ Failed to access microphone: " + error.message, true);
      }
    }
  });

  // Stop recording button
  stopBtn.addEventListener("click", () => {
    console.log('Stop recording clicked');
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
      showStatus("⏹️ Stopping recording...");
      mediaRecorder.stop();
      startBtn.disabled = false;
      stopBtn.disabled = true;
    } else {
      showStatus("❌ No active recording to stop!", true);
    }
  });
});

// Add status display
function showStatus(message, isError = false) {
  console.log(message);
  
  const statusDiv = document.getElementById('recordingStatus');
  const statusText = document.getElementById('statusText');
  
  if (statusDiv && statusText) {
    statusDiv.style.display = 'block';
    statusText.textContent = message;
    
    if (isError) {
      statusDiv.style.background = '#ffebee';
      statusDiv.style.color = '#c62828';
    } else {
      statusDiv.style.background = '#e8f5e8';
      statusDiv.style.color = '#2e7d32';
    }
  }
  
  // Also show alerts for errors
  if (isError) {
    alert("Recording Error: " + message);
  }
}

function showUploadStatus(message, isError = false) {
  const uploadStatus = document.getElementById('uploadStatus');
  if (uploadStatus) {
    uploadStatus.textContent = message;
    uploadStatus.style.color = isError ? '#c62828' : '#007bff';
  }
}

// Function to get available audio devices
async function getAudioDevices() {
  try {
    const devices = await navigator.mediaDevices.enumerateDevices();
    return devices.filter(device => device.kind === 'audioinput');
  } catch (error) {
    console.error('Error getting audio devices:', error);
    return [];
  }
}

// Function to populate device selector
async function populateDeviceSelector() {
  const deviceSelect = document.getElementById('audioDeviceSelect');
  if (!deviceSelect) return;
  
  try {
    // Request permission first to get device labels
    await navigator.mediaDevices.getUserMedia({ audio: true });
    
    const devices = await navigator.mediaDevices.enumerateDevices();
    const audioDevices = devices.filter(device => device.kind === 'audioinput');
    
    deviceSelect.innerHTML = '';
    
    // Add default option
    const defaultOption = document.createElement('option');
    defaultOption.value = '';
    defaultOption.textContent = '🔊 Default Microphone';
    deviceSelect.appendChild(defaultOption);
    
    // Add each device
    audioDevices.forEach(device => {
      const option = document.createElement('option');
      option.value = device.deviceId;
      option.textContent = `🎤 ${device.label || `Device ${device.deviceId.slice(0, 8)}...`}`;
      deviceSelect.appendChild(option);
    });
    
    console.log('Available audio devices:', audioDevices);
    
  } catch (error) {
    console.error('Error populating device selector:', error);
    deviceSelect.innerHTML = '<option value="">❌ No devices available</option>';
  }
}

// Function to select audio device
async function selectAudioDevice(deviceId = null) {
  const constraints = {
    audio: {
      echoCancellation: true,
      noiseSuppression: true,
      sampleRate: 44100,
      autoGainControl: true
    }
  };
  
  // If specific device is selected, use it
  if (deviceId) {
    constraints.audio.deviceId = { exact: deviceId };
  }
  
  return constraints;
}

// === Voice Selector Setup ===
const fallbackVoices = [
  { displayName: 'Natalie (Female)', voiceId: 'en-US-natalie' },
  { displayName: 'Aria (Female)', voiceId: 'en-US-aria' },
  { displayName: 'Guy (Male)', voiceId: 'en-US-guy' },
  { displayName: 'Davis (Male)', voiceId: 'en-US-davis' },
  { displayName: 'Sara (Female)', voiceId: 'en-US-sara' }
];

function populateVoiceSelector(voices) {
  const voiceSelector = document.getElementById('voiceSelector');
  const echoVoiceSelector = document.getElementById('echoVoiceSelector');
  const llmVoiceSelector = document.getElementById('llmVoiceSelector');
  
  if (voiceSelector) {
    voiceSelector.innerHTML = '';
    voices.forEach(voice => {
      const option = new Option(voice.displayName, voice.voiceId);
      voiceSelector.add(option);
    });
  }
  
  // Also populate echo voice selector
  if (echoVoiceSelector) {
    echoVoiceSelector.innerHTML = '';
    voices.forEach(voice => {
      const option = new Option(voice.displayName, voice.voiceId);
      echoVoiceSelector.add(option);
    });
  }
  
  // Also populate LLM voice selector
  if (llmVoiceSelector) {
    llmVoiceSelector.innerHTML = '';
    voices.forEach(voice => {
      const option = new Option(voice.displayName, voice.voiceId);
      llmVoiceSelector.add(option);
    });
  }
}

document.addEventListener('DOMContentLoaded', function() {
  const ttsForm = document.querySelector('.tts-section form');
  if (ttsForm) {
    ttsForm.addEventListener('submit', function(e) {
      e.preventDefault();
      generateTTS();
    });
  }
});

document.addEventListener('DOMContentLoaded', async () => {
  const btn = document.getElementById('generateBtn');
  if(btn) {
    btn.addEventListener("click", () => {
      console.log("Generate button clicked");
    });
  }
  
  // Initialize device selector
  await populateDeviceSelector();
  
  // Add refresh devices button functionality
  const refreshBtn = document.getElementById('refreshDevices');
  if (refreshBtn) {
    refreshBtn.addEventListener('click', async () => {
      showStatus("🔄 Refreshing devices...");
      await populateDeviceSelector();
      showStatus("✅ Devices refreshed!");
    });
  }
  
  try {
    const response = await fetch('/voices');
    if (!response.ok) throw new Error('API response was not ok.');

    const data = await response.json();
    if (data && data.length > 0) {
      populateVoiceSelector(data);
    } else {
      populateVoiceSelector(fallbackVoices);
    }
  } catch (error) {
    console.error("Failed to fetch voices from API, using fallback list.", error);
    populateVoiceSelector(fallbackVoices);
  }
});

async function generateTTS() {
  console.log("GenerateTTS() called");
  const text = document.getElementById('textInput').value;
  const voiceId = document.getElementById('voiceSelector').value;
  const button = document.getElementById('generateBtn');
  const errorDisplay = document.getElementById('errorDisplay');
  const audioPlayer = document.getElementById('audioPlayer');

  errorDisplay.textContent = '';
  audioPlayer.hidden = true;

  button.disabled = true;
  button.textContent = 'Generating...';

  const formData = new FormData();
  formData.append('text', text);
  formData.append('voiceId', voiceId);

  try {
    const response = await fetch('/tts', {
      method: 'POST',
      body: formData
    });

    const data = await response.json();

    if (response.ok && data.audio_url) {
      audioPlayer.src = data.audio_url;
      audioPlayer.hidden = false;
      audioPlayer.play();
    } else {
      errorDisplay.textContent = `Error: ${data.error || 'TTS generation failed.'}`;
      console.error(data);
    }
  } catch (err) {
    errorDisplay.textContent = 'An unexpected error occurred. Please try again.';
    console.error(err);
  } finally {
    button.disabled = false;
    button.textContent = 'Generate Voice';
  }
}

// === File Upload for Transcription ===
document.addEventListener('DOMContentLoaded', function() {
  const audioFileInput = document.getElementById('audioFileInput');
  const transcribeFileBtn = document.getElementById('transcribeFileBtn');
  const fileTranscriptionStatus = document.getElementById('fileTranscriptionStatus');

  if (transcribeFileBtn) {
    transcribeFileBtn.addEventListener('click', async () => {
      const file = audioFileInput.files[0];
      
      if (!file) {
        fileTranscriptionStatus.textContent = '❌ Please select an audio file first.';
        fileTranscriptionStatus.style.color = '#dc3545';
        return;
      }

      // Check file type
      if (!file.type.startsWith('audio/')) {
        fileTranscriptionStatus.textContent = '❌ Please select an audio file.';
        fileTranscriptionStatus.style.color = '#dc3545';
        return;
      }

      // Show loading state
      transcribeFileBtn.disabled = true;
      transcribeFileBtn.textContent = 'Transcribing...';
      fileTranscriptionStatus.textContent = '📤 Uploading and transcribing...';
      fileTranscriptionStatus.style.color = '#007bff';

      try {
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch('/transcribe/file', {
          method: 'POST',
          body: formData
        });

        const data = await response.json();

        if (response.ok && data.transcript) {
          fileTranscriptionStatus.textContent = '✅ Transcription successful!';
          fileTranscriptionStatus.style.color = '#28a745';
          
          // Update the main transcription display
          document.getElementById('transcriptionText').innerText = data.transcript;
          
          console.log('Transcription result:', data.transcript);
        } else {
          fileTranscriptionStatus.textContent = `❌ Transcription failed: ${data.error || 'Unknown error'}`;
          fileTranscriptionStatus.style.color = '#dc3545';
          console.error('Transcription error:', data);
        }
      } catch (err) {
        fileTranscriptionStatus.textContent = `❌ Error: ${err.message}`;
        fileTranscriptionStatus.style.color = '#dc3545';
        console.error('Upload error:', err);
      } finally {
        transcribeFileBtn.disabled = false;
        transcribeFileBtn.textContent = 'Transcribe File';
      }
    });
  }
});

// === Test Audio Generation and Transcription ===
document.addEventListener('DOMContentLoaded', function() {
  const generateTestAudioBtn = document.getElementById('generateTestAudioBtn');
  const testTranscriptionBtn = document.getElementById('testTranscriptionBtn');
  const testStatus = document.getElementById('testStatus');

  if (generateTestAudioBtn) {
    generateTestAudioBtn.addEventListener('click', async () => {
      testStatus.textContent = '🔄 Generating test audio...';
      testStatus.style.color = '#007bff';
      generateTestAudioBtn.disabled = true;

      try {
        const response = await fetch('/test-audio');
        const data = await response.json();

        if (response.ok && data.audio_url) {
          testStatus.textContent = '✅ Test audio generated! Click "Test Transcription" to transcribe it.';
          testStatus.style.color = '#28a745';
          
          // Store the test audio URL for transcription testing
          window.testAudioUrl = data.audio_url;
          window.testAudioText = data.text;
          
          console.log('Test audio generated:', data);
        } else {
          testStatus.textContent = `❌ Failed to generate test audio: ${data.error}`;
          testStatus.style.color = '#dc3545';
        }
      } catch (err) {
        testStatus.textContent = `❌ Error: ${err.message}`;
        testStatus.style.color = '#dc3545';
      } finally {
        generateTestAudioBtn.disabled = false;
      }
    });
  }

  if (testTranscriptionBtn) {
    testTranscriptionBtn.addEventListener('click', async () => {
      if (!window.testAudioUrl) {
        testStatus.textContent = '❌ Please generate test audio first!';
        testStatus.style.color = '#dc3545';
        return;
      }

      testStatus.textContent = '🔄 Downloading and transcribing test audio...';
      testStatus.style.color = '#007bff';
      testTranscriptionBtn.disabled = true;

      try {
        // Download the test audio file
        const audioResponse = await fetch(window.testAudioUrl);
        const audioBlob = await audioResponse.blob();
        
        // Create a file from the blob
        const testFile = new File([audioBlob], 'test_audio.mp3', { type: 'audio/mp3' });
        
        // Transcribe the file
        const formData = new FormData();
        formData.append('file', testFile);

        const response = await fetch('/transcribe/file', {
          method: 'POST',
          body: formData
        });

        const data = await response.json();

        if (response.ok && data.transcript) {
          testStatus.textContent = `✅ Transcription successful! Expected: "${window.testAudioText}" | Got: "${data.transcript}"`;
          testStatus.style.color = '#28a745';
          
          // Update the main transcription display
          document.getElementById('transcriptionText').innerText = data.transcript;
          
          console.log('Test transcription result:', data.transcript);
        } else {
          testStatus.textContent = `❌ Transcription failed: ${data.error}`;
          testStatus.style.color = '#dc3545';
        }
      } catch (err) {
        testStatus.textContent = `❌ Error: ${err.message}`;
        testStatus.style.color = '#dc3545';
      } finally {
        testTranscriptionBtn.disabled = false;
      }
    });
  }
});

// Process Echo Bot V1 (Original playback)
async function processEchoV1(blob, mimeType) {
  console.log('Processing Echo Bot V1 (Original Playback)');
  
  const url = URL.createObjectURL(blob);
  echoPlayer.src = url;
  echoPlayer.load();
  echoPlayer.volume = 1;
  showStatus(`✅ Recording complete! Playing back original audio...`);
  
  echoPlayer.onloadedmetadata = () => {
    console.log('Audio duration:', echoPlayer.duration);
    showStatus(`🎵 Original audio loaded (${echoPlayer.duration.toFixed(1)}s)`);
  };
  
  echoPlayer.onerror = (error) => {
    console.error('Audio playback error:', error);
    showStatus("❌ Error playing audio!", true);
  };
  
  echoPlayer.play().catch(err => {
    console.error('Playback error:', err);
    showStatus("❌ Error playing audio: " + err.message, true);
  });

  // Also transcribe for display
  showStatus("📤 Uploading for transcription...");
  const formData = new FormData();
  formData.append("file", blob, "recording.webm");

  try {
    const response = await fetch("/transcribe/file", {
      method: "POST",
      body: formData,
    });

    const data = await response.json();

    if (response.ok && data.transcript) {
      showStatus("✅ Transcription complete!");
      document.getElementById("transcriptionText").innerText = data.transcript;
    } else {
      showStatus("❌ Transcription failed!", true);
      document.getElementById("transcriptionText").innerText = data.error || "Transcription failed!";
    }
  } catch (err) {
    showStatus("⚠️ Error during transcription!", true);
    console.error(err);
    document.getElementById("transcriptionText").innerText = "Transcription error.";
  }

  // Show file name input area for upload
  showUploadOptions(blob, mimeType);
}

// Process Echo Bot V2 (Murf voice echo)
async function processEchoV2(blob, mimeType) {
  console.log('Processing Echo Bot V2 (Murf Voice Echo)');
  console.log('Blob size:', blob.size, 'bytes');
  console.log('MIME type:', mimeType);
  
  const selectedVoice = document.getElementById('echoVoiceSelector') ? 
    document.getElementById('echoVoiceSelector').value : 'en-US-natalie';
  
  console.log('Selected voice:', selectedVoice);
  
  showStatus("🔄 Processing with Echo Bot V2...");
  showStatus("📤 Uploading for transcription and TTS generation...");
  
  const formData = new FormData();
  formData.append("file", blob, "recording.webm");
  formData.append("voiceId", selectedVoice);

  console.log('Sending request to /tts/echo...');
  console.log('FormData contents:');
  for (let [key, value] of formData.entries()) {
    console.log(`${key}:`, value);
  }

  try {
    const response = await fetch("/tts/echo", {
      method: "POST",
      body: formData,
    });

    console.log('Response status:', response.status);
    console.log('Response headers:', response.headers);

    const data = await response.json();
    console.log('Response data:', data);

    if (response.ok && data.audio_url) {
      showStatus("✅ Echo Bot V2 processing complete!");
      showStatus(`🎤 Voice used: ${data.voice_used}`);
      
      // Update transcription display
      if (data.transcription) {
        document.getElementById("transcriptionText").innerText = data.transcription;
        console.log('Transcription:', data.transcription);
      }
      
      // Set the new audio URL and play it
      console.log('Setting audio URL:', data.audio_url);
      echoPlayer.src = data.audio_url;
      echoPlayer.load();
      echoPlayer.volume = 1;
      
      echoPlayer.onloadedmetadata = () => {
        console.log('Echo audio duration:', echoPlayer.duration);
        showStatus(`🎵 Murf voice echo ready (${echoPlayer.duration.toFixed(1)}s)`);
      };
      
      echoPlayer.onerror = (error) => {
        console.error('Echo audio playback error:', error);
        showStatus("❌ Error playing echo audio!", true);
      };
      
      echoPlayer.play().catch(err => {
        console.error('Echo playback error:', err);
        showStatus("❌ Error playing echo audio: " + err.message, true);
      });
      
    } else {
      console.error('Echo Bot V2 failed:', data);
      showStatus("❌ Echo Bot V2 processing failed!", true);
      document.getElementById("transcriptionText").innerText = data.error || "Echo Bot processing failed!";
    }
  } catch (err) {
    console.error('Echo Bot V2 error:', err);
    showStatus("⚠️ Error during Echo Bot V2 processing!", true);
    document.getElementById("transcriptionText").innerText = "Echo Bot processing error.";
  }

  // Show file name input area for upload (original recording)
  showUploadOptions(blob, mimeType);
}

 // Helper functions for LLM Voice Agent
function showLLMStatus(message, isError = false) {
  const llmRecordingStatus = document.getElementById('llm-recording-status');
  if (!llmRecordingStatus) return;
  
  llmRecordingStatus.textContent = message;
  if (isError) {
    llmRecordingStatus.style.color = '#c62828';
  } else {
    llmRecordingStatus.style.color = '#2e7d32';
  }
  console.log(`LLM Status: ${message}${isError ? ' (ERROR)' : ''}`);
}

// Get session ID from URL parameter or generate new one
function getSessionId() {
  const urlParams = new URLSearchParams(window.location.search);
  let sessionId = urlParams.get('session');
  
  if (!sessionId) {
    // Generate new session ID
    sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    
    // Update URL without page reload
    const newUrl = new URL(window.location);
    newUrl.searchParams.set('session', sessionId);
    window.history.replaceState({}, '', newUrl);
  }
  
  return sessionId;
}

// Store session ID globally
let currentSessionId = getSessionId();

async function processLLMQuery(audioBlob, mimeType) {
  const llmLoadingIndicator = document.getElementById('llm-loading-indicator');
  const llmTranscriptionResult = document.getElementById('llm-transcription-result');
  const llmTranscriptionContainer = document.getElementById('llm-transcription-container');
  const llmResponseText = document.getElementById('llm-response-text');
  const llmResponseContainer = document.getElementById('llm-response-container');
  const llmAudioPlayer = document.getElementById('llm-audio-player');
  const llmAudioContainer = document.getElementById('llm-audio-container');
  const llmVoiceSelector = document.getElementById('llmVoiceSelector');
  
  try {
    // Show loading indicator
    if (llmLoadingIndicator) {
      llmLoadingIndicator.style.display = 'block';
    }
    
    // Clear previous results
    if (llmTranscriptionResult) {
      llmTranscriptionResult.textContent = '';
    }
    if (llmResponseText) {
      llmResponseText.textContent = '';
    }
    if (llmAudioPlayer) {
      llmAudioPlayer.src = '';
      if (llmAudioContainer) llmAudioContainer.style.display = 'none';
    }
    
    showLLMStatus("🔄 Sending audio to server...");
    
    // Create form data with audio blob
    const formData = new FormData();
    formData.append('file', audioBlob, 'recording.' + mimeType.split('/')[1]);
    
    // Add selected voice if available
    if (llmVoiceSelector && llmVoiceSelector.value) {
      formData.append('voice_id', llmVoiceSelector.value);
    }
    
    const sessionId = currentSessionId;
    
    // Send to /agent/chat/{session_id} endpoint
    const response = await fetch(`/agent/chat/${sessionId}`, {
      method: 'POST',
      body: formData
    });
    
    // Parse body regardless of status to attempt history update
    let result;
    try {
      result = await response.json();
    } catch (_) {
      const errorText = await response.text();
      throw new Error(`Server error: ${response.status} - ${errorText}`);
    }
    if (!response.ok) {
      // Even on error, try to refresh chat history so UI reflects user turn
      if (window.updateChatHistory) {
        window.updateChatHistory();
      }
      // Client-side fallback TTS for the fallback message when provided
      const fallbackText = result?.assistant_response || "I'm having trouble connecting right now. Please try again in a moment.";
      tryWebSpeechFallback(fallbackText);
      throw new Error(`Server error: ${response.status} - ${result?.error || 'Unknown error'}`);
    }
    console.log('LLM Chat result:', result);
    
    // Display transcription
    if (result.user_message && llmTranscriptionResult) {
      llmTranscriptionResult.textContent = result.user_message;
      if (llmTranscriptionContainer) llmTranscriptionContainer.style.display = 'block';
    }
    
    // Display LLM response text
    if (result.assistant_response && llmResponseText) {
      llmResponseText.textContent = result.assistant_response;
      if (llmResponseContainer) llmResponseContainer.style.display = 'block';
    }
    
    // Play audio response
    if (result.audio_url && llmAudioPlayer) {
      llmAudioPlayer.src = result.audio_url;
      if (llmAudioContainer) llmAudioContainer.style.display = 'block';
      
      // Auto-start recording after audio finishes
      llmAudioPlayer.onended = () => {
        console.log('Audio playback finished, starting new recording...');
        setTimeout(() => {
          const llmStartRecordingBtn = document.getElementById('llm-start-recording-btn');
          if (llmStartRecordingBtn && !llmStartRecordingBtn.disabled) {
            llmStartRecordingBtn.click();
          }
        }, 1000); // 1 second delay
      };
      
      llmAudioPlayer.play();
      showLLMStatus("✅ Response ready!");
    } else {
      // No server audio — use client-side Web Speech as a fallback
      const fallbackText = result.assistant_response || "I'm having trouble connecting right now. Please try again in a moment.";
      tryWebSpeechFallback(fallbackText);
      showLLMStatus("⚠️ No audio response received");
    }
    
    // Update chat history after processing response
    if (window.updateChatHistory) {
      window.updateChatHistory();
    }
    
  } catch (error) {
    console.error('Error processing LLM query:', error);
    showLLMStatus(`❌ Error: ${error.message}`, true);
  } finally {
    // Hide loading indicator
    if (llmLoadingIndicator) {
      llmLoadingIndicator.style.display = 'none';
    }
  }
}

// Setup audio visualization for LLM voice recording
function setupLLMAudioVisualization(stream) {
  try {
    // Create audio context and analyzer if they don't exist
    if (!llmAudioContext) {
      llmAudioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
    
    if (!llmAnalyser) {
      llmAnalyser = llmAudioContext.createAnalyser();
      llmAnalyser.fftSize = 256;
      llmAnalyser.smoothingTimeConstant = 0.8;
    }
    
    // Connect the stream to the analyzer
    const source = llmAudioContext.createMediaStreamSource(stream);
    source.connect(llmAnalyser);
    
    // Start visualization
    llmVisualizationActive = true;
    visualizeLLMAudio();
    
    console.log('LLM Audio visualization setup complete');
  } catch (error) {
    console.error('Error setting up audio visualization:', error);
  }
}

// Visualize audio for LLM voice recording
function visualizeLLMAudio() {
  if (!llmVisualizationActive) return;
  
  const canvas = document.getElementById('llm-audio-visualizer');
  if (!canvas) return;
  
  const canvasCtx = canvas.getContext('2d');
  const bufferLength = llmAnalyser.frequencyBinCount;
  const dataArray = new Uint8Array(bufferLength);
  
  // Clear the canvas
  canvasCtx.clearRect(0, 0, canvas.width, canvas.height);
  
  // Function to draw the visualization
  function draw() {
    if (!llmVisualizationActive) return;
    
    llmVisualizationAnimationFrame = requestAnimationFrame(draw);
    
    // Get frequency data
    llmAnalyser.getByteFrequencyData(dataArray);
    
    // Clear canvas
    canvasCtx.fillStyle = '#f0f0f0';
    canvasCtx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Calculate bar width based on canvas size and buffer length
    const barWidth = (canvas.width / bufferLength) * 2.5;
    let barHeight;
    let x = 0;
    
    // Draw bars for each frequency
    for (let i = 0; i < bufferLength; i++) {
      barHeight = dataArray[i] / 2; // Scale down the height
      
      // Create gradient for bars
      const gradient = canvasCtx.createLinearGradient(0, 0, 0, canvas.height);
      gradient.addColorStop(0, '#4CAF50');
      gradient.addColorStop(1, '#2E7D32');
      
      canvasCtx.fillStyle = gradient;
      canvasCtx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);
      
      x += barWidth + 1; // Add small gap between bars
    }
  }
  
  // Start drawing
  draw();
}

// Stop audio visualization
function stopLLMAudioVisualization() {
  llmVisualizationActive = false;
  
  if (llmVisualizationAnimationFrame) {
    cancelAnimationFrame(llmVisualizationAnimationFrame);
    llmVisualizationAnimationFrame = null;
  }
  
  // Clear the canvas
  const canvas = document.getElementById('llm-audio-visualizer');
  if (canvas) {
    const canvasCtx = canvas.getContext('2d');
    canvasCtx.clearRect(0, 0, canvas.width, canvas.height);
  }
  
  console.log('LLM Audio visualization stopped');
}

// Try Web Speech API fallback TTS on the client
function tryWebSpeechFallback(text) {
  try {
    if ('speechSynthesis' in window) {
      const utter = new SpeechSynthesisUtterance(text);
      utter.rate = 1.0;
      utter.pitch = 1.0;
      utter.volume = 1.0;
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(utter);
      console.log('Web Speech fallback TTS playing.');
    } else {
      console.warn('Web Speech API not supported for fallback TTS.');
    }
  } catch (e) {
    console.error('Web Speech fallback TTS error:', e);
  }
}

// Show upload options
function showUploadOptions(blob, mimeType) {
  const fileNameInputArea = document.getElementById('fileNameInputArea');
  const fileNameInput = document.getElementById('fileNameInput');
  const uploadBtn = document.getElementById('uploadBtn');
  const uploadStatus = document.getElementById('uploadStatus');
  
  if (fileNameInputArea) {
    fileNameInputArea.style.display = 'block';
    if (fileNameInput) fileNameInput.value = '';
    if (uploadStatus) uploadStatus.textContent = '';
    
    if (uploadBtn) {
      uploadBtn.onclick = async () => {
        let fileName = fileNameInput ? fileNameInput.value.trim() : '';
        if (!fileName) fileName = 'recording';
        if (!fileName.endsWith('.webm')) fileName += '.webm';
        if (uploadStatus) uploadStatus.textContent = 'Uploading...';
        const formData = new FormData();
        const audioFile = new File(recordedChunks, fileName, { type: mimeType });
        formData.append('file', audioFile);
        try {
          const response = await fetch('/upload-audio', {
            method: 'POST',
            body: formData
          });
          if (response.ok) {
            const data = await response.json();
            if (uploadStatus) uploadStatus.textContent = `✅ Uploaded: ${data.filename} (${data.size} bytes, ${data.content_type})`;
            if (fileNameInputArea) fileNameInputArea.style.display = 'none';
          } else {
            if (uploadStatus) uploadStatus.textContent = '❌ Upload failed!';
          }
        } catch (err) {
          if (uploadStatus) uploadStatus.textContent = '❌ Upload error: ' + err.message;
        }
      };
    }
  }
}
