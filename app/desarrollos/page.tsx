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
import { useLanguage } from "@/lib/i18n"

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

function MapLoading() {
  const { t } = useLanguage()
  return (
    <div className="w-full h-[430px] sm:h-[500px] lg:h-[600px] bg-[#080b14] rounded-2xl flex items-center justify-center border border-slate-800 shadow-2xl">
      <div className="flex flex-col items-center gap-4">
        <div className="w-8 h-8 border-4 border-conectia-gold border-t-transparent rounded-full animate-spin"></div>
        <p className="text-slate-400 font-medium">{t('desarrollos.loadingMap')}</p>
      </div>
    </div>
  )
}

const Leon3DMap = dynamic(() => import("@/components/leon-3d-map").then(mod => mod.Leon3DMap), {
  ssr: false,
  loading: () => <MapLoading />
})

function ProximamenteSection({ titulo, descripcion, icono }: { titulo: string, descripcion: string, icono: React.ReactNode }) {
  const { t } = useLanguage()
  return (
    <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
      <div className="w-24 h-24 bg-conectia-gold/10 rounded-full flex items-center justify-center mb-6">
        {icono}
      </div>
      <h2 className="text-2xl font-bold text-gray-900 mb-2">{titulo}</h2>
      <p className="text-gray-500 mb-6 max-w-md">{descripcion}</p>
      <div className="flex items-center gap-2 bg-conectia-gold/10 border border-conectia-gold/30 rounded-full px-6 py-3">
        <Clock className="h-4 w-4 text-conectia-gold" />
        <span className="text-conectia-gold font-semibold text-sm">{t('desarrollos.comingSoon')}</span>
      </div>
      <p className="text-gray-400 text-sm mt-4">{t('desarrollos.comingSoonDesc')}</p>
    </div>
  )
}

function UnidadesSection() {
  const { t } = useLanguage()
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
          <h2 className="text-3xl font-bold text-white mb-3">{t('desarrollos.unitsTitle')}</h2>
          <p className="text-slate-400 max-w-xl mx-auto">
            {proyecto.zona} · {t('desarrollos.fromPrice')} {proyecto.precioDesde} MXN
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
            { color: 'bg-[#e8ff50]', label: t('desarrollos.status.available') },
            { color: 'bg-orange-500', label: t('desarrollos.status.reserved') },
            { color: 'bg-slate-700', label: t('desarrollos.status.sold') },
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
                      {isDisp ? `D${di + 1}` : isRes ? t('desarrollos.status.shortReserved') : t('desarrollos.status.shortSold')}
                    </button>
                  )
                })}
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-10">
          <p className="text-slate-400 text-sm mb-4">{t('desarrollos.unitsCta')}</p>
          <Link
            href={`/contacto?propiedad=${encodeURIComponent(proyecto.nombre)}`}
            className="inline-flex items-center gap-2 bg-[#C78F7B] hover:bg-[#D4987E] text-[#17313A] font-semibold px-6 py-3 rounded-lg transition-all"
          >
            <Phone className="h-4 w-4" />
            {t('desarrollos.reserveUnit')}
          </Link>
        </div>
      </div>
    </section>
  )
}

export default function DesarrollosPage() {
  const { t } = useLanguage()
  return (
    <div className="min-h-screen bg-[#F6F2EE] dark:bg-[#17313A]">
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
              <span className="text-conectia-primary text-sm font-semibold uppercase tracking-widest">{t('desarrollos.heroBadge')}</span>
            </div>
            <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl font-black text-white leading-tight mb-4">
              {t('desarrollos.heroTitle')}<br/>
              <span className="text-conectia-primary">{t('desarrollos.heroHighlight')}</span>
            </h1>
            <p className="text-white/80 text-base sm:text-lg mb-6 leading-relaxed">
              {t('desarrollos.heroDescription')}
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button size="lg" className="bg-conectia-primary hover:bg-conectia-primary/90 text-[#17313A] font-semibold rounded-xl shadow-lg">
                <Building2 className="mr-2 h-5 w-5" />
                {t('desarrollos.heroPrimary')}
              </Button>
              <Button size="lg" variant="outline" className="border-white text-white bg-white/10 hover:bg-white/20 rounded-xl backdrop-blur-sm">
                <Phone className="mr-2 h-5 w-5" />
                {t('desarrollos.heroSecondary')}
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-10 bg-[#F6F2EE] dark:bg-[#17313A] border-b border-conectia-accent/10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <p className="text-4xl font-bold text-conectia-primary">+3</p>
              <p className="text-conectia-accent/70 text-sm mt-1">{t('desarrollos.stats.active')}</p>
            </div>
            <div className="text-center">
              <p className="text-4xl font-bold text-conectia-primary">25+</p>
              <p className="text-conectia-accent/70 text-sm mt-1">{t('desarrollos.stats.units')}</p>
            </div>
            <div className="text-center">
              <p className="text-4xl font-bold text-conectia-primary">3</p>
              <p className="text-conectia-accent/70 text-sm mt-1">{t('desarrollos.stats.cities')}</p>
            </div>
            <div className="text-center">
              <p className="text-4xl font-bold text-conectia-primary">25%</p>
              <p className="text-conectia-accent/70 text-sm mt-1">{t('desarrollos.stats.appreciation')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Mapa 3D de León */}
      <section className="py-16 bg-[#F6F2EE] dark:bg-slate-950">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10">
            <Badge className="bg-conectia-gold/20 text-conectia-gold border-conectia-gold/30 mb-4">
              <Map className="h-3 w-3 mr-1" />
              {t('desarrollos.mapBadge')}
            </Badge>
            <h2 className="text-3xl font-bold text-[#17313A] dark:text-white mb-3">
              {t('desarrollos.mapTitle')}
            </h2>
            <p className="text-[#4A4F57] dark:text-slate-400 max-w-2xl mx-auto">
              {t('desarrollos.mapDescription')}
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
                  <span className="hidden sm:inline">{t('desarrollos.tabs.vertical')}</span>
                </TabsTrigger>
                <TabsTrigger value="horizontales" className="flex items-center gap-2">
                  <Home className="h-4 w-4" />
                  <span className="hidden sm:inline">{t('desarrollos.tabs.horizontal')}</span>
                </TabsTrigger>
                <TabsTrigger value="fraccionamientos" className="flex items-center gap-2">
                  <Landmark className="h-4 w-4" />
                  <span className="hidden sm:inline">{t('desarrollos.tabs.subdivisions')}</span>
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="verticales">
              <ProximamenteSection
                titulo={t('desarrollos.tabs.verticalTitle')}
                descripcion={t('desarrollos.tabs.verticalDesc')}
                icono={<Building className="h-12 w-12 text-conectia-gold" />}
              />
            </TabsContent>

            <TabsContent value="horizontales">
              <ProximamenteSection
                titulo={t('desarrollos.tabs.horizontalTitle')}
                descripcion={t('desarrollos.tabs.horizontalDesc')}
                icono={<Home className="h-12 w-12 text-conectia-gold" />}
              />
            </TabsContent>

            <TabsContent value="fraccionamientos">
              <ProximamenteSection
                titulo={t('desarrollos.tabs.subdivisionsTitle')}
                descripcion={t('desarrollos.tabs.subdivisionsDesc')}
                icono={<Landmark className="h-12 w-12 text-conectia-gold" />}
              />
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* Beneficios — Carousel */}
      <section className="py-16 bg-[#F6F2EE] dark:bg-[#17313A]/70">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-[#17313A] dark:text-conectia-graphite mb-4">
              {t('desarrollos.benefitsTitle')}
            </h2>
            <p className="text-[#4A4F57] dark:text-gray-600 max-w-2xl mx-auto">
              {t('desarrollos.benefitsDescription')}
            </p>
          </div>

          <Carousel opts={{ align: 'center', loop: true }} className="w-full">
            <CarouselContent className="-ml-4">
              {[
                {
                  icon: <TrendingUp className="h-10 w-10 text-green-600" />,
                  bg: 'bg-green-100',
                  title: t('desarrollos.benefit1.title'),
                  desc: t('desarrollos.benefit1.desc'),
                },
                {
                  icon: <Shield className="h-10 w-10 text-blue-600" />,
                  bg: 'bg-blue-100',
                  title: t('desarrollos.benefit2.title'),
                  desc: t('desarrollos.benefit2.desc'),
                },
                {
                  icon: <Waves className="h-10 w-10 text-purple-600" />,
                  bg: 'bg-purple-100',
                  title: t('desarrollos.benefit3.title'),
                  desc: t('desarrollos.benefit3.desc'),
                },
                {
                  icon: <Car className="h-10 w-10 text-orange-600" />,
                  bg: 'bg-orange-100',
                  title: t('desarrollos.benefit4.title'),
                  desc: t('desarrollos.benefit4.desc'),
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
      <section className="py-16 bg-[#EAE4DD] dark:bg-conectia-dark text-[#17313A] dark:text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">
            {t('desarrollos.ctaTitle')}
          </h2>
          <p className="text-[#4A4F57] dark:text-gray-300 mb-8 max-w-2xl mx-auto">
            {t('desarrollos.ctaDescription')}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/contacto">
              <Button size="lg" className="bg-[#C78F7B] hover:bg-[#D4987E] text-[#17313A]">
                {t('desarrollos.ctaPrimary')}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/contacto">
              <Button size="lg" variant="outline" className="border-[#17313A] dark:border-conectia-accent text-[#17313A] dark:text-conectia-accent hover:bg-[#17313A]/10 dark:hover:bg-conectia-accent/10">
                <Phone className="mr-2 h-5 w-5" />
                {t('common.contact')}
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
