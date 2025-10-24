# SSH Gemini Integration Setup Guide

## 🔗 Overview
This guide helps you integrate your custom Gemini application through SSH connection instead of using the direct Google API.

## 🚀 Setup Steps

### 1. Environment Configuration
Create a `.env` file in your project root with the following variables:

```env
# SSH Gemini Configuration
VITE_USE_SSH_GEMINI=true
VITE_SSH_GEMINI_HOST=your-server.com
VITE_SSH_GEMINI_PORT=22
VITE_SSH_GEMINI_USERNAME=your-username
VITE_SSH_GEMINI_PASSWORD=your-password
VITE_SSH_GEMINI_API_ENDPOINT=https://your-server.com/api
VITE_SSH_GEMINI_TIMEOUT=30000
VITE_SSH_GEMINI_TOKEN=your-auth-token
```

### 2. Your Gemini Application Requirements
Your server should have the following endpoints:

#### **Health Check Endpoint**
```
GET /health
Authorization: Bearer <token>
Response: 200 OK
```

#### **Chat Endpoint**
```
POST /chat
Authorization: Bearer <token>
Content-Type: application/json

Request Body:
{
  "message": "student question",
  "context": "additional context",
  "session": {
    "subject": "Matemática",
    "difficulty": "beginner",
    "userId": "user123"
  },
  "timestamp": "2024-01-01T00:00:00.000Z"
}

Response:
{
  "response": "AI response text",
  "type": "explanation",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

#### **Recommendations Endpoint**
```
POST /recommendations
Authorization: Bearer <token>
Content-Type: application/json

Request Body:
{
  "subject": "Matemática",
  "difficulty": "beginner",
  "userId": "user123"
}

Response:
{
  "recommendations": [
    {
      "id": "rec1",
      "type": "exercise",
      "title": "Practice Algebra",
      "description": "Solve 10 algebra problems",
      "difficulty": "beginner",
      "estimatedTime": 30,
      "priority": "high"
    }
  ]
}
```

### 3. Alternative Connection Methods

#### **WebSocket Support**
If your server supports WebSocket connections:
```env
VITE_SSH_GEMINI_API_ENDPOINT=ws://your-server.com/ws
```

#### **Server-Sent Events**
For real-time streaming:
```env
VITE_SSH_GEMINI_API_ENDPOINT=https://your-server.com/stream
```

### 4. Authentication Methods

#### **Method 1: Bearer Token**
```env
VITE_SSH_GEMINI_TOKEN=your-jwt-token
```

#### **Method 2: Basic Auth**
```env
VITE_SSH_GEMINI_USERNAME=your-username
VITE_SSH_GEMINI_PASSWORD=your-password
```

#### **Method 3: SSH Key**
```env
VITE_SSH_GEMINI_PRIVATE_KEY=your-private-key-content
```

## 🎯 Configuration Options

### **Direct Configuration**
You can configure the SSH connection directly in the OBLI A.I. interface:

1. Go to **Study Materials** → **OBLI A.I.**
2. Start a chat session
3. Click **"⚙️ SSH Config"** button
4. Enter your server details:
   - **Host**: Your server domain or IP
   - **Port**: SSH port (usually 22)
   - **Username**: Your SSH username
   - **Password**: Your SSH password
   - **API Endpoint**: Your Gemini app URL
   - **Timeout**: Request timeout in milliseconds

### **Environment Variables**
For production deployment, use environment variables:

```env
# Production Configuration
VITE_USE_SSH_GEMINI=true
VITE_SSH_GEMINI_HOST=production-server.com
VITE_SSH_GEMINI_PORT=443
VITE_SSH_GEMINI_USERNAME=prod-user
VITE_SSH_GEMINI_API_ENDPOINT=https://production-server.com/api/v1
VITE_SSH_GEMINI_TOKEN=prod-jwt-token
VITE_SSH_GEMINI_TIMEOUT=60000
```

## 🔧 Technical Details

### **Connection Methods**
The system supports multiple connection methods:

1. **HTTP/HTTPS**: Standard REST API calls
2. **WebSocket**: Real-time bidirectional communication
3. **Server-Sent Events**: Real-time streaming responses

### **Error Handling**
- Automatic retry logic for failed connections
- Fallback to direct Gemini API if SSH fails
- User-friendly error messages
- Connection testing before use

### **Security Features**
- Encrypted connections (HTTPS/WSS)
- Token-based authentication
- Request timeout protection
- Input validation and sanitization

## 🧪 Testing Your Setup

### **1. Test Connection**
Use the built-in connection tester in the SSH Config modal.

### **2. Manual Testing**
Test your endpoints manually:

```bash
# Health check
curl -H "Authorization: Bearer your-token" \
     https://your-server.com/health

# Chat test
curl -X POST \
     -H "Authorization: Bearer your-token" \
     -H "Content-Type: application/json" \
     -d '{"message":"Hello","session":{"subject":"Math","difficulty":"beginner"}}' \
     https://your-server.com/chat
```

### **3. Browser Testing**
Open browser console and test:
```javascript
// Test connection
fetch('https://your-server.com/health', {
  headers: { 'Authorization': 'Bearer your-token' }
}).then(r => console.log('Status:', r.status));
```

## 🚨 Troubleshooting

### **Common Issues**

#### **Connection Refused**
- Check if your server is running
- Verify the host and port
- Ensure firewall allows connections

#### **Authentication Failed**
- Verify username/password
- Check token validity
- Ensure proper authorization headers

#### **Timeout Errors**
- Increase timeout value
- Check server response time
- Verify network connectivity

#### **CORS Issues**
- Configure CORS on your server
- Add your domain to allowed origins
- Use proper headers

### **Debug Mode**
Enable debug logging by adding to your `.env`:
```env
VITE_DEBUG_SSH_GEMINI=true
```

## 📊 Monitoring

### **Connection Status**
The system provides real-time connection status:
- ✅ Connected
- ❌ Disconnected
- ⏳ Connecting
- 🔄 Reconnecting

### **Performance Metrics**
- Response time tracking
- Success/failure rates
- Connection stability
- Error frequency

## 🔄 Fallback Strategy

If SSH connection fails, the system automatically falls back to:
1. Direct Gemini API (if configured)
2. Mock responses for testing
3. Error messages with retry options

## 📝 Example Server Implementation

### **Node.js/Express Example**
```javascript
const express = require('express');
const app = express();

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Chat endpoint
app.post('/chat', async (req, res) => {
  const { message, session } = req.body;
  
  // Process with your Gemini application
  const response = await yourGeminiApp.process(message, session);
  
  res.json({
    response: response.text,
    type: response.type,
    timestamp: new Date().toISOString()
  });
});

// Recommendations endpoint
app.post('/recommendations', async (req, res) => {
  const { subject, difficulty, userId } = req.body;
  
  const recommendations = await yourGeminiApp.getRecommendations({
    subject, difficulty, userId
  });
  
  res.json({ recommendations });
});
```

---

**Your SSH Gemini integration is now ready!** 🚀

For support or questions, contact the development team.
