import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, signInWithPopup, GoogleAuthProvider, User, signOut } from 'firebase/auth';
import { auth } from './firebase';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, 
      (user) => {
        setUser(user);
        setLoading(false);
        setError(null);
      },
      (err) => {
        console.error("Auth state change error:", err);
        setError(err.message);
        setLoading(false);
      }
    );
    return unsubscribe;
  }, []);

  const login = async () => {
    setError(null);
    try {
      const provider = new GoogleAuthProvider();
      // Force account selection to avoid auto-login issues if multiple accounts exist
      provider.setCustomParameters({ prompt: 'select_account' });
      await signInWithPopup(auth, provider);
    } catch (err: any) {
      console.error("Login error:", err);
      // Handle common Firebase Auth errors
      if (err.code === 'auth/popup-blocked') {
        setError('Popup blocked! Please allow popups for this site to sign in.');
      } else if (err.code === 'auth/cancelled-popup-request') {
        setError('Sign-in was cancelled.');
      } else if (err.code === 'auth/popup-closed-by-user') {
        setError('Sign-in window was closed before completion.');
      } else {
        setError(err.message || 'An error occurred during sign-in.');
      }
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (err: any) {
      console.error("Logout error:", err);
      setError(err.message);
    }
  };

  const clearError = () => setError(null);

  return (
    <AuthContext.Provider value={{ user, loading, error, login, logout, clearError }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
