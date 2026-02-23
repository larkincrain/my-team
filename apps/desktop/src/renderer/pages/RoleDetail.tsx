import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppStore } from '../store';
import TaskCard from '../components/TaskCard';

type TabType = 'tasks' | 'instructions' | 'memory';

export default function RoleDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { roles, tasks, loadTasks, updateRole } = useAppStore();
  const role = roles.find((r) => r.id === id);
  const [activeTab, setActiveTab] = useState<TabType>('tasks');
  const [instructions, setInstructions] = useState('');
  const [context, setContext] = useState('');
  const [saving, setSaving] = useState(false);
  const [showNewTask, setShowNewTask] = useState(false);
  const [taskPrompt, setTaskPrompt] = useState('');

  useEffect(() => {
    if (id) loadTasks(id);
  }, [id]);

  useEffect(() => {
    if (role) {
      setInstructions(role.instructions);
      setContext(role.context);
    }
  }, [role]);

  if (!role) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900 text-gray-400">
        Role not found.{' '}
        <button onClick={() => navigate('/')} className="text-indigo-400 ml-2">
          Go back
        </button>
      </div>
    );
  }

  const roleTasks = tasks.filter((t) => t.roleId === id);

  const handleSaveInstructions = async () => {
    setSaving(true);
    await updateRole(role.id, { instructions, context });
    setSaving(false);
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskPrompt.trim()) return;
    const task = await window.myTeamAPI.createTask({ roleId: role.id, prompt: taskPrompt });
    useAppStore.getState().loadTasks(role.id);
    setTaskPrompt('');
    setShowNewTask(false);
    navigate(`/tasks/${task.id}`);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <header className="bg-gray-800 border-b border-gray-700 px-6 py-4 flex items-center gap-4">
        <button
          onClick={() => navigate('/')}
          className="text-gray-400 hover:text-white transition-colors"
        >
          ← Back
        </button>
        <div>
          <h1 className="text-xl font-bold">{role.name}</h1>
          {role.description && (
            <p className="text-gray-400 text-sm">{role.description}</p>
          )}
        </div>
      </header>

      <div className="max-w-5xl mx-auto p-6">
        {/* Tabs */}
        {(() => {
          const tabLabels: Record<TabType, string> = {
            tasks: 'Tasks',
            instructions: 'Instructions & Context',
            memory: 'Memory',
          };
          return (
            <div className="flex gap-1 mb-6 bg-gray-800 rounded-lg p-1 w-fit">
              {(['tasks', 'instructions', 'memory'] as TabType[]).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    activeTab === tab
                      ? 'bg-indigo-600 text-white'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  {tabLabels[tab]}
                </button>
              ))}
            </div>
          );
        })()}

        {/* Tasks Tab */}
        {activeTab === 'tasks' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-300">Tasks</h2>
              <button
                onClick={() => setShowNewTask(true)}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
              >
                + New Task
              </button>
            </div>

            {roleTasks.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <p>No tasks yet. Create one to get started.</p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {roleTasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onClick={() => navigate(`/tasks/${task.id}`)}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Instructions Tab */}
        {activeTab === 'instructions' && (
          <div className="flex flex-col gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Instructions</label>
              <textarea
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 h-40 resize-y"
                placeholder="System-level guidelines for this role..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Context</label>
              <textarea
                value={context}
                onChange={(e) => setContext(e.target.value)}
                className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 h-40 resize-y"
                placeholder="Pinned knowledge and notes for this role..."
              />
            </div>
            <button
              onClick={handleSaveInstructions}
              disabled={saving}
              className="self-start bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white px-6 py-2 rounded-lg text-sm font-medium"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        )}

        {/* Memory Tab */}
        {activeTab === 'memory' && (
          <div>
            <h2 className="text-lg font-semibold text-gray-300 mb-3">Compiled Memory</h2>
            {role.compiledMemory ? (
              <div className="bg-gray-800 rounded-lg p-4 font-mono text-sm text-gray-300 whitespace-pre-wrap">
                {role.compiledMemory}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <p>No compiled memory yet. Complete tasks to build role memory.</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* New Task Modal */}
      {showNewTask && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-xl shadow-2xl w-full max-w-lg">
            <div className="px-6 py-4 border-b border-gray-700 flex items-center justify-between">
              <h3 className="text-lg font-semibold">New Task</h3>
              <button onClick={() => setShowNewTask(false)} className="text-gray-400 hover:text-white">
                ✕
              </button>
            </div>
            <form onSubmit={handleCreateTask} className="p-6 flex flex-col gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Task Prompt *</label>
                <textarea
                  value={taskPrompt}
                  onChange={(e) => setTaskPrompt(e.target.value)}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 h-28 resize-none"
                  placeholder="Describe what you want this agent to do..."
                  required
                  autoFocus
                />
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowNewTask(false)}
                  className="flex-1 bg-gray-700 hover:bg-gray-600 text-white rounded-lg px-4 py-2 text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg px-4 py-2 text-sm font-medium"
                >
                  Create Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
