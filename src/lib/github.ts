import {
  GITHUB_USERNAME,
  FEATURED_REPOS,
  EXCLUDED_REPOS,
} from "./constants";

export interface GitHubRepo {
  name: string;
  description: string | null;
  stargazers_count: number;
  language: string | null;
  homepage: string | null;
  html_url: string;
  topics: string[];
  fork: boolean;
  pushed_at: string;
  created_at: string;
}

const GITHUB_API_URL = `https://api.github.com/users/${GITHUB_USERNAME}/repos?per_page=100&sort=stars&direction=desc`;

export async function fetchGitHubRepos(): Promise<GitHubRepo[]> {
  try {
    const res = await fetch(GITHUB_API_URL, {
      headers: {
        Accept: "application/vnd.github.v3+json",
        ...(process.env.GITHUB_TOKEN
          ? { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` }
          : {}),
      },
    });

    if (!res.ok) {
      console.error(`GitHub API error: ${res.status}`);
      return [];
    }

    const repos: GitHubRepo[] = await res.json();

    const excludedSet = new Set<string>(EXCLUDED_REPOS);
    return repos.filter(
      (repo) => !repo.fork && !excludedSet.has(repo.name)
    );
  } catch (error) {
    console.error("Failed to fetch GitHub repos:", error);
    return [];
  }
}

export function sortRepos(repos: GitHubRepo[]): GitHubRepo[] {
  const featuredSet = new Set<string>(FEATURED_REPOS);
  const featuredOrder = new Map<string, number>(
    FEATURED_REPOS.map((name, index) => [name, index])
  );

  const featured: GitHubRepo[] = [];
  const rest: GitHubRepo[] = [];

  for (const repo of repos) {
    if (featuredSet.has(repo.name)) {
      featured.push(repo);
    } else {
      rest.push(repo);
    }
  }

  featured.sort(
    (a, b) =>
      (featuredOrder.get(a.name) ?? 99) - (featuredOrder.get(b.name) ?? 99)
  );

  rest.sort((a, b) => b.stargazers_count - a.stargazers_count);

  return [...featured, ...rest];
}
