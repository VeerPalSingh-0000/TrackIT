import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaClock,
  FaTasks,
  FaMusic,
  FaChartLine,
  FaArrowRight,
  FaArrowLeft,
  FaRocket,
} from "react-icons/fa";
import TrackerLogo from "/clock.png?url";

const steps = [
  {
    tag: "Welcome",
    title: "Welcome to FocusFlow",
    subtitle:
      "Your personal productivity companion for deep work and focused study sessions.",
    visual: "logo",
    gradient: "from-emerald-500/20 via-teal-500/10 to-indigo-500/20",
    accent: "emerald",
  },
  {
    tag: "Timer",
    title: "Dual Timer Modes",
    subtitle:
      "Choose between a free-running Stopwatch or structured Pomodoro cycles (25 min focus / 5 min breaks). The system automatically tracks your sessions.",
    icon: <FaClock />,
    gradient: "from-violet-500/20 via-purple-500/10 to-indigo-500/20",
    accent: "violet",
  },
  {
    tag: "Organization",
    title: "Hierarchical Task System",
    subtitle:
      "Organize your work into Projects → Topics → Sub-Topics. Track time at every level and know exactly where your hours go.",
    icon: <FaTasks />,
    gradient: "from-blue-500/20 via-cyan-500/10 to-teal-500/20",
    accent: "blue",
  },
  {
    tag: "Ambiance",
    title: "Ambient Soundscapes",
    subtitle:
      "Block distractions with curated ambient audio — Rain, Forest, Café, or Lo-fi beats. Mix and match the perfect concentration environment.",
    icon: <FaMusic />,
    gradient: "from-amber-500/20 via-orange-500/10 to-rose-500/20",
    accent: "amber",
  },
  {
    tag: "Analytics",
    title: "Session History & Analytics",
    subtitle:
      "Review your focus sessions with rich history views. See your daily, weekly, and per-project study patterns to continuously improve.",
    icon: <FaChartLine />,
    gradient: "from-rose-500/20 via-pink-500/10 to-fuchsia-500/20",
    accent: "rose",
  },
];

const accentColors = {
  emerald: {
    dot: "bg-emerald-400",
    ring: "ring-emerald-400/30",
    text: "text-emerald-400",
    iconBg: "bg-emerald-500/10 border-emerald-500/20",
    btn: "bg-emerald-600 hover:bg-emerald-500",
  },
  violet: {
    dot: "bg-violet-400",
    ring: "ring-violet-400/30",
    text: "text-violet-400",
    iconBg: "bg-violet-500/10 border-violet-500/20",
    btn: "bg-violet-600 hover:bg-violet-500",
  },
  blue: {
    dot: "bg-blue-400",
    ring: "ring-blue-400/30",
    text: "text-blue-400",
    iconBg: "bg-blue-500/10 border-blue-500/20",
    btn: "bg-blue-600 hover:bg-blue-500",
  },
  amber: {
    dot: "bg-amber-400",
    ring: "ring-amber-400/30",
    text: "text-amber-400",
    iconBg: "bg-amber-500/10 border-amber-500/20",
    btn: "bg-amber-600 hover:bg-amber-500",
  },
  rose: {
    dot: "bg-rose-400",
    ring: "ring-rose-400/30",
    text: "text-rose-400",
    iconBg: "bg-rose-500/10 border-rose-500/20",
    btn: "bg-rose-600 hover:bg-rose-500",
  },
};

const slideVariants = {
  enter: (direction) => ({
    x: direction > 0 ? 80 : -80,
    opacity: 0,
    scale: 0.95,
  }),
  center: { x: 0, opacity: 1, scale: 1 },
  exit: (direction) => ({
    x: direction < 0 ? 80 : -80,
    opacity: 0,
    scale: 0.95,
  }),
};

const WelcomeScreen = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const step = steps[currentStep];
  const colors = accentColors[step.accent];
  const isLast = currentStep === steps.length - 1;
  const isFirst = currentStep === 0;

  const goNext = () => {
    if (isLast) {
      onComplete();
      return;
    }
    setDirection(1);
    setCurrentStep((prev) => prev + 1);
  };

  const goBack = () => {
    if (isFirst) return;
    setDirection(-1);
    setCurrentStep((prev) => prev - 1);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[var(--color-slate-950)] transition-colors duration-1000">
      {/* Animated gradient blobs */}
      <div
        className={`absolute inset-0 bg-gradient-to-br ${step.gradient} transition-all duration-1000`}
      />
      <div className="absolute top-1/4 -left-20 w-72 h-72 bg-emerald-500/5 rounded-full blur-3xl animate-pulse" />
      <div
        className="absolute bottom-1/4 -right-20 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl animate-pulse"
        style={{ animationDelay: "1s" }}
      />

      {/* Main content */}
      <div className="relative z-10 w-full max-w-lg mx-auto px-6 flex flex-col items-center min-h-[100dvh] sm:min-h-0 sm:h-auto py-12 sm:py-0">
        {/* Progress dots */}
        <div className="flex items-center gap-2 mb-8 sm:mb-12">
          {steps.map((_, i) => (
            <button
              key={i}
              onClick={() => {
                setDirection(i > currentStep ? 1 : -1);
                setCurrentStep(i);
              }}
              className={`rounded-full transition-all duration-500 ${
                i === currentStep
                  ? `w-8 h-2.5 ${colors.dot}`
                  : i < currentStep
                  ? `w-2.5 h-2.5 ${colors.dot} opacity-50`
                  : "w-2.5 h-2.5 bg-[var(--color-slate-700)]"
              }`}
            />
          ))}
        </div>

        {/* Slide content */}
        <div className="flex-1 flex items-center w-full overflow-hidden">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={currentStep}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="w-full flex flex-col items-center text-center"
            >
              {/* Icon / Logo */}
              <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.15, type: "spring", stiffness: 200 }}
                className="mb-8"
              >
                {step.visual === "logo" ? (
                  <div
                    className={`w-28 h-28 sm:w-32 sm:h-32 rounded-3xl ${colors.iconBg} border flex items-center justify-center shadow-2xl`}
                  >
                    <img
                      src={TrackerLogo}
                      alt="FocusFlow"
                      className="w-20 h-20 sm:w-24 sm:h-24 object-contain drop-shadow-lg"
                    />
                  </div>
                ) : (
                  <div
                    className={`w-20 h-20 sm:w-24 sm:h-24 rounded-3xl ${colors.iconBg} border flex items-center justify-center shadow-2xl`}
                  >
                    <span className={`text-3xl sm:text-4xl ${colors.text}`}>
                      {step.icon}
                    </span>
                  </div>
                )}
              </motion.div>

              {/* Tag */}
              <motion.span
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className={`text-xs font-bold uppercase tracking-[0.2em] ${colors.text} mb-3`}
              >
                {step.tag}
              </motion.span>

              {/* Title */}
              <motion.h2
                initial={{ y: 15, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.25 }}
                className="text-2xl sm:text-3xl md:text-4xl font-bold text-[var(--color-white)] mb-4 leading-tight transition-colors"
              >
                {step.title}
              </motion.h2>

              {/* Description */}
              <motion.p
                initial={{ y: 15, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-base sm:text-lg text-[var(--color-slate-400)] leading-relaxed max-w-md transition-colors font-medium"
              >
                {step.subtitle}
              </motion.p>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Navigation */}
        <div className="w-full flex items-center justify-between mt-8 sm:mt-12 pb-8 sm:pb-0">
          {/* Back button */}
          <motion.button
            onClick={goBack}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
              isFirst
                ? "opacity-0 pointer-events-none"
                : "text-[var(--color-slate-400)] hover:text-[var(--color-white)] hover:bg-[var(--color-white)]/[0.06]"
            }`}
            whileTap={{ scale: 0.95 }}
          >
            <FaArrowLeft className="text-xs" /> Back
          </motion.button>

          {/* Next / Get Started button */}
          <motion.button
            onClick={goNext}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold text-btn transition-all duration-300 shadow-lg ${
              colors.btn
            } ${isLast ? "shadow-emerald-500/20" : ""}`}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            {isLast ? (
              <>
                <FaRocket className="text-sm" /> Get Started
              </>
            ) : (
              <>
                Next <FaArrowRight className="text-xs" />
              </>
            )}
          </motion.button>
        </div>

        {/* Skip for experienced users */}
        {!isLast && (
          <button
            onClick={onComplete}
            className="text-xs text-[var(--color-slate-500)] hover:text-[var(--color-emerald-500)] transition-colors mt-2 mb-4 sm:mb-0 font-bold uppercase tracking-widest opacity-80"
          >
            Skip intro
          </button>
        )}
      </div>
    </div>
  );
};

export default WelcomeScreen;
