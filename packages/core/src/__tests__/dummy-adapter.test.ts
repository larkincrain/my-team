import { describe, it, expect } from 'vitest';
import { DummyAdapter } from '../adapters/dummy-adapter';

describe('DummyAdapter', () => {
  it('emits log events and needs_input then completed', async () => {
    const adapter = new DummyAdapter();
    const sessionId = 'test-session';
    const events: { type: string; data: string }[] = [];

    const gen = adapter.startSession(sessionId, 'context', 'instructions', 'do the thing');

    const collectPromise = (async () => {
      for await (const event of gen) {
        events.push({ type: event.type, data: event.data });
        if (event.type === 'needs_input') {
          setTimeout(() => adapter.sendUserInput(sessionId, 'yes'), 100);
        }
        if (event.type === 'completed' || event.type === 'failed') break;
      }
    })();

    await collectPromise;

    const types = events.map((e) => e.type);
    expect(types).toContain('log');
    expect(types).toContain('needs_input');
    expect(types).toContain('completed');
    expect(types.indexOf('needs_input')).toBeLessThan(types.indexOf('completed'));
  }, 15000);

  it('stop cancels the session', async () => {
    const adapter = new DummyAdapter();
    const sessionId = 'stop-session';
    const events: string[] = [];

    const gen = adapter.startSession(sessionId, '', '', 'test');
    const collectPromise = (async () => {
      for await (const event of gen) {
        events.push(event.type);
        if (event.type === 'needs_input') break;
      }
    })();

    // Let it run a bit then stop before collecting all
    await collectPromise;
    await adapter.stop(sessionId);
    expect(events).toContain('log');
  }, 15000);
});
