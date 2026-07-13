import * as yup from "yup";

// Yup has conditional validation built in: .when()
const schema = yup.object({
  deliveryMethod: yup.string().oneOf(["pickup", "ship"]).required(),
  address: yup.string().when("deliveryMethod", {
    is: "ship",
    then: (s) => s.required("address is required when shipping"),
    otherwise: (s) => s.strip(), // pickup: drop the field entirely
  }),
});

console.log("pickup, no address:", await schema.validate({ deliveryMethod: "pickup" }));

try {
  await schema.validate({ deliveryMethod: "ship" });
} catch (err) {
  console.log("ship, no address:", (err as yup.ValidationError).errors);
}

console.log(
  "ship with address:",
  await schema.validate({ deliveryMethod: "ship", address: "Rua X, 123" })
);

// Caveat: the inferred type can't see the condition — address stays optional
type Order = yup.InferType<typeof schema>;
/*
type Order = {
  deliveryMethod: "pickup" | "ship";
  address?: string;   // still optional even for "ship"
}
*/
