import type { MaterialNote } from '../types';

const NOTES_STORAGE_KEY = 'material_notes';

// Get all notes from localStorage
export const getAllNotes = (userId: string): MaterialNote[] => {
  try {
    const storedNotes = localStorage.getItem(`${NOTES_STORAGE_KEY}_${userId}`);
    if (!storedNotes) return [];
    
    const notes = JSON.parse(storedNotes);
    // Convert date strings back to Date objects
    return notes.map((note: any) => ({
      ...note,
      createdAt: new Date(note.createdAt),
      updatedAt: new Date(note.updatedAt)
    }));
  } catch (error) {
    console.error('Error loading notes:', error);
    return [];
  }
};

// Get notes for a specific material
export const getNotesForMaterial = (materialId: string, userId: string): MaterialNote[] => {
  const allNotes = getAllNotes(userId);
  return allNotes.filter(note => note.materialId === materialId);
};

// Get a specific note by ID
export const getNoteById = (noteId: string, userId: string): MaterialNote | null => {
  const allNotes = getAllNotes(userId);
  return allNotes.find(note => note.id === noteId) || null;
};

// Save a note
export const saveNote = (noteData: Omit<MaterialNote, 'id' | 'createdAt' | 'updatedAt'>, userId: string): MaterialNote => {
  const allNotes = getAllNotes(userId);
  
  // Check if note already exists for this material and user
  const existingNoteIndex = allNotes.findIndex(note => 
    note.materialId === noteData.materialId && note.userId === noteData.userId
  );
  
  const now = new Date();
  const newNote: MaterialNote = {
    id: `note_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    ...noteData,
    createdAt: existingNoteIndex >= 0 ? allNotes[existingNoteIndex].createdAt : now,
    updatedAt: now
  };
  
  if (existingNoteIndex >= 0) {
    // Update existing note
    allNotes[existingNoteIndex] = newNote;
  } else {
    // Add new note
    allNotes.push(newNote);
  }
  
  // Save to localStorage
  localStorage.setItem(`${NOTES_STORAGE_KEY}_${userId}`, JSON.stringify(allNotes));
  
  return newNote;
};

// Delete a note
export const deleteNote = (noteId: string, userId: string): void => {
  const allNotes = getAllNotes(userId);
  const filteredNotes = allNotes.filter(note => note.id !== noteId);
  
  localStorage.setItem(`${NOTES_STORAGE_KEY}_${userId}`, JSON.stringify(filteredNotes));
};

// Get notes count for a material
export const getNotesCountForMaterial = (materialId: string, userId: string): number => {
  const notes = getNotesForMaterial(materialId, userId);
  return notes.length;
};

// Get all notes grouped by material
export const getNotesGroupedByMaterial = (userId: string): { [materialId: string]: MaterialNote[] } => {
  const allNotes = getAllNotes(userId);
  const grouped: { [materialId: string]: MaterialNote[] } = {};
  
  allNotes.forEach(note => {
    if (!grouped[note.materialId]) {
      grouped[note.materialId] = [];
    }
    grouped[note.materialId].push(note);
  });
  
  return grouped;
};

// Search notes by content
export const searchNotes = (query: string, userId: string): MaterialNote[] => {
  const allNotes = getAllNotes(userId);
  const lowercaseQuery = query.toLowerCase();
  
  return allNotes.filter(note => 
    note.content.toLowerCase().includes(lowercaseQuery) ||
    note.materialTitle.toLowerCase().includes(lowercaseQuery)
  );
};
