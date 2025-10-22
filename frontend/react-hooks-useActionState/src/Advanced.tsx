import { useActionState } from "react";
import { z } from "zod";

type Data = {
  name: string;
  email: string;
  bio: string;
};

type State = {
  success: boolean;
  errors: Partial<Record<keyof Data, string>>;
  data: Data;
  message: string;
};

const initialState: State = {
  success: false,
  errors: {},
  data: {
    name: "Felipe",
    email: "felipevisu@gmail.com",
    bio: "Software developer",
  },
  message: "",
};

const profileSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(50, "Name must be less than 50 characters"),
  email: z.email("Please enter a valid email address").toLowerCase(),
  bio: z.string().max(500, "Bio must be less than 500 characters"),
});

async function updateUserProfile(
  prev: State,
  formData: FormData
): Promise<State> {
  const name = formData.get("name");
  const email = formData.get("email");
  const bio = formData.get("bio");
  const data = { name, email, bio };

  const parsed = profileSchema.safeParse(data);

  if (!parsed.success) {
    const errors: Partial<Record<keyof Data, string>> = {};
    parsed.error.issues.forEach((issue) => {
      const fieldName = issue.path[0];
      if (
        fieldName &&
        typeof fieldName === "string" &&
        fieldName in initialState.data
      ) {
        errors[fieldName as keyof Data] = issue.message;
      }
    });

    return {
      success: false,
      errors,
      data: prev.data,
      message: "Failed to updated",
    };
  }

  return {
    success: true,
    errors: {},
    data: parsed.data,
    message: "User updated",
  };
}

function ProfilePage() {
  const [state, formAction] = useActionState(updateUserProfile, initialState);

  return (
    <div>
      {state.message && <div role="alert">{state.message}</div>}
      <form action={formAction} noValidate>
        <div>
          <label htmlFor="name">Name</label>
          <input
            id="name"
            name="name"
            type="text"
            defaultValue={state.data.name}
          />
          {state.errors.name && <p>{state.errors.name}</p>}
        </div>
        <div>
          <label htmlFor="email">Email</label>
          <input
            id="email"
            name="email"
            type="email"
            defaultValue={state.data.email}
          />
          {state.errors.email && <p>{state.errors.email}</p>}
        </div>
        <div>
          <label htmlFor="email">Bio</label>
          <textarea id="bio" name="bio" defaultValue={state.data.bio} />
          {state.errors.bio && <p>{state.errors.bio}</p>}
        </div>
        <button type="submit">Send</button>
      </form>
    </div>
  );
}

export default ProfilePage;
