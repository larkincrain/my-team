import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { initDb, RoleStore, TaskStore } from '../db/database';
import type Database from 'better-sqlite3';

describe('TaskStore', () => {
  let db: Database.Database;
  let roleStore: RoleStore;
  let taskStore: TaskStore;
  let roleId: string;

  beforeEach(() => {
    db = initDb(':memory:');
    roleStore = new RoleStore(db);
    taskStore = new TaskStore(db);
    const role = roleStore.create({ name: 'Role', description: '', instructions: '', context: '', compiledMemory: '', agentRuntimeId: null });
    roleId = role.id;
  });

  afterEach(() => {
    db.close();
  });

  it('creates a task', () => {
    const task = taskStore.create({ roleId, prompt: 'Do something' });
    expect(task.id).toBeTruthy();
    expect(task.prompt).toBe('Do something');
    expect(task.status).toBe('queued');
  });

  it('reads all tasks for role', () => {
    taskStore.create({ roleId, prompt: 'Task 1' });
    taskStore.create({ roleId, prompt: 'Task 2' });
    expect(taskStore.getAll(roleId)).toHaveLength(2);
  });

  it('updates a task status', () => {
    const task = taskStore.create({ roleId, prompt: 'Run' });
    const updated = taskStore.update(task.id, { status: 'running' });
    expect(updated.status).toBe('running');
  });

  it('adds and retrieves logs', () => {
    const task = taskStore.create({ roleId, prompt: 'Log test' });
    taskStore.addLog(task.id, { id: 'log1', taskId: task.id, content: 'hello', timestamp: Date.now(), type: 'stdout' });
    const logs = taskStore.getLogs(task.id);
    expect(logs).toHaveLength(1);
    expect(logs[0].content).toBe('hello');
  });
});
