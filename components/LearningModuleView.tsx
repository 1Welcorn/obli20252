// [FE-FIX] This file was created to display the lessons within a module, fixing module resolution errors.
import React, { useState, useEffect, useCallback } from 'react';
// FIX: Import LessonStatus to explicitly type lesson status transitions, resolving a TypeScript error where a string was not assignable to the 'LessonStatus' union type.
import type { Module, Lesson, LessonStatus } from '../types';
import { generatePracticeFeedback } from '../services/geminiService';
import { ArrowLeftIcon } from './icons/ArrowLeftIcon';
import { CheckCircleIcon } from './icons/CheckCircleIcon';
import { BookOpenIcon } from './icons/BookOpenIcon';
import { SpeakerWaveIcon } from './icons/SpeakerWaveIcon';
import { LightBulbIcon } from './icons/LightBulbIcon';
import { RefreshIcon } from './icons/RefreshIcon';

interface LearningModuleViewProps {
  module: Module;
  onBack: () => void;
  onUpdateLesson: (updatedLesson: Lesson) => void;
  isPortugueseHelpVisible: boolean;
  gradeLevel: string;
}

const LearningModuleView: React.FC<LearningModuleViewProps> = ({ module, onBack, onUpdateLesson, isPortugueseHelpVisible, gradeLevel }) => {
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [notes, setNotes] = useState('');
  const [speakingWord, setSpeakingWord] = useState<string | null>(null); // State for audio feedback
  
  // State for interactive practice
  const [practiceAnswer, setPracticeAnswer] = useState('');
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isFeedbackLoading, setIsFeedbackLoading] = useState(false);

  useEffect(() => {
    // Select the first "in_progress" or "not_started" lesson by default
    const firstUnfinishedLesson = module.lessons.find(l => l.status !== 'completed');
    setSelectedLesson(firstUnfinishedLesson || module.lessons[0] || null);
  }, [module]);
  
  useEffect(() => {
    if (selectedLesson) {
      setNotes(selectedLesson.notes || '');
      // Initialize practice state
      setPracticeAnswer(selectedLesson.practice_answer || '');
      setFeedback(selectedLesson.practice_feedback || null);
      setIsFeedbackLoading(false); // Reset loading state
    }
    // When lesson changes, stop any ongoing speech
    window.speechSynthesis.cancel();
    setSpeakingWord(null);
  }, [selectedLesson]);

  const handleSelectLesson = (lesson: Lesson) => {
    // Save notes for the current lesson before switching
    if (selectedLesson) {
        handleSaveNotes();
    }
    setSelectedLesson(lesson);
  };

  const handleToggleComplete = () => {
    if (selectedLesson) {
      // FIX: Explicitly type `newStatus` as `LessonStatus` to ensure type compatibility.
      const newStatus: LessonStatus = selectedLesson.status === 'completed' ? 'in_progress' : 'completed';
      const updatedLesson = { ...selectedLesson, status: newStatus };
      onUpdateLesson(updatedLesson);
      setSelectedLesson(updatedLesson);
    }
  };

  const handleSaveNotes = useCallback(() => {
    if (selectedLesson && notes !== (selectedLesson.notes || '')) {
      onUpdateLesson({ ...selectedLesson, notes });
    }
  }, [selectedLesson, notes, onUpdateLesson]);

  const handleSpeak = (word: string) => {
    if ('speechSynthesis' in window) {
      // If the clicked word is already speaking, cancel it. Otherwise, cancel any other speech.
      if (speakingWord === word) {
        window.speechSynthesis.cancel();
        return; // onend handler will clear state
      }
      window.speechSynthesis.cancel();
      
      const utterance = new SpeechSynthesisUtterance(word);
      utterance.lang = 'en-US';
      
      utterance.onstart = () => {
        setSpeakingWord(word);
      };

      utterance.onend = () => {
        setSpeakingWord(null);
      };

      utterance.onerror = () => {
        setSpeakingWord(null);
        console.error("An error occurred during speech synthesis.");
      };
      
      window.speechSynthesis.speak(utterance);
    } else {
      alert('Sorry, your browser does not support text-to-speech.');
    }
  };

  const handlePracticeSubmit = async () => {
    if (!selectedLesson || !practiceAnswer.trim()) return;

    setIsFeedbackLoading(true);
    setFeedback(null);

    try {
        const aiFeedback = await generatePracticeFeedback(
            selectedLesson.practice_prompt,
            practiceAnswer,
            gradeLevel
        );
        setFeedback(aiFeedback);
        onUpdateLesson({
            ...selectedLesson,
            practice_answer: practiceAnswer,
            practice_feedback: aiFeedback,
        });
    } catch (error) {
        console.error("Failed to get practice feedback:", error);
        setFeedback("Sorry, I couldn't check your answer right now. Please try again in a moment.");
    } finally {
        setIsFeedbackLoading(false);
    }
  };

  const handleTryAgain = () => {
      if (!selectedLesson) return;
      const lessonUpdate = { ...selectedLesson, practice_answer: '', practice_feedback: '' };
      onUpdateLesson(lessonUpdate); // Persist the cleared state
      setPracticeAnswer('');
      setFeedback(null);
  };
  
  return (
    <div className="animate-fade-in">
      <button onClick={onBack} className="flex items-center gap-2 text-indigo-600 font-semibold mb-6 hover:underline">
        <ArrowLeftIcon className="h-5 w-5" />
        Back to Dashboard
      </button>

      <header className="bg-white p-6 rounded-2xl shadow-lg border border-slate-200 mb-8">
        <h1 className="text-4xl font-extrabold text-slate-900">{module.title}</h1>
        <p className="text-lg text-slate-600 mt-1">{module.description}</p>
        {isPortugueseHelpVisible && <p className="text-sm text-slate-500 mt-2 italic">Selecione uma lição da lista para começar.</p>}
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Lesson List */}
        <div className="lg:col-span-1">
            <div className="bg-white p-4 rounded-2xl shadow-lg border border-slate-200">
                <h2 className="text-xl font-bold text-slate-800 p-2 mb-2">Lessons</h2>
                <ul className="space-y-2">
                    {module.lessons.map((lesson, index) => (
                        <li key={index}>
                            <button 
                                onClick={() => handleSelectLesson(lesson)}
                                className={`w-full text-left flex items-center gap-3 p-3 rounded-lg transition-colors duration-200 ${selectedLesson?.title === lesson.title ? 'bg-indigo-100' : 'hover:bg-slate-100'}`}
                            >
                                {lesson.status === 'completed' 
                                    ? <CheckCircleIcon className="h-6 w-6 text-green-500 flex-shrink-0" /> 
                                    : <div className={`h-6 w-6 rounded-full border-2 ${selectedLesson?.title === lesson.title ? 'border-indigo-500 bg-white' : 'border-slate-300 bg-slate-50'} flex-shrink-0`} />
                                }
                                <span className={`font-semibold ${selectedLesson?.title === lesson.title ? 'text-indigo-700' : 'text-slate-700'}`}>{lesson.title}</span>
                            </button>
                        </li>
                    ))}
                </ul>
            </div>
        </div>

        {/* Lesson Details */}
        <div className="lg:col-span-2">
            {selectedLesson ? (
                <div className="bg-white p-6 rounded-2xl shadow-2xl border border-slate-200">
                    <h2 className="text-3xl font-bold text-slate-800">{selectedLesson.title}</h2>
                    
                    <div className="mt-6 space-y-6">
                        <div>
                            <h3 className="font-semibold text-lg text-slate-700">Objective</h3>
                            {isPortugueseHelpVisible && <p className="text-xs text-slate-500 italic mb-1">Objetivo</p>}
                            <p className="text-slate-600">{selectedLesson.objective}</p>
                        </div>
                        <div>
                            <h3 className="font-semibold text-lg text-slate-700">Explanation</h3>
                            {isPortugueseHelpVisible && <p className="text-xs text-slate-500 italic mb-1">Explicação</p>}
                            <p className="text-slate-600 bg-slate-50 p-3 rounded-md border border-slate-200">{selectedLesson.explanation}</p>
                        </div>
                        <div>
                            <h3 className="font-semibold text-lg text-slate-700">Example</h3>
                            {isPortugueseHelpVisible && <p className="text-xs text-slate-500 italic mb-1">Exemplo</p>}
                            <p className="text-slate-800 font-mono bg-slate-100 p-3 rounded-md border border-slate-200">"{selectedLesson.example}"</p>
                        </div>
                        
                        <div className="p-4 bg-indigo-50/70 rounded-lg border-l-4 border-indigo-400 space-y-3">
                            <h3 className="font-bold text-lg text-indigo-800">Practice Time!</h3>
                            {isPortugueseHelpVisible && <p className="text-xs text-slate-500 italic mb-1">Hora de praticar!</p>}
                            <p className="text-indigo-700 mt-1">{selectedLesson.practice_prompt}</p>

                            <textarea
                                value={practiceAnswer}
                                onChange={(e) => setPracticeAnswer(e.target.value)}
                                placeholder="Type your answer here..."
                                className="w-full h-24 p-3 border border-indigo-200 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white resize-none shadow-sm"
                                disabled={isFeedbackLoading || !!feedback}
                            />

                            {!feedback && (
                                <button
                                    onClick={handlePracticeSubmit}
                                    disabled={isFeedbackLoading || !practiceAnswer.trim()}
                                    className="w-full flex items-center justify-center gap-2 bg-indigo-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-indigo-700 disabled:bg-slate-400 transition-all duration-200 shadow hover:shadow-md"
                                >
                                    {isFeedbackLoading ? (
                                        <>
                                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                            Checking...
                                        </>
                                    ) : (
                                        <>
                                            <CheckCircleIcon className="h-5 w-5" />
                                            Submit for Feedback
                                        </>
                                    )}
                                </button>
                            )}

                            {feedback && !isFeedbackLoading && (
                                <div className="animate-fade-in space-y-3">
                                    <div className="p-4 bg-teal-50 rounded-lg border border-teal-200 flex gap-3">
                                        <LightBulbIcon className="h-6 w-6 text-teal-500 flex-shrink-0 mt-1" />
                                        <div>
                                            <h4 className="font-bold text-teal-800">Teacher Alex's Feedback</h4>
                                            <p className="text-teal-700 whitespace-pre-wrap">{feedback}</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={handleTryAgain}
                                        className="w-full flex items-center justify-center gap-2 bg-white text-slate-700 font-semibold py-2 px-4 rounded-lg border border-slate-300 hover:bg-slate-100 transition-colors duration-200 shadow hover:shadow-md"
                                    >
                                        <RefreshIcon className="h-5 w-5" />
                                        Try Again
                                    </button>
                                </div>
                            )}
                        </div>

                        {selectedLesson.pronunciation_guide && selectedLesson.pronunciation_guide.length > 0 && (
                            <div className="animate-fade-in">
                                <h3 className="font-semibold text-lg text-slate-700">Pronunciation Guide</h3>
                                {isPortugueseHelpVisible && <p className="text-xs text-slate-500 italic mb-1">Guia de Pronúncia</p>}
                                <div className="mt-2 space-y-2">
                                    {selectedLesson.pronunciation_guide.map((item, index) => {
                                        const isSpeaking = speakingWord === item.word;
                                        return (
                                            <div key={index} className={`flex items-center gap-4 p-3 rounded-md border transition-all duration-300 ${isSpeaking ? 'bg-indigo-100 border-indigo-300 ring-2 ring-indigo-200' : 'bg-slate-50 border-slate-200'}`}>
                                                <button 
                                                    onClick={() => handleSpeak(item.word)} 
                                                    className={`p-1 rounded-full transition-colors ${isSpeaking ? 'text-fuchsia-500' : 'text-indigo-600 hover:bg-indigo-100'}`}
                                                    aria-label={`Pronounce ${item.word}`}
                                                >
                                                    <SpeakerWaveIcon className={`h-6 w-6 transition-transform ${isSpeaking ? 'animate-pulse' : ''}`} />
                                                </button>
                                                <div>
                                                    <p className="font-bold text-slate-800 capitalize">{item.word}</p>
                                                    <p className="text-sm text-slate-500 font-mono">/{item.ipa}/</p>
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>
                        )}

                         <div>
                            <h3 className="font-semibold text-lg text-slate-700">My Notes</h3>
                            {isPortugueseHelpVisible && <p className="text-xs text-slate-500 italic mb-1">Minhas Anotações</p>}
                            <textarea
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                onBlur={handleSaveNotes}
                                placeholder="Jot down your thoughts, questions, or new vocabulary..."
                                className="w-full h-32 p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-yellow-50/50"
                            />
                        </div>
                    </div>

                    <button
                        onClick={handleToggleComplete}
                        className={`w-full mt-8 flex items-center justify-center gap-3 py-3 px-4 rounded-lg font-bold transition-colors text-lg ${
                            selectedLesson.status === 'completed'
                                ? 'bg-green-600 text-white hover:bg-green-700'
                                : 'bg-indigo-600 text-white hover:bg-indigo-700'
                        }`}
                    >
                        {selectedLesson.status === 'completed' ? <><CheckCircleIcon className="h-6 w-6" />Mark as Incomplete</> : <><BookOpenIcon className="h-6 w-6" />Mark as Complete</>}
                    </button>

                </div>
            ) : (
                <div className="bg-white p-8 rounded-2xl shadow-lg border border-slate-200 text-center">
                    <BookOpenIcon className="h-16 w-16 text-slate-300 mx-auto" />
                    <h2 className="mt-4 text-2xl font-bold text-slate-700">Select a lesson</h2>
                    <p className="text-slate-500 mt-1">Choose a lesson from the list to get started.</p>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default LearningModuleView;