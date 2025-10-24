import { GoogleGenerativeAI } from '@google/generative-ai';
import { sshGeminiService, createSSHGeminiService, defaultSSHConfig } from './sshGeminiService';

// Initialize Gemini AI (fallback to direct API)
const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY || 'your-api-key-here');
const model = genAI.getGenerativeModel({ model: "gemini-pro" });

// Check if SSH configuration is available in localStorage
const getSSHConfig = () => {
    try {
        const savedConfig = localStorage.getItem('sshGeminiConfig');
        console.log('🔍 Checking localStorage for SSH config:', savedConfig);
        return savedConfig ? JSON.parse(savedConfig) : null;
    } catch (error) {
        console.error('❌ Error loading SSH config:', error);
        return null;
    }
};

// Check if SSH integration should be used (dynamic check)
const shouldUseSSHIntegration = () => {
    const envFlag = import.meta.env.VITE_USE_SSH_GEMINI === 'true';
    const savedConfig = getSSHConfig() !== null;
    const shouldUse = envFlag || savedConfig;
    
    console.log('🔍 SSH Integration Check:', {
        envFlag,
        savedConfig,
        shouldUse,
        config: getSSHConfig()
    });
    
    return shouldUse;
};

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
    estimatedTime: number; // in minutes
    priority: 'high' | 'medium' | 'low';
}

class OBLIAIService {
    private currentSession: StudySession | null = null;

    // Initialize a new study session
    async startStudySession(userId: string, subject: string, difficulty: 'beginner' | 'intermediate' | 'advanced'): Promise<StudySession> {
        // Use SSH service if configured
        if (shouldUseSSHIntegration()) {
            console.log('🚀 Using SSH service for study session');
            return await sshGeminiService.startStudySession(userId, subject);
        }
        
        console.log('📚 Using default Gemini API for study session');

        const session: StudySession = {
            id: `session_${Date.now()}`,
            userId,
            subject,
            messages: [],
            startTime: new Date(),
            topics: [],
            difficulty
        };

        // Add welcome message
        const welcomeMessage = await this.generateWelcomeMessage(subject, difficulty);
        session.messages.push(welcomeMessage);
        
        this.currentSession = session;
        return session;
    }

    // Send a message to the AI and get response
    async sendMessage(message: string, context?: string): Promise<ChatMessage> {
        // Use SSH service if configured
        if (shouldUseSSHIntegration()) {
            console.log('🚀 Using SSH service for message:', message);
            return await sshGeminiService.sendMessage(message, context);
        }
        
        console.log('📚 Using default Gemini API for message:', message);

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
            // Generate AI response
            const aiResponse = await this.generateAIResponse(message, context);
            this.currentSession.messages.push(aiResponse);
            
            return aiResponse;
        } catch (error) {
            console.error('Error generating AI response:', error);
            const errorMessage: ChatMessage = {
                id: `msg_${Date.now()}_error`,
                role: 'assistant',
                content: 'I apologize, but I encountered an error. Please try again.',
                timestamp: new Date(),
                type: 'text'
            };
            this.currentSession.messages.push(errorMessage);
            return errorMessage;
        }
    }

    // Generate AI response based on context
    private async generateAIResponse(message: string, context?: string): Promise<ChatMessage> {
        const prompt = this.buildStudyPrompt(message, context);
        
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        return {
            id: `msg_${Date.now()}_ai`,
            role: 'assistant',
            content: text,
            timestamp: new Date(),
            type: this.determineMessageType(text)
        };
    }

    // Build study-specific prompt
    private buildStudyPrompt(message: string, context?: string): string {
        const session = this.currentSession;
        if (!session) return message;

        const basePrompt = `You are OBLI A.I., an intelligent study assistant for Brazilian students. You help with learning, explanations, and study guidance.

Current Study Session:
- Subject: ${session.subject}
- Difficulty Level: ${session.difficulty}
- Student Level: Brazilian Portuguese speaker

Guidelines:
1. Respond in Portuguese (Brazilian Portuguese)
2. Be encouraging and supportive
3. Provide clear, educational explanations
4. Adapt complexity to ${session.difficulty} level
5. Include practical examples when relevant
6. Ask follow-up questions to engage the student
7. Provide study tips and techniques

Student Message: ${message}

${context ? `Additional Context: ${context}` : ''}

Please provide a helpful, educational response that will aid the student's learning.`;

        return basePrompt;
    }

    // Generate welcome message
    private async generateWelcomeMessage(subject: string, difficulty: string): Promise<ChatMessage> {
        const welcomeText = `Olá! Sou o OBLI A.I., seu assistente de estudos inteligente! 🤖📚

Estou aqui para ajudá-lo com ${subject} no nível ${difficulty}. Posso:
• Explicar conceitos complexos de forma simples
• Responder suas dúvidas
• Dar dicas de estudo
• Criar exercícios práticos
• Ajudar com revisões

Como posso ajudá-lo hoje? Faça uma pergunta ou me diga o que gostaria de estudar!`;

        return {
            id: `msg_${Date.now()}_welcome`,
            role: 'assistant',
            content: welcomeText,
            timestamp: new Date(),
            type: 'text'
        };
    }

    // Determine message type for styling
    private determineMessageType(content: string): ChatMessage['type'] {
        if (content.includes('dica') || content.includes('sugestão')) return 'study_tip';
        if (content.includes('explicação') || content.includes('conceito')) return 'explanation';
        if (content.includes('?')) return 'question';
        if (content.includes('recomendo') || content.includes('sugiro')) return 'recommendation';
        return 'text';
    }

    // Get study recommendations
    async getStudyRecommendations(): Promise<StudyRecommendation[]> {
        // Use SSH service if configured
        if (shouldUseSSHIntegration()) {
            return await sshGeminiService.getStudyRecommendations();
        }

        if (!this.currentSession) return [];

        const prompt = `Based on the study session for ${this.currentSession.subject} at ${this.currentSession.difficulty} level, provide 3-5 study recommendations. 
        Include topics to review, exercises to practice, and study techniques. Format as JSON array with type, title, description, difficulty, estimatedTime, and priority.`;

        try {
            const result = await model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();
            
            // Parse JSON response (in real implementation, you'd want better error handling)
            const recommendations = JSON.parse(text);
            return recommendations.map((rec: any, index: number) => ({
                id: `rec_${Date.now()}_${index}`,
                ...rec
            }));
        } catch (error) {
            console.error('Error generating recommendations:', error);
            return [];
        }
    }

    // End current study session
    async endStudySession(): Promise<StudySession | null> {
        // Use SSH service if configured
        if (shouldUseSSHIntegration()) {
            return await sshGeminiService.endStudySession();
        }

        if (this.currentSession) {
            this.currentSession.endTime = new Date();
            const session = this.currentSession;
            this.currentSession = null;
            return session;
        }
        return null;
    }

    // Get current session
    getCurrentSession(): StudySession | null {
        // Use SSH service if configured
        if (shouldUseSSHIntegration()) {
            return sshGeminiService.getCurrentSession();
        }
        return this.currentSession;
    }

    // Get session history (mock implementation)
    async getSessionHistory(userId: string): Promise<StudySession[]> {
        // In a real implementation, this would fetch from Firebase
        return [];
    }
}

export const obliAIService = new OBLIAIService();
