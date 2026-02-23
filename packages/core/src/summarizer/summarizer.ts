import type { TaskLog } from '../models/task';

const SUMMARY_KEYWORDS = ['complete', 'result', 'output', 'decision', 'error', 'success', 'fail', 'finish'];

export function summarizeTaskLogs(logs: TaskLog[], prompt: string): string {
  const keywords = SUMMARY_KEYWORDS;
  const keyLines = logs
    .filter((l) => keywords.some((k) => l.content.toLowerCase().includes(k)))
    .slice(0, 5)
    .map((l) => l.content);

  if (keyLines.length === 0) {
    return `Task "${prompt}" executed with ${logs.length} log entries. No key decisions recorded.`;
  }

  return `Task "${prompt}" completed. Key events: ${keyLines.slice(0, 2).join('; ')}. Total log entries: ${logs.length}.`;
}

export function updateCompiledMemory(
  current: string,
  taskSummary: string,
  taskPrompt: string,
): string {
  const timestamp = new Date().toISOString();
  const entry = `[${timestamp}] Task: ${taskPrompt} → ${taskSummary}`;

  const entries = current ? current.split('\n').filter(Boolean) : [];
  entries.push(entry);

  const kept = entries.slice(-10);
  return kept.join('\n');
}
