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
      <div className="relative w-full h-[500px] md:h-[600px] rounded-3xl overflow-hidden bg-[#EAE4DD] dark:bg-[#0F2027] animate-pulse flex items-center justify-center">
        <p className="text-[#4A4F57] dark:text-[#B0ACA6]">Cargando propiedades...</p>
      </div>
    )
  }

  const currentProperty = featuredProperties[currentIndex]

  return (
    <div className="relative w-full flex flex-col md:block md:h-[600px] rounded-[32px] overflow-hidden group shadow-2xl shadow-black/30 bg-[#F6F2EE] dark:bg-[#0F2027]">
      {/* Background Image / Top Image on Mobile */}
      <div
        className="relative h-[260px] w-full md:absolute md:inset-0 md:h-full bg-cover bg-center transition-all duration-1000 ease-out transform scale-100 md:scale-105 md:group-hover:scale-110"
        style={{ backgroundImage: `url(${currentProperty.imagen})` }}
      />
      {/* Dark overlay for entire image (Desktop only) */}
      <div className="hidden md:block absolute inset-0 bg-gradient-to-t from-[#F6F2EE]/90 via-[#F6F2EE]/40 to-transparent md:bg-gradient-to-r md:from-transparent md:via-transparent md:to-[#F6F2EE]/90 dark:from-[#0F2027] dark:via-[#0F2027]/40 dark:to-transparent dark:md:to-[#0F2027]/90" />
      <div className="hidden md:block absolute inset-0 bg-gradient-to-r from-[#F6F2EE]/80 via-transparent to-transparent dark:from-[#0F2027]/80" />

      {/* Content — Split layout */}
      <div className="relative flex-1 md:h-full flex flex-col md:flex-row">
        {/* Left: Image area (empty on desktop, content visible through overlay) */}
        <div className="hidden md:block md:w-[55%]" />

        {/* Right: Info Panel */}
        <div className="flex-1 md:w-[45%] flex flex-col justify-end md:justify-center p-4 sm:p-6 md:p-10 bg-[#F6F2EE] dark:bg-[#0F2027] md:bg-transparent md:dark:bg-transparent rounded-b-[32px] md:rounded-none">
          {/* Glass Card */}
          <div className="relative bg-white/80 dark:bg-[#0F2027]/80 backdrop-blur-xl border border-[#17313A]/10 dark:border-white/10 rounded-[28px] p-5 sm:p-8 shadow-xl md:shadow-2xl">
            {/* Glow accent */}
            <div className="absolute -top-20 -right-20 w-40 h-40 bg-[#17313A]/10 dark:bg-[#C78F7B]/10 rounded-full blur-[60px] pointer-events-none" />

            <div className="relative space-y-4 md:space-y-5">
              {/* Top row: Badges + Counter */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-[#17313A]/20 border border-[#17313A]/30 text-[#17313A] dark:bg-[#C78F7B]/20 dark:border-[#C78F7B]/30 dark:text-[#C78F7B] text-[9px] md:text-[10px] font-bold uppercase tracking-wider">
                    {currentProperty.status}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-[#17313A]/10 border border-[#17313A]/20 text-[#17313A]/70 dark:bg-[#C78F7B]/10 dark:border-[#C78F7B]/20 dark:text-[#C78F7B]/70 dark:text-[#B0ACA6] text-[9px] md:text-[10px] font-semibold uppercase tracking-wider">
                    {currentProperty.tipo}
                  </span>
                </div>
                <span className="text-[10px] md:text-[11px] text-[#4A4F57] font-bold">
                  {currentIndex + 1}<span className="text-[#B0ACA6]">/{featuredProperties.length}</span>
                </span>
              </div>

              {/* Title */}
              <h2 className="font-serif text-lg sm:text-2xl lg:text-3xl font-bold text-[#17313A] dark:text-white leading-tight">
                {currentProperty.titulo}
              </h2>

              {/* Location */}
              <div className="flex items-center gap-2 text-[#17313A]/70 dark:text-[#B0ACA6]">
                <MapPin className="h-3.5 w-3.5 text-[#17313A] dark:text-[#C78F7B] shrink-0" />
                <span className="text-xs md:text-sm truncate">{currentProperty.ubicacion}</span>
              </div>

              {/* Details */}
              <div className="flex items-center gap-4 md:gap-5 text-[#17313A]/70 dark:text-[#B0ACA6]">
                <div className="flex items-center gap-1">
                  <Bed className="h-3.5 w-3.5 text-[#17313A] dark:text-[#C78F7B]" />
                  <span className="text-xs md:text-sm font-medium">{currentProperty.habitaciones} Hab</span>
                </div>
                <div className="flex items-center gap-1">
                  <Bath className="h-3.5 w-3.5 text-[#17313A] dark:text-[#C78F7B]" />
                  <span className="text-xs md:text-sm font-medium">{currentProperty.banos} Baños</span>
                </div>
                <div className="flex items-center gap-1">
                  <Square className="h-3.5 w-3.5 text-[#17313A] dark:text-[#C78F7B]" />
                  <span className="text-xs md:text-sm font-medium">{currentProperty.areaTexto}</span>
                </div>
              </div>

              {/* Divider */}
              <div className="h-px bg-gradient-to-r from-[#17313A]/30 via-[#17313A]/10 dark:from-[#C78F7B]/30 dark:via-[#C78F7B]/10 dark:via-white/10 to-transparent" />

              {/* Price & CTA */}
              <div className="flex flex-row items-center justify-between gap-2">
                <div>
                  <p className="text-[9px] text-[#4A4F57] dark:text-[#4A4F57] uppercase tracking-widest font-semibold mb-0.5">Precio</p>
                  <p className="text-xl sm:text-4xl font-black text-[#17313A] dark:bg-gradient-to-r dark:from-[#C78F7B] dark:to-[#E8A88F] dark:bg-clip-text dark:text-transparent">
                    {currentProperty.precioTexto}
                  </p>
                </div>
                <div className="flex items-center gap-1.5">
                  <Link href={`/propiedades/${currentProperty.id}`}>
                    <Button className="bg-[#17313A] hover:bg-[#1F3D47] dark:bg-[#C78F7B] dark:hover:bg-[#D4987E] text-[#EAE4DD] dark:text-[#0F2027] font-bold px-3 py-2 md:px-5 md:py-3 rounded-xl shadow-lg text-xs md:text-sm shadow-[#17313A]/20 dark:shadow-[#C78F7B]/20 hover:scale-105 transition-all duration-300">
                      <Eye className="h-3.5 w-3.5 mr-1" />
                      Ver
                    </Button>
                  </Link>
                  {currentProperty.tourVirtual && (
                    <Button
                      variant="outline"
                      className="border-[#17313A]/15 dark:border-white/20 text-[#17313A] dark:text-white bg-[#17313A]/5 dark:bg-white/5 hover:bg-[#17313A]/10 dark:hover:bg-white/10 hover:border-[#17313A]/30 dark:hover:border-[#C78F7B]/30 font-semibold px-2.5 py-2 md:px-4 md:py-3 rounded-xl transition-all duration-300"
                      onClick={() => window.open(currentProperty.tourVirtual, '_blank')}
                    >
                      <Video className="h-3.5 w-3.5" />
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={prevSlide}
        className="absolute left-3 top-[130px] md:top-1/2 -translate-y-1/2 w-9 h-9 md:w-11 md:h-11 bg-[#17313A]/10 dark:bg-white/5 border border-[#17313A]/20 dark:border-white/10 hover:bg-[#17313A]/20 dark:hover:bg-[#C78F7B]/20 hover:border-[#17313A]/30 dark:hover:border-[#C78F7B]/30 backdrop-blur-md rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 z-10"
      >
        <ChevronLeft className="h-4 w-4 md:h-5 md:w-5 text-[#17313A] dark:text-white" />
      </button>
      <button
        onClick={nextSlide}
        className="absolute right-3 top-[130px] md:top-1/2 -translate-y-1/2 w-9 h-9 md:w-11 md:h-11 bg-[#17313A]/10 dark:bg-white/5 border border-[#17313A]/20 dark:border-white/10 hover:bg-[#17313A]/20 dark:hover:bg-[#C78F7B]/20 hover:border-[#17313A]/30 dark:hover:border-[#C78F7B]/30 backdrop-blur-md rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 z-10"
      >
        <ChevronRight className="h-4 w-4 md:h-5 md:w-5 text-[#17313A] dark:text-white" />
      </button>

      {/* Dots Navigation */}
      <div className="absolute top-[225px] md:bottom-5 md:top-auto left-1/2 -translate-x-1/2 flex items-center gap-2 z-10">
        {featuredProperties.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`transition-all duration-300 rounded-full ${index === currentIndex
              ? 'w-8 h-2 md:w-10 md:h-2.5 bg-gradient-to-r from-[#17313A] to-[#1F3D47] dark:from-[#C78F7B] dark:to-[#E8A88F]'
              : 'w-2 h-2 md:w-2.5 md:h-2.5 bg-[#17313A]/20 dark:bg-white/20 hover:bg-[#17313A]/40 dark:hover:bg-white/40'
            }`}
          />
        ))}
      </div>
    </div>
  )
}
