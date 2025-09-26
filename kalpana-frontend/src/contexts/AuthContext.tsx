// src/contexts/AuthContext.tsx

import React, { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { auth } from '../firebase';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  sendPasswordResetEmail
} from 'firebase/auth';

interface AuthContextType {
  currentUser: any;
  userRole: 'admin' | 'faculty' | 'student' | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  setUserRole: (role: 'admin' | 'faculty' | 'student') => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [userRole, setUserRole] = useState<'admin' | 'faculty' | 'student' | null>(null);
  const [loading, setLoading] = useState(true);

  // Load user role from localStorage on component mount
  useEffect(() => {
    const savedRole = localStorage.getItem('userRole') as 'admin' | 'faculty' | 'student' | null;
    if (savedRole) {
      setUserRole(savedRole);
    }
  }, []);

  // Handle redirect result for Google sign-in
  useEffect(() => {
    const handleRedirectResult = async () => {
      try {
        const result = await getRedirectResult(auth);
        if (result) {
          console.log('Google sign-in redirect successful');
        }
      } catch (error) {
        console.error('Error handling redirect result:', error);
      }
    };

    handleRedirectResult();
  }, []);

  const login = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
  };

  const signup = async (email: string, password: string) => {
    await createUserWithEmailAndPassword(auth, email, password);
  };

  const logout = async () => {
    await signOut(auth);
    setUserRole(null);
    localStorage.removeItem('userRole');
  };

  const loginWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      // Add additional scopes if needed
      provider.addScope('email');
      provider.addScope('profile');
      
      await signInWithPopup(auth, provider);
    } catch (error: any) {
      console.error('Google sign-in error:', error);
      
      // If popup is blocked or COOP error, try redirect method
      if (error.code === 'auth/popup-blocked' || error.code === 'auth/popup-closed-by-user' || error.message?.includes('Cross-Origin-Opener-Policy')) {
        console.log('Popup blocked, trying redirect method...');
        const provider = new GoogleAuthProvider();
        provider.addScope('email');
        provider.addScope('profile');
        
        // Use redirect instead of popup
        await signInWithRedirect(auth, provider);
      } else {
        throw error;
      }
    }
  };

  const resetPassword = async (email: string) => {
    await sendPasswordResetEmail(auth, email);
  };

  useEffect(() => {
    try {
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        setCurrentUser(user);
        
        // If user logs out, clear their role
        if (!user) {
          setUserRole(null);
          localStorage.removeItem('userRole');
        } else {
          // If user logs in, check if they have a saved role
          const savedRole = localStorage.getItem('userRole') as 'admin' | 'faculty' | 'student' | null;
          if (savedRole) {
            setUserRole(savedRole);
          }
        }
        
        setLoading(false);
      });

      // Fallback timeout to prevent infinite loading
      const timeout = setTimeout(() => {
        setLoading(false);
      }, 5000); // 5 second timeout

      return () => {
        unsubscribe();
        clearTimeout(timeout);
      };
    } catch (error) {
      console.error('Firebase auth initialization error:', error);
      setLoading(false);
    }
  }, []);

  // Enhanced setUserRole function that also saves to localStorage
  const setUserRoleWithPersistence = (role: 'admin' | 'faculty' | 'student') => {
    setUserRole(role);
    localStorage.setItem('userRole', role);
  };

  const value: AuthContextType = {
    currentUser,
    userRole,
    login,
    signup,
    logout,
    loginWithGoogle,
    resetPassword,
    setUserRole: setUserRoleWithPersistence,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {loading ? (
        <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-900 to-indigo-950 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-2xl flex items-center justify-center mx-auto mb-4 animate-pulse">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">TimeWise</h2>
            <p className="text-gray-300">Loading your experience...</p>
          </div>
        </div>
      ) : (
        children
      )}
    </AuthContext.Provider>
  );
};
