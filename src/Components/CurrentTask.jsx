import React from 'react';

const CurrentTask = React.memo(({ project, topic, subTopic }) => {
    const parts = [];
    if (project) parts.push(project.name);
    if (topic) parts.push(topic.name);
    if (subTopic) parts.push(subTopic.name);
    const taskName = parts.length > 0 ? parts.join(' › ') : 'No Task Selected';

    return (
        <div className="p-4 rounded-2xl bg-[var(--color-slate-900)]/40 backdrop-blur-sm border border-[var(--color-slate-700)]/40 w-full transition-colors">
            <h3 className="text-[11px] font-semibold text-[var(--color-emerald-400)] uppercase tracking-[0.15em] mb-1.5 opacity-80">Current Task</h3>
            <p className="text-base sm:text-lg font-semibold text-[var(--color-white)] truncate" title={taskName}>{taskName}</p>
        </div>
    );
});

export default CurrentTask;