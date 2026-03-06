'use client'

import { useRef, useMemo, useEffect } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import * as THREE from 'three'

const STAR_COUNT = 3000
const NEBULA_PARTICLES = 800

function Stars() {
  const pointsRef = useRef<THREE.Points>(null)
  const mouse = useRef({ x: 0, y: 0 })

  const [positions, colors, sizes] = useMemo(() => {
    const positions = new Float32Array(STAR_COUNT * 3)
    const colors = new Float32Array(STAR_COUNT * 3)
    const sizes = new Float32Array(STAR_COUNT)

    for (let i = 0; i < STAR_COUNT; i++) {
      const i3 = i * 3
      
      const radius = Math.random() * 50 + 5
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(2 * Math.random() - 1)
      
      positions[i3] = radius * Math.sin(phi) * Math.cos(theta)
      positions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta)
      positions[i3 + 2] = (Math.random() - 0.5) * 30
      
      const colorChoice = Math.random()
      if (colorChoice < 0.5) {
        colors[i3] = 0.9 + Math.random() * 0.1
        colors[i3 + 1] = 0.9 + Math.random() * 0.1
        colors[i3 + 2] = 1.0
      } else if (colorChoice < 0.8) {
        colors[i3] = 0.24
        colors[i3 + 1] = 0.61
        colors[i3 + 2] = 0.72
      } else {
        colors[i3] = 1.0
        colors[i3 + 1] = 0.95
        colors[i3 + 2] = 0.8
      }
      
      sizes[i] = Math.random() * 2 + 0.5
    }

    return [positions, colors, sizes]
  }, [])

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouse.current.x = (e.clientX / window.innerWidth) * 2 - 1
      mouse.current.y = -(e.clientY / window.innerHeight) * 2 + 1
    }
    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  useFrame((state) => {
    if (!pointsRef.current) return
    
    pointsRef.current.rotation.z += 0.0002
    
    pointsRef.current.rotation.x = THREE.MathUtils.lerp(
      pointsRef.current.rotation.x,
      mouse.current.y * 0.15,
      0.02
    )
    pointsRef.current.rotation.y = THREE.MathUtils.lerp(
      pointsRef.current.rotation.y,
      mouse.current.x * 0.15,
      0.02
    )

    const material = pointsRef.current.material as THREE.ShaderMaterial
    material.uniforms.uTime.value = state.clock.elapsedTime
  })

  const shaderMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
      },
      vertexShader: `
        attribute float size;
        attribute vec3 customColor;
        varying vec3 vColor;
        uniform float uTime;
        
        void main() {
          vColor = customColor;
          vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
          float twinkle = sin(uTime * 2.0 + position.x * 10.0) * 0.3 + 0.7;
          gl_PointSize = size * twinkle * (300.0 / -mvPosition.z);
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        varying vec3 vColor;
        
        void main() {
          float dist = length(gl_PointCoord - vec2(0.5));
          if (dist > 0.5) discard;
          float alpha = 1.0 - smoothstep(0.0, 0.5, dist);
          alpha = pow(alpha, 1.5);
          gl_FragColor = vec4(vColor, alpha);
        }
      `,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    })
  }, [])

  return (
    <points ref={pointsRef} material={shaderMaterial}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={STAR_COUNT}
          array={positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-customColor"
          count={STAR_COUNT}
          array={colors}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-size"
          count={STAR_COUNT}
          array={sizes}
          itemSize={1}
        />
      </bufferGeometry>
    </points>
  )
}

function Nebula() {
  const pointsRef = useRef<THREE.Points>(null)

  const [positions, colors] = useMemo(() => {
    const positions = new Float32Array(NEBULA_PARTICLES * 3)
    const colors = new Float32Array(NEBULA_PARTICLES * 3)

    for (let i = 0; i < NEBULA_PARTICLES; i++) {
      const i3 = i * 3
      
      const arm = Math.floor(Math.random() * 2)
      const armAngle = arm * Math.PI
      const radius = Math.random() * 25 + 3
      const angle = armAngle + (radius * 0.15) + (Math.random() - 0.5) * 0.5
      
      positions[i3] = Math.cos(angle) * radius + (Math.random() - 0.5) * 8
      positions[i3 + 1] = Math.sin(angle) * radius + (Math.random() - 0.5) * 8
      positions[i3 + 2] = (Math.random() - 0.5) * 10
      
      const colorMix = Math.random()
      if (colorMix < 0.4) {
        colors[i3] = 0.24
        colors[i3 + 1] = 0.61
        colors[i3 + 2] = 0.72
      } else if (colorMix < 0.7) {
        colors[i3] = 0.1
        colors[i3 + 1] = 0.2
        colors[i3 + 2] = 0.6
      } else {
        colors[i3] = 0.4
        colors[i3 + 1] = 0.2
        colors[i3 + 2] = 0.5
      }
    }

    return [positions, colors]
  }, [])

  useFrame(() => {
    if (!pointsRef.current) return
    pointsRef.current.rotation.z += 0.0003
  })

  const nebulaShaderMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      vertexShader: `
        attribute vec3 customColor;
        varying vec3 vColor;
        
        void main() {
          vColor = customColor;
          vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
          gl_PointSize = 80.0 * (300.0 / -mvPosition.z);
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        varying vec3 vColor;
        
        void main() {
          float dist = length(gl_PointCoord - vec2(0.5));
          if (dist > 0.5) discard;
          float alpha = 1.0 - smoothstep(0.0, 0.5, dist);
          alpha = pow(alpha, 3.0) * 0.15;
          gl_FragColor = vec4(vColor, alpha);
        }
      `,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    })
  }, [])

  return (
    <points ref={pointsRef} material={nebulaShaderMaterial}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={NEBULA_PARTICLES}
          array={positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-customColor"
          count={NEBULA_PARTICLES}
          array={colors}
          itemSize={3}
        />
      </bufferGeometry>
    </points>
  )
}

function GalaxyCore() {
  const meshRef = useRef<THREE.Mesh>(null)

  useFrame((state) => {
    if (!meshRef.current) return
    meshRef.current.rotation.z += 0.001
    const scale = 1 + Math.sin(state.clock.elapsedTime * 0.5) * 0.1
    meshRef.current.scale.setScalar(scale)
  })

  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[3, 32, 32]} />
      <meshBasicMaterial
        color="#3d9cb7"
        transparent
        opacity={0.08}
        depthWrite={false}
      />
    </mesh>
  )
}

function Scene() {
  return (
    <>
      <GalaxyCore />
      <Nebula />
      <Stars />
    </>
  )
}

export default function GalaxyCanvas() {
  return (
    <Canvas
      camera={{ position: [0, 0, 40], fov: 60 }}
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
