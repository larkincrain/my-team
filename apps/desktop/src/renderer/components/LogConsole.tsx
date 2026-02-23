import React, { useEffect, useRef } from 'react';
import type { TaskLog } from '@my-team/core';

interface LogConsoleProps {
  logs: TaskLog[];
}

function getLogColor(type: TaskLog['type']): string {
  switch (type) {
    case 'stderr': return 'text-red-400';
    case 'system': return 'text-yellow-400';
    default: return 'text-gray-100';
  }
}

export default function LogConsole({ logs }: LogConsoleProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  return (
    <div className="flex-1 bg-gray-950 rounded-lg border border-gray-700 p-4 font-mono text-sm overflow-y-auto min-h-48 max-h-96">
      {logs.length === 0 ? (
        <span className="text-gray-600">No logs yet...</span>
      ) : (
        logs.map((log, i) => (
          <div key={log.id} className={`mb-0.5 ${getLogColor(log.type)}`}>
            <span className="text-gray-600 mr-2 select-none">
              {new Date(log.timestamp).toLocaleTimeString()}
            </span>
            {log.content}
          </div>
        ))
      )}
      <div ref={bottomRef} />
    </div>
  );
}
