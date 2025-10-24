import React, { useState } from 'react';
import type { User, LearningPlan } from '../types';
import { GraduationCapIcon } from './icons/GraduationCapIcon';
import { UsersIcon } from './icons/UsersIcon';
import { ArrowRightOnRectangleIcon } from './icons/ArrowRightOnRectangleIcon';
import { LightBulbIcon } from './icons/LightBulbIcon';
import { DatabaseIcon } from './icons/DatabaseIcon';
import { CourseRoadmap } from './CourseRoadmap';
import { setMainTeacher } from '../services/firebaseService';

interface HeaderProps {
    user: User | null;
    onLogout: () => void;
    isPortugueseHelpVisible: boolean;
    onTogglePortugueseHelp: () => void;
    onOpenDatabaseInspector: () => void;
    learningPlan: LearningPlan | null;
}

const Header: React.FC<HeaderProps> = ({ user, onLogout, isPortugueseHelpVisible, onTogglePortugueseHelp, onOpenDatabaseInspector, learningPlan }) => {
    const [isSettingMainTeacher, setIsSettingMainTeacher] = useState(false);
    const [isRoadmapOpen, setIsRoadmapOpen] = useState(false);
    const roleText = user?.role === 'student' ? 'Student View' : 'Teacher View';
    const RoleIcon = user?.role === 'student' ? GraduationCapIcon : UsersIcon;

    const handleSetMainTeacher = async () => {
        setIsSettingMainTeacher(true);
        try {
            // Set the specific email as main teacher
            await setMainTeacher('f4330252301@gmail.com');
            alert('f4330252301@gmail.com is now set as the main teacher! Please refresh the page.');
        } catch (error) {
            console.error('Error setting main teacher:', error);
            alert('Error setting main teacher. Please try again.');
        } finally {
            setIsSettingMainTeacher(false);
        }
    };

    return (
        <>
            <header className="bg-white/80 backdrop-blur-lg shadow-md sticky top-0 z-40">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center gap-3">
                            {/* Modern MEW Logo - Three perfect squares with letters */}
                            <div className="flex gap-1">
                                <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-lg flex items-center justify-center shadow-md">
                                    <span className="text-white font-bold text-sm">M</span>
                                </div>
                                <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg flex items-center justify-center shadow-md">
                                    <span className="text-white font-bold text-sm">E</span>
                                </div>
                                <div className="w-8 h-8 bg-gradient-to-br from-amber-500 to-amber-600 rounded-lg flex items-center justify-center shadow-md">
                                    <span className="text-white font-bold text-sm">W</span>
                                </div>
                            </div>
                            <span className="text-xl font-bold text-slate-800 hidden sm:block">OBLI Pathfinder</span>
                             {user && (
                                <>
                                    <div className="w-px h-6 bg-slate-300 mx-2 hidden sm:block"></div>
                                    
                                    <button
                                        onClick={() => setIsRoadmapOpen(true)}
                                        className="flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200 text-slate-600 hover:bg-slate-100"
                                        title="Click to view course roadmap"
                                    >
                                        <RoleIcon className="h-6 w-6" />
                                        <span className="font-semibold">{user?.role === 'student' ? 'Course Roadmap' : roleText}</span>
                                    </button>
                                </>
                            )}
                        </div>
                        <div className="flex items-center gap-4">
                            <button
                                onClick={onTogglePortugueseHelp}
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 ${isPortugueseHelpVisible ? 'bg-green-100 text-green-600 shadow-md' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                                title={isPortugueseHelpVisible ? 'Portuguese translation help is ON' : 'Click to turn ON Portuguese translation help'}
                            >
                                <div className={`relative transition-colors ${isPortugueseHelpVisible ? 'text-green-600' : 'text-slate-600'}`}>
                                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M12 2C8.13 2 5 5.13 5 9c0 2.38 1.19 4.47 3 5.74V17c0 .55.45 1 1 1h6c.55 0 1-.45 1-1v-2.26c1.81-1.27 3-3.36 3-5.74 0-3.87-3.13-7-7-7zm2.85 11.1l-.85.6V16h-4v-2.3l-.85-.6C7.8 12.16 7 10.63 7 9c0-2.76 2.24-5 5-5s5 2.24 5 5c0 1.63-.8 3.16-2.15 4.1z"/>
                                        <path d="M9 21c0 .55.45 1 1 1h4c.55 0 1-.45 1-1v-1H9v1z"/>
                                    </svg>
                                </div>
                                <span className="text-sm font-medium">Portuguese Help</span>
                            </button>

                             <button
                                onClick={onOpenDatabaseInspector}
                                className="p-2 rounded-md bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
                                title="Inspect App State"
                            >
                                <DatabaseIcon className="h-5 w-5" />
                            </button>

                            {/* Admin button to set f4330252301@gmail.com as main teacher */}
                            {user && user.role === 'teacher' && !user.isMainTeacher && (
                                <button
                                    onClick={handleSetMainTeacher}
                                    disabled={isSettingMainTeacher}
                                    className="px-3 py-2 rounded-md text-sm font-semibold bg-amber-100 text-amber-700 hover:bg-amber-200 transition-colors disabled:opacity-50"
                                    title="Set f4330252301@gmail.com as main teacher (admin access)"
                                >
                                    {isSettingMainTeacher ? 'Setting...' : 'Set Main Teacher'}
                                </button>
                            )}
                            
                            {user && (
                                 <button
                                    onClick={onLogout}
                                    className="flex items-center gap-2 px-3 py-2 rounded-md text-sm font-semibold bg-slate-100 text-slate-700 hover:bg-red-100 hover:text-red-700 transition-colors"
                                    title="Log out"
                                >
                                    <ArrowRightOnRectangleIcon className="h-5 w-5" />
                                    <span className="hidden md:inline">Logout</span>
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </header>
            
            {/* User Profile Image Section - Upper Middle */}
            {user && (
                <div className="bg-gradient-to-r from-slate-50 to-slate-100 border-b border-slate-200 mb-8">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                        <div className="flex justify-center">
                            <div className="flex flex-col items-center gap-3">
                                <div className="relative">
                                    <img
                                        src={user.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.displayName || user.email || 'User')}&background=6366f1&color=fff&size=80`}
                                        alt={user.displayName || 'User'}
                                        className="w-20 h-20 rounded-full border-4 border-white shadow-lg"
                                    />
                                    <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 border-3 border-white rounded-full flex items-center justify-center">
                                        <div className="w-2 h-2 bg-white rounded-full"></div>
                                    </div>
                                </div>
                                <div className="text-center">
                                    <h2 className="text-xl font-bold text-slate-800">
                                        {user.displayName || 'Welcome'}
                                    </h2>
                                    <p className="text-sm text-slate-600 capitalize">
                                        {user.role} • {user.email}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Course Roadmap Modal */}
            <CourseRoadmap
                isOpen={isRoadmapOpen}
                onClose={() => setIsRoadmapOpen(false)}
                learningPlan={learningPlan}
                isPortugueseHelpVisible={isPortugueseHelpVisible}
            />
        </>
    );
};

export default Header;