import * as yup from "yup";

const schema = yup.object({
  email: yup.string().email().required(),
  nickname: yup.string(),
});

type User = yup.InferType<typeof schema>;

/*
type User = {
  email: string;
  nickname?: string | undefined;
}
*/