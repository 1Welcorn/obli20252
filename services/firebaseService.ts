
// FIX: Switched to Firebase v8 compat imports to resolve module errors.
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';

import { auth, db, isFirebaseConfigured } from './firebaseConfig';
import type { User, UserRole, LearningPlan, Lesson, Student, StudyMaterial, Challenge, ChallengeSubmission, StudentLeaderboardEntry, ChallengeLeaderboard } from '../types';

// FIX: Used firebase.auth for GoogleAuthProvider
const provider = new firebase.auth.GoogleAuthProvider();
// Add additional scopes if needed
provider.addScope('email');
provider.addScope('profile');
const CONFIG_ERROR_MESSAGE = "Firebase is not configured correctly. Please check your environment variables.";

// --- Authentication Service Functions ---

/**
 * Listens for authentication state changes and retrieves user role from Firestore.
 */
export const onAuthStateChanged = (callback: (user: User | null) => void): (() => void) => {
    if (!isFirebaseConfigured || !auth || !db) {
        callback(null);
        return () => {}; // Return a no-op unsubscribe function
    }
    // FIX: Used auth.onAuthStateChanged (v8 compat) and firebase.User type
    return auth.onAuthStateChanged(async (firebaseUser: firebase.User | null) => {
        if (firebaseUser) {
            try {
                // User is signed in, now get their role from Firestore.
                // FIX: Used db.collection().doc() (v8 compat)
                const userDocRef = db.collection('users').doc(firebaseUser.uid);
                // FIX: Used userDocRef.get() (v8 compat)
                const userDocSnap = await userDocRef.get();

                if (userDocSnap.exists) {
                    const userData = userDocSnap.data()!;
                    const user: User = {
                        uid: firebaseUser.uid,
                        email: firebaseUser.email,
                        displayName: firebaseUser.displayName,
                        photoURL: firebaseUser.photoURL,
                        role: userData.role as UserRole,
                        isMainTeacher: userData.isMainTeacher || false,
                    };
                    callback(user);
                } else {
                    console.warn(`User document not found for uid: ${firebaseUser.uid}. Creating default user.`);
                    // Create a default user document instead of logging out
                    const defaultUser: User = {
                        uid: firebaseUser.uid,
                        email: firebaseUser.email,
                        displayName: firebaseUser.displayName,
                        photoURL: firebaseUser.photoURL,
                        role: 'student',
                        isMainTeacher: false,
                    };
                    callback(defaultUser);
                }
            } catch (error) {
                console.error('Error fetching user data:', error);
                // Create a default user on error
                const defaultUser: User = {
                    uid: firebaseUser.uid,
                    email: firebaseUser.email,
                    displayName: firebaseUser.displayName,
                    photoURL: firebaseUser.photoURL,
                    role: 'student',
                    isMainTeacher: false,
                };
                callback(defaultUser);
            }
        } else {
            // User is signed out.
            callback(null);
        }
    });
};

/**
 * Signs in the user with Google and creates a user document in Firestore if it's their first time.
 */
export const signInWithGoogle = async (role: UserRole): Promise<void> => {
    if (!isFirebaseConfigured || !auth || !db) throw new Error(CONFIG_ERROR_MESSAGE);
    try {
        // FIX: Used auth.signInWithPopup (v8 compat)
        const result = await auth.signInWithPopup(provider);
        const user = result.user;
        if (!user) {
            throw new Error("Sign in failed, user object is null.");
        }

        const userDocRef = db.collection('users').doc(user.uid);
        const userDocSnap = await userDocRef.get();

        if (!userDocSnap.exists) {
            // FIX: Used userDocRef.set() and firebase.firestore.FieldValue (v8 compat)
            await userDocRef.set({
                uid: user.uid,
                email: user.email,
                displayName: user.displayName,
                photoURL: user.photoURL,
                role: role,
                isMainTeacher: role === 'teacher', // Only teachers can be main teachers, and first teacher is main
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            });
        } else {
            // User exists, update their role if it's different
            const existingData = userDocSnap.data()!;
            if (existingData.role !== role) {
                await userDocRef.update({
                    role: role,
                    isMainTeacher: role === 'teacher' ? existingData.isMainTeacher || false : false, // Preserve main teacher status for teachers, remove for students
                    lastRoleChange: firebase.firestore.FieldValue.serverTimestamp(),
                });
            }
        }
    } catch (error: any) {
        console.error("Error during Google Sign-In:", error);
        
        // Provide more specific error messages
        if (error.code === 'auth/popup-closed-by-user') {
            throw new Error("Sign-in was cancelled. Please try again.");
        } else if (error.code === 'auth/popup-blocked') {
            throw new Error("Popup was blocked by your browser. Please allow popups for this site and try again.");
        } else if (error.code === 'auth/network-request-failed') {
            throw new Error("Network error. Please check your internet connection and try again.");
        } else if (error.code === 'auth/too-many-requests') {
            throw new Error("Too many failed attempts. Please try again later.");
        } else if (error.message?.includes('permission-denied')) {
            throw new Error("Database permission error. Please contact support.");
        } else {
            throw new Error(error.message || "Sign-in failed. Please try again.");
        }
    }
};

/**
 * Signs out the current user.
 */
export const logout = async (): Promise<void> => {
    if (!isFirebaseConfigured || !auth) throw new Error(CONFIG_ERROR_MESSAGE);
    try {
        // FIX: Used auth.signOut (v8 compat)
        await auth.signOut();
    } catch (error) {
        console.error("Logout Error:", error);
        throw error;
    }
};

// --- Firestore Service Functions ---

/**
 * Retrieves a student's learning plan from their user document in Firestore.
 * @param uid - The user's unique ID.
 * @returns The LearningPlan object or null if not found.
 */
export const getLearningPlan = async (uid: string): Promise<LearningPlan | null> => {
    if (!isFirebaseConfigured || !db) throw new Error(CONFIG_ERROR_MESSAGE);
    const userDocRef = db.collection('users').doc(uid);
    const docSnap = await userDocRef.get();

    if (docSnap.exists && docSnap.data()?.learningPlan) {
        return docSnap.data()?.learningPlan as LearningPlan;
    }
    return null;
};

/**
 * Saves a new learning plan to an existing user's document in Firestore.
 * @param uid - The user's unique ID.
 * @param plan - The generated LearningPlan.
 * @param gradeLevel - The student's grade level.
 */
export const saveLearningPlan = async (uid: string, plan: LearningPlan, gradeLevel: string): Promise<void> => {
    if (!isFirebaseConfigured || !db) throw new Error(CONFIG_ERROR_MESSAGE);
    const userDocRef = db.collection('users').doc(uid);
    // FIX: Used userDocRef.update (v8 compat)
    await userDocRef.update({
        learningPlan: plan,
        gradeLevel: gradeLevel
    });
};

/**
 * Updates a single lesson within a module in Firestore using dot notation for efficiency.
 * @param uid - The user's unique ID.
 * @param moduleTitle - The title of the module containing the lesson.
 * @param updatedLesson - The lesson object with the new data.
 */
export const updateLessonInDb = async (uid: string, moduleTitle: string, updatedLesson: Lesson): Promise<void> => {
    if (!isFirebaseConfigured || !db) throw new Error(CONFIG_ERROR_MESSAGE);
    const userDocRef = db.collection('users').doc(uid);
    const docSnap = await userDocRef.get();

    if (docSnap.exists) {
        const userData = docSnap.data()!;
        const currentPlan = userData.learningPlan as LearningPlan;

        const newModules = currentPlan.modules.map(module => {
            if (module.title === moduleTitle) {
                return {
                    ...module,
                    lessons: module.lessons.map(lesson =>
                        lesson.title === updatedLesson.title ? updatedLesson : lesson
                    )
                };
            }
            return module;
        });

        await userDocRef.update({
            'learningPlan.modules': newModules
        });
    } else {
        throw new Error("Could not update lesson: user document not found.");
    }
};

/**
 * Fetches all student users from Firestore for the teacher dashboard.
 */
export const getStudents = async (): Promise<Student[]> => {
    if (!isFirebaseConfigured || !db) throw new Error(CONFIG_ERROR_MESSAGE);
    const usersCollectionRef = db.collection('users');
    // FIX: Used collection.where().get() (v8 compat)
    const q = usersCollectionRef.where("role", "==", "student");
    const querySnapshot = await q.get();

    const studentList: Student[] = [];
    querySnapshot.forEach((doc) => {
        const data = doc.data();
        studentList.push({
            uid: data.uid,
            name: data.displayName || 'Unnamed Student',
            email: data.email || 'No email',
            gradeLevel: data.gradeLevel || '',
            learningPlan: data.learningPlan || null,
        });
    });
    return studentList;
};

/**
 * Sets a user as the main teacher (only for initial setup or admin purposes)
 * This should only be called by the system administrator or main teacher
 */
export const setMainTeacher = async (userEmail: string): Promise<void> => {
    if (!isFirebaseConfigured || !db) throw new Error(CONFIG_ERROR_MESSAGE);
    
    // First, remove main teacher status from all users
    const usersCollectionRef = db.collection('users');
    const allUsersSnapshot = await usersCollectionRef.where("role", "==", "teacher").get();
    
    const batch = db.batch();
    allUsersSnapshot.forEach((doc) => {
        batch.update(doc.ref, { isMainTeacher: false });
    });
    
    // Then set the specified user as main teacher
    const targetUserSnapshot = await usersCollectionRef.where("email", "==", userEmail).get();
    if (!targetUserSnapshot.empty) {
        const targetUserDoc = targetUserSnapshot.docs[0];
        batch.update(targetUserDoc.ref, { isMainTeacher: true });
    } else {
        throw new Error(`User with email ${userEmail} not found`);
    }
    
    await batch.commit();
};

// Study Materials CRUD Operations
export const addStudyMaterial = async (material: Omit<StudyMaterial, 'id' | 'createdAt'>): Promise<string> => {
    if (!isFirebaseConfigured || !db) {
        console.error('Firebase not configured:', { isFirebaseConfigured, db: !!db });
        throw new Error(CONFIG_ERROR_MESSAGE);
    }
    
    try {
        console.log('Attempting to add study material to Firestore:', material);
        
        // Filter out undefined values to prevent Firestore errors
        const cleanMaterial = Object.fromEntries(
            Object.entries(material).filter(([_, value]) => value !== undefined)
        );
        
        const docRef = await db.collection('studyMaterials').add({
            ...cleanMaterial,
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        });
        
        console.log('Study material added successfully with ID:', docRef.id);
        return docRef.id;
    } catch (error) {
        console.error('Firestore error details:', error);
        throw new Error(`Failed to add study material: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
};

export const updateStudyMaterial = async (id: string, updates: Partial<StudyMaterial>): Promise<void> => {
    if (!isFirebaseConfigured || !db) throw new Error(CONFIG_ERROR_MESSAGE);
    
    // Filter out undefined values to prevent Firestore errors
    const cleanUpdates = Object.fromEntries(
        Object.entries(updates).filter(([_, value]) => value !== undefined)
    );
    
    await db.collection('studyMaterials').doc(id).update(cleanUpdates);
};

export const deleteStudyMaterial = async (id: string): Promise<void> => {
    if (!isFirebaseConfigured || !db) throw new Error(CONFIG_ERROR_MESSAGE);
    
    await db.collection('studyMaterials').doc(id).delete();
};

export const getStudyMaterials = async (): Promise<StudyMaterial[]> => {
    if (!isFirebaseConfigured || !db) throw new Error(CONFIG_ERROR_MESSAGE);
    
    const snapshot = await db.collection('studyMaterials')
        .orderBy('createdAt', 'desc')
        .get();
    
    return snapshot.docs.map(doc => {
        const data = doc.data();
        return {
            id: doc.id,
            ...data,
            createdAt: data.createdAt?.toDate() || new Date(),
            dueDate: data.dueDate?.toDate() || undefined,
        } as StudyMaterial;
    });
};

export const subscribeToStudyMaterials = (callback: (materials: StudyMaterial[]) => void): (() => void) => {
    if (!isFirebaseConfigured || !db) {
        console.error(CONFIG_ERROR_MESSAGE);
        return () => {};
    }
    
    return db.collection('studyMaterials')
        .orderBy('createdAt', 'desc')
        .onSnapshot((snapshot) => {
            const materials = snapshot.docs.map(doc => {
                const data = doc.data();
                return {
                    id: doc.id,
                    ...data,
                    createdAt: data.createdAt?.toDate() || new Date(),
                    dueDate: data.dueDate?.toDate() || undefined,
                } as StudyMaterial;
            });
            callback(materials);
        });
};

// Challenge CRUD Operations
export const addChallenge = async (challenge: Omit<Challenge, 'id' | 'createdAt'>): Promise<string> => {
    if (!isFirebaseConfigured || !db) throw new Error(CONFIG_ERROR_MESSAGE);
    
    const docRef = await db.collection('challenges').add({
        ...challenge,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
    });
    
    return docRef.id;
};

export const updateChallenge = async (id: string, updates: Partial<Challenge>): Promise<void> => {
    if (!isFirebaseConfigured || !db) throw new Error(CONFIG_ERROR_MESSAGE);
    
    await db.collection('challenges').doc(id).update(updates);
};

export const deleteChallenge = async (id: string): Promise<void> => {
    if (!isFirebaseConfigured || !db) throw new Error(CONFIG_ERROR_MESSAGE);
    
    await db.collection('challenges').doc(id).delete();
};

export const getChallenges = async (): Promise<Challenge[]> => {
    if (!isFirebaseConfigured || !db) throw new Error(CONFIG_ERROR_MESSAGE);
    
    const snapshot = await db.collection('challenges')
        .where('isActive', '==', true)
        .orderBy('createdAt', 'desc')
        .get();
    
    return snapshot.docs.map(doc => {
        const data = doc.data();
        return {
            id: doc.id,
            ...data,
            createdAt: data.createdAt?.toDate() || new Date(),
        } as Challenge;
    });
};

export const subscribeToChallenges = (callback: (challenges: Challenge[]) => void): (() => void) => {
    if (!isFirebaseConfigured || !db) {
        console.error(CONFIG_ERROR_MESSAGE);
        return () => {};
    }
    
    return db.collection('challenges')
        .where('isActive', '==', true)
        .orderBy('createdAt', 'desc')
        .onSnapshot((snapshot) => {
            const challenges = snapshot.docs.map(doc => {
                const data = doc.data();
                return {
                    id: doc.id,
                    ...data,
                    createdAt: data.createdAt?.toDate() || new Date(),
                } as Challenge;
            });
            callback(challenges);
        });
};

// Challenge Submission Operations
export const submitChallengeAnswer = async (submission: Omit<ChallengeSubmission, 'id' | 'submittedAt'>): Promise<string> => {
    if (!isFirebaseConfigured || !db) throw new Error(CONFIG_ERROR_MESSAGE);
    
    const docRef = await db.collection('challengeSubmissions').add({
        ...submission,
        submittedAt: firebase.firestore.FieldValue.serverTimestamp(),
    });
    
    return docRef.id;
};

export const getUserChallengeSubmissions = async (userId: string): Promise<ChallengeSubmission[]> => {
    if (!isFirebaseConfigured || !db) throw new Error(CONFIG_ERROR_MESSAGE);
    
    const snapshot = await db.collection('challengeSubmissions')
        .where('userId', '==', userId)
        .orderBy('submittedAt', 'desc')
        .get();
    
    return snapshot.docs.map(doc => {
        const data = doc.data();
        return {
            id: doc.id,
            ...data,
            submittedAt: data.submittedAt?.toDate() || new Date(),
        } as ChallengeSubmission;
    });
};

export const getUserChallengeStats = async (userId: string): Promise<{
    totalChallenges: number;
    correctAnswers: number;
    totalPoints: number;
    averageTime: number;
}> => {
    if (!isFirebaseConfigured || !db) throw new Error(CONFIG_ERROR_MESSAGE);
    
    const submissions = await getUserChallengeSubmissions(userId);
    
    const totalChallenges = submissions.length;
    const correctAnswers = submissions.filter(s => s.isCorrect).length;
    const totalPoints = submissions.reduce((sum, s) => sum + s.pointsEarned, 0);
    const averageTime = totalChallenges > 0 
        ? submissions.reduce((sum, s) => sum + s.timeSpent, 0) / totalChallenges 
        : 0;
    
    return {
        totalChallenges,
        correctAnswers,
        totalPoints,
        averageTime
    };
};

// Leaderboard Operations
// This function returns only students who have actually participated in challenges (enrolled/active students)
export const getStudentLeaderboard = async (limit: number = 10): Promise<StudentLeaderboardEntry[]> => {
    if (!isFirebaseConfigured || !db) throw new Error(CONFIG_ERROR_MESSAGE);
    
    console.log('Getting student leaderboard...');
    
    // Get all students
    const studentsSnapshot = await db.collection('users')
        .where('role', '==', 'student')
        .get();
    
    console.log(`Found ${studentsSnapshot.docs.length} students in database`);
    
    const leaderboard: StudentLeaderboardEntry[] = [];
    
    for (const studentDoc of studentsSnapshot.docs) {
        const studentData = studentDoc.data();
        const userId = studentDoc.id;
        
        // Get student's challenge submissions
        const submissionsSnapshot = await db.collection('challengeSubmissions')
            .where('userId', '==', userId)
            .get();
        
        const submissions = submissionsSnapshot.docs.map(doc => {
            const data = doc.data();
            return {
                ...data,
                submittedAt: data.submittedAt?.toDate() || new Date(),
            } as ChallengeSubmission;
        });
        
        console.log(`Student ${studentData.displayName} has ${submissions.length} challenge submissions`);
        
        // Only include students who have actually participated in challenges (enrolled/active students)
        if (submissions.length > 0) {
            const totalPoints = submissions.reduce((sum, s) => sum + s.pointsEarned, 0);
            const correctAnswers = submissions.filter(s => s.isCorrect).length;
            const averageTime = submissions.reduce((sum, s) => sum + s.timeSpent, 0) / submissions.length;
            const lastActivity = submissions.reduce((latest, s) => 
                s.submittedAt > latest ? s.submittedAt : latest, new Date(0)
            );
            
            // Calculate win streak (consecutive correct answers)
            let winStreak = 0;
            const sortedSubmissions = submissions.sort((a, b) => 
                a.submittedAt.getTime() - b.submittedAt.getTime()
            );
            
            for (let i = sortedSubmissions.length - 1; i >= 0; i--) {
                if (sortedSubmissions[i].isCorrect) {
                    winStreak++;
                } else {
                    break;
                }
            }
            
            leaderboard.push({
                userId,
                displayName: studentData.displayName || 'Student',
                email: studentData.email || '',
                photoURL: studentData.photoURL,
                totalPoints,
                totalChallenges: submissions.length,
                correctAnswers,
                averageTime,
                winStreak,
                lastActivity
            });
        }
    }
    
    // Sort by total points (descending), then by correct answers, then by average time
    const sortedLeaderboard = leaderboard
        .sort((a, b) => {
            if (b.totalPoints !== a.totalPoints) return b.totalPoints - a.totalPoints;
            if (b.correctAnswers !== a.correctAnswers) return b.correctAnswers - a.correctAnswers;
            return a.averageTime - b.averageTime;
        })
        .slice(0, limit);
    
    console.log(`Returning ${sortedLeaderboard.length} students for leaderboard`);
    return sortedLeaderboard;
};

// Alternative function to get leaderboard for students enrolled with a specific teacher
// This could be used if you implement teacher-student relationships in the future
export const getStudentLeaderboardByTeacher = async (teacherId: string, limit: number = 10): Promise<StudentLeaderboardEntry[]> => {
    if (!isFirebaseConfigured || !db) throw new Error(CONFIG_ERROR_MESSAGE);
    
    // For now, this returns the same as getStudentLeaderboard since we don't have teacher-student relationships yet
    // In the future, you could add a field like 'enrolledBy' or 'teacherId' to student documents
    return getStudentLeaderboard(limit);
};

export const getChallengeLeaderboard = async (challengeId: string, limit: number = 10): Promise<ChallengeLeaderboard | null> => {
    if (!isFirebaseConfigured || !db) throw new Error(CONFIG_ERROR_MESSAGE);
    
    // Get challenge details
    const challengeDoc = await db.collection('challenges').doc(challengeId).get();
    if (!challengeDoc.exists) return null;
    
    const challengeData = challengeDoc.data()!;
    
    // Get top submissions for this challenge
    const submissionsSnapshot = await db.collection('challengeSubmissions')
        .where('challengeId', '==', challengeId)
        .where('isCorrect', '==', true)
        .orderBy('pointsEarned', 'desc')
        .orderBy('timeSpent', 'asc')
        .limit(limit)
        .get();
    
    const topSubmissions = [];
    
    for (const submissionDoc of submissionsSnapshot.docs) {
        const submissionData = submissionDoc.data();
        
        // Get user details
        const userDoc = await db.collection('users').doc(submissionData.userId).get();
        const userData = userDoc.exists ? userDoc.data()! : {};
        
        topSubmissions.push({
            userId: submissionData.userId,
            displayName: userData.displayName || 'Student',
            email: userData.email || '',
            photoURL: userData.photoURL,
            pointsEarned: submissionData.pointsEarned,
            timeSpent: submissionData.timeSpent,
            submittedAt: submissionData.submittedAt?.toDate() || new Date(),
            hintsUsed: submissionData.hintsUsed
        });
    }
    
    return {
        challengeId,
        challengeTitle: challengeData.title,
        topSubmissions
    };
};

export const subscribeToStudentLeaderboard = (callback: (leaderboard: StudentLeaderboardEntry[]) => void, limit: number = 10): (() => void) => {
    if (!isFirebaseConfigured || !db) {
        console.error(CONFIG_ERROR_MESSAGE);
        return () => {};
    }
    
    // Subscribe to challenge submissions changes to update leaderboard
    return db.collection('challengeSubmissions')
        .onSnapshot(async () => {
            try {
                const leaderboard = await getStudentLeaderboard(limit);
                callback(leaderboard);
            } catch (error) {
                console.error('Error updating leaderboard:', error);
            }
        });
};
