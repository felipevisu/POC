import { z } from "zod";

// Zod is synchronous by default: parse/safeParse return immediately,
// no await, no Promise.
const schema = z.object({
  username: z.string().min(3),
});

const result = schema.safeParse({ username: "ana" });
console.log("sync result, no await needed:", result);

// Async only becomes necessary when YOU add async logic (e.g. a DB check).
// Then zod forces you to switch to safeParseAsync:
const asyncSchema = schema.refine(
  async (u) => {
    // pretend DB lookup
    return u.username !== "taken";
  },
  { message: "username already taken" }
);

// schema with async refine + sync safeParse = zod throws $ZodAsyncError
try {
  asyncSchema.safeParse({ username: "ana" });
} catch (err) {
  console.log("sync parse on async schema:", (err as Error).message);
}

const ok = await asyncSchema.safeParseAsync({ username: "ana" });
console.log("safeParseAsync:", ok);
