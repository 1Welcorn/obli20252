import React, { useState, useEffect } from 'react';
import { CloseIcon } from './icons/CloseIcon';
import { DocumentTextIcon } from './icons/DocumentTextIcon';
import type { MaterialNote } from '../types';

interface MaterialNotePopupProps {
  isOpen: boolean;
  onClose: () => void;
  materialId: string;
  materialTitle: string;
  userId: string;
  existingNote?: MaterialNote;
  onSaveNote: (note: Omit<MaterialNote, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onDeleteNote?: (noteId: string) => void;
}

export const MaterialNotePopup: React.FC<MaterialNotePopupProps> = ({
  isOpen,
  onClose,
  materialId,
  materialTitle,
  userId,
  existingNote,
  onSaveNote,
  onDeleteNote
}) => {
  const [content, setContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (existingNote) {
      setContent(existingNote.content);
    } else {
      setContent('');
    }
  }, [existingNote, isOpen]);

  const handleSave = async () => {
    if (!content.trim()) return;
    
    setIsLoading(true);
    try {
      await onSaveNote({
        materialId,
        materialTitle,
        content: content.trim(),
        userId,
        updatedAt: new Date()
      });
      onClose();
    } catch (error) {
      console.error('Error saving note:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!existingNote || !onDeleteNote) return;
    
    if (window.confirm('Are you sure you want to delete this note?')) {
      setIsLoading(true);
      try {
        await onDeleteNote(existingNote.id);
        onClose();
      } catch (error) {
        console.error('Error deleting note:', error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-100 rounded-lg">
              <DocumentTextIcon className="h-6 w-6 text-indigo-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-800">Add Note</h2>
              <p className="text-sm text-slate-500">for {materialTitle}</p>
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
        <div className="flex-1 p-6">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write your notes here..."
            className="w-full h-64 p-4 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
            autoFocus
          />
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-slate-200 bg-slate-50">
          <div className="flex gap-2">
            {existingNote && onDeleteNote && (
              <button
                onClick={handleDelete}
                disabled={isLoading}
                className="px-4 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors disabled:opacity-50"
              >
                Delete Note
              </button>
            )}
          </div>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              disabled={isLoading}
              className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={!content.trim() || isLoading}
              className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Saving...
                </>
              ) : (
                'Save Note'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
