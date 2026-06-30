'use client'

import { useState } from "react"
import { ArrowRight, Star, Users, MapPin, House, List, Tag, Key, Percent, Crown, X, TrendUp, ShoppingBag } from "@phosphor-icons/react"
import Link from "next/link"
import Image from "next/image"
import { FeaturedPropertiesCarousel } from "./featured-properties-carousel"
import { CommercialAlliance } from "./commercial-alliance"
import { HomepageAdSlot } from "./homepage-ads"

export function HomeYellow() {
  const [isCategoriasMenuOpen, setIsCategoriasMenuOpen] = useState(false)

  return (
    <div className="min-h-screen bg-white dark:bg-[#0F2027] transition-colors duration-300">

      {/* ── HERO ───────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-8 pt-8 pb-12 mt-[60px]">
        <div className="flex flex-col lg:flex-row items-center gap-10 lg:gap-16">

          {/* Left */}
          <div className="flex-1 space-y-8">
            <h1 className="text-[5rem] sm:text-[6.5rem] md:text-[8rem] font-black text-[#17313A] dark:text-[#EAE4DD] leading-[0.88] tracking-tighter">
              Vive
              <span className="block font-serif italic font-normal text-[#C78F7B]">
                Diferente
              </span>
            </h1>

            <p className="text-base md:text-lg text-[#6B7280] dark:text-[#B0ACA6] max-w-sm font-normal leading-relaxed">
              La forma más transparente y estética de encontrar tu próxima propiedad.
            </p>

            <div className="flex flex-wrap gap-3">
              <Link href="/propiedades">
                <button className="flex items-center gap-2 bg-[#C78F7B] hover:bg-[#b87c68] text-white font-semibold px-6 py-3 rounded-xl transition-colors duration-200 text-sm">
                  <ArrowRight className="h-4 w-4" weight="bold" />
                  Explorar
                </button>
              </Link>
              <button
                onClick={() => setIsCategoriasMenuOpen(true)}
                className="flex items-center gap-2 bg-white dark:bg-[#17313A]/30 border border-[#E5E7EB] dark:border-[#EAE4DD]/20 text-[#17313A] dark:text-[#EAE4DD] font-semibold px-6 py-3 rounded-xl hover:border-[#C78F7B]/40 dark:hover:border-[#C78F7B]/40 transition-colors duration-200 text-sm"
              >
                <List className="h-4 w-4" weight="duotone" />
                Categorías
              </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 pt-2">
              {[
                { icon: House, value: '+500', label: 'PROPIEDADES' },
                { icon: Star,  value: '98%',  label: 'SATISFACCIÓN' },
                { icon: MapPin,value: 'CTO',  label: 'MERCADO' },
              ].map((s, i) => (
                <div key={i} className="flex flex-col gap-1 p-4 rounded-2xl border border-[#E5E7EB] dark:border-[#EAE4DD]/10 bg-white dark:bg-[#17313A]/10">
                  <s.icon className="h-4 w-4 text-[#C78F7B]" weight="duotone" />
                  <p className="text-2xl font-black text-[#17313A] dark:text-[#EAE4DD] leading-none">{s.value}</p>
                  <p className="text-[9px] uppercase tracking-widest text-[#9CA3AF] dark:text-[#B0ACA6] font-semibold">{s.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Right: gran foto */}
          <div className="flex-1 w-full lg:max-w-[52%]">
            <div className="relative w-full aspect-[4/3] rounded-[28px] overflow-hidden shadow-xl">
              <Image
                src="https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=1200&q=85"
                alt="Propiedad destacada"
                fill
                className="object-cover"
                priority
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── PROPIEDAD DESTACADA ────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-8 pb-16">
        <div className="rounded-3xl border border-[#E5E7EB] dark:border-[#EAE4DD]/10 bg-white dark:bg-[#17313A]/10 overflow-hidden shadow-sm">
          <div className="flex flex-col md:flex-row">
            {/* Galería */}
            <div className="md:w-[55%] p-4 flex flex-col gap-3">
              <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden">
                <Image
                  src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1000&q=80"
                  alt="Interior sala"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="grid grid-cols-4 gap-2">
                {[
                  'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=300&q=70',
                  'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=300&q=70',
                  'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=300&q=70',
                  'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=300&q=70',
                ].map((src, i) => (
                  <div key={i} className="relative aspect-[4/3] rounded-xl overflow-hidden">
                    <Image src={src} alt={`foto ${i}`} fill className="object-cover" />
                  </div>
                ))}
              </div>
            </div>

            {/* Info */}
            <div className="flex-1 p-6 md:p-8 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold text-[#9CA3AF] dark:text-[#B0ACA6] uppercase tracking-widest">León, GTO</p>
                  <span className="bg-[#C78F7B] text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full">
                    Destacada
                  </span>
                </div>

                <h2 className="text-2xl md:text-3xl font-bold text-[#17313A] dark:text-[#EAE4DD] leading-tight">
                  Residencia Exclusiva<br />en Zona Norte
                </h2>

                <div className="w-8 h-[2px] bg-[#C78F7B] rounded-full" />

                <p className="text-4xl font-black text-[#17313A] dark:text-[#EAE4DD]">$4.2M</p>

                <div className="flex flex-wrap gap-4 text-sm text-[#6B7280] dark:text-[#B0ACA6]">
                  <span className="flex items-center gap-1.5">
                    <House className="h-4 w-4 text-[#C78F7B]" weight="duotone" />
                    4 Rec
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Star className="h-4 w-4 text-[#C78F7B]" weight="duotone" />
                    3 Baños
                  </span>
                  <span className="flex items-center gap-1.5">
                    <MapPin className="h-4 w-4 text-[#C78F7B]" weight="duotone" />
                    2 Estacionamientos
                  </span>
                </div>
              </div>

              <Link href="/propiedades" className="mt-6">
                <div className="flex items-center justify-between p-4 rounded-2xl border border-[#E5E7EB] dark:border-[#EAE4DD]/10 hover:border-[#C78F7B]/40 dark:hover:border-[#C78F7B]/40 transition-colors cursor-pointer group">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-[#C78F7B]/10 flex items-center justify-center">
                      <Star className="h-4 w-4 text-[#C78F7B]" weight="duotone" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-[#17313A] dark:text-[#EAE4DD]">Exclusivo</p>
                      <p className="text-[10px] text-[#9CA3AF] uppercase tracking-wider">Selección Premium</p>
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-[#9CA3AF] group-hover:text-[#C78F7B] transition-colors" weight="bold" />
                </div>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── PROPIEDADES DESTACADAS CAROUSEL ───────────────────── */}
      <section className="relative py-16 sm:py-24 px-4 sm:px-8 lg:px-16">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-end gap-4 sm:gap-8 mb-12 sm:mb-16">
            <div>
              <p className="text-[10px] uppercase tracking-[0.35em] text-[#C78F7B] font-bold mb-2">Selección</p>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-[#17313A] dark:text-[#EAE4DD] leading-tight">
                Propiedades <span className="font-serif italic font-normal text-[#C78F7B]">Destacadas</span>
              </h2>
            </div>
            <div className="flex-1 h-px bg-gradient-to-r from-[#E5E7EB] to-transparent mb-1 hidden sm:block dark:from-[#EAE4DD]/10" />
          </div>
          <FeaturedPropertiesCarousel />
        </div>
      </section>

      {/* ── ALIANZAS COMERCIALES ──────────────────────────────── */}
      <section>
        <CommercialAlliance />
      </section>

      {/* ── AD SLOT ───────────────────────────────────────────── */}
      <HomepageAdSlot ubicacion="footer" />

      {/* ── CTA ───────────────────────────────────────────────── */}
      <section className="relative py-16 sm:py-20 px-4 sm:px-8">
        <div className="max-w-5xl mx-auto">
          <div className="relative rounded-3xl overflow-hidden bg-[#17313A] dark:bg-[#17313A] px-10 sm:px-16 py-14">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-10">
              <div className="space-y-4 md:max-w-lg">
                <p className="text-[10px] uppercase tracking-[0.40em] text-[#C78F7B] font-semibold">Únete ahora</p>
                <h2 className="text-4xl sm:text-5xl font-black text-[#EAE4DD] leading-[1.1]">
                  ¿Listo para el<br />
                  <span className="font-serif italic font-normal text-[#C78F7B]">siguiente paso?</span>
                </h2>
                <p className="text-[#B0ACA6] text-base leading-relaxed max-w-md">
                  Únete a nuestros clientes satisfechos y descubre la facilidad de comprar o vender con CONECTIA
                </p>
              </div>
              <div className="flex flex-col gap-3 flex-shrink-0 min-w-[200px]">
                <Link href="/contacto">
                  <button className="w-full flex items-center justify-center gap-2 px-8 py-4 rounded-xl text-sm font-semibold bg-[#C78F7B] hover:bg-[#b87c68] text-white transition-colors duration-200">
                    <MapPin className="h-4 w-4" weight="duotone" />
                    Contactar
                  </button>
                </Link>
                <Link href="/propiedades">
                  <button className="w-full flex items-center justify-center gap-2 px-8 py-4 rounded-xl text-sm font-semibold text-[#EAE4DD] border border-[#EAE4DD]/20 hover:border-[#C78F7B]/50 hover:bg-white/5 transition-all duration-200">
                    Ver Propiedades
                    <ArrowRight className="h-4 w-4" weight="bold" />
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── STATS ─────────────────────────────────────────────── */}
      <section className="relative py-16 sm:py-20 px-4 sm:px-8 lg:px-16">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { icon: House,   value: '+500', label: 'Propiedades' },
              { icon: Users,   value: '98%',  label: 'Clientes Satisfechos' },
              { icon: MapPin,  value: 'GTO',  label: 'Mercado Principal' },
              { icon: TrendUp, value: '45d',  label: 'Venta Promedio' },
            ].map((stat, i) => (
              <div key={i} className="group p-6 text-center rounded-2xl bg-white dark:bg-[#17313A]/10 border border-[#E5E7EB] dark:border-[#EAE4DD]/10 shadow-sm hover:border-[#C78F7B]/30 transition-colors duration-200">
                <div className="w-10 h-10 rounded-xl bg-[#C78F7B]/10 flex items-center justify-center mx-auto mb-3">
                  <stat.icon className="h-5 w-5 text-[#C78F7B]" weight="duotone" />
                </div>
                <p className="text-2xl sm:text-3xl font-black text-[#17313A] dark:text-[#EAE4DD] mb-1">{stat.value}</p>
                <p className="text-xs text-[#9CA3AF] dark:text-[#B0ACA6] uppercase tracking-wider font-semibold">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── DRAWER CATEGORÍAS ─────────────────────────────────── */}
      {isCategoriasMenuOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 animate-in fade-in duration-200"
            onClick={() => setIsCategoriasMenuOpen(false)}
          />
          <div className="fixed inset-x-0 bottom-0 z-50 pointer-events-none">
            <div
              className="bg-white dark:bg-[#17313A] border-t border-[#E5E7EB] dark:border-[#EAE4DD]/10 shadow-xl w-full pointer-events-auto animate-in slide-in-from-bottom-4 duration-300 rounded-t-3xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-center pt-4 pb-2">
                <div className="w-12 h-1 bg-[#E5E7EB] dark:bg-[#EAE4DD]/20 rounded-full" />
              </div>
              <div className="flex items-center justify-between px-6 py-4 border-b border-[#E5E7EB] dark:border-[#EAE4DD]/10">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-[#C78F7B]/10 rounded-lg flex items-center justify-center">
                    <List className="h-4 w-4 text-[#C78F7B]" weight="duotone" />
                  </div>
                  <h3 className="text-base font-black text-[#17313A] dark:text-[#EAE4DD] uppercase tracking-widest">Categorías</h3>
                </div>
                <button
                  onClick={() => setIsCategoriasMenuOpen(false)}
                  className="w-8 h-8 flex items-center justify-center rounded-lg bg-[#F3F4F6] dark:bg-[#EAE4DD]/10 hover:bg-[#E5E7EB] dark:hover:bg-[#EAE4DD]/20 transition-colors"
                >
                  <X className="h-4 w-4 text-[#6B7280] dark:text-[#B0ACA6]" weight="bold" />
                </button>
              </div>
              <div className="p-4 sm:p-6">
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-3 sm:gap-4">
                  {[
                    { href: '/compra',     icon: ShoppingBag, label: 'Compra' },
                    { href: '/venta',      icon: Tag,         label: 'Venta' },
                    { href: '/renta',      icon: Key,         label: 'Renta' },
                    { href: '/especiales', icon: Crown,       label: 'Especiales' },
                    { href: '/ofertas',    icon: Percent,     label: 'Ofertas' },
                  ].map(({ href, icon: Icon, label }) => (
                    <Link key={href} href={href} onClick={() => setIsCategoriasMenuOpen(false)}>
                      <button className="w-full p-3 sm:p-4 rounded-xl bg-white dark:bg-[#17313A]/30 border border-[#E5E7EB] dark:border-[#EAE4DD]/10 hover:border-[#C78F7B]/40 hover:scale-105 active:scale-95 transition-all duration-200 group flex flex-col items-center gap-2 shadow-sm">
                        <div className="w-10 h-10 bg-[#C78F7B]/8 rounded-lg flex items-center justify-center group-hover:bg-[#C78F7B]/15 transition-colors">
                          <Icon className="h-5 w-5 text-[#C78F7B]" weight="duotone" />
                        </div>
                        <span className="text-xs font-bold text-[#17313A] dark:text-[#EAE4DD]">{label}</span>
                      </button>
                    </Link>
                  ))}
                </div>
                <div className="mt-4">
                  <Link href="/brokers" onClick={() => setIsCategoriasMenuOpen(false)}>
                    <button className="w-full p-4 rounded-xl bg-white dark:bg-[#17313A]/30 border border-[#E5E7EB] dark:border-[#EAE4DD]/10 hover:border-[#C78F7B]/40 transition-all duration-200 group flex items-center justify-center gap-3 shadow-sm">
                      <div className="w-9 h-9 bg-[#C78F7B]/10 rounded-lg flex items-center justify-center">
                        <Users className="h-5 w-5 text-[#C78F7B]" weight="duotone" />
                      </div>
                      <span className="text-sm font-black text-[#17313A] dark:text-[#EAE4DD] uppercase tracking-wide">Brokers y Notarías</span>
                    </button>
                  </Link>
                </div>
                <div className="h-4 sm:h-6" />
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
