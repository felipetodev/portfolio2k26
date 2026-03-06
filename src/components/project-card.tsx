import { Star, ExternalLink, Github } from 'lucide-react'
import type { GitHubRepo } from '@/lib/github'
import { LANGUAGE_COLORS, PINNED_REPOS } from '@/lib/constants'

interface ProjectCardProps {
  repo: GitHubRepo;
}

const pinnedSet = new Set<string>(PINNED_REPOS)

export function ProjectCard ({ repo }: ProjectCardProps) {
  const languageColor = repo.language
    ? LANGUAGE_COLORS[repo.language] ?? '#888'
    : null
  const isPinned = pinnedSet.has(repo.name)

  return (
    <div className='group relative flex flex-col gap-3 rounded-lg border border-border/40 bg-muted/5 p-4 transition-all duration-300 hover:border-glow-muted/40 hover:bg-muted/10 hover:glow-border'>
      {/* Subtle top accent line */}
      <div className='absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-glow-muted/0 to-transparent transition-all duration-300 group-hover:via-glow-muted/60' />

      <div className='flex items-start justify-between gap-2'>
        <div className='flex items-center gap-2'>
          <h3 className='text-sm font-semibold text-foreground transition-colors group-hover:text-accent'>
            {repo.name}
          </h3>
          {isPinned
            ? (
              <span className='rounded border border-accent/20 bg-accent/5 px-1.5 py-0.5 text-[9px] uppercase tracking-wider text-accent/70'>
                pinned
              </span>
              )
            : null}
        </div>
        <div className='flex shrink-0 items-center gap-1.5'>
          {repo.stargazers_count > 0
            ? (
              <span className='flex items-center gap-1 text-xs text-muted-foreground'>
                <Star className='h-3 w-3' />
                {repo.stargazers_count}
              </span>
              )
            : null}
          {repo.homepage
            ? (
              <a
                href={repo.homepage}
                target='_blank'
                rel='noopener noreferrer'
                aria-label={`Visit ${repo.name}`}
                className='inline-flex h-6 w-6 items-center justify-center rounded text-muted-foreground transition-colors hover:text-foreground'
              >
                <ExternalLink className='h-3 w-3' />
              </a>
              )
            : null}
          <a
            href={repo.html_url}
            target='_blank'
            rel='noopener noreferrer'
            aria-label={`${repo.name} on GitHub`}
            className='inline-flex h-6 w-6 items-center justify-center rounded text-muted-foreground transition-colors hover:text-foreground'
          >
            <Github className='h-3 w-3' />
          </a>
        </div>
      </div>

      {repo.description
        ? (
          <p className='font-sans text-xs leading-relaxed text-muted-foreground/80 line-clamp-2'>
            {repo.description}
          </p>
          )
        : null}

      <div className='mt-auto flex flex-wrap items-center gap-2 pt-1'>
        {languageColor
          ? (
            <span className='flex items-center gap-1.5 text-[11px] text-muted-foreground'>
              <span
                className='h-2 w-2 rounded-full'
                style={{ backgroundColor: languageColor }}
              />
              {repo.language}
            </span>
            )
          : null}
        {repo.topics.slice(0, 3).map((topic) => (
          <span
            key={topic}
            className='rounded-full border border-border/30 bg-muted/10 px-2 py-0.5 text-[10px] text-muted-foreground/70'
          >
            {topic}
          </span>
        ))}
      </div>
    </div>
  )
}
