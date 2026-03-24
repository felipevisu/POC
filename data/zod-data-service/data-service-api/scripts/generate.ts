import { writeFileSync, mkdirSync } from "node:fs";
import { jsonSchemaToZod } from "json-schema-to-zod";

const REGISTRY_URL = process.env.REGISTRY_URL || "http://localhost:8080";
const API = `${REGISTRY_URL}/apis/registry/v3`;
const OUT_DIR = new URL("../src/generated", import.meta.url).pathname;

interface PipelineAction {
  type: string;
  [key: string]: string;
}

interface PipelineConfig {
  actions: PipelineAction[];
}

interface SchemaEntry {
  groupId: string;
  artifactId: string;
  version: string;
  zodExpression: string;
  jsonSchema: Record<string, unknown>;
  pipeline: PipelineConfig;
}

async function fetchJson(url: string) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`GET ${url} → ${res.status} ${res.statusText}`);
  return res.json();
}

async function waitForRegistry(retries = 10, delayMs = 2000) {
  for (let i = 0; i < retries; i++) {
    try {
      await fetchJson(`${API}/system/info`);
      return;
    } catch {
      await new Promise((r) => setTimeout(r, delayMs));
    }
  }
  throw new Error(
    `Registry not reachable at ${REGISTRY_URL} after ${retries} attempts`,
  );
}

function parsePipelineLabels(labels: Record<string, string>): PipelineConfig {
  const actionNames = (labels["pipeline.actions"] || "").split(",").filter(Boolean);

  const actions = actionNames.map((type) => {
    const prefix = `pipeline.${type}.`;
    const config: PipelineAction = { type };

    Object.entries(labels).forEach(([key, value]) => {
      if (key.startsWith(prefix)) {
        config[key.slice(prefix.length)] = value;
      }
    });

    return config;
  });

  return { actions };
}

async function discoverSchemas(): Promise<SchemaEntry[]> {
  const { groups } = await fetchJson(`${API}/groups`);

  const nested = await Promise.all(
    groups.map(async (group: { groupId: string }) => {
      const { artifacts } = await fetchJson(
        `${API}/groups/${group.groupId}/artifacts`,
      );

      return Promise.all(
        artifacts.map(async (artifact: { artifactId: string }) => {
          const [{ versions }, artifactMeta] = await Promise.all([
            fetchJson(
              `${API}/groups/${group.groupId}/artifacts/${artifact.artifactId}/versions`,
            ),
            fetchJson(
              `${API}/groups/${group.groupId}/artifacts/${artifact.artifactId}`,
            ),
          ]);

          const pipeline = parsePipelineLabels(artifactMeta.labels || {});

          return Promise.all(
            versions.map(async (ver: { version: string }) => {
              const jsonSchema = await fetchJson(
                `${API}/groups/${group.groupId}/artifacts/${artifact.artifactId}/versions/${ver.version}/content`,
              );

              return {
                groupId: group.groupId,
                artifactId: artifact.artifactId,
                version: ver.version,
                zodExpression: jsonSchemaToZod(jsonSchema),
                jsonSchema,
                pipeline,
              } satisfies SchemaEntry;
            }),
          );
        }),
      );
    }),
  );

  return nested.flat(2);
}

function generateZodCode(entries: SchemaEntry[]): string {
  const schemaItems = entries
    .map(
      (e) =>
        `  {\n    groupId: ${JSON.stringify(e.groupId)},\n    artifactId: ${JSON.stringify(e.artifactId)},\n    version: ${JSON.stringify(e.version)},\n    pipeline: ${JSON.stringify(e.pipeline)},\n    schema: ${e.zodExpression},\n  }`,
    )
    .join(",\n");

  return `// Auto-generated from Apicurio Schema Registry — do not edit manually
// Run \`npm run generate\` to regenerate
import { z } from "zod";

export interface PipelineAction {
  type: string;
  [key: string]: string;
}

export interface PipelineConfig {
  actions: PipelineAction[];
}

export const schemas = [
${schemaItems},
];
`;
}

function buildValidationResponse(valid: boolean) {
  return {
    description: valid ? "Payload is valid" : "Validation failed",
    content: {
      "application/json": {
        schema: {
          type: "object",
          properties: valid
            ? { valid: { type: "boolean", example: true }, data: { type: "object" } }
            : {
                valid: { type: "boolean", example: false },
                errors: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      code: { type: "string" },
                      path: { type: "array", items: { type: "string" } },
                      message: { type: "string" },
                    },
                  },
                },
              },
        },
      },
    },
  };
}

function generateOpenApiSpec(entries: SchemaEntry[]): object {
  const paths: Record<string, unknown> = {};

  entries.forEach((e) => {
    const { $id, ...requestSchema } = e.jsonSchema as Record<string, unknown>;

    paths[`/${e.groupId}/${e.artifactId}/v${e.version}`] = {
      post: {
        tags: [e.groupId],
        summary: `Validate ${e.artifactId} v${e.version}`,
        operationId: `validate_${e.groupId}_${e.artifactId}_v${e.version}`.replace(/-/g, "_"),
        requestBody: {
          required: true,
          content: { "application/json": { schema: requestSchema } },
        },
        responses: {
          "200": buildValidationResponse(true),
          "400": buildValidationResponse(false),
        },
      },
    };
  });

  return {
    openapi: "3.0.3",
    info: {
      title: "Data Service API",
      description:
        "Validates payloads against JSON Schemas from Apicurio Registry using Zod",
      version: "1.0.0",
    },
    paths,
  };
}

async function main() {
  await waitForRegistry();

  const entries = await discoverSchemas();

  mkdirSync(OUT_DIR, { recursive: true });

  writeFileSync(`${OUT_DIR}/schemas.ts`, generateZodCode(entries));
  writeFileSync(
    `${OUT_DIR}/openapi.json`,
    JSON.stringify(generateOpenApiSpec(entries), null, 2),
  );
}

main().catch(() => process.exit(1));
