'use client'

// Suppress THREE.Clock deprecation warning BEFORE any Three.js imports
const _origWarn = typeof console !== 'undefined' ? console.warn : () => {}
if (typeof console !== 'undefined') {
  console.warn = function (...args: unknown[]) {
    if (args[0] && typeof args[0] === 'string' && 
        (args[0].includes('Clock') || args[0].includes('deprecated'))) {
      return
    }
    _origWarn.apply(console, args)
  }
}

import { useRef, useEffect, useMemo } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import {
  ShaderMaterial,
  Vector2,
  Vector3,
} from 'three'

const GRID_SIZE = 80
const GRID_DIVISIONS = 60
const LINE_COLOR = new Vector3(0.24, 0.61, 0.72) // #3d9cb7

// Custom shader for interactive glow effect
const vertexShader = `
  uniform float uTime;
  uniform vec2 uMouse;
  uniform float uHover;
  
  attribute float lineIndex;
  
  varying float vDistance;
  varying float vLineIndex;
  
  void main() {
    vLineIndex = lineIndex;
    
    vec4 worldPos = modelMatrix * vec4(position, 1.0);
    
    // Calculate distance from mouse in world space (projected to grid plane)
    vec2 mouseWorld = uMouse * 30.0;
    float dist = distance(worldPos.xy, mouseWorld);
    vDistance = dist;
    
    // Subtle vertex displacement based on proximity to cursor
    vec3 pos = position;
    float influence = smoothstep(15.0, 0.0, dist) * uHover;
    pos.z += sin(dist * 0.5 - uTime * 2.0) * influence * 0.8;
    
    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mvPosition;
  }
`

const fragmentShader = `
  uniform vec3 uColor;
  uniform float uTime;
  uniform float uHover;
  
  varying float vDistance;
  varying float vLineIndex;
  
  void main() {
    // Base opacity
    float baseOpacity = 0.12;
    
    // Glow effect based on distance to cursor
    float glow = smoothstep(20.0, 0.0, vDistance) * uHover;
    float pulse = sin(uTime * 3.0 - vDistance * 0.3) * 0.5 + 0.5;
    
    // Color shift near cursor (slightly brighter cyan)
    vec3 glowColor = uColor + vec3(0.1, 0.2, 0.3) * glow;
    
    // Final opacity with glow
    float opacity = baseOpacity + glow * 0.35 * pulse;
    
    gl_FragColor = vec4(glowColor, opacity);
  }
`

// Intersection points shader
const pointVertexShader = `
  uniform float uTime;
  uniform vec2 uMouse;
  uniform float uHover;
  
  varying float vDistance;
  varying float vOpacity;
  
  void main() {
    vec4 worldPos = modelMatrix * vec4(position, 1.0);
    vec2 mouseWorld = uMouse * 30.0;
    float dist = distance(worldPos.xy, mouseWorld);
    vDistance = dist;
    
    // Points grow near cursor
    float influence = smoothstep(12.0, 0.0, dist) * uHover;
    vOpacity = 0.08 + influence * 0.6;
    
    vec3 pos = position;
    pos.z += sin(dist * 0.5 - uTime * 2.0) * influence * 0.8;
    
    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    
    // Point size based on proximity
    gl_PointSize = (2.0 + influence * 6.0) * (300.0 / -mvPosition.z);
    gl_Position = projectionMatrix * mvPosition;
  }
`

const pointFragmentShader = `
  uniform vec3 uColor;
  uniform float uTime;
  
  varying float vDistance;
  varying float vOpacity;
  
  void main() {
    float dist = length(gl_PointCoord - vec2(0.5));
    if (dist > 0.5) discard;
    
    float alpha = 1.0 - smoothstep(0.0, 0.5, dist);
    alpha = pow(alpha, 1.5) * vOpacity;
    
    // Slight pulse
    float pulse = sin(uTime * 2.0 - vDistance * 0.2) * 0.2 + 0.8;
    
    gl_FragColor = vec4(uColor + vec3(0.15), alpha * pulse);
  }
`

function InteractiveGrid() {
  const groupRef = useRef<THREE.Group>(null)
  const materialRef = useRef<ShaderMaterial>(null)
  const pointMaterialRef = useRef<ShaderMaterial>(null)
  const mouse = useRef({ x: 0, y: 0 })
  const mouseSmooth = useRef({ x: 0, y: 0 })
  const timeRef = useRef(0)
  const hoverRef = useRef(0)
  const { size } = useThree()

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouse.current.x = (e.clientX / window.innerWidth) * 2 - 1
      mouse.current.y = -(e.clientY / window.innerHeight) * 2 + 1
    }
    const handleMouseEnter = () => {
      hoverRef.current = 1
    }
    const handleMouseLeave = () => {
      hoverRef.current = 0
    }
    window.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseenter', handleMouseEnter)
    document.addEventListener('mouseleave', handleMouseLeave)
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseenter', handleMouseEnter)
      document.removeEventListener('mouseleave', handleMouseLeave)
    }
  }, [])

  const { gridGeometry, lineIndices } = useMemo(() => {
    const vertices: number[] = []
    const indices: number[] = []
    const step = GRID_SIZE / GRID_DIVISIONS
    const half = GRID_SIZE / 2
    let lineIdx = 0

    // Horizontal lines
    for (let i = 0; i <= GRID_DIVISIONS; i++) {
      const y = i * step - half
      vertices.push(-half, y, 0)
      vertices.push(half, y, 0)
      indices.push(lineIdx, lineIdx)
      lineIdx++
    }

    // Vertical lines
    for (let i = 0; i <= GRID_DIVISIONS; i++) {
      const x = i * step - half
      vertices.push(x, -half, 0)
      vertices.push(x, half, 0)
      indices.push(lineIdx, lineIdx)
      lineIdx++
    }

    return {
      gridGeometry: new Float32Array(vertices),
      lineIndices: new Float32Array(indices),
    }
  }, [])

  const pointsGeometry = useMemo(() => {
    const positions: number[] = []
    const step = GRID_SIZE / GRID_DIVISIONS
    const half = GRID_SIZE / 2

    // Create points at grid intersections
    for (let i = 0; i <= GRID_DIVISIONS; i++) {
      for (let j = 0; j <= GRID_DIVISIONS; j++) {
        const x = i * step - half
        const y = j * step - half
        positions.push(x, y, 0)
      }
    }

    return new Float32Array(positions)
  }, [])

  const lineMaterial = useMemo(() => {
    return new ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uMouse: { value: new Vector2(0, 0) },
        uColor: { value: LINE_COLOR },
        uHover: { value: 1 },
      },
      vertexShader,
      fragmentShader,
      transparent: true,
      depthWrite: false,
    })
  }, [])

  const pointMaterial = useMemo(() => {
    return new ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uMouse: { value: new Vector2(0, 0) },
        uColor: { value: LINE_COLOR },
        uHover: { value: 1 },
      },
      vertexShader: pointVertexShader,
      fragmentShader: pointFragmentShader,
      transparent: true,
      depthWrite: false,
    })
  }, [])

  useFrame((_, delta) => {
    if (!groupRef.current) return

    timeRef.current += delta

    // Smooth mouse following
    mouseSmooth.current.x += (mouse.current.x - mouseSmooth.current.x) * 0.08
    mouseSmooth.current.y += (mouse.current.y - mouseSmooth.current.y) * 0.08

    // Update shader uniforms
    lineMaterial.uniforms.uTime.value = timeRef.current
    lineMaterial.uniforms.uMouse.value.set(mouseSmooth.current.x, mouseSmooth.current.y)
    lineMaterial.uniforms.uHover.value = hoverRef.current

    pointMaterial.uniforms.uTime.value = timeRef.current
    pointMaterial.uniforms.uMouse.value.set(mouseSmooth.current.x, mouseSmooth.current.y)
    pointMaterial.uniforms.uHover.value = hoverRef.current

    // Subtle rotation based on mouse position
    groupRef.current.rotation.x = -0.5 + mouseSmooth.current.y * 0.1
    groupRef.current.rotation.y = mouseSmooth.current.x * 0.12

    // Very subtle breathing animation
    groupRef.current.position.z = Math.sin(timeRef.current * 0.2) * 0.3
  })

  return (
    <group ref={groupRef} position={[0, 0, -20]}>
      {/* Grid lines */}
      <lineSegments material={lineMaterial}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={gridGeometry.length / 3}
            array={gridGeometry}
            itemSize={3}
          />
          <bufferAttribute
            attach="attributes-lineIndex"
            count={lineIndices.length}
            array={lineIndices}
            itemSize={1}
          />
        </bufferGeometry>
      </lineSegments>

      {/* Intersection points */}
      <points material={pointMaterial}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={pointsGeometry.length / 3}
            array={pointsGeometry}
            itemSize={3}
          />
        </bufferGeometry>
      </points>
    </group>
  )
}

export default function GridCanvas() {
  return (
    <Canvas
      camera={{ position: [0, 0, 35], fov: 50 }}
      gl={{ antialias: true, alpha: true }}
      style={{ background: 'transparent' }}
      frameloop="always"
    >
      <InteractiveGrid />
    </Canvas>
  )
}
