import React from "react";
import { motion } from "framer-motion";

const modalVariants = {
  hidden: { opacity: 0, scale: 0.85, y: 50 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { type: "spring", stiffness: 200, damping: 25 },
  },
  exit: {
    opacity: 0,
    scale: 0.85,
    y: 50,
    transition: { type: "spring", stiffness: 200, damping: 30 },
  },
};

const AnimatedModal = ({ children, onClose }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 motion-safe-gpu"
      onClick={onClose}
    >
      <motion.div
        variants={modalVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        className="max-w-4xl w-full max-h-[90vh] flex flex-col rounded-2xl shadow-2xl bg-[var(--color-slate-900)]/95 backdrop-blur-2xl border border-[var(--color-slate-700)] motion-safe-gpu"
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </motion.div>
    </motion.div>
  );
};

export default AnimatedModal;
