'use client'

import { useEffect, useState } from 'react'
import { ArrowRight, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface Ad {
  id: string
  titulo: string
  descripcion: string
  imagen: string
  enlace: string
  texto_boton: string
  ubicacion: string
  estilo: string
  activo: boolean
  estado: string
}

function AdBanner({ ad }: { ad: Ad }) {
  useEffect(() => {
    fetch('/api/anuncios', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: ad.id, tipo: 'impresion' }) }).catch(() => {})
  }, [ad.id])

  const handleClick = () => {
    fetch('/api/anuncios', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: ad.id, tipo: 'click' }) }).catch(() => {})
    if (ad.enlace) {
      window.open(ad.enlace, '_blank', 'noopener,noreferrer')
    }
  }

  if (ad.estilo === 'sutil') {
    return (
      <div
        onClick={handleClick}
        className="group cursor-pointer rounded-2xl border border-conectia-accent/10 bg-conectia-secondary/80 p-6 sm:p-8 hover:border-conectia-primary/30 transition-all duration-300 hover:shadow-lg"
      >
        <div className="flex flex-col md:flex-row items-center gap-6">
          {ad.imagen && (
            <div className="w-full md:w-48 h-32 rounded-xl overflow-hidden flex-shrink-0">
              <img
                src={ad.imagen}
                alt={ad.titulo}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
            </div>
          )}
          <div className="flex-1 text-center md:text-left">
            <div className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-conectia-accent/40 mb-2">
              <Sparkles className="h-3 w-3" />
              Patrocinado
            </div>
            <h3 className="font-serif text-lg sm:text-xl font-bold text-conectia-accent mb-2">
              {ad.titulo}
            </h3>
            <p className="text-sm text-conectia-accent/60 mb-4 line-clamp-2">
              {ad.descripcion}
            </p>
            {ad.texto_boton && (
              <Button
                size="sm"
                className="bg-conectia-primary hover:bg-conectia-primary/90 text-conectia-accent font-semibold rounded-xl text-xs px-5"
              >
                {ad.texto_boton}
                <ArrowRight className="h-3 w-3 ml-1.5" />
              </Button>
            )}
          </div>
        </div>
      </div>
    )
  }

  if (ad.estilo === 'destacado') {
    return (
      <div
        onClick={handleClick}
        className="group cursor-pointer relative rounded-3xl overflow-hidden border-2 border-conectia-primary/20 hover:border-conectia-primary/50 transition-all duration-300 hover:shadow-2xl hover:shadow-conectia-primary/10"
      >
        {ad.imagen && (
          <div className="absolute inset-0">
            <img
              src={ad.imagen}
              alt={ad.titulo}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#0F2027]/80 via-[#17313A]/50 to-transparent" />
          </div>
        )}
        <div className="relative z-10 p-8 sm:p-12 flex flex-col justify-center min-h-[200px]">
          <div className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-conectia-primary mb-3">
            <Sparkles className="h-3 w-3" />
            Patrocinado
          </div>
          <h3 className="font-serif text-2xl sm:text-3xl font-bold text-white mb-3 max-w-lg">
            {ad.titulo}
          </h3>
          <p className="text-sm sm:text-base text-gray-300 mb-5 max-w-md line-clamp-2">
            {ad.descripcion}
          </p>
          {ad.texto_boton && (
            <div>
              <Button className="bg-conectia-primary hover:bg-conectia-primary/90 text-conectia-accent font-bold rounded-2xl px-8 py-3 shadow-lg hover:scale-105 transition-all duration-300">
                {ad.texto_boton}
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          )}
        </div>
      </div>
    )
  }

  // estilo === 'elegante' (default)
  return (
    <div
      onClick={handleClick}
      className="group cursor-pointer rounded-3xl bg-gradient-to-br from-conectia-accent/5 to-conectia-primary/5 border border-conectia-primary/20 p-6 sm:p-10 hover:border-conectia-primary/40 transition-all duration-300 hover:shadow-xl hover:shadow-conectia-primary/5"
    >
      <div className="flex flex-col md:flex-row items-center gap-8">
        {ad.imagen && (
          <div className="w-full md:w-56 h-40 rounded-2xl overflow-hidden flex-shrink-0 shadow-lg">
            <img
              src={ad.imagen}
              alt={ad.titulo}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          </div>
        )}
        <div className="flex-1 text-center md:text-left">
          <div className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-conectia-primary/60 mb-3">
            <Sparkles className="h-3 w-3" />
            Patrocinado
          </div>
          <h3 className="font-serif text-xl sm:text-2xl font-bold text-conectia-accent mb-3">
            {ad.titulo}
          </h3>
          <p className="text-sm text-conectia-accent/60 mb-5 line-clamp-2">
            {ad.descripcion}
          </p>
          {ad.texto_boton && (
            <Button className="bg-conectia-primary hover:bg-conectia-primary/90 text-conectia-accent font-semibold rounded-xl px-6 py-2.5 shadow-md hover:scale-105 transition-all duration-300">
              {ad.texto_boton}
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

export function HomepageAdSlot({ ubicacion }: { ubicacion: string }) {
  const [ads, setAds] = useState<Ad[]>([])

  useEffect(() => {
    fetch(`/api/anuncios?ubicacion=${ubicacion}`)
      .then(r => r.json())
      .then(data => setAds(data.anuncios || []))
      .catch(() => {})
  }, [ubicacion])

  if (ads.length === 0) return null

  return (
    <section className="py-6 sm:py-10 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {ads.map((ad) => (
          <AdBanner key={ad.id} ad={ad} />
        ))}
      </div>
    </section>
  )
}
