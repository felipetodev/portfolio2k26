'use client'

import { useRef, useMemo, useEffect, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'

const GRID_SIZE = 20
const CELL_SIZE = 2
const HOVER_RADIUS = 3

interface GridCell {
  x: number
  y: number
  elevation: number
  targetElevation: number
}

function InteractiveGrid() {
  const groupRef = useRef<THREE.Group>(null)
  const cellsRef = useRef<GridCell[][]>([])
  const trianglesRef = useRef<THREE.Group>(null)
  const mouse = useRef(new THREE.Vector2(9999, 9999))
  const raycaster = useRef(new THREE.Raycaster())
  const planeRef = useRef<THREE.Mesh>(null)
  const { camera } = useThree()

  // Initialize grid cells
  useMemo(() => {
    const cells: GridCell[][] = []
    for (let i = 0; i < GRID_SIZE; i++) {
      cells[i] = []
      for (let j = 0; j < GRID_SIZE; j++) {
        cells[i][j] = {
          x: (i - GRID_SIZE / 2) * CELL_SIZE,
          y: (j - GRID_SIZE / 2) * CELL_SIZE,
          elevation: 0,
          targetElevation: 0,
        }
      }
    }
    cellsRef.current = cells
  }, [])

  // Create grid lines geometry
  const gridGeometry = useMemo(() => {
    const positions: number[] = []
    const halfSize = (GRID_SIZE * CELL_SIZE) / 2

    // Horizontal lines
    for (let i = 0; i <= GRID_SIZE; i++) {
      const y = i * CELL_SIZE - halfSize
      positions.push(-halfSize, y, 0, halfSize, y, 0)
    }

    // Vertical lines
    for (let i = 0; i <= GRID_SIZE; i++) {
      const x = i * CELL_SIZE - halfSize
      positions.push(x, -halfSize, 0, x, halfSize, 0)
    }

    const geometry = new THREE.BufferGeometry()
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
    return geometry
  }, [])

  // Track mouse movement
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouse.current.x = (e.clientX / window.innerWidth) * 2 - 1
      mouse.current.y = -(e.clientY / window.innerHeight) * 2 + 1
    }
    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  useFrame(() => {
    if (!groupRef.current || !planeRef.current || !trianglesRef.current) return

    // Raycast to find hover position
    raycaster.current.setFromCamera(mouse.current, camera)
    const intersects = raycaster.current.intersectObject(planeRef.current)

    let hoverX = 9999
    let hoverY = 9999

    if (intersects.length > 0) {
      const point = intersects[0].point
      hoverX = point.x
      hoverY = point.y
    }

    // Update cell elevations based on hover
    const cells = cellsRef.current
    for (let i = 0; i < GRID_SIZE; i++) {
      for (let j = 0; j < GRID_SIZE; j++) {
        const cell = cells[i][j]
        const dx = cell.x + CELL_SIZE / 2 - hoverX
        const dy = cell.y + CELL_SIZE / 2 - hoverY
        const dist = Math.sqrt(dx * dx + dy * dy)

        if (dist < HOVER_RADIUS * CELL_SIZE) {
          const intensity = 1 - dist / (HOVER_RADIUS * CELL_SIZE)
          cell.targetElevation = intensity * 1.5
        } else {
          cell.targetElevation = 0
        }

        // Smooth interpolation
        cell.elevation += (cell.targetElevation - cell.elevation) * 0.08
      }
    }

    // Update triangles
    const triangles = trianglesRef.current.children as THREE.Mesh[]
    let triangleIndex = 0

    for (let i = 0; i < GRID_SIZE; i++) {
      for (let j = 0; j < GRID_SIZE; j++) {
        const cell = cells[i][j]
        const triangle = triangles[triangleIndex]

        if (triangle) {
          const scale = cell.elevation * 0.8
          triangle.scale.set(scale, scale, scale)
          triangle.position.z = cell.elevation * 0.5
          triangle.rotation.z += 0.02 * cell.elevation

          const material = triangle.material as THREE.MeshBasicMaterial
          material.opacity = cell.elevation * 0.6
        }

        triangleIndex++
      }
    }

    // Subtle rotation based on mouse
    groupRef.current.rotation.x = THREE.MathUtils.lerp(
      groupRef.current.rotation.x,
      -Math.PI / 2 + mouse.current.y * 0.1,
      0.02
    )
    groupRef.current.rotation.z = THREE.MathUtils.lerp(
      groupRef.current.rotation.z,
      mouse.current.x * 0.1,
      0.02
    )
  })

  // Create triangle shapes for each cell
  const triangles = useMemo(() => {
    const shapes: JSX.Element[] = []
    const halfSize = (GRID_SIZE * CELL_SIZE) / 2

    for (let i = 0; i < GRID_SIZE; i++) {
      for (let j = 0; j < GRID_SIZE; j++) {
        const x = i * CELL_SIZE - halfSize + CELL_SIZE / 2
        const y = j * CELL_SIZE - halfSize + CELL_SIZE / 2

        shapes.push(
          <mesh key={`${i}-${j}`} position={[x, y, 0]}>
            <coneGeometry args={[CELL_SIZE * 0.4, CELL_SIZE * 0.6, 3]} />
            <meshBasicMaterial
              color="#3d9cb7"
              transparent
              opacity={0}
              depthWrite={false}
              side={THREE.DoubleSide}
            />
          </mesh>
        )
      }
    }

    return shapes
  }, [])

  return (
    <group ref={groupRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, -5]}>
      {/* Invisible plane for raycasting */}
      <mesh ref={planeRef} visible={false}>
        <planeGeometry args={[GRID_SIZE * CELL_SIZE * 2, GRID_SIZE * CELL_SIZE * 2]} />
        <meshBasicMaterial />
      </mesh>

      {/* Grid lines */}
      <lineSegments geometry={gridGeometry}>
        <lineBasicMaterial color="#3d9cb7" transparent opacity={0.15} />
      </lineSegments>

      {/* Triangle shapes */}
      <group ref={trianglesRef}>{triangles}</group>

      {/* Intersection points */}
      <Points />
    </group>
  )
}

function Points() {
  const pointsRef = useRef<THREE.Points>(null)

  const positions = useMemo(() => {
    const pos: number[] = []
    const halfSize = (GRID_SIZE * CELL_SIZE) / 2

    for (let i = 0; i <= GRID_SIZE; i++) {
      for (let j = 0; j <= GRID_SIZE; j++) {
        pos.push(
          i * CELL_SIZE - halfSize,
          j * CELL_SIZE - halfSize,
          0
        )
      }
    }

    return new Float32Array(pos)
  }, [])

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={positions.length / 3}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        color="#3d9cb7"
        size={3}
        transparent
        opacity={0.3}
        sizeAttenuation={false}
      />
    </points>
  )
}

function Scene() {
  return (
    <>
      <InteractiveGrid />
    </>
  )
}

export default function GalaxyCanvas() {
  return (
    <Canvas
      camera={{ position: [0, 15, 30], fov: 50 }}
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
  )
}
