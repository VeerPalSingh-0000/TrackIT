import React, { useContext, useState, useEffect } from "react";
import { auth } from "../firebase/config";
import {
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithCredential,
  getRedirectResult,
  setPersistence,
  browserLocalPersistence,
} from "firebase/auth";
import { isNative } from "../services/nativeBridge";
import { FirebaseAuthentication } from "@capacitor-firebase/authentication";

const AuthContext = React.createContext();
const GOOGLE_REDIRECT_KEY = "googleRedirectInProgress";
const AUTH_DEBUG = true;

function logAuthDebug(event, details = {}) {
  if (!AUTH_DEBUG) return;
  console.info(`[AuthDebug] ${event}`, {
    at: new Date().toISOString(),
    ...details,
  });
}

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [authStateResolved, setAuthStateResolved] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [redirectResolved, setRedirectResolved] = useState(() => {
    if (isNative()) return true;
    return sessionStorage.getItem(GOOGLE_REDIRECT_KEY) !== "1";
  });

  const loading = !authStateResolved || isProcessing || !redirectResolved;

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
        logAuthDebug("google_signin_native_start");
        const result = await FirebaseAuthentication.signInWithGoogle();
        const credential = GoogleAuthProvider.credential(
          result.credential.idToken,
        );
        await signInWithCredential(auth, credential);
        logAuthDebug("google_signin_native_success", {
          hasIdToken: !!result?.credential?.idToken,
        });
      } else {
        await setPersistence(auth, browserLocalPersistence);
        const provider = new GoogleAuthProvider();
        logAuthDebug("google_signin_popup_start", {
          origin: window.location.origin,
          authDomain: auth.config.authDomain,
        });
        const popupResult = await signInWithPopup(auth, provider);
        sessionStorage.removeItem(GOOGLE_REDIRECT_KEY);
        logAuthDebug("google_signin_popup_success", {
          uid: popupResult?.user?.uid || null,
          providerId: popupResult?.providerId || null,
        });
      }
    } catch (error) {
      const code = error?.code || "unknown";
      console.error("Google Auth Caught Error:", error);
      logAuthDebug("google_signin_error", {
        code,
        message: error?.message,
        customData: error?.customData,
      });
      if (code === "auth/unauthorized-domain") {
        console.error(
          "[AuthDebug] Firebase unauthorized-domain: add this host in Firebase Console > Authentication > Settings > Authorized domains:",
          window.location.hostname,
        );
      }
      sessionStorage.removeItem(GOOGLE_REDIRECT_KEY);
      setIsProcessing(false);
      setRedirectResolved(true);
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
    let isMounted = true;
    logAuthDebug("auth_provider_init", {
      isNativePlatform: isNative(),
      origin: typeof window !== "undefined" ? window.location.origin : "n/a",
      host: typeof window !== "undefined" ? window.location.hostname : "n/a",
      authDomain: auth.config.authDomain,
      pendingRedirectFlag: sessionStorage.getItem(GOOGLE_REDIRECT_KEY),
    });

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!isMounted) return;
      logAuthDebug("auth_state_changed", {
        uid: user?.uid || null,
        email: user?.email || null,
        isAnonymous: user?.isAnonymous ?? null,
        providers: user?.providerData?.map((p) => p?.providerId) || [],
      });
      setCurrentUser(user);
      setAuthStateResolved(true);
      setIsProcessing(false);
    });

    const restoreRedirectFlow = async () => {
      if (isNative()) {
        if (isMounted) {
          setRedirectResolved(true);
        }
        return;
      }

      const hasPendingRedirect =
        sessionStorage.getItem(GOOGLE_REDIRECT_KEY) === "1";
      logAuthDebug("redirect_restore_start", {
        hasPendingRedirect,
      });

      if (!hasPendingRedirect) {
        if (isMounted) {
          setRedirectResolved(true);
        }
        return;
      }

      if (isMounted) {
        setIsProcessing(true);
      }

      try {
        await setPersistence(auth, browserLocalPersistence);
        const redirectResult = await getRedirectResult(auth);
        logAuthDebug("redirect_result", {
          hasResult: !!redirectResult,
          uid: redirectResult?.user?.uid || null,
          providerId: redirectResult?.providerId || null,
          operationType: redirectResult?.operationType || null,
        });
        if (typeof auth.authStateReady === "function") {
          await auth.authStateReady();
          logAuthDebug("auth_state_ready_resolved", {
            uidAfterReady: auth.currentUser?.uid || null,
          });
        }
        if (hasPendingRedirect && !redirectResult && !auth.currentUser) {
          console.error(
            "[AuthDebug] Redirect returned without a user. Common causes: unauthorized Firebase domain, blocked third-party cookies/storage, or OAuth provider misconfiguration.",
          );
        }
      } catch (error) {
        console.error("Error resolving Google redirect result:", error);
        const code = error?.code || "unknown";
        logAuthDebug("redirect_restore_error", {
          code,
          message: error?.message,
          customData: error?.customData,
        });
        if (code === "auth/unauthorized-domain") {
          console.error(
            "[AuthDebug] Unauthorized domain during redirect. Add this host to Firebase Authorized domains:",
            window.location.hostname,
          );
        }
      } finally {
        sessionStorage.removeItem(GOOGLE_REDIRECT_KEY);
        logAuthDebug("redirect_restore_end", {
          uidFinal: auth.currentUser?.uid || null,
        });
        if (isMounted) {
          setRedirectResolved(true);
          setIsProcessing(false);
        }
      }
    };

    restoreRedirectFlow();

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  const value = {
    currentUser,
    loading,
    signup,
    login,
    loginWithGoogle,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
