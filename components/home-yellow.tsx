'use client'

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ArrowRight, Shield, Star, Users, MapPin, House, Crown, List, Tag, Key, Percent, Buildings, X, TrendUp, Heart, ShoppingBag } from "@phosphor-icons/react"
import Link from "next/link"
import Image from "next/image"
import { FeaturedPropertiesCarousel } from "./featured-properties-carousel"
import { CommercialAlliance } from "./commercial-alliance"
import { HomepageAdSlot } from "./homepage-ads"

export function HomeYellow() {
  const [isCategoriasMenuOpen, setIsCategoriasMenuOpen] = useState(false)
  return (
    <div className="min-h-screen relative overflow-hidden transition-all duration-500">
      {/* FONDO ELEGANTE - Gradiente con orbs para glassmorphism */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-[#F8F6F4] via-[#F5F3EF] to-[#F0EDE8] dark:from-[#0F2027] dark:via-[#17313A] dark:to-[#0F2027]" />
        
        {/* Orbs de color sutiles en modo claro que se verán hermosos detrás del glassmorphism */}
        <div className="absolute top-[10%] left-[15%] w-[450px] h-[450px] bg-[#17313A]/12 rounded-full blur-[110px] dark:opacity-0 animate-pulse-slow" />
        <div className="absolute bottom-[25%] right-[10%] w-[550px] h-[550px] bg-[#C78F7B]/18 rounded-full blur-[130px] dark:opacity-0 animate-pulse-slow" />
        <div className="absolute top-[35%] left-[45%] w-[300px] h-[350px] bg-white/45 rounded-full blur-[80px] dark:opacity-0" />

        {/* Líneas horizontales sutilmente decorativas */}
        <div className="absolute top-[20%] left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#17313A]/10 dark:via-[#EAE4DD]/10 to-transparent" />
        <div className="absolute top-[40%] left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#17313A]/5 dark:via-[#EAE4DD]/5 to-transparent" />
        <div className="absolute top-[60%] left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#17313A]/8 dark:via-[#EAE4DD]/8 to-transparent" />
        <div className="absolute top-[80%] left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#17313A]/5 dark:via-[#EAE4DD]/5 to-transparent" />
      </div>

      {/* Hero Section — Elegante y minimalista con Glassmorphism Premium */}
      <section className="relative min-h-[92dvh] flex flex-col mt-[60px] mx-4 md:mx-8 mb-16 rounded-[32px] overflow-hidden border border-t-white/45 border-l-white/35 border-r-[#C78F7B]/25 border-b-[#C78F7B]/30 dark:border-[#17313A]/50 shadow-2xl shadow-[#17313A]/5 dark:shadow-black/30 transition-all duration-500">
        {/* Fondo limpio con Glassmorphism translúcido y saturación */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#C78F7B]/50 via-[#D4987E]/35 to-[#C78F7B]/40 backdrop-blur-[32px] saturate-[160%] dark:bg-gradient-to-br dark:from-[#17313A] dark:via-[#0F2027] dark:to-[#17313A] dark:backdrop-blur-sm" />
        {/* Destello de luz diagonal interno para realismo de vidrio */}
        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/[0.04] to-white/[0.12] pointer-events-none dark:hidden" />
        {/* Líneas decorativas finas */}
        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#17313A]/30 dark:via-[#EAE4DD]/30 to-transparent" />
        <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#17313A]/20 dark:via-[#EAE4DD]/20 to-transparent" />

        {/* Main Content */}
        <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between w-full h-full p-8 md:p-16 lg:p-24 pb-20">
          {/* Left: Typography */}
          <div className="space-y-12 max-w-2xl">
            <div className="relative">
              <h1 className="relative text-6xl sm:text-7xl md:text-[6rem] lg:text-[8rem] font-black text-[#17313A] dark:text-[#EAE4DD] leading-[0.85] tracking-tighter">
                Vive
                <span className="font-serif italic font-light text-[#17313A] dark:text-[#C78F7B] block mt-1">
                  Diferente
                </span>
              </h1>
              <p className="mt-8 text-lg md:text-xl text-[#4A4F57] dark:text-[#B0ACA6] max-w-md font-light leading-relaxed">
                La forma más transparente y estética de encontrar tu próxima propiedad.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-4">
              <Link href="/propiedades" className="w-full sm:w-auto">
                <Button className="w-full sm:w-auto bg-[#17313A] hover:bg-[#1F3D47] dark:bg-[#C78F7B] dark:hover:bg-[#D4987E] text-[#EAE4DD] dark:text-[#0F2027] font-bold h-14 px-8 rounded-2xl text-base hover:scale-105 transition-all duration-300 gap-2 border-0 shadow-lg shadow-[#17313A]/20 dark:shadow-[#C78F7B]/20">
                  <House className="h-5 w-5" weight="duotone" />
                  Explorar
                </Button>
              </Link>
              <button
                onClick={() => setIsCategoriasMenuOpen(true)}
                className="w-full sm:w-auto group flex items-center justify-center gap-3 h-14 px-8 rounded-2xl bg-white dark:bg-[#17313A]/30 border border-[#17313A]/10 dark:border-[#EAE4DD]/20 text-[#17313A] dark:text-[#EAE4DD] font-medium transition-all duration-300 hover:border-[#17313A]/20 dark:hover:border-[#EAE4DD]/30 hover:bg-[#F8F6F4] dark:hover:bg-[#17313A]/40"
              >
                <List className="h-5 w-5 text-[#17313A] dark:text-[#EAE4DD] group-hover:scale-110 transition-transform" weight="duotone" />
                Categorías
              </button>
            </div>

            {/* Stats cards - Elegante y minimalista */}
            <div className="grid grid-cols-3 gap-6 pt-6">
              {[
                { value: '+500', label: 'Propiedades', icon: House },
                { value: '98%', label: 'Satisfacción', icon: Star },
                { value: 'GTO', label: 'Mercado', icon: MapPin },
              ].map((stat, i) => (
                <div key={i} className="relative p-5 rounded-2xl bg-white dark:bg-[#17313A]/20 border border-[#17313A]/8 dark:border-[#EAE4DD]/10 shadow-sm group transition-all duration-300 hover:shadow-md hover:border-[#17313A]/20 dark:hover:border-[#EAE4DD]/20">
                  <div className="relative">
                    <stat.icon className="h-4 w-4 text-[#17313A] dark:text-[#EAE4DD] mb-2" weight="duotone" />
                    <p className={`text-2xl md:text-3xl font-black text-[#17313A] dark:text-[#EAE4DD] mb-1`}>{stat.value}</p>
                    <p className="text-[10px] text-[#4A4F57] dark:text-[#B0ACA6] uppercase tracking-widest font-semibold">{stat.label}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Stacked Cards - Elegante minimalista */}
          <div className="hidden lg:flex flex-col gap-6 items-end mt-10 lg:mt-0">
            {/* Main Property Card */}
            <div className="relative group w-[300px]">
              <div className="relative bg-white dark:bg-[#17313A]/20 rounded-2xl overflow-hidden shadow-lg border border-[#17313A]/8 dark:border-[#EAE4DD]/10 hover:shadow-xl hover:border-[#17313A]/20 dark:hover:border-[#EAE4DD]/20 transition-all duration-300">
                <div className="h-36 bg-gradient-to-br from-[#17313A]/10 to-[#17313A]/5 relative">
                  <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=600&q=80')] bg-cover bg-center opacity-90" />
                  <div className="absolute top-4 right-4 bg-white/90 dark:bg-[#17313A]/90 backdrop-blur text-[#17313A] dark:text-[#EAE4DD] text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                    Destacada
                  </div>
                </div>
                <div className="p-5 space-y-3">
                  <div>
                    <p className="text-xs text-[#17313A] dark:text-[#EAE4DD] font-semibold uppercase tracking-wider mb-1">León, Gto</p>
                    <p className="text-sm font-bold text-[#17313A] dark:text-[#EAE4DD] leading-tight">Residencia Exclusiva en Zona Norte</p>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-black text-[#17313A] dark:text-[#EAE4DD]">$4.2M</span>
                    <span className="text-[10px] text-[#4A4F57] dark:text-[#B0ACA6] uppercase tracking-wider">4 Rec • 3 Baños</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Badge Card */}
            <div className="w-[240px] bg-white dark:bg-[#17313A]/20 rounded-2xl p-5 shadow-md border border-[#17313A]/8 dark:border-[#EAE4DD]/10 -mt-2 mr-8">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-[#17313A]/10 dark:bg-[#EAE4DD]/10 flex items-center justify-center">
                  <Star className="h-5 w-5 text-[#17313A] dark:text-[#EAE4DD]" weight="duotone" />
                </div>
                <div>
                  <p className="text-xs font-bold text-[#17313A] dark:text-[#EAE4DD]">Exclusivo</p>
                  <p className="text-[9px] text-[#4A4F57] dark:text-[#B0ACA6] uppercase tracking-wider">Selección premium</p>
                </div>
              </div>
              <div className="h-1 bg-[#17313A]/5 rounded-full overflow-hidden">
                <div className="h-full w-[98%] bg-[#17313A] rounded-full" />
              </div>
            </div>
          </div>
        </div>

        </section>

      {/* Featured Properties Carousel - Elegante */}
      <section className="relative py-16 sm:py-24 px-4 sm:px-8 lg:px-16">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-end gap-4 sm:gap-8 mb-12 sm:mb-16">
            <div>
              <p className="text-[10px] uppercase tracking-[0.35em] text-[#17313A] dark:text-[#EAE4DD] font-bold mb-2">Selección</p>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-[#17313A] dark:text-[#EAE4DD] leading-tight" style={{fontFamily:'var(--font-titles)'}}>
                Propiedades <span className="text-[#17313A] dark:text-[#EAE4DD]">Destacadas</span>
              </h2>
            </div>
            <div className="flex-1 h-px bg-gradient-to-r from-[#17313A]/20 to-transparent mb-1 hidden sm:block" />
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

      {/* CTA Section — Elegante minimalista */}
      <section className="relative py-16 sm:py-20 px-4 sm:px-8">
        <div className="max-w-5xl mx-auto">
          {/* Contenedor elegante */}
          <div className="relative rounded-2xl overflow-hidden bg-white dark:bg-[#17313A]/20 border border-[#17313A]/10 dark:border-[#EAE4DD]/10 shadow-lg">
            {/* Líneas decorativas */}
            <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#17313A]/30 dark:via-[#EAE4DD]/30 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#17313A]/20 dark:via-[#EAE4DD]/20 to-transparent" />

            <div className="relative px-10 sm:px-16 py-14 sm:py-18">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-10">

                {/* Izquierda: texto */}
                <div className="space-y-4 md:max-w-lg">
                  <p className="text-[10px] uppercase tracking-[0.40em] text-[#17313A] dark:text-[#EAE4DD] font-semibold">
                    Únete ahora
                  </p>
                  <h2 className="font-titles text-4xl sm:text-5xl font-light text-[#17313A] dark:text-[#EAE4DD] leading-[1.15]">
                    ¿Listo para el<br />
                    <span className="italic text-[#17313A] dark:text-[#EAE4DD]">siguiente paso?</span>
                  </h2>
                  <p className="text-[#4A4F57] dark:text-[#B0ACA6] text-base leading-relaxed max-w-md">
                    Únete a nuestros clientes satisfechos y descubre la facilidad de comprar o vender con CONECTIA
                  </p>
                </div>

                {/* Derecha: botones */}
                <div className="flex flex-col gap-3 flex-shrink-0 min-w-[200px]">
                  <Link href="/contacto">
                    <button className="w-full flex items-center justify-center gap-2 px-8 py-4 rounded-xl text-sm font-semibold tracking-wide text-[#EAE4DD] dark:text-[#17313A] bg-[#17313A] hover:bg-[#1F3D47] dark:bg-[#EAE4DD] dark:hover:bg-white shadow-md transition-all duration-300">
                      <MapPin className="h-4 w-4" weight="duotone" />
                      Contactar
                    </button>
                  </Link>
                  <Link href="/propiedades">
                    <button className="w-full flex items-center justify-center gap-2 px-8 py-4 rounded-xl text-sm font-semibold tracking-wide text-[#17313A] dark:text-[#EAE4DD] bg-white dark:bg-[#17313A]/30 border border-[#17313A]/20 dark:border-[#EAE4DD]/20 hover:border-[#17313A]/40 dark:hover:border-[#EAE4DD]/30 hover:bg-[#F8F6F4] dark:hover:bg-[#17313A]/40 transition-all duration-300">
                      Ver Propiedades
                      <ArrowRight className="h-4 w-4" weight="bold" />
                    </button>
                  </Link>
                </div>

              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section - Elegante minimalista */}
      <section className="relative py-16 sm:py-20 px-4 sm:px-8 lg:px-16">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { icon: House, value: '+500', label: 'Propiedades' },
              { icon: Users, value: '98%', label: 'Clientes Satisfechos' },
              { icon: MapPin, value: 'GTO', label: 'Mercado Principal' },
              { icon: TrendUp, value: '45d', label: 'Venta Promedio' },
            ].map((stat, i) => (
              <div key={i} className="group relative p-6 text-center rounded-2xl bg-white border border-[#17313A]/8 shadow-sm transition-all duration-300 hover:shadow-md hover:border-[#17313A]/20">
                <div className="relative">
                  <div className="w-10 h-10 rounded-xl bg-[#17313A]/10 flex items-center justify-center mx-auto mb-3 group-hover:bg-[#17313A]/15 transition-colors">
                    <stat.icon className="h-5 w-5 text-[#17313A]" weight="duotone" />
                  </div>
                  <p className={`text-2xl sm:text-3xl font-black text-[#17313A] mb-1`}>{stat.value}</p>
                  <p className="text-xs text-[#4A4F57] uppercase tracking-wider font-semibold">{stat.label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Drawer de Categorías — Elegante minimalista */}
      {isCategoriasMenuOpen && (
        <>
          {/* Overlay */}
          <div
            className="fixed inset-0 bg-[#17313A]/15 backdrop-blur-sm z-50 animate-in fade-in duration-200"
            onClick={() => setIsCategoriasMenuOpen(false)}
          />

          {/* Drawer */}
          <div className="fixed inset-x-0 bottom-0 z-50 pointer-events-none">
            <div
              className="bg-white border-t border-[#17313A]/10 shadow-xl w-full pointer-events-auto animate-in slide-in-from-bottom-4 duration-300 rounded-t-3xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Handle */}
              <div className="flex justify-center pt-4 pb-2">
                <div className="w-12 h-1 bg-[#17313A]/20 rounded-full" />
              </div>
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-[#17313A]/5">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-[#17313A]/10 rounded-lg flex items-center justify-center">
                    <List className="h-4 w-4 text-[#17313A]" weight="duotone" />
                  </div>
                  <h3 className="text-base font-black text-[#17313A] uppercase tracking-widest" style={{fontFamily:'var(--font-titles)'}}>Categorías</h3>
                </div>
                <button
                  onClick={() => setIsCategoriasMenuOpen(false)}
                  className="w-8 h-8 flex items-center justify-center rounded-lg bg-[#17313A]/5 hover:bg-[#17313A]/10 transition-colors"
                >
                  <X className="h-4 w-4 text-[#4A4F57]" weight="bold" />
                </button>
              </div>

              {/* Grid de categorías */}
              <div className="p-4 sm:p-6">
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 sm:gap-4">
                  {[
                    { href: '/compra', icon: ShoppingBag, label: 'Compra' },
                    { href: '/venta', icon: Tag, label: 'Venta' },
                    { href: '/renta', icon: Key, label: 'Renta' },
                    { href: '/especiales', icon: Crown, label: 'Especiales' },
                    { href: '/ofertas', icon: Percent, label: 'Ofertas' },
                  ].map(({ href, icon: Icon, label }) => (
                    <Link key={href} href={href} onClick={() => setIsCategoriasMenuOpen(false)}>
                      <button className="w-full p-3 sm:p-4 rounded-xl bg-white border border-[#17313A]/10 hover:border-[#17313A]/30 hover:scale-105 active:scale-95 transition-all duration-200 group flex flex-col items-center gap-2 shadow-sm">
                        <div className="w-10 h-10 bg-[#17313A]/5 rounded-lg flex items-center justify-center group-hover:bg-[#17313A]/10 transition-colors">
                          <Icon className="h-5 w-5 text-[#17313A]" weight="duotone" />
                        </div>
                        <span className="text-xs font-bold text-[#17313A]">{label}</span>
                      </button>
                    </Link>
                  ))}
                </div>

                <div className="mt-4">
                  <Link href="/brokers" onClick={() => setIsCategoriasMenuOpen(false)}>
                    <button className="w-full p-4 rounded-xl bg-white border border-[#17313A]/10 hover:border-[#17313A]/30 hover:scale-[1.01] active:scale-[0.99] transition-all duration-200 group flex items-center justify-center gap-3 shadow-sm">
                      <div className="w-9 h-9 bg-[#17313A]/10 rounded-lg flex items-center justify-center">
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
