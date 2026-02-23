import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../store';
import RoleCard from '../components/RoleCard';
import TaskCard from '../components/TaskCard';

interface CreateRoleForm {
  name: string;
  description: string;
  instructions: string;
  context: string;
}

export default function Dashboard() {
  const { user, roles, tasks, loadRoles, loadTasks, createRole, setUser } = useAppStore();
  const navigate = useNavigate();
  const [showCreateRole, setShowCreateRole] = useState(false);
  const [form, setForm] = useState<CreateRoleForm>({
    name: '',
    description: '',
    instructions: '',
    context: '',
  });

  useEffect(() => {
    loadRoles();
    loadTasks();
  }, []);

  const activeTasks = tasks.filter(
    (t) => t.status === 'running' || t.status === 'waiting_input',
  );

  const handleCreateRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    await createRole({
      name: form.name,
      description: form.description,
      instructions: form.instructions,
      context: form.context,
      compiledMemory: '',
      agentRuntimeId: null,
    });
    setForm({ name: '', description: '', instructions: '', context: '' });
    setShowCreateRole(false);
  };

  const handleSignOut = async () => {
    await window.myTeamAPI.signOut();
    setUser(null);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-lg">🤖</div>
          <h1 className="text-xl font-bold">My Team</h1>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-gray-400 text-sm">{user?.name}</span>
          <button
            onClick={handleSignOut}
            className="text-gray-400 hover:text-white text-sm transition-colors"
          >
            Sign out
          </button>
        </div>
      </header>

      <main className="p-6 max-w-7xl mx-auto">
        {/* Active Tasks */}
        {activeTasks.length > 0 && (
          <section className="mb-8">
            <h2 className="text-lg font-semibold text-gray-300 mb-3">Active Tasks</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {activeTasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onClick={() => navigate(`/tasks/${task.id}`)}
                />
              ))}
            </div>
          </section>
        )}

        {/* Roles */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-300">Roles</h2>
            <button
              onClick={() => setShowCreateRole(true)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              + New Role
            </button>
          </div>

          {roles.length === 0 ? (
            <div className="text-center py-16 text-gray-500">
              <div className="text-4xl mb-3">🤖</div>
              <p className="text-lg">No roles yet</p>
              <p className="text-sm mt-1">Create a role to get started</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {roles.map((role) => (
                <RoleCard
                  key={role.id}
                  role={role}
                  activeTaskCount={tasks.filter(
                    (t) =>
                      t.roleId === role.id &&
                      (t.status === 'running' || t.status === 'waiting_input'),
                  ).length}
                  onClick={() => navigate(`/roles/${role.id}`)}
                />
              ))}
            </div>
          )}
        </section>
      </main>

      {/* Create Role Modal */}
      {showCreateRole && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-xl shadow-2xl w-full max-w-lg">
            <div className="px-6 py-4 border-b border-gray-700 flex items-center justify-between">
              <h3 className="text-lg font-semibold">Create New Role</h3>
              <button
                onClick={() => setShowCreateRole(false)}
                className="text-gray-400 hover:text-white"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleCreateRole} className="p-6 flex flex-col gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Name *</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="e.g., Code Reviewer"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Description</label>
                <input
                  type="text"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Brief description of this role"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Instructions</label>
                <textarea
                  value={form.instructions}
                  onChange={(e) => setForm({ ...form, instructions: e.target.value })}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 h-24 resize-none"
                  placeholder="System-level instructions for this role"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateRole(false)}
                  className="flex-1 bg-gray-700 hover:bg-gray-600 text-white rounded-lg px-4 py-2 text-sm transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg px-4 py-2 text-sm font-medium transition-colors"
                >
                  Create Role
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
