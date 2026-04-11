import React, { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import TrackerLogo from "/clock.png?url";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Lock, ArrowRight, Loader2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

const GoogleIcon = (props) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 64 64"
    className="w-5 h-5"
  >
    <g fillRule="evenodd" fill="none">
      <g fillRule="nonzero" transform="translate(3, 2)">
        <path
          fill="#4285F4"
          d="M57.8123233,30.1515267 C57.8123233,27.7263183 57.6155321,25.9565533 57.1896408,24.1212666 L29.4960833,24.1212666 L29.4960833,35.0674653 L45.7515771,35.0674653 C45.4239683,37.7877475 43.6542033,41.8844383 39.7213169,44.6372555 L39.6661883,45.0037254 L48.4223791,51.7870338 L49.0290201,51.8475849 C54.6004021,46.7020943 57.8123233,39.1313952 57.8123233,30.1515267"
        />
        <path
          fill="#34A853"
          d="M29.4960833,58.9921667 C37.4599129,58.9921667 44.1456164,56.3701671 49.0290201,51.8475849 L39.7213169,44.6372555 C37.2305867,46.3742596 33.887622,47.5868638 29.4960833,47.5868638 C21.6960582,47.5868638 15.0758763,42.4415991 12.7159637,35.3297782 L12.3700541,35.3591501 L3.26524241,42.4054492 L3.14617358,42.736447 C7.9965904,52.3717589 17.959737,58.9921667 29.4960833,58.9921667"
        />
        <path
          fill="#FBBC05"
          d="M12.7159637,35.3297782 C12.0932812,33.4944915 11.7329116,31.5279353 11.7329116,29.4960833 C11.7329116,27.4640054 12.0932812,25.4976752 12.6832029,23.6623884 L12.6667095,23.2715173 L3.44779955,16.1120237 L3.14617358,16.2554937 C1.14708246,20.2539019 0,24.7439491 0,29.4960833 C0,34.2482175 1.14708246,38.7380388 3.14617358,42.736447 L12.7159637,35.3297782"
        />
        <path
          fill="#EB4335"
          d="M29.4960833,11.4050769 C35.0347044,11.4050769 38.7707997,13.7975244 40.9011602,15.7968415 L49.2255853,7.66898166 C44.1130815,2.91684746 37.4599129,0 29.4960833,0 C17.959737,0 7.9965904,6.62018183 3.14617358,16.2554937 L12.6832029,23.6623884 C15.0758763,16.5505675 21.6960582,11.4050769 29.4960833,11.4050769"
        />
      </g>
    </g>
  </svg>
);

const InputField = ({ icon: Icon, ...props }) => (
  <div className="relative group">
    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500 group-focus-within:text-indigo-500 transition-colors">
      <Icon className="h-5 w-5" />
    </div>
    <input
      {...props}
      className={cn(
        "w-full bg-zinc-950/50 border border-zinc-800 rounded-xl py-3.5 pl-11 pr-4",
        "text-zinc-100 placeholder:text-zinc-500 text-sm font-medium",
        "focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-zinc-900",
        "transition-all duration-200 ease-out",
      )}
    />
  </div>
);

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const { signup, login, loginWithGoogle } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!email || !password) {
      setError("Please fill out all fields.");
      return;
    }

    setIsLoading(true);
    try {
      if (isLogin) {
        await login(email, password);
      } else {
        await signup(email, password);
      }
    } catch (err) {
      const msg =
        err.message?.replace("Firebase: ", "") || "Authentication failed";
      if (msg.includes("auth/invalid-credential"))
        setError("Invalid email or password.");
      else if (msg.includes("auth/email-already-in-use"))
        setError("Email already in use.");
      else setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogle = async () => {
    setError("");
    setIsLoading(true);
    try {
      await loginWithGoogle();
    } catch (err) {
      let errorMsg =
        err?.message?.replace("Firebase: ", "") || "Google sign-in failed";

      // Handle specific Chrome Identity errors
      if (errorMsg.includes("user did not approve")) {
        errorMsg =
          "Authorization was declined. Please try again and approve access.";
      } else if (errorMsg.includes("Chrome Identity Error")) {
        errorMsg =
          "Chrome authentication failed. Please check extension permissions.";
      } else if (errorMsg.includes("user_cancelled")) {
        errorMsg = "Sign-in was cancelled. Please try again.";
      }

      setError(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-zinc-950 p-4 font-sans selection:bg-indigo-500/30">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-[400px]"
      >
        <div className="bg-zinc-900 border border-zinc-800/80 rounded-2xl p-8 shadow-2xl relative overflow-hidden">
          {/* Header */}
          <div className="flex flex-col items-center text-center mb-8">
            <div className="mb-6 p-3 bg-zinc-800/50 rounded-xl flex items-center justify-center border border-zinc-700/50 shadow-inner">
              <img
                src={TrackerLogo}
                alt="FocusFlow"
                className="h-8 w-8 object-contain"
              />
            </div>
            <motion.h1
              key={isLogin ? "login" : "signup"}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-2xl font-bold text-zinc-100 tracking-tight mb-2"
            >
              {isLogin ? "Welcome back" : "Create an account"}
            </motion.h1>
            <p className="text-zinc-400 text-sm">
              {isLogin
                ? "Enter your credentials to access your account"
                : "Sign up to start tracking your focused time"}
            </p>
          </div>

          {/* Error Message */}
          <AnimatePresence mode="wait">
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                animate={{ opacity: 1, height: "auto", marginBottom: 24 }}
                exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-3 rounded-xl flex items-start gap-3 text-sm overflow-hidden"
              >
                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                <span className="leading-relaxed">{error}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <InputField
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              icon={Mail}
              required
            />
            <InputField
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              icon={Lock}
              required
            />

            <button
              type="submit"
              disabled={isLoading}
              className={cn(
                "w-full bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl py-3.5 px-4 font-medium text-sm",
                "flex items-center justify-center gap-2 transition-all duration-200 active:scale-[0.98]",
                "disabled:opacity-50 disabled:active:scale-100 mt-2 shadow-sm focus:ring-2 focus:ring-indigo-500/50 focus:outline-none",
              )}
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin text-white" />
              ) : (
                <>
                  {isLogin ? "Sign In" : "Sign Up"}
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="my-6 flex items-center gap-4">
            <div className="h-px flex-1 bg-zinc-800" />
            <span className="text-zinc-500 text-xs font-medium uppercase tracking-wider">
              OR
            </span>
            <div className="h-px flex-1 bg-zinc-800" />
          </div>

          {/* Google Button */}
          <button
            type="button"
            onClick={handleGoogle}
            disabled={isLoading}
            className={cn(
              "w-full bg-zinc-950/50 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 rounded-xl py-3 px-4 font-medium text-sm",
              "flex items-center justify-center gap-3 transition-all duration-200 active:scale-[0.98]",
              "disabled:opacity-50 disabled:active:scale-100 focus:ring-2 focus:ring-zinc-700 focus:outline-none",
            )}
          >
            <GoogleIcon />
            Continue with Google
          </button>

          {/* Toggle Login/Signup */}
          <div className="mt-8 text-center text-sm text-zinc-400">
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <button
              type="button"
              onClick={() => {
                setError("");
                setIsLogin(!isLogin);
              }}
              className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors focus:outline-none focus:underline"
            >
              {isLogin ? "Sign Up" : "Sign In"}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Auth;
