import React, { useRef } from "react";
import { motion, useScroll, useTransform, useInView } from "framer-motion";
import {
  Timer,
  Target,
  BarChart3,
  Music,
  Cloud,
  Clock,
  ArrowRight,
  Sparkles,
  Zap,
  Shield,
  ChevronDown,
  Play,
  CheckCircle2,
  Github,
  Heart,
  Headphones,
  Layers,
  TrendingUp,
  Smartphone,
} from "lucide-react";

/* ───────── Animated Section Wrapper ───────── */
const AnimatedSection = ({ children, className = "", delay = 0 }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <motion.section
      ref={ref}
      initial={{ opacity: 0, y: 60 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.8, delay, ease: [0.16, 1, 0.3, 1] }}
      className={className}
    >
      {children}
    </motion.section>
  );
};

/* ───────── Feature Card ───────── */
const FeatureCard = ({ icon: Icon, title, desc, index }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-40px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay: index * 0.1, ease: [0.16, 1, 0.3, 1] }}
      className="group relative"
    >
      <div className="relative h-full glass-card rounded-2xl p-6 sm:p-7 overflow-hidden transition-all duration-500 hover:border-white/20 hover:shadow-2xl hover:-translate-y-1">
        <div className="relative z-10">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center mb-5 bg-[var(--color-emerald-500)]/10 text-[var(--color-emerald-500)] group-hover:bg-[var(--color-emerald-500)] group-hover:text-btn transition-all duration-300"
          >
            <Icon className="w-6 h-6" strokeWidth={1.5} />
          </div>
          <h3 className="text-lg font-bold text-white mb-2 transition-colors">
            {title}
          </h3>
          <p className="text-[var(--color-slate-400)] text-sm leading-relaxed transition-colors">
            {desc}
          </p>
        </div>
      </div>
    </motion.div>
  );
};

/* ───────── Step Card (How It Works) ───────── */
const StepCard = ({ number, title, desc, icon: Icon, index }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-40px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, x: index % 2 === 0 ? -40 : 40 }}
      animate={isInView ? { opacity: 1, x: 0 } : {}}
      transition={{
        duration: 0.7,
        delay: index * 0.15,
        ease: [0.16, 1, 0.3, 1],
      }}
      className="relative flex items-start gap-5"
    >
      {/* Step number */}
      <div className="flex-shrink-0 w-14 h-14 rounded-2xl bg-[var(--color-emerald-500)]/10 border border-[var(--color-emerald-500)]/20 flex items-center justify-center">
        <span className="text-[var(--color-emerald-500)] font-bold text-lg">{number}</span>
      </div>

      <div className="pt-1">
        <div className="flex items-center gap-2 mb-1.5">
          <Icon className="w-4 h-4 text-[var(--color-emerald-500)]" strokeWidth={2} />
          <h3 className="text-base font-bold text-[var(--color-white)]">{title}</h3>
        </div>
        <p className="text-[var(--color-slate-400)] text-sm leading-relaxed">{desc}</p>
      </div>
    </motion.div>
  );
};

/* ───────── Value Prop Card ───────── */
const ValueCard = ({ icon: Icon, title, desc, index }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-40px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay: index * 0.12, ease: [0.16, 1, 0.3, 1] }}
      className="text-center px-4"
    >
      <div className="w-14 h-14 mx-auto rounded-2xl bg-[var(--color-emerald-500)]/10 border border-[var(--color-emerald-500)]/20 flex items-center justify-center mb-4">
        <Icon className="w-6 h-6 text-[var(--color-emerald-500)]" strokeWidth={1.5} />
      </div>
      <h3 className="text-base font-bold text-[var(--color-white)] mb-1.5">{title}</h3>
      <p className="text-[var(--color-slate-400)] text-sm leading-relaxed">{desc}</p>
    </motion.div>
  );
};

/* ═══════════════════════════════════════════════
   MAIN LANDING PAGE
   ═══════════════════════════════════════════════ */
const LandingPage = ({ onGetStarted }) => {
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll();
  const heroOpacity = useTransform(scrollYProgress, [0, 0.15], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 0.15], [1, 0.95]);

  const features = [
    {
      icon: Timer,
      title: "Dual Timer Modes",
      desc: "Switch between a free-running Stopwatch for open study sessions or structured Pomodoro cycles with automatic work/break intervals.",
    },
    {
      icon: Layers,
      title: "Hierarchical Tasks",
      desc: "Organize work into Projects, Topics, and Sub-Topics. Know exactly what you studied, when, and for how long.",
    },
    {
      icon: Headphones,
      title: "Ambient Soundscapes",
      desc: "Curated audio environments — Rain, Forest, Café, Lo-fi. Mix and adjust volumes to build your ideal focus zone.",
    },
    {
      icon: BarChart3,
      title: "Session History",
      desc: "Every session is automatically saved with detailed timestamps. Look back at your progress and build consistency over time.",
    },
    {
      icon: Cloud,
      title: "Cloud Sync",
      desc: "Your data lives safely in the cloud via Firebase. Switch between devices and pick up right where you left off.",
    },
    {
      icon: Shield,
      title: "Your Data, Your Account",
      desc: "All your study data is tied to your personal account. No one else can see it. Simple, private, and secure.",
    },
  ];

  const steps = [
    {
      icon: Play,
      title: "Pick Your Mode",
      desc: "Choose Stopwatch for open-ended study or Pomodoro for structured 25/5 minute work-break cycles.",
    },
    {
      icon: Target,
      title: "Select Your Task",
      desc: "Drill down into your project, topic, and sub-topic so every minute is tracked to the right place.",
    },
    {
      icon: Zap,
      title: "Enter Your Flow",
      desc: "Hit start, turn on ambient sounds if you like, and get into uninterrupted deep work.",
    },
    {
      icon: BarChart3,
      title: "Review & Grow",
      desc: "After each session, your history updates automatically. See what's working and build better habits.",
    },
  ];

  const valueProps = [
    {
      icon: TrendingUp,
      title: "Build Real Habits",
      desc: "Seeing your study history builds accountability. Small sessions add up to big results.",
    },
    {
      icon: Smartphone,
      title: "Works Everywhere",
      desc: "Use it on your browser, as a desktop app, or on your Android phone — your data stays in sync.",
    },
    {
      icon: Sparkles,
      title: "Designed to Feel Good",
      desc: "A clean, minimal interface that doesn't get in the way. Just you, your task, and your timer.",
    },
  ];

  return (
    <div className="min-h-screen w-full bg-[var(--color-slate-950)] text-[var(--color-slate-300)] overflow-x-hidden selection:bg-[var(--color-emerald-500)]/30 selection:text-[var(--color-white)] transition-colors duration-500">
      {/* ═══════════ NAVBAR ═══════════ */}
      <motion.nav
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="fixed top-0 left-0 right-0 z-50 px-4 sm:px-6 py-4"
      >
        <div className="max-w-6xl mx-auto flex items-center justify-between bg-[var(--color-slate-900)]/90 backdrop-blur-xl border border-[var(--color-slate-800)] rounded-2xl px-5 py-3 shadow-2xl transition-colors duration-500">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[var(--color-emerald-500)] flex items-center justify-center shadow-lg shadow-[var(--color-emerald-500)]/20">
              <Clock className="w-5 h-5 text-btn" strokeWidth={2} />
            </div>
            <span className="text-lg font-bold text-[var(--color-white)] tracking-tight">
              FocusFlow
            </span>
          </div>

          <div className="hidden sm:flex items-center gap-8">
            <a
              href="#features"
              className="text-sm text-[var(--color-slate-400)] hover:text-[var(--color-white)] transition-colors font-medium"
            >
              Features
            </a>
            <a
              href="#how-it-works"
              className="text-sm text-[var(--color-slate-400)] hover:text-[var(--color-white)] transition-colors font-medium"
            >
              How It Works
            </a>
            <a
              href="#why"
              className="text-sm text-[var(--color-slate-400)] hover:text-[var(--color-white)] transition-colors font-medium"
            >
              Why FocusFlow
            </a>
          </div>

          <button
            onClick={onGetStarted}
            className="px-5 py-2 bg-[var(--color-emerald-500)] hover:bg-[var(--color-emerald-600)] text-btn text-sm font-semibold rounded-xl hover:shadow-lg hover:shadow-[var(--color-emerald-500)]/25 active:scale-95 transition-all duration-200"
          >
            Get Started
          </button>
        </div>
      </motion.nav>

      {/* ═══════════ HERO ═══════════ */}
      <motion.div
        ref={heroRef}
        style={{ opacity: heroOpacity, scale: heroScale }}
        className="relative min-h-screen flex items-center justify-center px-4 pt-24 pb-16 overflow-hidden"
      >
        <div className="relative z-10 text-center max-w-4xl mx-auto">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--color-emerald-500)]/10 border border-[var(--color-emerald-500)]/20 rounded-full mb-8"
          >
            <Sparkles className="w-4 h-4 text-[var(--color-emerald-500)]" />
            <span className="text-sm font-medium text-[var(--color-emerald-500)]">
              A better way to study
            </span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.8,
              delay: 0.4,
              ease: [0.16, 1, 0.3, 1],
            }}
            className="text-4xl sm:text-5xl md:text-7xl font-black leading-[1.08] tracking-tight mb-6 text-[var(--color-white)]"
          >
            Study Smarter.
            <br />
            <span className="text-[var(--color-emerald-500)]">
              Stay Consistent.
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.6 }}
            className="text-lg sm:text-xl text-[var(--color-slate-400)] max-w-2xl mx-auto mb-10 leading-relaxed font-medium"
          >
            FocusFlow helps you track your study sessions, organize your
            projects, and build real focus habits — all in a clean, distraction-free
            workspace.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <button
              onClick={onGetStarted}
              className="group px-8 py-4 bg-[var(--color-emerald-500)] hover:bg-[var(--color-emerald-600)] text-btn text-base font-bold rounded-2xl hover:shadow-2xl hover:shadow-[var(--color-emerald-500)]/25 active:scale-[0.97] transition-all duration-300 flex items-center gap-3"
            >
              Start Focusing — It's Free
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <a
              href="#features"
              className="px-8 py-4 glass-card-subtle text-white text-base font-semibold rounded-2xl hover:bg-white/5 transition-all duration-300"
            >
              See What It Does
            </a>
          </motion.div>

          {/* APP MOCKUP REPLACEMENT */}
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.8, delay: 1, ease: [0.16, 1, 0.3, 1] }}
            className="mt-16 sm:mt-24 relative max-w-4xl mx-auto hidden sm:block"
          >
            <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-slate-950)] via-[var(--color-slate-950)]/40 to-transparent z-20 top-[50%] pointer-events-none"></div>
            
            <div className="relative rounded-3xl border border-white/10 overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.6)] bg-[var(--color-slate-900)]/80 backdrop-blur-3xl aspect-[16/9] flex items-center justify-center p-8">
              <div className="absolute inset-0 bg-gradient-to-br from-white/[0.03] to-transparent z-0"></div>
              
              {/* Abstract Timer UI inside the mockup */}
              <div className="relative z-10 w-full max-w-lg glass-card-elevated border border-white/10 rounded-[2rem] p-10 flex flex-col items-center justify-center shadow-2xl">
                <div className="absolute top-6 left-6 flex items-center gap-2 text-[var(--color-slate-400)] text-sm font-medium">
                  <Clock className="w-4 h-4" /> Focus Session
                </div>
                
                <div className="mt-8 mb-6 relative flex items-center justify-center">
                  <svg className="w-64 h-64 -rotate-90 transform" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="2" className="text-white/5" />
                    <motion.circle 
                      cx="50" cy="50" r="45" 
                      fill="none" 
                      stroke="currentColor" 
                      strokeWidth="2.5" 
                      strokeLinecap="round"
                      className="text-[var(--color-emerald-500)]"
                      initial={{ strokeDasharray: "283", strokeDashoffset: "283" }}
                      animate={{ strokeDashoffset: "70" }}
                      transition={{ duration: 2, ease: "easeOut", delay: 1.5 }}
                    />
                  </svg>
                  
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="font-mono text-5xl font-bold text-white tracking-tighter shadow-sm">
                      25:00
                    </span>
                    <span className="text-[var(--color-slate-400)] text-sm mt-2 uppercase tracking-widest font-semibold">
                      Focusing
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-6 mt-4">
                  <div className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center opacity-50">
                    <div className="w-4 h-4 bg-white/30 rounded-[2px]"></div>
                  </div>
                  <div className="w-16 h-16 rounded-full bg-[var(--color-emerald-500)]/20 border border-[var(--color-emerald-500)]/30 flex items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.3)]">
                    <div className="flex gap-1.5">
                      <div className="w-1.5 h-5 bg-[var(--color-emerald-400)] rounded-full"></div>
                      <div className="w-1.5 h-5 bg-[var(--color-emerald-400)] rounded-full"></div>
                    </div>
                  </div>
                  <div className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center opacity-50">
                    <ArrowRight className="w-5 h-5 text-white/50" />
                  </div>
                </div>
              </div>
            </div>
            
            {/* Glowing orbs behind mockup */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3/4 h-3/4 bg-[var(--color-emerald-500)]/20 blur-[120px] rounded-full -z-10"></div>
          </motion.div>

          {/* Scroll indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5 }}
            className="mt-16 flex flex-col items-center gap-2"
          >
            <span className="text-xs text-[var(--color-slate-500)] font-medium uppercase tracking-widest">
              Scroll to explore
            </span>
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              <ChevronDown className="w-5 h-5 text-[var(--color-slate-500)]" />
            </motion.div>
          </motion.div>
        </div>
      </motion.div>

      {/* ═══════════ FEATURES ═══════════ */}
      <div id="features" className="relative px-4 sm:px-6 py-24 sm:py-32 border-t border-[var(--color-slate-900)]">
        <div className="max-w-6xl mx-auto">
          <AnimatedSection className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--color-slate-900)] border border-[var(--color-slate-800)] rounded-full mb-6">
              <Zap className="w-4 h-4 text-[var(--color-emerald-500)]" />
              <span className="text-sm font-medium text-[var(--color-slate-400)]">
                Built for deep work
              </span>
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-[var(--color-white)] mb-4 tracking-tight">
              Everything You Need,{" "}
              <span className="text-[var(--color-emerald-500)]">
                Nothing You Don't
              </span>
            </h2>
            <p className="text-[var(--color-slate-400)] text-lg max-w-2xl mx-auto font-medium">
              No bloated features, no upsells. Just a clean toolkit to help you
              sit down and focus.
            </p>
          </AnimatedSection>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((feature, i) => (
              <FeatureCard key={i} index={i} {...feature} />
            ))}
          </div>
        </div>
      </div>

      {/* ═══════════ HOW IT WORKS ═══════════ */}
      <div
        id="how-it-works"
        className="relative px-4 sm:px-6 py-24 sm:py-32 border-t border-[var(--color-slate-900)]"
      >
        <div className="max-w-3xl mx-auto">
          <AnimatedSection className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--color-slate-900)] border border-[var(--color-slate-800)] rounded-full mb-6">
              <CheckCircle2 className="w-4 h-4 text-[var(--color-emerald-500)]" />
              <span className="text-sm font-medium text-[var(--color-slate-400)]">
                Simple by design
              </span>
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-[var(--color-white)] mb-4 tracking-tight">
              How{" "}
              <span className="text-[var(--color-emerald-500)]">
                FocusFlow
              </span>{" "}
              Works
            </h2>
            <p className="text-[var(--color-slate-400)] text-lg max-w-xl mx-auto font-medium">
              Four steps. No learning curve. Just open it and start.
            </p>
          </AnimatedSection>

          <div className="space-y-8">
            {steps.map((step, i) => (
              <StepCard key={i} number={i + 1} index={i} {...step} />
            ))}
          </div>
        </div>
      </div>

      {/* ═══════════ WHY FOCUSFLOW ═══════════ */}
      <div id="why" className="relative px-4 sm:px-6 py-24 sm:py-32 border-t border-[var(--color-slate-900)]">
        <div className="max-w-5xl mx-auto">
          <AnimatedSection className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--color-slate-900)] border border-[var(--color-slate-800)] rounded-full mb-6">
              <Heart className="w-4 h-4 text-[var(--color-emerald-500)]" />
              <span className="text-sm font-medium text-[var(--color-slate-400)]">
                Why this exists
              </span>
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-[var(--color-white)] mb-4 tracking-tight">
              Built Because{" "}
              <span className="text-[var(--color-emerald-500)]">
                I Needed It Too
              </span>
            </h2>
            <p className="text-[var(--color-slate-400)] text-lg max-w-2xl mx-auto font-medium leading-relaxed">
              I built FocusFlow because I couldn't find a study tracker that was
              simple, beautiful, and didn't try to sell me a premium plan. This
              is the tool I wish I had when I started — and now it's yours too.
            </p>
          </AnimatedSection>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 sm:gap-6">
            {valueProps.map((prop, i) => (
              <ValueCard key={i} index={i} {...prop} />
            ))}
          </div>
        </div>
      </div>

      {/* ═══════════ OPEN SOURCE BANNER ═══════════ */}
      <div className="relative px-4 sm:px-6 py-16 sm:py-20 border-t border-[var(--color-slate-900)]">
        <div className="max-w-4xl mx-auto">
          <AnimatedSection>
            <div className="relative glass-card-elevated rounded-3xl p-8 sm:p-12 overflow-hidden text-center">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-[var(--color-emerald-500)]/10 border border-[var(--color-emerald-500)]/20 flex items-center justify-center mb-5">
                <Github className="w-7 h-7 text-[var(--color-emerald-500)]" strokeWidth={1.5} />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-[var(--color-white)] mb-3">
                Free & Open Source
              </h3>
              <p className="text-[var(--color-slate-400)] text-base max-w-lg mx-auto mb-6 leading-relaxed">
                FocusFlow is completely free to use. No hidden costs, no
                ads, no data selling. Just a tool that helps you study
                better.
              </p>
              <a
                href="https://github.com/v818/FocusFlow"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-[var(--color-slate-950)] border border-white/10 text-[var(--color-white)] text-sm font-semibold rounded-xl hover:bg-white/5 transition-all duration-300"
              >
                <Github className="w-4 h-4" />
                View on GitHub
              </a>
            </div>
          </AnimatedSection>
        </div>
      </div>

      {/* ═══════════ FINAL CTA ═══════════ */}
      <div className="relative px-4 sm:px-6 py-24 sm:py-32 border-t border-[var(--color-slate-900)]">
        <div className="max-w-3xl mx-auto text-center relative z-10">
          <AnimatedSection>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-[var(--color-white)] mb-5 tracking-tight leading-tight">
              Your Next Study Session
              <br />
              <span className="text-[var(--color-emerald-500)]">
                Starts Here
              </span>
            </h2>
            <p className="text-[var(--color-slate-400)] text-lg mb-10 max-w-xl mx-auto font-medium">
              No sign-up fees. No credit card. Just create a free account and
              start building your focus habit today.
            </p>
            <button
              onClick={onGetStarted}
              className="group px-10 py-4 bg-[var(--color-emerald-500)] hover:bg-[var(--color-emerald-600)] text-btn text-lg font-bold rounded-2xl hover:shadow-2xl hover:shadow-[var(--color-emerald-500)]/25 active:scale-[0.97] transition-all duration-300 inline-flex items-center gap-3"
            >
              Get Started — It's Free
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </AnimatedSection>
        </div>
      </div>

      {/* ═══════════ FOOTER ═══════════ */}
      <footer className="border-t border-[var(--color-slate-900)] px-4 sm:px-6 py-10">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[var(--color-emerald-500)] flex items-center justify-center">
              <Clock className="w-4 h-4 text-btn" strokeWidth={2} />
            </div>
            <span className="text-sm font-bold text-[var(--color-slate-400)]">FocusFlow</span>
          </div>

          <div className="flex items-center gap-1 text-sm text-[var(--color-slate-500)]">
            Made with
            <Heart className="w-4 h-4 text-rose-500 fill-rose-500 mx-1" />
            by Veer Pal Singh
          </div>

          <a
            href="https://github.com"
            target="_blank"
            rel="noreferrer"
            className="text-[var(--color-slate-500)] hover:text-[var(--color-slate-300)] transition-colors"
          >
            <Github className="w-5 h-5" />
          </a>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
