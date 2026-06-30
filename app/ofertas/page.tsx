"use client"

import { useMemo, useState } from "react"
import { Percent, Flame, Clock, TrendingDown, ArrowRight } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { usePropertiesStatic } from "@/hooks/use-properties-static"
import { PropertyCard, EmptyProperties } from "@/components/property-card"
import { SubcategoryFilter } from "@/components/subcategory-filter"

const HERO_IMAGE = "https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=1920&q=80"

export default function OfertasPage() {
  const { properties } = usePropertiesStatic()
  const [tipoFilter, setTipoFilter] = useState<string[]>([])

  const propiedades = useMemo(() => {
    let result = properties.filter(p => (p as any).bono || p.categoria === 'remate' || p.categoria === 'oferta')
    if (tipoFilter.length > 0) {
      result = result.filter(p => tipoFilter.some(t => p.tipo?.toLowerCase() === t.toLowerCase()))
    }
    return result
  }, [properties, tipoFilter])

  return (
    <div className="min-h-screen bg-[#F6F2EE] dark:bg-[#0F2027]">

      {/* HERO — Creative dark with glow effects */}
      <section className="relative overflow-hidden">
        {/* Background image */}
        <img
          src={HERO_IMAGE}
          alt="Propiedades en oferta"
          className="absolute inset-0 w-full h-full object-cover object-center scale-105"
        />
        {/* Dark overlay */}
        <div className="absolute inset-0 bg-[#0F2027]/85" />
        {/* Accent gradient orbs */}
        <div className="absolute top-20 right-20 w-72 h-72 bg-[#C78F7B]/20 rounded-full blur-[100px]" />
        <div className="absolute bottom-20 left-10 w-56 h-56 bg-[#17313A]/40 rounded-full blur-[80px]" />

        <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 py-24 sm:py-32">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left: bold typography */}
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#C78F7B]/10 border border-[#C78F7B]/30">
                <Flame className="h-4 w-4 text-[#C78F7B]" />
                <span className="text-[10px] uppercase tracking-[0.4em] text-[#C78F7B] font-bold">Ofertas Limitadas</span>
              </div>

              {/* Giant number with gradient */}
              <div className="flex items-start gap-2">
                <span className="text-[110px] sm:text-[150px] font-black leading-none bg-gradient-to-br from-white via-white to-[#C78F7B] bg-clip-text text-transparent">30</span>
                <div className="mt-8">
                  <span className="text-6xl sm:text-8xl font-black text-[#C78F7B]">%</span>
                  <p className="text-[#C78F7B]/60 text-xl font-light mt-2 tracking-wide">de descuento</p>
                </div>
              </div>

              <p className="text-[#B0ACA6] text-base leading-relaxed max-w-md">
                Propiedades con bonos exclusivos y precios especiales. Oportunidades que no se repiten.
              </p>

              <div className="flex flex-wrap gap-3">
                <Badge className="bg-[#C78F7B]/20 text-[#C78F7B] border border-[#C78F7B]/40 px-4 py-2 text-sm font-semibold">
                  <Flame className="h-3.5 w-3.5 mr-1.5" />
                  {propiedades.length} Ofertas activas
                </Badge>
                <Badge className="bg-white/5 text-white/80 border border-white/10 px-4 py-2 text-sm">
                  <Clock className="h-3.5 w-3.5 mr-1.5" />
                  Tiempo limitado
                </Badge>
              </div>

              <Link href="/contacto">
                <Button className="bg-[#C78F7B] hover:bg-[#D4987E] text-[#0F2027] gap-2 text-sm font-bold rounded-xl px-6 mt-2">
                  Ver todas las ofertas <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </Link>
            </div>

            {/* Right: glowing glass cards */}
            <div className="grid grid-cols-2 gap-4">
              {[
                { icon: TrendingDown, label: "Precio reducido", value: "Hasta 30%", sub: "en propiedades selectas" },
                { icon: Flame, label: "Bonos especiales", value: "Exclusivos", sub: "para clientes directos" },
                { icon: Clock, label: "Disponibilidad", value: "Inmediata", sub: "sin lista de espera" },
                { icon: Percent, label: "Financiamiento", value: "Pre-aprobado", sub: "cierres rápidos" },
              ].map((item) => (
                <div key={item.label} className="group relative bg-white/[0.03] backdrop-blur-md border border-white/10 rounded-2xl p-5 hover:bg-white/[0.06] hover:border-[#C78F7B]/30 transition-all duration-500">
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-[#C78F7B]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <div className="relative">
                    <div className="w-10 h-10 rounded-xl bg-[#C78F7B]/10 flex items-center justify-center mb-3 group-hover:bg-[#C78F7B]/20 transition-colors">
                      <item.icon className="h-5 w-5 text-[#C78F7B]" />
                    </div>
                    <p className="text-white text-xl font-black">{item.value}</p>
                    <p className="text-white/70 text-xs font-semibold uppercase tracking-wider mt-1">{item.label}</p>
                    <p className="text-white/30 text-xs mt-1">{item.sub}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom accent line */}
        <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#C78F7B]/60 to-transparent" />
      </section>

      {/* GRID */}
      <section className="py-14 sm:py-20 px-4 sm:px-8 lg:px-16 bg-[#0F2027]">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-end gap-8 mb-6">
            <div>
              <span className="text-[10px] uppercase tracking-[0.35em] text-[#C78F7B] font-bold">Aprovecha ahora</span>
              <h2 className="text-2xl sm:text-3xl font-black text-white mt-1">Ofertas vigentes</h2>
            </div>
            <div className="h-px flex-1 bg-[#C78F7B]/20 hidden sm:block" />
          </div>
          <SubcategoryFilter onChange={setTipoFilter} variant="dark" resultCount={propiedades.length} />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {propiedades.map((p) => (<PropertyCard key={p.id} propiedad={p as any} badgeLabel="Oferta" />))}
            {propiedades.length === 0 && (<EmptyProperties label="Vuelve pronto para ver nuevas ofertas" />)}
          </div>
        </div>
      </section>
    </div>
  )
}
