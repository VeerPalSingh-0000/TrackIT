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
        <div className="p-4 sm:p-6 border-b border-slate-700 flex-shrink-0">
          <h2 className="text-xl sm:text-2xl font-bold text-white text-center">
            {isEditMode ? 'Edit Project' : 'Create New Project'}
          </h2>
          <div className="w-full bg-slate-700 rounded-full h-2.5 mt-4">
            <motion.div
              className="bg-indigo-500 h-2.5 rounded-full"
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
                <h3 className="text-lg sm:text-xl font-semibold text-center text-indigo-300 mb-6">Edit Topics & Sub-Topics</h3>
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
                      <div className="flex flex-col sm:flex-row gap-2 mb-3">
                        <input
                          type="text"
                          placeholder="Sub-Topic Name (e.g., useState)"
                          value={currentSubTopicName}
                          onChange={(e) => setCurrentSubTopicName(e.target.value)}
                          onKeyPress={(e) => handleKeyPress(e, addSubTopic)}
                          className="w-full px-3 py-2 rounded bg-slate-900 border border-slate-700 text-white focus:border-emerald-500 outline-none text-sm sm:text-base"
                        />
                        <button onClick={addSubTopic} disabled={!currentSubTopicName.trim()} className="w-full sm:w-auto px-3 sm:px-4 py-2 bg-emerald-600 text-white rounded hover:bg-emerald-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                          <FaPlus />
                          <span className="sm:hidden">Add Sub-Topic</span>
                        </button>
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
                  
                  {/* Display Column */}
                  <div className="bg-slate-900/50 p-4 sm:p-6 rounded-2xl flex flex-col min-h-[300px]">
                    <h3 className="font-bold text-lg sm:text-xl text-white mb-4 flex-shrink-0">Project Structure</h3>
                    <div className="space-y-3 flex-grow overflow-y-auto p-1">
                      {projectSetup.topics.length === 0 && (
                        <div className="flex flex-col items-center justify-center h-full text-slate-500">
                          <FaFolderOpen className="text-3xl sm:text-4xl mb-4"/>
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

        {/* Footer: Navigation buttons */}
        <div className="p-4 sm:p-6 border-t border-slate-700 flex justify-between items-center flex-shrink-0">
            {step === 1 ? (
                <AnimatedButton onClick={onCancel} className="bg-slate-600 hover:bg-slate-500 text-white">Cancel</AnimatedButton>
            ) : (
                <AnimatedButton onClick={() => setStep(1)} className="bg-slate-600 hover:bg-slate-500 text-white p-3 sm:px-4 sm:py-2" icon={<FaArrowLeft />}><span className="hidden sm:inline ml-2">Back</span></AnimatedButton>
            )}

            {step === 1 ? (
                <AnimatedButton onClick={() => setStep(2)} disabled={!projectSetup.name.trim()} className="bg-indigo-600 hover:bg-indigo-500 text-white p-3 sm:px-4 sm:py-2" icon={<FaArrowRight />}><span className="hidden sm:inline ml-2">Next</span></AnimatedButton>
            ) : (
                <AnimatedButton onClick={handleFinish} disabled={!projectSetup.name.trim()} className="bg-emerald-600 hover:bg-emerald-500 text-white p-3 sm:px-4 sm:py-2" icon={<FaCheck />}>
                    <span className="hidden sm:inline ml-2">{isEditMode ? 'Save Changes' : 'Finish & Create'}</span>
                </AnimatedButton>
            )}
        </div>
    </AnimatedModal>
  );
};

export default OnboardingFlow;
