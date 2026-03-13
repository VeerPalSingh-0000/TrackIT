import React, { useContext, useState, useEffect } from 'react';
import { auth } from '../firebase/config';
import { 
  onAuthStateChanged, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,     
  getRedirectResult,
  signInWithCredential
} from 'firebase/auth';
import { isNative } from '../services/nativeBridge';
import { FirebaseAuthentication } from '@capacitor-firebase/authentication';

const AuthContext = React.createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  
  // Track if the initial Firebase auth check is complete
  const [initialLoadDone, setInitialLoadDone] = useState(false);
  // Track if a manual sign-in or sign-up process is currently running
  const [isProcessing, setIsProcessing] = useState(false);

  // The app is "loading" if we are waiting for initial check OR processing a login
  const loading = !initialLoadDone || isProcessing;

  async function signup(email, password) {
    setIsProcessing(true);
    try {
      return await createUserWithEmailAndPassword(auth, email, password);
    } finally {
      setIsProcessing(false);
    }
  }

  async function login(email, password) {
    setIsProcessing(true);
    try {
      return await signInWithEmailAndPassword(auth, email, password);
    } finally {
      setIsProcessing(false);
    }
  }
  
  async function loginWithGoogle() {
    setIsProcessing(true);
    try {
      if (isNative()) {
        const result = await FirebaseAuthentication.signInWithGoogle();
        const credential = GoogleAuthProvider.credential(result.credential.idToken);
        return await signInWithCredential(auth, credential);
      } else {
        const provider = new GoogleAuthProvider();
        return await signInWithPopup(auth, provider);
      }
    } finally {
      setIsProcessing(false);
    }
  }

  async function logout() {
    setIsProcessing(true);
    try {
      if (isNative()) {
        await FirebaseAuthentication.signOut().catch(() => {});
      }
      return await signOut(auth);
    } finally {
      setIsProcessing(false);
    }
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, user => {
      setCurrentUser(user);
      setInitialLoadDone(true);
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    loading, 
    signup,
    login,
    loginWithGoogle,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {/* Remove the !loading condition so App.jsx can render its own Loader */}
      {children}
    </AuthContext.Provider>
  );
}