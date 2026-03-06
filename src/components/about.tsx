import { SITE_CONFIG } from '@/lib/constants'

export function About () {
  return (
    <section className='flex flex-col gap-4'>
      <h2 className='text-sm font-medium uppercase tracking-wider text-muted-foreground'>
        About
      </h2>
      <div className='flex flex-col gap-3 font-sans text-sm leading-relaxed text-muted-foreground'>
        <p className='text-pretty'>{SITE_CONFIG.extendedBio}</p>
      </div>
    </section>
  )
}
