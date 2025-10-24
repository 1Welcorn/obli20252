import React, { useState, useEffect } from 'react';
import { ArrowLeftIcon } from './icons/ArrowLeftIcon';
import { TrophyIcon } from './icons/TrophyIcon';
import { SparklesIcon } from './icons/SparklesIcon';
import { TrendingUpIcon } from './icons/TrendingUpIcon';
import { CheckCircleIcon } from './icons/CheckCircleIcon';
import XCircleIcon from './icons/XCircleIcon';
import { ClockIcon } from './icons/ClockIcon';
import { LightBulbIcon } from './icons/LightBulbIcon';
import { SendIcon } from './icons/SendIcon';
import { FireIcon } from './icons/FireIcon';

interface ChallengeArenaProps {
    onBack: () => void;
    isPortugueseHelpVisible: boolean;
    currentUser: { uid: string; email: string | null; displayName: string | null; photoURL: string | null } | null;
    leaderboard?: any[];
    onLeaderboardUpdate?: () => void;
}

type ChallengeType = 'riddle' | 'word_hunt' | 'logic_puzzle' | 'word_play' | 'math_challenge' | 'trivia' | 'enigmas';
type ChallengeLevel = 'beginner' | 'intermediate' | 'advanced' | 'expert' | 'master';

const ChallengeArena: React.FC<ChallengeArenaProps> = ({ onBack, isPortugueseHelpVisible, currentUser, leaderboard: propLeaderboard, onLeaderboardUpdate }) => {
    console.log('ChallengeArena received props:', { 
        currentUser, 
        propLeaderboard, 
        hasOnLeaderboardUpdate: !!onLeaderboardUpdate 
    });
    const [showLeaderboard, setShowLeaderboard] = useState(false);
    const [selectedLevel, setSelectedLevel] = useState<ChallengeLevel>('beginner');
    const [selectedType, setSelectedType] = useState<ChallengeType>('riddle');
    const [currentChallenge, setCurrentChallenge] = useState<any>(null);
    const [userAnswer, setUserAnswer] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showResult, setShowResult] = useState(false);
    const [isCorrect, setIsCorrect] = useState(false);
    const [pointsEarned, setPointsEarned] = useState(0);
    const [timer, setTimer] = useState(0);
    const [hintsUsed, setHintsUsed] = useState(0);
    const [showHint, setShowHint] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Mock data for stable demonstration
    const userStats = {
        totalChallenges: 5,
        correctAnswers: 4,
        totalPoints: 120,
        averageTime: 45,
        currentLevel: 'beginner' as ChallengeLevel,
        levelProgress: 45
    };

    // Use real leaderboard data from props, only show mock data if no props are provided at all
    const leaderboard = propLeaderboard !== undefined ? propLeaderboard : [
        { userId: '1', displayName: 'Alice Johnson', email: 'alice@example.com', totalPoints: 250, correctAnswers: 8, totalChallenges: 10, winStreak: 3 },
        { userId: '2', displayName: 'Bob Smith', email: 'bob@example.com', totalPoints: 180, correctAnswers: 6, totalChallenges: 8, winStreak: 1 },
        { userId: '3', displayName: 'Carol Davis', email: 'carol@example.com', totalPoints: 150, correctAnswers: 5, totalChallenges: 7, winStreak: 0 }
    ];

    // Challenge levels with progressive difficulty
    const challengeLevels = [
        { level: 'beginner', name: 'Beginner', description: 'Start your journey with simple challenges', requiredPoints: 0, color: 'bg-green-500', icon: '🌱' },
        { level: 'intermediate', name: 'Intermediate', description: 'Build your skills with moderate challenges', requiredPoints: 100, color: 'bg-blue-500', icon: '📚' },
        { level: 'advanced', name: 'Advanced', description: 'Tackle complex problems and puzzles', requiredPoints: 300, color: 'bg-purple-500', icon: '🎯' },
        { level: 'expert', name: 'Expert', description: 'Master-level challenges for the skilled', requiredPoints: 600, color: 'bg-orange-500', icon: '🏆' },
        { level: 'master', name: 'Master', description: 'Ultimate challenges for the elite', requiredPoints: 1000, color: 'bg-red-500', icon: '👑' }
    ];

    // Challenge types available at all levels
    const challengeTypes = [
        { type: 'riddle', name: 'Riddles', description: 'Solve clever word puzzles and brain teasers', icon: '🧩' },
        { type: 'word_hunt', name: 'Word Hunt', description: 'Find hidden words in letter grids', icon: '🔍' },
        { type: 'logic_puzzle', name: 'Logic Puzzles', description: 'Use reasoning to solve complex problems', icon: '🧠' },
        { type: 'word_play', name: 'Word Play', description: 'Creative language and word games', icon: '📝' },
        { type: 'math_challenge', name: 'Math Challenge', description: 'Mathematical problems and equations', icon: '🔢' },
        { type: 'trivia', name: 'Trivia', description: 'Test your knowledge across various topics', icon: '💡' },
        { type: 'enigmas', name: 'Enigmas', description: 'Mysterious puzzles and cryptic challenges', icon: '🔮' }
    ];

    // Get current level data
    const currentLevelData = challengeLevels.find(level => level.level === userStats.currentLevel) || challengeLevels[0];
    const nextLevelData = challengeLevels.find(level => level.requiredPoints > userStats.totalPoints) || challengeLevels[challengeLevels.length - 1];

    // Timer effect
    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (currentChallenge && !showResult) {
            interval = setInterval(() => {
                setTimer(prev => prev + 1);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [currentChallenge, showResult]);

    const getRankIcon = (rank: number) => {
        switch (rank) {
            case 1: return '🥇';
            case 2: return '🥈';
            case 3: return '🥉';
            default: return `#${rank}`;
        }
    };

    const getRankColor = (rank: number) => {
        switch (rank) {
            case 1: return 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-white';
            case 2: return 'bg-gradient-to-r from-gray-300 to-gray-500 text-white';
            case 3: return 'bg-gradient-to-r from-orange-400 to-orange-600 text-white';
            default: return 'bg-slate-100 text-slate-700';
        }
    };

    // Mock challenge generation
    const generateNewChallenge = async () => {
        setIsGenerating(true);
        setError(null);
        setCurrentChallenge(null);
        setUserAnswer('');
        setShowResult(false);
        setTimer(0);
        setHintsUsed(0);
        setShowHint(false);
        
        try {
            // Simulate API call delay
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            const mockChallenges = {
                riddle: {
                    title: "The Riddle of the Sphinx",
                    description: "Solve this classic riddle",
                    question: "What walks on four legs in the morning, two legs at noon, and three legs in the evening?",
                    answer: "man",
                    hints: ["Think about different stages of life", "Consider what helps us walk"]
                },
                word_hunt: {
                    title: "Hidden Words",
                    description: "Find the hidden word in this grid",
                    question: "Find a 5-letter word meaning 'happy' in: H A P P Y E",
                    answer: "happy",
                    hints: ["Look for common English words", "The word is right there!"]
                },
                logic_puzzle: {
                    title: "Logic Challenge",
                    description: "Use your reasoning skills",
                    question: "If all roses are flowers and some flowers are red, can we conclude that some roses are red?",
                    answer: "yes",
                    hints: ["Think about the logical relationship", "Consider what 'some' means"]
                },
                word_play: {
                    title: "Word Play",
                    description: "Creative language puzzle",
                    question: "What word becomes shorter when you add two letters to it?",
                    answer: "short",
                    hints: ["Think about the word 'short'", "What happens when you add 'er'?"]
                },
                math_challenge: {
                    title: "Math Problem",
                    description: "Solve this mathematical puzzle",
                    question: "What is 15% of 200?",
                    answer: "30",
                    hints: ["Convert percentage to decimal", "Multiply 0.15 by 200"]
                },
                trivia: {
                    title: "Trivia Question",
                    description: "Test your knowledge",
                    question: "What is the capital of Brazil?",
                    answer: "brasilia",
                    hints: ["It's a planned city", "Named after the country"]
                },
                enigmas: {
                    title: "Mysterious Enigma",
                    description: "Solve this cryptic puzzle",
                    question: "I am taken from a mine and shut up in a wooden case, from which I am never released, and yet I am used by almost every person. What am I?",
                    answer: "pencil",
                    hints: ["Think about writing tools", "What's inside a pencil?"]
                }
            };

            const challenge = {
                id: `challenge_${Date.now()}`,
                title: mockChallenges[selectedType].title,
                description: mockChallenges[selectedType].description,
                type: selectedType,
                question: mockChallenges[selectedType].question,
                answer: mockChallenges[selectedType].answer,
                hints: mockChallenges[selectedType].hints,
                difficulty: selectedLevel,
                points: getPointsForLevel(selectedLevel),
                timeLimit: getTimeLimitForLevel(selectedLevel),
                category: 'General Knowledge',
                createdAt: new Date(),
                createdBy: currentUser?.email || 'system',
                isActive: true
            };

            setCurrentChallenge(challenge);
        } catch (error) {
            console.error('Error generating challenge:', error);
            setError('Failed to generate challenge. Please try again.');
        } finally {
            setIsGenerating(false);
        }
    };

    // Submit answer
    const submitAnswer = async () => {
        if (!currentChallenge || !userAnswer.trim()) return;
        
        setIsSubmitting(true);
        try {
            // Simulate API call delay
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            const correct = userAnswer.toLowerCase().trim() === currentChallenge.answer.toLowerCase().trim();
            const points = correct ? calculatePoints() : 0;
            
            setIsCorrect(correct);
            setPointsEarned(points);
            setShowResult(true);
            
            // Refresh leaderboard after successful submission
            if (onLeaderboardUpdate) {
                onLeaderboardUpdate();
            }
            
        } catch (error) {
            console.error('Error submitting answer:', error);
            setError('Failed to submit answer. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    // Helper functions
    const getPointsForLevel = (level: ChallengeLevel): number => {
        switch (level) {
            case 'beginner': return 10;
            case 'intermediate': return 25;
            case 'advanced': return 50;
            case 'expert': return 100;
            case 'master': return 200;
            default: return 10;
        }
    };

    const getTimeLimitForLevel = (level: ChallengeLevel): number => {
        switch (level) {
            case 'beginner': return 10;
            case 'intermediate': return 8;
            case 'advanced': return 6;
            case 'expert': return 4;
            case 'master': return 3;
            default: return 10;
        }
    };

    const calculatePoints = (): number => {
        if (!currentChallenge) return 0;
        
        let points = getPointsForLevel(selectedLevel);
        
        // Time bonus (faster = more points)
        const timeBonus = Math.max(0, (getTimeLimitForLevel(selectedLevel) * 60 - timer) / 60);
        points += Math.floor(timeBonus * 5);
        
        // Hint penalty
        points -= hintsUsed * 5;
        
        return Math.max(0, points);
    };

    const useHint = () => {
        if (!currentChallenge || hintsUsed >= currentChallenge.hints.length) return;
        
        setHintsUsed(prev => prev + 1);
        setShowHint(true);
    };

    const resetChallenge = () => {
        setCurrentChallenge(null);
        setUserAnswer('');
        setShowResult(false);
        setTimer(0);
        setHintsUsed(0);
        setShowHint(false);
        setIsCorrect(false);
        setPointsEarned(0);
    };

    // Leaderboard screen
    if (showLeaderboard) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-100 p-8">
                <div className="max-w-4xl mx-auto">
                    <div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-200 mb-8">
                        <div className="flex items-center justify-between mb-6">
                            <button
                                onClick={() => setShowLeaderboard(false)}
                                className="flex items-center gap-2 px-3 py-2 text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
                            >
                                <ArrowLeftIcon className="h-5 w-5" />
                                <span className="font-medium">Back to Challenge Arena</span>
                            </button>
                            
                            <button
                                onClick={onLeaderboardUpdate}
                                className="flex items-center gap-2 px-3 py-2 text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 rounded-lg transition-colors"
                            >
                                <RefreshIcon className="h-5 w-5" />
                                <span className="font-medium">Refresh</span>
                            </button>
                        </div>

                        <div className="text-center mb-8">
                            <div className="flex items-center justify-center gap-3 mb-4">
                                <TrophyIcon className="h-12 w-12 text-yellow-600" />
                                <h1 className="text-4xl font-bold text-slate-800">Student Leaderboard</h1>
                            </div>
                            <p className="text-xl text-slate-600">
                                Compete with your classmates and climb the ranks!
                            </p>
                            {isPortugueseHelpVisible && (
                                <p className="text-sm text-slate-500 italic">
                                    Compita com seus colegas e suba no ranking!
                                </p>
                            )}
                        </div>

                        {/* Podium */}
                        {leaderboard.length >= 3 && (
                            <div className="flex justify-center items-end gap-4 mb-8">
                                {/* 2nd Place */}
                                {leaderboard[1] && (
                                    <div className="text-center">
                                        <div className="bg-gradient-to-r from-gray-300 to-gray-500 text-white w-24 h-32 rounded-lg flex flex-col items-center justify-center mb-2">
                                            <span className="text-2xl">🥈</span>
                                            <span className="text-sm font-bold">2nd</span>
                                        </div>
                                        <div className="text-center">
                                            <p className="font-semibold text-slate-800">{leaderboard[1].displayName}</p>
                                            <p className="text-sm text-slate-600">{leaderboard[1].totalPoints} pts</p>
                                        </div>
                                    </div>
                                )}
                                
                                {/* 1st Place */}
                                {leaderboard[0] && (
                                    <div className="text-center">
                                        <div className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-white w-28 h-36 rounded-lg flex flex-col items-center justify-center mb-2">
                                            <span className="text-3xl">🥇</span>
                                            <span className="text-sm font-bold">1st</span>
                                        </div>
                                        <div className="text-center">
                                            <p className="font-semibold text-slate-800">{leaderboard[0].displayName}</p>
                                            <p className="text-sm text-slate-600">{leaderboard[0].totalPoints} pts</p>
                                        </div>
                                    </div>
                                )}
                                
                                {/* 3rd Place */}
                                {leaderboard[2] && (
                                    <div className="text-center">
                                        <div className="bg-gradient-to-r from-orange-400 to-orange-600 text-white w-24 h-28 rounded-lg flex flex-col items-center justify-center mb-2">
                                            <span className="text-2xl">🥉</span>
                                            <span className="text-sm font-bold">3rd</span>
                                        </div>
                                        <div className="text-center">
                                            <p className="font-semibold text-slate-800">{leaderboard[2].displayName}</p>
                                            <p className="text-sm text-slate-600">{leaderboard[2].totalPoints} pts</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Full Leaderboard */}
                        <div className="space-y-3">
                            {leaderboard.length === 0 ? (
                                <div className="text-center py-12">
                                    <TrophyIcon className="h-16 w-16 text-slate-300 mx-auto mb-4" />
                                    <h3 className="text-xl font-semibold text-slate-600 mb-2">No Enrolled Students Yet</h3>
                                    <p className="text-slate-500">
                                        Students need to complete challenges to appear on the leaderboard!
                                    </p>
                                    {isPortugueseHelpVisible && (
                                        <p className="text-sm text-slate-400 italic mt-2">
                                            Alunos precisam completar desafios para aparecer no ranking!
                                        </p>
                                    )}
                                </div>
                            ) : (
                                leaderboard.map((student, index) => (
                                <div
                                    key={student.userId}
                                    className={`flex items-center gap-4 p-4 rounded-lg border-2 ${
                                        student.userId === currentUser?.uid 
                                            ? 'border-indigo-500 bg-indigo-50' 
                                            : 'border-slate-200 bg-white'
                                    }`}
                                >
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${getRankColor(index + 1)}`}>
                                        {getRankIcon(index + 1)}
                                    </div>
                                    
                                    <div className="flex items-center gap-3 flex-1">
                                        <img
                                            src={`https://ui-avatars.com/api/?name=${encodeURIComponent(student.displayName)}&background=6366f1&color=fff&size=40`}
                                            alt={student.displayName}
                                            className="w-10 h-10 rounded-full"
                                        />
                                        <div>
                                            <p className="font-semibold text-slate-800">
                                                {student.displayName}
                                                {student.userId === currentUser?.uid && (
                                                    <span className="ml-2 text-xs bg-indigo-100 text-indigo-800 px-2 py-1 rounded-full">
                                                        You
                                                    </span>
                                                )}
                                            </p>
                                            <p className="text-sm text-slate-600">{student.email}</p>
                                        </div>
                                    </div>
                                    
                                    <div className="text-right">
                                        <p className="font-bold text-lg text-slate-800">{student.totalPoints}</p>
                                        <p className="text-sm text-slate-600">points</p>
                                    </div>
                                    
                                    <div className="text-right">
                                        <p className="font-semibold text-slate-800">{student.correctAnswers}/{student.totalChallenges}</p>
                                        <p className="text-sm text-slate-600">correct</p>
                                    </div>
                                    
                                    {student.winStreak > 0 && (
                                        <div className="flex items-center gap-1 text-orange-600">
                                            <FireIcon className="h-4 w-4" />
                                            <span className="text-sm font-semibold">{student.winStreak}</span>
                                        </div>
                                    )}
                                </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Active challenge screen
    if (currentChallenge) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-100 p-8">
                <div className="max-w-4xl mx-auto">
                    <div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-200 mb-8">
                        <div className="flex items-center justify-between mb-6">
                            <button
                                onClick={resetChallenge}
                                className="flex items-center gap-2 px-3 py-2 text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
                            >
                                <ArrowLeftIcon className="h-5 w-5" />
                                <span className="font-medium">Back to Challenge Selection</span>
                            </button>
                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-2 text-slate-600">
                                    <ClockIcon className="h-5 w-5" />
                                    <span className="font-mono">{Math.floor(timer / 60)}:{(timer % 60).toString().padStart(2, '0')}</span>
                                </div>
                                <div className="flex items-center gap-2 text-slate-600">
                                    <span className="font-semibold">{getPointsForLevel(selectedLevel)} pts</span>
                                </div>
                            </div>
                        </div>

                        {showResult ? (
                            <div className="text-center py-8">
                                <div className={`text-6xl mb-4 ${isCorrect ? 'text-green-500' : 'text-red-500'}`}>
                                    {isCorrect ? '🎉' : '❌'}
                                </div>
                                <h2 className={`text-3xl font-bold mb-4 ${isCorrect ? 'text-green-600' : 'text-red-600'}`}>
                                    {isCorrect ? 'Correct!' : 'Incorrect'}
                                </h2>
                                {isCorrect && (
                                    <p className="text-xl text-slate-700 mb-2">You earned {pointsEarned} points!</p>
                                )}
                                <p className="text-slate-600 mb-6">
                                    The correct answer was: <span className="font-semibold">{currentChallenge.answer}</span>
                                </p>
                                <button
                                    onClick={resetChallenge}
                                    className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                                >
                                    Try Another Challenge
                                </button>
                            </div>
                        ) : (
                            <>
                                <div className="text-center mb-8">
                                    <div className="text-4xl mb-4">{challengeTypes.find(t => t.type === currentChallenge.type)?.icon}</div>
                                    <h1 className="text-3xl font-bold text-slate-800 mb-2">{currentChallenge.title}</h1>
                                    <p className="text-slate-600">{currentChallenge.description}</p>
                                </div>

                                <div className="bg-slate-50 p-6 rounded-lg mb-6">
                                    <h3 className="text-lg font-semibold text-slate-800 mb-4">Challenge Question:</h3>
                                    <p className="text-slate-700 text-lg leading-relaxed">{currentChallenge.question}</p>
                                </div>

                                {showHint && currentChallenge.hints[hintsUsed - 1] && (
                                    <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg mb-6">
                                        <div className="flex items-center gap-2 mb-2">
                                            <LightBulbIcon className="h-5 w-5 text-yellow-600" />
                                            <span className="font-semibold text-yellow-800">Hint {hintsUsed}:</span>
                                        </div>
                                        <p className="text-yellow-700">{currentChallenge.hints[hintsUsed - 1]}</p>
                                    </div>
                                )}

                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">
                                            Your Answer:
                                        </label>
                                        <input
                                            type="text"
                                            value={userAnswer}
                                            onChange={(e) => setUserAnswer(e.target.value)}
                                            onKeyPress={(e) => e.key === 'Enter' && submitAnswer()}
                                            className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-lg"
                                            placeholder="Enter your answer here..."
                                            disabled={isSubmitting}
                                        />
                                    </div>

                                    <div className="flex gap-4 justify-center">
                                        <button
                                            onClick={submitAnswer}
                                            disabled={!userAnswer.trim() || isSubmitting}
                                            className="px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                        >
                                            {isSubmitting ? (
                                                <>
                                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                                    Submitting...
                                                </>
                                            ) : (
                                                <>
                                                    <SendIcon className="h-5 w-5" />
                                                    Submit Answer
                                                </>
                                            )}
                                        </button>

                                        {hintsUsed < currentChallenge.hints.length && (
                                            <button
                                                onClick={useHint}
                                                className="px-6 py-3 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors flex items-center gap-2"
                                            >
                                                <LightBulbIcon className="h-5 w-5" />
                                                Use Hint (-5 pts)
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    // Main menu screen
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-100 p-8">
            <div className="max-w-4xl mx-auto">
                <div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-200 mb-8">
                    <div className="flex items-center gap-4 mb-6">
                        <button
                            onClick={onBack}
                            className="flex items-center gap-2 px-3 py-2 text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
                        >
                            <ArrowLeftIcon className="h-5 w-5" />
                            <span className="font-medium">Back to Dashboard</span>
                        </button>
                    </div>

                    <div className="text-center mb-8">
                        <div className="flex items-center justify-center gap-3 mb-4">
                            <TrophyIcon className="h-12 w-12 text-yellow-600" />
                            <h1 className="text-4xl font-bold text-slate-800">Challenge Arena</h1>
                        </div>
                        <p className="text-xl text-slate-600 mb-2">
                            Compete with your classmates in AI-generated challenges!
                        </p>
                        {isPortugueseHelpVisible && (
                            <p className="text-sm text-slate-500 italic">
                                Compita com seus colegas em desafios gerados por IA!
                            </p>
                        )}
                    </div>

                    {/* User Stats */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                        <div className="bg-blue-50 p-4 rounded-lg text-center">
                            <div className="text-2xl font-bold text-blue-600">{userStats.totalChallenges}</div>
                            <div className="text-sm text-blue-800">Challenges</div>
                        </div>
                        <div className="bg-green-50 p-4 rounded-lg text-center">
                            <div className="text-2xl font-bold text-green-600">{userStats.correctAnswers}</div>
                            <div className="text-sm text-green-800">Correct</div>
                        </div>
                        <div className="bg-yellow-50 p-4 rounded-lg text-center">
                            <div className="text-2xl font-bold text-yellow-600">{userStats.totalPoints}</div>
                            <div className="text-sm text-yellow-800">Points</div>
                        </div>
                        <div className="bg-purple-50 p-4 rounded-lg text-center">
                            <div className="text-2xl font-bold text-purple-600">{Math.round(userStats.averageTime)}s</div>
                            <div className="text-sm text-purple-800">Avg Time</div>
                        </div>
                    </div>

                    {/* Current Level Progress */}
                    <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-6 rounded-lg mb-8">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <span className="text-3xl">{currentLevelData.icon}</span>
                                <div>
                                    <h3 className="text-xl font-bold text-slate-800">{currentLevelData.name} Level</h3>
                                    <p className="text-slate-600">{currentLevelData.description}</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="text-2xl font-bold text-slate-800">{userStats.totalPoints} pts</div>
                                <div className="text-sm text-slate-600">Current Score</div>
                            </div>
                        </div>
                        
                        {/* Progress Bar */}
                        <div className="mb-2">
                            <div className="flex justify-between text-sm text-slate-600 mb-1">
                                <span>Progress to {nextLevelData.name}</span>
                                <span>{Math.round(userStats.levelProgress)}%</span>
                            </div>
                            <div className="w-full bg-slate-200 rounded-full h-3">
                                <div 
                                    className={`${currentLevelData.color} h-3 rounded-full transition-all duration-500`}
                                    style={{ width: `${userStats.levelProgress}%` }}
                                ></div>
                            </div>
                        </div>
                        
                        <div className="text-center text-sm text-slate-600">
                            {nextLevelData.requiredPoints - userStats.totalPoints} more points to reach {nextLevelData.name} level
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-4 justify-center mb-8">
                        <button
                            onClick={() => setShowLeaderboard(true)}
                            className="flex items-center gap-2 px-6 py-3 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
                        >
                            <TrendingUpIcon className="h-5 w-5" />
                            View Leaderboard
                        </button>
                    </div>

                    {/* Challenge Generator */}
                    <div className="max-w-4xl mx-auto">
                        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-6 rounded-lg mb-6">
                            <div className="flex items-center gap-2 mb-6">
                                <SparklesIcon className="h-6 w-6 text-indigo-600" />
                                <h2 className="text-xl font-bold text-slate-800">Choose Your Challenge</h2>
                            </div>

                            {/* Level Selection */}
                            <div className="mb-6">
                                <h3 className="text-lg font-semibold text-slate-700 mb-3">Select Difficulty Level:</h3>
                                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                                    {challengeLevels.map((level) => {
                                        const isUnlocked = userStats.totalPoints >= level.requiredPoints;
                                        const isSelected = selectedLevel === level.level;
                                        return (
                                            <button
                                                key={level.level}
                                                onClick={() => setSelectedLevel(level.level)}
                                                disabled={!isUnlocked}
                                                className={`p-3 rounded-lg border-2 transition-all ${
                                                    isSelected 
                                                        ? `${level.color} text-white border-transparent` 
                                                        : isUnlocked 
                                                            ? 'bg-white border-slate-300 hover:border-indigo-400' 
                                                            : 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed'
                                                }`}
                                            >
                                                <div className="text-center">
                                                    <div className="text-2xl mb-1">{level.icon}</div>
                                                    <div className="text-sm font-semibold">{level.name}</div>
                                                    <div className="text-xs opacity-75">{level.requiredPoints} pts</div>
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Challenge Type Selection */}
                            <div className="mb-6">
                                <h3 className="text-lg font-semibold text-slate-700 mb-3">Choose Challenge Type:</h3>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                    {challengeTypes.map((type) => (
                                        <button
                                            key={type.type}
                                            onClick={() => setSelectedType(type.type)}
                                            className={`p-4 rounded-lg border-2 transition-all ${
                                                selectedType === type.type 
                                                    ? 'bg-indigo-600 text-white border-transparent' 
                                                    : 'bg-white border-slate-300 hover:border-indigo-400'
                                            }`}
                                        >
                                            <div className="text-center">
                                                <div className="text-2xl mb-2">{type.icon}</div>
                                                <div className="text-sm font-semibold">{type.name}</div>
                                                <div className="text-xs opacity-75 mt-1">{type.description}</div>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Generate Button */}
                            <div className="text-center">
                                <button
                                    onClick={generateNewChallenge}
                                    disabled={isGenerating}
                                    className="px-8 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 mx-auto"
                                >
                                    {isGenerating ? (
                                        <>
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                            Generating...
                                        </>
                                    ) : (
                                        <>
                                            <SparklesIcon className="h-5 w-5" />
                                            Generate {challengeTypes.find(t => t.type === selectedType)?.name} Challenge
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>

                        <div className="text-center text-slate-600">
                            <p className="text-sm">
                                All challenge types are available at every level, with difficulty scaling based on your progress!
                            </p>
                            {isPortugueseHelpVisible && (
                                <p className="text-xs italic mt-1">
                                    Todos os tipos de desafio estão disponíveis em todos os níveis, com dificuldade escalonada baseada no seu progresso!
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ChallengeArena;