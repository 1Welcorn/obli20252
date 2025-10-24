import React, { useState, useEffect } from 'react';
import { ArrowLeftIcon } from './icons/ArrowLeftIcon';
import { ChartBarIcon } from './icons/ChartBarIcon';
import { ClockIcon } from './icons/ClockIcon';
import { TrophyIcon } from './icons/TrophyIcon';
import { FireIcon } from './icons/FireIcon';
import { BookOpenIcon } from './icons/BookOpenIcon';
import { learningProgressService } from '../services/learningProgressService';
import { LearningProgress, SessionSummary } from '../types';

interface ProgressDashboardProps {
    onBack: () => void;
    currentUser: { uid: string; email: string | null; displayName: string | null; photoURL: string | null } | null;
}

const ProgressDashboard: React.FC<ProgressDashboardProps> = ({ onBack, currentUser }) => {
    const [progress, setProgress] = useState<LearningProgress | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'all'>('week');

    useEffect(() => {
        loadProgress();
    }, [currentUser?.uid]);

    const loadProgress = async () => {
        if (!currentUser?.uid) return;
        
        setIsLoading(true);
        try {
            const progressData = await learningProgressService.getLearningProgress(currentUser.uid);
            setProgress(progressData);
        } catch (error) {
            console.error('Error loading progress:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const getFilteredSessions = () => {
        if (!progress) return [];
        
        const now = new Date();
        const filteredSessions = progress.sessionHistory.filter(session => {
            const sessionDate = new Date(session.date);
            
            switch (selectedPeriod) {
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
        
        return filteredSessions;
    };

    const calculateTotalTime = () => {
        const sessions = getFilteredSessions();
        return sessions.reduce((total, session) => total + session.duration, 0);
    };

    const getTopTopics = () => {
        if (!progress) return [];
        
        const topicCount: { [key: string]: number } = {};
        progress.sessionHistory.forEach(session => {
            session.topics.forEach(topic => {
                topicCount[topic] = (topicCount[topic] || 0) + 1;
            });
        });
        
        return Object.entries(topicCount)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 5)
            .map(([topic, count]) => ({ topic, count }));
    };

    const getLearningStreak = () => {
        if (!progress) return 0;
        
        // Simple streak calculation based on consecutive days with sessions
        let streak = 0;
        const today = new Date();
        
        for (let i = 0; i < 30; i++) {
            const checkDate = new Date(today.getTime() - i * 24 * 60 * 60 * 1000);
            const hasSessionOnDate = progress.sessionHistory.some(session => {
                const sessionDate = new Date(session.date);
                return sessionDate.toDateString() === checkDate.toDateString();
            });
            
            if (hasSessionOnDate) {
                streak++;
            } else if (i > 0) {
                break;
            }
        }
        
        return streak;
    };

    const getProgressInsights = () => {
        if (!progress) return [];
        
        const insights = [];
        
        // Learning streak insight
        const streak = getLearningStreak();
        if (streak >= 7) {
            insights.push({
                type: 'success',
                icon: '🔥',
                title: 'Amazing Consistency!',
                description: `You've maintained a ${streak}-day learning streak!`
            });
        }
        
        // Total time insight
        const totalTime = calculateTotalTime();
        if (totalTime >= 300) { // 5 hours
            insights.push({
                type: 'info',
                icon: '⏰',
                title: 'Dedicated Learner',
                description: `You've spent ${Math.round(totalTime / 60)} hours learning this ${selectedPeriod}!`
            });
        }
        
        // Topic diversity insight
        const topTopics = getTopTopics();
        if (topTopics.length >= 3) {
            insights.push({
                type: 'warning',
                icon: '📚',
                title: 'Well-Rounded Student',
                description: `You've explored ${topTopics.length} different topics!`
            });
        }
        
        return insights;
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-slate-600">Loading your progress...</p>
                </div>
            </div>
        );
    }

    if (!progress || progress.totalSessions === 0) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
                <div className="container mx-auto px-4 py-6">
                    <div className="max-w-4xl mx-auto">
                        <div className="flex items-center gap-4 mb-8">
                            <button
                                onClick={onBack}
                                className="flex items-center gap-2 px-4 py-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
                            >
                                <ArrowLeftIcon className="h-5 w-5" />
                                <span>Back</span>
                            </button>
                            <h1 className="text-3xl font-bold text-slate-800">Progress Dashboard</h1>
                        </div>
                        
                        <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
                            <div className="text-6xl mb-4">📊</div>
                            <h2 className="text-2xl font-bold text-slate-800 mb-4">No Progress Data Yet</h2>
                            <p className="text-slate-600 mb-6">
                                Start your first learning session with OBLI A.I. to see your progress here!
                            </p>
                            <button
                                onClick={onBack}
                                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                Start Learning
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    const insights = getProgressInsights();
    const topTopics = getTopTopics();
    const totalTime = calculateTotalTime();
    const streak = getLearningStreak();

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
            <div className="container mx-auto px-4 py-6">
                <div className="max-w-6xl mx-auto">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={onBack}
                                className="flex items-center gap-2 px-4 py-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
                            >
                                <ArrowLeftIcon className="h-5 w-5" />
                                <span>Back</span>
                            </button>
                            <div>
                                <h1 className="text-3xl font-bold text-slate-800">Progress Dashboard</h1>
                                <p className="text-slate-600">Track your learning journey with OBLI 2025</p>
                            </div>
                        </div>
                        
                        {/* Period Selector */}
                        <div className="flex bg-white rounded-lg p-1 shadow-sm">
                            {(['week', 'month', 'all'] as const).map((period) => (
                                <button
                                    key={period}
                                    onClick={() => setSelectedPeriod(period)}
                                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                                        selectedPeriod === period
                                            ? 'bg-blue-600 text-white'
                                            : 'text-slate-600 hover:text-slate-800'
                                    }`}
                                >
                                    {period === 'week' ? 'This Week' : period === 'month' ? 'This Month' : 'All Time'}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        <div className="bg-white rounded-xl p-6 shadow-lg">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-slate-600">Learning Streak</p>
                                    <p className="text-3xl font-bold text-orange-600">{streak}</p>
                                    <p className="text-xs text-slate-500">days</p>
                                </div>
                                <FireIcon className="h-8 w-8 text-orange-500" />
                            </div>
                        </div>
                        
                        <div className="bg-white rounded-xl p-6 shadow-lg">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-slate-600">Total Sessions</p>
                                    <p className="text-3xl font-bold text-blue-600">{progress.totalSessions}</p>
                                    <p className="text-xs text-slate-500">sessions</p>
                                </div>
                                <BookOpenIcon className="h-8 w-8 text-blue-500" />
                            </div>
                        </div>
                        
                        <div className="bg-white rounded-xl p-6 shadow-lg">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-slate-600">Total Time</p>
                                    <p className="text-3xl font-bold text-green-600">{Math.round(totalTime / 60)}</p>
                                    <p className="text-xs text-slate-500">hours</p>
                                </div>
                                <ClockIcon className="h-8 w-8 text-green-500" />
                            </div>
                        </div>
                        
                        <div className="bg-white rounded-xl p-6 shadow-lg">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-slate-600">Topics Explored</p>
                                    <p className="text-3xl font-bold text-purple-600">{progress.topicsLearned.length}</p>
                                    <p className="text-xs text-slate-500">topics</p>
                                </div>
                                <ChartBarIcon className="h-8 w-8 text-purple-500" />
                            </div>
                        </div>
                    </div>

                    {/* Insights */}
                    {insights.length > 0 && (
                        <div className="mb-8">
                            <h2 className="text-2xl font-bold text-slate-800 mb-4">Learning Insights</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {insights.map((insight, index) => (
                                    <div key={index} className="bg-white rounded-xl p-6 shadow-lg">
                                        <div className="flex items-center gap-3 mb-3">
                                            <span className="text-2xl">{insight.icon}</span>
                                            <h3 className="font-semibold text-slate-800">{insight.title}</h3>
                                        </div>
                                        <p className="text-slate-600 text-sm">{insight.description}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Top Topics */}
                        <div className="bg-white rounded-xl p-6 shadow-lg">
                            <h2 className="text-xl font-bold text-slate-800 mb-4">Most Studied Topics</h2>
                            {topTopics.length > 0 ? (
                                <div className="space-y-3">
                                    {topTopics.map((item, index) => (
                                        <div key={index} className="flex items-center justify-between">
                                            <span className="text-slate-700">{item.topic}</span>
                                            <div className="flex items-center gap-2">
                                                <div className="w-20 bg-slate-200 rounded-full h-2">
                                                    <div 
                                                        className="bg-blue-600 h-2 rounded-full" 
                                                        style={{ width: `${(item.count / Math.max(...topTopics.map(t => t.count))) * 100}%` }}
                                                    ></div>
                                                </div>
                                                <span className="text-sm text-slate-600 w-8">{item.count}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-slate-500 text-center py-4">No topics studied yet</p>
                            )}
                        </div>

                        {/* Recent Sessions */}
                        <div className="bg-white rounded-xl p-6 shadow-lg">
                            <h2 className="text-xl font-bold text-slate-800 mb-4">Recent Sessions</h2>
                            {getFilteredSessions().length > 0 ? (
                                <div className="space-y-3">
                                    {getFilteredSessions().slice(0, 5).map((session, index) => (
                                        <div key={index} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                                            <div>
                                                <p className="font-medium text-slate-800">
                                                    {new Date(session.date).toLocaleDateString()}
                                                </p>
                                                <p className="text-sm text-slate-600">
                                                    {session.duration} min • {session.messagesCount} messages
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-sm text-slate-600">
                                                    {session.topics.slice(0, 2).join(', ')}
                                                    {session.topics.length > 2 && '...'}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-slate-500 text-center py-4">No sessions in this period</p>
                            )}
                        </div>
                    </div>

                    {/* Learning Goals */}
                    {progress.learningGoals.length > 0 && (
                        <div className="mt-8 bg-white rounded-xl p-6 shadow-lg">
                            <h2 className="text-xl font-bold text-slate-800 mb-4">Learning Goals</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {progress.learningGoals.map((goal, index) => (
                                    <div key={index} className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                                        <TrophyIcon className="h-5 w-5 text-blue-600" />
                                        <span className="text-slate-800">{goal}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProgressDashboard;
