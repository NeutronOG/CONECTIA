'use client'

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ArrowRight, Shield, Star, Users, MapPin, House, Sparkle, List, Tag, Key, Percent, Buildings, X } from "@phosphor-icons/react"
import Link from "next/link"
import Image from "next/image"
import { FeaturedPropertiesCarousel } from "./featured-properties-carousel"
import { CommercialAlliance } from "./commercial-alliance"
import { HomepageAdSlot } from "./homepage-ads"

export function HomeYellow() {
  const [isCategoriasMenuOpen, setIsCategoriasMenuOpen] = useState(false)
  return (
    <div className="min-h-screen bg-[#17313A] relative overflow-hidden transition-all duration-500">
      {/* Hero Section — Editorial & Left-Aligned */}
      <section className="relative min-h-[92dvh] flex flex-col md:flex-row mt-[60px] mx-4 md:mx-8 mb-16 rounded-[40px] overflow-hidden bg-[#17313A] shadow-2xl">
        {/* Mitad Derecha: Imagen que ocupa el 60% */}
        <div className="absolute right-0 top-0 bottom-0 w-full md:w-[60%] z-0">
          <img
            src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1920&q=80"
            alt="Luxury Architecture"
            className="w-full h-full object-cover object-center"
          />
          {/* Gradiente para fundir con la parte izquierda */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#17313A] via-[#17313A]/80 to-transparent md:via-[#17313A]/20" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#17313A] via-transparent to-transparent" />
        </div>

        {/* Contenido principal superpuesto, alineado a la izquierda */}
        <div className="relative z-10 flex flex-col justify-center w-full md:w-[50%] p-8 md:p-16 lg:p-24 pb-20">
          <div className="space-y-8 max-w-xl">
            <div className="inline-flex items-center gap-3 glass-pill px-4 py-2 rounded-full">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#C78F7B] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#C78F7B]"></span>
              </span>
              <span className="text-[10px] uppercase tracking-[0.3em] text-[#EAE4DD] font-semibold">
                Mercado Premium Activo
              </span>
            </div>

            {/* Typography disruptiva */}
            <div className="relative">
              <h1 className="text-5xl sm:text-6xl md:text-[5rem] lg:text-[6.5rem] font-bold text-[#EAE4DD] leading-[0.9] tracking-tighter">
                Vive <span className="font-serif italic font-light text-[#C78F7B] block mt-2">Diferente</span>
              </h1>
              <p className="mt-8 text-base md:text-lg text-[#B0ACA6] max-w-md font-light leading-relaxed border-l-2 border-[#C78F7B] pl-4">
                La forma más transparente y estética de encontrar tu próxima propiedad. Sin intermediarios complicados.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-4 pt-4">
              <Link href="/propiedades" className="w-full sm:w-auto">
                <Button className="w-full sm:w-auto btn-glass-secondary font-bold h-14 px-8 rounded-full text-base hover:scale-105 transition-all duration-300 gap-2 border-0">
                  <House className="h-5 w-5" weight="duotone" />
                  Explorar Catálogo
                </Button>
              </Link>
              <button
                onClick={() => setIsCategoriasMenuOpen(true)}
                className="w-full sm:w-auto group flex items-center justify-center gap-3 h-14 px-8 rounded-full glass-pill text-[#EAE4DD] font-medium transition-all duration-300 hover:opacity-80"
              >
                <List className="h-5 w-5 text-[#C78F7B] group-hover:scale-110 transition-transform" weight="duotone" />
                Categorías
              </button>
            </div>

            <div className="grid grid-cols-2 gap-6 pt-10 border-t border-white/10">
              <div>
                <p className="text-4xl font-black text-[#EAE4DD] mb-1">+500</p>
                <p className="text-[11px] text-[#B0ACA6] uppercase tracking-widest font-semibold">Propiedades</p>
              </div>
              <div>
                <p className="text-4xl font-black text-[#C78F7B] mb-1">GTO</p>
                <p className="text-[11px] text-[#B0ACA6] uppercase tracking-widest font-semibold">Mercado Principal</p>
              </div>
            </div>
          </div>
        </div>

        {/* Decorativo: Texto gigante cortado en el fondo */}
        <div className="absolute right-0 bottom-[-10%] opacity-10 pointer-events-none select-none overflow-hidden">
          <span className="text-[20vw] font-black text-white leading-none">C/S</span>
        </div>
      </section>

      {/* Featured Properties Carousel */}
      <section className="relative py-14 sm:py-20 px-4 sm:px-8 lg:px-16">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-end gap-4 sm:gap-8 mb-10 sm:mb-14">
            <div>
              <p className="text-[10px] uppercase tracking-[0.35em] text-[#C78F7B] font-bold mb-2">Selección</p>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-[#EAE4DD] leading-tight" style={{fontFamily:'var(--font-titles)'}}>
                Propiedades <span className="text-[#C78F7B]">Destacadas</span>
              </h2>
            </div>
            <div className="flex-1 h-px bg-gradient-to-r from-[#C78F7B]/30 to-transparent mb-1 hidden sm:block" />
          </div>
          <FeaturedPropertiesCarousel />
        </div>
      </section>

      {/* Planes de Pago Section */}
      <section>
        <CommercialAlliance />
      </section>


      {/* Features Section - Carousel */}

      {/* Ad Slot: Antes del Footer */}
      <HomepageAdSlot ubicacion="footer" />

      {/* CTA Section — Liquid Glass */}
      <section className="relative py-10 sm:py-16 px-4 sm:px-8">
        <div className="max-w-5xl mx-auto">
          {/* Contenedor glass principal */}
          <div className="relative rounded-[28px] overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, rgba(234,228,221,0.13) 0%, rgba(199,143,123,0.07) 50%, rgba(23,49,58,0.25) 100%)',
              backdropFilter: 'blur(32px) saturate(180%)',
              WebkitBackdropFilter: 'blur(32px) saturate(180%)',
              border: '1px solid rgba(234,228,221,0.20)',
              borderTopColor: 'rgba(255,255,255,0.28)',
              boxShadow: '0 2px 0 rgba(255,255,255,0.10) inset, 0 32px 80px rgba(23,49,58,0.35), 0 4px 16px rgba(23,49,58,0.20)',
            }}
          >
            {/* Brillo superior */}
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#EAE4DD]/40 to-transparent" />
            {/* Orbe arcilla decorativo */}
            <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full opacity-20 blur-3xl pointer-events-none"
              style={{ background: 'radial-gradient(circle, #C78F7B 0%, transparent 70%)' }} />
            <div className="absolute -bottom-12 -left-12 w-48 h-48 rounded-full opacity-12 blur-2xl pointer-events-none"
              style={{ background: 'radial-gradient(circle, #EAE4DD 0%, transparent 70%)' }} />

            <div className="relative px-8 sm:px-14 py-12 sm:py-16">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-10">

                {/* Izquierda: texto */}
                <div className="space-y-4 md:max-w-lg">
                  <p className="text-[10px] uppercase tracking-[0.40em] text-[#C78F7B] font-semibold">
                    Únete ahora
                  </p>
                  <h2 className="font-titles text-4xl sm:text-5xl font-light text-[#EAE4DD] leading-[1.15]">
                    ¿Listo para el<br />
                    <span className="italic text-[#C78F7B]">siguiente paso?</span>
                  </h2>
                  <p className="text-[#B0ACA6] text-base leading-relaxed max-w-md">
                    Únete a nuestros clientes satisfechos y descubre la facilidad de comprar o vender con CONECTIA
                  </p>
                  {/* Línea decorativa */}
                  <div className="flex items-center gap-3 pt-1">
                    <div className="h-px w-10 bg-[#C78F7B]/60" />
                    <div className="h-px flex-1 bg-gradient-to-r from-[#C78F7B]/30 to-transparent" />
                  </div>
                </div>

                {/* Derecha: botones */}
                <div className="flex flex-col gap-3 flex-shrink-0 min-w-[200px]">
                  <Link href="/contacto">
                    <button className="btn-glass-secondary w-full flex items-center justify-center gap-2 px-8 py-4 rounded-2xl text-sm font-semibold tracking-wide transition-all duration-300 hover:scale-[1.02]">
                      <MapPin className="h-4 w-4" weight="duotone" />
                      Contactar Ahora
                    </button>
                  </Link>
                  <Link href="/propiedades">
                    <button className="btn-glass-tertiary w-full flex items-center justify-center gap-2 px-8 py-4 rounded-2xl text-sm font-semibold tracking-wide transition-all duration-300 hover:scale-[1.02]">
                      Ver Propiedades
                      <ArrowRight className="h-4 w-4" weight="bold" />
                    </button>
                  </Link>
                </div>

              </div>
            </div>
            {/* Brillo inferior */}
            <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#EAE4DD]/15 to-transparent" />
          </div>
        </div>
      </section>

      {/* Animated Stats Section */}

      {/* Drawer de Categorías — sube desde abajo */}
      {isCategoriasMenuOpen && (
        <>
          {/* Overlay */}
          <div
            className="fixed inset-0 bg-[#17313A]/50 backdrop-blur-md z-50 animate-in fade-in duration-200"
            onClick={() => setIsCategoriasMenuOpen(false)}
          />

          {/* Drawer */}
          <div className="fixed inset-x-0 bottom-0 z-50 pointer-events-none">
            <div
              className="glass-panel border-t border-white/40 shadow-2xl w-full pointer-events-auto animate-in slide-in-from-bottom-4 duration-300 rounded-t-[28px]"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Handle */}
              <div className="flex justify-center pt-3 pb-1">
                <div className="w-10 h-1 bg-[#17313A]/20 rounded-full" />
              </div>
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-[#17313A]/10">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 glass-pill rounded-lg flex items-center justify-center">
                    <List className="h-4 w-4 text-[#17313A]" weight="duotone" />
                  </div>
                  <h3 className="text-base font-black text-[#17313A] uppercase tracking-widest" style={{fontFamily:'var(--font-titles)'}}>Categorías</h3>
                </div>
                <button
                  onClick={() => setIsCategoriasMenuOpen(false)}
                  className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#17313A]/08 transition-colors"
                >
                  <X className="h-4 w-4 text-[#4A4F57]" weight="bold" />
                </button>
              </div>

              {/* Grid de categorías */}
              <div className="p-4 sm:p-6">
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 sm:gap-3">
                  {[
                    { href: '/venta', icon: Tag, label: 'Venta', color: '#C78F7B' },
                    { href: '/renta', icon: Key, label: 'Renta', color: '#17313A' },
                    { href: '/especiales', icon: Sparkle, label: 'Especiales', color: '#B0ACA6' },
                    { href: '/ofertas', icon: Percent, label: 'Ofertas', color: '#C78F7B' },
                    { href: '/exclusivos', icon: Shield, label: 'Exclusivos', color: '#17313A' },
                    { href: '/desarrollos', icon: Buildings, label: 'Desarrollos', color: '#17313A' },
                  ].map(({ href, icon: Icon, label, color }) => (
                    <Link key={href} href={href} onClick={() => setIsCategoriasMenuOpen(false)}>
                      <button className="w-full p-3 sm:p-4 rounded-2xl glass-card hover:scale-105 active:scale-95 transition-all duration-200 group flex flex-col items-center gap-2">
                        <div className="w-10 h-10 glass-pill rounded-xl flex items-center justify-center">
                          <Icon className="h-5 w-5" style={{ color }} weight="duotone" />
                        </div>
                        <span className="text-xs font-bold text-[#17313A]">{label}</span>
                      </button>
                    </Link>
                  ))}
                </div>

                <div className="mt-3">
                  <Link href="/brokers" onClick={() => setIsCategoriasMenuOpen(false)}>
                    <button className="w-full p-3 sm:p-4 rounded-2xl glass-card hover:scale-[1.01] active:scale-[0.99] transition-all duration-200 group flex items-center justify-center gap-3">
                      <div className="w-9 h-9 glass-pill rounded-xl flex items-center justify-center">
                        <Users className="h-5 w-5 text-[#17313A]" />
                      </div>
                      <span className="text-sm font-black text-[#17313A] uppercase tracking-wide" style={{fontFamily:'var(--font-titles)'}}>Brokers y Notarías</span>
                    </button>
                  </Link>
                </div>
                {/* Safe area bottom */}
                <div className="h-4 sm:h-6" />
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
