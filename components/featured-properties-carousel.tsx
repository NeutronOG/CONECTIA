'use client'

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ChevronLeft, ChevronRight, MapPin, Bed, Bath, Square, Eye, ExternalLink, Video } from "lucide-react"
import Link from "next/link"
import { usePropertiesStatic } from "@/hooks/use-properties-static"

export function FeaturedPropertiesCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)
  
  // Hook optimizado - carga instantánea desde JSON + realtime
  const { properties } = usePropertiesStatic()
  const featuredProperties = properties.slice(0, 5)

  // Auto-play carousel
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

  // Show loading state if no properties yet
  if (featuredProperties.length === 0) {
    return (
      <div className="relative w-full h-[600px] rounded-3xl overflow-hidden bg-gray-200 animate-pulse flex items-center justify-center">
        <p className="text-gray-500">Cargando propiedades...</p>
      </div>
    )
  }

  const currentProperty = featuredProperties[currentIndex]

  return (
    <div className="relative w-full h-[600px] rounded-3xl overflow-hidden group">
      {/* Background Image with Parallax Effect */}
      <div
        className="absolute inset-0 bg-cover bg-center transition-all duration-1000 ease-out transform scale-105 group-hover:scale-110"
        style={{
          backgroundImage: `url(${currentProperty.imagen})`,
        }}
      />

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-conectia-accent via-conectia-accent/60 to-transparent" />

      {/* Content */}
      <div className="relative h-full flex flex-col justify-end p-8 sm:p-12">
        {/* Property Info */}
        <div className="space-y-4 transform transition-all duration-500">
          {/* Badges */}
          <div className="flex items-center gap-3">
            <Badge className="bg-conectia-primary/90 text-conectia-accent backdrop-blur-sm px-4 py-1.5 text-sm font-semibold">
              {currentProperty.status}
            </Badge>
            <Badge className="bg-conectia-secondary/20 text-conectia-secondary backdrop-blur-sm px-4 py-1.5 text-sm">
              {currentProperty.tipo}
            </Badge>
          </div>

          {/* Title */}
          <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-conectia-secondary leading-tight uppercase">
            {currentProperty.titulo}
          </h2>

          {/* Location */}
          <div className="flex items-center gap-2 text-conectia-secondary/90">
            <MapPin className="h-5 w-5" />
            <span className="text-lg">{currentProperty.ubicacion}</span>
          </div>

          {/* Details */}
          <div className="flex items-center gap-6 text-conectia-secondary/80">
            <div className="flex items-center gap-2">
              <Bed className="h-5 w-5" />
              <span className="font-medium">{currentProperty.habitaciones} Hab</span>
            </div>
            <div className="flex items-center gap-2">
              <Bath className="h-5 w-5" />
              <span className="font-medium">{currentProperty.banos} Baños</span>
            </div>
            <div className="flex items-center gap-2">
              <Square className="h-5 w-5" />
              <span className="font-medium">{currentProperty.areaTexto}</span>
            </div>
          </div>

          {/* Price & Actions */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-4">
            <div className="text-conectia-primary text-4xl sm:text-5xl font-black">
              {currentProperty.precioTexto}
            </div>

            <div className="flex items-center gap-3">
              <Link href={`/propiedades/${currentProperty.id}`}>
                <Button className="bg-conectia-primary hover:bg-conectia-primary/90 text-conectia-accent font-bold px-6 py-3 rounded-xl shadow-2xl hover:scale-105 transition-all duration-300">
                  <Eye className="h-4 w-4 mr-2" />
                  Ver Propiedad
                </Button>
              </Link>

              {currentProperty.tourVirtual && (
                <Button
                  variant="outline"
                  className="border-2 border-conectia-secondary text-conectia-secondary font-bold px-6 py-6 rounded-xl hover:bg-conectia-secondary/10 transition-all duration-300"
                  onClick={() => window.open(currentProperty.tourVirtual, '_blank')}
                >
                  <Video className="h-5 w-5 mr-2" />
                  Tour Virtual
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={prevSlide}
        className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-conectia-secondary/20 hover:bg-conectia-secondary/40 backdrop-blur-sm rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 opacity-0 group-hover:opacity-100"
      >
        <ChevronLeft className="h-6 w-6 text-conectia-secondary" />
      </button>

      <button
        onClick={nextSlide}
        className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-conectia-secondary/20 hover:bg-conectia-secondary/40 backdrop-blur-sm rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 opacity-0 group-hover:opacity-100"
      >
        <ChevronRight className="h-6 w-6 text-conectia-secondary" />
      </button>

      {/* Dots Navigation */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2">
        {featuredProperties.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`transition-all duration-300 rounded-full ${index === currentIndex
              ? 'w-12 h-3 bg-conectia-primary'
              : 'w-3 h-3 bg-conectia-secondary/40 hover:bg-conectia-secondary/60'
              }`}
          />
        ))}
      </div>

      {/* Property Counter */}
      <div className="absolute top-4 right-4 bg-conectia-accent/80 backdrop-blur-sm text-conectia-secondary px-4 py-2 rounded-full font-bold">
        {currentIndex + 1} / {featuredProperties.length}
      </div>
    </div>
  )
}
