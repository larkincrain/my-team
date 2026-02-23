import React, { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppStore } from '../store';
import LogConsole from '../components/LogConsole';
import StatusBadge from '../components/StatusBadge';
import InputPrompt from '../components/InputPrompt';

export default function TaskDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { tasks, taskLogs, loadTaskLogs, startTask, stopTask } = useAppStore();
  const task = tasks.find((t) => t.id === id);
  const logs = id ? (taskLogs[id] ?? []) : [];
  const lastSystemMessage = useMemo(
    () => logs.filter((l) => l.type === 'system').slice(-1)[0]?.content ?? 'Input required',
    [logs],
  );
  const [starting, setStarting] = useState(false);

  useEffect(() => {
    if (id) loadTaskLogs(id);
  }, [id]);

  if (!task) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900 text-gray-400">
        Task not found.{' '}
        <button onClick={() => navigate(-1)} className="text-indigo-400 ml-2">
          Go back
        </button>
      </div>
    );
  }

  const handleStart = async () => {
    setStarting(true);
    try {
      await startTask(task.id);
    } finally {
      setStarting(false);
    }
  };

  const handleStop = async () => {
    await stopTask(task.id);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col">
      <header className="bg-gray-800 border-b border-gray-700 px-6 py-4 flex items-center gap-4">
        <button
          onClick={() => navigate(-1)}
          className="text-gray-400 hover:text-white transition-colors"
        >
          ← Back
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3">
            <h1 className="text-lg font-semibold truncate">{task.prompt}</h1>
            <StatusBadge status={task.status} />
          </div>
          <p className="text-gray-400 text-xs mt-0.5">
            Created {new Date(task.createdAt).toLocaleString()}
          </p>
        </div>
        <div className="flex gap-2">
          {task.status === 'queued' && (
            <button
              onClick={handleStart}
              disabled={starting}
              className="bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg text-sm font-medium"
            >
              {starting ? 'Starting...' : '▶ Start'}
            </button>
          )}
          {(task.status === 'running' || task.status === 'waiting_input') && (
            <button
              onClick={handleStop}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
            >
              ■ Stop
            </button>
          )}
        </div>
      </header>

      <div className="flex-1 p-6 flex flex-col gap-4 max-w-5xl mx-auto w-full">
        {/* Summary */}
        {task.summary && (
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-600">
            <h3 className="text-sm font-medium text-gray-300 mb-1">Summary</h3>
            <p className="text-gray-100">{task.summary}</p>
          </div>
        )}

        {/* Log Console */}
        <div className="flex-1 flex flex-col min-h-0">
          <h3 className="text-sm font-medium text-gray-300 mb-2">Execution Logs</h3>
          <LogConsole logs={logs} />
        </div>

        {/* Input Prompt */}
        {task.status === 'waiting_input' && (
          <InputPrompt
            taskId={task.id}
            message={lastSystemMessage}
          />
        )}
      </div>
    </div>
  );
}
