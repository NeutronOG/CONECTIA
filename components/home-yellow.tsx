'use client'

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ArrowRight, Shield, Star, Users, MapPin, Home, Sparkles, Menu, Tag, Key, Percent, Building, X } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { FeaturedPropertiesCarousel } from "./featured-properties-carousel"
import { VirtualToursSection } from "./virtual-tours-section"
import { AnimatedStats } from "./animated-stats"
import { CommercialAlliance } from "./commercial-alliance"
import { HomepageAdSlot } from "./homepage-ads"
import { WhyConectiaCarousel } from "./why-conectia-carousel"

export function HomeYellow() {
  const [isCategoriasMenuOpen, setIsCategoriasMenuOpen] = useState(false)
  return (
    <div className="min-h-screen bg-conectia-surface relative overflow-hidden transition-all duration-500">
      {/* Hero Section — Editorial & Left-Aligned */}
      <section className="relative min-h-[92dvh] flex flex-col md:flex-row mt-[60px] mx-4 md:mx-8 mb-16 rounded-[40px] overflow-hidden bg-conectia-accent shadow-2xl">
        {/* Mitad Derecha: Imagen que ocupa el 60% */}
        <div className="absolute right-0 top-0 bottom-0 w-full md:w-[60%] z-0">
          <img
            src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1920&q=80"
            alt="Luxury Architecture"
            className="w-full h-full object-cover object-center"
          />
          {/* Gradiente para fundir con la parte izquierda */}
          <div className="absolute inset-0 bg-gradient-to-r from-conectia-accent via-conectia-accent/80 to-transparent md:via-conectia-accent/20" />
          <div className="absolute inset-0 bg-gradient-to-t from-conectia-accent via-transparent to-transparent" />
        </div>

        {/* Contenido principal superpuesto, alineado a la izquierda */}
        <div className="relative z-10 flex flex-col justify-center w-full md:w-[50%] p-8 md:p-16 lg:p-24 pb-20">
          <div className="space-y-8 max-w-xl">
            <div className="inline-flex items-center gap-3 bg-white/5 backdrop-blur-md px-4 py-2 rounded-full border border-white/10">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-conectia-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-conectia-primary"></span>
              </span>
              <span className="text-[10px] uppercase tracking-[0.3em] text-white font-semibold">
                Mercado Premium Activo
              </span>
            </div>

            {/* Typography disruptiva */}
            <div className="relative">
              <h1 className="text-5xl sm:text-6xl md:text-[5rem] lg:text-[6.5rem] font-bold text-white leading-[0.9] tracking-tighter">
                Vive <span className="font-serif italic font-light text-conectia-primary block mt-2">Diferente</span>
              </h1>
              <p className="mt-8 text-base md:text-lg text-gray-300 max-w-md font-light leading-relaxed border-l-2 border-conectia-primary pl-4">
                La forma más transparente y estética de encontrar tu próxima propiedad. Sin intermediarios complicados.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-4 pt-4">
              <Link href="/propiedades" className="w-full sm:w-auto">
                <Button className="w-full sm:w-auto bg-conectia-primary hover:bg-conectia-primary/90 text-white font-bold h-14 px-8 rounded-full text-base shadow-xl shadow-conectia-primary/30 hover:scale-105 transition-all duration-300 gap-2">
                  <Home className="h-5 w-5" />
                  Explorar Catálogo
                </Button>
              </Link>
              <button
                onClick={() => setIsCategoriasMenuOpen(true)}
                className="w-full sm:w-auto group flex items-center justify-center gap-3 h-14 px-8 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-white font-medium transition-all backdrop-blur-sm"
              >
                <Menu className="h-5 w-5 text-conectia-primary group-hover:scale-110 transition-transform" />
                Categorías
              </button>
            </div>

            <div className="grid grid-cols-2 gap-6 pt-10 border-t border-white/10">
              <div>
                <p className="text-4xl font-black text-white mb-1">+500</p>
                <p className="text-[11px] text-gray-400 uppercase tracking-widest font-semibold">Propiedades</p>
              </div>
              <div>
                <p className="text-4xl font-black text-white mb-1 text-conectia-primary">GTO</p>
                <p className="text-[11px] text-gray-400 uppercase tracking-widest font-semibold">Mercado Principal</p>
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
      <section className="relative py-14 sm:py-20 px-4 sm:px-8 lg:px-16 bg-conectia-surface">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-end gap-4 sm:gap-8 mb-10 sm:mb-14">
            <div>
              <p className="text-[10px] uppercase tracking-[0.35em] text-conectia-primary font-bold mb-2">Selección</p>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-conectia-accent leading-tight">
                Propiedades <span className="text-conectia-primary">Destacadas</span>
              </h2>
            </div>
            <div className="flex-1 h-px bg-gradient-to-r from-conectia-primary/30 to-transparent mb-1 hidden sm:block" />
          </div>
          <FeaturedPropertiesCarousel />
        </div>
      </section>

      {/* Planes de Pago Section */}
      <section>
        <CommercialAlliance />
      </section>


      {/* Features Section - Carousel */}
      <WhyConectiaCarousel />

      {/* Virtual Tours Section */}
      <VirtualToursSection />

      {/* Ad Slot: Antes del Footer */}
      <HomepageAdSlot ubicacion="footer" />

      {/* CTA Section — Franja horizontal */}
      <section className="relative bg-conectia-accent overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-conectia-primary/8 to-transparent pointer-events-none" />
        {/* Línea decorativa superior */}
        <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-conectia-primary via-conectia-primary/60 to-transparent" />
        <div className="relative max-w-6xl mx-auto px-4 sm:px-8 lg:px-16 py-14 sm:py-20">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-8 sm:gap-10">
            {/* Texto izquierda */}
            <div className="space-y-3 md:max-w-xl">
              <p className="text-[10px] uppercase tracking-[0.35em] text-conectia-primary font-bold">Únete ahora</p>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-conectia-secondary leading-tight">
                ¿Listo para el<br />siguiente paso?
              </h2>
              <p className="text-base text-conectia-secondary/70 leading-relaxed">
                Únete a nuestros clientes satisfechos y descubre la facilidad de comprar o vender con CONECTIA SELECT
              </p>
            </div>
            {/* Botones derecha */}
            <div className="flex flex-col sm:flex-row md:flex-col gap-3 flex-shrink-0">
              <Link href="/contacto" className="w-full sm:w-auto">
                <Button className="w-full bg-conectia-primary hover:bg-conectia-primary/90 text-white font-bold px-8 py-4 rounded-lg text-base shadow-lg shadow-conectia-primary/30 hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Contactar Ahora
                </Button>
              </Link>
              <Link href="/propiedades" className="w-full sm:w-auto">
                <Button
                  variant="outline"
                  className="w-full border-2 border-conectia-secondary/50 text-conectia-secondary font-bold px-8 py-4 rounded-lg text-base hover:bg-conectia-secondary/10 hover:border-conectia-secondary transition-all duration-300 flex items-center justify-center gap-2"
                >
                  Ver Propiedades
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Animated Stats Section */}
      <AnimatedStats />

      {/* Drawer de Categorías — sube desde abajo */}
      {isCategoriasMenuOpen && (
        <>
          {/* Overlay */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 animate-in fade-in duration-200"
            onClick={() => setIsCategoriasMenuOpen(false)}
          />

          {/* Drawer */}
          <div className="fixed inset-x-0 bottom-0 z-50 pointer-events-none">
            <div
              className="bg-conectia-surface border-t-2 border-conectia-primary shadow-2xl w-full pointer-events-auto animate-in slide-in-from-bottom-4 duration-300 rounded-t-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Handle */}
              <div className="flex justify-center pt-3 pb-1">
                <div className="w-10 h-1 bg-conectia-accent/20 rounded-full" />
              </div>
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-conectia-accent/10">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-conectia-primary/15 rounded-lg flex items-center justify-center">
                    <Menu className="h-4 w-4 text-conectia-primary" />
                  </div>
                  <h3 className="text-base font-black text-conectia-accent uppercase tracking-widest">Categorías</h3>
                </div>
                <button
                  onClick={() => setIsCategoriasMenuOpen(false)}
                  className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-conectia-accent/8 transition-colors"
                >
                  <X className="h-4 w-4 text-conectia-accent" />
                </button>
              </div>

              {/* Grid de categorías */}
              <div className="p-4 sm:p-6">
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 sm:gap-3">
                  <Link href="/venta" onClick={() => setIsCategoriasMenuOpen(false)}>
                    <button className="w-full p-3 sm:p-4 rounded-xl bg-conectia-surface-container hover:bg-conectia-primary/10 border border-transparent hover:border-conectia-primary/40 transition-all duration-200 group flex flex-col items-center gap-2">
                      <div className="w-10 h-10 bg-conectia-primary/15 rounded-lg flex items-center justify-center group-hover:bg-conectia-primary/25 transition-colors">
                        <Tag className="h-5 w-5 text-conectia-primary" />
                      </div>
                      <span className="text-xs font-bold text-conectia-accent">Venta</span>
                    </button>
                  </Link>
                  <Link href="/renta" onClick={() => setIsCategoriasMenuOpen(false)}>
                    <button className="w-full p-3 sm:p-4 rounded-xl bg-conectia-surface-container hover:bg-conectia-primary/10 border border-transparent hover:border-conectia-primary/40 transition-all duration-200 group flex flex-col items-center gap-2">
                      <div className="w-10 h-10 bg-conectia-primary/15 rounded-lg flex items-center justify-center group-hover:bg-conectia-primary/25 transition-colors">
                        <Key className="h-5 w-5 text-conectia-primary" />
                      </div>
                      <span className="text-xs font-bold text-conectia-accent">Renta</span>
                    </button>
                  </Link>
                  <Link href="/especiales" onClick={() => setIsCategoriasMenuOpen(false)}>
                    <button className="w-full p-3 sm:p-4 rounded-xl bg-conectia-surface-container hover:bg-conectia-primary/10 border border-transparent hover:border-conectia-primary/40 transition-all duration-200 group flex flex-col items-center gap-2">
                      <div className="w-10 h-10 bg-conectia-primary/15 rounded-lg flex items-center justify-center group-hover:bg-conectia-primary/25 transition-colors">
                        <Sparkles className="h-5 w-5 text-conectia-primary" />
                      </div>
                      <span className="text-xs font-bold text-conectia-accent">Especiales</span>
                    </button>
                  </Link>
                  <Link href="/ofertas" onClick={() => setIsCategoriasMenuOpen(false)}>
                    <button className="w-full p-3 sm:p-4 rounded-xl bg-conectia-surface-container hover:bg-conectia-primary/10 border border-transparent hover:border-conectia-primary/40 transition-all duration-200 group flex flex-col items-center gap-2">
                      <div className="w-10 h-10 bg-conectia-primary/15 rounded-lg flex items-center justify-center group-hover:bg-conectia-primary/25 transition-colors">
                        <Percent className="h-5 w-5 text-conectia-primary" />
                      </div>
                      <span className="text-xs font-bold text-conectia-accent">Ofertas</span>
                    </button>
                  </Link>
                  <Link href="/exclusivos" onClick={() => setIsCategoriasMenuOpen(false)}>
                    <button className="w-full p-3 sm:p-4 rounded-xl bg-conectia-surface-container hover:bg-conectia-primary/10 border border-transparent hover:border-conectia-primary/40 transition-all duration-200 group flex flex-col items-center gap-2">
                      <div className="w-10 h-10 bg-conectia-primary/15 rounded-lg flex items-center justify-center group-hover:bg-conectia-primary/25 transition-colors">
                        <Shield className="h-5 w-5 text-conectia-primary" />
                      </div>
                      <span className="text-xs font-bold text-conectia-accent">Exclusivos</span>
                    </button>
                  </Link>
                  <Link href="/desarrollos" onClick={() => setIsCategoriasMenuOpen(false)}>
                    <button className="w-full p-3 sm:p-4 rounded-xl bg-conectia-surface-container hover:bg-conectia-primary/10 border border-transparent hover:border-conectia-primary/40 transition-all duration-200 group flex flex-col items-center gap-2">
                      <div className="w-10 h-10 bg-conectia-primary/15 rounded-lg flex items-center justify-center group-hover:bg-conectia-primary/25 transition-colors">
                        <Building className="h-5 w-5 text-conectia-primary" />
                      </div>
                      <span className="text-xs font-bold text-conectia-accent">Desarrollos</span>
                    </button>
                  </Link>
                </div>

                <div className="mt-3">
                  <Link href="/brokers" onClick={() => setIsCategoriasMenuOpen(false)}>
                    <button className="w-full p-3 sm:p-4 rounded-xl bg-conectia-primary/8 hover:bg-conectia-primary/15 border border-conectia-primary/20 transition-all duration-200 group flex items-center justify-center gap-3">
                      <div className="w-9 h-9 bg-conectia-primary/20 rounded-lg flex items-center justify-center group-hover:bg-conectia-primary/30 transition-colors">
                        <Users className="h-5 w-5 text-conectia-primary" />
                      </div>
                      <span className="text-sm font-black text-conectia-accent uppercase tracking-wide">Brokers y Notarías</span>
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
