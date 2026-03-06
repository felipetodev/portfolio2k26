'use client'

import dynamic from 'next/dynamic'

const GridCanvas = dynamic(() => import('./grid-canvas'), {
  ssr: false,
  loading: () => null,
})

export function GridBackground() {
  return (
    <div
      className="pointer-events-none fixed inset-0 -z-10"
      style={{ opacity: 0.5 }}
    >
      <GridCanvas />
    </div>
  )
}
