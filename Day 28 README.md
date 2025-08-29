A README file for your voice agent project should clearly document the new features, usage instructions, architecture, and setup steps for both web search and weather API integration. Below is a comprehensive README template tailored to your described features and project structure.

## Project Overview

**Voice Agent** is an intelligent conversational assistant featuring real-time web search and accurate weather information. It supports dynamic API key configuration, intuitive UI, and scalable FastAPI backend endpoints for both search and weather services.[1][2][3]

## Features

- **Web Search Capability:** Uses DuckDuckGo or Brave Search API via the FastAPI backend.
- **Weather Information:** Integrates OpenWeatherMap for live weather updates.
- **Dynamic API Key Management:** Users can securely enter and validate API keys through a frontend modal/sidebar.
- **Intuitive UI:** Configuration modal for API keys with persistent storage and validation.
- **FastAPI Backend Endpoints:** Handles `/search` for web search and `/weather` for weather queries.
- **Frontend Integration:** JavaScript updates to support new search and weather functionalities.[2][4][1]

## Architecture

```
Voice Agent
├── Frontend (JS/HTML/CSS)
│   ├── Voice interaction
│   ├── Configuration modal for API keys
│   ├── Dynamic handling of search & weather
├── FastAPI Backend
│   ├── /search endpoint for web queries
│   ├── /weather endpoint for weather data
│   └── Accepts dynamic API keys from frontend
```


## Setup Instructions

### Prerequisites

- Python 3.11+
- Node.js (for frontend, optional)
- FastAPI
- Required API keys for DuckDuckGo/Brave Search and OpenWeatherMap.[3]

### Installation

1. **Clone Repository**
   ```
   git clone <repo-url>
   cd voice-agent
   ```

2. **Install Backend Dependencies**
   ```
   pip install -r requirements.txt
   ```

3. **Frontend Setup**
   - Open `index.html` in browser or deploy with static server.

### Configuration

- Open the configuration modal in the UI and enter the API keys for web search and weather (OpenWeatherMap).
- Keys are validated and stored locally in the frontend for backend authentication.[4][5]

## Usage

- **Web Search:** Enter queries via the voice/text input interface. Results are fetched from the FastAPI `/search` endpoint using the configured web search API.
- **Weather:** Request weather information by asking natural language questions; data provided by FastAPI `/weather` endpoint integrating OpenWeatherMap.[6][7]

## API Endpoints

| Endpoint       | Method | Description                                 |
| -------------- | ------ | ------------------------------------------- |
| `/search`      | POST   | Performs web search with dynamic API key    |
| `/weather`     | GET    | Fetches real-time weather for given location|
[3][1]

## Technologies Used

- **FastAPI:** Python web framework for backend.[6]
- **DuckDuckGo/Brave Search:** External API for web search.
- **OpenWeatherMap:** Real-time weather data provider.
- **HTML/CSS/JS:** Frontend with modal/sidebar config.

## Contribution

Feel free to create issues or submit pull requests to improve features or documentation.

***

This README documents all functionalities added, guides setup, and explains usage for your enhanced voice agent project.[2][4][1]

[1](https://github.com/mmycin/weather-ai-agent)
[2](https://cookbook.openai.com/examples/agents_sdk/app_assistant_voice_agents)
[3](https://dailypythonprojects.substack.com/p/weather-forecast-api-with-fastapi)
[4](https://www.kdnuggets.com/the-easiest-way-to-create-real-time-ai-voice-agents)
[5](https://docs.readme.com/main/docs/reference-core-pages)
[6](https://www.youtube.com/watch?v=o4FpcA2n_MY)
[7](https://www.youtube.com/watch?v=g1Hf11y32WI)
[8](https://github.com/TEN-framework/ten-framework)
[9](https://learn.microsoft.com/en-us/microsoftteams/platform/toolkit/build-an-ai-agent-in-teams)
[10](https://openapi-generator.tech/docs/templating/)