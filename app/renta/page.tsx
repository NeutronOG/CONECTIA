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

      {/* HERO — Clean modern split */}
      <section className="relative min-h-[85dvh] flex flex-col lg:flex-row bg-[#F6F2EE]">

        {/* Izquierda: contenido claro */}
        <div className="relative flex-1 lg:max-w-[50%] flex flex-col justify-center px-8 sm:px-12 lg:px-16 py-16 sm:py-20 z-10">
          <div className="max-w-xl space-y-8">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#17313A]/5 border border-[#17313A]/10">
              <Key className="h-3.5 w-3.5 text-[#C78F7B]" />
              <span className="text-[10px] uppercase tracking-[0.35em] text-[#17313A] font-bold">CONECTIA</span>
            </div>

            {/* Título */}
            <div>
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black text-[#17313A] leading-[0.95]">Renta</h1>
              <p className="text-2xl sm:text-3xl font-light text-[#C78F7B] italic mt-2">con tranquilidad</p>
            </div>

            {/* Descripción */}
            <p className="text-[#4A4F57] text-base leading-relaxed max-w-md">
              Encuentra el espacio perfecto para vivir. Selección de departamentos, casas y locales con la flexibilidad que necesitas.
            </p>

            {/* Beneficios como tarjetas */}
            <div className="flex flex-wrap gap-3">
              {BENEFICIOS.map((b) => (
                <div key={b.label} className="px-4 py-3 rounded-xl bg-white border border-[#17313A]/8 shadow-sm">
                  <p className="text-[#17313A] text-sm font-semibold">{b.label}</p>
                  <p className="text-[#B0ACA6] text-xs mt-0.5">{b.sub}</p>
                </div>
              ))}
            </div>

            {/* CTA */}
            <div className="flex items-center gap-4 pt-2">
              <Badge className="bg-[#C78F7B]/15 text-[#C78F7B] border border-[#C78F7B]/25 text-sm font-semibold px-4 py-2">
                {propiedades.length} disponibles
              </Badge>
              <Link href="/contacto">
                <Button className="bg-[#17313A] hover:bg-[#0F2027] text-white gap-2 text-sm rounded-xl px-6">
                  Consultar <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Derecha: imagen con bordes redondeados */}
        <div className="relative flex-1 min-h-[40vh] lg:min-h-0 p-4 lg:p-6 lg:pl-0">
          <div className="relative w-full h-full rounded-3xl overflow-hidden shadow-2xl">
            <img src={HERO_IMAGE} alt="Renta de propiedades" className="absolute inset-0 w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#17313A]/30 via-transparent to-transparent" />

            {/* Tarjeta flotante */}
            <div className="absolute bottom-6 right-6 bg-white/95 backdrop-blur-sm rounded-2xl p-5 shadow-xl border border-[#17313A]/5">
              <div className="flex items-center gap-1 mb-2">
                {[1,2,3,4,5].map(i => <Star key={i} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />)}
              </div>
              <p className="text-sm font-bold text-[#17313A]">Clientes satisfechos</p>
              <p className="text-xs text-[#B0ACA6]">+200 rentas exitosas</p>
            </div>
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
