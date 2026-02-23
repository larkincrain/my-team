import { app, BrowserWindow } from 'electron';
import path from 'path';
import { initDb } from '@my-team/core';
import { registerRoleHandlers } from './ipc/roles';
import { registerTaskHandlers } from './ipc/tasks';
import { registerAgentHandlers } from './ipc/agents';
import { registerAuthHandlers } from './ipc/auth';
import { AgentRunner } from './agent-runner';

const isDev = process.env.NODE_ENV === 'development';
let mainWindow: BrowserWindow | null = null;

const dbPath = isDev
  ? path.join(app.getPath('userData'), 'myteam-dev.db')
  : path.join(app.getPath('userData'), 'myteam.db');

const db = initDb(dbPath);
const agentRunner = new AgentRunner(db);

function createWindow(): void {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  if (isDev) {
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  registerRoleHandlers(db);
  registerTaskHandlers(db, agentRunner, () => mainWindow);
  registerAgentHandlers(db);
  registerAuthHandlers();
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
