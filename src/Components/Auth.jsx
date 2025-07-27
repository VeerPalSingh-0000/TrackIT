import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { FaGoogle, FaEnvelope, FaLock } from 'react-icons/fa';

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const { signup, login, loginWithGoogle } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setAuthLoading(true);
    try {
      if (isLogin) {
        await login(email, password);
      } else {
        await signup(email, password);
      }
    } catch (err) {
      setError(err.message.replace('Firebase: ', ''));
    }
    setAuthLoading(false);
  };
  
  const handleGoogleSignIn = async () => {
    setError('');
    try {
      await loginWithGoogle();
    } catch (err) {
      setError(err.message.replace('Firebase: ', ''));
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-indigo-900 p-4">
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md p-8 space-y-8 bg-slate-800/50 backdrop-blur-sm rounded-2xl shadow-2xl border border-slate-700"
      >
        <div className="text-center">
          <h2 className="text-3xl font-bold text-white">
            {isLogin ? 'Welcome Back' : 'Create Account'}
          </h2>
          <p className="mt-2 text-sm text-slate-400">
            {isLogin ? "Sign in to continue your focus flow." : "Get started on your productivity journey."}
          </p>
        </div>

        {error && (
          <motion.p 
            initial={{scale:0, opacity:0}}
            animate={{scale:1, opacity:1}}
            className="bg-rose-500/20 text-rose-300 text-center p-3 rounded-lg text-sm"
          >
            {error}
          </motion.p>
        )}

        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="relative">
            <FaEnvelope className="absolute top-1/2 left-4 -translate-y-1/2 text-slate-400" />
            <input
              type="email"
              placeholder="Email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-slate-700/50 border border-slate-600 text-white rounded-lg p-3 pl-12 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
            />
          </div>
          <div className="relative">
            <FaLock className="absolute top-1/2 left-4 -translate-y-1/2 text-slate-400" />
            <input
              type="password"
              placeholder="Password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-slate-700/50 border border-slate-600 text-white rounded-lg p-3 pl-12 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
            />
          </div>
          <motion.button
            type="submit"
            disabled={authLoading}
            className="w-full py-3 font-semibold text-white bg-indigo-600 rounded-lg shadow-lg hover:bg-indigo-500 disabled:bg-slate-500 transition-colors"
            whileHover={{ scale: authLoading ? 1 : 1.02 }}
            whileTap={{ scale: authLoading ? 1 : 0.98 }}
          >
            {authLoading ? 'Processing...' : (isLogin ? 'Log In' : 'Sign Up')}
          </motion.button>
        </form>
        
        <div className="flex items-center justify-center space-x-2">
            <div className="flex-grow h-px bg-slate-600"></div>
            <span className="text-slate-400 text-sm">OR</span>
            <div className="flex-grow h-px bg-slate-600"></div>
        </div>

        <motion.button
            onClick={handleGoogleSignIn}
            className="w-full py-3 font-semibold text-white bg-slate-700 rounded-lg shadow-lg hover:bg-slate-600 transition-colors flex items-center justify-center gap-3"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
        >
            <FaGoogle />
            Sign in with Google
        </motion.button>

        <p className="text-sm text-center text-slate-400">
          {isLogin ? "Don't have an account?" : 'Already have an account?'}
          <button onClick={() => setIsLogin(!isLogin)} className="font-semibold text-indigo-400 hover:text-indigo-300 ml-2">
            {isLogin ? 'Sign up' : 'Log in'}
          </button>
        </p>
      </motion.div>
    </div>
  );
};

export default Auth;
