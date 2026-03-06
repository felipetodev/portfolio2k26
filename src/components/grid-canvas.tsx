'use client'

import { useRef, useEffect, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import type { Group, LineSegments } from 'three'

const GRID_SIZE = 40
const GRID_DIVISIONS = 40
const LINE_COLOR = '#3d9cb7'

function Grid() {
  const groupRef = useRef<Group>(null)
  const linesRef = useRef<LineSegments>(null)
  const mouse = useRef({ x: 0, y: 0 })

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouse.current.x = (e.clientX / window.innerWidth) * 2 - 1
      mouse.current.y = -(e.clientY / window.innerHeight) * 2 + 1
    }
    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  const gridGeometry = useMemo(() => {
    const vertices: number[] = []
    const step = GRID_SIZE / GRID_DIVISIONS
    const half = GRID_SIZE / 2

    // Horizontal lines
    for (let i = 0; i <= GRID_DIVISIONS; i++) {
      const y = i * step - half
      vertices.push(-half, y, 0)
      vertices.push(half, y, 0)
    }

    // Vertical lines
    for (let i = 0; i <= GRID_DIVISIONS; i++) {
      const x = i * step - half
      vertices.push(x, -half, 0)
      vertices.push(x, half, 0)
    }

    return new Float32Array(vertices)
  }, [])

  useFrame((state) => {
    if (!groupRef.current) return

    const time = state.clock.elapsedTime

    // Subtle rotation based on mouse position
    groupRef.current.rotation.x = -0.4 + mouse.current.y * 0.1
    groupRef.current.rotation.y = mouse.current.x * 0.15

    // Very subtle wave animation
    groupRef.current.position.z = Math.sin(time * 0.3) * 0.2
  })

  return (
    <group ref={groupRef} position={[0, 0, -15]}>
      <lineSegments ref={linesRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={gridGeometry.length / 3}
            array={gridGeometry}
            itemSize={3}
          />
        </bufferGeometry>
        <lineBasicMaterial
          color={LINE_COLOR}
          transparent
          opacity={0.15}
        />
      </lineSegments>
    </group>
  )
}

export default function GridCanvas() {
  return (
    <Canvas
      camera={{ position: [0, 0, 20], fov: 60 }}
      gl={{ antialias: true, alpha: true }}
      style={{ background: 'transparent' }}
    >
      <Grid />
    </Canvas>
  )
}
