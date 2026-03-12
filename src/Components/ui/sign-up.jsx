import { cn } from "@/lib/utils";
import React, { useState, useRef, useEffect, forwardRef, useImperativeHandle, useMemo, useCallback } from "react";
import { cva } from "class-variance-authority";
import { ArrowRight, Mail, Gem, Lock, Eye, EyeOff, ArrowLeft, X, AlertCircle, Loader } from "lucide-react";
import { AnimatePresence, motion, useInView } from "framer-motion";
import confetti from "canvas-confetti";

const Confetti = forwardRef((props, ref) => {
  const { options, globalOptions = { resize: true, useWorker: true }, manualstart = false, ...rest } = props;
  const instanceRef = useRef(null);
  const canvasRef = useCallback((node) => {
    if (node !== null) {
      if (instanceRef.current) return;
      instanceRef.current = confetti.create(node, { ...globalOptions, resize: true });
    } else {
      if (instanceRef.current) {
        instanceRef.current.reset();
        instanceRef.current = null;
      }
    }
  }, [globalOptions]);
  const fire = useCallback((opts = {}) => instanceRef.current?.({ ...options, ...opts }), [options]);
  const api = useMemo(() => ({ fire }), [fire]);
  useImperativeHandle(ref, () => api, [api]);
  useEffect(() => { if (!manualstart) fire(); }, [manualstart, fire]);
  return <canvas ref={canvasRef} {...rest} />;
});
Confetti.displayName = "Confetti";

function BlurFade({ children, className, variant, duration = 0.4, delay = 0, yOffset = 6, inView = true, inViewMargin = "-50px", blur = "6px" }) {
  const ref = useRef(null);
  const inViewResult = useInView(ref, { once: true, margin: inViewMargin });
  const isInView = !inView || inViewResult;
  const defaultVariants = {
    hidden: { y: yOffset, opacity: 0, filter: `blur(${blur})` },
    visible: { y: -yOffset, opacity: 1, filter: `blur(0px)` },
  };
  const combinedVariants = variant || defaultVariants;
  return (
    <motion.div ref={ref} initial="hidden" animate={isInView ? "visible" : "hidden"} exit="hidden" variants={combinedVariants} transition={{ delay: 0.04 + delay, duration, ease: "easeOut" }} className={className}>
      {children}
    </motion.div>
  );
}

const glassButtonVariants = cva("relative isolate all-unset cursor-pointer rounded-full transition-all", { variants: { size: { default: "text-base font-medium", sm: "text-sm font-medium", lg: "text-lg font-medium", icon: "h-10 w-10" } }, defaultVariants: { size: "default" } });
const glassButtonTextVariants = cva("glass-button-text relative block select-none tracking-tighter", { variants: { size: { default: "px-6 py-3.5", sm: "px-4 py-2", lg: "px-8 py-4", icon: "flex h-10 w-10 items-center justify-center" } }, defaultVariants: { size: "default" } });

const GlassButton = React.forwardRef(
  ({ className, children, size, contentClassName, onClick, ...props }, ref) => {
    const handleWrapperClick = (e) => {
      const button = e.currentTarget.querySelector('button');
      if (button && e.target !== button) button.click();
    };
    return (
      <div className={cn("glass-button-wrap cursor-pointer rounded-full relative", className)} onClick={handleWrapperClick}>
        <button className={cn("glass-button relative z-10", glassButtonVariants({ size }))} ref={ref} onClick={onClick} {...props}>
          <span className={cn(glassButtonTextVariants({ size }), contentClassName)}>{children}</span>
        </button>
        <div className="glass-button-shadow rounded-full pointer-events-none"></div>
      </div>
    );
  }
);
GlassButton.displayName = "GlassButton";

const GradientBackground = () => (
    <>
        <style>
            {` @keyframes float1 { 0% { transform: translate(0, 0); } 50% { transform: translate(-10px, 10px); } 100% { transform: translate(0, 0); } } @keyframes float2 { 0% { transform: translate(0, 0); } 50% { transform: translate(10px, -10px); } 100% { transform: translate(0, 0); } } `}
        </style>
        <svg width="100%" height="100%" viewBox="0 0 800 600" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice" className="absolute top-0 left-0 w-full h-full">
            <defs>
                <linearGradient id="rev_grad1" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style={{stopColor: 'var(--color-emerald-500)', stopOpacity:0.6}} /><stop offset="100%" style={{stopColor: 'var(--color-emerald-400)', stopOpacity:0.4}} /></linearGradient>
                <linearGradient id="rev_grad2" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style={{stopColor: 'var(--color-emerald-600)', stopOpacity:0.7}} /><stop offset="50%" style={{stopColor: 'var(--color-emerald-500)', stopOpacity:0.5}} /><stop offset="100%" style={{stopColor: 'var(--color-emerald-600)', stopOpacity:0.4}} /></linearGradient>
                <radialGradient id="rev_grad3" cx="50%" cy="50%" r="50%"><stop offset="0%" style={{stopColor: 'var(--color-emerald-400)', stopOpacity:0.7}} /><stop offset="100%" style={{stopColor: 'var(--color-emerald-500)', stopOpacity:0.3}} /></radialGradient>
                <filter id="rev_blur1" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="45"/></filter>
                <filter id="rev_blur2" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="35"/></filter>
                <filter id="rev_blur3" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="55"/></filter>
            </defs>
            <g style={{ animation: 'float1 20s ease-in-out infinite' }}>
                <ellipse cx="200" cy="500" rx="250" ry="180" fill="url(#rev_grad1)" filter="url(#rev_blur1)" transform="rotate(-30 200 500)"/>
                <rect x="500" y="100" width="300" height="250" rx="80" fill="url(#rev_grad2)" filter="url(#rev_blur2)" transform="rotate(15 650 225)"/>
            </g>
            <g style={{ animation: 'float2 25s ease-in-out infinite' }}>
                <circle cx="650" cy="450" r="150" fill="url(#rev_grad3)" filter="url(#rev_blur3)" opacity="0.7"/>
                <ellipse cx="50" cy="150" rx="180" ry="120" fill="var(--color-accent)" filter="url(#rev_blur2)" opacity="0.8"/>
            </g>
        </svg>
    </>
);

const GoogleIcon = (props) => ( <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" className="w-6 h-6"> <g fillRule="evenodd" fill="none"> <g fillRule="nonzero" transform="translate(3, 2)"> <path fill="#4285F4" d="M57.8123233,30.1515267 C57.8123233,27.7263183 57.6155321,25.9565533 57.1896408,24.1212666 L29.4960833,24.1212666 L29.4960833,35.0674653 L45.7515771,35.0674653 C45.4239683,37.7877475 43.6542033,41.8844383 39.7213169,44.6372555 L39.6661883,45.0037254 L48.4223791,51.7870338 L49.0290201,51.8475849 C54.6004021,46.7020943 57.8123233,39.1313952 57.8123233,30.1515267"></path> <path fill="#34A853" d="M29.4960833,58.9921667 C37.4599129,58.9921667 44.1456164,56.3701671 49.0290201,51.8475849 L39.7213169,44.6372555 C37.2305867,46.3742596 33.887622,47.5868638 29.4960833,47.5868638 C21.6960582,47.5868638 15.0758763,42.4415991 12.7159637,35.3297782 L12.3700541,35.3591501 L3.26524241,42.4054492 L3.14617358,42.736447 C7.9965904,52.3717589 17.959737,58.9921667 29.4960833,58.9921667"></path> <path fill="#FBBC05" d="M12.7159637,35.3297782 C12.0932812,33.4944915 11.7329116,31.5279353 11.7329116,29.4960833 C11.7329116,27.4640054 12.0932812,25.4976752 12.6832029,23.6623884 L12.6667095,23.2715173 L3.44779955,16.1120237 L3.14617358,16.2554937 C1.14708246,20.2539019 0,24.7439491 0,29.4960833 C0,34.2482175 1.14708246,38.7380388 3.14617358,42.736447 L12.7159637,35.3297782"></path> <path fill="#EB4335" d="M29.4960833,11.4050769 C35.0347044,11.4050769 38.7707997,13.7975244 40.9011602,15.7968415 L49.2255853,7.66898166 C44.1130815,2.91684746 37.4599129,0 29.4960833,0 C17.959737,0 7.9965904,6.62018183 3.14617358,16.2554937 L12.6832029,23.6623884 C15.0758763,16.5505675 21.6960582,11.4050769 29.4960833,11.4050769"></path> </g> </g></svg> );

const DefaultLogo = () => ( <div className="bg-[var(--color-emerald-500)] text-[var(--color-white)] rounded-md p-1.5"> <Gem className="h-4 w-4" /> </div> );

export const AuthComponent = ({ 
  logo = <DefaultLogo />, 
  brandName = "FocusFlow",
  onSignUp,
  onGoogleSignIn,
  onLogin,
  isLoginMode = false,
  onToggleMode,
  externalError = ''
}) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [authStep, setAuthStep] = useState("email");
  const [modalStatus, setModalStatus] = useState('closed');
  const [modalErrorMessage, setModalErrorMessage] = useState('');
  const confettiRef = useRef(null);

  const isEmailValid = /\S+@\S+\.\S+/.test(email);
  const isPasswordValid = password.length >= 6;
  const isConfirmPasswordValid = confirmPassword.length >= 6;
  
  const passwordInputRef = useRef(null);
  const confirmPasswordInputRef = useRef(null);
  
  useEffect(() => {
    if (externalError) {
      setModalErrorMessage(externalError);
      setModalStatus('error');
    }
  }, [externalError]);

  const handleFinalSubmit = async (e) => {
    e.preventDefault();
    if (modalStatus !== 'closed') return;

    if (isLoginMode) {
      if (!isEmailValid || !isPasswordValid) return;
      setModalStatus('loading');
      try {
        await onLogin?.(email, password);
        // Login success hote hi instantly Modal hata do taaki main page overlap na kare
        setModalStatus('closed');
      } catch (err) {
        setModalErrorMessage(err.message?.replace('Firebase: ', '') || 'Login failed');
        setModalStatus('error');
      }
      return;
    }

    if (authStep !== 'confirmPassword') return;
    if (password !== confirmPassword) {
        setModalErrorMessage("Passwords do not match!");
        setModalStatus('error');
    } else {
        setModalStatus('loading');
        try {
          await onSignUp?.(email, password);
          // Sign up success hote hi instantly Modal hata do
          setModalStatus('closed');
        } catch (err) {
          setModalErrorMessage(err.message?.replace('Firebase: ', '') || 'Sign up failed');
          setModalStatus('error');
        }
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      // YAHAN SE 'loading' MODAL UDA DIYA HAI!
      // Google ki apni native loading/popup screen aayegi, aur 
      // uske turant baad sidha Main Page khulega.
      await onGoogleSignIn?.();
    } catch (err) {
      setModalErrorMessage(err.message?.replace('Firebase: ', '') || 'Google sign-in failed');
      setModalStatus('error');
    }
  };

  const handleProgressStep = () => {
    if (isLoginMode) {
      if (authStep === 'email' && isEmailValid) {
        setAuthStep("password");
      } else if (authStep === 'password' && isPasswordValid) {
        handleFinalSubmit(new Event('submit'));
      }
      return;
    }
    if (authStep === 'email') {
        if (isEmailValid) setAuthStep("password");
    } else if (authStep === 'password') {
        if (isPasswordValid) setAuthStep("confirmPassword");
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
        e.preventDefault();
        if (isLoginMode && authStep === 'password' && isPasswordValid) {
          handleFinalSubmit(e);
        } else {
          handleProgressStep();
        }
    }
  };

  const handleGoBack = () => {
    if (authStep === 'confirmPassword') {
        setAuthStep('password');
        setConfirmPassword('');
    }
    else if (authStep === 'password') setAuthStep('email');
  };

  const closeModal = () => {
    setModalStatus('closed');
    setModalErrorMessage('');
  };

  useEffect(() => {
    if (authStep === 'password') setTimeout(() => passwordInputRef.current?.focus(), 500);
    else if (authStep === 'confirmPassword') setTimeout(() => confirmPasswordInputRef.current?.focus(), 500);
  }, [authStep]);

  useEffect(() => {
    setAuthStep('email');
    setPassword('');
    setConfirmPassword('');
    setShowPassword(false);
    setShowConfirmPassword(false);
    setModalStatus('closed');
    setModalErrorMessage('');
  }, [isLoginMode]);
  
  const Modal = () => (
    <AnimatePresence>
        {modalStatus !== 'closed' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md">
                <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="relative bg-[var(--color-slate-900)] border-4 border-[var(--color-slate-700)] rounded-3xl p-8 w-full max-w-sm flex flex-col items-center gap-4 mx-2 shadow-2xl">
                    {modalStatus === 'error' && <button onClick={closeModal} className="absolute top-4 right-4 p-1 text-[var(--color-slate-400)] hover:text-[var(--color-white)] transition-colors"><X className="w-5 h-5" /></button>}
                    {modalStatus === 'error' && <>
                        <AlertCircle className="w-12 h-12 text-rose-500" />
                        <p className="text-lg font-medium text-[var(--color-white)] text-center">{modalErrorMessage}</p>
                        <GlassButton onClick={closeModal} size="sm" className="mt-4">Try Again</GlassButton>
                    </>}
                    {modalStatus === 'loading' && 
                        <div className="flex flex-col items-center gap-4">
                            <Loader className="w-12 h-12 text-[var(--color-emerald-500)] animate-spin" />
                            <p className="text-lg font-medium text-[var(--color-white)] text-center">
                                {isLoginMode ? "Signing in..." : "Setting up your workspace..."}
                            </p>
                        </div>
                    }
                </motion.div>
            </motion.div>
        )}
    </AnimatePresence>
  );

  const titleText = isLoginMode 
    ? (authStep === 'email' ? 'Welcome back' : 'Enter your password')
    : (authStep === 'email' ? 'Get started' : authStep === 'password' ? 'Create password' : 'One Last Step');

  const subtitleText = isLoginMode
    ? (authStep === 'email' ? 'Sign in to continue your focus flow' : 'Welcome back, ' + email)
    : (authStep === 'password' ? 'Must be at least 6 characters.' : authStep === 'confirmPassword' ? 'Almost there' : 'Continue with');

  const premiumDarkStyles = {
    '--color-slate-950': '#000000',
    '--color-slate-900': '#09090b',
    '--color-slate-800': '#18181b',
    '--color-slate-700': '#27272a',
    '--color-slate-400': '#a1a1aa',
    '--color-slate-300': '#f4f4f5',
    '--color-emerald-500': '#10b981',
    '--color-emerald-600': '#059669',
    '--color-emerald-400': '#34d399',
    '--color-white': '#ffffff',
    '--color-btn-text': '#ffffff',
    '--color-accent': 'rgba(16, 185, 129, 0.2)',
    '--foreground': '#ffffff',
    '--muted-foreground': '#a1a1aa',
  };

  return (
    <div className="min-h-screen w-screen flex flex-col" style={{ ...premiumDarkStyles, background: 'var(--color-slate-950)' }}>
        <style>{`
            input[type="password"]::-ms-reveal, input[type="password"]::-ms-clear { display: none !important; } input[type="password"]::-webkit-credentials-auto-fill-button, input[type="password"]::-webkit-strong-password-auto-fill-button { display: none !important; } input:-webkit-autofill, input:-webkit-autofill:hover, input:-webkit-autofill:focus, input:-webkit-autofill:active { -webkit-box-shadow: 0 0 0 30px transparent inset !important; -webkit-text-fill-color: var(--foreground) !important; background-color: transparent !important; background-clip: content-box !important; transition: background-color 5000s ease-in-out 0s !important; color: var(--foreground) !important; caret-color: var(--foreground) !important; } input:autofill { background-color: transparent !important; background-clip: content-box !important; -webkit-text-fill-color: var(--foreground) !important; color: var(--foreground) !important; } input:-internal-autofill-selected { background-color: transparent !important; background-image: none !important; color: var(--foreground) !important; -webkit-text-fill-color: var(--foreground) !important; } input:-webkit-autofill::first-line { color: var(--foreground) !important; -webkit-text-fill-color: var(--foreground) !important; }
            @property --angle-1 { syntax: "<angle>"; inherits: false; initial-value: -75deg; } @property --angle-2 { syntax: "<angle>"; inherits: false; initial-value: -45deg; }
            .glass-button-wrap { --anim-time: 400ms; --anim-ease: cubic-bezier(0.25, 1, 0.5, 1); --border-width: clamp(1px, 0.0625em, 4px); position: relative; z-index: 2; transform-style: preserve-3d; transition: transform var(--anim-time) var(--anim-ease); } .glass-button-wrap:has(.glass-button:active) { transform: rotateX(25deg); } .glass-button-shadow { --shadow-cutoff-fix: 2em; position: absolute; width: calc(100% + var(--shadow-cutoff-fix)); height: calc(100% + var(--shadow-cutoff-fix)); top: calc(0% - var(--shadow-cutoff-fix) / 2); left: calc(0% - var(--shadow-cutoff-fix) / 2); filter: blur(clamp(2px, 0.125em, 12px)); transition: filter var(--anim-time) var(--anim-ease); pointer-events: none; z-index: 0; } .glass-button-shadow::after { content: ""; position: absolute; inset: 0; border-radius: 9999px; background: linear-gradient(180deg, var(--color-slate-700), var(--color-slate-800)); width: calc(100% - var(--shadow-cutoff-fix) - 0.25em); height: calc(100% - var(--shadow-cutoff-fix) - 0.25em); top: calc(var(--shadow-cutoff-fix) - 0.5em); left: calc(var(--shadow-cutoff-fix) - 0.875em); padding: 0.125em; box-sizing: border-box; mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0); mask-composite: exclude; transition: all var(--anim-time) var(--anim-ease); opacity: 1; }
            .glass-button { -webkit-tap-highlight-color: transparent; backdrop-filter: blur(clamp(1px, 0.125em, 4px)); transition: all var(--anim-time) var(--anim-ease); background: linear-gradient(-75deg, var(--color-slate-900), var(--color-slate-800), var(--color-slate-900)); box-shadow: inset 0 0.125em 0.125em var(--color-slate-700), inset 0 -0.125em 0.125em var(--color-slate-900), 0 0.25em 0.125em -0.125em var(--color-slate-700), 0 0 0.1em 0.25em inset var(--color-slate-800), 0 0 0 0 transparent; } .glass-button:hover { transform: scale(0.975); backdrop-filter: blur(0.01em); box-shadow: inset 0 0.125em 0.125em var(--color-slate-700), inset 0 -0.125em 0.125em var(--color-slate-900), 0 0.15em 0.05em -0.1em var(--color-slate-600), 0 0 0.05em 0.1em inset var(--color-slate-900), 0 0 0 0 transparent; } .glass-button-text { color: var(--color-white); text-shadow: 0em 0.05em 0.05em var(--color-slate-950); transition: all var(--anim-time) var(--anim-ease); } .glass-button:hover .glass-button-text { text-shadow: 0.025em 0.025em 0.025em var(--color-slate-900); } .glass-button-text::after { content: ""; display: block; position: absolute; width: calc(100% - var(--border-width)); height: calc(100% - var(--border-width)); top: calc(0% + var(--border-width) / 2); left: calc(0% + var(--border-width) / 2); box-sizing: border-box; border-radius: 9999px; overflow: clip; background: linear-gradient(var(--angle-2), transparent 0%, var(--color-slate-900) 40% 50%, transparent 55%); z-index: 3; mix-blend-mode: screen; pointer-events: none; background-size: 200% 200%; background-position: 0% 50%; transition: background-position calc(var(--anim-time) * 1.25) var(--anim-ease), --angle-2 calc(var(--anim-time) * 1.25) var(--anim-ease); } .glass-button:hover .glass-button-text::after { background-position: 25% 50%; } .glass-button:active .glass-button-text::after { background-position: 50% 15%; --angle-2: -15deg; } .glass-button::after { content: ""; position: absolute; z-index: 1; inset: 0; border-radius: 9999px; width: calc(100% + var(--border-width)); height: calc(100% + var(--border-width)); top: calc(0% - var(--border-width) / 2); left: calc(0% - var(--border-width) / 2); padding: var(--border-width); box-sizing: border-box; background: conic-gradient(from var(--angle-1) at 50% 50%, var(--color-slate-700) 0%, transparent 5% 40%, var(--color-slate-700) 50%, transparent 60% 95%, var(--color-slate-700) 100%), linear-gradient(180deg, var(--color-slate-900), var(--color-slate-900)); mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0); mask-composite: exclude; transition: all var(--anim-time) var(--anim-ease), --angle-1 500ms ease; box-shadow: inset 0 0 0 calc(var(--border-width) / 2) var(--color-slate-900); pointer-events: none; } .glass-button:hover::after { --angle-1: -125deg; } .glass-button:active::after { --angle-1: -75deg; } .glass-button-wrap:has(.glass-button:hover) .glass-button-shadow { filter: blur(clamp(2px, 0.0625em, 6px)); } .glass-button-wrap:has(.glass-button:hover) .glass-button-shadow::after { top: calc(var(--shadow-cutoff-fix) - 0.875em); opacity: 1; } .glass-button-wrap:has(.glass-button:active) .glass-button-shadow { filter: blur(clamp(2px, 0.125em, 12px)); } .glass-button-wrap:has(.glass-button:active) .glass-button-shadow::after { top: calc(var(--shadow-cutoff-fix) - 0.5em); opacity: 0.75; } .glass-button-wrap:has(.glass-button:active) .glass-button-text { text-shadow: 0.025em 0.25em 0.05em var(--color-slate-900); } .glass-button-wrap:has(.glass-button:active) .glass-button { box-shadow: inset 0 0.125em 0.125em var(--color-slate-700), inset 0 -0.125em 0.125em var(--color-slate-900), 0 0.125em 0.125em -0.125em var(--color-slate-700), 0 0 0.1em 0.25em inset var(--color-slate-800), 0 0.225em 0.05em 0 var(--color-slate-800), 0 0.25em 0 0 var(--color-slate-900), inset 0 0.25em 0.05em 0 var(--color-slate-700); } @media (hover: none) and (pointer: coarse) { .glass-button::after, .glass-button:hover::after, .glass-button:active::after { --angle-1: -75deg; } .glass-button .glass-button-text::after, .glass-button:active .glass-button-text::after { --angle-2: -45deg; } }
            .glass-input-wrap { position: relative; z-index: 2; transform-style: preserve-3d; border-radius: 9999px; } .glass-input { display: flex; position: relative; width: 100%; align-items: center; gap: 0.5rem; border-radius: 9999px; padding: 0.25rem; -webkit-tap-highlight-color: transparent; backdrop-filter: blur(clamp(1px, 0.125em, 4px)); transition: all 400ms cubic-bezier(0.25, 1, 0.5, 1); background: linear-gradient(-75deg, var(--color-slate-900), var(--color-slate-800), var(--color-slate-900)); box-shadow: inset 0 0.125em 0.125em var(--color-slate-700), inset 0 -0.125em 0.125em var(--color-slate-900), 0 0.25em 0.125em -0.125em var(--color-slate-700), 0 0 0.1em 0.25em inset var(--color-slate-800), 0 0 0 0 transparent; } .glass-input-wrap:focus-within .glass-input { backdrop-filter: blur(0.01em); box-shadow: inset 0 0.125em 0.125em var(--color-slate-700), inset 0 -0.125em 0.125em var(--color-slate-900), 0 0.15em 0.05em -0.1em var(--color-slate-600), 0 0 0.05em 0.1em inset var(--color-slate-900), 0 0 0 0 transparent; } .glass-input::after { content: ""; position: absolute; z-index: 1; inset: 0; border-radius: 9999px; width: calc(100% + clamp(1px, 0.0625em, 4px)); height: calc(100% + clamp(1px, 0.0625em, 4px)); top: calc(0% - clamp(1px, 0.0625em, 4px) / 2); left: calc(0% - clamp(1px, 0.0625em, 4px) / 2); padding: clamp(1px, 0.0625em, 4px); box-sizing: border-box; background: conic-gradient(from var(--angle-1) at 50% 50%, var(--color-slate-700) 0%, transparent 5% 40%, var(--color-slate-700) 50%, transparent 60% 95%, var(--color-slate-700) 100%), linear-gradient(180deg, var(--color-slate-900), var(--color-slate-900)); mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0); mask-composite: exclude; transition: all 400ms cubic-bezier(0.25, 1, 0.5, 1), --angle-1 500ms ease; box-shadow: inset 0 0 0 calc(clamp(1px, 0.0625em, 4px) / 2) var(--color-slate-900); pointer-events: none; } .glass-input-wrap:focus-within .glass-input::after { --angle-1: -125deg; } .glass-input-text-area { position: absolute; inset: 0; border-radius: 9999px; pointer-events: none; } .glass-input-text-area::after { content: ""; display: block; position: absolute; width: calc(100% - clamp(1px, 0.0625em, 4px)); height: calc(100% - clamp(1px, 0.0625em, 4px)); top: calc(0% + clamp(1px, 0.0625em, 4px) / 2); left: calc(0% + clamp(1px, 0.0625em, 4px) / 2); box-sizing: border-box; border-radius: 9999px; overflow: clip; background: linear-gradient(var(--angle-2), transparent 0%, var(--color-slate-900) 40% 50%, transparent 55%); z-index: 3; mix-blend-mode: screen; pointer-events: none; background-size: 200% 200%; background-position: 0% 50%; transition: background-position calc(400ms * 1.25) cubic-bezier(0.25, 1, 0.5, 1), --angle-2 calc(400ms * 1.25) cubic-bezier(0.25, 1, 0.5, 1); } .glass-input-wrap:focus-within .glass-input-text-area::after { background-position: 25% 50%; }
        `}</style>

        <Confetti ref={confettiRef} manualstart className="fixed top-0 left-0 w-full h-full pointer-events-none z-[999]" />
        <Modal />

        <div className={cn( "fixed top-4 left-4 z-20 flex items-center gap-2", "md:left-1/2 md:-translate-x-1/2" )}>
            {logo}
            <h1 className="text-base font-bold text-[var(--color-white)]">{brandName}</h1>
        </div>

        <div className={cn("flex w-full flex-1 h-full items-center justify-center", "relative overflow-hidden")} style={{ background: 'var(--color-slate-950)' }}>
            <div className="absolute inset-0 z-0"><GradientBackground /></div>
            <fieldset disabled={modalStatus !== 'closed'} className="relative z-10 flex flex-col items-center gap-8 w-[280px] mx-auto p-4">
                <AnimatePresence mode="wait">
                    {authStep === "email" && <motion.div key="email-content" initial={{ y: 6, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3, ease: "easeOut" }} className="w-full flex flex-col items-center gap-4">
                        <BlurFade delay={0.25 * 1} className="w-full"><div className="text-center"><p className="font-serif font-light text-4xl sm:text-5xl md:text-6xl tracking-tight whitespace-nowrap text-[var(--color-white)]">{titleText}</p></div></BlurFade>
                        <BlurFade delay={0.25 * 2}><p className="text-sm font-bold opacity-80 text-[var(--color-slate-400)]">{subtitleText}</p></BlurFade>
                        <BlurFade delay={0.25 * 3}><div className="flex items-center justify-center gap-4 w-full">
                            <GlassButton onClick={handleGoogleSignIn} contentClassName="flex items-center justify-center gap-2" size="sm"><GoogleIcon /><span className="font-bold text-[var(--color-white)]">Google</span></GlassButton>
                        </div></BlurFade>
                        <BlurFade delay={0.25 * 4} className="w-[300px]"><div className="flex items-center w-full gap-2 py-2"><hr className="w-full border-[var(--color-slate-700)]"/><span className="text-xs font-bold opacity-60 text-[var(--color-slate-400)]">OR</span><hr className="w-full border-[var(--color-slate-700)]"/></div></BlurFade>
                    </motion.div>}
                    {authStep === "password" && !isLoginMode && <motion.div key="password-title" initial={{ y: 6, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3, ease: "easeOut" }} className="w-full flex flex-col items-center text-center gap-4">
                        <BlurFade delay={0} className="w-full"><div className="text-center"><p className="font-serif font-light text-4xl sm:text-5xl tracking-tight whitespace-nowrap text-[var(--color-white)]">{titleText}</p></div></BlurFade>
                        <BlurFade delay={0.25 * 1}><p className="text-sm font-medium text-[var(--color-slate-400)]">{subtitleText}</p></BlurFade>
                    </motion.div>}
                    {authStep === "password" && isLoginMode && <motion.div key="login-password-title" initial={{ y: 6, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3, ease: "easeOut" }} className="w-full flex flex-col items-center text-center gap-4">
                        <BlurFade delay={0} className="w-full"><div className="text-center"><p className="font-serif font-light text-4xl sm:text-5xl tracking-tight whitespace-nowrap text-[var(--color-white)]">{titleText}</p></div></BlurFade>
                        <BlurFade delay={0.25 * 1}><p className="text-sm font-medium text-[var(--color-slate-400)]">{subtitleText}</p></BlurFade>
                    </motion.div>}
                    {authStep === "confirmPassword" && <motion.div key="confirm-title" initial={{ y: 6, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3, ease: "easeOut" }} className="w-full flex flex-col items-center text-center gap-4">
                         <BlurFade delay={0} className="w-full"><div className="text-center"><p className="font-serif font-light text-4xl sm:text-5xl tracking-tight whitespace-nowrap text-[var(--color-white)]">{titleText}</p></div></BlurFade>
                         <BlurFade delay={0.25 * 1}><p className="text-sm font-medium text-[var(--color-slate-400)]">{subtitleText}</p></BlurFade>
                    </motion.div>}
                </AnimatePresence>
                
                <form onSubmit={handleFinalSubmit} className="w-[300px] space-y-6">
                     <AnimatePresence>
                        {authStep !== 'confirmPassword' && <motion.div key="email-password-fields" exit={{ opacity: 0, filter: 'blur(4px)' }} transition={{ duration: 0.3, ease: "easeOut" }} className="w-full space-y-6">
                            <BlurFade delay={authStep === 'email' ? 0.25 * 5 : 0} inView={true} className="w-full">
                                <div className="relative w-full">
                                    <AnimatePresence>
                                        {authStep === "password" && <motion.div initial={{ y: -10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.3, delay: 0.4 }} className="absolute -top-6 left-4 z-10"><label className="text-xs font-semibold text-[var(--color-slate-400)]">Email</label></motion.div>}
                                    </AnimatePresence>
                                    <div className="glass-input-wrap w-full"><div className="glass-input">
                                        <span className="glass-input-text-area"></span>
                                        <div className={cn( "relative z-10 flex-shrink-0 flex items-center justify-center overflow-hidden transition-all duration-300 ease-in-out text-[var(--color-slate-300)]", email.length > 20 && authStep === 'email' ? "w-0 px-0" : "w-10 pl-2" )}><Mail className="h-5 w-5 flex-shrink-0" /></div>
                                        <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} onKeyDown={handleKeyDown} className={cn("relative z-10 h-full w-0 flex-grow bg-transparent focus:outline-none transition-[padding-right] duration-300 ease-in-out delay-300 text-[var(--color-white)]", isEmailValid && authStep === 'email' ? "pr-2" : "pr-0")} />
                                        <div className={cn( "relative z-10 flex-shrink-0 overflow-hidden transition-all duration-300 ease-in-out", isEmailValid && authStep === 'email' ? "w-10 pr-1" : "w-0" )}><GlassButton type="button" onClick={handleProgressStep} size="icon" aria-label="Continue with email"><ArrowRight className="w-5 h-5" /></GlassButton></div>
                                    </div></div>
                                </div>
                            </BlurFade>
                            <AnimatePresence>
                                {authStep === "password" && <BlurFade key="password-field" className="w-full">
                                    <div className="relative w-full">
                                        <AnimatePresence>
                                            {password.length > 0 && <motion.div initial={{ y: -10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.3 }} className="absolute -top-6 left-4 z-10"><label className="text-xs font-semibold text-[var(--color-slate-400)]">Password</label></motion.div>}
                                        </AnimatePresence>
                                        <div className="glass-input-wrap w-full"><div className="glass-input">
                                            <span className="glass-input-text-area"></span>
                                            <div className="relative z-10 flex-shrink-0 flex items-center justify-center w-10 pl-2 text-[var(--color-slate-300)]">
                                                {isPasswordValid ? <button type="button" aria-label="Toggle password visibility" onClick={() => setShowPassword(!showPassword)} className="transition-colors p-2 rounded-full hover:bg-[var(--color-slate-700)]/50 text-[var(--color-emerald-400)]">{showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}</button> : <Lock className="h-5 w-5 flex-shrink-0" />}
                                            </div>
                                            <input ref={passwordInputRef} type={showPassword ? "text" : "password"} placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} onKeyDown={handleKeyDown} className="relative z-10 h-full w-0 flex-grow bg-transparent focus:outline-none text-[var(--color-white)]" />
                                            <div className={cn( "relative z-10 flex-shrink-0 overflow-hidden transition-all duration-300 ease-in-out", isPasswordValid ? "w-10 pr-1" : "w-0" )}><GlassButton type="button" onClick={handleProgressStep} size="icon" aria-label="Submit password"><ArrowRight className="w-5 h-5" /></GlassButton></div>
                                        </div></div>
                                    </div>
                                    <BlurFade inView delay={0.2}><button type="button" onClick={handleGoBack} className="mt-4 flex items-center gap-2 text-sm transition-colors text-[var(--color-slate-400)] hover:text-[var(--color-white)]"><ArrowLeft className="w-4 h-4" /> Go back</button></BlurFade>
                                </BlurFade>}
                            </AnimatePresence>
                        </motion.div>}
                    </AnimatePresence>
                    <AnimatePresence>
                        {authStep === 'confirmPassword' && <BlurFade key="confirm-password-field" className="w-full">
                            <div className="relative w-full">
                                <AnimatePresence>
                                    {confirmPassword.length > 0 && <motion.div initial={{ y: -10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.3 }} className="absolute -top-6 left-4 z-10"><label className="text-xs font-semibold text-[var(--color-slate-400)]">Confirm Password</label></motion.div>}
                                </AnimatePresence>
                                <div className="glass-input-wrap w-[300px]"><div className="glass-input">
                                    <span className="glass-input-text-area"></span>
                                    <div className="relative z-10 flex-shrink-0 flex items-center justify-center w-10 pl-2 text-[var(--color-slate-300)]">
                                        {isConfirmPasswordValid ? <button type="button" aria-label="Toggle confirm password visibility" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="transition-colors p-2 rounded-full hover:bg-[var(--color-slate-700)]/50 text-[var(--color-emerald-400)]">{showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}</button> : <Lock className="h-5 w-5 flex-shrink-0" />}
                                    </div>
                                    <input ref={confirmPasswordInputRef} type={showConfirmPassword ? "text" : "password"} placeholder="Confirm Password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="relative z-10 h-full w-0 flex-grow bg-transparent focus:outline-none text-[var(--color-white)]" />
                                    <div className={cn( "relative z-10 flex-shrink-0 overflow-hidden transition-all duration-300 ease-in-out", isConfirmPasswordValid ? "w-10 pr-1" : "w-0" )}><GlassButton type="submit" size="icon" aria-label="Finish sign-up"><ArrowRight className="w-5 h-5" /></GlassButton></div>
                                </div></div>
                            </div>
                            <BlurFade inView delay={0.2}><button type="button" onClick={handleGoBack} className="mt-4 flex items-center gap-2 text-sm transition-colors text-[var(--color-slate-400)] hover:text-[var(--color-white)]"><ArrowLeft className="w-4 h-4" /> Go back</button></BlurFade>
                        </BlurFade>}
                    </AnimatePresence>
                </form>
                
                {/* Toggle login / signup */}
                <BlurFade delay={0.25 * 6} className="text-center">
                    <p className="text-sm font-medium text-[var(--color-slate-400)]">
                        {isLoginMode ? "Don't have an account?" : "Already have an account?"}
                        <button 
                            type="button"
                            onClick={onToggleMode} 
                            className="font-bold ml-2 hover:text-[var(--color-emerald-400)] underline transition-colors text-[var(--color-white)]"
                        >
                            {isLoginMode ? 'Sign up' : 'Log in'}
                        </button>
                    </p>
                </BlurFade>
            </fieldset>
        </div>
    </div>
  );
};

export default AuthComponent;