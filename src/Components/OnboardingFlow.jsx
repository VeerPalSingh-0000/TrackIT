import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import AnimatedModal from './ui/AnimatedModal';
import AnimatedButton from './ui/AnimatedButton';
import { FaArrowRight, FaArrowLeft, FaPlus, FaTrash, FaCheck, FaBookmark, FaFolderOpen } from 'react-icons/fa';

const stepVariants = {
  hidden: { opacity: 0, x: 50 },
  visible: { opacity: 1, x: 0, transition: { type: 'spring', stiffness: 200, damping: 25 } },
  exit: { opacity: 0, x: -50, transition: { duration: 0.2 } },
};

const listItemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
    exit: { opacity: 0, x: -20 }
};

/**
 * A multi-step modal for creating a new project or editing an existing one.
 * @param {function} onFinish - Callback function when the flow is completed. It receives (projectData, projectId). projectId is null if creating.
 * @param {function} onCancel - Callback function to close the modal.
 * @param {object|null} projectToEdit - The project object to edit. If null, the component is in "create" mode.
 */
const OnboardingFlow = ({ onFinish, onCancel, projectToEdit = null }) => {
  const [step, setStep] = useState(1);
  
  // This state now initializes based on whether we are editing or creating.
  const [projectSetup, setProjectSetup] = useState({ name: "", description: "", topics: [] });
  const [currentTopic, setCurrentTopic] = useState({ name: "", subTopics: [] });
  const [currentSubTopicName, setCurrentSubTopicName] = useState("");

  // A simple boolean to check if we are in "edit mode".
  const isEditMode = projectToEdit !== null;

  // This effect runs when the component mounts. If we are in edit mode,
  // it populates the state with the existing project's data.
  useEffect(() => {
    if (isEditMode && projectToEdit) {
        setProjectSetup({
            name: projectToEdit.name || "",
            description: projectToEdit.description || "",
            // The data model uses `subProjects`, but our form uses `topics`. We map it here.
            topics: projectToEdit.subProjects?.map(t => ({...t})) || []
        });
    }
  }, [projectToEdit, isEditMode]);

  // Adds a new sub-topic to the currently edited topic.
  const addSubTopic = () => {
    if (!currentSubTopicName.trim()) return;
    setCurrentTopic(prev => ({
      ...prev,
      subTopics: [...prev.subTopics, { id: `sub_${Date.now()}`, name: currentSubTopicName.trim() }],
    }));
    setCurrentSubTopicName("");
  };

  // Removes a sub-topic from the currently edited topic.
  const removeSubTopic = (subTopicId) => {
    setCurrentTopic(prev => ({
        ...prev,
        subTopics: prev.subTopics.filter(st => st.id !== subTopicId)
    }));
  }

  // Adds the currently edited topic (and its sub-topics) to the main project structure.
  const addTopic = () => {
    if (!currentTopic.name.trim()) return;
    setProjectSetup(prev => ({
      ...prev,
      topics: [...prev.topics, { id: `topic_${Date.now()}`, ...currentTopic }],
    }));
    // Reset for the next topic
    setCurrentTopic({ name: "", subTopics: [] });
  };

  // Removes a topic from the project structure.
  const removeTopic = (topicId) => {
    setProjectSetup(prev => ({
        ...prev,
        topics: prev.topics.filter(t => t.id !== topicId)
    }));
  }
  
  // Finalizes the process, calling the onFinish prop with the data.
  const handleFinish = () => {
    const finalProjectData = {
      name: projectSetup.name.trim(),
      description: projectSetup.description.trim(),
      // Map `topics` back to `subProjects` to match the data model.
      subProjects: projectSetup.topics.map(t => ({...t})),
    };
    // If in edit mode, pass the original project's ID back.
    onFinish(finalProjectData, isEditMode ? projectToEdit.id : null);
  };

  // Helper for handling 'Enter' key press on inputs.
  const handleKeyPress = (e, action) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      action();
    }
  }

  return (
    <AnimatedModal onClose={onCancel}>
        {/* Header: Title and progress bar */}
        <div className="p-6 sm:p-8 border-b border-white/[0.06] bg-gradient-to-b from-white/[0.03] to-transparent flex-shrink-0">
          <h2 className="text-2xl sm:text-3xl font-bold text-white text-center tracking-tight">
            {isEditMode ? 'Edit Project' : 'Create New Project'}
          </h2>
          <div className="w-full max-w-sm mx-auto bg-slate-800/50 rounded-full h-1 mt-6 overflow-hidden shadow-inner">
            <motion.div
              className="bg-emerald-400 h-1 rounded-full shadow-[0_0_12px_rgba(52,211,153,0.8)]"
              initial={{ width: '0%' }}
              animate={{ width: step === 1 ? '50%' : '100%' }}
              transition={{ type: 'spring', stiffness: 100 }}
            />
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8">
          <AnimatePresence mode="wait">
             {step === 1 && (
              <motion.div key="step1" variants={stepVariants} initial="hidden" animate="visible" exit="exit" className="max-w-xl mx-auto mt-4 sm:mt-8">
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2 ml-1">Project Name</label>
                    <input
                      type="text"
                      placeholder="e.g., Learn React"
                      value={projectSetup.name}
                      onChange={(e) => setProjectSetup({ ...projectSetup, name: e.target.value })}
                      className="w-full p-4 rounded-2xl text-base sm:text-lg bg-white/[0.02] border border-white/10 text-white focus:border-emerald-500 focus:bg-white/[0.04] focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all placeholder:text-slate-500 shadow-inner"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2 ml-1">Description <span className="opacity-50 text-slate-400">(Optional)</span></label>
                    <textarea
                      placeholder="What is this project about?"
                      value={projectSetup.description}
                      onChange={(e) => setProjectSetup({ ...projectSetup, description: e.target.value })}
                      className="w-full p-4 rounded-2xl text-base sm:text-lg bg-white/[0.02] border border-white/10 text-white h-32 resize-none focus:border-emerald-500 focus:bg-white/[0.04] focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all placeholder:text-slate-500 shadow-inner"
                    />
                  </div>
                </div>
              </motion.div>
            )}
            
             {step === 2 && (
              <motion.div key="step2" variants={stepVariants} initial="hidden" animate="visible" exit="exit">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
                  {/* Input Column */ }
                  <div className="bg-white/[0.02] p-5 sm:p-7 rounded-3xl space-y-6 border border-white/5 backdrop-blur-sm shadow-[0_4px_24px_rgba(0,0,0,0.2)]">
                    <h3 className="font-semibold text-lg text-white">Add New Topic</h3>
                    <div>
                      <input
                        type="text"
                        placeholder="Topic Name (e.g., Hooks)"
                        value={currentTopic.name}
                        onChange={(e) => setCurrentTopic({ ...currentTopic, name: e.target.value })}
                        className="w-full p-4 rounded-xl bg-white/[0.03] border border-white/10 text-white focus:border-emerald-500 focus:bg-white/[0.05] focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all placeholder:text-slate-500 shadow-inner"
                      />
                    </div>

                    <div className="bg-black/20 border border-white/5 p-5 rounded-2xl">
                      <h4 className="text-xs font-semibold text-slate-400 mb-3 uppercase tracking-wider">Sub-Topics</h4>
                      <div className="flex flex-col sm:flex-row gap-3 mb-3">
                        <input
                          type="text"
                          placeholder="e.g., useState"
                          value={currentSubTopicName}
                          onChange={(e) => setCurrentSubTopicName(e.target.value)}
                          onKeyPress={(e) => handleKeyPress(e, addSubTopic)}
                          className="w-full px-4 py-3 rounded-xl bg-white/[0.03] border border-white/10 text-white focus:border-emerald-500 focus:bg-white/[0.05] outline-none text-sm transition-all placeholder:text-slate-500 shadow-inner"
                        />
                        <button onClick={addSubTopic} disabled={!currentSubTopicName.trim()} className="w-full sm:w-auto px-5 py-3 bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center border border-white/10 font-medium active:scale-95">
                          <FaPlus />
                        </button>
                      </div>
                      <AnimatePresence>
                      {currentTopic.subTopics.length > 0 && (
                        <motion.div layout className="space-y-2 mt-4 max-h-32 overflow-y-auto p-1 scrollbar-hide">
                          {currentTopic.subTopics.map((st) => (
                            <motion.div layout key={st.id} variants={listItemVariants} initial="hidden" animate="visible" exit="exit" className="flex items-center justify-between bg-white/[0.04] border border-white/5 p-3 rounded-xl shadow-sm">
                              <span className="text-sm text-slate-200 font-medium"> • {st.name}</span>
                              <button onClick={() => removeSubTopic(st.id)} className="text-rose-400/80 hover:text-rose-400 hover:bg-rose-400/10 p-2 rounded-lg transition-colors active:scale-90"><FaTrash className="text-xs" /></button>
                            </motion.div>
                          ))}
                        </motion.div>
                      )}
                      </AnimatePresence>
                    </div>
                    <AnimatedButton variant="primary" onClick={addTopic} disabled={!currentTopic.name.trim()} className="w-full" icon={<FaPlus />}>Add Topic</AnimatedButton>
                  </div>
                  
                   {/* Display Column */ }
                  <div className="bg-white/[0.02] p-5 sm:p-7 rounded-3xl flex flex-col min-h-[350px] border border-white/5 backdrop-blur-sm shadow-[0_4px_24px_rgba(0,0,0,0.2)]">
                    <h3 className="font-semibold text-lg text-white mb-5 flex-shrink-0">Project Structure</h3>
                    <div className="space-y-3 flex-grow overflow-y-auto p-1 scrollbar-hide">
                      {projectSetup.topics.length === 0 && (
                        <div className="flex flex-col items-center justify-center h-full text-slate-500 transition-colors">
                          <FaFolderOpen className="text-5xl mb-4 opacity-20"/>
                          <p className="font-medium text-sm text-slate-400">Your topics will appear here.</p>
                        </div>
                      )}
                      <AnimatePresence>
                      {projectSetup.topics.map((t) => (
                        <motion.div layout key={t.id} variants={listItemVariants} initial="hidden" animate="visible" exit="exit" className="bg-white/[0.03] border border-white/5 p-4 rounded-2xl shadow-sm hover:bg-white/[0.05] transition-colors">
                          <div className="flex items-center justify-between mb-2">
                            <p className="font-bold text-emerald-400 flex items-center gap-3 transition-colors text-base"><FaBookmark className="opacity-80" />{t.name}</p>
                            <button onClick={() => removeTopic(t.id)} className="text-rose-400/80 hover:text-rose-400 hover:bg-rose-400/10 p-2 rounded-lg transition-colors active:scale-90"><FaTrash className="text-sm" /></button>
                          </div>
                          {t.subTopics.length > 0 && (
                            <div className="pl-6 space-y-2 border-l border-white/[0.08] ml-2.5 mt-3 transition-colors">
                                {t.subTopics.map((st) => (
                                    <p key={st.id} className="text-sm text-slate-300 flex items-center gap-2.5 font-medium transition-colors"><FaCheck className="text-emerald-500/60 text-[10px]" />{st.name}</p>
                                ))}
                            </div>
                          )}
                        </motion.div>
                      ))}
                      </AnimatePresence>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

         {/* Footer: Navigation buttons */}
        <div className="p-5 sm:p-6 border-t border-white/[0.06] bg-black/20 flex justify-between items-center flex-shrink-0 transition-colors">
            {step === 1 ? (
                <AnimatedButton variant="ghost" onClick={onCancel} className="text-slate-300 hover:text-white px-6">Cancel</AnimatedButton>
            ) : (
                <AnimatedButton variant="glass" onClick={() => setStep(1)} icon={<FaArrowLeft />} className="px-6 hover:bg-white/10"><span className="hidden sm:inline">Back</span></AnimatedButton>
            )}

            {step === 1 ? (
                <AnimatedButton variant="primary" onClick={() => setStep(2)} disabled={!projectSetup.name.trim()} icon={<FaArrowRight />} className="px-8 shadow-emerald-500/20"><span className="hidden sm:inline">Next</span></AnimatedButton>
            ) : (
                <AnimatedButton variant="primary" onClick={handleFinish} disabled={!projectSetup.name.trim()} icon={<FaCheck />} className="px-8 shadow-emerald-500/20">
                    <span className="hidden sm:inline">{isEditMode ? 'Save Changes' : 'Finish & Create'}</span>
                </AnimatedButton>
            )}
        </div>
    </AnimatedModal>
  );
};

export default OnboardingFlow;
