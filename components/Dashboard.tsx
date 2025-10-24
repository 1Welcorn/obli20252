// [FE-FIX] Implemented the student dashboard to display learning plan progress and navigation.
import React from 'react';
import type { LearningPlan, Module } from '../types';
import { CountdownMilestone } from './CountdownMilestone';
import { BookOpenIcon } from './icons/BookOpenIcon';
import { DocumentTextIcon } from './icons/DocumentTextIcon';
import { TrophyIcon } from './icons/TrophyIcon';
import { ArrowRightIcon } from './icons/ArrowRightIcon';
import { CheckCircleIcon } from './icons/CheckCircleIcon';

interface DashboardProps {
  plan: LearningPlan;
  onSelectModule: (module: Module) => void;
  onViewNotes: () => void;
  onViewChallenges: () => void;
  onViewStudyMaterials: () => void;
  isPortugueseHelpVisible: boolean;
}

const ModuleCard: React.FC<{ module: Module; onSelect: () => void; isPortugueseHelpVisible: boolean; }> = ({ module, onSelect, isPortugueseHelpVisible }) => {
    const totalLessons = module.lessons.length;
    const completedLessons = module.lessons.filter(l => l.status === 'completed').length;
    const isModuleComplete = totalLessons > 0 && totalLessons === completedLessons;
    const progress = totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0;

    return (
        <div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-200 transition-all duration-300 hover:shadow-2xl hover:-translate-y-1">
            <div className="flex justify-between items-start">
                <div>
                    <h3 className="text-2xl font-bold text-slate-800">{module.title}</h3>
                    <p className="text-slate-600 mt-1">{module.description}</p>
                </div>
                {isModuleComplete && (
                     <div className="flex-shrink-0 ml-4 p-1 bg-green-100 rounded-full">
                        <CheckCircleIcon className="h-8 w-8 text-green-500" />
                    </div>
                )}
            </div>
            <div className="mt-4">
                <div className="flex justify-between items-center mb-1 text-sm text-slate-600">
                    <span>Lesson Progress</span>
                    <span>{completedLessons} / {totalLessons}</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2.5">
                    <div className="bg-green-500 h-2.5 rounded-full transition-all duration-500" style={{ width: `${progress}%` }}></div>
                </div>
            </div>
            <button
                onClick={onSelect}
                className="mt-6 w-full flex items-center justify-center gap-2 bg-indigo-600 text-white font-semibold py-3 px-4 rounded-lg hover:bg-indigo-700 transition-colors duration-200 shadow hover:shadow-md"
            >
                {isModuleComplete ? 'Review Module' : 'Start Learning'}
                <ArrowRightIcon className="h-5 w-5" />
            </button>
        </div>
    );
};


const Dashboard: React.FC<DashboardProps> = ({ plan, onSelectModule, onViewNotes, onViewChallenges, onViewStudyMaterials, onViewProgress, isPortugueseHelpVisible }) => {
  return (
    <div className="animate-fade-in">
      <div className="mb-8">
          <h1 className="text-4xl font-extrabold text-slate-900">Your Learning Plan</h1>
          <p className="text-xl text-slate-600 mt-2">Goal: <span className="font-semibold text-indigo-700">{plan.goal}</span></p>
          {isPortugueseHelpVisible && <p className="text-sm text-slate-500 mt-2 italic">Este é o seu plano de estudos personalizado. Selecione um módulo para começar!</p>}
      </div>
      
      <div className="mb-8">
        <CountdownMilestone plan={plan} isPortugueseHelpVisible={isPortugueseHelpVisible} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {/* Study Materials */}
        <div className="w-full">
          <button onClick={onViewStudyMaterials} className="w-full flex flex-col items-center justify-center gap-2 bg-white p-6 rounded-2xl shadow-lg border border-slate-200 hover:shadow-xl hover:border-indigo-300 transition-all">
             <BookOpenIcon className="h-10 w-10 text-teal-500" />
            <span className="font-bold text-lg text-slate-700">Study Materials</span>
            {isPortugueseHelpVisible && <p className="text-xs text-slate-500 italic">Materiais de Estudo</p>}
          </button>
        </div>
        
        {/* Challenge Arena */}
        <div className="w-full">
          <button onClick={onViewChallenges} className="w-full flex flex-col items-center justify-center gap-2 bg-white p-6 rounded-2xl shadow-lg border border-slate-200 hover:shadow-xl hover:border-indigo-300 transition-all">
              <TrophyIcon className="h-10 w-10 text-yellow-500" />
              <span className="font-bold text-lg text-slate-700">Challenge Arena</span>
              {isPortugueseHelpVisible && <p className="text-xs text-slate-500 italic">Arena de Desafios</p>}
          </button>
        </div>
        
        {/* My Notes */}
        <div className="w-full">
          <button onClick={onViewNotes} className="w-full flex flex-col items-center justify-center gap-2 bg-white p-6 rounded-2xl shadow-lg border border-slate-200 hover:shadow-xl hover:border-indigo-300 transition-all">
              <DocumentTextIcon className="h-10 w-10 text-fuchsia-500" />
              <span className="font-bold text-lg text-slate-700">My Notes</span>
              {isPortugueseHelpVisible && <p className="text-xs text-slate-500 italic">Minhas Anotações</p>}
          </button>
        </div>
      </div>

      <div>
        <h2 className="text-3xl font-bold text-slate-800 mb-6">Learning Modules</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {plan.modules.map((module, index) => (
            <ModuleCard key={index} module={module} onSelect={() => onSelectModule(module)} isPortugueseHelpVisible={isPortugueseHelpVisible} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
