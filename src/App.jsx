import React from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext.jsx';
import StudyTracker from './StudyTracker'; // Assuming StudyTracker.jsx is in the same src/ folder
import Auth from './components/Auth.jsx'; // Assuming Auth.jsx is in src/components/

// A helper component to access context values
function AppContent() {
  const { currentUser, loading } = useAuth();

  // Show a full-screen loader while Firebase checks the auth state
  if (loading) {
     return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-indigo-900 flex items-center justify-center">
        <div className="text-white text-2xl font-bold">Initializing...</div>
      </div>
    );
  }

  // Once loading is complete, decide which component to show
  return currentUser ? <StudyTracker /> : <Auth />;
}


// The main App component that provides the context
function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
