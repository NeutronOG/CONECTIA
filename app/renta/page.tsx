"use client"

import { useMemo } from "react"
import { Key, ArrowRight, Star } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { usePropertiesStatic } from "@/hooks/use-properties-static"
import { PropertyCard, EmptyProperties } from "@/components/property-card"

const HERO_IMAGE = "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1400&q=80"

const BENEFICIOS = [
  { label: "Sin enganche", sub: "Mudanzas inmediatas" },
  { label: "Contratos flexibles", sub: "3, 6 o 12 meses" },
  { label: "Soporte 24/7", sub: "Atención continua" },
]

export default function RentaPage() {
  const { properties } = usePropertiesStatic()
  const propiedades = useMemo(() =>
    properties.filter(p => p.categoria === 'renta'),
    [properties]
  )

  return (
    <div className="min-h-screen bg-conectia-surface">

      {/* HERO — Split screen */}
      <section className="relative min-h-[90dvh] flex flex-col lg:flex-row overflow-hidden">

        {/* Izquierda: panel oscuro editorial */}
        <div className="relative flex-1 lg:max-w-[52%] bg-conectia-accent flex flex-col justify-end px-8 sm:px-12 lg:px-16 py-16 sm:py-20 z-10">
          <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-conectia-primary to-transparent" />
          <div className="max-w-xl space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-conectia-primary rounded-lg flex items-center justify-center">
                <Key className="h-4 w-4 text-white" />
              </div>
              <span className="text-[10px] uppercase tracking-[0.35em] text-conectia-primary font-bold">Conectia Select</span>
            </div>
            <div>
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black text-white leading-none">Renta</h1>
              <p className="text-3xl sm:text-4xl font-light text-conectia-primary italic mt-1">con tranquilidad</p>
            </div>
            <p className="text-white/60 text-base leading-relaxed">
              Encuentra el espacio perfecto para vivir. Selección de departamentos, casas y locales con la flexibilidad que necesitas.
            </p>
            <div className="grid grid-cols-3 gap-4 pt-2">
              {BENEFICIOS.map((b) => (
                <div key={b.label} className="border-l-2 border-conectia-primary/40 pl-3">
                  <p className="text-white text-sm font-bold">{b.label}</p>
                  <p className="text-white/40 text-xs mt-0.5">{b.sub}</p>
                </div>
              ))}
            </div>
            <div className="flex items-center gap-4 pt-2">
              <Badge className="bg-conectia-primary/20 text-conectia-primary border border-conectia-primary/30 text-sm font-semibold px-4 py-2">
                {propiedades.length} disponibles
              </Badge>
              <Link href="/contacto">
                <Button variant="ghost" className="text-white/60 hover:text-white gap-2 text-sm">
                  Consultar <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </Link>
            </div>
          </div>
          <div className="absolute bottom-6 right-6 text-[120px] font-black text-white/4 leading-none select-none pointer-events-none">R</div>
        </div>

        {/* Derecha: imagen */}
        <div className="relative flex-1 min-h-[40vh] lg:min-h-0">
          <img src={HERO_IMAGE} alt="Renta de propiedades" className="absolute inset-0 w-full h-full object-cover object-center" />
          <div className="absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-conectia-accent to-transparent" />
          <div className="absolute top-8 right-8 bg-white/95 backdrop-blur-sm rounded-xl p-4 shadow-xl">
            <div className="flex items-center gap-1 mb-1">
              {[1,2,3,4,5].map(i => <Star key={i} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />)}
            </div>
            <p className="text-xs font-bold text-gray-900">Clientes satisfechos</p>
            <p className="text-xs text-gray-500">+200 rentas exitosas</p>
          </div>
        </div>
      </section>

      {/* GRID */}
      <section className="py-14 sm:py-20 px-4 sm:px-8 lg:px-16">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-end justify-between mb-10">
            <div>
              <span className="text-[10px] uppercase tracking-[0.35em] text-conectia-primary font-bold">En Renta</span>
              <h2 className="text-2xl sm:text-3xl font-black text-conectia-accent mt-1">Propiedades disponibles</h2>
            </div>
            <div className="h-px flex-1 mx-8 bg-conectia-primary/20 hidden sm:block" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {propiedades.map((p) => (<PropertyCard key={p.id} propiedad={p as any} badgeLabel="En Renta" />))}
            {propiedades.length === 0 && (<EmptyProperties label="Vuelve pronto para ver nuevas propiedades en renta" />)}
          </div>
        </div>
      </section>
    </div>
  )
}
