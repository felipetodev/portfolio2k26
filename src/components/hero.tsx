import { MapPin } from 'lucide-react'
import { SITE_CONFIG } from '@/lib/constants'

export function Hero () {
  return (
    <section className='flex flex-col gap-6 pt-4'>
      <div className='flex items-center gap-2 text-xs text-muted-foreground'>
        <MapPin className='h-3 w-3' />
        <span>{SITE_CONFIG.location}</span>
        <span className='relative flex h-2 w-2'>
          <span className='absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75' />
          <span className='relative inline-flex h-2 w-2 rounded-full bg-emerald-500' />
        </span>
        <span className='text-muted-foreground/50'>
          / shipping now
        </span>
      </div>

      <div className='flex flex-col gap-2'>
        <h1 className='glow-text text-4xl font-bold tracking-tight text-foreground sm:text-5xl'>
          {SITE_CONFIG.name}
        </h1>
        <p className='text-base text-accent sm:text-lg'>
          {SITE_CONFIG.title}
        </p>
      </div>

      <p className='max-w-lg font-sans text-sm leading-relaxed text-muted-foreground'>
        {SITE_CONFIG.bio}
      </p>
    </section>
  )
}
