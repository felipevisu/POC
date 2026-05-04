import { tool } from "@openrouter/agent";
import { z } from "zod";

export const listGithubReposTool = tool({
  name: "list_github_repos",
  description:
    "Fetch the public GitHub repositories owned by a given username. Use this whenever the user asks for a person's GitHub repos, projects, or repositories.",
  inputSchema: z.object({
    username: z.string().describe("GitHub username (login), e.g. 'torvalds'"),
    limit: z
      .number()
      .int()
      .min(1)
      .max(100)
      .optional()
      .describe("Max number of repos to return. Defaults to 30."),
  }),
  async execute({ username, limit = 30 }) {
    const url = `https://api.github.com/users/${encodeURIComponent(
      username,
    )}/repos?per_page=${limit}&sort=updated`;

    const res = await fetch(url, {
      headers: { Accept: "application/vnd.github+json" },
    });

    if (!res.ok) {
      return {
        ok: false,
        status: res.status,
        error: `GitHub API error: ${res.status} ${res.statusText}`,
      };
    }

    const repos = await res.json();
    return {
      ok: true,
      username,
      count: repos.length,
      repos: repos.map((r) => ({
        name: r.name,
        fullName: r.full_name,
        description: r.description,
        url: r.html_url,
        stars: r.stargazers_count,
        forks: r.forks_count,
        language: r.language,
        isFork: r.fork,
        archived: r.archived,
        updatedAt: r.updated_at,
      })),
    };
  },
});
