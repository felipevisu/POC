import { z } from "zod";

const schema = z.object({
  email: z.email(),
  nickname: z.string().optional(),
});

type User = z.infer<typeof schema>; 

const result = schema.safeParse({ name: 123, age: "x" });

if (!result.success) {
  console.log(result.error.issues);
}