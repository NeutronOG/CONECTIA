"use client"

import { useMemo } from "react"
import { Sparkles, Crown, Diamond } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { usePropertiesStatic } from "@/hooks/use-properties-static"
import { PropertyCard, EmptyProperties } from "@/components/property-card"

const HERO_IMAGE = "https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=1920&q=80"

const ATRIBUTOS = [
  { icon: Crown, label: "Ubicaciones prime" },
  { icon: Diamond, label: "Acabados premium" },
  { icon: Sparkles, label: "Características únicas" },
]

export default function EspecialesPage() {
  const { properties } = usePropertiesStatic()
  const propiedades = useMemo(() =>
    properties.filter(p => p.categoria === 'especial'),
    [properties]
  )

  return (
    <div className="min-h-screen bg-conectia-accent">

      {/* HERO — cinematic full-bleed */}
      <section className="relative h-[95dvh] flex items-center justify-center overflow-hidden">
        <img
          src={HERO_IMAGE}
          alt="Propiedades especiales"
          className="absolute inset-0 w-full h-full object-cover object-center"
        />
        {/* Overlay oscuro elegante */}
        <div className="absolute inset-0 bg-[#17313A]/60" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0F2027]/30 via-transparent to-[#0F2027]/70" />

        {/* Líneas decorativas */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-conectia-primary to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-conectia-primary/60 to-transparent" />

        {/* Contenido centrado */}
        <div className="relative z-10 text-center px-6 max-w-3xl mx-auto">
          {/* Rule superior */}
          <div className="flex items-center gap-4 justify-center mb-8">
            <div className="h-px flex-1 bg-conectia-primary/50" />
            <Sparkles className="h-5 w-5 text-conectia-primary" />
            <div className="h-px flex-1 bg-conectia-primary/50" />
          </div>

          {/* Eyebrow */}
          <p className="text-[10px] uppercase tracking-[0.5em] text-conectia-primary font-bold mb-6">
            Conectia Select — Premium
          </p>

          {/* Título tipo revista de lujo */}
          <h1 className="font-serif text-5xl sm:text-7xl lg:text-8xl font-black text-white leading-tight mb-4">
            Propiedades
          </h1>
          <h2 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-light text-conectia-primary italic mb-8">
            Especiales
          </h2>

          {/* Descripción */}
          <p className="text-white/60 text-base sm:text-lg leading-relaxed mb-10 max-w-lg mx-auto">
            Una colección curada de propiedades premium con características únicas y ubicaciones privilegiadas.
          </p>

          {/* Atributos */}
          <div className="flex flex-wrap items-center justify-center gap-6">
            {ATRIBUTOS.map((a) => (
              <div key={a.label} className="flex items-center gap-2">
                <a.icon className="h-4 w-4 text-conectia-primary" />
                <span className="text-white/70 text-sm">{a.label}</span>
              </div>
            ))}
          </div>

          {/* Rule inferior */}
          <div className="flex items-center gap-4 justify-center mt-10">
            <div className="h-px flex-1 bg-white/20" />
            <Badge className="bg-conectia-primary/20 text-conectia-primary border border-conectia-primary/40 text-xs px-4 py-1.5">
              {propiedades.length} propiedades exclusivas
            </Badge>
            <div className="h-px flex-1 bg-white/20" />
          </div>
        </div>
      </section>

      {/* GRID — sobre fondo oscuro */}
      <section className="py-16 sm:py-24 px-4 sm:px-8 lg:px-16 bg-[#1C1A19]">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-end gap-6 mb-12">
            <div>
              <p className="text-[10px] uppercase tracking-[0.4em] text-conectia-primary font-bold">Colección exclusiva</p>
              <h3 className="text-2xl sm:text-3xl font-black text-white mt-1">Propiedades disponibles</h3>
            </div>
            <div className="h-px flex-1 bg-conectia-primary/25 hidden sm:block" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {propiedades.map((p, i) => (
              <PropertyCard key={p.id} propiedad={p as any} badgeLabel="Especial" />
            ))}
            {propiedades.length === 0 && (
              <div className="col-span-full py-20 text-center">
                <Sparkles className="h-12 w-12 text-conectia-primary/40 mx-auto mb-4" />
                <p className="text-white/40 text-sm">Vuelve pronto para ver propiedades especiales</p>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  )
}
