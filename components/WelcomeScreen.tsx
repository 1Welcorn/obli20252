import React, { useState } from 'react';
import { suggestGoal } from '../services/geminiService';
import { SparklesIcon } from './icons/SparklesIcon';
import { GoogleClassroomIcon } from './icons/GoogleClassroomIcon';
import { LightBulbIcon } from './icons/LightBulbIcon';
import { BeakerIcon } from './icons/BeakerIcon';
import { DecorativeBlobs } from './DecorativeBlobs';

interface WelcomeScreenProps {
  onStart: (studentNeeds: string, gradeLevel: string) => void;
  isPortugueseHelpVisible: boolean;
}

const gradeLevels = [
  { value: 'junior', label: 'Junior (4th - 5th Grade)' },
  { value: 'level1', label: 'Level 1 (6th - 7th Grade)' },
  { value: 'level2', label: 'Level 2 (8th - 9th Grade)' },
  { value: 'upper', label: 'Upper/Free (High School & Adults)' },
];

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onStart, isPortugueseHelpVisible }) => {
  const [needs, setNeeds] = useState('');
  const [grade, setGrade] = useState('');
  const [isSuggestionLoading, setIsSuggestionLoading] = useState(false);
  const [suggestionError, setSuggestionError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (needs.trim() && grade) {
      onStart(needs.trim(), grade);
    }
  };

  const handleSuggestGoal = async () => {
    if (!grade) return;
    setIsSuggestionLoading(true);
    setSuggestionError(null);
    try {
        const goal = await suggestGoal(grade);
        setNeeds(goal);
    } catch (err) {
        setSuggestionError("Sorry, I couldn't come up with a suggestion right now. Please try again or write your own goal.");
    } finally {
        setIsSuggestionLoading(false);
    }
  };

  return (
    <div className="relative flex items-center justify-center min-h-full animate-fade-in py-12 overflow-hidden">
        <div className="absolute inset-0 z-0">
            <DecorativeBlobs />
        </div>
        <div className="relative z-10 w-full max-w-2xl">
             <div className="bg-white/80 backdrop-blur-lg p-8 rounded-2xl shadow-2xl border border-slate-200 text-center">
                <h1 className="text-5xl font-extrabold text-slate-800 mb-2">Welcome to the OBLI Pathfinder!</h1>
                <p className="text-lg text-slate-600 mb-8">
                    Your journey to English fluency starts here. Let's create your unique learning path!
                </p>
                <form onSubmit={handleSubmit} className="w-full text-left space-y-4">
                    <div>
                        <label htmlFor="grade-level" className="block text-sm font-medium text-slate-700 mb-1">
                            First, select your competition level
                        </label>
                         {isPortugueseHelpVisible && <p className="text-xs text-slate-500 italic mb-1">Selecione o nível da sua competição.</p>}
                        <select
                            id="grade-level"
                            value={grade}
                            onChange={(e) => setGrade(e.target.value)}
                            className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow duration-200 bg-white shadow-sm"
                            required
                        >
                            <option value="" disabled>Choose your level...</option>
                            {gradeLevels.map(level => (
                                <option key={level.value} value={level.value}>{level.label}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label htmlFor="student-needs" className="block text-sm font-medium text-slate-700 mb-1">
                            Next, what would you like to practice?
                        </label>
                         {isPortugueseHelpVisible && <p className="text-xs text-slate-500 italic mb-1">Descreva o que você quer praticar. Seja específico!</p>}
                        <textarea
                            id="student-needs"
                            value={needs}
                            onChange={(e) => setNeeds(e.target.value)}
                            placeholder="e.g., 'Improve my confidence speaking about current events...'"
                            className="w-full h-28 p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow duration-200 resize-none shadow-sm"
                            required
                        />
                    </div>
                    
                    {grade && (
                        <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 animate-fade-in">
                            <h3 className="font-semibold text-slate-700 mb-1">Not sure where to start?</h3>
                            {isPortugueseHelpVisible && <p className="text-xs text-slate-500 italic mb-2">Não tem certeza por onde começar?</p>}
                            <div className="flex flex-col sm:flex-row gap-2">
                                <button
                                    type="button"
                                    onClick={handleSuggestGoal}
                                    disabled={isSuggestionLoading}
                                    className="w-full flex-1 flex items-center justify-center gap-2 bg-teal-500 text-white font-semibold py-2 px-4 rounded-lg hover:bg-teal-600 disabled:bg-slate-400 transition-all duration-200 text-sm shadow hover:shadow-md"
                                >
                                    <LightBulbIcon className="h-5 w-5" />
                                    {isSuggestionLoading ? 'Thinking...' : 'Suggest a focus for me'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => alert("The placement test feature is coming soon! For now, try getting a suggestion.")}
                                    className="w-full flex-1 flex items-center justify-center gap-2 bg-white text-slate-700 font-semibold py-2 px-4 rounded-lg border border-slate-300 hover:bg-slate-100 transition-colors duration-200 text-sm shadow hover:shadow-md"
                                >
                                   <BeakerIcon className="h-5 w-5" />
                                   Quick Test
                                </button>
                            </div>
                             {suggestionError && <p className="text-red-500 text-sm mt-2">{suggestionError}</p>}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={!needs.trim() || !grade}
                        className="w-full flex items-center justify-center gap-2 bg-indigo-600 text-white font-bold py-4 px-6 rounded-lg hover:bg-indigo-700 disabled:bg-slate-400 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                    >
                        <SparklesIcon className="h-6 w-6" />
                        Create My Personal Plan
                    </button>
                    {isPortugueseHelpVisible && <p className="text-xs text-slate-500 italic text-center -mt-2">Criar Meu Plano Pessoal</p>}
                </form>

                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center" aria-hidden="true">
                    <div className="w-full border-t border-slate-300" />
                  </div>
                  <div className="relative flex justify-center">
                    <span className="bg-white/80 backdrop-blur-lg px-2 text-sm font-medium text-slate-500">OR</span>
                  </div>
                </div>

                <button
                    type="button"
                    onClick={() => alert('Google Classroom integration is coming soon!')}
                    className="w-full flex items-center justify-center gap-3 bg-white text-slate-700 font-semibold py-3 px-6 rounded-lg border border-slate-300 hover:bg-slate-100 transition-colors duration-200 shadow hover:shadow-md"
                >
                    <GoogleClassroomIcon className="h-5 w-5 text-[#0F9D58]" />
                    Connect with Google Classroom
                </button>
                 {isPortugueseHelpVisible && <p className="text-xs text-slate-500 italic text-center mt-1">Conectar com o Google Classroom</p>}
            </div>
        </div>
    </div>
  );
};

export default WelcomeScreen;