import express from "express";
import swaggerUi from "swagger-ui-express";
import { z } from "zod";
import * as yup from "yup";

const zodUser = z.object({
  name: z.string().min(2),
  age: z.number().int().min(18),
  email: z.string().email(),
});

const yupUser = yup.object({
  name: yup.string().min(2).required(),
  age: yup.number().integer().min(18).required(),
  email: yup.string().email().required(),
});

const app = express();
app.use(express.json());

app.post("/zod/users", (req, res) => {
  const result = zodUser.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({ library: "zod", issues: result.error.issues });
  }
  res.status(201).json({ library: "zod", data: result.data });
});

app.post("/yup/users", async (req, res) => {
  try {
    const data = await yupUser.validate(req.body, { abortEarly: false });
    res.status(201).json({ library: "yup", data });
  } catch (err) {
    const e = err as yup.ValidationError;
    res.status(400).json({ library: "yup", errors: e.errors });
  }
});

const userJsonSchema = z.toJSONSchema(zodUser);

const userPost = (tag: string) => ({
  post: {
    tags: [tag],
    summary: `Validate user with ${tag}`,
    requestBody: {
      required: true,
      content: {
        "application/json": {
          schema: userJsonSchema,
          examples: {
            valid: { value: { name: "Ana", age: 30, email: "ana@x.com" } },
            coercion: {
              summary: 'age as string "30" — yup passes (casts), zod fails',
              value: { name: "Ana", age: "30", email: "ana@x.com" },
            },
            unknownKey: {
              summary: "extra key — zod strips it, yup keeps it",
              value: { name: "Ana", age: 30, email: "ana@x.com", role: "admin" },
            },
            invalid: {
              summary: "multiple errors — compare error shapes",
              value: { name: "A", age: 15, email: "nope" },
            },
          },
        },
      },
    },
    responses: {
      "201": { description: "Valid" },
      "400": { description: "Validation errors" },
    },
  },
});

app.use(
  "/docs",
  swaggerUi.serve,
  swaggerUi.setup({
    openapi: "3.0.0",
    info: { title: "zod vs yup", version: "1.0.0" },
    paths: {
      "/zod/users": userPost("zod"),
      "/yup/users": userPost("yup"),
    },
  })
);

app.get("/", (_req, res) => res.redirect("/docs"));

app.listen(3000, () => console.log("Swagger UI: http://localhost:3000/docs"));
