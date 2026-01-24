import { NavLink } from "react-router";
import type { Route } from "./+types/repos";

export function meta({}: Route.MetaArgs) {
  return [{ title: "Repos" }, { name: "description", content: "Repos" }];
}

interface Repo {
  id: number;
  name: string;
}

export async function loader(): Promise<Repo[]> {
  const response = await fetch("https://api.github.com/users/felipevisu/repos");
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const message = errorData.message || "Failed to fetch repos";
    throw new Response(message, { status: response.status });
  }
  const repos: Repo[] = await response.json();
  return repos;
}

export default function Repos({ loaderData }: { loaderData: Repo[] }) {
  if (!loaderData) {
    return <div>Loading...</div>;
  }

  return (
    <ul>
      {loaderData.map((repo) => (
        <li key={repo.id}>
          <NavLink to={`/repos/${repo.name}`}>{repo.name}</NavLink>
        </li>
      ))}
    </ul>
  );
}
