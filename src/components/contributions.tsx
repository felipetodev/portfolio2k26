import { GitPullRequest, ExternalLink } from 'lucide-react'
import { OSS_CONTRIBUTIONS } from '@/lib/constants'

export function Contributions () {
  return (
    <section className='flex flex-col gap-4'>
      <div className='flex flex-col gap-1'>
        <h2 className='text-sm font-medium uppercase tracking-wider text-muted-foreground'>
          Open Source
        </h2>
        <p className='font-sans text-xs text-muted-foreground/60'>
          Contributions to projects I use and care about.
        </p>
      </div>
      <div className='flex flex-col gap-1'>
        {OSS_CONTRIBUTIONS.map((contribution) => (
          <a
            key={contribution.repo}
            href={contribution.url}
            target='_blank'
            rel='noopener noreferrer'
            className='group flex items-start gap-3 rounded-lg p-3 transition-all duration-200 hover:bg-muted/20'
          >
            <GitPullRequest className='mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-500/80' />
            <div className='flex flex-1 items-baseline gap-2'>
              <span className='shrink-0 text-xs font-medium text-foreground/90 transition-colors group-hover:text-accent'>
                {contribution.repo}
              </span>
              <span className='hidden text-muted-foreground/20 sm:inline'>
                &mdash;
              </span>
              <span className='hidden font-sans text-xs text-muted-foreground/60 sm:inline'>
                {contribution.description}
              </span>
            </div>
            <ExternalLink className='mt-0.5 h-3 w-3 shrink-0 text-muted-foreground/30 transition-all group-hover:text-muted-foreground' />
          </a>
        ))}
      </div>
    </section>
  )
}
