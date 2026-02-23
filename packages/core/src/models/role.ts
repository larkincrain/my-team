export interface Role {
  id: string;
  name: string;
  description: string;
  instructions: string;
  context: string;
  compiledMemory: string;
  agentRuntimeId: string | null;
  createdAt: number;
  updatedAt: number;
}
