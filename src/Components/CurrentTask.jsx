import React from "react";

const CurrentTask = React.memo(({ project, topic, subTopic }) => {
  const parts = [];

  // Build hierarchical task name
  if (project && project.name) {
    parts.push(project.name);
  }
  if (topic && topic.name) {
    parts.push(topic.name);
  }
  if (subTopic && subTopic.name) {
    parts.push(subTopic.name);
  }

  const taskName = parts.length > 0 ? parts.join(" › ") : "No Task Selected";

  return (
    <div className="px-5 py-3.5 rounded-2xl glass-card-elevated w-full transition-all duration-300 mx-auto max-w-sm">
      <h3 className="text-[10px] font-bold text-[var(--color-emerald-400)] uppercase tracking-widest mb-1 opacity-90 flex items-center justify-center gap-1.5">
        <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-emerald-400)] animate-pulse"></span>
        Current Task
      </h3>
      <p
        className="text-base sm:text-lg font-medium text-white truncate px-2"
        title={taskName}
      >
        {taskName}
      </p>
    </div>
  );
});

export default CurrentTask;
