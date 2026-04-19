import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import AnimatedModal from "./ui/AnimatedModal";
import { FaCalendarDay, FaTrash } from "react-icons/fa";
import toast from "react-hot-toast";

const listVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06, delayChildren: 0.1 },
  },
  exit: {
    opacity: 0,
    transition: { staggerChildren: 0.03, staggerDirection: -1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: "spring", damping: 28, stiffness: 250 },
  },
  exit: {
    opacity: 0,
    y: -20,
    scale: 0.95,
    transition: { type: "spring", damping: 28, stiffness: 250 },
  },
};

const DeleteHistoryModal = ({ studyHistory, deleteSession, onClose }) => {
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Check if session is within 1 week (7 days)
  const isWithinOneWeek = (sessionDate) => {
    const now = new Date();
    const sessionDateObj = new Date(sessionDate);
    const diffInMillis = now - sessionDateObj;
    const diffInDays = diffInMillis / (1000 * 60 * 60 * 24);
    return diffInDays <= 7;
  };

  // Filter sessions within 1 week
  const deletableSessions = studyHistory.filter((session) =>
    isWithinOneWeek(session.date || session.createdAt),
  );

  // Group sessions by date
  const groupedSessions = deletableSessions.reduce((acc, session) => {
    const date = session.date;
    if (!acc[date]) acc[date] = [];
    acc[date].push(session);
    return acc;
  }, {});

  const sortedDates = Object.keys(groupedSessions).sort(
    (a, b) => new Date(b) - new Date(a),
  );

  // Handle session deletion
  const handleDeleteSession = async (session) => {
    setIsDeleting(true);
    try {
      await deleteSession(session);
      toast.success(`Session "${session.projectName}" deleted! ✓`);
      setConfirmDelete(null);
      // Modal will auto-close when parent updates
      setTimeout(() => {
        setIsDeleting(false);
        onClose();
      }, 300);
    } catch (error) {
      console.error("Error deleting session:", error);
      toast.error("Failed to delete - check console");
      setIsDeleting(false);
    }
  };

  return (
    <AnimatedModal onClose={onClose}>
      <div className="flex flex-col w-[90vw] h-[85vh] max-w-4xl bg-[var(--color-slate-950)]/80 backdrop-blur-3xl border border-white/[0.08] rounded-3xl shadow-2xl overflow-hidden motion-safe-gpu">
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-white/[0.05] flex flex-col sm:flex-row sm:justify-between sm:items-center gap-5 flex-shrink-0 bg-white/[0.01]">
          <div>
            <h2 className="text-[20px] sm:text-[22px] font-semibold text-white text-center sm:text-left tracking-tight">
              Delete Session History
            </h2>
            <p className="text-[12px] text-[var(--color-slate-400)] mt-1 text-center sm:text-left">
              Delete sessions from the past 7 days
            </p>
          </div>
        </div>

        {/* Scrolling Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 custom-scrollbar">
          {deletableSessions.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-[15px] font-medium text-[var(--color-slate-400)]">
                No sessions from the past 7 days to delete.
              </p>
            </div>
          ) : (
            <motion.div
              variants={listVariants}
              initial="hidden"
              animate="visible"
              className="space-y-8"
            >
              {sortedDates.map((date) => (
                <motion.div key={date} variants={itemVariants}>
                  <h3 className="flex items-center gap-2 text-[14px] font-bold text-[var(--color-emerald-500)] mb-3 tracking-wide uppercase">
                    <FaCalendarDay className="text-[12px]" />
                    {new Date(date).toLocaleDateString("en-US", {
                      weekday: "long",
                      month: "long",
                      day: "numeric",
                    })}
                  </h3>
                  <div className="space-y-2.5">
                    {groupedSessions[date].map((session) => (
                      <motion.div
                        key={session.id}
                        variants={itemVariants}
                        className="bg-white/[0.02] border border-white/[0.05] p-4 sm:p-5 rounded-2xl flex justify-between items-center hover:bg-white/[0.04] transition-colors group"
                      >
                        <div className="pr-4 flex-1">
                          <p className="font-semibold text-white text-[14px] sm:text-[15px] leading-snug">
                            {session.projectName}
                            {session.topicName && (
                              <span className="text-[var(--color-slate-400)] font-medium ml-1.5">
                                › {session.topicName}
                              </span>
                            )}
                            {session.subTopicName && (
                              <span className="text-[var(--color-slate-500)] font-medium ml-1.5">
                                › {session.subTopicName}
                              </span>
                            )}
                          </p>
                          <p className="text-[12px] text-[var(--color-slate-400)] font-medium mt-1">
                            {new Date(session.startTime).toLocaleTimeString(
                              [],
                              { hour: "2-digit", minute: "2-digit" },
                            )}
                          </p>
                        </div>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() =>
                            setConfirmDelete({
                              session: session,
                              id: session.id,
                              name: session.projectName,
                              date: new Date(
                                session.date || session.createdAt,
                              ).toLocaleDateString(),
                            })
                          }
                          className="p-2 rounded-lg text-[var(--color-slate-400)] hover:text-red-500 hover:bg-red-500/10 transition-colors"
                          title="Delete session"
                        >
                          <FaTrash className="text-[14px]" />
                        </motion.button>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>

        {/* Confirmation Modal for Delete */}
        <AnimatePresence>
          {confirmDelete && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50"
              onClick={() => !isDeleting && setConfirmDelete(null)}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-[var(--color-slate-950)] border border-white/[0.08] rounded-2xl p-6 max-w-sm w-[90%] shadow-2xl"
              >
                <h3 className="text-[18px] font-bold text-white mb-2">
                  Delete Session?
                </h3>
                <p className="text-[14px] text-[var(--color-slate-400)] mb-4">
                  Are you sure you want to delete the session from{" "}
                  <span className="text-white font-semibold">
                    {confirmDelete.date}
                  </span>
                  ?
                  <br />
                  <span className="text-[var(--color-slate-500)] text-[13px]">
                    {confirmDelete.name}
                  </span>
                </p>
                <p className="text-[12px] text-[var(--color-slate-500)] mb-6">
                  This action cannot be undone.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setConfirmDelete(null)}
                    disabled={isDeleting}
                    className="flex-1 py-2.5 bg-[var(--color-slate-800)] hover:bg-[var(--color-slate-700)] text-white rounded-lg text-[13px] font-semibold transition-colors disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleDeleteSession(confirmDelete.session)}
                    disabled={isDeleting}
                    className="flex-1 py-2.5 bg-red-500/20 hover:bg-red-500/30 text-red-400 hover:text-red-300 rounded-lg text-[13px] font-semibold transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {isDeleting ? (
                      <>
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{
                            duration: 1,
                            repeat: Infinity,
                            ease: "linear",
                          }}
                        >
                          <FaTrash className="text-[12px]" />
                        </motion.div>
                        Deleting...
                      </>
                    ) : (
                      <>
                        <FaTrash className="text-[12px]" />
                        Delete
                      </>
                    )}
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Footer Button */}
        <div className="p-5 border-t border-white/[0.05] flex-shrink-0 bg-black/20">
          <button
            onClick={onClose}
            className="w-full text-center py-3.5 bg-[var(--color-emerald-500)]/10 text-[var(--color-emerald-400)] rounded-xl text-[14px] font-semibold hover:bg-[var(--color-emerald-500)]/20 hover:text-[var(--color-emerald-300)] transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 active:scale-[0.98]"
          >
            Close
          </button>
        </div>
      </div>
    </AnimatedModal>
  );
};

export default DeleteHistoryModal;
