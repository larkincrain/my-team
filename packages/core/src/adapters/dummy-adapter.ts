import type { AgentAdapter, AgentSessionEvent } from './agent-adapter';
import type { TaskStatus } from '../models/task';

interface SessionState {
  status: TaskStatus;
  inputResolver: ((value: string) => void) | null;
  stopped: boolean;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export class DummyAdapter implements AgentAdapter {
  readonly type = 'dummy';
  private sessions = new Map<string, SessionState>();

  async *startSession(
    sessionId: string,
    _roleContext: string,
    _roleInstructions: string,
    taskPrompt: string,
  ): AsyncGenerator<AgentSessionEvent> {
    const state: SessionState = {
      status: 'running',
      inputResolver: null,
      stopped: false,
    };
    this.sessions.set(sessionId, state);

    const emit = (
      type: AgentSessionEvent['type'],
      data: string,
    ): AgentSessionEvent => ({
      type,
      data,
      timestamp: Date.now(),
    });

    yield emit('log', 'Initializing...');
    if (state.stopped) { this.sessions.delete(sessionId); return; }

    await sleep(500);
    yield emit('log', `Analyzing task: ${taskPrompt}`);
    if (state.stopped) { this.sessions.delete(sessionId); return; }

    for (let i = 1; i <= 5; i++) {
      await sleep(500);
      if (state.stopped) { this.sessions.delete(sessionId); return; }
      yield emit('log', `Processing step ${i}/5...`);
    }

    state.status = 'waiting_input';
    yield emit('needs_input', 'Please confirm: shall I proceed? (yes/no)');

    // Wait for user input
    const userInput = await new Promise<string>((resolve) => {
      state.inputResolver = resolve;
    });

    if (state.stopped) { this.sessions.delete(sessionId); return; }

    state.status = 'running';
    yield emit('log', `User confirmed: ${userInput}`);

    const postSteps = ['Finalizing...', 'Saving results...', 'Cleaning up...', 'Done.'];
    for (const step of postSteps) {
      await sleep(500);
      if (state.stopped) { this.sessions.delete(sessionId); return; }
      yield emit('log', step);
    }

    state.status = 'completed';
    yield emit('completed', `Task completed successfully. Result: processed '${taskPrompt}'`);
    this.sessions.delete(sessionId);
  }

  async sendUserInput(sessionId: string, text: string): Promise<void> {
    const state = this.sessions.get(sessionId);
    if (state?.inputResolver) {
      const resolver = state.inputResolver;
      state.inputResolver = null;
      resolver(text);
    }
  }

  async stop(sessionId: string): Promise<void> {
    const state = this.sessions.get(sessionId);
    if (state) {
      state.stopped = true;
      if (state.inputResolver) {
        const resolver = state.inputResolver;
        state.inputResolver = null;
        resolver('cancelled');
      }
    }
  }

  getStatus(sessionId: string): TaskStatus {
    return this.sessions.get(sessionId)?.status ?? 'completed';
  }

  async validateConfig(_config: Record<string, unknown>): Promise<{ valid: boolean; error?: string }> {
    return { valid: true };
  }
}
