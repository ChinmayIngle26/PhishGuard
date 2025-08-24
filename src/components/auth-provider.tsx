
"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { onAuthStateChanged, signOut, User, createUserWithEmailAndPassword, signInWithEmailAndPassword, GoogleAuthProvider, signInWithRedirect, getRedirectResult } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { createUserReputation } from '@/services/reputation';
import { getUserReputationAction } from '@/app/actions';
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
  initializeNewUser: (user: User) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [reputation, setReputation] = useState<UserReputation | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchReputation = useCallback(async (uid: string) => {
    try {
      const result = await getUserReputationAction(uid);
      if (result.success && result.data) {
        setReputation(result.data);
      } else if (result.error) {
         console.error("Failed to fetch user reputation:", result.error);
         setReputation(null);
      }
    } catch (error) {
      console.error("Exception fetching user reputation:", error);
      setReputation(null);
    }
  }, []);

  const initializeNewUser = useCallback(async (user: User) => {
    try {
        await createUserReputation(user.uid, user.email ?? null);
        await fetchReputation(user.uid);
    } catch (error) {
        console.error("Error during new user initialization:", error);
        throw error;
    }
  }, [fetchReputation]);


  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setLoading(true);
      if (user) {
        setUser(user);
        await fetchReputation(user.uid);
      } else {
        setUser(null);
        setReputation(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [fetchReputation]);

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
  
  const value = { user, reputation, loading, login, logout, signup, loginWithGoogle, getGoogleRedirectResult, initializeNewUser };

  return (
    <AuthContext.Provider value={value}>
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
