
"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, signOut, User, createUserWithEmailAndPassword, signInWithEmailAndPassword, GoogleAuthProvider, signInWithRedirect, getRedirectResult, AuthCredential } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { Skeleton } from './ui/skeleton';
import { createUserReputation, getUserReputation } from '@/services/reputation';
import type { UserReputation } from '@/services/reputation';


interface AuthContextType {
  user: User | null;
  loading: boolean;
  reputation: UserReputation | null;
  login: (credential: any) => Promise<any>;
  logout: () => Promise<void>;
  signup: (credential: any) => Promise<any>;
  loginWithGoogle: () => Promise<any>;
  getGoogleRedirectResult: () => Promise<any>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [reputation, setReputation] = useState<UserReputation | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setLoading(true); // Start loading when auth state changes
      if (user) {
        setUser(user);
        // Try to fetch existing reputation data.
        const userRep = await getUserReputation(user.uid);
        if (userRep) {
          setReputation(userRep);
        } else {
          // If no reputation data exists, it's likely a new user.
          // Create their reputation profile.
          try {
            await createUserReputation(user.uid, user.email);
            const newUserRep = await getUserReputation(user.uid);
            setReputation(newUserRep);
          } catch (error) {
              console.error("Failed to create user reputation profile:", error);
              // Set reputation to a default state if creation fails
              setReputation({ uid: user.uid, email: user.email, guardPoints: 0, feedbackCount: 0 });
          }
        }
      } else {
        setUser(null);
        setReputation(null);
      }
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
      // State will be cleared by onAuthStateChanged listener
    } catch (error) {
      console.error("Error during sign-out:", error);
    }
  };

  // Render a skeleton loading UI only on the client-side after mounting,
  // and while auth state is still loading.
  if (!hasMounted || loading) {
    return (
        <div className="flex flex-col min-h-screen">
            <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <div className="container flex h-16 items-center">
                   <div className="mr-4 hidden md:flex">
                        <Skeleton className="h-8 w-32" />
                    </div>
                    <div className="flex flex-1 items-center justify-end space-x-2">
                        <Skeleton className="h-10 w-10 rounded-full" />
                    </div>
                </div>
            </header>
            <main className="flex-grow container mx-auto p-4">
                <div className="flex flex-col items-center gap-8 pt-12">
                    <Skeleton className="h-48 w-full max-w-2xl" />
                    <Skeleton className="h-64 w-full max-w-2xl" />
                </div>
            </main>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, reputation, loading, login, logout, signup, loginWithGoogle, getGoogleRedirectResult }}>
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
