import React, { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mail,
  Lock,
  ArrowRight,
  ArrowLeft,
  Loader2,
  AlertCircle,
  Clock,
  Sparkles,
} from "lucide-react";
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

/* ───────── Input Field ───────── */
const InputField = ({ icon: Icon, ...props }) => (
  <div className="relative group">
    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[var(--color-slate-500)] group-focus-within:text-[var(--color-emerald-500)] transition-colors duration-300">
      <Icon className="h-5 w-5" />
    </div>
    <input
      {...props}
      className={cn(
        "w-full bg-[var(--color-slate-900)]/50 border border-[var(--color-slate-700)] rounded-xl py-3.5 pl-11 pr-4",
        "text-[var(--color-slate-300)] placeholder:text-[var(--color-slate-500)] text-sm font-medium",
        "focus:outline-none focus:ring-2 focus:ring-[var(--color-emerald-500)]/50 focus:border-[var(--color-emerald-500)] focus:bg-[var(--color-slate-900)]/80",
        "transition-all duration-300 ease-out",
        "hover:border-[var(--color-slate-600)]"
      )}
    />
  </div>
);

/* ═══════════════════════════════════════════════
   AUTH COMPONENT
   ═══════════════════════════════════════════════ */
const Auth = ({ onBack }) => {
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
    <div className="min-h-screen w-full flex items-center justify-center bg-[var(--color-slate-950)] p-4 font-sans selection:bg-[var(--color-emerald-500)]/30 relative overflow-hidden transition-colors duration-500">

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-[420px] relative z-10"
      >
        {/* ─── Back Button (outside card) ─── */}
        {onBack && (
          <motion.button
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            type="button"
            onClick={onBack}
            className="mb-5 flex items-center gap-2 text-[var(--color-slate-500)] hover:text-[var(--color-slate-300)] transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
            <span className="text-sm font-medium">Back to home</span>
          </motion.button>
        )}

        {/* ─── Card ─── */}
        <div className="relative bg-[var(--color-slate-900)]/90 backdrop-blur-xl border border-[var(--color-slate-700)] rounded-3xl p-8 shadow-2xl overflow-hidden transition-colors duration-500">
          
          {/* ─── Header ─── */}
          <div className="flex flex-col items-center text-center mb-8 relative z-10">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.15, ease: "easeOut" }}
              className="mb-5 w-14 h-14 rounded-2xl bg-[var(--color-emerald-500)] flex items-center justify-center shadow-lg shadow-[var(--color-emerald-500)]/20 transition-colors duration-500"
            >
              <Clock className="w-7 h-7 text-btn" strokeWidth={1.8} />
            </motion.div>

            <AnimatePresence mode="wait">
              <motion.div
                key={isLogin ? "login-header" : "signup-header"}
                initial={{ opacity: 0, y: -12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 12 }}
                transition={{ duration: 0.3 }}
              >
                <h1 className="text-2xl font-bold text-[var(--color-white)] tracking-tight mb-1.5 transition-colors duration-500">
                  {isLogin ? "Welcome back" : "Create your account"}
                </h1>
                <p className="text-[var(--color-slate-400)] text-sm transition-colors duration-500">
                  {isLogin
                    ? "Sign in to continue your focus journey"
                    : "Start tracking your study sessions for free"}
                </p>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* ─── Error Message ─── */}
          <AnimatePresence mode="wait">
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                animate={{ opacity: 1, height: "auto", marginBottom: 20 }}
                exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                className="bg-[var(--color-destructive)]/10 border border-[var(--color-destructive)]/30 text-[var(--color-destructive)] p-3.5 rounded-xl flex items-start gap-3 text-sm overflow-hidden"
              >
                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                <span className="leading-relaxed">{error}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ─── Google Button (first for better UX) ─── */}
          <button
            type="button"
            onClick={handleGoogle}
            disabled={isLoading}
            className={cn(
              "w-full bg-[var(--color-slate-950)]/50 hover:bg-[var(--color-slate-800)] border border-[var(--color-slate-700)] text-[var(--color-slate-300)] rounded-xl py-3.5 px-4 font-medium text-sm",
              "flex items-center justify-center gap-3 transition-all duration-300 active:scale-[0.98]",
              "disabled:opacity-50 disabled:active:scale-100",
              "focus:ring-2 focus:ring-[var(--color-emerald-500)]/20 focus:outline-none",
              "hover:border-[var(--color-slate-600)] hover:text-[var(--color-white)]"
            )}
          >
            <GoogleIcon />
            Continue with Google
          </button>

          {/* ─── Divider ─── */}
          <div className="my-6 flex items-center gap-4">
            <div className="h-px flex-1 bg-[var(--color-slate-700)]" />
            <span className="text-[var(--color-slate-500)] text-xs font-medium uppercase tracking-wider">
              or
            </span>
            <div className="h-px flex-1 bg-[var(--color-slate-700)]" />
          </div>

          {/* ─── Form ─── */}
          <form onSubmit={handleSubmit} className="space-y-3.5">
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
                "w-full bg-[var(--color-emerald-500)] hover:bg-[var(--color-emerald-600)] text-btn rounded-xl py-3.5 px-4 font-semibold text-sm",
                "flex items-center justify-center gap-2 transition-all duration-300 active:scale-[0.97]",
                "disabled:opacity-50 disabled:active:scale-100 mt-1",
                "shadow-lg shadow-[var(--color-emerald-500)]/15 hover:shadow-xl hover:shadow-[var(--color-emerald-500)]/25",
                "focus:ring-2 focus:ring-[var(--color-emerald-500)]/40 focus:outline-none"
              )}
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin text-btn" />
              ) : (
                <>
                  {isLogin ? "Sign In" : "Create Account"}
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* ─── Toggle Login/Signup ─── */}
          <div className="mt-7 text-center text-sm text-[var(--color-slate-400)]">
            {isLogin
              ? "Don't have an account? "
              : "Already have an account? "}
            <button
              type="button"
              onClick={() => {
                setError("");
                setIsLogin(!isLogin);
              }}
              className="text-[var(--color-emerald-500)] hover:text-[var(--color-emerald-600)] font-semibold transition-colors focus:outline-none focus:underline"
            >
              {isLogin ? "Sign Up" : "Sign In"}
            </button>
          </div>
        </div>

        {/* ─── Footer note ─── */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-5 text-center text-xs text-[var(--color-slate-500)] flex items-center justify-center gap-1.5 transition-colors duration-500"
        >
          <Sparkles className="w-3 h-3 text-[var(--color-emerald-500)]" />
          A simple space for deep work.
        </motion.p>
      </motion.div>
    </div>
  );
};

export default Auth;
