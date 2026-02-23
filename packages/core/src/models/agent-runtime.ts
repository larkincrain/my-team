export interface AgentRuntime {
  id: string;
  name: string;
  type: string;
  binaryPath: string | null;
  config: string;
  createdAt: number;
}
