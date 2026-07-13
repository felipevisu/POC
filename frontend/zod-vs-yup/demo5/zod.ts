import { z } from "zod";

// Zod has no .when(). Two ways to do conditionals:

// 1. Idiomatic: discriminated union — condition lives in the TYPE itself
const schema = z.discriminatedUnion("deliveryMethod", [
  z.object({ deliveryMethod: z.literal("pickup") }),
  z.object({ deliveryMethod: z.literal("ship"), address: z.string() }),
]);

console.log("pickup, no address:", schema.safeParse({ deliveryMethod: "pickup" }));

const bad = schema.safeParse({ deliveryMethod: "ship" });
console.log("ship, no address:", bad.success ? bad.data : bad.error.issues);

console.log(
  "ship with address:",
  schema.safeParse({ deliveryMethod: "ship", address: "Rua X, 123" })
);

// The inferred type knows the condition — yup's InferType can't do this:
type Order = z.infer<typeof schema>;
/*
type Order =
  | { deliveryMethod: "pickup" }
  | { deliveryMethod: "ship"; address: string }
*/

// 2. Fallback for conditions that don't fit a union: .refine()
// (runtime check only — type stays { deliveryMethod: string; address?: string })
const refined = z
  .object({
    deliveryMethod: z.enum(["pickup", "ship"]),
    address: z.string().optional(),
  })
  .refine((o) => o.deliveryMethod !== "ship" || !!o.address, {
    message: "address is required when shipping",
    path: ["address"],
  });

const r = refined.safeParse({ deliveryMethod: "ship" });
console.log("refine version:", r.success ? r.data : r.error.issues[0].message);
