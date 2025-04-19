# Project Requirements Document: Rick&Morty Habit Tracker

**Document Version:** 1.0  
**Date:** 2025-04-19  
**Client:** capernix  
**Project Duration:** 24-hour hackathon

## 1. Executive Summary

The Rick&Morty Habit Tracker is a dual-mode habit tracking application inspired by the duality portrayed in Rick and Morty. Users can switch between "Growth Mode" (mindful, reflective) and "Action Mode" (energetic, productive). The app features an Endel-inspired audio experience that enhances each mode with appropriate soundscapes. AI capabilities analyze journal entries to suggest mode switches and provide personalized habit recommendations.

## 2. Project Objectives

- Create a mobile application using React Native (Expo)
- Implement a dual-mode system with distinct UIs and experiences
- Integrate an Endel-inspired audio system with visualizations
- Build AI capabilities for mood detection and habit recommendations
- Develop a local SQLite database for habit tracking
- Create a Flask backend for AI processing and API integration
- Complete the project within 24 hours for a hackathon

## 3. Project Scope

### 3.1 In Scope

- React Native mobile app using Expo
- Dual mode UI/UX (Growth/Action)
- Local SQLite database
- Flask backend with OpenAI integration
- Adaptive audio experiences
- Journal entries with mood analysis
- AI-powered habit recommendations
- Audio visualization components

### 3.2 Out of Scope

- User authentication system
- Cloud data synchronization
- Social/sharing features
- Push notifications
- Complex analytics
- Wearable device integration

## 4. System Architecture

### 4.1 Frontend (React Native)

- **Framework:** React Native with Expo
- **State Management:** React Context API
- **Local Storage:** SQLite
- **Navigation:** React Navigation
- **Audio:** expo-av
- **UI Libraries:** Native components, Expo Vector Icons

### 4.2 Backend (Flask)

- **Framework:** Flask (Python)
- **AI Integration:** OpenAI API
- **Optional:** Google Cloud APIs for advanced features
- **Deployment:** Simple hosting service (Python Anywhere, Render, Railway)

### 4.3 Data Flow

```
┌─────────────────┐      ┌──────────────────┐      ┌──────────────┐
│  React Native   │      │    SQLite DB     │      │ Flask Server │
│   Components    │◄────►│   (Local Data)   │      │  (AI/APIs)   │
└────────┬────────┘      └──────────────────┘      └──────┬───────┘
         │                                                │
         │         HTTP Requests (Journal Analysis,       │
         └───────────────Habit Suggestions)───────────────┘
                                │
                                ▼
                      ┌────────────────────┐
                      │   External APIs    │
                      │  (OpenAI, Google)  │
                      └────────────────────┘
```

## 5. Feature Requirements

### 5.1 Core Features

#### 5.1.1 Dual Mode System

- **Growth Mode:**
  - Calming, blue/green color palette
  - Focus on mindfulness and long-term improvement
  - Slower, ambient audio elements
  - Visual representations emphasizing expansion

- **Action Mode:**
  - Energetic, red/orange color palette
  - Focus on productivity and immediate results
  - Higher tempo, rhythmic audio elements
  - Visual representations emphasizing progress and motion

#### 5.1.2 Habit Management

- Create, read, update, delete habits
- Associate habits with specific modes
- Track habit completions with timestamp
- Filter habits by mode
- Habit completion statistics

#### 5.1.3 Audio Experience

- Mode-specific ambient soundscapes
- Time-aware audio (morning, day, evening, night variations)
- Audio visualizations that respond to sound
- Audio controls (play/pause/mute)
- Habit-specific soundscapes during focus sessions

#### 5.1.4 AI Features

- Journal entry mood analysis
- Mode recommendations based on journal content
- Personalized habit suggestions
- AI-generated encouragement messages
- Success prediction for habits (optional stretch goal)

### 5.2 Database Schema

```
habits
- id (INTEGER PRIMARY KEY)
- title (TEXT)
- description (TEXT)
- category (TEXT)
- frequency (TEXT)
- mode (TEXT)
- created_at (INTEGER)

completions
- id (INTEGER PRIMARY KEY)
- habit_id (INTEGER)
- completed_at (INTEGER)
- notes (TEXT)

user_preferences
- id (INTEGER PRIMARY KEY)
- current_mode (TEXT)
- last_updated (INTEGER)
```

### 5.3 API Endpoints (Flask)

```
POST /api/analyze-mood
- Input: Journal text
- Output: Suggested mode, confidence score

POST /api/generate-habits
- Input: Current mode, existing habits
- Output: List of personalized habit suggestions

POST /api/analyze-sentiment
- Input: Journal text
- Output: Sentiment analysis results

POST /api/generate-message
- Input: Mode, habits, completion data
- Output: Personalized encouragement message
```

## 6. User Interface Requirements

### 6.1 Screens

1. **Home Screen**
   - Mode toggle
   - Audio controls and visualization
   - Quick journal entry
   - AI encouragement message
   - Stats overview
   - Navigation to other screens

2. **Habits List Screen**
   - Filtered by current mode
   - Habit items with completion status
   - Add new habit button
   - Search/filter capabilities

3. **Add/Edit Habit Screen**
   - Form fields for habit details
   - Mode selection
   - Category selection
   - Frequency options

4. **Journal Screen**
   - Text entry field
   - Mood analysis button
   - Previous entries (optional)
   - Audio reactive elements

5. **Habit Focus Screen**
   - Audio visualization
   - Timer/progress
   - Breathing guide
   - Complete/pause buttons
   - Custom audio for current habit

6. **Suggested Habits Screen**
   - AI-generated habit suggestions
   - Add to my habits button
   - Refresh suggestions button

### 6.2 Design Requirements

- **Typography:** Clean, readable fonts
- **Color Schemes:**
  - Growth Mode: #8BC34A (primary), #F5F8F2 (background), #333333 (text)
  - Action Mode: #FF5722 (primary), #2B2B2B (background), #F5F5F5 (text)
- **UI Elements:** Rounded corners, subtle shadows, fluid animations
- **Iconography:** Minimalist, consistent style
- **Audio-Reactive Elements:** Visual elements that respond to audio

## 7. Technical Requirements

### 7.1 React Native Components

- ThemeContext for mode management
- AudioManager for sound control
- SQLite database wrapper
- API service for backend communication
- Audio visualization components
- Mode-specific UI components

### 7.2 Flask Backend Components

- OpenAI integration module
- Mood analysis service
- Habit recommendation engine
- Message generation module
- Error handling and fallbacks

### 7.3 Audio Files Required

- **Background Ambience (8 files):**
  - growth_morning.mp3, growth_day.mp3, growth_evening.mp3, growth_night.mp3
  - action_morning.mp3, action_day.mp3, action_evening.mp3, action_night.mp3

- **Habit-Specific Soundscapes (8+ files):**
  - meditation_growth.mp3, meditation_action.mp3
  - exercise_growth.mp3, exercise_action.mp3
  - learning_growth.mp3, learning_action.mp3
  - productivity_growth.mp3, productivity_action.mp3

- **UI Sounds (4 files):**
  - habit_complete.mp3
  - mode_switch.mp3
  - notification.mp3
  - achievement.mp3

## 8. Team Responsibilities

### 8.1 Krish (AI/LLM Specialist)
- Mood detection algorithms
- Personalized habit suggestions
- AI response formatting
- Audio-mood correlation research

### 8.2 Swapnil (AI/LLM Specialist)
- Mode suggestion algorithms
- Encouragement message generation
- Habit success prediction
- AI response fallbacks

### 8.3 Marvin (Backend & Integration)
- Flask server setup
- Database schema and operations
- API endpoints
- Frontend-backend integration
- Audio playback implementation

### 8.4 Aditi (Frontend & UI/UX)
- React Native screens and components
- Theme implementation
- Audio visualizations
- Animation and transitions
- Overall UI polish

## 9. Development Workflow

1. Set up project structure and repositories
2. Create basic React Native app with navigation
3. Implement SQLite schema
4. Build Flask backend endpoints
5. Develop core UI components for both modes
6. Integrate audio system
7. Connect frontend to backend API
8. Implement journal analysis features
9. Add habit recommendation engine
10. Polish UI/UX and add final touches

## 10. Testing Requirements

- Manual testing on both iOS and Android devices
- Error handling for API failures
- Fallback mechanisms for offline operation
- Edge case testing for different audio scenarios
- Cross-device UI consistency testing

## 11. Deliverables

- React Native (Expo) mobile application
- Flask backend API
- Source code in GitHub repository
- Project documentation
- Demo video/presentation for hackathon submission

## 12. Key Implementation Details

### 12.1 Audio System Implementation

```javascript
// audioManager.js core functionality
class AudioManager {
  constructor() {
    this.soundObject = null;
    this.isPlaying = false;
    this.currentMode = null;
    this.timeOfDay = 'day';
  }
  
  async playModeAudio(mode) {
    // Stop any current audio
    // Select appropriate audio file based on mode and time
    // Load and play the audio with looping enabled
  }
  
  setTimeOfDay() {
    // Determine time of day based on current hour
    // Update audio if playing
  }
  
  async pauseAudio() { /* Implementation */ }
  async resumeAudio() { /* Implementation */ }
  async unloadAudio() { /* Implementation */ }
}
```

### 12.2 ThemeContext Implementation

```javascript
// ThemeContext.js core structure
const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [mode, setMode] = useState('growth');
  const [audioEnabled, setAudioEnabled] = useState(true);
  
  // Toggle between modes
  const toggleMode = async () => {
    const newMode = mode === 'growth' ? 'action' : 'growth';
    setMode(newMode);
    
    // Update audio when mode changes
    if (audioEnabled) {
      audioManager.playModeAudio(newMode);
    }
    
    // Save to SQLite
  };
  
  // Toggle audio on/off
  const toggleAudio = () => {
    setAudioEnabled(!audioEnabled);
    // Play or pause audio accordingly
  };

  return (
    <ThemeContext.Provider value={{ 
      theme: themes[mode], 
      mode, 
      toggleMode,
      audioEnabled,
      toggleAudio
    }}>
      {children}
    </ThemeContext.Provider>
  );
}
```

### 12.3 Flask API Structure

```python
# app.py core structure
from flask import Flask, request, jsonify
import openai

app = Flask(__name__)
CORS(app)

@app.route('/api/analyze-mood', methods=['POST'])
def analyze_mood():
    # Get journal text from request
    # Call OpenAI API to analyze mood
    # Return suggested mode and confidence
    
@app.route('/api/generate-habits', methods=['POST'])
def generate_habits():
    # Get current mode and habits from request
    # Call OpenAI API to generate habit suggestions
    # Return formatted habit suggestions
```

### 12.4 SQLite Database Operations

```javascript
// database.js core functionality
import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabase('habits.db');

const initDatabase = () => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      // Create habits table
      // Create completions table
      // Create user_preferences table
      // Set default preferences
    });
  });
};

export { db, initDatabase };
```

## 13. Success Criteria

1. User can toggle between Growth and Action modes
2. Audio changes appropriately with mode switches
3. User can create and track habits specific to each mode
4. Journal entries can be analyzed for mood
5. AI provides relevant habit suggestions
6. Audio visualizations respond to the soundscapes
7. Application runs smoothly on mobile devices
8. Backend API successfully processes AI requests

## 14. Risks and Mitigations

| Risk | Mitigation |
|------|------------|
| API rate limits | Implement request caching and fallback responses |
| Audio loading issues | Provide visual feedback and graceful degradation |
| Integration complexity | Use a clear API contract between frontend and backend |
| Time constraints | Focus on MVP features first, then enhance |
| Cross-device compatibility | Regular testing on multiple device types |

## 15. Future Enhancements (Post-Hackathon)

1. User authentication system
2. Cloud synchronization
3. Advanced analytics and insights
4. Social features and habit sharing
5. Integration with wearable devices
6. More sophisticated AI models
7. Additional audio packs and visualizations
8. Push notifications with optimal timing

## 16. References and Resources

1. [Expo Documentation](https://docs.expo.dev/)
2. [React Navigation](https://reactnavigation.org/docs/getting-started)
3. [Flask Documentation](https://flask.palletsprojects.com/)
4. [OpenAI API Documentation](https://platform.openai.com/docs/introduction)
5. [SQLite Documentation](https://www.sqlite.org/docs.html)
6. [Endel.io](https://endel.io/) for audio experience inspiration

---

This document provides a comprehensive blueprint for developing the Rick&Morty Habit Tracker application, including all necessary technical details, feature specifications, and implementation guidance required for an agentic AI to understand and implement the project independently.