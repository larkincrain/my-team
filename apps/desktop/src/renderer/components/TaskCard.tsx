import React from 'react';
import type { Task } from '@my-team/core';
import StatusBadge from './StatusBadge';

interface TaskCardProps {
  task: Task;
  onClick: () => void;
}

export default function TaskCard({ task, onClick }: TaskCardProps) {
  return (
    <div
      onClick={onClick}
      className="bg-gray-800 hover:bg-gray-750 border border-gray-700 hover:border-indigo-500 rounded-xl p-4 cursor-pointer transition-all"
    >
      <div className="flex items-start justify-between gap-3 mb-2">
        <p className="text-white text-sm font-medium line-clamp-2 flex-1">{task.prompt}</p>
        <StatusBadge status={task.status} />
      </div>
      {task.summary && (
        <p className="text-gray-400 text-xs line-clamp-1 mt-1">{task.summary}</p>
      )}
      <p className="text-gray-500 text-xs mt-2">{new Date(task.createdAt).toLocaleString()}</p>
    </div>
  );
}
