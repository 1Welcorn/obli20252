
// FIX: Switched to Firebase v8 compat imports to resolve module errors.
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';

// ACTION REQUIRED: Replace with your app's Firebase project configuration.
// In your Vercel project settings, add these as Environment Variables.
// You can find these values in your Firebase project's settings page.
const firebaseConfig = {
  apiKey: "AIzaSyDjIoXRZtbkAMOpCgt-XchEs5I2X0k-oEo",
  authDomain: "obli-fluency-pathfinder.firebaseapp.com",
  projectId: "obli-fluency-pathfinder",
  storageBucket: "obli-fluency-pathfinder.firebasestorage.app",
  messagingSenderId: "361914234340",
  appId: "1:361914234340:web:12a2f9d022d5bf0e4103f1",
  measurementId: "G-NTJ1CXRKKH"
};

// FIX: Used namespaced types from firebase object for v8 compat.
let app: firebase.app.App | null = null;
let auth: firebase.auth.Auth | null = null;
let db: firebase.firestore.Firestore | null = null;
let isFirebaseConfigured = false;

// Initialize Firebase only if the essential configuration is provided.
// This prevents the "invalid-api-key" error when environment variables are not set.
if (firebaseConfig.apiKey && firebaseConfig.projectId) {
  try {
    // FIX: Updated to v8 compat initialization.
    app = firebase.initializeApp(firebaseConfig);
    auth = firebase.auth();
    db = firebase.firestore();
    isFirebaseConfigured = true;
  } catch (error) {
    console.error("Firebase initialization failed:", error);
    // isFirebaseConfigured remains false, the app will show a config error.
  }
} else {
    console.warn("Firebase configuration is missing. The app cannot connect to Firebase services. Please ensure your environment variables (e.g., FIREBASE_API_KEY) are set correctly.");
}

// Export Firebase services and a configuration status flag
export { app, auth, db, isFirebaseConfigured };
