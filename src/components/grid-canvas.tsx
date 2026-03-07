'use client'

// ─── Warning suppression must happen before ANY imports ───────────────────────
;(() => {
  if (typeof console === 'undefined') return
  const _warn = console.warn.bind(console)
  console.warn = (...args: unknown[]) => {
    const msg = args[0]
    if (
      typeof msg === 'string' &&
      /THREE\..*deprecated|deprecated.*THREE\.|Clock.*deprecated|deprecated.*Clock/i.test(msg)
    ) return
    _warn(...args)
  }
})()

// ─── Imports ──────────────────────────────────────────────────────────────────
import { useRef, useEffect, useMemo } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { ShaderMaterial, Vector2, Vector3 } from 'three'
import type * as THREE from 'three'

// ─── Constants ────────────────────────────────────────────────────────────────
const GRID_SIZE       = 80
const GRID_DIVISIONS  = 60
const LINE_COLOR      = new Vector3(0.24, 0.61, 0.72) // #3d9cb7

// ─── Shaders ─────────────────────────────────────────────────────────────────
const vertexShader = /* glsl */ `
  uniform float uTime;
  uniform vec2  uMouse;
  uniform float uHover;

  attribute float lineIndex;

  varying float vDistance;
  varying float vLineIndex;

  void main() {
    vLineIndex = lineIndex;

    vec4  worldPos   = modelMatrix * vec4(position, 1.0);
    vec2  mouseWorld = uMouse * 30.0;
    float dist       = distance(worldPos.xy, mouseWorld);
    vDistance = dist;

    vec3  pos       = position;
    float influence = smoothstep(15.0, 0.0, dist) * uHover;
    pos.z += sin(dist * 0.5 - uTime * 2.0) * influence * 0.8;

    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    gl_Position     = projectionMatrix * mvPosition;
  }
`

const fragmentShader = /* glsl */ `
  uniform vec3  uColor;
  uniform float uTime;
  uniform float uHover;

  varying float vDistance;
  varying float vLineIndex;

  void main() {
    float baseOpacity = 0.12;
    float glow        = smoothstep(20.0, 0.0, vDistance) * uHover;
    float pulse       = sin(uTime * 3.0 - vDistance * 0.3) * 0.5 + 0.5;
    vec3  glowColor   = uColor + vec3(0.1, 0.2, 0.3) * glow;
    float opacity     = baseOpacity + glow * 0.35 * pulse;

    gl_FragColor = vec4(glowColor, opacity);
  }
`

const pointVertexShader = /* glsl */ `
  uniform float uTime;
  uniform vec2  uMouse;
  uniform float uHover;

  varying float vDistance;
  varying float vOpacity;

  void main() {
    vec4  worldPos   = modelMatrix * vec4(position, 1.0);
    vec2  mouseWorld = uMouse * 30.0;
    float dist       = distance(worldPos.xy, mouseWorld);
    vDistance = dist;

    float influence = smoothstep(12.0, 0.0, dist) * uHover;
    vOpacity        = 0.08 + influence * 0.6;

    vec3 pos = position;
    pos.z   += sin(dist * 0.5 - uTime * 2.0) * influence * 0.8;

    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    gl_PointSize    = (2.0 + influence * 6.0) * (300.0 / -mvPosition.z);
    gl_Position     = projectionMatrix * mvPosition;
  }
`

const pointFragmentShader = /* glsl */ `
  uniform vec3  uColor;
  uniform float uTime;

  varying float vDistance;
  varying float vOpacity;

  void main() {
    float dist = length(gl_PointCoord - vec2(0.5));
    if (dist > 0.5) discard;

    float alpha = 1.0 - smoothstep(0.0, 0.5, dist);
    alpha       = pow(alpha, 1.5) * vOpacity;
    float pulse = sin(uTime * 2.0 - vDistance * 0.2) * 0.2 + 0.8;

    gl_FragColor = vec4(uColor + vec3(0.15), alpha * pulse);
  }
`

// ─── InteractiveGrid ─────────────────────────────────────────────────────────
function InteractiveGrid() {
  const groupRef    = useRef<THREE.Group>(null)
  const mouse       = useRef({ x: 0, y: 0 })
  const mouseSmooth = useRef({ x: 0, y: 0 })
  const timeRef     = useRef(0)
  const hoverRef    = useRef(0)

  void useThree((s) => s.size)

  useEffect(() => {
    const onMove  = (e: MouseEvent) => {
      mouse.current.x =  (e.clientX / window.innerWidth)  * 2 - 1
      mouse.current.y = -(e.clientY / window.innerHeight) * 2 + 1
    }
    const onEnter = () => { hoverRef.current = 1 }
    const onLeave = () => { hoverRef.current = 0 }

    window.addEventListener('mousemove',    onMove)
    document.addEventListener('mouseenter', onEnter)
    document.addEventListener('mouseleave', onLeave)
    return () => {
      window.removeEventListener('mousemove',    onMove)
      document.removeEventListener('mouseenter', onEnter)
      document.removeEventListener('mouseleave', onLeave)
    }
  }, [])

  const { gridGeometry, lineIndices } = useMemo(() => {
    const vertices: number[] = []
    const indices:  number[] = []
    const step = GRID_SIZE / GRID_DIVISIONS
    const half = GRID_SIZE / 2
    let lineIdx = 0

    for (let i = 0; i <= GRID_DIVISIONS; i++) {
      const y = i * step - half
      vertices.push(-half, y, 0, half, y, 0)
      indices.push(lineIdx, lineIdx++)
    }
    for (let i = 0; i <= GRID_DIVISIONS; i++) {
      const x = i * step - half
      vertices.push(x, -half, 0, x, half, 0)
      indices.push(lineIdx, lineIdx++)
    }

    return {
      gridGeometry: new Float32Array(vertices),
      lineIndices:  new Float32Array(indices),
    }
  }, [])

  const pointsGeometry = useMemo(() => {
    const positions: number[] = []
    const step = GRID_SIZE / GRID_DIVISIONS
    const half = GRID_SIZE / 2

    for (let i = 0; i <= GRID_DIVISIONS; i++)
      for (let j = 0; j <= GRID_DIVISIONS; j++)
        positions.push(i * step - half, j * step - half, 0)

    return new Float32Array(positions)
  }, [])

  const lineMaterial = useMemo(() => new ShaderMaterial({
    uniforms: {
      uTime:  { value: 0 },
      uMouse: { value: new Vector2(0, 0) },
      uColor: { value: LINE_COLOR },
      uHover: { value: 1 },
    },
    vertexShader,
    fragmentShader,
    transparent: true,
    depthWrite:  false,
  }), [])

  const pointMaterial = useMemo(() => new ShaderMaterial({
    uniforms: {
      uTime:  { value: 0 },
      uMouse: { value: new Vector2(0, 0) },
      uColor: { value: LINE_COLOR },
      uHover: { value: 1 },
    },
    vertexShader:   pointVertexShader,
    fragmentShader: pointFragmentShader,
    transparent: true,
    depthWrite:  false,
  }), [])

  useFrame((_, delta) => {
    if (!groupRef.current) return

    timeRef.current += delta

    mouseSmooth.current.x += (mouse.current.x - mouseSmooth.current.x) * 0.08
    mouseSmooth.current.y += (mouse.current.y - mouseSmooth.current.y) * 0.08

    const { x, y } = mouseSmooth.current
    const t = timeRef.current

    lineMaterial.uniforms.uTime.value  = t
    lineMaterial.uniforms.uMouse.value.set(x, y)
    lineMaterial.uniforms.uHover.value = hoverRef.current

    pointMaterial.uniforms.uTime.value  = t
    pointMaterial.uniforms.uMouse.value.set(x, y)
    pointMaterial.uniforms.uHover.value = hoverRef.current

    groupRef.current.rotation.x = -0.5 + y * 0.1
    groupRef.current.rotation.y = x * 0.12
    groupRef.current.position.z = Math.sin(t * 0.2) * 0.3
  })

  return (
    <group ref={groupRef} position={[0, 0, -20]}>
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

// ─── GridCanvas (default export) ──────────────────────────────────────────────
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