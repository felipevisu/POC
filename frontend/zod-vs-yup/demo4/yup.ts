import * as yup from "yup";

// Yup is asynchronous by default: validate() always returns a Promise,
// even for pure-sync rules like min(3).
const schema = yup.object({
  username: yup.string().min(3).required(),
});

const promise = schema.validate({ username: "ana" });
console.log("validate() without await returns:", promise); // Promise, not data

console.log("awaited:", await promise);

// Sync exists (validateSync) but throws if the schema has any async test:
const asyncSchema = schema.test(
  "unique",
  "username already taken",
  async (u) => {
    // pretend DB lookup
    return u.username !== "taken";
  }
);

try {
  asyncSchema.validateSync({ username: "ana" });
} catch (err) {
  console.log("validateSync on async schema:", (err as Error).message);
}

console.log("await validate():", await asyncSchema.validate({ username: "ana" }));
