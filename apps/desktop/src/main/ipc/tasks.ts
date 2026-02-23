import { ipcMain, BrowserWindow } from 'electron';
import { TaskStore, RoleStore } from '@my-team/core';
import type { AgentRunner } from '../agent-runner';
import type Database from 'better-sqlite3';

export function registerTaskHandlers(
  db: Database.Database,
  agentRunner: AgentRunner,
  getWindow: () => BrowserWindow | null,
): void {
  const taskStore = new TaskStore(db);
  const roleStore = new RoleStore(db);

  ipcMain.handle('tasks:getAll', (_event, roleId?: string) => taskStore.getAll(roleId));
  ipcMain.handle('tasks:create', (_event, data) => taskStore.create(data));
  ipcMain.handle('tasks:getLogs', (_event, taskId: string) => taskStore.getLogs(taskId));

  ipcMain.handle('tasks:start', async (_event, taskId: string) => {
    const task = taskStore.getById(taskId);
    if (!task) throw new Error(`Task ${taskId} not found`);
    const role = roleStore.getById(task.roleId);
    if (!role) throw new Error(`Role ${task.roleId} not found`);
    const win = getWindow();
    agentRunner.startTask(task, role, win).catch((err: Error) => {
      taskStore.update(taskId, { status: 'failed' });
      win?.webContents.send('task:status', taskId, 'failed');
      console.error(`Task ${taskId} failed to start:`, err);
    });
  });

  ipcMain.handle('tasks:stop', async (_event, taskId: string) => {
    await agentRunner.stopTask(taskId);
  });

  ipcMain.handle('tasks:sendInput', async (_event, taskId: string, input: string) => {
    await agentRunner.sendInput(taskId, input);
  });
}
