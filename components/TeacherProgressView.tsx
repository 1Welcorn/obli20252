import React, { useState, useEffect } from 'react';
import { ArrowLeftIcon } from './icons/ArrowLeftIcon';
import { ChartBarIcon } from './icons/ChartBarIcon';
import { UsersIcon } from './icons/UsersIcon';
import { TrophyIcon } from './icons/TrophyIcon';
import { ClockIcon } from './icons/ClockIcon';
import { FireIcon } from './icons/FireIcon';
import { learningProgressService } from '../services/learningProgressService';

interface StudentProgress {
    userId: string;
    email: string;
    displayName: string;
    progress: any;
    analytics: any;
}

interface TeacherProgressViewProps {
    onBack: () => void;
    currentUser: { uid: string; email: string | null; displayName: string | null; photoURL: string | null } | null;
}

const TeacherProgressView: React.FC<TeacherProgressViewProps> = ({ onBack, currentUser }) => {
    const [students, setStudents] = useState<StudentProgress[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'all'>('week');
    const [sortBy, setSortBy] = useState<'streak' | 'sessions' | 'time' | 'topics'>('streak');

    useEffect(() => {
        loadStudentsProgress();
    }, []);

    const loadStudentsProgress = async () => {
        setIsLoading(true);
        try {
            // Get all student progress from localStorage
            const allProgress = JSON.parse(localStorage.getItem('obliLearningProgress') || '{}');
            const studentList: StudentProgress[] = [];

            // For demo purposes, we'll simulate some student data
            // In a real app, this would come from Firebase
            const mockStudents = [
                { uid: 'student1', email: 'alice@example.com', displayName: 'Alice Johnson' },
                { uid: 'student2', email: 'bob@example.com', displayName: 'Bob Smith' },
                { uid: 'student3', email: 'charlie@example.com', displayName: 'Charlie Brown' },
                { uid: 'student4', email: 'diana@example.com', displayName: 'Diana Prince' },
            ];

            for (const student of mockStudents) {
                const progress = allProgress[student.uid];
                if (progress) {
                    const analytics = await learningProgressService.getLearningAnalytics(student.uid);
                    studentList.push({
                        userId: student.uid,
                        email: student.email,
                        displayName: student.displayName,
                        progress,
                        analytics
                    });
                }
            }

            // Add current user if they have progress
            if (currentUser?.uid && allProgress[currentUser.uid]) {
                const analytics = await learningProgressService.getLearningAnalytics(currentUser.uid);
                studentList.push({
                    userId: currentUser.uid,
                    email: currentUser.email || '',
                    displayName: currentUser.displayName || 'Current User',
                    progress: allProgress[currentUser.uid],
                    analytics
                });
            }

            setStudents(studentList);
        } catch (error) {
            console.error('Error loading students progress:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const getSortedStudents = () => {
        return [...students].sort((a, b) => {
            switch (sortBy) {
                case 'streak':
                    return b.analytics.learningStreak - a.analytics.learningStreak;
                case 'sessions':
                    return b.analytics.totalSessions - a.analytics.totalSessions;
                case 'time':
                    return b.analytics.totalTime - a.analytics.totalTime;
                case 'topics':
                    return b.progress.topicsLearned.length - a.progress.topicsLearned.length;
                default:
                    return 0;
            }
        });
    };

    const getClassStats = () => {
        if (students.length === 0) return null;

        const totalSessions = students.reduce((sum, student) => sum + student.analytics.totalSessions, 0);
        const totalTime = students.reduce((sum, student) => sum + student.analytics.totalTime, 0);
        const averageStreak = students.reduce((sum, student) => sum + student.analytics.learningStreak, 0) / students.length;
        const totalTopics = new Set(students.flatMap(student => student.progress.topicsLearned)).size;

        return {
            totalStudents: students.length,
            totalSessions,
            totalTime: Math.round(totalTime / 60), // hours
            averageStreak: Math.round(averageStreak * 10) / 10,
            totalTopics,
            activeStudents: students.filter(s => s.analytics.totalSessions > 0).length
        };
    };

    const getTopPerformers = () => {
        return getSortedStudents().slice(0, 3);
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-slate-600">Loading student progress...</p>
                </div>
            </div>
        );
    }

    const classStats = getClassStats();

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
            <div className="container mx-auto px-4 py-6">
                <div className="max-w-7xl mx-auto">
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
                                <h1 className="text-3xl font-bold text-slate-800">Student Progress Overview</h1>
                                <p className="text-slate-600">Monitor and track student learning progress</p>
                            </div>
                        </div>
                        
                        {/* Controls */}
                        <div className="flex gap-4">
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
                            
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value as any)}
                                className="px-4 py-2 border border-slate-300 rounded-lg bg-white text-slate-700"
                            >
                                <option value="streak">Sort by Streak</option>
                                <option value="sessions">Sort by Sessions</option>
                                <option value="time">Sort by Time</option>
                                <option value="topics">Sort by Topics</option>
                            </select>
                        </div>
                    </div>

                    {/* Class Overview Stats */}
                    {classStats && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
                            <div className="bg-white rounded-xl p-6 shadow-lg">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-slate-600">Total Students</p>
                                        <p className="text-3xl font-bold text-blue-600">{classStats.totalStudents}</p>
                                        <p className="text-xs text-slate-500">{classStats.activeStudents} active</p>
                                    </div>
                                    <UsersIcon className="h-8 w-8 text-blue-500" />
                                </div>
                            </div>
                            
                            <div className="bg-white rounded-xl p-6 shadow-lg">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-slate-600">Total Sessions</p>
                                        <p className="text-3xl font-bold text-green-600">{classStats.totalSessions}</p>
                                        <p className="text-xs text-slate-500">sessions</p>
                                    </div>
                                    <ChartBarIcon className="h-8 w-8 text-green-500" />
                                </div>
                            </div>
                            
                            <div className="bg-white rounded-xl p-6 shadow-lg">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-slate-600">Total Time</p>
                                        <p className="text-3xl font-bold text-purple-600">{classStats.totalTime}</p>
                                        <p className="text-xs text-slate-500">hours</p>
                                    </div>
                                    <ClockIcon className="h-8 w-8 text-purple-500" />
                                </div>
                            </div>
                            
                            <div className="bg-white rounded-xl p-6 shadow-lg">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-slate-600">Avg Streak</p>
                                        <p className="text-3xl font-bold text-orange-600">{classStats.averageStreak}</p>
                                        <p className="text-xs text-slate-500">days</p>
                                    </div>
                                    <FireIcon className="h-8 w-8 text-orange-500" />
                                </div>
                            </div>
                            
                            <div className="bg-white rounded-xl p-6 shadow-lg">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-slate-600">Topics Covered</p>
                                        <p className="text-3xl font-bold text-indigo-600">{classStats.totalTopics}</p>
                                        <p className="text-xs text-slate-500">unique topics</p>
                                    </div>
                                    <TrophyIcon className="h-8 w-8 text-indigo-500" />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Top Performers */}
                    {getTopPerformers().length > 0 && (
                        <div className="mb-8">
                            <h2 className="text-2xl font-bold text-slate-800 mb-4">🏆 Top Performers</h2>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {getTopPerformers().map((student, index) => (
                                    <div key={student.userId} className="bg-white rounded-xl p-6 shadow-lg">
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                                                {index + 1}
                                            </div>
                                            <div>
                                                <h3 className="font-semibold text-slate-800">{student.displayName}</h3>
                                                <p className="text-sm text-slate-600">{student.email}</p>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4 text-sm">
                                            <div>
                                                <p className="text-slate-600">Streak</p>
                                                <p className="font-semibold text-orange-600">{student.analytics.learningStreak} days</p>
                                            </div>
                                            <div>
                                                <p className="text-slate-600">Sessions</p>
                                                <p className="font-semibold text-blue-600">{student.analytics.totalSessions}</p>
                                            </div>
                                            <div>
                                                <p className="text-slate-600">Time</p>
                                                <p className="font-semibold text-green-600">{Math.round(student.analytics.totalTime / 60)}h</p>
                                            </div>
                                            <div>
                                                <p className="text-slate-600">Topics</p>
                                                <p className="font-semibold text-purple-600">{student.progress.topicsLearned.length}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Student List */}
                    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                        <div className="px-6 py-4 border-b border-slate-200">
                            <h2 className="text-xl font-bold text-slate-800">All Students</h2>
                        </div>
                        
                        {students.length === 0 ? (
                            <div className="p-8 text-center">
                                <div className="text-6xl mb-4">📚</div>
                                <h3 className="text-xl font-semibold text-slate-800 mb-2">No Student Progress Yet</h3>
                                <p className="text-slate-600">Students need to start learning sessions to see their progress here.</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-slate-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Student</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Streak</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Sessions</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Time</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Topics</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Last Activity</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-slate-200">
                                        {getSortedStudents().map((student) => (
                                            <tr key={student.userId} className="hover:bg-slate-50">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center">
                                                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-semibold">
                                                            {student.displayName.charAt(0)}
                                                        </div>
                                                        <div className="ml-4">
                                                            <div className="text-sm font-medium text-slate-900">{student.displayName}</div>
                                                            <div className="text-sm text-slate-500">{student.email}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center">
                                                        <FireIcon className="h-4 w-4 text-orange-500 mr-1" />
                                                        <span className="text-sm text-slate-900">{student.analytics.learningStreak} days</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className="text-sm text-slate-900">{student.analytics.totalSessions}</span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className="text-sm text-slate-900">{Math.round(student.analytics.totalTime / 60)}h {student.analytics.totalTime % 60}m</span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className="text-sm text-slate-900">{student.progress.topicsLearned.length}</span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className="text-sm text-slate-900">
                                                        {new Date(student.progress.lastActivity).toLocaleDateString()}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                    <button className="text-blue-600 hover:text-blue-900">
                                                        View Details
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TeacherProgressView;
