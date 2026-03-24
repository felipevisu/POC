import type { PipelineAction, PipelineConfig } from "./generated/schemas.js";

export interface ActionResult {
  type: string;
  status: "sent" | "persisted" | "error";
  destination: string;
  error?: string;
}

type ActionHandler = (
  action: PipelineAction,
  data: unknown,
) => Promise<ActionResult>;

const handlers: Record<string, ActionHandler> = {
  async kafka(action, data) {
    // TODO: replace with actual Kafka producer
    return {
      type: "kafka",
      status: "sent",
      destination: action.topic,
    };
  },

  async database(action, data) {
    // TODO: replace with actual database insert
    return {
      type: "database",
      status: "persisted",
      destination: action.table,
    };
  },
};

export async function executePipeline(
  pipeline: PipelineConfig,
  data: unknown,
): Promise<ActionResult[]> {
  const results = await Promise.all(
    pipeline.actions.map(async (action) => {
      const handler = handlers[action.type];

      if (!handler) {
        return {
          type: action.type,
          status: "error" as const,
          destination: "unknown",
          error: `No handler for action type: ${action.type}`,
        };
      }

      try {
        return await handler(action, data);
      } catch (err) {
        return {
          type: action.type,
          status: "error" as const,
          destination: "unknown",
          error: err instanceof Error ? err.message : String(err),
        };
      }
    }),
  );

  return results;
}
