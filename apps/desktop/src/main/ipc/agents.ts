import { ipcMain } from 'electron';
import { AgentRuntimeStore } from '@my-team/core';
import type Database from 'better-sqlite3';

export function registerAgentHandlers(db: Database.Database): void {
  const store = new AgentRuntimeStore(db);

  ipcMain.handle('agents:getAll', () => store.getAll());
  ipcMain.handle('agents:create', (_event, data) => store.create(data));
  ipcMain.handle('agents:delete', (_event, id: string) => store.delete(id));
}
