import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AuthProvider, useAuth } from './contexts/AuthContext.jsx';
import StudyTracker from './StudyTracker';
import Auth from './Components/Auth.jsx';
import TrackerLogo from '../public/clock.png';

function AppContent() {
  const { currentUser, loading } = useAuth();

  // Initialize native features (StatusBar, Keyboard, SplashScreen) on Android
  useEffect(() => {
    import('./services/nativeBridge.js')
      .then(({ initNative }) => initNative())
      .catch(() => { /* Not in native context — ignore */ });
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center gap-8 relative overflow-hidden">
        {/* Subtle glow */}
        <div className="absolute inset-0 pointer-events-none motion-safe-gpu">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-emerald-500/[0.06] blur-[120px]" />
        </div>
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }} 
          animate={{ opacity: 1, scale: 1 }} 
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="relative z-10 flex flex-col items-center gap-6 motion-safe-gpu"
        >
          <div className="relative">
            <div className="absolute inset-0 bg-emerald-400/15 rounded-3xl blur-2xl scale-150" />
            <img src={TrackerLogo} alt="FocusFlow" className="relative w-32 h-32 object-contain drop-shadow-2xl" />
          </div>
          
          <div className="text-center">
            <h1 className="text-2xl font-bold text-[var(--color-white)] tracking-tight">FocusFlow</h1>
            <p className="text-sm text-slate-500 mt-1">Preparing your workspace…</p>
          </div>

          <div className="flex items-center gap-1.5 mt-2">
            {[0, 1, 2].map(i => (
              <motion.div
                key={i}
                className="w-1.5 h-1.5 rounded-full bg-emerald-400"
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
              />
            ))}
          </div>
        </motion.div>
      </div>
    );
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
      ) : (
        <motion.div
          key="auth"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4 }}
        >
          <Auth />
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
