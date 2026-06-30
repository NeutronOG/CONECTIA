"use client"

import { useMemo } from "react"
import { Crown, Star, Diamond, ShieldCheck, Landmark } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { usePropertiesStatic } from "@/hooks/use-properties-static"
import { PropertyCard, EmptyProperties } from "@/components/property-card"

const HERO_IMAGE = "https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=1920&q=80"

const METRICS = [
  { value: "01", label: "Curaduría selecta", desc: "Propiedades catalogadas individualmente por su excelencia." },
  { value: "100%", label: "Seguridad Legal", desc: "Transacciones con brokers y notarías certificadas." },
  { value: "Premium", label: "Amenidades Únicas", desc: "Espacios de diseño y confort de clase mundial." },
]

export default function EspecialesPage() {
  const { properties } = usePropertiesStatic()
  const propiedades = useMemo(() =>
    properties.filter(p => p.categoria === 'especial' || p.categoria === 'especiales'),
    [properties]
  )

  return (
    <div className="min-h-screen bg-[#F6F2EE] dark:bg-[#0F1114] transition-colors duration-500 overflow-hidden">

      {/* HERO — Cinematic Editorial Split Layout */}
      <section className="relative min-h-[92dvh] flex items-center pt-24 pb-16 px-4 sm:px-8 lg:px-16 overflow-hidden">
        {/* Cinematic Backdrop Image */}
        <div className="absolute inset-0 z-0">
          <img
            src={HERO_IMAGE}
            alt="Propiedades especiales"
            className="w-full h-full object-cover object-center scale-105 filter brightness-[0.8] saturate-[1.1]"
          />
          {/* Deep elegant overlays combining Conectia colors */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#17313A]/90 via-[#17313A]/60 to-[#0F1114]/80" />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#F6F2EE] dark:to-[#0F1114]" />
          
          {/* Brand subtle grid lines */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:100px_100px] pointer-events-none" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto w-full grid lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column: Bold Luxury Typography */}
          <div className="lg:col-span-7 space-y-8 text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#C78F7B]/15 border border-[#C78F7B]/30 backdrop-blur-md">
              <Crown className="h-3.5 w-3.5 text-[#C78F7B] animate-pulse" />
              <span className="text-[9px] uppercase tracking-[0.4em] text-[#C78F7B] font-bold">Colección Privada</span>
            </div>

            <div className="space-y-3">
              <h1 className="text-sm uppercase tracking-[0.5em] text-[#EAE4DD] font-semibold flex items-center gap-3">
                <span className="w-8 h-[1px] bg-[#C78F7B]" /> Curaduría Exclusiva
              </h1>
              <p className="font-serif text-5xl sm:text-7xl lg:text-8xl font-black text-white leading-[0.9] tracking-tighter">
                Propiedades
                <span className="block font-serif font-light italic text-[#C78F7B] leading-[1] mt-2">
                  Especiales
                </span>
              </p>
            </div>

            <p className="text-[#B0ACA6] text-base sm:text-lg leading-relaxed max-w-xl font-light">
              Espacios de autor seleccionados de manera rigurosa por sus altos estándares arquitectónicos, ubicaciones privilegiadas y acabados incomparables.
            </p>

            {/* Premium feature pills */}
            <div className="flex flex-wrap gap-4 pt-2">
              <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm">
                <Star className="h-4 w-4 text-[#C78F7B]" />
                <span className="text-xs text-white/90 font-medium">Ubicaciones Prime</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm">
                <Diamond className="h-4 w-4 text-[#C78F7B]" />
                <span className="text-xs text-white/90 font-medium">Arquitectura de Autor</span>
              </div>
            </div>
          </div>

          {/* Right Column: Premium Glowing Floating Glass Card */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="relative w-full max-w-[400px] rounded-3xl p-8 liquid-glass-dark border border-[#C78F7B]/20 shadow-2xl transition-all duration-500 hover:border-[#C78F7B]/40 group overflow-hidden">
              {/* Internal abstract gold light flare */}
              <div className="absolute -top-24 -right-24 w-48 h-44 bg-[#C78F7B]/15 rounded-full blur-[60px] pointer-events-none group-hover:scale-110 transition-transform duration-500" />
              
              <div className="relative z-10 space-y-6">
                <div className="flex items-center justify-between border-b border-[#EAE4DD]/10 pb-4">
                  <span className="text-[10px] uppercase tracking-[0.3em] text-[#C78F7B] font-bold">Black Label</span>
                  <Badge className="bg-[#C78F7B] text-[#0F1114] border-0 text-[10px] font-bold px-3">
                    {propiedades.length} Publicadas
                  </Badge>
                </div>

                <div className="space-y-4">
                  <h3 className="font-serif text-2xl text-white font-bold leading-tight">Garantía y Distinción Inmobiliaria</h3>
                  <p className="text-xs text-[#B0ACA6] leading-relaxed">
                    Cada propiedad en este portafolio pasa por un proceso de acreditación de título y validación jurídica ante notario público, asegurando total certeza para su patrimonio.
                  </p>
                </div>

                <div className="space-y-3 pt-2">
                  <div className="flex items-center gap-3 text-xs text-white/80">
                    <ShieldCheck className="h-4 w-4 text-[#C78F7B] flex-shrink-0" />
                    <span>Estudio de factibilidad jurídica integral</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-white/80">
                    <Landmark className="h-4 w-4 text-[#C78F7B] flex-shrink-0" />
                    <span>Respaldo notarial prioritario</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom accent glow bar */}
        <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#C78F7B]/40 to-transparent" />
      </section>

      {/* METRICS SECTION */}
      <section className="relative py-12 px-4 sm:px-8 lg:px-16 border-b border-[#17313A]/10 dark:border-[#EAE4DD]/10">
        <div className="max-w-7xl mx-auto grid md:grid-cols-3 gap-8">
          {METRICS.map((metric, i) => (
            <div key={i} className="flex gap-4 items-start p-6 rounded-2xl bg-white/40 dark:bg-white/[0.02] border border-[#17313A]/5 dark:border-white/5 backdrop-blur-sm">
              <span className="font-serif text-3xl font-black text-[#C78F7B]">{metric.value}</span>
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-[#17313A] dark:text-white">{metric.label}</h4>
                <p className="text-xs text-[#4A4F57] dark:text-[#B0ACA6] leading-relaxed">{metric.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* PROPERTIES PORTFOLIO GRID */}
      <section className="py-20 sm:py-28 px-4 sm:px-8 lg:px-16 bg-[#F6F2EE] dark:bg-[#0A0C0E]">
        <div className="max-w-7xl mx-auto">
          
          {/* Elegant Left Aligned Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="w-6 h-[1px] bg-[#C78F7B]" />
                <span className="text-[10px] uppercase tracking-[0.4em] text-[#C78F7B] font-bold">Catálogo de Autor</span>
              </div>
              <h3 className="font-serif text-3xl sm:text-4xl font-black text-[#17313A] dark:text-white leading-tight">
                Portafolio Disponible
              </h3>
            </div>
            <div className="h-px bg-gradient-to-r from-[#C78F7B]/30 to-transparent flex-1 mx-8 hidden lg:block" />
            <span className="text-xs text-[#4A4F57] dark:text-[#B0ACA6] flex-shrink-0 font-medium">
              Mostrando {propiedades.length} residencias únicas
            </span>
          </div>

          {/* Properties Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {propiedades.map((p) => (
              <PropertyCard key={p.id} propiedad={p as any} badgeLabel="Especial" />
            ))}
            
            {propiedades.length === 0 && (
              <div className="col-span-full py-24 text-center rounded-3xl bg-white/[0.02] border border-white/5 backdrop-blur-sm">
                <Crown className="h-16 w-16 text-[#C78F7B]/40 mx-auto mb-4" />
                <h4 className="font-serif text-xl text-white font-bold mb-2">Próximas Adiciones</h4>
                <p className="text-[#B0ACA6] text-sm max-w-sm mx-auto">
                  Estamos en proceso de curaduría de nuevas residencias especiales. Vuelve pronto para explorar la colección.
                </p>
              </div>
            )}
          </div>

        </div>
      </section>
    </div>
  )
}
