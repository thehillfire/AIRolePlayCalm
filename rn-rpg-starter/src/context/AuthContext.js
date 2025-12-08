import React, { createContext, useEffect, useState } from 'react';
import { onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signInAnonymously, signOut } from 'firebase/auth';
import { auth } from '../services/firebase';
import { mockAuth } from '../services/mockAuth';

export const AuthContext = createContext({ user: null });

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [useMockAuth, setUseMockAuth] = useState(false); // Use real Firebase Auth

  useEffect(() => {
    setUser(null); // Always start with no user
    setLoading(true);
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u || null);
      setLoading(false);
    });
    return () => unsub && unsub();
  }, []);

  const signInWithEmail = async (email, password) => {
    return await signInWithEmailAndPassword(auth, email, password);
  };

  const signUpWithEmail = async (email, password) => {
    return await createUserWithEmailAndPassword(auth, email, password);
  };

  const signInAnon = async () => {
    return await signInAnonymously(auth);
  };

  const signOutUser = async () => {
  console.log('🔒 signOutUser called: Logging out...');
  await signOut(auth);
  setUser(null); // Force user state to null after logout
  };

  return (
    <AuthContext.Provider value={{ user, loading, signInWithEmail, signUpWithEmail, signInAnonymously: signInAnon, signOut: signOutUser }}>
      {children}
    </AuthContext.Provider>
  );
}
