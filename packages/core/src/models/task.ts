export type TaskStatus = 'queued' | 'running' | 'waiting_input' | 'completed' | 'failed' | 'cancelled';

export interface Task {
  id: string;
  roleId: string;
  prompt: string;
  status: TaskStatus;
  summary: string;
  createdAt: number;
  updatedAt: number;
  completedAt: number | null;
}

export interface TaskLog {
  id: string;
  taskId: string;
  content: string;
  timestamp: number;
  type: 'stdout' | 'stderr' | 'system';
}
