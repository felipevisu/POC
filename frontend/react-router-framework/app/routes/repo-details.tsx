import type { Route } from "./+types/repo-details";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Repo Details" },
    { name: "description", content: "Repo Details" },
  ];
}

interface Repo {
  id: number;
  name: string;
  full_name: string;
  description: string | null;
  html_url: string;
  stargazers_count: number;
  forks_count: number;
  open_issues_count: number;
  language: string | null;
  created_at: string;
  updated_at: string;
  owner: {
    login: string;
    avatar_url: string;
  };
}

export async function loader({ params }: { params: { slug: string } }) {
  const response = await fetch(
    `https://api.github.com/repos/felipevisu/${params.slug}`,
  );
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const message = errorData.message || "Repo not found";
    throw new Response(message, { status: response.status });
  }
  const data = await response.json();
  return data;
}

export default function RepoDetails({ loaderData }: { loaderData: Repo }) {
  return (
    <div>
      <h1>{loaderData.name}</h1>
      <p>{loaderData.description}</p>

      <div>
        <p>Stars: {loaderData.stargazers_count}</p>
        <p>Forks: {loaderData.forks_count}</p>
        <p>Issues: {loaderData.open_issues_count}</p>
        <p>Language: {loaderData.language}</p>
      </div>

      <a href={loaderData.html_url} target="_blank" rel="noopener noreferrer">
        View on GitHub
      </a>

      <div>
        <img
          src={loaderData.owner.avatar_url}
          alt={loaderData.owner.login}
          width={50}
        />
        <p>Owner: {loaderData.owner.login}</p>
      </div>
    </div>
  );
}
