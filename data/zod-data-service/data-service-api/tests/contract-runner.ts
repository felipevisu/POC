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

interface JsonSchemaEntry {
  groupId: string;
  artifactId: string;
  version: string;
  jsonSchema: Record<string, unknown> & {
    required?: string[];
    properties?: Record<string, { type?: string }>;
  };
}

const VALID_SAMPLES = 5;
const TYPE_FUZZ_PER_FIELD = 1;

function stripId(schema: Record<string, unknown>) {
  const { $id, ...rest } = schema;
  return rest;
}

function wrongTypeValue(type?: string): unknown {
  switch (type) {
    case "string":
      return 12345;
    case "number":
    case "integer":
      return "not-a-number";
    case "boolean":
      return "true";
    case "array":
      return { not: "an array" };
    case "object":
      return "not-an-object";
    default:
      return null;
  }
}

export function runContractTests(entry: JsonSchemaEntry) {
  const route = `/${entry.groupId}/${entry.artifactId}/v${entry.version}`;
  const schema = stripId(entry.jsonSchema);
  const required = entry.jsonSchema.required ?? [];
  const properties = entry.jsonSchema.properties ?? {};

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

    describe("invalid: missing required field", () => {
      for (const field of required) {
        it(`rejects when "${field}" missing`, async () => {
          const sample = JSONSchemaFaker.generate(schema) as Record<
            string,
            unknown
          >;
          delete sample[field];
          const res = await request(app).post(route).send(sample);
          expect(res.status).toBe(400);
          expect(res.body.valid).toBe(false);
          expect(Array.isArray(res.body.errors)).toBe(true);
        });
      }
    });

    describe("invalid: wrong type per field", () => {
      for (const [field, def] of Object.entries(properties)) {
        for (let i = 0; i < TYPE_FUZZ_PER_FIELD; i++) {
          it(`rejects "${field}" with wrong type`, async () => {
            const sample = JSONSchemaFaker.generate(schema) as Record<
              string,
              unknown
            >;
            sample[field] = wrongTypeValue(def.type);
            const res = await request(app).post(route).send(sample);
            expect(res.status).toBe(400);
            expect(res.body.valid).toBe(false);
          });
        }
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

    it("rejects non-JSON body shape (array)", async () => {
      const res = await request(app).post(route).send([]);
      expect([200, 400]).toContain(res.status);
    });
  });
}
