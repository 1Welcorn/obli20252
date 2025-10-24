import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeftIcon } from './icons/ArrowLeftIcon';
import { SendIcon } from './icons/SendIcon';
import { SparklesIcon } from './icons/SparklesIcon';
import { obliAIService, ChatMessage, StudySession } from '../services/obliAIService';
import { learningProgressService } from '../services/learningProgressService';

interface OBLIAIProps {
    onBack: () => void;
    isPortugueseHelpVisible: boolean;
    currentUser: { uid: string; email: string | null; displayName: string | null; photoURL: string | null } | null;
}

const OBLIAI: React.FC<OBLIAIProps> = ({ onBack, isPortugueseHelpVisible, currentUser }) => {
    const [currentSession, setCurrentSession] = useState<StudySession | null>(null);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [inputMessage, setInputMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isStarting, setIsStarting] = useState(false);
    const [isUsingCustomGemini, setIsUsingCustomGemini] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);




    // Check if using custom Gemini
    useEffect(() => {
        const savedConfig = localStorage.getItem('sshGeminiConfig');
        if (savedConfig) {
            setIsUsingCustomGemini(true);
        }
    }, []);

    // Auto-scroll to bottom of messages
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Start a new study session
    const startStudySession = async () => {
        if (isStarting) return;
        
        setIsStarting(true);
        try {
            const session = await obliAIService.startStudySession(
                currentUser?.uid || 'anonymous',
                'General',
                'intermediate'
            );
            setCurrentSession(session);
            setMessages(session.messages);
        } catch (error) {
            console.error('Error starting study session:', error);
        } finally {
            setIsStarting(false);
        }
    };

    // Send a message to the AI
    const sendMessage = async () => {
        if (!inputMessage.trim() || isLoading) return;
        
        const userMessage: ChatMessage = {
            id: `msg_${Date.now()}_user`,
            role: 'user',
            content: inputMessage,
            timestamp: new Date(),
            type: 'text'
        };
        
        setMessages(prev => [...prev, userMessage]);
        setInputMessage('');
        setIsLoading(true);
        
        try {
            const response = await obliAIService.sendMessage(inputMessage);
            setMessages(prev => [...prev, response]);
        } catch (error) {
            console.error('Error sending message:', error);
        } finally {
            setIsLoading(false);
        }
    };



    // Handle Enter key press
    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    // Get message type styling
    const getMessageTypeStyle = (type?: ChatMessage['type']) => {
        switch (type) {
            case 'study_tip':
                return 'bg-yellow-50 border-yellow-200 text-yellow-800';
            case 'explanation':
                return 'bg-blue-50 border-blue-200 text-blue-800';
            case 'question':
                return 'bg-green-50 border-green-200 text-green-800';
            case 'recommendation':
                return 'bg-purple-50 border-purple-200 text-purple-800';
            default:
                return 'bg-slate-50 border-slate-200 text-slate-800';
        }
    };


    // Session setup screen
    if (!currentSession) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
                <div className="container mx-auto px-4 py-6">
                    {/* OBLI 2025 Header */}
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center gap-4 mb-4">
                            <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl flex items-center justify-center shadow-lg">
                                <span className="text-2xl font-bold text-white">O</span>
                            </div>
                            <div className="text-center">
                                <h1 className="text-3xl font-bold text-slate-800">OBLI 2025</h1>
                                <p className="text-lg text-slate-600 font-medium">Inteligência Artificial Educacional</p>
                            </div>
                            <div className="w-16 h-16 bg-gradient-to-br from-indigo-600 to-purple-700 rounded-2xl flex items-center justify-center shadow-lg">
                                <span className="text-2xl font-bold text-white">I</span>
                            </div>
                        </div>
                        
                        {isUsingCustomGemini && (
                            <div className="flex items-center justify-center gap-2 mb-4">
                                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                                <span className="text-sm text-green-600 font-medium bg-green-50 px-3 py-1 rounded-full">
                                    Conectado ao OBLI 2025 Personalizado
                                </span>
                            </div>
                        )}
                        
                        <button
                            onClick={onBack}
                            className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-800 transition-colors bg-white px-4 py-2 rounded-lg shadow-sm border border-slate-200"
                        >
                            <ArrowLeftIcon className="h-4 w-4" />
                            Voltar ao Dashboard
                        </button>
                    </div>

                    {/* OBLI 2025 Study Configuration */}
                    <div className="max-w-2xl mx-auto">
                        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
                            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-6 py-4">
                                <h2 className="text-xl font-bold text-white text-center">
                                    Configure sua Sessão de Estudos OBLI 2025
                                </h2>
                            </div>
                            
                            <div className="p-6">
                                <div className="text-center mb-6">
                                    <div className="w-20 h-20 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <SparklesIcon className="h-10 w-10 text-indigo-600" />
                                    </div>
                                    <p className="text-slate-600">
                                        Personalize sua experiência de aprendizado com o OBLI 2025
                                    </p>
                                </div>

                                <div className="text-center">
                                    <p className="text-slate-600 mb-6">
                                        Clique no botão abaixo para começar sua jornada de preparação para o OBLI 2025.2!
                                        <br />
                                        <span className="text-sm text-slate-500 mt-2 block">
                                            Você poderá escolher sua matéria de interesse diretamente no chat.
                                        </span>
                                    </p>
                                </div>

                                <div className="text-center mt-8">
                                    <button
                                        onClick={startStudySession}
                                        disabled={isStarting}
                                        className="px-12 py-4 bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-xl hover:from-blue-700 hover:to-indigo-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3 shadow-xl text-lg font-semibold"
                                    >
                                        {isStarting ? (
                                            <>
                                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                                Iniciando OBLI 2025...
                                            </>
                                        ) : (
                                            <>
                                                <SparklesIcon className="h-6 w-6" />
                                                Iniciar Sessão OBLI 2025
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        );
    }

    // Chat interface
    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
            <div className="container mx-auto px-4 py-6">
                {/* OBLI 2025 Chat Header */}
                <div className="bg-white rounded-2xl shadow-xl border border-slate-200 mb-6 overflow-hidden">
                    <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-6 py-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <button
                                    onClick={onBack}
                                    className="flex items-center gap-2 text-white hover:text-blue-100 transition-colors"
                                >
                                    <ArrowLeftIcon className="h-5 w-5" />
                                    <span className="font-medium">Voltar</span>
                                </button>
                                <div className="h-6 w-px bg-white/30"></div>
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                                        <SparklesIcon className="h-5 w-5 text-white" />
                                    </div>
                                    <div>
                                        <h1 className="text-xl font-bold text-white">OBLI 2025</h1>
                                        <p className="text-blue-100 text-sm">Assistente de Competição de Fluência</p>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="flex items-center gap-3">
                                {isUsingCustomGemini && (
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                                        <span className="text-green-100 text-sm font-medium">OBLI 2025 Personalizado</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Chat Messages */}
                <div className="bg-white rounded-2xl shadow-xl border border-slate-200 mb-6 overflow-hidden">
                    <div className="h-96 overflow-y-auto p-6 space-y-4">
                        {messages.map((message) => (
                            <div
                                key={message.id}
                                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                            >
                                <div
                                    className={`max-w-3xl p-4 rounded-2xl ${
                                        message.role === 'user'
                                            ? 'bg-gradient-to-r from-blue-600 to-indigo-700 text-white'
                                            : `bg-slate-50 border ${getMessageTypeStyle(message.type)}`
                                    }`}
                                >
                                    <div className="flex items-start gap-3">
                                        {message.role === 'assistant' && (
                                            <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                                                <span className="text-white text-sm font-bold">O</span>
                                            </div>
                                        )}
                                        <div className="flex-1">
                                            <div className="whitespace-pre-wrap">{message.content}</div>
                                            <div className={`text-xs mt-2 ${
                                                message.role === 'user' ? 'text-blue-100' : 'text-slate-500'
                                            }`}>
                                                {message.timestamp.toLocaleTimeString()}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                        
                        {isLoading && (
                            <div className="flex justify-start">
                                <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center">
                                            <span className="text-white text-sm font-bold">O</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                                            <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                                            <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                        
                        <div ref={messagesEndRef} />
                    </div>
                </div>

                {/* Message Input */}
                <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-6">
                    <div className="flex gap-4">
                        <div className="flex-1">
                            <textarea
                                value={inputMessage}
                                onChange={(e) => setInputMessage(e.target.value)}
                                onKeyPress={handleKeyPress}
                                placeholder="Digite sua pergunta sobre OBLI 2025..."
                                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                                rows={3}
                                disabled={isLoading}
                            />
                        </div>
                        <div className="flex flex-col gap-2">
                            <button
                                onClick={sendMessage}
                                disabled={!inputMessage.trim() || isLoading}
                                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-lg hover:from-blue-700 hover:to-indigo-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                            >
                                <SendIcon className="h-5 w-5" />
                                Enviar
                            </button>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default OBLIAI;