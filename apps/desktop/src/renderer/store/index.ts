import { create } from 'zustand';
import type { Role, Task, TaskLog, AgentRuntime, TaskStatus } from '@my-team/core';

interface User {
  email: string;
  name: string;
  picture: string;
}

interface AppStore {
  user: User | null;
  roles: Role[];
  tasks: Task[];
  agentRuntimes: AgentRuntime[];
  taskLogs: Record<string, TaskLog[]>;

  setUser(user: User | null): void;
  loadRoles(): Promise<void>;
  createRole(data: Omit<Role, 'id' | 'createdAt' | 'updatedAt'>): Promise<void>;
  updateRole(id: string, data: Partial<Role>): Promise<void>;
  deleteRole(id: string): Promise<void>;
  loadTasks(roleId?: string): Promise<void>;
  createTask(data: Pick<Task, 'roleId' | 'prompt'>): Promise<Task>;
  loadAgentRuntimes(): Promise<void>;
  createAgentRuntime(data: Omit<AgentRuntime, 'id' | 'createdAt'>): Promise<void>;
  deleteAgentRuntime(id: string): Promise<void>;
  startTask(taskId: string): Promise<void>;
  stopTask(taskId: string): Promise<void>;
  sendTaskInput(taskId: string, input: string): Promise<void>;
  loadTaskLogs(taskId: string): Promise<void>;
  appendTaskLog(taskId: string, log: TaskLog): void;
  updateTaskStatus(taskId: string, status: TaskStatus): void;
}

export const useAppStore = create<AppStore>((set, get) => ({
  user: null,
  roles: [],
  tasks: [],
  agentRuntimes: [],
  taskLogs: {},

  setUser: (user) => set({ user }),

  loadRoles: async () => {
    const roles = await window.myTeamAPI.getRoles();
    set({ roles });
  },

  createRole: async (data) => {
    const role = await window.myTeamAPI.createRole(data);
    set((state) => ({ roles: [role, ...state.roles] }));
  },

  updateRole: async (id, data) => {
    const updated = await window.myTeamAPI.updateRole(id, data);
    set((state) => ({
      roles: state.roles.map((r) => (r.id === id ? updated : r)),
    }));
  },

  deleteRole: async (id) => {
    await window.myTeamAPI.deleteRole(id);
    set((state) => ({ roles: state.roles.filter((r) => r.id !== id) }));
  },

  loadTasks: async (roleId) => {
    const tasks = await window.myTeamAPI.getTasks(roleId);
    if (roleId) {
      set((state) => ({
        tasks: [
          ...state.tasks.filter((t) => t.roleId !== roleId),
          ...tasks,
        ],
      }));
    } else {
      set({ tasks });
    }
  },

  createTask: async (data) => {
    const task = await window.myTeamAPI.createTask(data);
    set((state) => ({ tasks: [task, ...state.tasks] }));
    return task;
  },

  loadAgentRuntimes: async () => {
    const agentRuntimes = await window.myTeamAPI.getAgentRuntimes();
    set({ agentRuntimes });
  },

  createAgentRuntime: async (data) => {
    const runtime = await window.myTeamAPI.createAgentRuntime(data);
    set((state) => ({ agentRuntimes: [runtime, ...state.agentRuntimes] }));
  },

  deleteAgentRuntime: async (id) => {
    await window.myTeamAPI.deleteAgentRuntime(id);
    set((state) => ({ agentRuntimes: state.agentRuntimes.filter((r) => r.id !== id) }));
  },

  startTask: async (taskId) => {
    await window.myTeamAPI.startTask(taskId);
    get().updateTaskStatus(taskId, 'running');
  },

  stopTask: async (taskId) => {
    await window.myTeamAPI.stopTask(taskId);
  },

  sendTaskInput: async (taskId, input) => {
    await window.myTeamAPI.sendTaskInput(taskId, input);
  },

  loadTaskLogs: async (taskId) => {
    const logs = await window.myTeamAPI.getTaskLogs(taskId);
    set((state) => ({ taskLogs: { ...state.taskLogs, [taskId]: logs } }));
  },

  appendTaskLog: (taskId, log) => {
    set((state) => ({
      taskLogs: {
        ...state.taskLogs,
        [taskId]: [...(state.taskLogs[taskId] ?? []), log],
      },
    }));
  },

  updateTaskStatus: (taskId, status) => {
    set((state) => ({
      tasks: state.tasks.map((t) =>
        t.id === taskId ? { ...t, status } : t,
      ),
    }));
  },
}));
