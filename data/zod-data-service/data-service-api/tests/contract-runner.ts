import { describe, it, expect, beforeAll } from "vitest";
import request from "supertest";
import { JSONSchemaFaker } from "json-schema-faker";
import type { Express } from "express";
import { buildApp } from "../src/app.js";

JSONSchemaFaker.option({
  alwaysFakeOptionals: false,
  failOnInvalidTypes: false,
  failOnInvalidFormat: false,
  useDefaultValue: false,
  fillProperties: false,
});

interface SchemaNode {
  type?: string;
  properties?: Record<string, SchemaNode>;
  required?: string[];
  additionalProperties?: boolean;
  minLength?: number;
  maxLength?: number;
  minimum?: number;
  maximum?: number;
  pattern?: string;
  format?: string;
  enum?: unknown[];
  minItems?: number;
  maxItems?: number;
  uniqueItems?: boolean;
  items?: SchemaNode;
  [key: string]: unknown;
}

interface JsonSchemaEntry {
  groupId: string;
  artifactId: string;
  version: string;
  jsonSchema: SchemaNode;
}

interface Mutation {
  kind: "valid" | "invalid";
  description: string;
  apply: (payload: Record<string, unknown>) => void;
}

const VALID_SAMPLES = 5;

function stripId(schema: SchemaNode): SchemaNode {
  const { $id, ...rest } = schema as Record<string, unknown>;
  return rest as SchemaNode;
}

function setPath(obj: Record<string, unknown>, path: string[], value: unknown) {
  let cur: Record<string, unknown> = obj;
  for (let i = 0; i < path.length - 1; i++) {
    const key = path[i];
    const next = cur[key];
    if (next == null || typeof next !== "object" || Array.isArray(next)) {
      cur[key] = {};
    }
    cur = cur[key] as Record<string, unknown>;
  }
  cur[path[path.length - 1]] = value;
}

function deletePath(obj: Record<string, unknown>, path: string[]) {
  let cur: Record<string, unknown> | undefined = obj;
  for (let i = 0; i < path.length - 1; i++) {
    if (cur == null) return;
    cur = cur[path[i]] as Record<string, unknown> | undefined;
  }
  if (cur) delete cur[path[path.length - 1]];
}

function invalidFormatSample(format?: string): string | null {
  switch (format) {
    case "email":
      return "not-an-email";
    case "uuid":
      return "00000000-0000-0000-0000";
    case "uri":
    case "url":
      return "not a uri at all";
    case "date-time":
      return "2026-13-99T99:99:99Z";
    case "date":
      return "2026-13-99";
    case "time":
      return "99:99:99";
    case "ipv4":
      return "999.999.999.999";
    case "ipv6":
      return "not::an::ipv6";
    default:
      return null;
  }
}

function wrongTypeValue(type?: string): unknown {
  switch (type) {
    case "string":
      return 12345;
    case "number":
    case "integer":
      return "not-a-number";
    case "boolean":
      return "maybe";
    case "array":
      return { not: "an-array" };
    case "object":
      return "not-an-object";
    default:
      return null;
  }
}

function notInEnum(values: unknown[]): unknown {
  if (values.every((v) => typeof v === "string")) {
    const candidate = "__not_in_enum__";
    return values.includes(candidate) ? candidate + "_x" : candidate;
  }
  if (values.every((v) => typeof v === "number")) {
    return Math.max(...(values as number[])) + 9999;
  }
  return "__not_in_enum__";
}

function joinPath(path: string[]): string {
  return path.length === 0 ? "<root>" : path.join(".");
}

function collectMutations(
  node: SchemaNode,
  path: string[],
  parentChainRequired: boolean,
  mutations: Mutation[],
) {
  if (node.type && node.type !== "object" && path.length > 0) {
    mutations.push({
      kind: "invalid",
      description: `"${joinPath(path)}" wrong type (expected ${node.type})`,
      apply: (p) => setPath(p, path, wrongTypeValue(node.type)),
    });
  }

  if (node.type === "object" && node.properties) {
    const required = node.required ?? [];
    for (const [key, child] of Object.entries(node.properties)) {
      const childPath = [...path, key];
      const childRequired = required.includes(key);
      if (childRequired && parentChainRequired) {
        mutations.push({
          kind: "invalid",
          description: `missing required "${joinPath(childPath)}"`,
          apply: (p) => deletePath(p, childPath),
        });
      }
      collectMutations(
        child,
        childPath,
        parentChainRequired && childRequired,
        mutations,
      );
    }
    if (node.additionalProperties === false && parentChainRequired) {
      mutations.push({
        kind: "invalid",
        description: `unexpected extra property at "${joinPath(path)}"`,
        apply: (p) => setPath(p, [...path, "__unexpected__"], "x"),
      });
    }
  }

  if (node.type === "string") {
    if (typeof node.minLength === "number" && node.minLength > 0) {
      mutations.push({
        kind: "invalid",
        description: `"${joinPath(path)}" below minLength ${node.minLength}`,
        apply: (p) =>
          setPath(p, path, "a".repeat(Math.max(0, node.minLength! - 1))),
      });
    }
    if (typeof node.maxLength === "number") {
      mutations.push({
        kind: "invalid",
        description: `"${joinPath(path)}" above maxLength ${node.maxLength}`,
        apply: (p) => setPath(p, path, "a".repeat(node.maxLength! + 1)),
      });
    }
    const badFormat = invalidFormatSample(node.format);
    if (badFormat !== null) {
      mutations.push({
        kind: "invalid",
        description: `"${joinPath(path)}" invalid format ${node.format}`,
        apply: (p) => setPath(p, path, badFormat),
      });
    }
    if (node.pattern) {
      mutations.push({
        kind: "invalid",
        description: `"${joinPath(path)}" violates pattern /${node.pattern}/`,
        apply: (p) => setPath(p, path, "!!!INVALID!!!"),
      });
    }
    if (Array.isArray(node.enum)) {
      mutations.push({
        kind: "invalid",
        description: `"${joinPath(path)}" not in enum`,
        apply: (p) => setPath(p, path, notInEnum(node.enum!)),
      });
      for (const value of node.enum) {
        mutations.push({
          kind: "valid",
          description: `"${joinPath(path)}" = ${JSON.stringify(value)}`,
          apply: (p) => setPath(p, path, value),
        });
      }
    }
  }

  if (node.type === "number" || node.type === "integer") {
    if (typeof node.minimum === "number") {
      mutations.push({
        kind: "invalid",
        description: `"${joinPath(path)}" below minimum ${node.minimum}`,
        apply: (p) => setPath(p, path, node.minimum! - 1),
      });
      mutations.push({
        kind: "valid",
        description: `"${joinPath(path)}" at minimum ${node.minimum}`,
        apply: (p) => setPath(p, path, node.minimum!),
      });
    }
    if (typeof node.maximum === "number") {
      mutations.push({
        kind: "invalid",
        description: `"${joinPath(path)}" above maximum ${node.maximum}`,
        apply: (p) => setPath(p, path, node.maximum! + 1),
      });
      mutations.push({
        kind: "valid",
        description: `"${joinPath(path)}" at maximum ${node.maximum}`,
        apply: (p) => setPath(p, path, node.maximum!),
      });
    }
    if (Array.isArray(node.enum)) {
      mutations.push({
        kind: "invalid",
        description: `"${joinPath(path)}" not in enum`,
        apply: (p) => setPath(p, path, notInEnum(node.enum!)),
      });
    }
  }

  if (node.type === "array") {
    if (typeof node.minItems === "number" && node.minItems > 0) {
      mutations.push({
        kind: "invalid",
        description: `"${joinPath(path)}" below minItems ${node.minItems}`,
        apply: (p) => setPath(p, path, []),
      });
    }
    if (typeof node.maxItems === "number") {
      mutations.push({
        kind: "invalid",
        description: `"${joinPath(path)}" above maxItems ${node.maxItems}`,
        apply: (p) => {
          const sampleItem = node.items
            ? JSONSchemaFaker.generate(node.items)
            : "x";
          setPath(
            p,
            path,
            Array.from({ length: node.maxItems! + 1 }, () => sampleItem),
          );
        },
      });
    }
    if (node.uniqueItems) {
      mutations.push({
        kind: "invalid",
        description: `"${joinPath(path)}" violates uniqueItems`,
        apply: (p) => {
          const sampleItem = node.items
            ? JSONSchemaFaker.generate(node.items)
            : "x";
          setPath(p, path, [sampleItem, sampleItem]);
        },
      });
    }
  }
}

function generateFullSample(schema: SchemaNode): unknown {
  JSONSchemaFaker.option({ alwaysFakeOptionals: true });
  try {
    return JSONSchemaFaker.generate(schema);
  } finally {
    JSONSchemaFaker.option({ alwaysFakeOptionals: false });
  }
}

export function runContractTests(entry: JsonSchemaEntry) {
  const route = `/${entry.groupId}/${entry.artifactId}/v${entry.version}`;
  const schema = stripId(entry.jsonSchema);
  const required = schema.required ?? [];

  const mutations: Mutation[] = [];
  collectMutations(schema, [], true, mutations);

  let app: Express;
  beforeAll(() => {
    app = buildApp();
  });

  describe(`POST ${route}`, () => {
    describe("valid payloads (faker)", () => {
      for (let i = 0; i < VALID_SAMPLES; i++) {
        it(`accepts faker sample #${i + 1}`, async () => {
          const sample = JSONSchemaFaker.generate(schema);
          const res = await request(app).post(route).send(sample);
          expect(res.status, JSON.stringify(res.body)).toBe(200);
          expect(res.body.valid).toBe(true);
        });
      }
    });

    describe("constraint mutations (invalid → 400)", () => {
      const invalid = mutations.filter((m) => m.kind === "invalid");
      if (invalid.length === 0) {
        it.skip("no invalid mutations derivable from schema", () => {});
      }
      for (const m of invalid) {
        it(`rejects: ${m.description}`, async () => {
          const sample = JSONSchemaFaker.generate(schema) as Record<
            string,
            unknown
          >;
          m.apply(sample);
          const res = await request(app).post(route).send(sample);
          expect(res.status, JSON.stringify(res.body)).toBe(400);
          expect(res.body.valid).toBe(false);
          expect(Array.isArray(res.body.errors)).toBe(true);
        });
      }
    });

    describe("constraint mutations (valid → 200)", () => {
      const valid = mutations.filter((m) => m.kind === "valid");
      if (valid.length === 0) {
        it.skip("no valid boundary mutations derivable from schema", () => {});
      }
      for (const m of valid) {
        it(`accepts: ${m.description}`, async () => {
          const sample = generateFullSample(schema) as Record<string, unknown>;
          m.apply(sample);
          const res = await request(app).post(route).send(sample);
          expect(res.status, JSON.stringify(res.body)).toBe(200);
          expect(res.body.valid).toBe(true);
        });
      }
    });

    it("rejects empty object", async () => {
      const res = await request(app).post(route).send({});
      if (required.length > 0) {
        expect(res.status).toBe(400);
        expect(res.body.valid).toBe(false);
      } else {
        expect(res.status).toBe(200);
      }
    });

    it("array body shape", async () => {
      const res = await request(app).post(route).send([]);
      expect([200, 400]).toContain(res.status);
    });
  });
}
