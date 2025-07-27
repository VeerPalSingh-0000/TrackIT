import React, { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import StudyTracker from './Components/StudyTracker.jsx';
import Auth from './Components/Auth.jsx';

function AppContent() {
  const [theme, setTheme] = useState('light');
  const { currentUser } = useAuth();

  return (
    <div className={theme === 'dark' ? 'dark' : ''}>
      {currentUser ? (
        <StudyTracker theme={theme} setTheme={setTheme} />
      ) : (
        <Auth theme={theme} setTheme={setTheme} /> 
      )}
    </div>
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
