'use client'

import dynamic from 'next/dynamic'

const GalaxyCanvas = dynamic(() => import('./galaxy-canvas'), {
  ssr: false,
  loading: () => null,
})

export function GridBackground() {
  return (
    <div
      className="pointer-events-none fixed inset-0 -z-10"
      style={{ opacity: 0.35 }}
    >
      <GalaxyCanvas />
    </div>
  )
}
