"use client"

import { useRef, useState, Suspense, useEffect, Component, ReactNode, useCallback, useMemo } from "react"
import { Canvas, useLoader } from "@react-three/fiber"
import { OrbitControls } from "@react-three/drei"
import { MapPin, X, ChevronRight, Building2, Home } from "lucide-react"
import * as THREE from "three"
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js"

class OBJErrorBoundary extends Component<{ children: ReactNode }, { error: string | null }> {
  state = { error: null }
  static getDerivedStateFromError(e: Error) { return { error: e.message } }
  render() {
    if (this.state.error) {
      return (
        <mesh position={[0, 1, 0]}>
          <boxGeometry args={[3, 2, 3]} />
          <meshStandardMaterial color="#ef4444" />
        </mesh>
      )
    }
    return this.props.children
  }
}

// Procedural city texture — zero network requests, instant load
const CITY_TEX_CACHE: { low?: THREE.CanvasTexture; high?: THREE.CanvasTexture } = {}

function buildProceduralCityTexture(lowPower: boolean): THREE.CanvasTexture {
  const key = lowPower ? 'low' : 'high'
  if (CITY_TEX_CACHE[key]) return CITY_TEX_CACHE[key]!

  const SIZE = lowPower ? 1024 : 2048
  const canvas = document.createElement('canvas')
  canvas.width = SIZE
  canvas.height = SIZE
  const ctx = canvas.getContext('2d')!

  // Dark base
  ctx.fillStyle = '#0c1424'
  ctx.fillRect(0, 0, SIZE, SIZE)

  const rng = (seed: number) => {
    let s = seed
    return () => { s = (s * 16807 + 0) % 2147483647; return (s - 1) / 2147483646 }
  }
  const rand = rng(42)

  // City blocks between roads
  const BLOCK = SIZE / 16
  for (let row = 0; row < 16; row++) {
    for (let col = 0; col < 16; col++) {
      const x = col * BLOCK + 2
      const y = row * BLOCK + 2
      const w = BLOCK - 4
      const h = BLOCK - 4
      const v = 14 + Math.floor(rand() * 10)
      ctx.fillStyle = `rgb(${v}, ${v + 6}, ${v + 14})`
      ctx.fillRect(x, y, w, h)

      // Sub-buildings inside each block
      const subs = 2 + Math.floor(rand() * 3)
      for (let s = 0; s < subs; s++) {
        const sx = x + 4 + rand() * (w - 20)
        const sy = y + 4 + rand() * (h - 20)
        const sw = 8 + rand() * 16
        const sh = 8 + rand() * 16
        const bv = 18 + Math.floor(rand() * 14)
        ctx.fillStyle = `rgb(${bv}, ${bv + 4}, ${bv + 10})`
        ctx.fillRect(sx, sy, sw, sh)
      }
    }
  }

  // Secondary streets (grid)
  ctx.strokeStyle = '#1a2a40'
  ctx.lineWidth = 2
  for (let i = 1; i < 16; i++) {
    const p = i * BLOCK
    ctx.beginPath(); ctx.moveTo(p, 0); ctx.lineTo(p, SIZE); ctx.stroke()
    ctx.beginPath(); ctx.moveTo(0, p); ctx.lineTo(SIZE, p); ctx.stroke()
  }

  // Main avenues (wider, brighter)
  const avenues = [4, 8, 12].map(i => i * BLOCK)
  ctx.strokeStyle = '#243550'
  ctx.lineWidth = lowPower ? 4 : 6
  for (const a of avenues) {
    ctx.beginPath(); ctx.moveTo(a, 0); ctx.lineTo(a, SIZE); ctx.stroke()
    ctx.beginPath(); ctx.moveTo(0, a); ctx.lineTo(SIZE, a); ctx.stroke()
  }

  // Avenue glow
  ctx.strokeStyle = 'rgba(232, 255, 80, 0.06)'
  ctx.lineWidth = lowPower ? 10 : 16
  for (const a of avenues) {
    ctx.beginPath(); ctx.moveTo(a, 0); ctx.lineTo(a, SIZE); ctx.stroke()
    ctx.beginPath(); ctx.moveTo(0, a); ctx.lineTo(SIZE, a); ctx.stroke()
  }

  // Parks
  const parks = [
    { x: 1, y: 1, w: 2, h: 2 },
    { x: 10, y: 10, w: 2, h: 2 },
    { x: 5, y: 13, w: 2, h: 1.5 },
    { x: 13, y: 3, w: 1.5, h: 2 },
  ]
  for (const p of parks) {
    ctx.fillStyle = 'rgba(40, 100, 50, 0.5)'
    ctx.fillRect(p.x * BLOCK + 6, p.y * BLOCK + 6, p.w * BLOCK - 12, p.h * BLOCK - 12)
    // Tree dots
    const trees = 3 + Math.floor(rand() * 5)
    for (let t = 0; t < trees; t++) {
      ctx.fillStyle = 'rgba(55, 130, 65, 0.6)'
      const tx = p.x * BLOCK + 12 + rand() * (p.w * BLOCK - 24)
      const ty = p.y * BLOCK + 12 + rand() * (p.h * BLOCK - 24)
      ctx.beginPath(); ctx.arc(tx, ty, 3 + rand() * 4, 0, Math.PI * 2); ctx.fill()
    }
  }

  // Intersection highlights
  for (const ax of avenues) {
    for (const ay of avenues) {
      ctx.fillStyle = 'rgba(232, 255, 80, 0.04)'
      ctx.beginPath(); ctx.arc(ax, ay, lowPower ? 16 : 24, 0, Math.PI * 2); ctx.fill()
    }
  }

  // District labels
  if (!lowPower) {
    ctx.font = '600 11px system-ui'
    ctx.fillStyle = 'rgba(150, 170, 200, 0.25)'
    ctx.textAlign = 'center'
    const labels = [
      { t: 'CENTRO', x: 8 * BLOCK, y: 8 * BLOCK },
      { t: 'LA GRAN JARDÍN', x: 12 * BLOCK, y: 3 * BLOCK },
      { t: 'CAMPESTRE', x: 12 * BLOCK, y: 12 * BLOCK },
      { t: 'EL REFUGIO', x: 3 * BLOCK, y: 13 * BLOCK },
    ]
    labels.forEach(l => ctx.fillText(l.t, l.x, l.y))
  }

  const texture = new THREE.CanvasTexture(canvas)
  texture.generateMipmaps = true
  texture.minFilter = THREE.LinearMipmapLinearFilter
  texture.magFilter = THREE.LinearFilter
  texture.anisotropy = lowPower ? 2 : 4
  texture.needsUpdate = true

  CITY_TEX_CACHE[key] = texture
  return texture
}

// Runtime GLB optimization: downscale textures + simplify materials for mobile
function optimizeGLBScene(scene: THREE.Group, lowPower: boolean) {
  const MAX_TEX = lowPower ? 2048 : 4096

  scene.traverse((child) => {
    if (!(child as THREE.Mesh).isMesh) return
    const mesh = child as THREE.Mesh
    mesh.castShadow = false
    mesh.receiveShadow = false

    const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material]
    mats.forEach((m) => {
      const mat = m as THREE.MeshStandardMaterial
      mat.envMapIntensity = 0.5
      mat.roughness = Math.min(mat.roughness, 0.85)

      // Downscale textures that exceed MAX_TEX
      const texProps: (keyof THREE.MeshStandardMaterial)[] = ['map', 'normalMap', 'roughnessMap', 'metalnessMap', 'aoMap']
      texProps.forEach((prop) => {
        const tex = (mat as any)[prop] as THREE.Texture | null
        if (!tex?.image) return
        const img = tex.image as HTMLImageElement | HTMLCanvasElement | ImageBitmap
        const w = 'naturalWidth' in img ? (img as HTMLImageElement).naturalWidth : img.width
        const h = 'naturalHeight' in img ? (img as HTMLImageElement).naturalHeight : img.height
        if (w <= MAX_TEX && h <= MAX_TEX) return

        // Downscale via offscreen canvas
        const scale = MAX_TEX / Math.max(w, h)
        const nw = Math.floor(w * scale)
        const nh = Math.floor(h * scale)
        const c = document.createElement('canvas')
        c.width = nw; c.height = nh
        const cx = c.getContext('2d')
        if (cx) {
          cx.drawImage(img as CanvasImageSource, 0, 0, nw, nh)
          tex.image = c
          tex.needsUpdate = true
        }
      })

      mat.needsUpdate = true
    })

    // Merge indexed geometry for fewer draw calls
    const geo = mesh.geometry
    if (geo && !geo.index && geo.attributes.position) {
      const posCount = geo.attributes.position.count
      if (posCount > 100) {
        const indices = new Uint32Array(posCount)
        for (let i = 0; i < posCount; i++) indices[i] = i
        geo.setIndex(new THREE.BufferAttribute(indices, 1))
      }
    }
  })
}

const BACKGROUND_BLOCKS = [
  { x:-10, z:-10, w:2.5, d:2.5, h:0.12 }, { x:-6,  z:-10, w:3,   d:2,   h:0.08 },
  { x: 2,  z:-10, w:2,   d:2.5, h:0.14 }, { x: 8,  z:-10, w:3.5, d:2,   h:0.09 },
  { x:-10, z: -4, w:2,   d:3,   h:0.11 }, { x: 9,  z: -4, w:2.5, d:2.5, h:0.13 },
  { x:-10, z:  4, w:3,   d:2,   h:0.10 }, { x: 8,  z:  4, w:2,   d:3,   h:0.12 },
  { x:-10, z: 10, w:2.5, d:2.5, h:0.09 }, { x:-4,  z: 10, w:2,   d:2,   h:0.11 },
  { x: 3,  z: 10, w:3,   d:2.5, h:0.10 }, { x: 9,  z: 10, w:2,   d:2,   h:0.08 },
]

function MapPlane({ lowPowerMode }: { lowPowerMode: boolean }) {
  const cityTexture = useMemo(() => buildProceduralCityTexture(lowPowerMode), [lowPowerMode])
  const backgroundBlocks = lowPowerMode ? BACKGROUND_BLOCKS.slice(0, 8) : BACKGROUND_BLOCKS

  return (
    <group>
      {/* Plano base con textura procedural de ciudad */}
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[30, 30]} />
        <meshStandardMaterial
          map={cityTexture}
          roughness={0.92}
          metalness={0}
        />
      </mesh>

      {/* Bloques de manzanas (edificios genéricos de fondo) */}
      {backgroundBlocks.map((b, i) => (
        <mesh key={`block${i}`} position={[b.x, b.h / 2, b.z]}>
          <boxGeometry args={[b.w, b.h, b.d]} />
          <meshStandardMaterial color="#1a2538" roughness={0.9} />
        </mesh>
      ))}
    </group>
  )
}


const GLB_URLS = [
  'https://qhyuoiyamcxxjsznbiyt.supabase.co/storage/v1/object/public/conectia/edificio+3d+modelo%20(1).glb',
  'https://qhyuoiyamcxxjsznbiyt.supabase.co/storage/v1/object/public/conectia/high-rise+building+3d+model.glb',
  'https://qhyuoiyamcxxjsznbiyt.supabase.co/storage/v1/object/public/conectia/modern+apartment+building+3d+model.glb',
]

type UnitStatus = 'disponible' | 'vendido' | 'reservado'

interface ProyectoData {
  nombre: string
  zona: string
  tipo: string
  disponibles: number
  total: number
  precioDesde: string
  pisos: number
  entrega: string
  unidades: UnitStatus[][]
  position: [number, number, number]
  modelIndex: number
}


const PROYECTOS: ProyectoData[] = [
  {
    nombre: "Residencial del Parque",
    zona: "La Gran Jardín, León Gto.",
    tipo: "Edificio Residencial",
    disponibles: 18,
    total: 36,
    precioDesde: "$3,500,000",
    pisos: 12,
    entrega: "Q2 2027",
    unidades: [
      ['vendido','vendido','vendido'],
      ['vendido','vendido','reservado'],
      ['vendido','reservado','disponible'],
      ['reservado','disponible','disponible'],
      ['disponible','disponible','disponible'],
      ['disponible','disponible','disponible'],
    ],
    position: [8, 0, -7],
    modelIndex: 0,
  },
  {
    nombre: "Sky Tower León",
    zona: "Lomas del Campestre, León Gto.",
    tipo: "Torre de Oficinas y Vivienda",
    disponibles: 24,
    total: 60,
    precioDesde: "$5,800,000",
    pisos: 22,
    entrega: "Q1 2027",
    unidades: [
      ['vendido','vendido','vendido','vendido'],
      ['vendido','vendido','reservado','reservado'],
      ['vendido','reservado','disponible','disponible'],
      ['reservado','disponible','disponible','disponible'],
      ['disponible','disponible','disponible','disponible'],
      ['disponible','disponible','disponible','disponible'],
      ['disponible','disponible','disponible','disponible'],
    ],
    position: [9, 0, 8],
    modelIndex: 1,
  },
  {
    nombre: "Bosque Residencial",
    zona: "El Refugio, León Gto.",
    tipo: "Apartamentos Modernos",
    disponibles: 15,
    total: 40,
    precioDesde: "$2,900,000",
    pisos: 10,
    entrega: "Q3 2026",
    unidades: [
      ['vendido','vendido','vendido'],
      ['vendido','reservado','reservado'],
      ['reservado','disponible','disponible'],
      ['disponible','disponible','disponible'],
      ['disponible','disponible','disponible'],
    ],
    position: [-8, 0, 9],
    modelIndex: 2,
  },
]


// Detect low-power once at module level for GLBBuilding access
let _lowPowerGlobal = true
function setLowPowerGlobal(v: boolean) { _lowPowerGlobal = v }

function GLBBuilding({ url, position, onHover, onClick, active }: {
  url: string
  position: [number, number, number]
  onHover: (v: boolean) => void
  onClick: () => void
  active: boolean
}) {
  const gltf = useLoader(GLTFLoader, url)
  const groupRef = useRef<THREE.Group>(null)
  const sceneClone = useRef<THREE.Group | null>(null)

  if (!sceneClone.current) {
    sceneClone.current = gltf.scene.clone(true)
    const scene = sceneClone.current

    // Run optimization pipeline: compress textures, simplify materials, index geometry
    optimizeGLBScene(scene, _lowPowerGlobal)

    scene.updateMatrixWorld(true)
    const box = new THREE.Box3().setFromObject(scene)
    const size = new THREE.Vector3()
    box.getSize(size)
    const maxDim = Math.max(size.x, size.y, size.z)
    if (maxDim > 0) {
      const scale = 6 / maxDim
      scene.scale.setScalar(scale)
      scene.updateMatrixWorld(true)
      const box2 = new THREE.Box3().setFromObject(scene)
      const center2 = new THREE.Vector3()
      box2.getCenter(center2)
      scene.position.set(
        position[0] - center2.x,
        position[1] - box2.min.y,
        position[2] - center2.z
      )
    }
  }

  useEffect(() => {
    if (!groupRef.current) return
    groupRef.current.position.y = active ? 0.32 : 0
  }, [active])

  return (
    <group
      ref={groupRef}
      onPointerEnter={(e) => { e.stopPropagation(); onHover(true) }}
      onPointerLeave={() => onHover(false)}
      onClick={(e) => { e.stopPropagation(); onClick() }}
    >
      {sceneClone.current && <primitive object={sceneClone.current} />}
    </group>
  )
}

function Scene({ activeIndex, onHover, onClick, lowPowerMode }: {
  activeIndex: number | null
  onHover: (idx: number | null) => void
  onClick: (idx: number) => void
  lowPowerMode: boolean
}) {
  // Sync global low-power flag so GLBBuilding can access it during clone
  useEffect(() => { setLowPowerGlobal(lowPowerMode) }, [lowPowerMode])

  return (
    <>
      <color attach="background" args={["#0a0f1e"]} />
      <fog attach="fog" args={["#0a0f1e", 30, 70]} />

      <ambientLight intensity={lowPowerMode ? 2.1 : 2.5} color="#e8f0ff" />
      <directionalLight position={[12, 20, 12]} intensity={lowPowerMode ? 2 : 2.5} color="#fff8e8" />
      <pointLight position={[-8, 8, -8]} intensity={1.0} distance={35} color="#ffffff" />

      <MapPlane lowPowerMode={lowPowerMode} />

      {PROYECTOS.map((proyecto, idx) => (
        <OBJErrorBoundary key={idx}>
          <Suspense fallback={
            <mesh position={[proyecto.position[0], 1, proyecto.position[2]]}>
              <boxGeometry args={[3, 2, 3]} />
              <meshStandardMaterial color="#888888" wireframe />
            </mesh>
          }>
            <GLBBuilding
              url={GLB_URLS[proyecto.modelIndex]}
              position={proyecto.position}
              active={activeIndex === idx}
              onHover={(v) => onHover(v ? idx : null)}
              onClick={() => onClick(idx)}
            />
          </Suspense>
        </OBJErrorBoundary>
      ))}

      <OrbitControls
        enableDamping={!lowPowerMode}
        dampingFactor={0.06}
        minPolarAngle={Math.PI / 8}
        maxPolarAngle={Math.PI / 2.15}
        minDistance={5}
        maxDistance={45}
        autoRotate={activeIndex === null && !lowPowerMode}
        autoRotateSpeed={0.4}
      />
    </>
  )
}

function useMapDeviceProfile() {
  const [profile, setProfile] = useState({ lowPowerMode: true, touchDevice: true })

  useEffect(() => {
    const nav = navigator as Navigator & { deviceMemory?: number }
    const touchDevice = navigator.maxTouchPoints > 0 || 'ontouchstart' in window
    const lowPowerMode =
      window.matchMedia('(prefers-reduced-motion: reduce)').matches ||
      (nav.deviceMemory ?? 8) <= 2 ||
      (navigator.hardwareConcurrency ?? 8) <= 2

    setProfile({ lowPowerMode, touchDevice })
  }, [])

  return profile
}

export function Leon3DMap() {
  const mapWrapperRef = useRef<HTMLDivElement>(null)
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null)
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null)
  const [isInViewport, setIsInViewport] = useState(false)
  const { lowPowerMode, touchDevice } = useMapDeviceProfile()
  const activeIndex = selectedIdx ?? hoveredIdx

  const handleClick = useCallback((idx: number) => {
    setSelectedIdx(prev => prev === idx ? null : idx)
  }, [])

  useEffect(() => {
    const node = mapWrapperRef.current
    if (!node) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setIsInViewport(true)
          observer.disconnect()
        }
      },
      { rootMargin: '220px 0px' }
    )

    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  const proyecto = selectedIdx !== null ? PROYECTOS[selectedIdx] : null
  const availabilityTotals = useMemo(() => {
    if (!proyecto) return null
    const flat = proyecto.unidades.flat()
    return {
      disp: flat.filter((status) => status === 'disponible').length,
      res: flat.filter((status) => status === 'reservado').length,
      vend: flat.filter((status) => status === 'vendido').length,
    }
  }, [proyecto])

  return (
    <div className="relative w-full">
      <div
        ref={mapWrapperRef}
        className="relative bg-[#080b14] rounded-2xl overflow-hidden border border-slate-800 shadow-2xl h-[430px] sm:h-[500px] lg:h-[600px]"
      >
        {isInViewport ? (
          <Canvas
            camera={{ position: [0, 14, 22], fov: 45 }}
            dpr={lowPowerMode ? [1, 2] : [1, 3]}
            gl={{
              antialias: true,
              alpha: false,
              powerPreference: lowPowerMode ? 'low-power' : 'high-performance',
              precision: lowPowerMode ? 'mediump' : 'highp',
            }}
            performance={{ min: lowPowerMode ? 0.6 : 0.8 }}
            frameloop="demand"
            onPointerMissed={() => setSelectedIdx(null)}
          >
            <Suspense fallback={null}>
              <Scene
                activeIndex={activeIndex}
                onHover={setHoveredIdx}
                onClick={handleClick}
                lowPowerMode={lowPowerMode}
              />
            </Suspense>
          </Canvas>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-[#080b14]">
            <div className="w-8 h-8 border-4 border-[#e8ff50] border-t-transparent rounded-full animate-spin" />
            <p className="text-xs text-slate-400 font-medium">Preparando experiencia 3D...</p>
          </div>
        )}

        {/* Hint */}
        <div className="absolute top-4 left-4 pointer-events-none z-10">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-slate-900/80 border border-slate-700 backdrop-blur-md text-slate-300">
            <MapPin className="w-3 h-3" />
            {touchDevice
              ? 'Toca el edificio para ver info · Arrastra para rotar'
              : 'Pasa el cursor o da clic · Arrastra para rotar'}
          </div>
        </div>

        {/* Info panel */}
        {proyecto && (
          <div className="absolute top-4 right-2 sm:right-4 w-[calc(100%-1rem)] max-w-[18.5rem] z-10 animate-in fade-in slide-in-from-right-4 duration-300" style={{ maxHeight: 'calc(100% - 3.5rem)' }}>
            <div className="bg-gradient-to-b from-[#111c35]/95 to-[#0b1222]/95 backdrop-blur-xl border border-slate-600/60 shadow-[0_18px_50px_rgba(2,6,23,0.7)] rounded-2xl overflow-hidden flex flex-col" style={{ maxHeight: 'inherit' }}>
              <div className="h-1 w-full bg-[#e8ff50]" />
              <div className="p-4 sm:p-5 overflow-y-auto flex-1">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <span className="text-[10px] uppercase tracking-wider font-semibold text-slate-300 border border-slate-500/70 bg-slate-800/70 px-2 py-0.5 rounded-full">
                      {proyecto.zona}
                    </span>
                    <h3 className="font-bold text-white text-[1.02rem] leading-tight mt-2">{proyecto.nombre}</h3>
                    <p className="text-xs text-slate-300/80 mt-0.5">{proyecto.tipo}</p>
                  </div>
                  <button
                    onClick={() => setSelectedIdx(null)}
                    className="text-slate-400 hover:text-white bg-slate-800/90 hover:bg-slate-700 p-1.5 rounded-full transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2 mb-4">
                  <div className="bg-slate-800/60 p-2.5 rounded-lg border border-slate-600/60">
                    <p className="text-[10px] text-slate-400 uppercase tracking-wide mb-1">Pisos</p>
                    <p className="text-sm text-white font-semibold">{proyecto.pisos} niveles</p>
                  </div>
                  <div className="bg-slate-800/60 p-2.5 rounded-lg border border-slate-600/60">
                    <p className="text-[10px] text-slate-400 uppercase tracking-wide mb-1">Entrega</p>
                    <p className="text-sm text-white font-semibold">{proyecto.entrega}</p>
                  </div>
                </div>

                <div className="mb-4">
                  <p className="text-xs text-slate-400 mb-1">Inversión desde</p>
                  <p className="text-2xl font-bold text-[#e8ff50]">{proyecto.precioDesde}</p>
                </div>

                <div className="mb-4">
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="text-slate-300 font-medium">Disponibilidad</span>
                    <span className="text-white font-bold">{proyecto.disponibles} / {proyecto.total} unidades</span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden border border-slate-700">
                    <div
                      className="h-full rounded-full bg-[#e8ff50] transition-all duration-700"
                      style={{ width: `${(proyecto.disponibles / proyecto.total) * 100}%` }}
                    />
                  </div>
                </div>

                {/* Availability summary — compact 3-column */}
                {availabilityTotals && (
                  <div className="grid grid-cols-3 gap-2 mb-4">
                    <div className="bg-[#e8ff5012] border border-[#e8ff5045] rounded-lg p-2.5 text-center">
                      <p className="text-lg font-bold text-[#e8ff50]">{availabilityTotals.disp}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">Disponibles</p>
                    </div>
                    <div className="bg-orange-500/10 border border-orange-400/35 rounded-lg p-2.5 text-center">
                      <p className="text-lg font-bold text-orange-300">{availabilityTotals.res}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">Reservados</p>
                    </div>
                    <div className="bg-slate-800/70 border border-slate-600/60 rounded-lg p-2.5 text-center">
                      <p className="text-lg font-bold text-slate-300">{availabilityTotals.vend}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">Vendidos</p>
                    </div>
                  </div>
                )}

                <button
                  onClick={() => {
                    const section = document.getElementById('unidades-section')
                    if (section && selectedIdx !== null) {
                      section.scrollIntoView({ behavior: 'smooth' })
                      section.dispatchEvent(new CustomEvent('selectProyecto', { detail: selectedIdx, bubbles: true }))
                    }
                  }}
                  className="w-full py-2.5 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 transition-all hover:brightness-110 bg-[#e8ff5022] text-[#e8ff50] border border-[#e8ff5055]"
                >
                  Ver Unidades <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Stats bar */}
        <div className="absolute bottom-0 left-0 right-0 bg-slate-900/90 backdrop-blur-md border-t border-slate-800 px-3 py-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-300 z-10 pointer-events-none">
          <span className="flex items-center gap-2">
            <Building2 className="h-4 w-4 text-yellow-400" />
            <strong className="text-white text-sm">{PROYECTOS.length}</strong> desarrollos
          </span>
          <span className="flex items-center gap-2">
            <Home className="h-4 w-4 text-emerald-400" />
            <strong className="text-white text-sm">{PROYECTOS.reduce((sum, p) => sum + p.disponibles, 0)}</strong> unidades disponibles
          </span>
          <span className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-blue-400" />
            León, Guanajuato
          </span>
        </div>
      </div>
    </div>
  )
}
