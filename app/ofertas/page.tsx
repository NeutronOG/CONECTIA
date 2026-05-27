"use client"

import { useMemo } from "react"
import { Percent, Flame, Clock, TrendingDown } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { usePropertiesStatic } from "@/hooks/use-properties-static"
import { PropertyCard, EmptyProperties } from "@/components/property-card"

const HERO_IMAGE = "https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=1920&q=80"

export default function OfertasPage() {
  const { properties } = usePropertiesStatic()
  const propiedades = useMemo(() =>
    properties.filter(p => (p as any).bono || p.categoria === 'remate'),
    [properties]
  )

  return (
    <div className="min-h-screen bg-[#17313A]">

      {/* HERO — bold impact layout */}
      <section className="relative overflow-hidden">
        {/* Imagen de fondo */}
        <img
          src={HERO_IMAGE}
          alt="Propiedades en oferta"
          className="absolute inset-0 w-full h-full object-cover object-center scale-105"
        />
        {/* Overlay muy oscuro para contraste */}
        <div className="absolute inset-0 bg-[#17313A]/80" />
        {/* Gradiente diagonal de acento */}
        <div className="absolute inset-0 bg-gradient-to-br from-conectia-primary/25 via-transparent to-[#0F2027]/60" />

        <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 py-24 sm:py-32">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Izquierda: texto impacto */}
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <Flame className="h-5 w-5 text-conectia-primary" />
                <span className="text-[10px] uppercase tracking-[0.4em] text-conectia-primary font-black">Ofertas Limitadas</span>
              </div>

              {/* Número grande */}
              <div className="flex items-start gap-3">
                <span className="text-[100px] sm:text-[140px] font-black text-white leading-none">30</span>
                <div className="mt-6">
                  <span className="text-5xl sm:text-7xl font-black text-conectia-primary">%</span>
                  <p className="text-white/60 text-lg font-light mt-1">de descuento</p>
                </div>
              </div>

              <p className="text-white/70 text-base leading-relaxed max-w-md">
                Propiedades con bonos exclusivos y precios especiales. Oportunidades que no se repiten.
              </p>

              <div className="flex flex-wrap gap-3">
                <Badge className="bg-conectia-primary/90 text-white border-0 px-4 py-2 text-sm">
                  <Flame className="h-3.5 w-3.5 mr-1.5" />
                  {propiedades.length} Ofertas activas
                </Badge>
                <Badge className="bg-white/10 text-white border border-white/20 px-4 py-2 text-sm">
                  <Clock className="h-3.5 w-3.5 mr-1.5" />
                  Tiempo limitado
                </Badge>
              </div>
            </div>

            {/* Derecha: cards informativas */}
            <div className="grid grid-cols-2 gap-4">
              {[
                { icon: TrendingDown, label: "Precio reducido", value: "Hasta 30%", sub: "en propiedades selectas" },
                { icon: Flame, label: "Bonos especiales", value: "Exclusivos", sub: "para clientes directos" },
                { icon: Clock, label: "Disponibilidad", value: "Inmediata", sub: "sin lista de espera" },
                { icon: Percent, label: "Financiamiento", value: "Pre-aprobado", sub: "cierres rápidos" },
              ].map((item) => (
                <div key={item.label} className="bg-white/6 backdrop-blur-sm border border-white/10 rounded-xl p-5">
                  <item.icon className="h-5 w-5 text-conectia-primary mb-3" />
                  <p className="text-white text-lg font-black">{item.value}</p>
                  <p className="text-white/80 text-xs font-semibold uppercase tracking-wider mt-0.5">{item.label}</p>
                  <p className="text-white/40 text-xs mt-1">{item.sub}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-gradient-to-r from-conectia-primary via-conectia-primary/60 to-transparent" />
      </section>

      {/* GRID */}
      <section className="py-14 sm:py-20 px-4 sm:px-8 lg:px-16">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-end gap-8 mb-10">
            <div>
              <span className="text-[10px] uppercase tracking-[0.35em] text-conectia-primary font-bold">Aprovecha ahora</span>
              <h2 className="text-2xl sm:text-3xl font-black text-[#17313A] mt-1">Ofertas vigentes</h2>
            </div>
            <div className="h-px flex-1 bg-conectia-primary/20 hidden sm:block" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {propiedades.map((p) => (<PropertyCard key={p.id} propiedad={p as any} badgeLabel="Oferta" />))}
            {propiedades.length === 0 && (<EmptyProperties label="Vuelve pronto para ver nuevas ofertas" />)}
          </div>
        </div>
      </section>
    </div>
  )
}
