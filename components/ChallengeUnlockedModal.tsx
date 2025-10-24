// [FE-FIX] This file was created to provide a celebratory modal for module completion.
import React from 'react';
import { TrophyIcon } from './icons/TrophyIcon';
import { CloseIcon } from './icons/CloseIcon';
import { SparklesIcon } from './icons/SparklesIcon';

interface ChallengeUnlockedModalProps {
  isOpen: boolean;
  onClose: () => void;
  moduleTitle: string;
}

export const ChallengeUnlockedModal: React.FC<ChallengeUnlockedModalProps> = ({ isOpen, onClose, moduleTitle }) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="relative bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md m-4 text-center transform transition-all animate-fade-in-up"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-500 hover:text-slate-800"
          aria-label="Close"
        >
          <CloseIcon className="h-6 w-6" />
        </button>

        <div className="mx-auto text-yellow-400">
            <TrophyIcon className="h-24 w-24 mx-auto animate-bounce" />
        </div>

        <h2 className="text-3xl font-extrabold text-slate-800 mt-4">Module Complete!</h2>
        <p className="text-lg text-slate-600 mt-2">
            Amazing work! You've successfully completed the module:
        </p>
        <p className="font-bold text-indigo-600 text-xl my-4 bg-indigo-50 p-3 rounded-lg">
          {moduleTitle}
        </p>
        <p className="text-slate-600">Keep up the fantastic momentum!</p>
        
        <button
          onClick={onClose}
          className="w-full mt-6 flex items-center justify-center gap-2 bg-indigo-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-indigo-700 transition-colors shadow-lg hover:shadow-xl"
        >
            <SparklesIcon className="h-5 w-5" />
            Continue Learning
        </button>
      </div>
    </div>
  );
};

export default ChallengeUnlockedModal;
