// Day 16: Streaming Audio (Client Side Skeleton)

// Day 16: Streaming Audio — Client Side
let ws = null;
let mediaRecorder = null;
let mediaStream = null;
let fileExt = "webm"; // will switch to ogg/mp4 if needed
let sessionId = crypto.randomUUID();

// Pick a supported mimeType for MediaRecorder
function pickMimeType() {
  const candidates = [
    'audio/webm;codecs=opus',
    'audio/webm',
    'audio/ogg;codecs=opus',
    'audio/ogg',
    'audio/mp4' // Safari fallback (not always available)
  ];
  for (const m of candidates) {
    if (MediaRecorder.isTypeSupported(m)) return m;
  }
  return ''; // Let browser decide
}

async function startRecording() {
  try {
    // 1) Connect WebSocket first
    ws = new WebSocket(`ws://localhost:8000/ws/audio?session=${encodeURIComponent(sessionId)}`);
    ws.binaryType = "arraybuffer";

    ws.onopen = async () => {
      console.log("✅ WS connected");

      // 2) Get mic
      mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });

      // 3) Create MediaRecorder with a supported mime
      const mimeType = pickMimeType();
      if (mimeType.includes('ogg')) fileExt = 'ogg';
      else if (mimeType.includes('mp4')) fileExt = 'm4a';
      else fileExt = 'webm';

      mediaRecorder = new MediaRecorder(mediaStream, mimeType ? { mimeType } : undefined);

      // 4) Tell server we’re starting (send a small JSON control frame)
      const ac = new (window.AudioContext || window.webkitAudioContext)();
      const startMsg = {
        type: 'start',
        sessionId,
        mimeType: mimeType || 'default',
        sampleRate: ac.sampleRate,
        // nice readable file name on server
        fileName: `stream_${new Date().toISOString().replace(/[:.]/g,'-')}.${fileExt}`
      };
      ws.send(JSON.stringify(startMsg));

      // 5) Every 250ms send the audio chunk
      mediaRecorder.ondataavailable = async (e) => {
        if (!e.data || e.data.size === 0) return;
        if (!ws || ws.readyState !== WebSocket.OPEN) return;

        // Avoid flooding (simple backpressure)
        if (ws.bufferedAmount > 2_000_000) {
          console.warn('WS busy, skipping a chunk');
          return;
        }

        const buf = await e.data.arrayBuffer();
        ws.send(buf); // send as binary
      };

      // 6) Start chunking (250ms)
      mediaRecorder.start(250);
      console.log(`🎙️ Recording... mime=${mimeType || 'auto'} sampleRate=${ac.sampleRate}`);
    };

    ws.onmessage = (evt) => {
      console.log("📩 Server:", evt.data);
    };

    ws.onclose = () => console.log("❌ WS closed");
    ws.onerror = (err) => console.error("WS error:", err);

  } catch (err) {
    console.error("Failed to start recording:", err);
    alert("Mic permission or WS connect failed. Check console.");
  }
}

function stopRecording() {
  // 1) Stop recorder + mic
  if (mediaRecorder && mediaRecorder.state !== "inactive") {
    mediaRecorder.stop();
  }
  if (mediaStream) {
    mediaStream.getTracks().forEach(t => t.stop());
  }

  // 2) Tell server we’re done
  try {
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ type: 'stop', sessionId }));
      // Give server a moment to flush, then close
      setTimeout(() => ws.close(), 200);
    }
  } catch {}

  console.log("🛑 Stopped.");
}

// Expose for buttons
window.startRecording = startRecording;
window.stopRecording = stopRecording;

  
