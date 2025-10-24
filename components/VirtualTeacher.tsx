import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI, Chat } from "@google/genai";
import type { GenerateContentResponse } from "@google/genai";
import type { ChatMessage } from '../types';
import { TeacherIcon } from './icons/TeacherIcon';
import { CloseIcon } from './icons/CloseIcon';
import { SendIcon } from './icons/SendIcon';

let ai: GoogleGenAI | null = null;
const getAi = (): GoogleGenAI => {
    if (ai) return ai;

    if (!process.env.API_KEY) {
        throw new Error("API_KEY environment variable is not set.");
    }
    ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    return ai;
};


interface VirtualTeacherProps {
    isPortugueseHelpVisible: boolean;
}

const VirtualTeacher: React.FC<VirtualTeacherProps> = ({ isPortugueseHelpVisible }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [chat, setChat] = useState<Chat | null>(null);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [userInput, setUserInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [initError, setInitError] = useState<string | null>(null);
    const messagesEndRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        if (isOpen && !chat && !initError) {
            try {
                const newChat = getAi().chats.create({
                    model: 'gemini-2.5-flash',
                    config: {
                        systemInstruction: 'You are a caring, patient, and encouraging English teacher named Alex. You are bilingual in English and Brazilian Portuguese. Your goal is to help a student preparing for the OBLI fluency competition in Brazil. If the student asks a question in Portuguese, respond in clear, helpful Portuguese. If they write in English, respond in English. Keep your answers concise, friendly, and helpful. Use emojis to make the conversation more engaging.',
                    },
                });
                setChat(newChat);
                const initialMessage = isPortugueseHelpVisible
                    ? "Hello! I'm Alex, your virtual teacher. How can I help you prepare for OBLI today? 😊\n\n(Olá! Eu sou Alex, seu professor virtual. Fique à vontade para perguntar em português se precisar!)"
                    : "Hello! I'm Alex, your virtual teacher. How can I help you prepare for OBLI today? 😊";
                setMessages([{ sender: 'ai', text: initialMessage }]);
            } catch (error) {
                console.error("Failed to initialize virtual teacher:", error);
                const errorMessage = "I'm having trouble starting up. The AI service may not be configured correctly. 😔";
                setInitError(errorMessage);
                setMessages([{ sender: 'ai', text: errorMessage }]);
            }
        }
    }, [isOpen, chat, isPortugueseHelpVisible, initError]);
    
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleSendMessage = async () => {
        if (!userInput.trim() || !chat || isLoading) return;
        
        const userMessage: ChatMessage = { sender: 'user', text: userInput };
        setMessages(prev => [...prev, userMessage]);
        setUserInput('');
        setIsLoading(true);

        try {
            const stream = await chat.sendMessageStream({ message: userInput });
            
            let aiResponseText = '';
            setMessages(prev => [...prev, { sender: 'ai', text: '...' }]);

            for await (const chunk of stream) {
                aiResponseText += chunk.text;
                setMessages(prev => {
                    const newMessages = [...prev];
                    newMessages[newMessages.length - 1] = { sender: 'ai', text: aiResponseText };
                    return newMessages;
                });
            }

        } catch (error) {
            console.error("Error sending message:", error);
            setMessages(prev => [...prev, { sender: 'ai', text: "Oops! I'm having a little trouble connecting. Please try again." }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="fixed bottom-6 right-6 bg-indigo-600 text-white rounded-full p-4 shadow-lg hover:bg-indigo-700 transition-transform duration-200 hover:scale-110 z-50"
                aria-label="Open virtual teacher chat"
            >
                <TeacherIcon className="h-8 w-8" />
            </button>

            {isOpen && (
                <div className="fixed bottom-24 right-6 w-full max-w-sm h-[60vh] bg-white rounded-2xl shadow-2xl flex flex-col z-50 animate-fade-in-up">
                    <header className="flex items-center justify-between p-4 bg-indigo-600 text-white rounded-t-2xl">
                        <div className="flex items-center gap-3">
                            <TeacherIcon className="h-6 w-6" />
                            <h3 className="font-bold text-lg">Virtual Teacher Alex</h3>
                        </div>
                        <button onClick={() => setIsOpen(false)}><CloseIcon className="h-6 w-6" /></button>
                    </header>

                    <div className="flex-grow p-4 overflow-y-auto bg-slate-50">
                        {messages.map((msg, index) => (
                            <div key={index} className={`flex mb-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`rounded-xl px-4 py-2 max-w-[80%] whitespace-pre-wrap ${msg.sender === 'user' ? 'bg-indigo-500 text-white' : 'bg-slate-200 text-slate-800'}`}>
                                    {msg.text}
                                </div>
                            </div>
                        ))}
                         <div ref={messagesEndRef} />
                    </div>

                    <footer className="p-4 border-t border-slate-200 bg-white rounded-b-2xl">
                        <div className="flex items-center gap-2">
                            <input
                                type="text"
                                value={userInput}
                                onChange={(e) => setUserInput(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                                placeholder={isPortugueseHelpVisible ? "Ask me anything... (Pergunte-me...)" : "Ask me anything..."}
                                className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                disabled={isLoading || !!initError}
                            />
                            <button onClick={handleSendMessage} disabled={isLoading || !userInput.trim() || !!initError} className="bg-indigo-600 text-white p-2 rounded-lg disabled:bg-slate-400">
                                <SendIcon className="h-6 w-6" />
                            </button>
                        </div>
                    </footer>
                </div>
            )}
        </>
    );
};

export default VirtualTeacher;