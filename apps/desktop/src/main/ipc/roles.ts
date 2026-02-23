import { ipcMain } from 'electron';
import { RoleStore } from '@my-team/core';
import type Database from 'better-sqlite3';

export function registerRoleHandlers(db: Database.Database): void {
  const store = new RoleStore(db);

  ipcMain.handle('roles:getAll', () => store.getAll());
  ipcMain.handle('roles:create', (_event, data) => store.create(data));
  ipcMain.handle('roles:update', (_event, id: string, data) => store.update(id, data));
  ipcMain.handle('roles:delete', (_event, id: string) => store.delete(id));
}
