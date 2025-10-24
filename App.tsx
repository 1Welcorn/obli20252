import React, { useState, useEffect, useCallback } from 'react';
import type { User, LearningPlan, Module, Lesson, Student, Collaborator, CollaboratorPermission, StudyMaterial, Challenge, ChallengeSubmission } from './types';
import { onAuthStateChanged, logout, getLearningPlan, saveLearningPlan, updateLessonInDb, getStudents, addStudyMaterial, updateStudyMaterial, deleteStudyMaterial, subscribeToStudyMaterials, addChallenge, submitChallengeAnswer, getUserChallengeStats, getStudentLeaderboard } from './services/firebaseService';
import { generateLearningPlan } from './services/geminiService';
import { isFirebaseConfigured } from './services/firebaseConfig';

// Components
import Header from './components/Header';
import LoginScreen from './components/LoginScreen';
import WelcomeScreen from './components/WelcomeScreen';
import Dashboard from './components/Dashboard';
import LearningModuleView from './components/LearningModuleView';
import TeacherDashboard from './components/TeacherDashboard';
import StudentProgressView from './components/StudentProgressView';
import Loader from './components/Loader';
import VirtualTeacher from './components/VirtualTeacher';
import ChallengeUnlockedModal from './components/ChallengeUnlockedModal';
import NotesView from './components/NotesView';
import ChallengeArena from './components/ChallengeArena';
import DatabaseInspectorModal from './components/DatabaseInspectorModal';
import ConfigErrorScreen from './components/ConfigErrorScreen';
import StudyMaterialsView from './components/StudyMaterialsView';
import StudyMaterialsModal from './components/StudyMaterialsModal';
import OBLIAI from './components/OBLIAI';
import ProgressDashboard from './components/ProgressDashboard';
import TeacherProgressView from './components/TeacherProgressView';

type AppView = 'login' | 'welcome' | 'generating' | 'student_dashboard' | 'module_view' | 'notes_view' | 'challenge_arena' | 'study_materials_view' | 'obli_ai' | 'teacher_dashboard' | 'student_progress_view' | 'progress_dashboard' | 'teacher_progress_view';

const App: React.FC = () => {
    // Core State
    const [user, setUser] = useState<User | null>(null);
    const [view, setView] = useState<AppView>('login');
    const [isLoading, setIsLoading] = useState(true); // For initial auth check
    const [isConfigError] = useState(!isFirebaseConfigured);

    // UI State
    const [isPortugueseHelpVisible, setIsPortugueseHelpVisible] = useState(false);
    const [isDbInspectorOpen, setIsDbInspectorOpen] = useState(false);

    // Student-specific State
    const [learningPlan, setLearningPlan] = useState<LearningPlan | null>(null);
    const [gradeLevel, setGradeLevel] = useState<string>('');
    const [selectedModule, setSelectedModule] = useState<Module | null>(null);
    const [completedModuleTitle, setCompletedModuleTitle] = useState<string | null>(null);

    // Teacher-specific State
    const [students, setStudents] = useState<Student[]>([]);
    const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
    const [collaborators, setCollaborators] = useState<Collaborator[]>([
        {
            email: 'teacher.collaborator@example.com',
            permission: 'viewer',
            invitedAt: new Date(),
            invitedBy: 'system'
        }
    ]);

    // Study Materials State
    const [studyMaterials, setStudyMaterials] = useState<StudyMaterial[]>([]);
    const [isStudyMaterialsModalOpen, setIsStudyMaterialsModalOpen] = useState(false);
    const [challenges, setChallenges] = useState<Challenge[]>([]);
    const [challengeSubmissions, setChallengeSubmissions] = useState<ChallengeSubmission[]>([]);
    const [leaderboard, setLeaderboard] = useState<any[]>([]);

    // Effect for handling authentication and data fetching
    useEffect(() => {
        if (isConfigError) {
            setIsLoading(false);
            return;
        }

        const unsubscribe = onAuthStateChanged(async (currentUser) => {
            setUser(currentUser);
            if (currentUser) {
                setIsLoading(true);
                if (currentUser.role === 'student') {
                    const plan = await getLearningPlan(currentUser.uid);
                    if (plan) {
                        setLearningPlan(plan);
                        // Infer grade level from a student object if needed, or store it alongside the plan
                        // For now, we'll leave it as is, but a real app would store this.
                        setView('student_dashboard');
                    } else {
                        setView('welcome');
                    }
                } else { // Teacher
                    const studentList = await getStudents();
                    setStudents(studentList);
                    setView('teacher_dashboard');
                }
                setIsLoading(false);
            } else {
                setView('login');
                setLearningPlan(null); // Clear data on logout
                setStudents([]); // Clear student list on logout
                setIsLoading(false);
            }
        });
        return () => unsubscribe();
    }, [isConfigError]);

    // Effect for subscribing to study materials
    useEffect(() => {
        if (!user) {
            setStudyMaterials([]);
            return;
        }

        const unsubscribe = subscribeToStudyMaterials((materials) => {
            setStudyMaterials(materials);
        });

        return () => unsubscribe();
    }, [user]);

    const handleStartPlan = async (studentNeeds: string, level: string) => {
        if (!user) return;
        setView('generating');
        setGradeLevel(level);
        try {
            const plan = await generateLearningPlan(studentNeeds, level);
            await saveLearningPlan(user.uid, plan, level);
            setLearningPlan(plan);
            setView('student_dashboard');
        } catch (error) {
            console.error(error);
            alert("There was an error generating your plan. Please try again.");
            setView('welcome');
        }
    };
    
    const handleUpdateLesson = useCallback(async (updatedLesson: Lesson) => {
        if (!learningPlan || !selectedModule || !user) return;

        const oldModuleCompleteStatus = selectedModule.lessons.every(l => l.status === 'completed');

        const newModules = learningPlan.modules.map(m => {
            if (m.title === selectedModule.title) {
                return {
                    ...m,
                    lessons: m.lessons.map(l => l.title === updatedLesson.title ? updatedLesson : l),
                };
            }
            return m;
        });
        
        const newLearningPlan = { ...learningPlan, modules: newModules };
        setLearningPlan(newLearningPlan);

        // Update selected module view
        const updatedModule = newModules.find(m => m.title === selectedModule.title);
        if (updatedModule) {
            setSelectedModule(updatedModule);

            const isNewModuleComplete = updatedModule.lessons.every(l => l.status === 'completed');
            if(isNewModuleComplete && !oldModuleCompleteStatus) {
                setCompletedModuleTitle(updatedModule.title);
            }
        }
        
        // Persist change to Firestore
        await updateLessonInDb(user.uid, selectedModule.title, updatedLesson);

    }, [learningPlan, selectedModule, user]);

    const handleLogout = async () => {
        await logout();
        setView('login');
        setUser(null);
        setLearningPlan(null);
    };

    const handleInviteCollaborator = (email: string, permission: CollaboratorPermission) => {
        const newCollaborator: Collaborator = {
            email,
            permission,
            invitedAt: new Date(),
            invitedBy: user?.email || 'unknown'
        };
        setCollaborators(prev => [...prev, newCollaborator]);
    };

    const handleRemoveCollaborator = (email: string) => {
        setCollaborators(prev => prev.filter(c => c.email !== email));
    };

    const handleUpdateCollaboratorPermission = (email: string, permission: CollaboratorPermission) => {
        setCollaborators(prev => prev.map(c => 
            c.email === email ? { ...c, permission } : c
        ));
    };

    const handleDeleteStudent = (student: Student) => {
        // Remove student from the local state
        setStudents(prev => prev.filter(s => s.uid !== student.uid));
        
        // If the deleted student was selected, clear the selection
        if (selectedStudent && selectedStudent.uid === student.uid) {
            setSelectedStudent(null);
        }
        
        // TODO: In a real app, you would also delete the student from Firebase here
        console.log(`Student ${student.name} deleted from local state. Firebase deletion not implemented yet.`);
    };

    // Study Materials Handlers
    const handleAddStudyMaterial = async (material: Omit<StudyMaterial, 'id' | 'createdAt'>) => {
        try {
            console.log('Adding study material:', material);
            const materialId = await addStudyMaterial(material);
            console.log('Study material added successfully with ID:', materialId);
            alert('Study material saved successfully!');
            // The subscription will automatically update the UI
        } catch (error) {
            console.error('Error adding study material:', error);
            alert(`Error adding study material: ${error instanceof Error ? error.message : 'Unknown error'}`);
            throw error; // Re-throw to let the modal handle it
        }
    };

    const handleUpdateStudyMaterial = async (id: string, updates: Partial<StudyMaterial>) => {
        try {
            await updateStudyMaterial(id, updates);
        } catch (error) {
            console.error('Error updating study material:', error);
            alert('Error updating study material. Please try again.');
        }
    };

    const handleDeleteStudyMaterial = async (id: string) => {
        try {
            await deleteStudyMaterial(id);
        } catch (error) {
            console.error('Error deleting study material:', error);
            alert('Error deleting study material. Please try again.');
        }
    };

    // Challenge handlers
    const handleAddChallenge = async (challenge: Omit<Challenge, 'id' | 'createdAt'>) => {
        try {
            await addChallenge(challenge);
        } catch (error) {
            console.error('Error adding challenge:', error);
            alert('Error adding challenge. Please try again.');
        }
    };

    const handleSubmitChallengeAnswer = async (submission: Omit<ChallengeSubmission, 'id' | 'submittedAt'>) => {
        try {
            await submitChallengeAnswer(submission);
        } catch (error) {
            console.error('Error submitting challenge answer:', error);
            alert('Error submitting answer. Please try again.');
        }
    };

    const loadLeaderboard = async () => {
        try {
            console.log('Loading leaderboard data...');
            const leaderboardData = await getStudentLeaderboard(10);
            console.log('Leaderboard data loaded:', leaderboardData);
            setLeaderboard(leaderboardData);
        } catch (error) {
            console.error('Error loading leaderboard:', error);
        }
    };

    // Load leaderboard when user is authenticated (for both students and teachers)
    useEffect(() => {
        if (user) {
            console.log('User authenticated, loading leaderboard. User role:', user.role);
            loadLeaderboard();
        }
    }, [user]);

    const renderContent = () => {
        if (isConfigError) return <ConfigErrorScreen />;
        if (isLoading) return <Loader message="Initializing..." />;
        
        switch (view) {
            case 'login':
                return <LoginScreen isPortugueseHelpVisible={isPortugueseHelpVisible} />;
            case 'welcome':
                return <WelcomeScreen onStart={handleStartPlan} isPortugueseHelpVisible={isPortugueseHelpVisible} />;
            case 'generating':
                return <Loader message="Crafting your personalized learning plan..." />;
            case 'student_dashboard':
                if (!learningPlan) return <WelcomeScreen onStart={handleStartPlan} isPortugueseHelpVisible={isPortugueseHelpVisible} />;
                return <Dashboard 
                    plan={learningPlan} 
                    onSelectModule={module => { setSelectedModule(module); setView('module_view'); }}
                    onViewNotes={() => setView('notes_view')}
                    onViewChallenges={() => setView('challenge_arena')}
                    onViewStudyMaterials={() => setView('study_materials_view')}
                    isPortugueseHelpVisible={isPortugueseHelpVisible}
                />;
            case 'module_view':
                if (!selectedModule || !learningPlan) return null; // Or show an error
                return <LearningModuleView
                    module={selectedModule}
                    onBack={() => { setSelectedModule(null); setView('student_dashboard'); }}
                    onUpdateLesson={handleUpdateLesson}
                    isPortugueseHelpVisible={isPortugueseHelpVisible}
                    gradeLevel={gradeLevel}
                />;
            case 'notes_view':
                if (!learningPlan) return null;
                 return <NotesView 
                    plan={learningPlan}
                    onBack={() => setView('student_dashboard')}
                    isPortugueseHelpVisible={isPortugueseHelpVisible}
                    currentUser={user}
                 />;
        case 'challenge_arena':
            console.log('Rendering ChallengeArena with user:', user);
            console.log('Passing leaderboard data to ChallengeArena:', leaderboard);
            return <ChallengeArena 
                onBack={() => setView('student_dashboard')}
                isPortugueseHelpVisible={isPortugueseHelpVisible}
                currentUser={user}
                leaderboard={leaderboard}
                onLeaderboardUpdate={loadLeaderboard}
            />;
            case 'study_materials_view':
                return <StudyMaterialsView 
                    studyMaterials={studyMaterials}
                    onBack={() => setView('student_dashboard')}
                    isPortugueseHelpVisible={isPortugueseHelpVisible}
                    currentUser={user}
                />;
            case 'obli_ai':
                return <OBLIAI
                    onBack={() => setView('study_materials_view')}
                    isPortugueseHelpVisible={isPortugueseHelpVisible}
                    currentUser={user}
                />;
            case 'teacher_dashboard':
                return <TeacherDashboard
                    students={students}
                    onSelectStudent={student => { setSelectedStudent(student); setView('student_progress_view'); }}
                    onDeleteStudent={handleDeleteStudent}
                    collaborators={collaborators}
                    onInviteCollaborator={handleInviteCollaborator}
                    onRemoveCollaborator={handleRemoveCollaborator}
                    onUpdateCollaboratorPermission={handleUpdateCollaboratorPermission}
                    onOpenStudyMaterials={() => setIsStudyMaterialsModalOpen(true)}
                    onViewProgress={() => setView('teacher_progress_view')}
                    isPortugueseHelpVisible={isPortugueseHelpVisible}
                    currentUser={user}
                />;
            case 'student_progress_view':
                if (!selectedStudent) return null; // Or error
                return <StudentProgressView
                    student={selectedStudent}
                    onBack={() => { setSelectedStudent(null); setView('teacher_dashboard'); }}
                    isPortugueseHelpVisible={isPortugueseHelpVisible}
                />;
            case 'progress_dashboard':
                return <ProgressDashboard
                    onBack={() => setView('student_dashboard')}
                    currentUser={user}
                />;
            case 'teacher_progress_view':
                return <TeacherProgressView
                    onBack={() => setView('teacher_dashboard')}
                    currentUser={user}
                />;
            default:
                return <div>Something went wrong.</div>;
        }
    };

    return (
        <div className="bg-slate-50 min-h-screen text-slate-800 font-sans">
            <Header
                user={user}
                onLogout={handleLogout}
                isPortugueseHelpVisible={isPortugueseHelpVisible}
                onTogglePortugueseHelp={() => setIsPortugueseHelpVisible(prev => !prev)}
                onOpenDatabaseInspector={() => setIsDbInspectorOpen(true)}
                learningPlan={learningPlan}
            />
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {renderContent()}
            </main>
            {user && !isConfigError && <VirtualTeacher isPortugueseHelpVisible={isPortugueseHelpVisible} />}
            {completedModuleTitle && (
                <ChallengeUnlockedModal
                    isOpen={!!completedModuleTitle}
                    onClose={() => setCompletedModuleTitle(null)}
                    moduleTitle={completedModuleTitle}
                />
            )}
             <DatabaseInspectorModal 
                isOpen={isDbInspectorOpen}
                onClose={() => setIsDbInspectorOpen(false)}
                learningPlan={learningPlan}
                students={students}
                collaborators={collaborators.map(c => c.email)}
            />
            {user && user.role === 'teacher' && (
                <StudyMaterialsModal
                    isOpen={isStudyMaterialsModalOpen}
                    onClose={() => setIsStudyMaterialsModalOpen(false)}
                    studyMaterials={studyMaterials}
                    onAddMaterial={handleAddStudyMaterial}
                    onUpdateMaterial={handleUpdateStudyMaterial}
                    onDeleteMaterial={handleDeleteStudyMaterial}
                    isPortugueseHelpVisible={isPortugueseHelpVisible}
                    currentUserEmail={user.email}
                />
            )}
        </div>
    );
};

export default App;