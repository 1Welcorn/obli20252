import React from 'react';
import type { LearningPlan, Student } from '../types';
import { CloseIcon } from './icons/CloseIcon';
import { DocumentArrowDownIcon } from './icons/DocumentArrowDownIcon';

interface DatabaseInspectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  learningPlan: LearningPlan | null;
  students: Student[];
  collaborators: string[];
}

const DataViewer: React.FC<{ title: string; data: any }> = ({ title, data }) => (
    <div>
        <h3 className="text-lg font-semibold text-slate-700 mb-2 border-b border-slate-200 pb-1">{title}</h3>
        <pre className="bg-slate-100 p-3 rounded-lg text-xs overflow-x-auto">
            <code>
                {JSON.stringify(data, null, 2)}
            </code>
        </pre>
    </div>
);

const DatabaseInspectorModal: React.FC<DatabaseInspectorModalProps> = ({ isOpen, onClose, learningPlan, students, collaborators }) => {
  if (!isOpen) return null;

  const handleExport = () => {
    const appState = {
      currentUserLearningPlan: learningPlan,
      allStudents: students,
      collaborators: collaborators,
      timestamp: new Date().toISOString(),
    };
    const jsonString = JSON.stringify(appState, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `obli_pathfinder_data_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 animate-fade-in"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-2xl m-4 flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4 flex-shrink-0">
          <h2 className="text-2xl font-bold text-slate-800">App State Inspector</h2>
          <div className="flex items-center gap-2">
            <button
                onClick={handleExport}
                className="flex items-center gap-2 px-3 py-2 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors text-sm shadow hover:shadow-md"
                title="Export data to JSON file"
            >
                <DocumentArrowDownIcon className="h-5 w-5" />
                <span>Export</span>
            </button>
            <button onClick={onClose} className="text-slate-500 hover:text-slate-800">
                <CloseIcon className="h-6 w-6" />
            </button>
          </div>
        </div>
        <p className="text-slate-600 mb-4 flex-shrink-0">
          This is a live view of the application's in-memory data. You can export it to a file for backup.
        </p>

        <div className="space-y-6 overflow-y-auto pr-2">
            <DataViewer title="Current User/Student State" data={learningPlan || { info: "No learning plan generated for the current student user." }} />
            <DataViewer title="Classroom Roster (All Students)" data={students} />
            <DataViewer title="Collaborators" data={collaborators} />
        </div>
      </div>
    </div>
  );
};

export default DatabaseInspectorModal;