"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel"
import { 
  Building2,
  Home, 
  Phone,
  Building,
  Landmark,
  Car,
  Shield,
  Waves,
  TrendingUp,
  Map,
  Clock,
  ArrowRight
} from "lucide-react"
import Link from "next/link"
import dynamic from "next/dynamic"

type UnitStatus = 'disponible' | 'reservado' | 'vendido'

interface ProyectoUnidades {
  nombre: string
  zona: string
  precioDesde: string
  pisos: { piso: number; depas: UnitStatus[] }[]
}

const PROYECTOS_UNIDADES: ProyectoUnidades[] = [
  {
    nombre: "Residencial del Parque",
    zona: "La Gran Jardín, León Gto.",
    precioDesde: "$3,500,000",
    pisos: [
      { piso: 12, depas: ['disponible','disponible','disponible'] },
      { piso: 11, depas: ['disponible','disponible','disponible'] },
      { piso: 10, depas: ['disponible','disponible','disponible'] },
      { piso:  9, depas: ['disponible','disponible','disponible'] },
      { piso:  8, depas: ['reservado','disponible','disponible'] },
      { piso:  7, depas: ['reservado','reservado','disponible'] },
      { piso:  6, depas: ['vendido','reservado','disponible'] },
      { piso:  5, depas: ['vendido','vendido','reservado'] },
      { piso:  4, depas: ['vendido','vendido','vendido'] },
      { piso:  3, depas: ['vendido','vendido','vendido'] },
      { piso:  2, depas: ['vendido','vendido','vendido'] },
      { piso:  1, depas: ['vendido','vendido','vendido'] },
    ],
  },
  {
    nombre: "Sky Tower León",
    zona: "Lomas del Campestre, León Gto.",
    precioDesde: "$5,800,000",
    pisos: [
      { piso: 22, depas: ['disponible','disponible','disponible','disponible'] },
      { piso: 21, depas: ['disponible','disponible','disponible','disponible'] },
      { piso: 20, depas: ['disponible','disponible','disponible','disponible'] },
      { piso: 19, depas: ['disponible','disponible','disponible','disponible'] },
      { piso: 18, depas: ['disponible','disponible','disponible','disponible'] },
      { piso: 17, depas: ['disponible','disponible','disponible','disponible'] },
      { piso: 16, depas: ['reservado','disponible','disponible','disponible'] },
      { piso: 15, depas: ['reservado','reservado','disponible','disponible'] },
      { piso: 14, depas: ['vendido','reservado','disponible','disponible'] },
      { piso: 13, depas: ['vendido','vendido','reservado','reservado'] },
      { piso: 12, depas: ['vendido','vendido','vendido','reservado'] },
      { piso: 11, depas: ['vendido','vendido','vendido','vendido'] },
      { piso: 10, depas: ['vendido','vendido','vendido','vendido'] },
      { piso:  9, depas: ['vendido','vendido','vendido','vendido'] },
      { piso:  8, depas: ['vendido','vendido','vendido','vendido'] },
      { piso:  7, depas: ['vendido','vendido','vendido','vendido'] },
      { piso:  6, depas: ['vendido','vendido','vendido','vendido'] },
      { piso:  5, depas: ['vendido','vendido','vendido','vendido'] },
      { piso:  4, depas: ['vendido','vendido','vendido','vendido'] },
      { piso:  3, depas: ['vendido','vendido','vendido','vendido'] },
      { piso:  2, depas: ['vendido','vendido','vendido','vendido'] },
      { piso:  1, depas: ['vendido','vendido','vendido','vendido'] },
    ],
  },
  {
    nombre: "Bosque Residencial",
    zona: "El Refugio, León Gto.",
    precioDesde: "$2,900,000",
    pisos: [
      { piso: 10, depas: ['disponible','disponible','disponible'] },
      { piso:  9, depas: ['disponible','disponible','disponible'] },
      { piso:  8, depas: ['disponible','disponible','disponible'] },
      { piso:  7, depas: ['disponible','disponible','disponible'] },
      { piso:  6, depas: ['reservado','disponible','disponible'] },
      { piso:  5, depas: ['reservado','reservado','disponible'] },
      { piso:  4, depas: ['vendido','reservado','disponible'] },
      { piso:  3, depas: ['vendido','vendido','reservado'] },
      { piso:  2, depas: ['vendido','vendido','vendido'] },
      { piso:  1, depas: ['vendido','vendido','vendido'] },
    ],
  },
]

const Leon3DMap = dynamic(() => import("@/components/leon-3d-map").then(mod => mod.Leon3DMap), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[430px] sm:h-[500px] lg:h-[600px] bg-[#080b14] rounded-2xl flex items-center justify-center border border-slate-800 shadow-2xl">
      <div className="flex flex-col items-center gap-4">
        <div className="w-8 h-8 border-4 border-conectia-gold border-t-transparent rounded-full animate-spin"></div>
        <p className="text-slate-400 font-medium">Cargando mapa interactivo 3D...</p>
      </div>
    </div>
  )
})

function ProximamenteSection({ titulo, descripcion, icono }: { titulo: string, descripcion: string, icono: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
      <div className="w-24 h-24 bg-conectia-gold/10 rounded-full flex items-center justify-center mb-6">
        {icono}
      </div>
      <h2 className="text-2xl font-bold text-gray-900 mb-2">{titulo}</h2>
      <p className="text-gray-500 mb-6 max-w-md">{descripcion}</p>
      <div className="flex items-center gap-2 bg-conectia-gold/10 border border-conectia-gold/30 rounded-full px-6 py-3">
        <Clock className="h-4 w-4 text-conectia-gold" />
        <span className="text-conectia-gold font-semibold text-sm">Próximamente</span>
      </div>
      <p className="text-gray-400 text-sm mt-4">Estamos preparando proyectos exclusivos para esta categoría.</p>
    </div>
  )
}

function UnidadesSection() {
  const [activeIdx, setActiveIdx] = useState(0)
  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const el = sectionRef.current
    if (!el) return
    const handler = (e: Event) => {
      const idx = (e as CustomEvent<number>).detail
      if (typeof idx === 'number' && idx >= 0 && idx < PROYECTOS_UNIDADES.length) {
        setActiveIdx(idx)
      }
    }
    el.addEventListener('selectProyecto', handler)
    return () => el.removeEventListener('selectProyecto', handler)
  }, [])

  const proyecto = PROYECTOS_UNIDADES[activeIdx]

  return (
    <section id="unidades-section" ref={sectionRef} className="py-16 bg-slate-900">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <Badge className="bg-conectia-gold/20 text-conectia-gold border-conectia-gold/30 mb-4">
            <Building2 className="h-3 w-3 mr-1" />
            {proyecto.nombre}
          </Badge>
          <h2 className="text-3xl font-bold text-white mb-3">Disponibilidad de Unidades</h2>
          <p className="text-slate-400 max-w-xl mx-auto">
            {proyecto.zona} · Precios desde {proyecto.precioDesde} MXN
          </p>
        </div>

        {/* Proyecto selector tabs */}
        <div className="flex justify-center gap-2 mb-8 flex-wrap">
          {PROYECTOS_UNIDADES.map((p, i) => (
            <button
              key={i}
              onClick={() => setActiveIdx(i)}
              className={`px-4 py-2 rounded-full text-sm font-semibold transition-all border ${
                activeIdx === i
                  ? 'bg-[#e8ff50] text-[#17313A] border-[#e8ff50]'
                  : 'bg-slate-800 text-slate-300 border-slate-700 hover:border-slate-500'
              }`}
            >
              {p.nombre}
            </button>
          ))}
        </div>

        {/* Legend */}
        <div className="flex justify-center gap-6 mb-8">
          {[
            { color: 'bg-[#e8ff50]', label: 'Disponible' },
            { color: 'bg-orange-500', label: 'Reservado' },
            { color: 'bg-slate-700', label: 'Vendido' },
          ].map(({ color, label }) => (
            <span key={label} className="flex items-center gap-2 text-sm text-slate-300">
              <span className={`w-4 h-4 rounded-sm ${color} inline-block`} />
              {label}
            </span>
          ))}
        </div>

        {/* Floor grid */}
        <div className="max-w-2xl mx-auto space-y-1.5 px-2">
          {proyecto.pisos.map(({ piso, depas }) => (
            <div key={piso} className="flex items-center gap-2">
              <span className="text-[10px] text-slate-500 w-12 text-right shrink-0">P{piso}</span>
              <div className="flex gap-1.5 flex-1 min-w-0">
                {depas.map((status, di) => {
                  const isDisp = status === 'disponible'
                  const isRes  = status === 'reservado'
                  return (
                    <button
                      key={di}
                      disabled={!isDisp}
                      className="flex-1 min-w-0 py-2 rounded-md text-[10px] font-semibold transition-all border truncate px-0.5"
                      style={{
                        backgroundColor: isDisp ? '#e8ff5015' : isRes ? '#f9731615' : '#1e293b',
                        borderColor:     isDisp ? '#e8ff5060' : isRes ? '#f9731650' : '#334155',
                        color:           isDisp ? '#e8ff50'   : isRes ? '#f97316'   : '#475569',
                        cursor:          isDisp ? 'pointer'   : 'default',
                      }}
                    >
                      {isDisp ? `D${di + 1}` : isRes ? 'Res.' : 'Vend.'}
                    </button>
                  )
                })}
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-10">
          <p className="text-slate-400 text-sm mb-4">¿Te interesa alguna unidad? Contáctanos para apartar tu departamento.</p>
          <a
            href="https://wa.me/524774756951"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-[#C78F7B] hover:bg-[#D4987E] text-[#17313A] font-semibold px-6 py-3 rounded-lg transition-all"
          >
            <Phone className="h-4 w-4" />
            Apartar por WhatsApp
          </a>
        </div>
      </div>
    </section>
  )
}

export default function DesarrollosPage() {
  return (
    <div className="min-h-screen bg-conectia-secondary">
      {/* Hero Section */}
      <section className="relative overflow-hidden min-h-[320px] sm:min-h-[420px]">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: "url('https://mnrfsdrjadretxesjxhu.supabase.co/storage/v1/object/sign/conectia/hf_20260219_015208_b75495b2-1016-45df-a1f8-d1160006831b.jpeg?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV82ZTg2NjJkMS1lZjIzLTRkZjUtYjAwYy04NjVkOTcwYzljZWMiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJhcmtpbi9oZl8yMDI2MDIxOV8wMTUyMDhfYjc1NDk1YjItMTAxNi00NWRmLWExZjgtZDExNjAwMDY4MzFiLmpwZWciLCJpYXQiOjE3NzE0NjYyNTQsImV4cCI6MTgwMzAwMjI1NH0.0ew5z0WbvUkHQAwo8zOlhQFyLokmh2PKTqjqBtpxcuc'}" }}
        />
        <div className="absolute inset-0 bg-[#17313A]/70" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0F2027]/60 via-[#17313A]/40 to-transparent" />
        <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-10 py-16 sm:py-24 flex items-center">
          <div className="max-w-xl">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-12 h-12 bg-conectia-primary rounded-2xl flex items-center justify-center shadow-lg">
                <Building2 className="h-6 w-6 text-conectia-accent" />
              </div>
              <span className="text-conectia-primary text-sm font-semibold uppercase tracking-widest">Nuevos Proyectos</span>
            </div>
            <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl font-black text-white leading-tight mb-4">
              Desarrollos<br/>
              <span className="text-conectia-primary">Inmobiliarios</span>
            </h1>
            <p className="text-white/80 text-base sm:text-lg mb-6 leading-relaxed">
              Descubre los mejores desarrollos verticales, horizontales y fraccionamientos.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button size="lg" className="bg-conectia-primary hover:bg-conectia-primary/90 text-[#17313A] font-semibold rounded-xl shadow-lg">
                <Building2 className="mr-2 h-5 w-5" />
                Ver Desarrollos
              </Button>
              <Button size="lg" variant="outline" className="border-white text-white bg-white/10 hover:bg-white/20 rounded-xl backdrop-blur-sm">
                <Phone className="mr-2 h-5 w-5" />
                Contactar Asesor
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-10 bg-conectia-secondary border-b border-conectia-accent/10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <p className="text-4xl font-bold text-conectia-primary">+3</p>
              <p className="text-conectia-accent/70 text-sm mt-1">Desarrollos Activos</p>
            </div>
            <div className="text-center">
              <p className="text-4xl font-bold text-conectia-primary">25+</p>
              <p className="text-conectia-accent/70 text-sm mt-1">Unidades Disponibles</p>
            </div>
            <div className="text-center">
              <p className="text-4xl font-bold text-conectia-primary">3</p>
              <p className="text-conectia-accent/70 text-sm mt-1">Ciudades</p>
            </div>
            <div className="text-center">
              <p className="text-4xl font-bold text-conectia-primary">25%</p>
              <p className="text-conectia-accent/70 text-sm mt-1">Plusvalía Promedio</p>
            </div>
          </div>
        </div>
      </section>

      {/* Mapa 3D de León */}
      <section className="py-16 bg-slate-950">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10">
            <Badge className="bg-conectia-gold/20 text-conectia-gold border-conectia-gold/30 mb-4">
              <Map className="h-3 w-3 mr-1" />
              Mapa Interactivo
            </Badge>
            <h2 className="text-3xl font-bold text-white mb-3">
              Desarrollos en León, Guanajuato
            </h2>
            <p className="text-slate-400 max-w-2xl mx-auto">
              Explora nuestros desarrollos por zona. Pasa el cursor o haz clic en un edificio para ver disponibilidad y precios.
            </p>
          </div>
          <Leon3DMap />
        </div>
      </section>

      <UnidadesSection />

      {/* Tabs de Desarrollos */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <Tabs defaultValue="verticales" className="w-full">
            <div className="flex justify-center mb-8">
              <TabsList className="grid grid-cols-3 w-full max-w-xl">
                <TabsTrigger value="verticales" className="flex items-center gap-2">
                  <Building className="h-4 w-4" />
                  <span className="hidden sm:inline">Verticales</span>
                </TabsTrigger>
                <TabsTrigger value="horizontales" className="flex items-center gap-2">
                  <Home className="h-4 w-4" />
                  <span className="hidden sm:inline">Horizontales</span>
                </TabsTrigger>
                <TabsTrigger value="fraccionamientos" className="flex items-center gap-2">
                  <Landmark className="h-4 w-4" />
                  <span className="hidden sm:inline">Fraccionamientos</span>
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="verticales">
              <ProximamenteSection
                titulo="Desarrollos Verticales"
                descripcion="Torres de departamentos y edificios residenciales de lujo"
                icono={<Building className="h-12 w-12 text-conectia-gold" />}
              />
            </TabsContent>

            <TabsContent value="horizontales">
              <ProximamenteSection
                titulo="Desarrollos Horizontales"
                descripcion="Residenciales de casas con amenidades exclusivas"
                icono={<Home className="h-12 w-12 text-conectia-gold" />}
              />
            </TabsContent>

            <TabsContent value="fraccionamientos">
              <ProximamenteSection
                titulo="Fraccionamientos"
                descripcion="Lotes residenciales y campestres para construir tu hogar ideal"
                icono={<Landmark className="h-12 w-12 text-conectia-gold" />}
              />
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* Beneficios — Carousel */}
      <section className="py-16 bg-conectia-secondary/70">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-conectia-graphite mb-4">
              ¿Por qué invertir en desarrollos?
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Los desarrollos inmobiliarios ofrecen ventajas únicas para inversionistas y compradores.
            </p>
          </div>

          <Carousel opts={{ align: 'center', loop: true }} className="w-full">
            <CarouselContent className="-ml-4">
              {[
                {
                  icon: <TrendingUp className="h-10 w-10 text-green-600" />,
                  bg: 'bg-green-100',
                  title: 'Alta Plusvalía',
                  desc: 'Compra en preventa y obtén hasta 30% de plusvalía al momento de la entrega.',
                },
                {
                  icon: <Shield className="h-10 w-10 text-blue-600" />,
                  bg: 'bg-blue-100',
                  title: 'Seguridad Jurídica',
                  desc: 'Todos los desarrollos cuentan con permisos y documentación en regla.',
                },
                {
                  icon: <Waves className="h-10 w-10 text-purple-600" />,
                  bg: 'bg-purple-100',
                  title: 'Amenidades Premium',
                  desc: 'Disfruta de instalaciones de primer nivel incluidas en tu inversión.',
                },
                {
                  icon: <Car className="h-10 w-10 text-orange-600" />,
                  bg: 'bg-orange-100',
                  title: 'Ubicaciones Estratégicas',
                  desc: 'Desarrollos en zonas con alta demanda y excelente conectividad.',
                },
              ].map((item, i) => (
                <CarouselItem key={i} className="pl-4 basis-full sm:basis-1/2 lg:basis-1/4">
                  <Card className="border-0 shadow-lg text-center p-8 h-full flex flex-col items-center">
                    <div className={`w-20 h-20 ${item.bg} rounded-full flex items-center justify-center mb-5`}>
                      {item.icon}
                    </div>
                    <h3 className="font-bold text-lg mb-3">{item.title}</h3>
                    <p className="text-gray-600 text-sm leading-relaxed">{item.desc}</p>
                  </Card>
                </CarouselItem>
              ))}
            </CarouselContent>
            <div className="flex justify-center gap-4 mt-8">
              <CarouselPrevious className="static translate-y-0 h-10 w-10" />
              <CarouselNext className="static translate-y-0 h-10 w-10" />
            </div>
          </Carousel>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-conectia-dark text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">
            ¿Interesado en algún desarrollo?
          </h2>
          <p className="text-gray-300 mb-8 max-w-2xl mx-auto">
            Nuestros asesores especializados te ayudarán a encontrar la mejor opción 
            de inversión según tus objetivos.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/contacto">
              <Button size="lg" className="bg-[#C78F7B] hover:bg-[#D4987E] text-[#17313A]">
                Agendar Cita
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="https://wa.me/524774756951">
              <Button size="lg" variant="outline" className="border-conectia-accent text-conectia-accent hover:bg-conectia-accent/10">
                <Phone className="mr-2 h-5 w-5" />
                WhatsApp
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
