
                             # Day 15 — WebSockets 🔌 | 30 Days of AI Voice Agents



                                        ## 📅 Overview
Today marks **Day 15** of my 30 Days of AI Voice Agent Challenge — and we’ve officially crossed the halfway point!  
This day was all about implementing **WebSockets** to enable **real-time, two-way communication** between a client and a Python server.

---

## 🎯 Objective
- Create a `/ws` endpoint on a Python server using **FastAPI**.
- Establish a WebSocket connection between client and server.
- Send a message from the client and have the server **echo it back** instantly.
- Test the WebSocket using **Postman**.

---

## 🛠 Tech Stack

- **Python**
- **FastAPI**
- **WebSockets**
- **Postman** (for testing)

---

## 📝 Steps Implemented

1. **Created a new branch**
   ```bash
   git checkout -b streaming
````

This ensures that streaming-related code doesn't interfere with the non-streaming code.

2. **Setup WebSocket endpoint**

   ```python
   from fastapi import FastAPI, WebSocket

   app = FastAPI()

   @app.websocket("/ws")
   async def websocket_endpoint(websocket: WebSocket):
       await websocket.accept()
       while True:
           data = await websocket.receive_text()
           await websocket.send_text(f"Message received: {data}")
   ```

3. **Run the server**

   ```bash
   uvicorn main:app --reload
   ```

4. **Test with Postman**

   * Open Postman
   * Create a **New → WebSocket Request**
   * Enter URL: `ws://localhost:8000/ws`
   * Click **Connect**
   * Send messages and receive instant echo responses.

---

## 📸 Demo

*(Insert your Postman WebSocket screenshot here)*

---

## 🚀 Key Learning

* **WebSockets** are perfect for real-time interactions (chat apps, live notifications, streaming AI responses).
* Unlike HTTP, WebSockets maintain a **persistent connection** for continuous data flow.

---

## 📌 Next Steps

* Integrate this WebSocket connection with the AI voice agent UI.
* Enable **real-time streaming responses** from the AI.

---

**#30DaysOfAIVoiceAgent #FastAPI #WebSockets #Python #BuildInPublic**

