
"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, signOut, User, createUserWithEmailAndPassword, signInWithEmailAndPassword, GoogleAuthProvider, signInWithRedirect, getRedirectResult, AuthCredential } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { Skeleton } from './ui/skeleton';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (credential: any) => Promise<any>;
  logout: () => Promise<void>;
  signup: (credential: any) => Promise<any>;
  loginWithGoogle: () => Promise<any>;
  getGoogleRedirectResult: () => Promise<any>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const login = async (credential: any) => {
    return signInWithEmailAndPassword(auth, credential.email, credential.password);
  };
  
  const signup = async (credential: any) => {
    return createUserWithEmailAndPassword(auth, credential.email, credential.password);
  }

  const loginWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    return signInWithRedirect(auth, provider);
  }

  const getGoogleRedirectResult = async () => {
    return getRedirectResult(auth);
  }

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Error during sign-out:", error);
    }
  };

  if (loading) {
    return (
        <div className="flex flex-col min-h-screen">
            <header className="flex items-center justify-between p-4 border-b">
                <Skeleton className="h-10 w-40" />
                <Skeleton className="h-10 w-24 rounded-md" />
            </header>
            <main className="flex-grow container mx-auto p-4">
                <div className="flex flex-col items-center gap-4">
                    <Skeleton className="h-32 w-full max-w-2xl" />
                    <Skeleton className="h-64 w-full max-w-2xl" />
                </div>
            </main>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, signup, loginWithGoogle, getGoogleRedirectResult }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
