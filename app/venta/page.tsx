"use client"

import { useMemo, useState } from "react"
import { Tag, Search, Bed, DollarSign, MapPin, SlidersHorizontal } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { usePropertiesStatic } from "@/hooks/use-properties-static"
import { PropertyCard, EmptyProperties } from "@/components/property-card"

const HERO_IMAGE = "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=1920&q=80"

const TIPOS = ["Todos", "Casa", "Departamento", "Local", "Terreno", "Oficina"]

export default function VentaPage() {
  const { properties } = usePropertiesStatic()
  const [filtroTipo, setFiltroTipo] = useState("Todos")

  const propiedades = useMemo(() => {
    const base = properties.filter(p => p.categoria === 'venta')
    if (filtroTipo === "Todos") return base
    return base.filter(p => p.tipo === filtroTipo)
  }, [properties, filtroTipo])

  return (
    <div className="min-h-screen bg-conectia-surface">

      {/* HERO — full-screen image + search overlay */}
      <section className="relative h-[92dvh] flex flex-col justify-end overflow-hidden">
        {/* Imagen */}
        <img
          src={HERO_IMAGE}
          alt="Propiedades en venta"
          className="absolute inset-0 w-full h-full object-cover object-center"
        />
        {/* Gradientes */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-black/10" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/40 to-transparent" />

        {/* Contenido hero */}
        <div className="relative z-10 max-w-7xl mx-auto w-full px-6 sm:px-10 lg:px-16 pb-12 sm:pb-16">
          {/* Eyebrow */}
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 bg-conectia-primary rounded-lg flex items-center justify-center">
              <Tag className="h-4 w-4 text-white" />
            </div>
            <span className="text-[10px] uppercase tracking-[0.35em] text-conectia-primary font-bold">Conectia Select</span>
          </div>

          {/* Título */}
          <h1 className="text-5xl sm:text-7xl lg:text-8xl font-black text-white leading-none mb-2">
            Compra
          </h1>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-light text-conectia-primary italic mb-6">
            tu próximo hogar
          </h2>

          {/* Stats row */}
          <div className="flex flex-wrap gap-6 mb-8">
            <div>
              <p className="text-2xl font-black text-white">{propiedades.length}</p>
              <p className="text-[10px] uppercase tracking-[0.25em] text-white/50">Propiedades</p>
            </div>
            <div className="w-px bg-white/20" />
            <div>
              <p className="text-2xl font-black text-white">León</p>
              <p className="text-[10px] uppercase tracking-[0.25em] text-white/50">Guanajuato</p>
            </div>
            <div className="w-px bg-white/20" />
            <div>
              <p className="text-2xl font-black text-white">24h</p>
              <p className="text-[10px] uppercase tracking-[0.25em] text-white/50">Respuesta</p>
            </div>
          </div>

          {/* Filter pills */}
          <div className="flex flex-wrap gap-2">
            {TIPOS.map((tipo) => (
              <button
                key={tipo}
                onClick={() => setFiltroTipo(tipo)}
                className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all duration-200 border ${
                  filtroTipo === tipo
                    ? "bg-conectia-primary text-white border-conectia-primary"
                    : "bg-white/8 text-white/70 border-white/20 hover:bg-white/15 hover:text-white"
                }`}
              >
                {tipo}
              </button>
            ))}
          </div>
        </div>

        {/* Línea decorativa inferior */}
        <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-gradient-to-r from-conectia-primary via-conectia-primary/40 to-transparent z-10" />
      </section>

      {/* GRID DE PROPIEDADES */}
      <section className="py-12 sm:py-16 px-4 sm:px-8 lg:px-16">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex items-baseline justify-between mb-8">
            <div>
              <span className="text-[10px] uppercase tracking-[0.35em] text-conectia-primary font-bold">Resultados</span>
              <h3 className="text-2xl font-black text-conectia-accent mt-0.5">
                {propiedades.length} propiedades en venta
              </h3>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {propiedades.map((p) => (
              <PropertyCard key={p.id} propiedad={p as any} badgeLabel="En Venta" />
            ))}
            {propiedades.length === 0 && (
              <EmptyProperties label="No hay propiedades en venta con ese filtro" />
            )}
          </div>
        </div>
      </section>
    </div>
  )
}
