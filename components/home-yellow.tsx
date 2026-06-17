'use client'

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ArrowRight, Shield, Star, Users, MapPin, House, Sparkle, List, Tag, Key, Percent, Buildings, X, TrendUp, Heart } from "@phosphor-icons/react"
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
      <section className="relative min-h-[92dvh] flex flex-col mt-[60px] mx-4 md:mx-8 mb-16 rounded-[40px] overflow-hidden bg-[#0F2027] shadow-2xl shadow-black/50">
        {/* Background Image Full Bleed */}
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1920&q=80"
            alt="Luxury Architecture"
            className="w-full h-full object-cover object-center scale-105"
          />
          {/* Dramatic overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#0F2027] via-[#0F2027]/90 to-[#0F2027]/40" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0F2027] via-transparent to-[#0F2027]/60" />
        </div>

        {/* Aurora Glow Effects */}
        <div className="absolute top-1/4 left-[10%] w-[500px] h-[500px] bg-[#C78F7B]/15 rounded-full blur-[150px] pointer-events-none z-0" />
        <div className="absolute bottom-1/4 right-[20%] w-96 h-96 bg-[#17313A]/50 rounded-full blur-[120px] pointer-events-none z-0" />
        <div className="absolute top-[60%] left-1/2 -translate-x-1/2 w-72 h-72 bg-[#C78F7B]/8 rounded-full blur-[100px] pointer-events-none z-0" />

        {/* Floating geometric accents */}
        <div className="absolute top-[15%] right-[15%] w-3 h-3 bg-[#C78F7B]/40 rounded-full animate-pulse pointer-events-none z-0" />
        <div className="absolute top-[25%] right-[25%] w-2 h-2 bg-[#C78F7B]/30 rounded-full animate-ping pointer-events-none z-0" />
        <div className="absolute bottom-[30%] left-[8%] w-20 h-[1px] bg-gradient-to-r from-[#C78F7B]/50 to-transparent pointer-events-none z-0 rotate-45" />

        {/* Main Content */}
        <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between w-full h-full p-8 md:p-16 lg:p-24 pb-20">
          {/* Left: Typography */}
          <div className="space-y-10 max-w-2xl">
            <div className="relative">
              {/* Giant blurred glow behind text */}
              <div className="absolute -top-20 -left-10 w-80 h-60 bg-[#C78F7B]/10 rounded-full blur-[80px] pointer-events-none" />
              <h1 className="relative text-6xl sm:text-7xl md:text-[6rem] lg:text-[8rem] font-black text-white leading-[0.85] tracking-tighter">
                Vive
                <span className="font-serif italic font-light bg-gradient-to-r from-[#C78F7B] via-[#E8A88F] to-[#C78F7B] bg-clip-text text-transparent block mt-1 animate-gradient-x bg-[length:200%_auto]">
                  Diferente
                </span>
              </h1>
              <p className="mt-8 text-lg md:text-xl text-[#B0ACA6] max-w-md font-light leading-relaxed border-l-2 border-[#C78F7B] pl-5">
                La forma más transparente y estética de encontrar tu próxima propiedad. Sin intermediarios complicados.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-4">
              <Link href="/propiedades" className="w-full sm:w-auto">
                <Button className="w-full sm:w-auto bg-[#C78F7B] hover:bg-[#D4987E] text-[#0F2027] font-bold h-14 px-10 rounded-full text-base hover:scale-105 transition-all duration-300 gap-2 border-0 shadow-xl shadow-[#C78F7B]/30">
                  <House className="h-5 w-5" weight="duotone" />
                  Explorar Catálogo
                </Button>
              </Link>
              <button
                onClick={() => setIsCategoriasMenuOpen(true)}
                className="w-full sm:w-auto group flex items-center justify-center gap-3 h-14 px-10 rounded-full bg-white/5 border border-white/20 text-[#EAE4DD] font-medium transition-all duration-300 hover:bg-white/10 hover:border-[#C78F7B]/40 backdrop-blur-md"
              >
                <List className="h-5 w-5 text-[#C78F7B] group-hover:scale-110 transition-transform" weight="duotone" />
                Categorías
              </button>
            </div>

            {/* Stats with glass cards */}
            <div className="grid grid-cols-3 gap-4 pt-4">
              {[
                { value: '+500', label: 'Propiedades' },
                { value: '98%', label: 'Satisfacción' },
                { value: 'GTO', label: 'Mercado' },
              ].map((stat, i) => (
                <div key={i} className="relative p-4 rounded-2xl bg-white/[0.04] backdrop-blur-md border border-white/10 group hover:bg-white/[0.07] hover:border-[#C78F7B]/20 transition-all duration-500">
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-[#C78F7B]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <p className={`text-2xl md:text-3xl font-black ${i === 1 ? 'bg-gradient-to-r from-[#C78F7B] to-[#E8A88F] bg-clip-text text-transparent' : 'text-white'} mb-1`}>{stat.value}</p>
                  <p className="text-[10px] text-[#B0ACA6] uppercase tracking-widest font-semibold">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Stacked Floating Cards */}
          <div className="hidden lg:flex flex-col gap-4 items-end mt-10 lg:mt-0">
            {/* Main Property Card */}
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-[#C78F7B]/20 to-[#E8A88F]/20 rounded-3xl blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative w-[280px] bg-white/[0.07] backdrop-blur-xl border border-white/20 rounded-3xl overflow-hidden shadow-2xl">
                <div className="h-32 bg-gradient-to-br from-[#17313A] to-[#0F2027] relative">
                  <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=600&q=80')] bg-cover bg-center opacity-60" />
                  <div className="absolute top-3 right-3 bg-[#C78F7B] text-[#0F2027] text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                    Destacada
                  </div>
                </div>
                <div className="p-5 space-y-3">
                  <div>
                    <p className="text-xs text-[#C78F7B] font-semibold uppercase tracking-wider mb-1">León, Gto</p>
                    <p className="text-sm font-bold text-white leading-tight">Residencia Premium en Zona Norte</p>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-black text-[#C78F7B]">$4.2M</span>
                    <span className="text-[10px] text-[#B0ACA6] uppercase tracking-wider">4 Rec • 3 Baños</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Mini Stats Card */}
            <div className="w-[220px] bg-white/[0.05] backdrop-blur-md border border-white/15 rounded-2xl p-4 shadow-xl -mt-2 mr-10">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 rounded-lg bg-[#C78F7B]/20 flex items-center justify-center">
                  <Star className="h-4 w-4 text-[#C78F7B]" weight="duotone" />
                </div>
                <div>
                  <p className="text-xs font-bold text-white">Premium</p>
                  <p className="text-[9px] text-[#B0ACA6] uppercase tracking-wider">Selección exclusiva</p>
                </div>
              </div>
              <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                <div className="h-full w-[98%] bg-gradient-to-r from-[#C78F7B] to-[#E8A88F] rounded-full" />
              </div>
            </div>
          </div>
        </div>

        {/* Giant background text */}
        <div className="absolute right-0 bottom-[-5%] opacity-[0.04] pointer-events-none select-none overflow-hidden">
          <span className="text-[18vw] font-black text-white leading-none tracking-tighter">CONECTIA</span>
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
      <section className="relative py-16 px-4 sm:px-8 lg:px-16">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: House, value: '+500', label: 'Propiedades', color: 'from-[#C78F7B] to-[#E8A88F]' },
              { icon: Users, value: '98%', label: 'Clientes Satisfechos', color: 'from-[#C78F7B] to-[#E8A88F]' },
              { icon: MapPin, value: 'GTO', label: 'Mercado Principal', color: 'from-[#C78F7B] to-[#E8A88F]' },
              { icon: TrendUp, value: '45d', label: 'Venta Promedio', color: 'from-[#C78F7B] to-[#E8A88F]' },
            ].map((stat, i) => (
              <div key={i} className="group relative p-6 text-center rounded-2xl bg-white/[0.03] backdrop-blur-md border border-white/10 hover:bg-white/[0.06] hover:border-[#C78F7B]/30 transition-all duration-500">
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-[#C78F7B]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative">
                  <div className="w-10 h-10 rounded-xl bg-[#C78F7B]/10 flex items-center justify-center mx-auto mb-3 group-hover:bg-[#C78F7B]/20 transition-colors">
                    <stat.icon className="h-5 w-5 text-[#C78F7B]" weight="duotone" />
                  </div>
                  <p className={`text-2xl sm:text-3xl font-black bg-gradient-to-r ${stat.color} bg-clip-text text-transparent mb-1`}>{stat.value}</p>
                  <p className="text-xs text-[#B0ACA6] uppercase tracking-wider font-semibold">{stat.label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

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
