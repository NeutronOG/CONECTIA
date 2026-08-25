'use client'

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, MapPin, Bed, Bath, Square, Eye, Video } from "lucide-react"
import Link from "next/link"
import { usePropertiesStatic } from "@/hooks/use-properties-static"

export function FeaturedPropertiesCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)
  
  const { properties } = usePropertiesStatic()
  const featuredProperties = properties.slice(0, 5)

  useEffect(() => {
    if (!isAutoPlaying || featuredProperties.length === 0) return
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % featuredProperties.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [isAutoPlaying, featuredProperties.length])

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % featuredProperties.length)
    setIsAutoPlaying(false)
  }

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + featuredProperties.length) % featuredProperties.length)
    setIsAutoPlaying(false)
  }

  const goToSlide = (index: number) => {
    setCurrentIndex(index)
    setIsAutoPlaying(false)
  }

  if (featuredProperties.length === 0) {
    return (
      <div className="relative w-full h-[560px] rounded-[32px] overflow-hidden bg-[#EAE4DD] dark:bg-[#0A1B21] animate-pulse flex items-center justify-center">
        <p className="text-[#4A4F57] dark:text-[#B0ACA6]">Cargando propiedades...</p>
      </div>
    )
  }

  const currentProperty = featuredProperties[currentIndex]

  return (
    <div className="featured-carousel relative w-full overflow-hidden rounded-[32px] border border-[#17313A]/10 bg-white shadow-[0_28px_80px_rgba(23,49,58,0.16)] dark:border-white/10 dark:bg-[#0A1B21] dark:shadow-[0_32px_90px_rgba(0,5,8,0.42)]">
      {/* La imagen tiene su propio bloque: ningún dato se dibuja encima. */}
      <div className="group relative h-[280px] w-full overflow-hidden sm:h-[400px] lg:h-[540px]">
        <div
          key={currentProperty.id}
          role="img"
          aria-label={currentProperty.titulo}
          className="absolute inset-0 bg-cover bg-center animate-in fade-in duration-500 transition-transform ease-out group-hover:scale-[1.025] motion-reduce:transition-none"
          style={{ backgroundImage: `url(${currentProperty.imagen})` }}
        />

        <button
          onClick={prevSlide}
          aria-label="Propiedad anterior"
          className="absolute left-3 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/35 bg-[#071419]/45 text-white shadow-lg backdrop-blur-md transition-all duration-300 hover:scale-105 hover:bg-[#071419]/70 sm:left-5 sm:h-12 sm:w-12"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <button
          onClick={nextSlide}
          aria-label="Propiedad siguiente"
          className="absolute right-3 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/35 bg-[#071419]/45 text-white shadow-lg backdrop-blur-md transition-all duration-300 hover:scale-105 hover:bg-[#071419]/70 sm:right-5 sm:h-12 sm:w-12"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      {/* La navegación vive entre la fotografía y la ficha. */}
      <div className="flex items-center justify-between border-b border-[#17313A]/10 px-5 py-3 dark:border-white/10 sm:px-8">
        <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#4A4F57] dark:text-[#B0ACA6]">
          {String(currentIndex + 1).padStart(2, '0')} / {String(featuredProperties.length).padStart(2, '0')}
        </span>
        <div className="flex items-center gap-2">
          {featuredProperties.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              aria-label={`Ver propiedad ${index + 1}`}
              aria-current={index === currentIndex ? 'true' : undefined}
              className={`rounded-full transition-all duration-300 ${index === currentIndex
                ? 'h-2 w-8 bg-[#17313A] dark:bg-[var(--conectia-arcilla)]'
                : 'h-2 w-2 bg-[#17313A]/20 hover:bg-[#17313A]/40 dark:bg-white/20 dark:hover:bg-white/40'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Ficha separada: conserva la lectura móvil y escala a escritorio. */}
      <div className="relative px-5 py-6 sm:px-8 sm:py-8 lg:px-10 lg:py-9">
        <div className="pointer-events-none absolute -right-16 -top-20 h-48 w-48 rounded-full bg-[#17313A]/5 blur-[70px] dark:bg-[var(--conectia-arcilla)]/8" />

        <div className="relative grid gap-7 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center lg:gap-10">
          <div className="min-w-0 space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-[#17313A] px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-[#EAE4DD] dark:bg-[var(--conectia-arcilla)] dark:text-[#0F2027]">
                {currentProperty.status}
              </span>
              <span className="rounded-full border border-[#17313A]/15 bg-[#17313A]/5 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-[#17313A] dark:border-white/10 dark:bg-white/5 dark:text-[#B0ACA6]">
                {currentProperty.tipo}
              </span>
            </div>

            <h2 className="max-w-3xl font-serif text-2xl font-bold leading-tight text-[#17313A] dark:text-white sm:text-3xl lg:text-4xl">
              {currentProperty.titulo}
            </h2>

            <div className="flex items-center gap-2 text-[#17313A]/70 dark:text-[#B0ACA6]">
              <MapPin className="h-4 w-4 shrink-0 text-[var(--conectia-arcilla)]" />
              <span className="truncate text-sm">{currentProperty.ubicacion}</span>
            </div>

            <div className="flex flex-wrap items-center gap-2.5 text-[#17313A]/70 dark:text-[#B0ACA6]">
              <div className="flex items-center gap-1.5 rounded-xl border border-[#17313A]/10 bg-[#17313A]/5 px-3 py-2 dark:border-white/10 dark:bg-white/5">
                <Bed className="h-3.5 w-3.5 text-[#17313A] dark:text-[var(--conectia-arcilla)]" />
                <span className="text-xs font-medium sm:text-sm">{currentProperty.habitaciones} Hab</span>
              </div>
              <div className="flex items-center gap-1.5 rounded-xl border border-[#17313A]/10 bg-[#17313A]/5 px-3 py-2 dark:border-white/10 dark:bg-white/5">
                <Bath className="h-3.5 w-3.5 text-[#17313A] dark:text-[var(--conectia-arcilla)]" />
                <span className="text-xs font-medium sm:text-sm">{currentProperty.banos} Baños</span>
              </div>
              <div className="flex items-center gap-1.5 rounded-xl border border-[#17313A]/10 bg-[#17313A]/5 px-3 py-2 dark:border-white/10 dark:bg-white/5">
                <Square className="h-3.5 w-3.5 text-[#17313A] dark:text-[var(--conectia-arcilla)]" />
                <span className="text-xs font-medium sm:text-sm">{currentProperty.areaTexto}</span>
              </div>
            </div>
          </div>

          <div className="flex items-end justify-between gap-4 border-t border-[#17313A]/10 pt-5 dark:border-white/10 lg:min-w-[280px] lg:flex-col lg:items-stretch lg:border-l lg:border-t-0 lg:pl-10 lg:pt-0">
            <div>
              <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#4A4F57] dark:text-[#B0ACA6]">Precio</p>
              <p className="text-2xl font-black text-[#17313A] dark:bg-gradient-to-r dark:from-[var(--conectia-arcilla)] dark:to-[var(--conectia-arcilla-soft)] dark:bg-clip-text dark:text-transparent sm:text-3xl lg:text-4xl">
                {currentProperty.precioTexto}
              </p>
            </div>

            <div className="flex shrink-0 items-center gap-2 lg:mt-5">
              <Link href={`/propiedades/${currentProperty.id}`} className="flex-1">
                <Button className="h-11 w-full rounded-xl bg-[#17313A] px-5 font-bold text-[#EAE4DD] shadow-lg shadow-[#17313A]/15 transition-all duration-300 hover:bg-[#1F3D47] dark:bg-[var(--conectia-arcilla)] dark:text-[#0F2027] dark:shadow-[var(--conectia-arcilla)]/15 dark:hover:bg-[var(--conectia-arcilla-hover)]">
                  <Eye className="mr-1.5 h-4 w-4" />
                  Ver
                </Button>
              </Link>
              {currentProperty.tourVirtual && (
                <Button
                  variant="outline"
                  aria-label="Abrir tour virtual"
                  className="h-11 rounded-xl border-[#17313A]/15 bg-[#17313A]/5 px-3 text-[#17313A] transition-colors hover:bg-[#17313A]/10 dark:border-white/15 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
                  onClick={() => window.open(currentProperty.tourVirtual, '_blank')}
                >
                  <Video className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
