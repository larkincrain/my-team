import type { Role, Task, TaskLog, AgentRuntime, TaskStatus, AgentSessionEvent } from '@my-team/core';

interface MyTeamAPI {
  getRoles(): Promise<Role[]>;
  createRole(data: Omit<Role, 'id' | 'createdAt' | 'updatedAt'>): Promise<Role>;
  updateRole(id: string, data: Partial<Role>): Promise<Role>;
  deleteRole(id: string): Promise<void>;
  getAgentRuntimes(): Promise<AgentRuntime[]>;
  createAgentRuntime(data: Omit<AgentRuntime, 'id' | 'createdAt'>): Promise<AgentRuntime>;
  deleteAgentRuntime(id: string): Promise<void>;
  getTasks(roleId?: string): Promise<Task[]>;
  createTask(data: Pick<Task, 'roleId' | 'prompt'>): Promise<Task>;
  startTask(taskId: string): Promise<void>;
  stopTask(taskId: string): Promise<void>;
  sendTaskInput(taskId: string, input: string): Promise<void>;
  getTaskLogs(taskId: string): Promise<TaskLog[]>;
  onTaskEvent(callback: (taskId: string, event: AgentSessionEvent) => void): () => void;
  onTaskStatusChange(callback: (taskId: string, status: TaskStatus) => void): () => void;
  signInWithGoogle(): Promise<{ user: { email: string; name: string; picture: string } }>;
  signOut(): Promise<void>;
  getCurrentUser(): Promise<{ email: string; name: string; picture: string } | null>;
}

declare global {
  interface Window {
    myTeamAPI: MyTeamAPI;
  }
}

export {};
