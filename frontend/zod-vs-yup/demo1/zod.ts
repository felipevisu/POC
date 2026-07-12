import { z } from "zod";

const userSchema = z.object({
  name: z.string(),
  age: z.number(),
});

type User = z.infer<typeof userSchema>; 

/*
type User = {
  name: string;
  age: number;
}
*/