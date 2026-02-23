import type { BrowserWindow } from 'electron';
import {
  DummyAdapter,
  TaskStore,
  RoleStore,
  summarizeTaskLogs,
  updateCompiledMemory,
} from '@my-team/core';
import type { AgentAdapter } from '@my-team/core';
import type { Task, Role } from '@my-team/core';
import type Database from 'better-sqlite3';
import { v4 as uuidv4 } from 'uuid';

export class AgentRunner {
  private sessions = new Map<string, { adapter: AgentAdapter; stopped: boolean }>();
  private taskStore: TaskStore;
  private roleStore: RoleStore;

  constructor(private db: Database.Database) {
    this.taskStore = new TaskStore(db);
    this.roleStore = new RoleStore(db);
  }

  async startTask(
    task: Task,
    role: Role,
    mainWindow: BrowserWindow | null,
  ): Promise<void> {
    const adapter = new DummyAdapter();
    this.sessions.set(task.id, { adapter, stopped: false });

    this.taskStore.update(task.id, { status: 'running' });
    mainWindow?.webContents.send('task:statusChange', task.id, 'running');

    try {
      for await (const event of adapter.startSession(
        task.id,
        role.context,
        role.instructions,
        task.prompt,
      )) {
        const session = this.sessions.get(task.id);
        if (session?.stopped) break;

        mainWindow?.webContents.send('task:event', task.id, event);

        if (event.type === 'log' || event.type === 'needs_input') {
          this.taskStore.addLog(task.id, {
            id: uuidv4(),
            taskId: task.id,
            content: event.data,
            timestamp: event.timestamp,
            type: event.type === 'needs_input' ? 'system' : 'stdout',
          });
        }

        if (event.type === 'needs_input') {
          this.taskStore.update(task.id, { status: 'waiting_input' });
          mainWindow?.webContents.send('task:statusChange', task.id, 'waiting_input');
        }

        if (event.type === 'completed') {
          const logs = this.taskStore.getLogs(task.id);
          const summary = summarizeTaskLogs(logs, task.prompt);
          this.taskStore.update(task.id, {
            status: 'completed',
            summary,
            completedAt: Date.now(),
          });
          mainWindow?.webContents.send('task:statusChange', task.id, 'completed');

          const updatedRole = this.roleStore.getById(role.id);
          if (updatedRole) {
            const newMemory = updateCompiledMemory(
              updatedRole.compiledMemory,
              summary,
              task.prompt,
            );
            this.roleStore.update(role.id, { compiledMemory: newMemory });
          }
        }

        if (event.type === 'failed') {
          this.taskStore.update(task.id, { status: 'failed' });
          mainWindow?.webContents.send('task:statusChange', task.id, 'failed');
        }
      }
    } catch (err) {
      console.error('Agent runner error:', err);
      this.taskStore.addLog(task.id, {
        id: uuidv4(),
        taskId: task.id,
        content: `Error: ${err instanceof Error ? err.message : String(err)}`,
        timestamp: Date.now(),
        type: 'stderr',
      });
      this.taskStore.update(task.id, { status: 'failed' });
      mainWindow?.webContents.send('task:statusChange', task.id, 'failed');
    } finally {
      this.sessions.delete(task.id);
    }
  }

  async stopTask(taskId: string): Promise<void> {
    const session = this.sessions.get(taskId);
    if (session) {
      session.stopped = true;
      await session.adapter.stop(taskId);
    }
  }

  async sendInput(taskId: string, text: string): Promise<void> {
    const session = this.sessions.get(taskId);
    if (session) {
      await session.adapter.sendUserInput(taskId, text);
    }
  }
}
