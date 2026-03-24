import express from "express";
import swaggerUi from "swagger-ui-express";
import { createRequire } from "node:module";
import { schemas } from "./generated/schemas.js";
import { executePipeline } from "./pipeline.js";

const require = createRequire(import.meta.url);
const openApiSpec = require("./generated/openapi.json");

const app = express();
app.use(express.json());

app.use("/docs", swaggerUi.serve, swaggerUi.setup(openApiSpec));

app.get("/openapi.json", (_req, res) => {
  res.json(openApiSpec);
});

app.get("/", (_req, res) => {
  res.json({
    service: "data-service-api",
    docs: "/docs",
    openapi: "/openapi.json",
    endpoints: schemas.map((s) => ({
      method: "POST",
      path: `/${s.groupId}/${s.artifactId}/v${s.version}`,
      pipeline: s.pipeline,
    })),
  });
});

schemas.forEach(({ groupId, artifactId, version, schema, pipeline }) => {
  app.post(`/${groupId}/${artifactId}/v${version}`, async (req, res) => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      res.status(400).json({
        valid: false,
        errors: result.error.issues,
      });
      return;
    }

    const pipelineResults = await executePipeline(pipeline, result.data);

    res.json({
      valid: true,
      data: result.data,
      pipeline: pipelineResults,
    });
  });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT);
