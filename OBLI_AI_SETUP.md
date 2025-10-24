# OBLI A.I. Integration Setup Guide

## 🤖 Overview
OBLI A.I. is an intelligent study assistant powered by Google's Gemini AI that provides personalized learning support for Brazilian students.

## 🔑 Required Setup Steps

### 1. Get Gemini API Key
1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the generated API key

### 2. Configure Environment Variables
Create a `.env` file in your project root with:

```env
# Gemini AI Configuration
VITE_GEMINI_API_KEY=your_gemini_api_key_here
```

### 3. Install Dependencies
The required dependency is already installed:
```bash
npm install @google/generative-ai
```

## 🚀 Features

### Core Functionality
- **Intelligent Chat Interface**: Real-time conversation with AI
- **Subject-Specific Support**: Choose from 11 different subjects
- **Difficulty Levels**: Beginner, Intermediate, Advanced
- **Study Recommendations**: AI-generated study suggestions
- **Session Tracking**: Monitor study progress and history

### Supported Subjects
- Matemática (Mathematics)
- Português (Portuguese)
- História (History)
- Geografia (Geography)
- Ciências (Sciences)
- Física (Physics)
- Química (Chemistry)
- Biologia (Biology)
- Inglês (English)
- Filosofia (Philosophy)
- Sociologia (Sociology)

### AI Capabilities
- **Explanations**: Clear, educational explanations in Portuguese
- **Study Tips**: Personalized study techniques and strategies
- **Question Answering**: Comprehensive answers to student questions
- **Recommendations**: AI-powered study recommendations
- **Progress Tracking**: Monitor learning progress

## 🎯 How to Use

### For Students
1. Go to **Study Materials** from the dashboard
2. Click **"Iniciar Chat"** in the OBLI A.I. section
3. Select your subject and difficulty level
4. Start chatting with the AI assistant
5. Get personalized study recommendations

### For Teachers
- Students can access OBLI A.I. independently
- AI provides consistent, high-quality educational support
- Reduces teacher workload for basic questions
- Enables 24/7 learning support

## 🔧 Technical Implementation

### Components
- `OBLIAI.tsx`: Main chat interface component
- `obliAIService.ts`: AI service with Gemini integration
- Integrated with existing Study Materials system

### Key Features
- **Real-time Chat**: Instant AI responses
- **Context Awareness**: Remembers conversation history
- **Portuguese Language**: Optimized for Brazilian students
- **Study Session Management**: Track and save study sessions
- **Recommendation Engine**: AI-powered study suggestions

## 🛡️ Security & Privacy
- API keys stored in environment variables
- No sensitive data stored locally
- Conversations are not permanently stored
- GDPR compliant data handling

## 📊 Analytics & Tracking
- Study session duration
- Topics covered
- Difficulty progression
- Student engagement metrics

## 🔄 Future Enhancements
- Voice interaction capabilities
- Image recognition for problem solving
- Integration with learning management systems
- Advanced progress analytics
- Multi-language support

## 🆘 Troubleshooting

### Common Issues
1. **API Key Error**: Ensure VITE_GEMINI_API_KEY is set correctly
2. **Network Issues**: Check internet connection
3. **Rate Limiting**: Gemini has usage limits, implement retry logic if needed

### Support
For technical support or feature requests, contact the development team.

---

**OBLI A.I. - Your Intelligent Study Companion** 🤖📚
