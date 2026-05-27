'use client'

import { Button } from "@/components/ui/button"
import { Video, Clock } from "lucide-react"
import Link from "next/link"

export function VirtualToursSection() {
  return (
    <section className="py-20 px-4 sm:px-6 relative overflow-hidden bg-[#17313A]">
      {/* Background Decoration */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#C78F7B]/8 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#EAE4DD]/6 rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <div className="text-center mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-6 py-3 bg-conectia-primary/10 border border-conectia-primary/20 rounded-full">
            <Video className="h-5 w-5 text-conectia-primary" />
            <span className="text-sm font-bold text-[#17313A] uppercase tracking-wider">
              Experiencia Inmersiva
            </span>
          </div>
          
          <h2 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold text-[#17313A]">
            Tours Virtuales <span className="text-conectia-primary">360°</span>
          </h2>
          
          <p className="text-xl text-[#4A4F57] max-w-2xl mx-auto">
            Explora nuestras propiedades desde la comodidad de tu hogar con tecnología de realidad virtual
          </p>
        </div>

        {/* Próximamente Card */}
        <div className="max-w-2xl mx-auto">
          <div className="relative overflow-hidden rounded-3xl border-2 border-conectia-primary/30 bg-gradient-to-br from-conectia-secondary via-conectia-secondary to-conectia-primary/5 p-12 text-center">
            {/* Decorative elements */}
            <div className="absolute top-0 left-0 w-32 h-32 bg-conectia-primary/10 rounded-full blur-2xl" />
            <div className="absolute bottom-0 right-0 w-40 h-40 bg-conectia-primary/10 rounded-full blur-2xl" />
            
            <div className="relative z-10 space-y-6">
              {/* Icon */}
              <div className="inline-flex items-center justify-center w-24 h-24 bg-conectia-primary/20 rounded-full mx-auto">
                <Clock className="h-12 w-12 text-conectia-primary" />
              </div>
              
              {/* Title */}
              <div className="space-y-2">
                <h3 className="font-serif text-3xl font-bold text-[#17313A]">
                  Próximamente
                </h3>
                <p className="text-lg text-[#4A4F57] max-w-md mx-auto">
                  Estamos preparando una experiencia inmersiva única para que puedas explorar nuestras propiedades en 360°
                </p>
              </div>
              
              {/* Features coming */}
              <div className="flex flex-wrap justify-center gap-3 pt-4">
                <span className="px-4 py-2 bg-conectia-primary/10 text-[#17313A] rounded-full text-sm font-medium">
                  Recorridos 360°
                </span>
                <span className="px-4 py-2 bg-conectia-primary/10 text-[#17313A] rounded-full text-sm font-medium">
                  Realidad Virtual
                </span>
                <span className="px-4 py-2 bg-conectia-primary/10 text-[#17313A] rounded-full text-sm font-medium">
                  Vista Inmersiva
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center mt-12">
          <Link href="/propiedades">
            <Button className="bg-conectia-primary hover:bg-conectia-primary/90 text-[#EAE4DD] font-bold px-10 py-6 rounded-2xl text-lg shadow-xl hover:scale-105 transition-all duration-300">
              Ver Propiedades Disponibles
              <Video className="h-5 w-5 ml-2" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
}
