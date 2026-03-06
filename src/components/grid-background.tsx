'use client'

import { useRef, useMemo } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'

function GridPlane() {
  const meshRef = useRef<THREE.Mesh>(null)
  const { viewport } = useThree()
  const mouse = useRef({ x: 0, y: 0 })
  const targetRotation = useRef({ x: 0, y: 0 })

  const gridSize = 40
  const divisions = 30

  const gridGeometry = useMemo(() => {
    const geometry = new THREE.BufferGeometry()
    const vertices: number[] = []
    const halfSize = gridSize / 2
    const step = gridSize / divisions

    // Horizontal lines
    for (let i = 0; i <= divisions; i++) {
      const y = -halfSize + i * step
      vertices.push(-halfSize, y, 0, halfSize, y, 0)
    }

    // Vertical lines
    for (let i = 0; i <= divisions; i++) {
      const x = -halfSize + i * step
      vertices.push(x, -halfSize, 0, x, halfSize, 0)
    }

    geometry.setAttribute(
      'position',
      new THREE.Float32BufferAttribute(vertices, 3)
    )
    return geometry
  }, [gridSize, divisions])

  useFrame(() => {
    if (!meshRef.current) return

    // Smooth interpolation for rotation
    targetRotation.current.x = mouse.current.y * 0.08
    targetRotation.current.y = mouse.current.x * 0.08

    meshRef.current.rotation.x = THREE.MathUtils.lerp(
      meshRef.current.rotation.x,
      targetRotation.current.x,
      0.05
    )
    meshRef.current.rotation.y = THREE.MathUtils.lerp(
      meshRef.current.rotation.y,
      targetRotation.current.y,
      0.05
    )
  })

  // Track mouse position
  if (typeof window !== 'undefined') {
    const handleMouseMove = (e: MouseEvent) => {
      mouse.current.x = (e.clientX / window.innerWidth) * 2 - 1
      mouse.current.y = -(e.clientY / window.innerHeight) * 2 + 1
    }

    if (!meshRef.current) {
      window.addEventListener('mousemove', handleMouseMove)
    }
  }

  return (
    <lineSegments ref={meshRef} geometry={gridGeometry}>
      <lineBasicMaterial
        color="#3d9cb7"
        transparent
        opacity={0.15}
        depthWrite={false}
      />
    </lineSegments>
  )
}

function Scene() {
  return (
    <>
      <ambientLight intensity={0.5} />
      <GridPlane />
    </>
  )
}

export function GridBackground() {
  return (
    <div
      className="pointer-events-none fixed inset-0 -z-10"
      style={{ opacity: 0.5 }}
    >
      <Canvas
        camera={{ position: [0, 0, 20], fov: 50 }}
        dpr={[1, 1.5]}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: 'high-performance',
        }}
        style={{ background: 'transparent' }}
      >
        <Scene />
      </Canvas>
    </div>
  )
}
