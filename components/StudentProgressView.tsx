import React from 'react';
import type { Student, Module, Lesson } from '../types';
import { ArrowLeftIcon } from './icons/ArrowLeftIcon';
import { CheckCircleIcon } from './icons/CheckCircleIcon';

interface StudentProgressViewProps {
  student: Student;
  onBack: () => void;
  isPortugueseHelpVisible: boolean;
}

const LessonStatus: React.FC<{ lesson: Lesson }> = ({ lesson }) => (
    <div className={`flex items-center p-3 rounded-lg border ${lesson.status === 'completed' ? 'bg-green-50 border-green-200' : 'bg-slate-50 border-slate-200'}`}>
        <div className="flex-shrink-0">
            {lesson.status === 'completed' 
                ? <CheckCircleIcon className="h-6 w-6 text-green-500" />
                : <div className="h-6 w-6 rounded-full border-2 border-slate-300 bg-white" />
            }
        </div>
        <div className="ml-3">
            <p className={`font-medium ${lesson.status === 'completed' ? 'text-slate-500 line-through' : 'text-slate-800'}`}>
                {lesson.title}
            </p>
        </div>
    </div>
);

const ModuleStatus: React.FC<{ module: Module; isPortugueseHelpVisible: boolean; }> = ({ module, isPortugueseHelpVisible }) => (
    <div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-200 mb-6">
        <h3 className="text-2xl font-bold text-slate-800 mb-1">{module.title}</h3>
        <p className="text-slate-600 mb-4">{module.description}</p>
        {isPortugueseHelpVisible && <p className="text-xs text-slate-500 italic mb-4">Veja o status de cada lição abaixo.</p>}
        <div className="space-y-3">
            {module.lessons.map((lesson, index) => (
                <LessonStatus key={index} lesson={lesson} />
            ))}
        </div>
    </div>
);


const StudentProgressView: React.FC<StudentProgressViewProps> = ({ student, onBack, isPortugueseHelpVisible }) => {
  if (!student.learningPlan) {
    return (
      <div>
         <button onClick={onBack} className="flex items-center gap-2 text-indigo-600 font-semibold mb-6 hover:underline">
            <ArrowLeftIcon className="h-5 w-5" />
            Back to Teacher Dashboard
        </button>
        <div className="text-center p-8 bg-white rounded-xl shadow-md">
            <h2 className="text-2xl font-bold">No Learning Plan Found</h2>
            <p>A learning plan has not been generated for {student.name} yet.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in max-w-4xl mx-auto">
      <button onClick={onBack} className="flex items-center gap-2 text-indigo-600 font-semibold mb-6 hover:underline">
        <ArrowLeftIcon className="h-5 w-5" />
        Back to Teacher Dashboard
      </button>

      <div className="bg-white p-8 rounded-2xl shadow-2xl border border-slate-200 mb-8">
        <h2 className="text-4xl font-extrabold text-slate-900">{student.name}'s Progress</h2>
        <p className="text-lg text-slate-600 mt-2">Goal: <span className="font-semibold text-indigo-700">{student.learningPlan.goal}</span></p>
        {isPortugueseHelpVisible && <p className="text-sm text-slate-500 mt-2 italic">Este é um resumo do plano de estudos e do progresso do(a) estudante.</p>}
      </div>

      <div>
        {student.learningPlan.modules.map((module, index) => (
          <ModuleStatus key={index} module={module} isPortugueseHelpVisible={isPortugueseHelpVisible} />
        ))}
      </div>
    </div>
  );
};

export default StudentProgressView;