import React from "react";
import { motion } from "framer-motion";
import { FaTimes, FaCog } from "react-icons/fa";
import { useChromeStorage } from "../hooks/useChromeStorage";

const SettingsModal = ({ onClose }) => {
  // Use persistent storage for max session length (default 2 hours)
  const [maxSessionLengthHours, setMaxSessionLengthHours] = useChromeStorage(
    "study_maxSessionLengthHours",
    2,
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-[var(--color-slate-950)]/80 backdrop-blur-sm"
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 20 }}
        className="w-full max-w-md bg-[var(--color-slate-900)] border border-[var(--color-slate-700)] rounded-3xl overflow-hidden shadow-2xl"
      >
        <div className="p-6 sm:p-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-[var(--color-emerald-500)]/10 rounded-xl">
                <FaCog className="text-[var(--color-emerald-400)] text-xl" />
              </div>
              <h2 className="text-2xl font-bold text-[var(--color-white)] tracking-tight">
                Settings
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-[var(--color-slate-400)] hover:text-[var(--color-white)] hover:bg-[var(--color-slate-800)] rounded-full transition-colors focus:outline-none"
            >
              <FaTimes className="text-lg" />
            </button>
          </div>

          {/* Settings Body */}
          <div className="space-y-6">
            <div className="space-y-3">
              <label className="block text-sm font-medium text-[var(--color-slate-300)]">
                Maximum Stopwatch Session Length
              </label>
              <p className="text-xs text-[var(--color-slate-400)] mb-3">
                Automatically stops the stopwatch timer if it exceeds this
                limit. Prevents accidental infinite sessions if you forget to
                turn it off.
              </p>

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {[1, 2, 3, 4].map((hours) => (
                  <button
                    key={hours}
                    onClick={() => setMaxSessionLengthHours(hours)}
                    className={`py-2.5 px-4 rounded-xl text-sm font-semibold transition-all duration-200 border ${
                      maxSessionLengthHours === hours
                        ? "bg-[var(--color-emerald-500)]/20 border-[var(--color-emerald-500)]/50 text-[var(--color-emerald-400)] shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]"
                        : "bg-[var(--color-slate-800)]/50 border-[var(--color-slate-700)] text-[var(--color-slate-300)] hover:bg-[var(--color-slate-800)] hover:border-[var(--color-slate-600)]"
                    }`}
                  >
                    {hours} {hours === 1 ? "Hour" : "Hours"}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Footer actions */}
          <div className="mt-8 pt-6 border-t border-[var(--color-slate-800)]">
            <button
              onClick={onClose}
              className="w-full py-3.5 bg-[var(--color-slate-800)] hover:bg-[var(--color-slate-700)] text-[var(--color-white)] text-[15px] font-semibold rounded-xl transition-all duration-200"
            >
              Done
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default SettingsModal;
