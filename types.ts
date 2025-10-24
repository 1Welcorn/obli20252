// [FE-FIX] Implemented missing type definitions to resolve module resolution errors across the application.
export type LessonStatus = 'not_started' | 'in_progress' | 'completed';

export interface PronunciationGuide {
    word: string;
    ipa: string;
}

export interface Lesson {
    title: string;
    objective: string;
    explanation: string;
    example: string;
    practice_prompt: string;
    pronunciation_guide: PronunciationGuide[];
    status: LessonStatus;
    notes?: string;
    practice_answer?: string;
    practice_feedback?: string;
}

export interface Module {
    title: string;
    description: string;
    lessons: Lesson[];
}

export interface LearningPlan {
    goal: string;
    modules: Module[];
}

export type UserRole = 'student' | 'teacher';

export interface User {
    uid: string;
    email: string | null;
    displayName: string | null;
    photoURL: string | null;
    role: UserRole;
    isMainTeacher?: boolean; // Only the main teacher can manage collaborators
}

export interface Student {
    uid: string;
    name: string;
    email: string;
    gradeLevel: string;
    learningPlan: LearningPlan | null;
}

export interface ChatMessage {
    sender: 'user' | 'ai';
    text: string;
}

export type CollaboratorPermission = 'viewer' | 'editor';

export interface Collaborator {
    email: string;
    permission: CollaboratorPermission;
    invitedAt: Date;
    invitedBy: string;
}

export type StudyMaterialType = 'link' | 'form' | 'quiz' | 'document' | 'video' | 'assignment' | 'past_exam';

export interface StudyMaterial {
    id: string;
    title: string;
    description: string;
    type: StudyMaterialType;
    url?: string;
    content?: string;
    dueDate?: Date;
    points?: number;
    isRequired: boolean;
    createdAt: Date;
    createdBy: string;
    tags: string[];
    level?: 'junior' | 'level1' | 'level2' | 'upper' | 'all';
}

export interface MaterialNote {
    id: string;
    materialId: string;
    materialTitle: string;
    content: string;
    userId: string;
    createdAt: Date;
    updatedAt: Date;
}

export type ChallengeType = 'riddle' | 'word_hunt' | 'enigmas' | 'logic_puzzle' | 'word_play' | 'math_challenge' | 'trivia';

export interface Challenge {
    id: string;
    title: string;
    description: string;
    type: ChallengeType;
    question: string;
    answer: string;
    hints: string[];
    difficulty: 'easy' | 'medium' | 'hard';
    points: number;
    timeLimit?: number; // in minutes
    category: string;
    createdAt: Date;
    createdBy: string;
    isActive: boolean;
}

export interface ChallengeSubmission {
    id: string;
    challengeId: string;
    userId: string;
    userAnswer: string;
    isCorrect: boolean;
    pointsEarned: number;
    timeSpent: number; // in seconds
    submittedAt: Date;
    hintsUsed: number;
}

export interface StudentLeaderboardEntry {
    userId: string;
    displayName: string;
    email: string;
    photoURL?: string;
    totalPoints: number;
    totalChallenges: number;
    correctAnswers: number;
    averageTime: number;
    winStreak: number;
    lastActivity: Date;
}

export interface ChallengeLeaderboard {
    challengeId: string;
    challengeTitle: string;
    topSubmissions: Array<{
        userId: string;
        displayName: string;
        email: string;
        photoURL?: string;
        pointsEarned: number;
        timeSpent: number;
        submittedAt: Date;
        hintsUsed: number;
    }>;
}

// Learning Progress Tracking Types
export interface LearningProgress {
    userId: string;
    lastSessionId: string;
    lastSessionDate: Date;
    totalSessions: number;
    totalMessages: number;
    topicsLearned: string[];
    currentTopics: string[];
    learningStreak: number;
    lastActivity: Date;
    sessionHistory: SessionSummary[];
    learningGoals: string[];
    achievements: string[];
}

export interface SessionSummary {
    sessionId: string;
    date: Date;
    duration: number; // in minutes
    topics: string[];
    messagesCount: number;
    keyLearnings: string[];
    nextSteps: string[];
}

export interface LearningMemory {
    userId: string;
    lastMessage: string;
    conversationContext: string;
    currentTopic: string;
    learningLevel: 'beginner' | 'intermediate' | 'advanced';
    interests: string[];
    strengths: string[];
    areasToImprove: string[];
    lastSessionSummary: string;
}
