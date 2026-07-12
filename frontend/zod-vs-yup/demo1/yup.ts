import * as yup from "yup";

const userSchema = yup.object({
  name: yup.string(),
  age: yup.number(),
});

type User = yup.InferType<typeof userSchema>;

/*
type User = {
  name?: string | undefined;
  age?: number | undefined;
}
*/