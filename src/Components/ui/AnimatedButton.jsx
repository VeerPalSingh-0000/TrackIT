import React from "react";
import { motion } from "framer-motion";

const AnimatedButton = ({
  children,
  onClick,
  className = "",
  icon = null,
  disabled = false,
  isLoading = false,
  variant = "primary", // primary, secondary, danger, glass, ghost
  size = "md", // sm, md, lg
  ...buttonProps
}) => {
  const baseStyles = "relative flex items-center justify-center gap-2 font-semibold transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[var(--color-slate-900)] motion-safe-gpu overflow-hidden";
  
  const sizeStyles = {
    sm: "px-3 py-1.5 text-xs rounded-lg",
    md: "px-6 py-3 text-sm rounded-xl",
    lg: "px-8 py-4 text-base rounded-2xl",
  };

  const variantStyles = {
    primary: "bg-[var(--color-emerald-500)] hover:bg-[var(--color-emerald-400)] text-slate-900 shadow-[0_0_20px_rgba(16,185,129,0.3)] focus:ring-[var(--color-emerald-500)]",
    secondary: "bg-[var(--color-slate-800)] hover:bg-[var(--color-slate-700)] text-white shadow-lg focus:ring-[var(--color-slate-500)] border border-white/5",
    danger: "bg-red-500/20 hover:bg-red-500/30 text-red-400 shadow-lg focus:ring-red-500 border border-red-500/20",
    glass: "bg-white/5 hover:bg-white/10 text-white shadow-lg backdrop-blur-md border border-white/10 focus:ring-white/20",
    ghost: "bg-transparent hover:bg-white/5 text-[var(--color-slate-300)] hover:text-white focus:ring-white/20",
  };

  return (
    <motion.button
      onClick={onClick}
      disabled={disabled || isLoading}
      {...buttonProps}
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${disabled ? "opacity-50 cursor-not-allowed" : ""} ${className}`}
      initial={{ scale: 1 }}
      animate={{ scale: 1 }}
      whileHover={disabled || isLoading ? {} : { scale: 1.02 }}
      whileTap={disabled || isLoading ? {} : { scale: 0.96 }}
      transition={{ type: "spring", stiffness: 300, damping: 30, mass: 1 }}
    >
      {/* Ripple effect overlay */}
      {!disabled && !isLoading && (
        <div className="absolute inset-0 bg-white/0 hover:bg-white/10 transition-colors duration-300 rounded-inherit pointer-events-none" />
      )}
      
      {isLoading ? (
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-4 h-4 border-2 border-current border-t-transparent rounded-full"
        />
      ) : (
        icon && <span className="text-lg z-10">{icon}</span>
      )}
      <span className="z-10">{children}</span>
    </motion.button>
  );
};

export default AnimatedButton;
