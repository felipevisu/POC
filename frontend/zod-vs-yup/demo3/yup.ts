import * as yup from "yup";

const schema = yup.object({
  email: yup.string().email().required(),
  nickname: yup.string(),
});

type User = yup.InferType<typeof schema>;

try {
  await schema.validate(
    { name: 123, age: "x" },
    { abortEarly: false }
  );
} catch (err) {
  if (err instanceof yup.ValidationError) {
    console.log(err.inner);
    //console.log(err.inner.map((e) => ({ path: e.path, message: e.message })));
  }
}