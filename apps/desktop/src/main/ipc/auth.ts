import { ipcMain } from 'electron';
import { signIn, signOut, getCurrentUser } from '../auth/google-oauth';

export function registerAuthHandlers(): void {
  ipcMain.handle('auth:signIn', () => signIn());
  ipcMain.handle('auth:signOut', () => signOut());
  ipcMain.handle('auth:getCurrentUser', () => getCurrentUser());
}
