import type { TaskStatus } from '../models/task';

export interface AgentSessionEvent {
  type: 'log' | 'status' | 'needs_input' | 'completed' | 'failed';
  data: string;
  timestamp: number;
}

export interface AgentAdapter {
  readonly type: string;
  startSession(
    sessionId: string,
    roleContext: string,
    roleInstructions: string,
    taskPrompt: string,
  ): AsyncGenerator<AgentSessionEvent>;
  sendUserInput(sessionId: string, text: string): Promise<void>;
  stop(sessionId: string): Promise<void>;
  getStatus(sessionId: string): TaskStatus;
  validateConfig(config: Record<string, unknown>): Promise<{ valid: boolean; error?: string }>;
}
