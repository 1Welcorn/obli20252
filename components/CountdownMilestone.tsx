import React, { useState, useEffect } from 'react';
import type { LearningPlan } from '../types';
import { CalendarDaysIcon } from './icons/CalendarDaysIcon';

interface CountdownMilestoneProps {
    plan: LearningPlan;
    isPortugueseHelpVisible: boolean;
}

export const CountdownMilestone: React.FC<CountdownMilestoneProps> = ({ plan, isPortugueseHelpVisible }) => {
    const [daysRemaining, setDaysRemaining] = useState(0);

    useEffect(() => {
        const competitionDate = new Date(new Date().getFullYear(), 9, 29); // Month is 0-indexed, so 9 is October.
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Normalize to the start of the day

        // If today is after the competition date, calculate for next year's competition
        if (today > competitionDate) {
            competitionDate.setFullYear(competitionDate.getFullYear() + 1);
        }

        const differenceInTime = competitionDate.getTime() - today.getTime();
        const remaining = Math.ceil(differenceInTime / (1000 * 3600 * 24));
        setDaysRemaining(remaining);
    }, []);

    const allLessons = plan.modules.flatMap(m => m.lessons);
    const completedLessons = allLessons.filter(l => l.status === 'completed').length;
    const totalLessons = allLessons.length;
    const progressPercentage = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;
    
    const completedModules = plan.modules.filter(m => m.lessons.every(l => l.status === 'completed')).length;
    const totalModules = plan.modules.length;

    const radius = 54;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (progressPercentage / 100) * circumference;

    return (
        <div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-200 grid grid-cols-1 md:grid-cols-3 items-center gap-6">
            {/* Countdown Section */}
            <div className="flex items-center justify-center md:justify-start gap-4 text-center md:text-left border-b md:border-b-0 md:border-r border-slate-200 pb-6 md:pb-0 md:pr-6">
                <CalendarDaysIcon className="h-16 w-16 text-indigo-500" />
                <div>
                    <div className="text-5xl font-extrabold text-indigo-600">{daysRemaining}</div>
                    <div className="text-slate-600 font-semibold">Days Until Competition</div>
                    {isPortugueseHelpVisible && <div className="text-xs text-slate-500 italic">Dias até a Competição</div>}
                </div>
            </div>
            
            {/* Progress Chart Section */}
            <div className="flex flex-col items-center justify-center">
                <div className="relative w-32 h-32">
                    <svg className="w-full h-full" viewBox="0 0 120 120">
                        <circle
                            className="text-slate-200"
                            strokeWidth="12"
                            stroke="currentColor"
                            fill="transparent"
                            r={radius}
                            cx="60"
                            cy="60"
                        />
                        <circle
                            className="text-indigo-600"
                            strokeWidth="12"
                            strokeDasharray={circumference}
                            strokeDashoffset={offset}
                            strokeLinecap="round"
                            stroke="currentColor"
                            fill="transparent"
                            r={radius}
                            cx="60"
                            cy="60"
                            transform="rotate(-90 60 60)"
                            style={{ transition: 'stroke-dashoffset 0.5s ease-out' }}
                        />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-3xl font-bold text-slate-800">{`${progressPercentage}%`}</span>
                    </div>
                </div>
                <h3 className="font-bold text-slate-800 text-lg mt-2">Overall Progress</h3>
                {isPortugueseHelpVisible && <p className="text-xs text-slate-500 italic">Progresso Geral</p>}
            </div>

            {/* Stats Section */}
            <div className="flex flex-col items-center md:items-start gap-4 border-t md:border-t-0 md:border-l border-slate-200 pt-6 md:pt-0 md:pl-6">
                <div className="text-center md:text-left">
                    <p className="text-slate-500 text-sm font-semibold tracking-wider">LESSONS COMPLETED</p>
                    <p className="text-3xl font-bold text-teal-600">{completedLessons} <span className="text-xl text-slate-500 font-medium">/ {totalLessons}</span></p>
                </div>
                <div className="text-center md:text-left">
                    <p className="text-slate-500 text-sm font-semibold tracking-wider">MODULES COMPLETED</p>
                    <p className="text-3xl font-bold text-fuchsia-600">{completedModules} <span className="text-xl text-slate-500 font-medium">/ {totalModules}</span></p>
                </div>
            </div>
        </div>
    );
};