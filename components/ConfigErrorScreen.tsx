import React from 'react';

const ConfigErrorScreen: React.FC = () => {
  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-12rem)] animate-fade-in">
      <div className="max-w-3xl p-8 bg-red-50 border-2 border-red-200 rounded-2xl shadow-lg text-center">
        <h1 className="text-4xl font-extrabold text-red-800">Configuration Error</h1>
        <p className="mt-4 text-lg text-red-700">
          The application is not configured to connect to Firebase.
        </p>
        <div className="mt-6 text-left p-6 bg-red-100 rounded-lg border border-red-200">
            <p className="font-semibold text-slate-800 text-lg">To fix this, you need to set up your Firebase project and add your credentials as environment variables in your hosting provider (like Vercel).</p>
            <ol className="list-decimal list-inside mt-4 text-slate-700 space-y-2">
                <li>Go to the <a href="https://console.firebase.google.com/" target="_blank" rel="noopener noreferrer" className="text-indigo-600 font-bold underline hover:text-indigo-800">Firebase Console</a> and create a new project.</li>
                <li>Inside your project, create a new "Web App".</li>
                <li>Firebase will provide a `firebaseConfig` object. Copy the values from it.</li>
                <li>In your Vercel project settings, go to "Environment Variables".</li>
                <li>Add each key from your `firebaseConfig` object as a separate environment variable. For example:
                    <ul className="list-disc list-inside ml-6 mt-2 font-mono bg-slate-50 p-3 rounded-md text-sm">
                        <li><span className="font-semibold">FIREBASE_API_KEY</span> = your-api-key-from-firebase</li>
                        <li><span className="font-semibold">FIREBASE_AUTH_DOMAIN</span> = your-auth-domain-from-firebase</li>
                        <li>...and so on for all keys.</li>
                    </ul>
                </li>
            </ol>
            <p className="mt-4 text-sm text-slate-600 font-medium">
                After adding the variables, you must redeploy your Vercel project for the changes to take effect.
            </p>
        </div>
      </div>
    </div>
  );
};

export default ConfigErrorScreen;
