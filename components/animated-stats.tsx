'use client'

import { useState, useEffect } from 'react'
import { Building2, Key, Shield, Sparkles, ChevronLeft, ChevronRight } from "lucide-react"

export function AnimatedStats() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)

  const features = [
    { 
      icon: Building2, 
      title: 'Transparencia Total', 
      description: 'Información clara y completa de cada propiedad para tu tranquilidad y confianza',
      gradient: 'from-blue-500 to-purple-500'
    },
    { 
      icon: Key, 
      title: 'Acceso Inmediato', 
      description: 'Visitas programadas en 24 horas y proceso de compra ágil y transparente',
      gradient: 'from-conectia-primary to-yellow-500'
    },
    { 
      icon: Shield, 
      title: 'Confianza Total', 
      description: 'Asesoría legal completa y garantía en cada transacción inmobiliaria',
      gradient: 'from-green-500 to-emerald-500'
    },
    { 
      icon: Sparkles, 
      title: 'Experiencia Única', 
      description: 'Atención personalizada y servicio de lujo en cada etapa del proceso',
      gradient: 'from-orange-500 to-red-500'
    },
  ]

  useEffect(() => {
    if (!isAutoPlaying) return

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % features.length)
    }, 4000)

    return () => clearInterval(interval)
  }, [isAutoPlaying, features.length])

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % features.length)
    setIsAutoPlaying(false)
  }

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + features.length) % features.length)
    setIsAutoPlaying(false)
  }

  const goToSlide = (index: number) => {
    setCurrentIndex(index)
    setIsAutoPlaying(false)
  }

  const currentFeature = features[currentIndex]
  const Icon = currentFeature.icon

  return (
    <section className="pt-0 pb-8 px-4 sm:px-6 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-conectia-accent/3 to-transparent" />

      <div className="max-w-4xl mx-auto relative z-10">
        <div className="relative group">
          {/* Card */}
          <div className="relative h-[320px] sm:h-[280px] p-8 sm:p-10 rounded-3xl bg-conectia-secondary/30 backdrop-blur-sm border-2 border-conectia-accent/10 shadow-2xl overflow-hidden transition-all duration-500">
            {/* Gradient Background */}
            <div className={`absolute inset-0 bg-gradient-to-br ${currentFeature.gradient} opacity-5 transition-opacity duration-700`} />
            
            {/* Decorative Circle */}
            <div className="absolute -right-8 -top-8 w-32 h-32 bg-conectia-primary/5 rounded-full blur-2xl" />

            {/* Content */}
            <div className="relative z-10 h-full flex flex-col items-center justify-center text-center space-y-6">
              {/* Icon Container */}
              <div className="relative">
                <div className="w-20 h-20 bg-gradient-to-br from-conectia-primary to-conectia-primary/70 rounded-2xl flex items-center justify-center shadow-lg shadow-conectia-primary/30 transition-transform duration-500">
                  <Icon className="h-10 w-10 text-conectia-accent" strokeWidth={2.5} />
                </div>
                <div className="absolute inset-0 w-20 h-20 bg-conectia-primary rounded-2xl blur-xl opacity-30" />
              </div>

              {/* Text Content */}
              <div className="space-y-3 max-w-2xl">
                <h3 className="text-3xl sm:text-4xl font-bold text-conectia-primary transition-all duration-500">
                  {currentFeature.title}
                </h3>
                <p className="text-conectia-accent/70 text-base sm:text-lg leading-relaxed transition-all duration-500">
                  {currentFeature.description}
                </p>
              </div>
            </div>
          </div>

          {/* Navigation Arrows */}
          <button
            onClick={prevSlide}
            className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 bg-conectia-secondary/80 hover:bg-conectia-secondary backdrop-blur-sm rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 opacity-0 group-hover:opacity-100 border border-conectia-accent/20"
          >
            <ChevronLeft className="h-5 w-5 sm:h-6 sm:w-6 text-conectia-accent" />
          </button>

          <button
            onClick={nextSlide}
            className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 bg-conectia-secondary/80 hover:bg-conectia-secondary backdrop-blur-sm rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 opacity-0 group-hover:opacity-100 border border-conectia-accent/20"
          >
            <ChevronRight className="h-5 w-5 sm:h-6 sm:w-6 text-conectia-accent" />
          </button>
        </div>

        {/* Dots Navigation */}
        <div className="flex items-center justify-center gap-2 mt-6">
          {features.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`transition-all duration-300 rounded-full ${
                index === currentIndex
                  ? 'w-10 h-3 bg-conectia-primary'
                  : 'w-3 h-3 bg-conectia-accent/30 hover:bg-conectia-accent/50'
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
