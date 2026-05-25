'use client'

import { useState, useEffect } from 'react'
import { Shield, Star, Users } from "lucide-react"

export function WhyConectiaCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)
  const [progress, setProgress] = useState(0)

  const features = [
    {
      icon: Shield,
      title: "Confianza Total",
      desc: "Proceso transparente y directo. Sin letra pequeña.",
      num: "01",
    },
    {
      icon: Star,
      title: "Exclusividad",
      desc: "Acceso a propiedades únicas y premium.",
      num: "02",
    },
    {
      icon: Users,
      title: "Red Selecta",
      desc: "Conexión directa.",
      num: "03",
    },
  ]

  useEffect(() => {
    if (!isAutoPlaying) return
    setProgress(0)
    const duration = 4000
    const steps = 80
    const stepInterval = duration / steps
    const progressInterval = setInterval(() => {
      setProgress((prev) => Math.min(prev + 100 / steps, 100))
    }, stepInterval)
    const slideInterval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % features.length)
      setProgress(0)
    }, duration)
    return () => {
      clearInterval(slideInterval)
      clearInterval(progressInterval)
    }
  }, [isAutoPlaying, currentIndex, features.length])

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
    <section className="relative py-16 sm:py-24 px-4 sm:px-6 bg-conectia-surface">
      <div className="max-w-5xl mx-auto">

        {/* Header editorial */}
        <div className="flex flex-col sm:flex-row sm:items-end gap-4 sm:gap-8 mb-12 sm:mb-16">
          <div>
            <p className="text-[10px] uppercase tracking-[0.35em] text-conectia-primary font-bold mb-2">
              Nuestra propuesta
            </p>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-conectia-accent leading-tight">
              ¿Por qué<br />
              <span className="text-conectia-primary">CONECTIA</span>?
            </h2>
          </div>
          <div className="flex-1 h-px bg-gradient-to-r from-conectia-primary/30 to-transparent mb-1 hidden sm:block" />
        </div>

        {/* Card split — panel izquierdo oscuro + panel derecho crema */}
        <div className="grid md:grid-cols-[2fr_3fr] rounded-2xl overflow-hidden border border-conectia-primary/12 shadow-2xl shadow-conectia-accent/8">

          {/* Panel izquierdo */}
          <div className="bg-conectia-accent relative flex flex-col items-center justify-center p-10 sm:p-14 overflow-hidden min-h-[200px] md:min-h-[320px]">
            {/* Número decorativo de fondo */}
            <span className="absolute text-[7rem] sm:text-[9rem] font-black text-conectia-primary/15 leading-none select-none top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
              {currentFeature.num}
            </span>
            {/* Geometría decorativa */}
            <div className="absolute top-5 right-5 w-12 h-12 border-2 border-conectia-primary/20 rounded-xl rotate-12" />
            <div className="absolute bottom-5 left-5 w-8 h-8 bg-conectia-primary/10 rounded-lg -rotate-6" />
            {/* Icono principal */}
            <div className="relative z-10 w-16 h-16 sm:w-20 sm:h-20 bg-conectia-primary rounded-2xl flex items-center justify-center shadow-xl transition-all duration-500">
              <Icon className="h-8 w-8 sm:h-10 sm:w-10 text-white" />
            </div>
          </div>

          {/* Panel derecho */}
          <div className="bg-conectia-surface-container flex flex-col justify-between p-8 sm:p-12">
            <div className="space-y-4">
              <h3 className="text-2xl sm:text-3xl md:text-4xl font-black text-conectia-accent transition-all duration-500">
                {currentFeature.title}
              </h3>
              <p className="text-sm sm:text-base text-conectia-accent/60 leading-relaxed max-w-lg transition-all duration-500">
                {currentFeature.desc}
              </p>
            </div>

            {/* Controles */}
            <div className="mt-10 sm:mt-14">
              <div className="flex items-center justify-between mb-4">
                {/* Números de slide */}
                <div className="flex items-center gap-4">
                  {features.map((f, index) => (
                    <button
                      key={index}
                      onClick={() => goToSlide(index)}
                      className={`text-xs font-black tracking-widest transition-all duration-300 ${
                        index === currentIndex
                          ? 'text-conectia-primary scale-110'
                          : 'text-conectia-accent/25 hover:text-conectia-accent/55'
                      }`}
                    >
                      {f.num}
                    </button>
                  ))}
                </div>
                {/* Flechas cuadradas */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={prevSlide}
                    aria-label="Anterior"
                    className="w-9 h-9 border-2 border-conectia-accent/15 hover:border-conectia-primary rounded-lg flex items-center justify-center transition-all duration-200 text-conectia-accent/40 hover:text-conectia-primary hover:bg-conectia-primary/8"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <button
                    onClick={nextSlide}
                    aria-label="Siguiente"
                    className="w-9 h-9 bg-conectia-primary hover:bg-conectia-primary/90 rounded-lg flex items-center justify-center transition-all duration-200 text-white shadow-md hover:shadow-lg hover:scale-105"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </div>
              {/* Barra de progreso */}
              <div className="h-[2px] bg-conectia-accent/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-conectia-primary rounded-full transition-all duration-100 ease-linear"
                  style={{ width: isAutoPlaying ? `${progress}%` : '100%' }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
