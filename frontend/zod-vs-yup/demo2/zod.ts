import { z } from "zod";

const schema = z.object({
  email: z.email(),
  nickname: z.string().optional(),
});

type User = z.infer<typeof schema>; 

/*
type User = {
  email: string;
  nickname?: string | undefined;
}
*/