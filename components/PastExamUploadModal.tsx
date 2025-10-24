import React, { useState } from 'react';
import { CloseIcon } from './icons/CloseIcon';
import { DocumentTextIcon } from './icons/DocumentTextIcon';
import { PhotoIcon } from './icons/PhotoIcon';
import { PlusIcon } from './icons/PlusIcon';
import { TrashIcon } from './icons/TrashIcon';

interface AnswerOption {
    id: string;
    text: string;
    isCorrect: boolean;
}

interface Question {
    id: string;
    question: string;
    answer: string;
    answerOptions?: AnswerOption[];
    questionType: 'subjective' | 'objective';
    image?: File | null;
    imagePreview?: string;
    feedback?: string;
    observation?: string;
}

interface PastExamUploadModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (examData: {
        title: string;
        level: string;
        questions: Question[];
    }) => void;
    isPortugueseHelpVisible: boolean;
}

export const PastExamUploadModal: React.FC<PastExamUploadModalProps> = ({
    isOpen,
    onClose,
    onSave,
    isPortugueseHelpVisible
}) => {
    const [title, setTitle] = useState('');
    const [level, setLevel] = useState('all');
    const [questions, setQuestions] = useState<Question[]>([
        { 
            id: '1', 
            question: '', 
            answer: '', 
            questionType: 'subjective',
            answerOptions: [],
            image: null, 
            feedback: '', 
            observation: '' 
        }
    ]);

    const addQuestion = () => {
        const newQuestion: Question = {
            id: Date.now().toString(),
            question: '',
            answer: '',
            questionType: 'subjective',
            answerOptions: [],
            image: null,
            feedback: '',
            observation: ''
        };
        setQuestions([...questions, newQuestion]);
    };

    const removeQuestion = (questionId: string) => {
        if (questions.length > 1) {
            setQuestions(questions.filter(q => q.id !== questionId));
        }
    };

    const updateQuestion = (questionId: string, field: keyof Question, value: string | File | null) => {
        setQuestions(questions.map(q => {
            if (q.id === questionId) {
                const updated = { ...q, [field]: value };
                if (field === 'image' && value instanceof File) {
                    // Create preview URL
                    updated.imagePreview = URL.createObjectURL(value);
                }
                return updated;
            }
            return q;
        }));
    };

    const handleImageUpload = (questionId: string, event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            updateQuestion(questionId, 'image', file);
        }
    };

    const addAnswerOption = (questionId: string) => {
        const newOption: AnswerOption = {
            id: Date.now().toString(),
            text: '',
            isCorrect: false
        };
        
        setQuestions(questions.map(q => {
            if (q.id === questionId) {
                return {
                    ...q,
                    answerOptions: [...(q.answerOptions || []), newOption]
                };
            }
            return q;
        }));
    };

    const removeAnswerOption = (questionId: string, optionId: string) => {
        setQuestions(questions.map(q => {
            if (q.id === questionId) {
                return {
                    ...q,
                    answerOptions: (q.answerOptions || []).filter(opt => opt.id !== optionId)
                };
            }
            return q;
        }));
    };

    const updateAnswerOption = (questionId: string, optionId: string, field: keyof AnswerOption, value: string | boolean) => {
        setQuestions(questions.map(q => {
            if (q.id === questionId) {
                return {
                    ...q,
                    answerOptions: (q.answerOptions || []).map(opt => {
                        if (opt.id === optionId) {
                            return { ...opt, [field]: value };
                        }
                        return opt;
                    })
                };
            }
            return q;
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        // Validate form
        if (!title.trim()) {
            alert('Please enter an exam title.');
            return;
        }

        const validQuestions = questions.filter(q => {
            if (!q.question.trim()) return false;
            
            if (q.questionType === 'objective') {
                // For objective questions, need at least 2 answer options and at least one correct
                const options = q.answerOptions || [];
                const hasCorrectOption = options.some(opt => opt.isCorrect);
                return options.length >= 2 && hasCorrectOption;
            } else {
                // For subjective questions, need an answer
                return q.answer.trim();
            }
        });
        
        if (validQuestions.length === 0) {
            alert('Please add at least one valid question. For objective questions, ensure you have at least 2 answer options with one marked as correct.');
            return;
        }

        onSave({
            title: title.trim(),
            level,
            questions: validQuestions
        });

        // Reset form
        setTitle('');
        setLevel('all');
        setQuestions([{ 
            id: '1', 
            question: '', 
            answer: '', 
            questionType: 'subjective',
            answerOptions: [],
            image: null, 
            feedback: '', 
            observation: '' 
        }]);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-slate-200">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-indigo-100 rounded-lg">
                            <DocumentTextIcon className="h-6 w-6 text-indigo-600" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-slate-800">Upload Past Exam</h2>
                            <p className="text-sm text-slate-500">Create quiz from past OBLI exams</p>
                            {isPortugueseHelpVisible && (
                                <p className="text-xs text-slate-500 italic">Criar quiz a partir de exames OBLI anteriores</p>
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
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Exam Details */}
                        <div className="bg-slate-50 p-6 rounded-xl border border-slate-200">
                            <h3 className="text-lg font-bold text-slate-800 mb-4">Exam Information</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        Exam Title *
                                    </label>
                                    <input
                                        type="text"
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                        placeholder="e.g., OBLI 2024 Level 1 Exam"
                                        required
                                    />
                                    {isPortugueseHelpVisible && (
                                        <p className="text-xs text-slate-500 italic mt-1">
                                            Título do exame (ex: Exame OBLI 2024 Nível 1)
                                        </p>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        Target Level *
                                    </label>
                                    <select
                                        value={level}
                                        onChange={(e) => setLevel(e.target.value)}
                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                    >
                                        <option value="all">All Levels</option>
                                        <option value="junior">Junior</option>
                                        <option value="level1">Level 1</option>
                                        <option value="level2">Level 2</option>
                                        <option value="upper">Upper/Free</option>
                                    </select>
                                    {isPortugueseHelpVisible && (
                                        <p className="text-xs text-slate-500 italic mt-1">
                                            Nível de destino do exame
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Questions */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-bold text-slate-800">Questions</h3>
                                <button
                                    type="button"
                                    onClick={addQuestion}
                                    className="flex items-center gap-2 px-3 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                                >
                                    <PlusIcon className="h-4 w-4" />
                                    Add Question
                                </button>
                            </div>

                            {questions.map((question, index) => (
                                <div key={question.id} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                                    <div className="flex items-center justify-between mb-4">
                                        <h4 className="text-md font-semibold text-slate-700">
                                            Question {index + 1}
                                        </h4>
                                        {questions.length > 1 && (
                                            <button
                                                type="button"
                                                onClick={() => removeQuestion(question.id)}
                                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                            >
                                                <TrashIcon className="h-4 w-4" />
                                            </button>
                                        )}
                                    </div>

                                    <div className="space-y-4">
                                        {/* Question Text */}
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                                Question Text *
                                            </label>
                                            <textarea
                                                value={question.question}
                                                onChange={(e) => updateQuestion(question.id, 'question', e.target.value)}
                                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-y"
                                                rows={3}
                                                placeholder="Enter the question text..."
                                                required
                                            />
                                        </div>

                                        {/* Question Type */}
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                                Question Type *
                                            </label>
                                            <div className="flex gap-4">
                                                <label className="flex items-center">
                                                    <input
                                                        type="radio"
                                                        name={`questionType-${question.id}`}
                                                        value="subjective"
                                                        checked={question.questionType === 'subjective'}
                                                        onChange={(e) => updateQuestion(question.id, 'questionType', e.target.value)}
                                                        className="mr-2"
                                                    />
                                                    <span className="text-sm text-slate-700">Subjective (Text Answer)</span>
                                                </label>
                                                <label className="flex items-center">
                                                    <input
                                                        type="radio"
                                                        name={`questionType-${question.id}`}
                                                        value="objective"
                                                        checked={question.questionType === 'objective'}
                                                        onChange={(e) => updateQuestion(question.id, 'questionType', e.target.value)}
                                                        className="mr-2"
                                                    />
                                                    <span className="text-sm text-slate-700">Objective (Multiple Choice)</span>
                                                </label>
                                            </div>
                                            {isPortugueseHelpVisible && (
                                                <p className="text-xs text-slate-500 italic mt-1">
                                                    Escolha o tipo de pergunta: subjetiva (resposta em texto) ou objetiva (múltipla escolha)
                                                </p>
                                            )}
                                        </div>

                                        {/* Answer Section */}
                                        {question.questionType === 'subjective' ? (
                                            /* Subjective Answer */
                                            <div>
                                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                                    Correct Answer *
                                                </label>
                                                <input
                                                    type="text"
                                                    value={question.answer}
                                                    onChange={(e) => updateQuestion(question.id, 'answer', e.target.value)}
                                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                                    placeholder="Enter the correct answer..."
                                                    required
                                                />
                                            </div>
                                        ) : (
                                            /* Objective Answer Options */
                                            <div>
                                                <div className="flex items-center justify-between mb-3">
                                                    <label className="block text-sm font-medium text-slate-700">
                                                        Answer Options *
                                                    </label>
                                                    <button
                                                        type="button"
                                                        onClick={() => addAnswerOption(question.id)}
                                                        className="flex items-center gap-1 px-3 py-1 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 transition-colors"
                                                    >
                                                        <PlusIcon className="h-3 w-3" />
                                                        Add Option
                                                    </button>
                                                </div>
                                                
                                                <div className="space-y-3">
                                                    {(question.answerOptions || []).map((option, optionIndex) => (
                                                        <div key={option.id} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
                                                            <input
                                                                type="radio"
                                                                name={`correctAnswer-${question.id}`}
                                                                checked={option.isCorrect}
                                                                onChange={(e) => {
                                                                    // Set this option as correct and uncheck others
                                                                    const options = question.answerOptions || [];
                                                                    options.forEach(opt => {
                                                                        updateAnswerOption(question.id, opt.id, 'isCorrect', opt.id === option.id);
                                                                    });
                                                                }}
                                                                className="text-indigo-600"
                                                            />
                                                            <input
                                                                type="text"
                                                                value={option.text}
                                                                onChange={(e) => updateAnswerOption(question.id, option.id, 'text', e.target.value)}
                                                                className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                                                placeholder={`Option ${optionIndex + 1}...`}
                                                            />
                                                            <button
                                                                type="button"
                                                                onClick={() => removeAnswerOption(question.id, option.id)}
                                                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                                disabled={(question.answerOptions || []).length <= 2}
                                                            >
                                                                <TrashIcon className="h-4 w-4" />
                                                            </button>
                                                        </div>
                                                    ))}
                                                    
                                                    {(question.answerOptions || []).length === 0 && (
                                                        <div className="text-center py-4 text-slate-500">
                                                            <p>No answer options added yet.</p>
                                                            <p className="text-sm">Click "Add Option" to create multiple choice options.</p>
                                                        </div>
                                                    )}
                                                </div>
                                                
                                                {isPortugueseHelpVisible && (
                                                    <p className="text-xs text-slate-500 italic mt-2">
                                                        Adicione pelo menos 2 opções e marque uma como correta
                                                    </p>
                                                )}
                                            </div>
                                        )}

                                        {/* Feedback */}
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                                Feedback (Optional)
                                            </label>
                                            <textarea
                                                value={question.feedback || ''}
                                                onChange={(e) => updateQuestion(question.id, 'feedback', e.target.value)}
                                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-y"
                                                rows={2}
                                                placeholder="Add feedback or explanation for this question..."
                                            />
                                            {isPortugueseHelpVisible && (
                                                <p className="text-xs text-slate-500 italic mt-1">
                                                    Adicione feedback ou explicação para esta pergunta
                                                </p>
                                            )}
                                        </div>

                                        {/* Observation */}
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                                Observation (Optional)
                                            </label>
                                            <textarea
                                                value={question.observation || ''}
                                                onChange={(e) => updateQuestion(question.id, 'observation', e.target.value)}
                                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-y"
                                                rows={2}
                                                placeholder="Add any observations or notes about this question..."
                                            />
                                            {isPortugueseHelpVisible && (
                                                <p className="text-xs text-slate-500 italic mt-1">
                                                    Adicione observações ou notas sobre esta pergunta
                                                </p>
                                            )}
                                        </div>

                                        {/* Image Upload */}
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                                Question Image (Optional)
                                            </label>
                                            <div className="flex items-center gap-4">
                                                <label className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors cursor-pointer">
                                                    <PhotoIcon className="h-4 w-4" />
                                                    Choose Image
                                                    <input
                                                        type="file"
                                                        accept="image/*"
                                                        onChange={(e) => handleImageUpload(question.id, e)}
                                                        className="hidden"
                                                    />
                                                </label>
                                                {question.image && (
                                                    <span className="text-sm text-slate-600">
                                                        {question.image.name}
                                                    </span>
                                                )}
                                            </div>
                                            
                                            {/* Image Preview */}
                                            {question.imagePreview && (
                                                <div className="mt-3">
                                                    <img
                                                        src={question.imagePreview}
                                                        alt="Question preview"
                                                        className="max-w-xs max-h-32 object-contain border border-slate-200 rounded-lg"
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Submit Button */}
                        <div className="flex justify-end gap-3 pt-6 border-t border-slate-200">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-6 py-2 text-slate-600 hover:text-slate-800 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-semibold"
                            >
                                Create Quiz
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};
