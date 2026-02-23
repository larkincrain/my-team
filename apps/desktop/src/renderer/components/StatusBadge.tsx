import React from 'react';
import type { TaskStatus } from '@my-team/core';

interface StatusBadgeProps {
  status: TaskStatus;
}

const statusConfig: Record<TaskStatus, { label: string; className: string }> = {
  queued: { label: 'Queued', className: 'bg-gray-700 text-gray-300' },
  running: { label: 'Running', className: 'bg-blue-900 text-blue-300 animate-pulse' },
  waiting_input: { label: 'Waiting', className: 'bg-yellow-900 text-yellow-300' },
  completed: { label: 'Done', className: 'bg-green-900 text-green-300' },
  failed: { label: 'Failed', className: 'bg-red-900 text-red-300' },
  cancelled: { label: 'Cancelled', className: 'bg-gray-700 text-gray-400' },
};

export default function StatusBadge({ status }: StatusBadgeProps) {
  const config = statusConfig[status];
  return (
    <span className={`text-xs font-medium px-2 py-0.5 rounded-full whitespace-nowrap ${config.className}`}>
      {config.label}
    </span>
  );
}
