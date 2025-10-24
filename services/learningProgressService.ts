// Learning Progress Service
// Handles saving and loading student learning progress

import { LearningProgress, SessionSummary, LearningMemory } from '../types';

export class LearningProgressService {
    private static instance: LearningProgressService;
    
    public static getInstance(): LearningProgressService {
        if (!LearningProgressService.instance) {
            LearningProgressService.instance = new LearningProgressService();
        }
        return LearningProgressService.instance;
    }

    // Save learning progress to localStorage
    async saveLearningProgress(userId: string, progress: Partial<LearningProgress>): Promise<void> {
        try {
            const existingProgress = await this.getLearningProgress(userId);
            const updatedProgress: LearningProgress = {
                ...existingProgress,
                ...progress,
                userId,
                lastActivity: new Date()
            };

            const key = `learning_progress_${userId}`;
            localStorage.setItem(key, JSON.stringify(updatedProgress));
            
            console.log('✅ Learning progress saved for user:', userId);
            console.log('📊 Progress data:', updatedProgress);
        } catch (error) {
            console.error('❌ Error saving learning progress:', error);
        }
    }

    // Get learning progress from localStorage
    async getLearningProgress(userId: string): Promise<LearningProgress> {
        try {
            const key = `learning_progress_${userId}`;
            const savedProgress = localStorage.getItem(key);
            
            if (savedProgress) {
                const progress = JSON.parse(savedProgress);
                // Convert date strings back to Date objects
                progress.lastSessionDate = new Date(progress.lastSessionDate);
                progress.lastActivity = new Date(progress.lastActivity);
                progress.sessionHistory = progress.sessionHistory.map((session: any) => ({
                    ...session,
                    date: new Date(session.date)
                }));
                
                console.log('📖 Learning progress loaded for user:', userId);
                return progress;
            }
        } catch (error) {
            console.error('❌ Error loading learning progress:', error);
        }

        // Return default progress if none exists
        return this.getDefaultProgress(userId);
    }

    // Get default learning progress for new users
    private getDefaultProgress(userId: string): LearningProgress {
        return {
            userId,
            lastSessionId: '',
            lastSessionDate: new Date(),
            totalSessions: 0,
            totalMessages: 0,
            topicsLearned: [],
            currentTopics: [],
            learningStreak: 0,
            lastActivity: new Date(),
            sessionHistory: [],
            learningGoals: [],
            achievements: []
        };
    }

    // Save session summary
    async saveSessionSummary(userId: string, sessionSummary: SessionSummary): Promise<void> {
        try {
            const progress = await this.getLearningProgress(userId);
            
            // Add new session to history
            progress.sessionHistory.unshift(sessionSummary);
            
            // Keep only last 10 sessions
            if (progress.sessionHistory.length > 10) {
                progress.sessionHistory = progress.sessionHistory.slice(0, 10);
            }
            
            // Update progress
            progress.lastSessionId = sessionSummary.sessionId;
            progress.lastSessionDate = sessionSummary.date;
            progress.totalSessions += 1;
            progress.totalMessages += sessionSummary.messagesCount;
            progress.currentTopics = sessionSummary.topics;
            
            // Update learning streak
            const today = new Date();
            const lastSessionDate = new Date(progress.lastSessionDate);
            const daysDiff = Math.floor((today.getTime() - lastSessionDate.getTime()) / (1000 * 60 * 60 * 24));
            
            if (daysDiff === 1) {
                progress.learningStreak += 1;
            } else if (daysDiff > 1) {
                progress.learningStreak = 1;
            }
            
            await this.saveLearningProgress(userId, progress);
            
            console.log('✅ Session summary saved for user:', userId);
        } catch (error) {
            console.error('❌ Error saving session summary:', error);
        }
    }

    // Save learning memory (conversation context)
    async saveLearningMemory(userId: string, memory: LearningMemory): Promise<void> {
        try {
            const key = `learning_memory_${userId}`;
            localStorage.setItem(key, JSON.stringify(memory));
            
            console.log('🧠 Learning memory saved for user:', userId);
        } catch (error) {
            console.error('❌ Error saving learning memory:', error);
        }
    }

    // Get learning memory
    async getLearningMemory(userId: string): Promise<LearningMemory | null> {
        try {
            const key = `learning_memory_${userId}`;
            const savedMemory = localStorage.getItem(key);
            
            if (savedMemory) {
                const memory = JSON.parse(savedMemory);
                console.log('🧠 Learning memory loaded for user:', userId);
                return memory;
            }
        } catch (error) {
            console.error('❌ Error loading learning memory:', error);
        }
        
        return null;
    }

    // Generate resume message based on learning progress
    async generateResumeMessage(userId: string): Promise<string> {
        try {
            const progress = await this.getLearningProgress(userId);
            const memory = await this.getLearningMemory(userId);
            
            if (progress.totalSessions === 0) {
                return "Welcome! I'm excited to start learning with you. What would you like to explore today?";
            }
            
            let resumeMessage = `Welcome back! I'm glad to see you again. `;
            
            // Add streak information
            if (progress.learningStreak > 1) {
                resumeMessage += `You're on a ${progress.learningStreak}-day learning streak! 🎉 `;
            }
            
            // Add last session information
            if (progress.sessionHistory.length > 0) {
                const lastSession = progress.sessionHistory[0];
                const daysSinceLastSession = Math.floor(
                    (new Date().getTime() - new Date(lastSession.date).getTime()) / (1000 * 60 * 60 * 24)
                );
                
                if (daysSinceLastSession === 0) {
                    resumeMessage += `You were here earlier today. `;
                } else if (daysSinceLastSession === 1) {
                    resumeMessage += `You were here yesterday. `;
                } else {
                    resumeMessage += `It's been ${daysSinceLastSession} days since your last session. `;
                }
                
                // Add topics from last session
                if (lastSession.topics.length > 0) {
                    resumeMessage += `Last time we worked on: ${lastSession.topics.join(', ')}. `;
                }
                
                // Add key learnings
                if (lastSession.keyLearnings.length > 0) {
                    resumeMessage += `You learned about: ${lastSession.keyLearnings.join(', ')}. `;
                }
                
                // Add next steps
                if (lastSession.nextSteps.length > 0) {
                    resumeMessage += `We planned to work on: ${lastSession.nextSteps.join(', ')}. `;
                }
            }
            
            // Add memory context if available
            if (memory) {
                if (memory.currentTopic) {
                    resumeMessage += `We were discussing: ${memory.currentTopic}. `;
                }
                if (memory.learningLevel) {
                    resumeMessage += `Your current level is: ${memory.learningLevel}. `;
                }
            }
            
            resumeMessage += `Would you like to continue where we left off, or explore something new?`;
            
            return resumeMessage;
            
        } catch (error) {
            console.error('❌ Error generating resume message:', error);
            return "Welcome back! I'm excited to continue learning with you. What would you like to explore today?";
        }
    }

    // Generate comprehensive progress summary
    async generateProgressSummary(userId: string, period: 'week' | 'month' | 'all' = 'all'): Promise<string> {
        try {
            const progress = await this.getLearningProgress(userId);
            
            if (progress.totalSessions === 0) {
                return "No learning progress to summarize yet. Start your first session to begin tracking your journey!";
            }

            let summary = `📊 **Learning Progress Summary**\n\n`;
            
            // Period filter
            const now = new Date();
            const filteredSessions = progress.sessionHistory.filter(session => {
                const sessionDate = new Date(session.date);
                switch (period) {
                    case 'week':
                        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                        return sessionDate >= weekAgo;
                    case 'month':
                        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
                        return sessionDate >= monthAgo;
                    default:
                        return true;
                }
            });

            // Overall stats
            const totalTime = filteredSessions.reduce((total, session) => total + session.duration, 0);
            const totalMessages = filteredSessions.reduce((total, session) => total + session.messagesCount, 0);
            
            summary += `**📈 Overall Performance**\n`;
            summary += `• Sessions: ${filteredSessions.length}\n`;
            summary += `• Total Time: ${Math.round(totalTime / 60)} hours ${totalTime % 60} minutes\n`;
            summary += `• Messages: ${totalMessages}\n`;
            summary += `• Learning Streak: ${progress.learningStreak} days\n\n`;

            // Topic analysis
            const topicCount: { [key: string]: number } = {};
            filteredSessions.forEach(session => {
                session.topics.forEach(topic => {
                    topicCount[topic] = (topicCount[topic] || 0) + 1;
                });
            });

            if (Object.keys(topicCount).length > 0) {
                const topTopics = Object.entries(topicCount)
                    .sort(([,a], [,b]) => b - a)
                    .slice(0, 5);

                summary += `**📚 Most Studied Topics**\n`;
                topTopics.forEach(([topic, count], index) => {
                    summary += `${index + 1}. ${topic} (${count} sessions)\n`;
                });
                summary += `\n`;
            }

            // Learning insights
            summary += `**💡 Learning Insights**\n`;
            
            // Consistency insight
            if (progress.learningStreak >= 7) {
                summary += `🔥 Amazing consistency! You've maintained a ${progress.learningStreak}-day streak.\n`;
            } else if (progress.learningStreak >= 3) {
                summary += `📅 Good consistency with a ${progress.learningStreak}-day streak.\n`;
            }

            // Time insight
            if (totalTime >= 300) { // 5 hours
                summary += `⏰ Dedicated learner! You've spent ${Math.round(totalTime / 60)} hours learning.\n`;
            } else if (totalTime >= 120) { // 2 hours
                summary += `📖 Steady progress with ${Math.round(totalTime / 60)} hours of learning.\n`;
            }

            // Topic diversity
            const uniqueTopics = new Set<string>();
            filteredSessions.forEach(session => {
                session.topics.forEach(topic => uniqueTopics.add(topic));
            });

            if (uniqueTopics.size >= 5) {
                summary += `🌟 Well-rounded student! You've explored ${uniqueTopics.size} different topics.\n`;
            } else if (uniqueTopics.size >= 3) {
                summary += `📚 Good topic diversity with ${uniqueTopics.size} subjects explored.\n`;
            }

            // Recent achievements
            if (progress.achievements.length > 0) {
                summary += `\n**🏆 Recent Achievements**\n`;
                progress.achievements.slice(0, 3).forEach(achievement => {
                    summary += `• ${achievement}\n`;
                });
            }

            // Recommendations
            summary += `\n**🎯 Recommendations**\n`;
            
            if (progress.learningStreak < 3) {
                summary += `• Try to maintain a consistent learning schedule\n`;
            }
            
            if (uniqueTopics.size < 3) {
                summary += `• Explore new topics to broaden your knowledge\n`;
            }
            
            if (totalTime < 60) {
                summary += `• Increase session duration for deeper learning\n`;
            }

            summary += `• Keep up the great work and continue your learning journey!\n`;

            return summary;

        } catch (error) {
            console.error('❌ Error generating progress summary:', error);
            return "Unable to generate progress summary at this time.";
        }
    }

    // Get learning analytics
    async getLearningAnalytics(userId: string): Promise<{
        totalSessions: number;
        totalTime: number;
        averageSessionLength: number;
        learningStreak: number;
        topTopics: Array<{ topic: string; count: number; time: number }>;
        weeklyProgress: Array<{ week: string; sessions: number; time: number }>;
        learningVelocity: number;
        consistencyScore: number;
    }> {
        try {
            const progress = await this.getLearningProgress(userId);
            
            // Calculate basic metrics
            const totalSessions = progress.sessionHistory.length;
            const totalTime = progress.sessionHistory.reduce((total, session) => total + session.duration, 0);
            const averageSessionLength = totalSessions > 0 ? totalTime / totalSessions : 0;

            // Topic analysis with time
            const topicData: { [key: string]: { count: number; time: number } } = {};
            progress.sessionHistory.forEach(session => {
                session.topics.forEach(topic => {
                    if (!topicData[topic]) {
                        topicData[topic] = { count: 0, time: 0 };
                    }
                    topicData[topic].count++;
                    topicData[topic].time += session.duration;
                });
            });

            const topTopics = Object.entries(topicData)
                .sort(([,a], [,b]) => b.count - a.count)
                .slice(0, 10)
                .map(([topic, data]) => ({ topic, ...data }));

            // Weekly progress (last 8 weeks)
            const weeklyData: { [key: string]: { sessions: number; time: number } } = {};
            const now = new Date();
            
            for (let i = 0; i < 8; i++) {
                const weekStart = new Date(now.getTime() - i * 7 * 24 * 60 * 60 * 1000);
                const weekKey = weekStart.toISOString().split('T')[0];
                weeklyData[weekKey] = { sessions: 0, time: 0 };
            }

            progress.sessionHistory.forEach(session => {
                const sessionDate = new Date(session.date);
                const weekStart = new Date(sessionDate.getTime() - sessionDate.getDay() * 24 * 60 * 60 * 1000);
                const weekKey = weekStart.toISOString().split('T')[0];
                
                if (weeklyData[weekKey]) {
                    weeklyData[weekKey].sessions++;
                    weeklyData[weekKey].time += session.duration;
                }
            });

            const weeklyProgress = Object.entries(weeklyData)
                .sort(([a], [b]) => a.localeCompare(b))
                .map(([week, data]) => ({ week, ...data }));

            // Learning velocity (sessions per week)
            const learningVelocity = progress.sessionHistory.length > 0 
                ? (progress.sessionHistory.length / Math.max(1, Math.floor((now.getTime() - new Date(progress.sessionHistory[progress.sessionHistory.length - 1].date).getTime()) / (7 * 24 * 60 * 60 * 1000))))
                : 0;

            // Consistency score (0-100)
            const consistencyScore = Math.min(100, (progress.learningStreak / 7) * 100);

            return {
                totalSessions,
                totalTime,
                averageSessionLength,
                learningStreak: progress.learningStreak,
                topTopics,
                weeklyProgress,
                learningVelocity,
                consistencyScore
            };

        } catch (error) {
            console.error('❌ Error getting learning analytics:', error);
            return {
                totalSessions: 0,
                totalTime: 0,
                averageSessionLength: 0,
                learningStreak: 0,
                topTopics: [],
                weeklyProgress: [],
                learningVelocity: 0,
                consistencyScore: 0
            };
        }
    }

    // Extract key learnings from conversation
    extractKeyLearnings(messages: any[]): string[] {
        const learnings: string[] = [];
        
        // Simple extraction - look for messages that contain learning indicators
        messages.forEach(message => {
            if (message.role === 'assistant' && message.content) {
                const content = message.content.toLowerCase();
                
                // Look for learning indicators
                if (content.includes('learned') || content.includes('understand') || 
                    content.includes('concept') || content.includes('principle') ||
                    content.includes('important') || content.includes('key point')) {
                    
                    // Extract the main topic (simplified)
                    const sentences = message.content.split('.');
                    sentences.forEach(sentence => {
                        if (sentence.length > 20 && sentence.length < 100) {
                            learnings.push(sentence.trim());
                        }
                    });
                }
            }
        });
        
        // Return unique learnings, limited to 5
        return [...new Set(learnings)].slice(0, 5);
    }

    // Extract topics from conversation
    extractTopics(messages: any[]): string[] {
        const topics: string[] = [];
        
        // Simple topic extraction
        messages.forEach(message => {
            if (message.role === 'assistant' && message.content) {
                const content = message.content.toLowerCase();
                
                // Look for topic indicators
                if (content.includes('topic') || content.includes('subject') || 
                    content.includes('about') || content.includes('regarding')) {
                    
                    // Extract potential topics (simplified)
                    const words = message.content.split(' ');
                    words.forEach((word, index) => {
                        if (word.toLowerCase() === 'about' && words[index + 1]) {
                            topics.push(words[index + 1]);
                        }
                    });
                }
            }
        });
        
        // Return unique topics, limited to 5
        return [...new Set(topics)].slice(0, 5);
    }
}

// Export singleton instance
export const learningProgressService = LearningProgressService.getInstance();
