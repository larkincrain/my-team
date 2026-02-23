import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('myTeamAPI', {
  getRoles: () => ipcRenderer.invoke('roles:getAll'),
  createRole: (data: unknown) => ipcRenderer.invoke('roles:create', data),
  updateRole: (id: string, data: unknown) => ipcRenderer.invoke('roles:update', id, data),
  deleteRole: (id: string) => ipcRenderer.invoke('roles:delete', id),

  getAgentRuntimes: () => ipcRenderer.invoke('agents:getAll'),
  createAgentRuntime: (data: unknown) => ipcRenderer.invoke('agents:create', data),
  deleteAgentRuntime: (id: string) => ipcRenderer.invoke('agents:delete', id),

  getTasks: (roleId?: string) => ipcRenderer.invoke('tasks:getAll', roleId),
  createTask: (data: unknown) => ipcRenderer.invoke('tasks:create', data),

  startTask: (taskId: string) => ipcRenderer.invoke('tasks:start', taskId),
  stopTask: (taskId: string) => ipcRenderer.invoke('tasks:stop', taskId),
  sendTaskInput: (taskId: string, input: string) =>
    ipcRenderer.invoke('tasks:sendInput', taskId, input),
  getTaskLogs: (taskId: string) => ipcRenderer.invoke('tasks:getLogs', taskId),

  onTaskEvent: (callback: (taskId: string, event: unknown) => void) => {
    const handler = (_: unknown, taskId: string, event: unknown) => callback(taskId, event);
    ipcRenderer.on('task:event', handler);
    return () => ipcRenderer.removeListener('task:event', handler);
  },
  onTaskStatusChange: (callback: (taskId: string, status: string) => void) => {
    const handler = (_: unknown, taskId: string, status: string) => callback(taskId, status);
    ipcRenderer.on('task:statusChange', handler);
    return () => ipcRenderer.removeListener('task:statusChange', handler);
  },

  signInWithGoogle: () => ipcRenderer.invoke('auth:signIn'),
  signOut: () => ipcRenderer.invoke('auth:signOut'),
  getCurrentUser: () => ipcRenderer.invoke('auth:getCurrentUser'),
});
