import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { initDb, RoleStore } from '../db/database';
import type Database from 'better-sqlite3';

describe('RoleStore', () => {
  let db: Database.Database;
  let store: RoleStore;

  beforeEach(() => {
    db = initDb(':memory:');
    store = new RoleStore(db);
  });

  afterEach(() => {
    db.close();
  });

  it('creates a role', () => {
    const role = store.create({
      name: 'Test',
      description: 'desc',
      instructions: '',
      context: '',
      compiledMemory: '',
      agentRuntimeId: null,
    });
    expect(role.id).toBeTruthy();
    expect(role.name).toBe('Test');
    expect(role.description).toBe('desc');
  });

  it('reads all roles', () => {
    store.create({ name: 'A', description: '', instructions: '', context: '', compiledMemory: '', agentRuntimeId: null });
    store.create({ name: 'B', description: '', instructions: '', context: '', compiledMemory: '', agentRuntimeId: null });
    expect(store.getAll()).toHaveLength(2);
  });

  it('gets role by id', () => {
    const role = store.create({ name: 'FindMe', description: '', instructions: '', context: '', compiledMemory: '', agentRuntimeId: null });
    const found = store.getById(role.id);
    expect(found).not.toBeNull();
    expect(found!.name).toBe('FindMe');
  });

  it('updates a role', () => {
    const role = store.create({ name: 'Old', description: '', instructions: '', context: '', compiledMemory: '', agentRuntimeId: null });
    const updated = store.update(role.id, { name: 'New' });
    expect(updated.name).toBe('New');
  });

  it('deletes a role', () => {
    const role = store.create({ name: 'Del', description: '', instructions: '', context: '', compiledMemory: '', agentRuntimeId: null });
    store.delete(role.id);
    expect(store.getById(role.id)).toBeNull();
  });
});
