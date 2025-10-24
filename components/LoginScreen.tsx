import React, { useState } from 'react';
import type { UserRole } from '../types';
import { signInWithGoogle } from '../services/firebaseService';
import { DecorativeBlobs } from './DecorativeBlobs';
import { GoogleIcon } from './icons/GoogleIcon';

interface LoginScreenProps {
  isPortugueseHelpVisible: boolean;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ isPortugueseHelpVisible }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (role: UserRole) => {
    setIsLoading(true);
    setError(null);
    try {
      await signInWithGoogle(role);
      // The App.tsx onAuthStateChanged listener will handle navigation.
    } catch (err: any) {
      setError(err.message || "Failed to sign in. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <div className="relative flex flex-col items-center justify-center min-h-full animate-fade-in py-12 overflow-hidden">
      <div className="absolute inset-0 z-0">
        <DecorativeBlobs />
      </div>
      <div className="relative z-10 w-full max-w-md text-center">
        <h1 className="text-5xl font-extrabold text-slate-800">OBLI Pathfinder - Updated!</h1>
        <p className="text-xl text-slate-600 my-4">Your AI-powered guide to English fluency!</p>
        {isPortugueseHelpVisible && <p className="text-md text-slate-500 italic mb-8">Seu guia com inteligência artificial para a fluência em inglês!</p>}
        
        <div className="bg-white/80 backdrop-blur-lg p-8 rounded-2xl shadow-2xl border border-slate-200 mt-8">
            <h2 className="text-2xl font-bold text-slate-800 mb-2">Login or Sign Up</h2>
            {isPortugueseHelpVisible && <p className="text-sm text-slate-500 italic mb-4">Entre ou Cadastre-se</p>}
            
            <div className="mb-6 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                    <span className="font-semibold">Note:</span> You can switch between Student and Teacher roles. Choose the role that matches your current needs.
                </p>
                {isPortugueseHelpVisible && (
                    <p className="text-xs text-blue-700 italic mt-1">
                        Você pode alternar entre os papéis de Estudante e Professor. Escolha o papel que corresponde às suas necessidades atuais.
                    </p>
                )}
            </div>
            
            <div className="space-y-4">
               <button
                    onClick={() => handleLogin('student')}
                    disabled={isLoading}
                    className="w-full flex items-center justify-center gap-3 bg-white text-slate-700 font-bold py-3 px-6 rounded-xl border border-slate-300 hover:bg-slate-100 transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50"
                >
                    <GoogleIcon className="h-6 w-6" />
                    <span>{isLoading ? 'Signing in...' : 'Sign in as a Student'}</span>
                </button>
                 <button
                    onClick={() => handleLogin('teacher')}
                    disabled={isLoading}
                    className="w-full flex items-center justify-center gap-3 bg-white text-slate-700 font-bold py-3 px-6 rounded-xl border border-slate-300 hover:bg-slate-100 transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50"
                >
                    <GoogleIcon className="h-6 w-6" />
                    <span>{isLoading ? 'Signing in...' : 'Sign in as a Teacher'}</span>
                </button>
            </div>
            {error && <p className="text-red-500 text-sm mt-4">{error}</p>}
        </div>
      </div>
    </div>
  );
};

export default LoginScreen;
