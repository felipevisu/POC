import * as z from "zod";

// Example 1 - User

const User = z.object({
  id: z.string(),
  name: z.string().min(2).max(200),
});

const userInput = {
  id: "abcd",
  name: "Felipe Faria",
};

const user = User.parse(userInput);

console.log(user);

// Example 2 - Player

const Player = z.object({
  id: z.string(),
  username: z.string().min(2).max(200),
  xp: z.number().min(0),
});

const playerInput = {
  id: "efgh",
  username: "Player One",
  xp: 100,
};

const player = Player.parse(playerInput);

console.log(player);

// Example 3 - Validation

try {
  Player.parse({ username: 42, xp: "100" });
} catch (error) {
  if (error instanceof z.ZodError) {
    console.log(error.issues);
  }
}

// Example 4 - Safe validation

const safePlayer = Player.safeParse({
  id: "xyz",
  username: "Player One",
  xp: 100,
});

if (safePlayer.success) {
  console.log(safePlayer.data);
} else {
  console.log(safePlayer.error.issues);
}

// Example 5 - Infer schema

type Player = z.infer<typeof Player>;
const inferedPlayer: Player = { id: "xyz", username: "billie", xp: 100 };

console.log(inferedPlayer);

// Coerce

const coerceString = z.coerce.string();

coerceString.parse("tuna"); // => "tuna"
coerceString.parse(42); // => "42"
coerceString.parse(true); // => "true"
coerceString.parse(null); // => "null"

const coerceBoolean = z.coerce.boolean(); // Boolean(input)

coerceBoolean.parse("tuna"); // => true
coerceBoolean.parse("true"); // => true
coerceBoolean.parse("false"); // => true
coerceBoolean.parse(1); // => true
coerceBoolean.parse([]); // => true

coerceBoolean.parse(0); // => false
coerceBoolean.parse(""); // => false
coerceBoolean.parse(undefined); // => false
coerceBoolean.parse(null); // => false
