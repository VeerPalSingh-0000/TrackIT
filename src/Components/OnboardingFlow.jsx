import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import AnimatedModal from './ui/AnimatedModal';
import AnimatedButton from './ui/AnimatedButton';
import { FaArrowRight, FaArrowLeft, FaPlus, FaTrash, FaCheck, FaBookmark, FaFolderOpen } from 'react-icons/fa';

const stepVariants = {
  hidden: { opacity: 0, x: 50 },
  visible: { opacity: 1, x: 0, transition: { type: 'spring', stiffness: 200, damping: 25 } },
  exit: { opacity: 0, x: -50, transition: { duration: 0.2 } },
};

const listContainerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.1 }
    }
};

const listItemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
    exit: { opacity: 0, x: -20 }
};


const OnboardingFlow = ({ onFinish, onCancel }) => {
  const [step, setStep] = useState(1);
  const [projectSetup, setProjectSetup] = useState({ name: "", description: "", topics: [] });
  const [currentTopic, setCurrentTopic] = useState({ name: "", subTopics: [] });
  const [currentSubTopicName, setCurrentSubTopicName] = useState("");

  const addSubTopic = () => {
    if (!currentSubTopicName.trim()) return;
    setCurrentTopic(prev => ({
      ...prev,
      subTopics: [...prev.subTopics, { id: `sub_${Date.now()}`, name: currentSubTopicName.trim() }],
    }));
    setCurrentSubTopicName("");
  };

  const removeSubTopic = (subTopicId) => {
    setCurrentTopic(prev => ({
        ...prev,
        subTopics: prev.subTopics.filter(st => st.id !== subTopicId)
    }));
  }

  const addTopic = () => {
    if (!currentTopic.name.trim()) return;
    setProjectSetup(prev => ({
      ...prev,
      topics: [...prev.topics, { id: `topic_${Date.now()}`, ...currentTopic }],
    }));
    setCurrentTopic({ name: "", subTopics: [] });
  };

  const removeTopic = (topicId) => {
    setProjectSetup(prev => ({
        ...prev,
        topics: prev.topics.filter(t => t.id !== topicId)
    }));
  }
  
  const handleFinish = () => {
    const finalProjectData = {
      name: projectSetup.name.trim(),
      description: projectSetup.description.trim(),
      subProjects: projectSetup.topics.map(t => ({...t})),
    };
    onFinish(finalProjectData);
  };

  const handleKeyPress = (e, action) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      action();
    }
  }

  return (
    // The AnimatedModal already provides the main flex container and height constraints
    <AnimatedModal onClose={onCancel}>
        {/* Header: No longer needs to be inside a separate div */}
        <div className="p-4 sm:p-6 border-b border-slate-700 flex-shrink-0">
          <h2 className="text-xl sm:text-2xl font-bold text-white text-center">Create New Project</h2>
          <div className="w-full bg-slate-700 rounded-full h-2.5 mt-4">
            <motion.div
              className="bg-indigo-500 h-2.5 rounded-full"
              initial={{ width: '0%' }}
              animate={{ width: step === 1 ? '50%' : '100%' }}
              transition={{ type: 'spring', stiffness: 100 }}
            />
          </div>
        </div>

        {/* Content: This area will now correctly become scrollable */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div key="step1" variants={stepVariants} initial="hidden" animate="visible" exit="exit">
                <h3 className="text-lg sm:text-xl font-semibold text-center text-indigo-300 mb-6">Project Details</h3>
                <div className="space-y-6">
                  <input
                    type="text"
                    placeholder="Project Name (e.g., Learn React)"
                    value={projectSetup.name}
                    onChange={(e) => setProjectSetup({ ...projectSetup, name: e.target.value })}
                    className="w-full p-3 sm:p-4 rounded-xl text-base sm:text-lg bg-slate-700 border-2 border-slate-600 text-white focus:border-indigo-500 outline-none transition"
                  />
                  <textarea
                    placeholder="Project Description (Optional)"
                    value={projectSetup.description}
                    onChange={(e) => setProjectSetup({ ...projectSetup, description: e.target.value })}
                    className="w-full p-3 sm:p-4 rounded-xl text-base sm:text-lg bg-slate-700 border-2 border-slate-600 text-white h-24 resize-none focus:border-purple-500 outline-none transition"
                  />
                </div>
              </motion.div>
            )}
            
            {step === 2 && (
               <motion.div key="step2" variants={stepVariants} initial="hidden" animate="visible" exit="exit">
                 <h3 className="text-lg sm:text-xl font-semibold text-center text-indigo-300 mb-6">Add Topics & Sub-Topics (Optional)</h3>
                 <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                   {/* Input Column */}
                   <div className="bg-slate-900/50 p-4 sm:p-6 rounded-2xl space-y-4">
                      <h3 className="font-bold text-lg sm:text-xl text-white">Add New Topic</h3>
                      <input
                        type="text"
                        placeholder="Topic Name (e.g., Hooks)"
                        value={currentTopic.name}
                        onChange={(e) => setCurrentTopic({ ...currentTopic, name: e.target.value })}
                        className="w-full p-3 rounded-lg bg-slate-800 border border-slate-600 text-white focus:border-purple-500 outline-none"
                      />

                      <div className="bg-slate-800/50 p-4 rounded-lg">
                        <h4 className="text-sm font-bold text-gray-300 mb-3">Add Sub-Topics</h4>
                        <div className="flex gap-2 mb-3">
                          <input
                            type="text"
                            placeholder="Sub-Topic Name (e.g., useState)"
                            value={currentSubTopicName}
                            onChange={(e) => setCurrentSubTopicName(e.target.value)}
                            onKeyPress={(e) => handleKeyPress(e, addSubTopic)}
                            className="flex-1 p-2 rounded bg-slate-900 border border-slate-700 text-white focus:border-emerald-500 outline-none"
                          />
                          <button onClick={addSubTopic} disabled={!currentSubTopicName.trim()} className="px-4 py-2 bg-emerald-600 text-white rounded hover:bg-emerald-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"><FaPlus /></button>
                        </div>
                        <AnimatePresence>
                        {currentTopic.subTopics.length > 0 && (
                          <motion.div layout className="space-y-2 max-h-32 overflow-y-auto p-1">
                            {currentTopic.subTopics.map((st) => (
                              <motion.div layout key={st.id} variants={listItemVariants} initial="hidden" animate="visible" exit="exit" className="flex items-center justify-between bg-slate-900/50 p-2 rounded">
                                <span className="text-sm text-gray-300"> • {st.name}</span>
                                <button onClick={() => removeSubTopic(st.id)} className="text-rose-400 hover:text-rose-300 p-1"><FaTrash className="text-xs" /></button>
                              </motion.div>
                            ))}
                          </motion.div>
                        )}
                        </AnimatePresence>
                      </div>
                      <AnimatedButton onClick={addTopic} disabled={!currentTopic.name.trim()} className="w-full bg-purple-600 hover:bg-purple-500 text-white" icon={<FaPlus />}>Add Topic</AnimatedButton>
                   </div>
                   
                   <div className="bg-slate-900/50 p-4 sm:p-6 rounded-2xl flex flex-col min-h-[300px]">
                     <h3 className="font-bold text-lg sm:text-xl text-white mb-4 flex-shrink-0">Project Structure</h3>
                     <div className="space-y-3 flex-grow overflow-y-auto p-1">
                        {projectSetup.topics.length === 0 && (
                            <div className="flex flex-col items-center justify-center h-full text-slate-500">
                                <FaFolderOpen className="text-4xl mb-4"/>
                                <p>Your topics will appear here.</p>
                            </div>
                        )}
                        <AnimatePresence>
                        {projectSetup.topics.map((t) => (
                          <motion.div layout key={t.id} variants={listItemVariants} initial="hidden" animate="visible" exit="exit" className="bg-slate-800 p-3 rounded-lg">
                            <div className="flex items-center justify-between mb-2">
                                <p className="font-semibold text-purple-300 flex items-center gap-2"><FaBookmark />{t.name}</p>
                                <button onClick={() => removeTopic(t.id)} className="text-rose-400 hover:text-rose-300 p-1"><FaTrash className="text-xs" /></button>
                            </div>
                            {t.subTopics.length > 0 && (
                                <div className="pl-4 space-y-1 border-l-2 border-slate-700 ml-2">
                                    {t.subTopics.map((st) => (
                                        <p key={st.id} className="text-xs text-gray-400 flex items-center gap-2 pt-1"><FaCheck className="text-emerald-400" />{st.name}</p>
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

        {/* Footer: No longer needs to be inside a separate div */}
        <div className="p-4 sm:p-6 border-t border-slate-700 flex justify-between items-center flex-shrink-0">
            {step === 1 ? (
                <AnimatedButton onClick={onCancel} className="bg-slate-600 hover:bg-slate-500 text-white">Cancel</AnimatedButton>
            ) : (
                <AnimatedButton onClick={() => setStep(1)} className="bg-slate-600 hover:bg-slate-500 text-white" icon={<FaArrowLeft />}>Back</AnimatedButton>
            )}

            {step === 1 ? (
                <AnimatedButton onClick={() => setStep(2)} disabled={!projectSetup.name.trim()} className="bg-indigo-600 hover:bg-indigo-500 text-white" icon={<FaArrowRight />}>Next</AnimatedButton>
            ) : (
                <AnimatedButton onClick={handleFinish} disabled={!projectSetup.name.trim()} className="bg-emerald-600 hover:bg-emerald-500 text-white" icon={<FaCheck />}>Finish & Create</AnimatedButton>
            )}
        </div>
    </AnimatedModal>
  );
};

export default OnboardingFlow;
