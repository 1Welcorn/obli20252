import React from 'react';
import { CloseIcon } from './icons/CloseIcon';
import { BookOpenIcon } from './icons/BookOpenIcon';
import { CheckCircleIcon } from './icons/CheckCircleIcon';
import { CircleOutlineIcon } from './icons/CircleOutlineIcon';
import { ClockIcon } from './icons/ClockIcon';
import { TrophyIcon } from './icons/TrophyIcon';
import { SparklesIcon } from './icons/SparklesIcon';
import type { LearningPlan } from '../types';

interface CourseRoadmapProps {
  isOpen: boolean;
  onClose: () => void;
  learningPlan: LearningPlan | null;
  isPortugueseHelpVisible: boolean;
}

export const CourseRoadmap: React.FC<CourseRoadmapProps> = ({
  isOpen,
  onClose,
  learningPlan,
  isPortugueseHelpVisible
}) => {
  if (!isOpen) return null;

  // OBLI 2025 Levels and Subjects Structure
  const obliLevels = [
    {
      level: 'Junior',
      description: 'Foundation level for beginners',
      color: 'from-green-400 to-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      subjects: [
        'Basic Vocabulary',
        'Simple Grammar',
        'Pronunciation Basics',
        'Daily Conversations',
        'Numbers and Colors'
      ]
    },
    {
      level: 'Level 1',
      description: 'Elementary English skills',
      color: 'from-blue-400 to-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      subjects: [
        'Present Tenses',
        'Common Verbs',
        'Family and Friends',
        'School and Education',
        'Food and Drinks'
      ]
    },
    {
      level: 'Level 2',
      description: 'Intermediate English proficiency',
      color: 'from-purple-400 to-purple-600',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200',
      subjects: [
        'Past and Future Tenses',
        'Complex Grammar',
        'Work and Career',
        'Travel and Culture',
        'Health and Lifestyle'
      ]
    },
    {
      level: 'Upper/Free',
      description: 'Advanced English mastery',
      color: 'from-orange-400 to-orange-600',
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-200',
      subjects: [
        'Advanced Grammar',
        'Academic Writing',
        'Business English',
        'Literature and Arts',
        'Debate and Discussion'
      ]
    }
  ];

  const getLevelIcon = (level: string) => {
    switch (level) {
      case 'Junior':
        return <SparklesIcon className="h-6 w-6" />;
      case 'Level 1':
        return <BookOpenIcon className="h-6 w-6" />;
      case 'Level 2':
        return <TrophyIcon className="h-6 w-6" />;
      case 'Upper/Free':
        return <CheckCircleIcon className="h-6 w-6" />;
      default:
        return <CircleOutlineIcon className="h-6 w-6" />;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg">
              <TrophyIcon className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-800">OBLI 2025 Course Roadmap</h2>
              <p className="text-sm text-slate-500">English Fluency Competition Structure</p>
              {isPortugueseHelpVisible && (
                <p className="text-xs text-slate-500 italic">Estrutura da Competição de Fluência em Inglês</p>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <CloseIcon className="h-5 w-5 text-slate-500" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-6">
            {/* OBLI 2025 Introduction */}
            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-6 rounded-xl border border-indigo-200">
              <h3 className="text-lg font-bold text-indigo-800 mb-2">OBLI 2025 Competition</h3>
              <p className="text-indigo-700">
                The OBLI (Olimpíada Brasileira de Língua Inglesa) is a national English fluency competition 
                designed to promote English language learning and proficiency among Brazilian students.
              </p>
              {isPortugueseHelpVisible && (
                <p className="text-sm text-indigo-600 italic mt-2">
                  A OBLI (Olimpíada Brasileira de Língua Inglesa) é uma competição nacional de fluência em inglês 
                  projetada para promover o aprendizado e proficiência da língua inglesa entre estudantes brasileiros.
                </p>
              )}
            </div>

            {/* Levels and Subjects */}
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-slate-800">Competition Levels & Subjects</h3>
              {isPortugueseHelpVisible && (
                <p className="text-sm text-slate-500 italic">Níveis e Matérias da Competição</p>
              )}
              
              {obliLevels.map((levelData, index) => (
                <div
                  key={index}
                  className={`p-6 rounded-xl border-2 ${levelData.borderColor} ${levelData.bgColor} transition-all hover:shadow-md`}
                >
                  <div className="flex items-start gap-4 mb-4">
                    <div className={`p-3 bg-gradient-to-r ${levelData.color} rounded-lg text-white`}>
                      {getLevelIcon(levelData.level)}
                    </div>
                    <div className="flex-1">
                      <h4 className="text-xl font-bold text-slate-800 mb-1">{levelData.level}</h4>
                      <p className="text-slate-600 mb-3">{levelData.description}</p>
                      
                      {/* Subjects Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {levelData.subjects.map((subject, subjectIndex) => (
                          <div
                            key={subjectIndex}
                            className="flex items-center gap-2 p-3 bg-white rounded-lg border border-slate-200 shadow-sm"
                          >
                            <div className={`w-2 h-2 bg-gradient-to-r ${levelData.color} rounded-full`}></div>
                            <span className="text-sm font-medium text-slate-700">{subject}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Competition Structure */}
            <div className="bg-slate-50 p-6 rounded-xl border border-slate-200">
              <h3 className="text-lg font-bold text-slate-800 mb-4">Competition Structure</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-slate-700 mb-2">Assessment Areas</h4>
                  <ul className="space-y-1 text-sm text-slate-600">
                    <li>• Reading Comprehension</li>
                    <li>• Grammar and Vocabulary</li>
                    <li>• Listening Skills</li>
                    <li>• Writing Proficiency</li>
                    <li>• Speaking Fluency</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-slate-700 mb-2">Competition Format</h4>
                  <ul className="space-y-1 text-sm text-slate-600">
                    <li>• Multiple Choice Questions</li>
                    <li>• Essay Writing</li>
                    <li>• Oral Presentations</li>
                    <li>• Group Discussions</li>
                    <li>• Creative Projects</li>
                  </ul>
                </div>
              </div>
              {isPortugueseHelpVisible && (
                <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-sm text-blue-700 italic">
                    <strong>Estrutura da Competição:</strong> A OBLI 2025 avalia habilidades de leitura, 
                    gramática, vocabulário, compreensão auditiva, escrita e fluência oral através de 
                    múltiplas formas de avaliação.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
