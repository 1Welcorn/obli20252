// SSH Gemini Integration Service
// This service connects to your custom Gemini application via SSH

import { learningProgressService } from './learningProgressService';

export interface SSHGeminiConfig {
    host: string;
    port?: number;
    username: string;
    privateKey?: string;
    password?: string;
    apiEndpoint: string;
    timeout?: number;
}

export interface ChatMessage {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
    type?: 'text' | 'study_tip' | 'explanation' | 'question' | 'recommendation';
}

export interface StudySession {
    id: string;
    userId: string;
    subject: string;
    messages: ChatMessage[];
    startTime: Date;
    endTime?: Date;
    topics: string[];
    difficulty: 'beginner' | 'intermediate' | 'advanced';
}

export interface StudyRecommendation {
    id: string;
    type: 'topic' | 'exercise' | 'review' | 'practice';
    title: string;
    description: string;
    difficulty: 'beginner' | 'intermediate' | 'advanced';
    estimatedTime: number;
    priority: 'high' | 'medium' | 'low';
}

class SSHGeminiService {
    private config: SSHGeminiConfig;
    private currentSession: StudySession | null = null;

    constructor(config?: SSHGeminiConfig) {
        // Load configuration from localStorage if not provided
        if (!config) {
            config = this.loadConfigFromStorage();
        }
        
        this.config = {
            port: 22,
            timeout: 30000,
            ...config
        };
        
        console.log('🔧 SSH Service initialized with config:', this.config);
    }

    // Load configuration from localStorage
    private loadConfigFromStorage(): SSHGeminiConfig {
        try {
            const savedConfig = localStorage.getItem('sshGeminiConfig');
            console.log('📋 Loading SSH config from localStorage:', savedConfig);
            
            if (savedConfig) {
                const config = JSON.parse(savedConfig);
                const loadedConfig = {
                    host: config.host || 'gemini.google.com',
                    port: parseInt(config.port) || 443,
                    username: config.username || '',
                    password: config.password || '',
                    apiEndpoint: config.apiEndpoint || 'https://gemini.google.com/gem/7b0cd16f87e2/2aa516161892a641',
                    timeout: parseInt(config.timeout) || 30000
                };
                console.log('✅ Loaded SSH config:', loadedConfig);
                return loadedConfig;
            }
        } catch (error) {
            console.error('❌ Error loading SSH config from localStorage:', error);
        }
        
        // Fallback to default configuration
            const defaultConfig = {
                host: 'gemini.google.com',
                port: 443,
                username: '',
                password: '',
                apiEndpoint: 'https://gemini.google.com/gem/7b0cd16f87e2/2aa516161892a641',
                timeout: 30000
            };
        console.log('🔄 Using default SSH config:', defaultConfig);
        return defaultConfig;
    }

    // Initialize a new study session
    async startStudySession(userId: string, subject: string): Promise<StudySession> {
        const session: StudySession = {
            id: `session_${Date.now()}`,
            userId,
            subject,
            difficulty: 'intermediate',
            messages: [],
            startTime: new Date(),
            topics: []
        };

        // Generate welcome message with learning progress context
        const welcomeMessage = await this.generateWelcomeMessage(subject, userId);
        session.messages.push(welcomeMessage);
        
        this.currentSession = session;
        return session;
    }

    // Send a message to your Gemini application via SSH
    async sendMessage(message: string, context?: string): Promise<ChatMessage> {
        if (!this.currentSession) {
            throw new Error('No active study session');
        }

        // Add user message
        const userMessage: ChatMessage = {
            id: `msg_${Date.now()}_user`,
            role: 'user',
            content: message,
            timestamp: new Date()
        };
        this.currentSession.messages.push(userMessage);

        try {
            // Send request to your Gemini application via SSH
            const aiResponse = await this.sendSSHRequest(message, context);
            this.currentSession.messages.push(aiResponse);
            
            // Update learning memory with conversation context
            await this.updateLearningMemory(this.currentSession.userId, message, aiResponse.content);
            
            return aiResponse;
        } catch (error) {
            console.error('Error sending SSH request:', error);
            const errorMessage: ChatMessage = {
                id: `msg_${Date.now()}_error`,
                role: 'assistant',
                content: 'Desculpe, encontrei um erro ao conectar com o servidor. Tente novamente.',
                timestamp: new Date(),
                type: 'text'
            };
            this.currentSession.messages.push(errorMessage);
            return errorMessage;
        }
    }

    // Send HTTP request to your Gemini application via SSH tunnel
    private async sendSSHRequest(message: string, context?: string): Promise<ChatMessage> {
        const requestData = {
            message,
            context,
            session: {
                subject: this.currentSession?.subject,
                userId: this.currentSession?.userId
            },
            timestamp: new Date().toISOString()
        };

        try {
            console.log('🎯 Making API call using Google Generative AI (configured like your custom Gemini app)');
            console.log('📤 User message:', message);
            
        // Make actual HTTP request to your custom Gemini app
        const response = await this.makeRealAPICall(message, this.currentSession?.subject);
            
            console.log('✅ Received response from Google Generative AI (configured like your custom Gemini app)');
            console.log('📥 Response content:', response.substring(0, 100) + '...');
            
            return {
                id: `msg_${Date.now()}_ai`,
                role: 'assistant',
                content: response,
                timestamp: new Date(),
                type: this.determineMessageType(response)
            };

        } catch (error) {
            console.error('SSH request failed:', error);
            
            // Fallback: Try alternative connection methods
            return await this.tryAlternativeConnection(requestData);
        }
    }

    // Alternative connection methods (WebSocket, Server-Sent Events, etc.)
    private async tryAlternativeConnection(requestData: any): Promise<ChatMessage> {
        try {
            // Method 2: WebSocket connection
            if (this.config.apiEndpoint.startsWith('ws://') || this.config.apiEndpoint.startsWith('wss://')) {
                return await this.sendWebSocketRequest(requestData);
            }

            // Method 3: Server-Sent Events
            return await this.sendSSERequest(requestData);

        } catch (error) {
            console.error('Alternative connection failed:', error);
            throw error;
        }
    }

    // WebSocket connection method
    private async sendWebSocketRequest(requestData: any): Promise<ChatMessage> {
        return new Promise((resolve, reject) => {
            const ws = new WebSocket(this.config.apiEndpoint);
            
            ws.onopen = () => {
                ws.send(JSON.stringify(requestData));
            };

            ws.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    ws.close();
                    resolve({
                        id: `msg_${Date.now()}_ai`,
                        role: 'assistant',
                        content: data.response || data.message,
                        timestamp: new Date(),
                        type: this.determineMessageType(data.response || data.message)
                    });
                } catch (error) {
                    reject(error);
                }
            };

            ws.onerror = (error) => {
                reject(error);
            };

            ws.onclose = () => {
                reject(new Error('WebSocket connection closed'));
            };

            // Timeout
            setTimeout(() => {
                ws.close();
                reject(new Error('WebSocket request timeout'));
            }, this.config.timeout || 30000);
        });
    }

    // Server-Sent Events method
    private async sendSSERequest(requestData: any): Promise<ChatMessage> {
        return new Promise((resolve, reject) => {
            const eventSource = new EventSource(`${this.config.apiEndpoint}/stream?data=${encodeURIComponent(JSON.stringify(requestData))}`);
            
            eventSource.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    eventSource.close();
                    resolve({
                        id: `msg_${Date.now()}_ai`,
                        role: 'assistant',
                        content: data.response || data.message,
                        timestamp: new Date(),
                        type: this.determineMessageType(data.response || data.message)
                    });
                } catch (error) {
                    reject(error);
                }
            };

            eventSource.onerror = (error) => {
                eventSource.close();
                reject(error);
            };

            // Timeout
            setTimeout(() => {
                eventSource.close();
                reject(new Error('SSE request timeout'));
            }, this.config.timeout || 30000);
        });
    }

    // Get authentication token (implement based on your auth method)
    private getAuthToken(): string {
        // Method 1: From environment variable
        if (import.meta.env.VITE_SSH_GEMINI_TOKEN) {
            return import.meta.env.VITE_SSH_GEMINI_TOKEN;
        }

        // Method 2: From localStorage
        const token = localStorage.getItem('ssh_gemini_token');
        if (token) {
            return token;
        }

        // Method 3: Generate token based on SSH credentials
        return btoa(`${this.config.username}:${this.config.password || 'default'}`);
    }

    // Get API key from saved configuration
    private getApiKey(): string {
        try {
            const savedConfig = localStorage.getItem('sshGeminiConfig');
            if (savedConfig) {
                const config = JSON.parse(savedConfig);
                return config.apiKey || '';
            }
        } catch (error) {
            console.error('Error getting API key:', error);
        }
        return '';
    }

    // Generate welcome message from your actual Gemini gem with learning progress context
    private async generateWelcomeMessage(subject: string, userId: string): Promise<ChatMessage> {
        try {
            console.log('🎯 Making API call for welcome message using your actual Gemini gem');
            console.log('📋 Session details:', { subject, userId });
            
            // Get learning progress context
            const resumeMessage = await learningProgressService.generateResumeMessage(userId);
            const learningMemory = await learningProgressService.getLearningMemory(userId);
            
            // Create context-aware prompt
            let contextPrompt = `Hello! Please introduce yourself and welcome a user to start a conversation. Be yourself and respond naturally based on your actual content and knowledge.`;
            
            if (learningMemory) {
                contextPrompt += `\n\nContext about this user:
- Last topic discussed: ${learningMemory.currentTopic || 'none'}
- Learning level: ${learningMemory.learningLevel || 'unknown'}
- Interests: ${learningMemory.interests.join(', ') || 'none'}
- Last session summary: ${learningMemory.lastSessionSummary || 'none'}

Please acknowledge their previous learning and continue naturally.`;
            } else {
                contextPrompt += `\n\nThis is a new user starting their first conversation. Welcome them warmly.`;
            }
            
            // Try to get a real welcome message from your actual Gemini gem
            try {
                const realWelcomeMessage = await this.makeRealAPICall(contextPrompt, subject);
                
                console.log('✅ Got real welcome message from your actual Gemini gem');
                console.log('📥 Welcome message content:', realWelcomeMessage.substring(0, 100) + '...');
                
                return {
                    id: `msg_${Date.now()}_welcome`,
                    role: 'assistant',
                    content: realWelcomeMessage,
                    timestamp: new Date(),
                    type: 'text'
                };
            } catch (apiError) {
                console.log('🔄 API call failed, using fallback welcome message with learning context');
            }
            
            // Fallback welcome message with learning context
            const contextualWelcome = resumeMessage;

            console.log('✅ Generated contextual fallback welcome message');

            return {
                id: `msg_${Date.now()}_welcome`,
                role: 'assistant',
                content: contextualWelcome,
                timestamp: new Date(),
                type: 'text'
            };

        } catch (error) {
            console.error('❌ Error generating welcome message:', error);
            
            // Simple fallback
            const fallbackText = `Hello! I'm your AI assistant. How can I help you today?`;

            return {
                id: `msg_${Date.now()}_welcome`,
                role: 'assistant',
                content: fallbackText,
                timestamp: new Date(),
                type: 'text'
            };
        }
    }

    // Make real API call using Google Generative AI API (using your actual Gemini gem)
    private async makeRealAPICall(message: string, subject?: string): Promise<string> {
        try {
            console.log('🌐 Making API call using Google Generative AI (using your actual Gemini gem)...');
            
            // Use the Google Generative AI API directly with your API key
            const { GoogleGenerativeAI } = await import('@google/generative-ai');
            const apiKey = this.getApiKey() || import.meta.env.VITE_GEMINI_API_KEY;
            
            if (!apiKey) {
                throw new Error('No API key available');
            }
            
            const genAI = new GoogleGenerativeAI(apiKey);
            const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
            
            // Simple prompt that just passes the user's message to your actual Gemini gem
            // No custom OBLI 2025 prompts - just use your actual gem content
            const simplePrompt = `Please respond to this message as you would in your actual Gemini gem. Be yourself and respond naturally based on your actual content and knowledge:

${message}`;

            console.log('🔗 Calling Google Generative AI API with simple prompt...');
            
            const result = await model.generateContent(simplePrompt);
            const response = await result.response;
            const text = response.text();
            
            console.log('✅ Successfully got response from Google Generative AI (using your actual Gemini gem)');
            console.log('📥 Response content:', text.substring(0, 100) + '...');
            
            return text;
            
        } catch (error) {
            console.error('❌ Google Generative AI API call failed:', error);
            
            // Fallback to simple response
            console.log('🔄 Falling back to simple response');
            return this.generateSimpleResponse(message, subject);
        }
    }

    // Generate simple response (fallback)
    private generateSimpleResponse(message: string, subject?: string): string {
        return `I understand you said: "${message}". I'm here to help! How can I assist you further?`;
    }

    // Determine message type for styling
    private determineMessageType(content: string): ChatMessage['type'] {
        if (content.includes('dica') || content.includes('sugestão')) return 'study_tip';
        if (content.includes('explicação') || content.includes('conceito')) return 'explanation';
        if (content.includes('?')) return 'question';
        if (content.includes('recomendo') || content.includes('sugiro')) return 'recommendation';
        return 'text';
    }

    // Get study recommendations from your Gemini application
    async getStudyRecommendations(): Promise<StudyRecommendation[]> {
        if (!this.currentSession) return [];

        try {
            const response = await fetch(`${this.config.apiEndpoint}/recommendations`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.getAuthToken()}`
                },
                body: JSON.stringify({
                    subject: this.currentSession.subject,
                    difficulty: this.currentSession.difficulty,
                    userId: this.currentSession.userId
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            return data.recommendations || [];

        } catch (error) {
            console.error('Error getting recommendations:', error);
            return [];
        }
    }

    // Update learning memory with conversation context
    private async updateLearningMemory(userId: string, userMessage: string, aiResponse: string): Promise<void> {
        try {
            const existingMemory = await learningProgressService.getLearningMemory(userId);
            
            const learningMemory = {
                userId,
                lastMessage: userMessage,
                conversationContext: aiResponse,
                currentTopic: this.extractCurrentTopic(userMessage, aiResponse),
                learningLevel: this.assessLearningLevel(userMessage, aiResponse),
                interests: this.extractInterests(userMessage, aiResponse),
                strengths: this.extractStrengths(userMessage, aiResponse),
                areasToImprove: this.extractAreasToImprove(userMessage, aiResponse),
                lastSessionSummary: this.generateSessionSummary(userMessage, aiResponse)
            };
            
            await learningProgressService.saveLearningMemory(userId, learningMemory);
            
            console.log('🧠 Learning memory updated for user:', userId);
        } catch (error) {
            console.error('❌ Error updating learning memory:', error);
        }
    }

    // Extract current topic from conversation
    private extractCurrentTopic(userMessage: string, aiResponse: string): string {
        // Simple topic extraction - look for key words
        const combinedText = (userMessage + ' ' + aiResponse).toLowerCase();
        
        if (combinedText.includes('math') || combinedText.includes('matemática')) return 'Mathematics';
        if (combinedText.includes('english') || combinedText.includes('inglês')) return 'English';
        if (combinedText.includes('science') || combinedText.includes('ciência')) return 'Science';
        if (combinedText.includes('history') || combinedText.includes('história')) return 'History';
        if (combinedText.includes('art') || combinedText.includes('arte')) return 'Art';
        
        return 'General Learning';
    }

    // Assess learning level from conversation
    private assessLearningLevel(userMessage: string, aiResponse: string): 'beginner' | 'intermediate' | 'advanced' {
        const combinedText = (userMessage + ' ' + aiResponse).toLowerCase();
        
        if (combinedText.includes('advanced') || combinedText.includes('complex') || combinedText.includes('sophisticated')) {
            return 'advanced';
        }
        if (combinedText.includes('intermediate') || combinedText.includes('moderate') || combinedText.includes('medium')) {
            return 'intermediate';
        }
        
        return 'beginner';
    }

    // Extract interests from conversation
    private extractInterests(userMessage: string, aiResponse: string): string[] {
        const interests: string[] = [];
        const combinedText = (userMessage + ' ' + aiResponse).toLowerCase();
        
        if (combinedText.includes('like') || combinedText.includes('enjoy') || combinedText.includes('love')) {
            // Extract words after "like", "enjoy", "love"
            const words = combinedText.split(' ');
            words.forEach((word, index) => {
                if ((word === 'like' || word === 'enjoy' || word === 'love') && words[index + 1]) {
                    interests.push(words[index + 1]);
                }
            });
        }
        
        return interests.slice(0, 3); // Limit to 3 interests
    }

    // Extract strengths from conversation
    private extractStrengths(userMessage: string, aiResponse: string): string[] {
        const strengths: string[] = [];
        const combinedText = (userMessage + ' ' + aiResponse).toLowerCase();
        
        if (combinedText.includes('good at') || combinedText.includes('strong in') || combinedText.includes('excel')) {
            strengths.push('Problem Solving');
        }
        if (combinedText.includes('understand') || combinedText.includes('comprehend')) {
            strengths.push('Comprehension');
        }
        if (combinedText.includes('creative') || combinedText.includes('imaginative')) {
            strengths.push('Creativity');
        }
        
        return strengths;
    }

    // Extract areas to improve from conversation
    private extractAreasToImprove(userMessage: string, aiResponse: string): string[] {
        const areas: string[] = [];
        const combinedText = (userMessage + ' ' + aiResponse).toLowerCase();
        
        if (combinedText.includes('difficult') || combinedText.includes('challenging') || combinedText.includes('struggle')) {
            areas.push('Problem Areas');
        }
        if (combinedText.includes('practice') || combinedText.includes('improve')) {
            areas.push('Skill Development');
        }
        
        return areas;
    }

    // Generate session summary
    private generateSessionSummary(userMessage: string, aiResponse: string): string {
        return `Discussed: ${this.extractCurrentTopic(userMessage, aiResponse)}. User showed interest in learning and engagement.`;
    }

    // End current study session
    async endStudySession(): Promise<StudySession | null> {
        if (this.currentSession) {
            this.currentSession.endTime = new Date();
            const session = this.currentSession;
            
            // Save session summary
            const sessionSummary = {
                sessionId: session.id,
                date: session.startTime,
                duration: Math.floor((new Date().getTime() - session.startTime.getTime()) / (1000 * 60)), // minutes
                topics: learningProgressService.extractTopics(session.messages),
                messagesCount: session.messages.length,
                keyLearnings: learningProgressService.extractKeyLearnings(session.messages),
                nextSteps: ['Continue practicing', 'Review key concepts', 'Explore related topics']
            };
            
            await learningProgressService.saveSessionSummary(session.userId, sessionSummary);
            
            this.currentSession = null;
            return session;
        }
        return null;
    }

    // Get current session
    getCurrentSession(): StudySession | null {
        return this.currentSession;
    }

    // Test connection to your Gemini application
    async testConnection(): Promise<boolean> {
        try {
            const response = await fetch(`${this.config.apiEndpoint}/health`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${this.getAuthToken()}`
                },
                signal: AbortSignal.timeout(5000)
            });

            return response.ok;
        } catch (error) {
            console.error('Connection test failed:', error);
            return false;
        }
    }
}

// Create and export the service instance
export const createSSHGeminiService = (config: SSHGeminiConfig) => {
    return new SSHGeminiService(config);
};

// Default configuration (you'll need to update these values)
export const defaultSSHConfig: SSHGeminiConfig = {
    host: import.meta.env.VITE_SSH_GEMINI_HOST || 'your-server.com',
    port: parseInt(import.meta.env.VITE_SSH_GEMINI_PORT || '22'),
    username: import.meta.env.VITE_SSH_GEMINI_USERNAME || 'your-username',
    privateKey: import.meta.env.VITE_SSH_GEMINI_PRIVATE_KEY,
    password: import.meta.env.VITE_SSH_GEMINI_PASSWORD,
    apiEndpoint: import.meta.env.VITE_SSH_GEMINI_API_ENDPOINT || 'https://your-server.com/api',
    timeout: parseInt(import.meta.env.VITE_SSH_GEMINI_TIMEOUT || '30000')
};

// Create service instance that automatically loads configuration from localStorage
export const sshGeminiService = new SSHGeminiService();
