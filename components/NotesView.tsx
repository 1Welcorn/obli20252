import React from 'react';
import type { LearningPlan, MaterialNote, User } from '../types';
import { ArrowLeftIcon } from './icons/ArrowLeftIcon';
import { DocumentTextIcon } from './icons/DocumentTextIcon';
import { BookOpenIcon } from './icons/BookOpenIcon';
import { getAllNotes } from '../services/notesService';

interface NotesViewProps {
  plan: LearningPlan;
  onBack: () => void;
  isPortugueseHelpVisible: boolean;
  currentUser: User | null;
}

const NotesView: React.FC<NotesViewProps> = ({ plan, onBack, isPortugueseHelpVisible, currentUser }) => {
  const notesByModule = plan.modules.map(module => ({
    moduleTitle: module.title,
    lessonsWithNotes: module.lessons.filter(lesson => lesson.notes && lesson.notes.trim() !== '')
  })).filter(module => module.lessonsWithNotes.length > 0);

  // Get material notes
  const materialNotes = currentUser ? getAllNotes(currentUser.uid) : [];

  return (
    <div className="animate-fade-in max-w-4xl mx-auto">
      <button onClick={onBack} className="flex items-center gap-2 text-indigo-600 font-semibold mb-6 hover:underline">
        <ArrowLeftIcon className="h-5 w-5" />
        Back to Dashboard
      </button>

      <div className="bg-white p-8 rounded-2xl shadow-2xl border border-slate-200 mb-8">
        <h1 className="text-4xl font-extrabold text-slate-900">My Notes</h1>
        <p className="text-lg text-slate-600 mt-2">Here are all the notes you've taken. A great place to review!</p>
        {isPortugueseHelpVisible && <p className="text-sm text-slate-500 mt-2 italic">Aqui estão todas as anotações que você fez. Um ótimo lugar para revisar!</p>}
      </div>

      {notesByModule.length > 0 ? (
        <div className="space-y-8">
          {notesByModule.map(moduleData => (
            <div key={moduleData.moduleTitle}>
              <h2 className="text-2xl font-bold text-slate-800 border-b-2 border-indigo-200 pb-2 mb-4">{moduleData.moduleTitle}</h2>
              <div className="space-y-4">
                {moduleData.lessonsWithNotes.map(lesson => (
                  <div key={lesson.title} className="bg-white p-6 rounded-2xl shadow-lg border-l-4 border-fuchsia-500">
                     <h3 className="text-xl font-bold text-slate-800 mb-2">{lesson.title}</h3>
                     <div className="prose prose-slate max-w-none bg-yellow-50/70 p-4 rounded-md border border-yellow-200">
                        <p className="whitespace-pre-wrap">{lesson.notes}</p>
                     </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center bg-white p-12 rounded-2xl shadow-lg border border-slate-200">
            <DocumentTextIcon className="h-16 w-16 mx-auto text-slate-300" />
            <h2 className="mt-4 text-2xl font-bold text-slate-800">No Lesson Notes Yet</h2>
            <p className="mt-1 text-slate-600">You haven't written any lesson notes yet.</p>
            {isPortugueseHelpVisible && <p className="text-sm text-slate-500 mt-2 italic">Você ainda não escreveu nenhuma nota de lição.</p>}
        </div>
      )}

      {/* Material Notes Section */}
      {materialNotes.length > 0 && (
        <div className="mt-12">
          <div className="bg-white p-8 rounded-2xl shadow-2xl border border-slate-200 mb-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-blue-100 rounded-lg">
                <BookOpenIcon className="h-6 w-6 text-blue-600" />
              </div>
              <h2 className="text-2xl font-bold text-slate-800">Study Material Notes</h2>
            </div>
            <p className="text-slate-600">Notes you've taken on study materials and resources.</p>
            {isPortugueseHelpVisible && <p className="text-sm text-slate-500 italic mt-1">Anotações que você fez sobre materiais de estudo e recursos.</p>}
          </div>

          <div className="space-y-4">
            {materialNotes.map(note => (
              <div key={note.id} className="bg-white p-6 rounded-2xl shadow-lg border-l-4 border-blue-500">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xl font-bold text-slate-800">{note.materialTitle}</h3>
                  <span className="text-sm text-slate-500">
                    {note.updatedAt.toLocaleDateString()}
                  </span>
                </div>
                <div className="prose prose-slate max-w-none bg-blue-50/70 p-4 rounded-md border border-blue-200">
                  <p className="whitespace-pre-wrap">{note.content}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* No notes at all */}
      {notesByModule.length === 0 && materialNotes.length === 0 && (
        <div className="text-center bg-white p-12 rounded-2xl shadow-lg border border-slate-200">
            <DocumentTextIcon className="h-16 w-16 mx-auto text-slate-300" />
            <h2 className="mt-4 text-2xl font-bold text-slate-800">No Notes Yet</h2>
            <p className="mt-1 text-slate-600">You haven't written any notes. Go to a lesson or study material to start jotting down your thoughts!</p>
            {isPortugueseHelpVisible && <p className="text-sm text-slate-500 mt-2 italic">Você ainda não escreveu nenhuma nota. Vá para uma lição ou material de estudo para começar a anotar suas ideias!</p>}
        </div>
      )}
    </div>
  );
};

export default NotesView;