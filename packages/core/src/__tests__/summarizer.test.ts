import { describe, it, expect } from 'vitest';
import { summarizeTaskLogs, updateCompiledMemory } from '../summarizer/summarizer';
import type { TaskLog } from '../models/task';

function makeLog(content: string, type: 'stdout' | 'stderr' | 'system' = 'stdout'): TaskLog {
  return { id: Math.random().toString(), taskId: 'task1', content, timestamp: Date.now(), type };
}

describe('summarizeTaskLogs', () => {
  it('returns no key decisions when logs have no keywords', () => {
    const logs = [makeLog('step 1'), makeLog('step 2')];
    const summary = summarizeTaskLogs(logs, 'do something');
    expect(summary).toContain('do something');
    expect(summary).toContain('2');
  });

  it('includes key lines when keywords present', () => {
    const logs = [makeLog('result: 42'), makeLog('output ready'), makeLog('step 3')];
    const summary = summarizeTaskLogs(logs, 'compute');
    expect(summary).toContain('result: 42');
  });
});

describe('updateCompiledMemory', () => {
  it('appends new entry', () => {
    const memory = updateCompiledMemory('', 'Task done', 'write code');
    expect(memory).toContain('write code');
    expect(memory).toContain('Task done');
  });

  it('keeps last 10 entries', () => {
    let memory = '';
    for (let i = 0; i < 12; i++) {
      memory = updateCompiledMemory(memory, `summary ${i}`, `prompt ${i}`);
    }
    const lines = memory.split('\n').filter(Boolean);
    expect(lines).toHaveLength(10);
    expect(lines[lines.length - 1]).toContain('prompt 11');
  });
});
