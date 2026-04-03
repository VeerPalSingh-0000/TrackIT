import React from "react";
import { motion } from "framer-motion";

const AnimatedButton = ({
  children,
  onClick,
  className = "",
  icon = null,
  disabled = false,
  ...buttonProps
}) => {
  return (
    <motion.button
      onClick={onClick}
      disabled={disabled}
      {...buttonProps}
      className={`flex items-center justify-center gap-2 font-semibold px-6 py-3 rounded-xl shadow-lg transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--color-emerald-500)] focus:ring-offset-[var(--color-slate-900)] motion-safe-gpu ${className}`}
      // 'initial' aur 'animate' add kiya taaki button ko apni normal state hamesha yaad rahe
      initial={{ scale: 1 }}
      animate={{ scale: 1 }}
      // Hover PC ke liye theek hai, mobile par farq nahi padega
      whileHover={disabled ? {} : { scale: 1.02 }}
      // Tap karne par thoda aaram se dabega
      whileTap={disabled ? {} : { scale: 0.96 }}
      // JADU YAHAN HAI: easeInOut aur 0.25s duration se ekdum makkhan jaisa chalega! 🧈
      transition={{ type: "spring", stiffness: 300, damping: 30, mass: 1 }}
    >
      {icon && <span className="text-lg">{icon}</span>}
      <span>{children}</span>
    </motion.button>
  );
};

export default AnimatedButton;
