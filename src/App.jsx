import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AuthProvider, useAuth } from './contexts/AuthContext.jsx';
import StudyTracker from './StudyTracker';
import Auth from './Components/Auth.jsx';
import LandingPage from './Components/LandingPage.jsx';
import LoadingScreen from './Components/ui/LoadingScreen.jsx';

function AppContent() {
  const { currentUser, loading } = useAuth();
  const [showAuth, setShowAuth] = useState(false);

  // Initialize native features (StatusBar, Keyboard, SplashScreen) on Android
  useEffect(() => {
    import('./services/nativeBridge.js')
      .then(({ initNative }) => initNative())
      .catch(() => { /* Not in native context — ignore */ });
  }, []);

  // Reset showAuth when user logs in
  useEffect(() => {
    if (currentUser) setShowAuth(false);
  }, [currentUser]);

  if (loading) {
    return <LoadingScreen message="Preparing your workspace…" />;
  }

  return (
    <AnimatePresence mode="wait">
      {currentUser ? (
        <motion.div
          key="app"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4 }}
        >
          <StudyTracker />
        </motion.div>
      ) : showAuth ? (
        <motion.div
          key="auth"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
        >
          <Auth onBack={() => setShowAuth(false)} />
        </motion.div>
      ) : (
        <motion.div
          key="landing"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
        >
          <LandingPage onGetStarted={() => setShowAuth(true)} />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;