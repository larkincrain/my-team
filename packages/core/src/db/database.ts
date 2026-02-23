import Database from 'better-sqlite3';
import { runMigrations } from './migrations';
import type { Role } from '../models/role';
import type { Task, TaskLog, TaskStatus } from '../models/task';
import type { AgentRuntime } from '../models/agent-runtime';
import { v4 as uuidv4 } from 'uuid';

export function initDb(dbPath: string): Database.Database {
  const db = new Database(dbPath);
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');
  runMigrations(db);
  return db;
}

function rowToRole(row: Record<string, unknown>): Role {
  return {
    id: row.id as string,
    name: row.name as string,
    description: row.description as string,
    instructions: row.instructions as string,
    context: row.context as string,
    compiledMemory: row.compiled_memory as string,
    agentRuntimeId: row.agent_runtime_id as string | null,
    createdAt: row.created_at as number,
    updatedAt: row.updated_at as number,
  };
}

function rowToTask(row: Record<string, unknown>): Task {
  return {
    id: row.id as string,
    roleId: row.role_id as string,
    prompt: row.prompt as string,
    status: row.status as TaskStatus,
    summary: row.summary as string,
    createdAt: row.created_at as number,
    updatedAt: row.updated_at as number,
    completedAt: row.completed_at as number | null,
  };
}

function rowToTaskLog(row: Record<string, unknown>): TaskLog {
  return {
    id: row.id as string,
    taskId: row.task_id as string,
    content: row.content as string,
    timestamp: row.timestamp as number,
    type: row.type as 'stdout' | 'stderr' | 'system',
  };
}

function rowToAgentRuntime(row: Record<string, unknown>): AgentRuntime {
  return {
    id: row.id as string,
    name: row.name as string,
    type: row.type as string,
    binaryPath: row.binary_path as string | null,
    config: row.config as string,
    createdAt: row.created_at as number,
  };
}

export class RoleStore {
  constructor(private db: Database.Database) {}

  getAll(): Role[] {
    const rows = this.db.prepare('SELECT * FROM roles ORDER BY created_at DESC').all();
    return rows.map((r) => rowToRole(r as Record<string, unknown>));
  }

  getById(id: string): Role | null {
    const row = this.db.prepare('SELECT * FROM roles WHERE id = ?').get(id);
    return row ? rowToRole(row as Record<string, unknown>) : null;
  }

  create(data: Omit<Role, 'id' | 'createdAt' | 'updatedAt'>): Role {
    const id = uuidv4();
    const now = Date.now();
    this.db
      .prepare(
        `INSERT INTO roles (id, name, description, instructions, context, compiled_memory, agent_runtime_id, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      )
      .run(
        id,
        data.name,
        data.description,
        data.instructions,
        data.context,
        data.compiledMemory,
        data.agentRuntimeId,
        now,
        now,
      );
    return this.getById(id)!;
  }

  update(id: string, data: Partial<Omit<Role, 'id' | 'createdAt'>>): Role {
    const existing = this.getById(id);
    if (!existing) throw new Error(`Role ${id} not found`);
    const now = Date.now();
    const updated = { ...existing, ...data, updatedAt: now };
    this.db
      .prepare(
        `UPDATE roles SET name=?, description=?, instructions=?, context=?, compiled_memory=?, agent_runtime_id=?, updated_at=? WHERE id=?`,
      )
      .run(
        updated.name,
        updated.description,
        updated.instructions,
        updated.context,
        updated.compiledMemory,
        updated.agentRuntimeId,
        now,
        id,
      );
    return this.getById(id)!;
  }

  delete(id: string): void {
    this.db.prepare('DELETE FROM roles WHERE id = ?').run(id);
  }
}

export class TaskStore {
  constructor(private db: Database.Database) {}

  getAll(roleId?: string): Task[] {
    if (roleId) {
      const rows = this.db
        .prepare('SELECT * FROM tasks WHERE role_id = ? ORDER BY created_at DESC')
        .all(roleId);
      return rows.map((r) => rowToTask(r as Record<string, unknown>));
    }
    const rows = this.db.prepare('SELECT * FROM tasks ORDER BY created_at DESC').all();
    return rows.map((r) => rowToTask(r as Record<string, unknown>));
  }

  getById(id: string): Task | null {
    const row = this.db.prepare('SELECT * FROM tasks WHERE id = ?').get(id);
    return row ? rowToTask(row as Record<string, unknown>) : null;
  }

  create(data: Pick<Task, 'roleId' | 'prompt'>): Task {
    const id = uuidv4();
    const now = Date.now();
    this.db
      .prepare(
        `INSERT INTO tasks (id, role_id, prompt, status, summary, created_at, updated_at, completed_at)
         VALUES (?, ?, ?, 'queued', '', ?, ?, NULL)`,
      )
      .run(id, data.roleId, data.prompt, now, now);
    return this.getById(id)!;
  }

  update(id: string, data: Partial<Omit<Task, 'id' | 'createdAt'>>): Task {
    const existing = this.getById(id);
    if (!existing) throw new Error(`Task ${id} not found`);
    const now = Date.now();
    const updated = { ...existing, ...data, updatedAt: now };
    this.db
      .prepare(
        `UPDATE tasks SET role_id=?, prompt=?, status=?, summary=?, updated_at=?, completed_at=? WHERE id=?`,
      )
      .run(
        updated.roleId,
        updated.prompt,
        updated.status,
        updated.summary,
        now,
        updated.completedAt ?? null,
        id,
      );
    return this.getById(id)!;
  }

  delete(id: string): void {
    this.db.prepare('DELETE FROM task_logs WHERE task_id = ?').run(id);
    this.db.prepare('DELETE FROM tasks WHERE id = ?').run(id);
  }

  addLog(taskId: string, log: TaskLog): void {
    this.db
      .prepare(
        `INSERT INTO task_logs (id, task_id, content, timestamp, type) VALUES (?, ?, ?, ?, ?)`,
      )
      .run(log.id, taskId, log.content, log.timestamp, log.type);
  }

  getLogs(taskId: string): TaskLog[] {
    const rows = this.db
      .prepare('SELECT * FROM task_logs WHERE task_id = ? ORDER BY timestamp ASC')
      .all(taskId);
    return rows.map((r) => rowToTaskLog(r as Record<string, unknown>));
  }
}

export class AgentRuntimeStore {
  constructor(private db: Database.Database) {}

  getAll(): AgentRuntime[] {
    const rows = this.db.prepare('SELECT * FROM agent_runtimes ORDER BY created_at DESC').all();
    return rows.map((r) => rowToAgentRuntime(r as Record<string, unknown>));
  }

  getById(id: string): AgentRuntime | null {
    const row = this.db.prepare('SELECT * FROM agent_runtimes WHERE id = ?').get(id);
    return row ? rowToAgentRuntime(row as Record<string, unknown>) : null;
  }

  create(data: Omit<AgentRuntime, 'id' | 'createdAt'>): AgentRuntime {
    const id = uuidv4();
    const now = Date.now();
    this.db
      .prepare(
        `INSERT INTO agent_runtimes (id, name, type, binary_path, config, created_at)
         VALUES (?, ?, ?, ?, ?, ?)`,
      )
      .run(id, data.name, data.type, data.binaryPath, data.config, now);
    return this.getById(id)!;
  }

  delete(id: string): void {
    this.db.prepare('DELETE FROM agent_runtimes WHERE id = ?').run(id);
  }
}
