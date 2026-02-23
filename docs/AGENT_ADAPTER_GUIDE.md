# Agent Adapter Guide

## Overview

My Team supports pluggable agent adapters. Each adapter implements the `AgentAdapter` interface from `@my-team/core` and allows the app to communicate with a specific AI agent runtime.

## The AgentAdapter Interface

```typescript
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
```

### Event Types

- `log` - Standard output from the agent
- `needs_input` - Agent is waiting for user input
- `completed` - Agent finished successfully
- `failed` - Agent encountered an error
- `status` - Status update

## Adding a New Adapter

1. Create a new file in `packages/core/src/adapters/`, e.g. `claude-code-adapter.ts`
2. Implement the `AgentAdapter` interface
3. Export from `packages/core/src/index.ts`
4. Register in `apps/desktop/src/main/agent-runner.ts`

### Example: Claude Code Adapter

```typescript
import type { AgentAdapter, AgentSessionEvent } from './agent-adapter';
import type { TaskStatus } from '../models/task';
import { spawn, ChildProcess } from 'child_process';

export class ClaudeCodeAdapter implements AgentAdapter {
  readonly type = 'claude-code';
  private processes = new Map<string, ChildProcess>();

  async *startSession(
    sessionId: string,
    roleContext: string,
    roleInstructions: string,
    taskPrompt: string,
  ): AsyncGenerator<AgentSessionEvent> {
    const proc = spawn('claude', ['--session', sessionId, taskPrompt]);
    this.processes.set(sessionId, proc);

    for await (const chunk of proc.stdout) {
      yield { type: 'log', data: chunk.toString(), timestamp: Date.now() };
    }

    yield { type: 'completed', data: 'Done', timestamp: Date.now() };
  }

  async sendUserInput(sessionId: string, text: string): Promise<void> {
    const proc = this.processes.get(sessionId);
    proc?.stdin?.write(text + '\n');
  }

  async stop(sessionId: string): Promise<void> {
    this.processes.get(sessionId)?.kill();
    this.processes.delete(sessionId);
  }

  getStatus(sessionId: string): TaskStatus {
    return this.processes.has(sessionId) ? 'running' : 'completed';
  }

  async validateConfig(config: Record<string, unknown>) {
    return { valid: true };
  }
}
```

## Registering the Adapter

In `apps/desktop/src/main/agent-runner.ts`, update `startTask`:

```typescript
import { ClaudeCodeAdapter } from '@my-team/core';

// ...
const adapterType = role.agentRuntimeId
  ? agentRuntimeStore.getById(role.agentRuntimeId)?.type
  : 'dummy';

const adapter = adapterType === 'claude-code'
  ? new ClaudeCodeAdapter()
  : new DummyAdapter();
```
