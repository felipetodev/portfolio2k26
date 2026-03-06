import { cacheLife, cacheTag } from "next/cache";
import { fetchGitHubRepos, sortRepos } from "@/lib/github";
import { ProjectCard } from "@/components/project-card";
import { FEATURED_REPOS } from "@/lib/constants";

export async function Projects() {
  "use cache";
  cacheLife("hours");
  cacheTag("github-repos");
  const repos = await fetchGitHubRepos();

  if (repos.length === 0) {
    return (
      <section className="flex flex-col gap-6">
        <div className="flex flex-col gap-1">
          <h2 className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
            Projects
          </h2>
          <p className="font-sans text-xs text-muted-foreground/60">
            Check out my work on{" "}
            <a
              href="https://github.com/felipetodev"
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent underline"
            >
              GitHub
            </a>
            .
          </p>
        </div>
      </section>
    );
  }

  const sorted = sortRepos(repos);

  const featuredSet = new Set<string>(FEATURED_REPOS);
  const featured = sorted.filter((r) => featuredSet.has(r.name));
  const rest = sorted.filter((r) => !featuredSet.has(r.name));

  return (
    <section className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h2 className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
          Projects
        </h2>
        <p className="font-sans text-xs text-muted-foreground/60">
          Featured work and experiments — data pulled live from GitHub.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {featured.map((repo) => (
          <ProjectCard key={repo.name} repo={repo} />
        ))}
      </div>

      {rest.length > 0 ? (
        <details className="group">
          <summary className="flex cursor-pointer items-center gap-2 rounded-md border border-border/30 px-3 py-2 text-xs text-muted-foreground transition-all hover:border-border/60 hover:text-foreground">
            <span className="transition-transform group-open:rotate-90">
              &rsaquo;
            </span>
            {rest.length} more projects
          </summary>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            {rest.map((repo) => (
              <ProjectCard key={repo.name} repo={repo} />
            ))}
          </div>
        </details>
      ) : null}
    </section>
  );
}
