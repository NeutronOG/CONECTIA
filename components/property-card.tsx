"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { WishlistButton } from "@/components/wishlist-button"
import { ShareButton } from "@/components/share-button"
import { MapPin, Bed, Bathtub, Square, Calendar, CaretUp, CaretDown } from "@phosphor-icons/react"
import Link from "next/link"
import { useLanguage } from "@/lib/i18n"

interface PropertyCardProps {
  propiedad: {
    id: number | string
    titulo: string
    ubicacion: string
    precioTexto: string
    tipo: string
    imagen?: string
    habitaciones?: number
    banos?: number
    areaTexto?: string
    descripcion?: string
    categoria?: string
    bono?: string
  }
  badgeLabel?: string
  onAgendarVisita?: (id: number | string) => void
}

const FALLBACK_IMAGES = [
  "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1568605114967-8130f3a36994?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1600607687939-ce8a6d349a58?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80",
]

export function PropertyCard({ propiedad, badgeLabel, onAgendarVisita }: PropertyCardProps) {
  const { t } = useLanguage()
  const [expanded, setExpanded] = useState(false)
  const fallback = FALLBACK_IMAGES[Number(propiedad.id) % FALLBACK_IMAGES.length]
  const imgSrc = propiedad.imagen || fallback

  const handleAgendar = () => {
    if (onAgendarVisita) {
      onAgendarVisita(propiedad.id)
      return
    }
    window.location.href = `/contacto?propiedad=${encodeURIComponent(propiedad.titulo)}`
  }

  return (
    <div className="group relative rounded-3xl overflow-hidden h-[420px] transition-all duration-400 shadow-xl hover:shadow-2xl border border-[#17313A]/10 dark:border-white/10">
      {/* Imagen de fondo completa */}
      <img
        src={imgSrc}
        alt={propiedad.titulo}
        className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
      />

      {/* Overlay degradado sutil */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#17313A]/80 via-[#17313A]/20 to-transparent" />

      {/* Badge categoría */}
      {badgeLabel && (
        <div className="absolute top-4 left-4 z-10">
          <Badge className="glass-pill text-[#17313A] text-xs font-semibold px-3 py-1.5 rounded-full border-0 shadow-lg">
            {badgeLabel}
          </Badge>
        </div>
      )}

      {/* Wishlist */}
      <div className="absolute top-4 right-4 z-10">
        <WishlistButton
          property={{
            id: propiedad.id.toString(),
            title: propiedad.titulo,
            price: propiedad.precioTexto,
            location: propiedad.ubicacion,
            image: imgSrc,
            bedrooms: propiedad.habitaciones,
            bathrooms: propiedad.banos,
            area: propiedad.areaTexto,
          }}
          size="sm"
        />
      </div>

      {/* Bono especial */}
      {propiedad.bono && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10">
          <span className="btn-glass-secondary text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full shadow-lg">
            {propiedad.bono}
          </span>
        </div>
      )}

      {/* Bottom sheet expandible */}
      <div
        className={`absolute bottom-0 left-0 right-0 bg-white/95 dark:bg-[#17313A]/95 backdrop-blur-xl rounded-t-3xl p-5 transition-all duration-500 ease-out cursor-pointer ${
          expanded ? 'max-h-[75%]' : 'max-h-[150px]'
        }`}
        onClick={() => setExpanded(!expanded)}
      >
        {/* Indicador de arrastre */}
        <div className="flex justify-center mb-3">
          <div className="w-10 h-1 bg-[var(--conectia-arcilla)]/30 rounded-full" />
        </div>

        {/* Header compacto siempre visible */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <Badge className="bg-[var(--conectia-arcilla)]/15 text-[var(--conectia-arcilla)] text-[10px] font-semibold border border-[var(--conectia-arcilla)]/25 rounded-full px-2 py-0.5">
                {propiedad.tipo}
              </Badge>
              <span className="text-sm font-bold text-[var(--conectia-arcilla)]" style={{fontFamily: "var(--font-titles)"}}>
                {propiedad.precioTexto}
              </span>
            </div>
            <h3 className="text-base font-semibold text-[#17313A] dark:text-white leading-snug line-clamp-1" style={{fontFamily: "var(--font-titles)"}}>
              {propiedad.titulo}
            </h3>
          </div>
          <button
            className="p-1 rounded-full bg-[var(--conectia-arcilla)]/10 text-[var(--conectia-arcilla)] hover:bg-[var(--conectia-arcilla)]/20 transition-colors flex-shrink-0"
            onClick={(e: React.MouseEvent<HTMLButtonElement>) => { e.stopPropagation(); setExpanded(!expanded) }}
          >
            {expanded ? <CaretDown className="h-4 w-4" /> : <CaretUp className="h-4 w-4" />}
          </button>
        </div>

        {/* Ubicación */}
        <div className="flex items-center text-[#4A4F57] dark:text-[#B0ACA6] mt-2">
          <MapPin className="h-3.5 w-3.5 mr-1.5 flex-shrink-0" weight="duotone" />
          <span className="text-xs line-clamp-1">{propiedad.ubicacion}</span>
        </div>

        {/* Contenido expandido */}
        <div className={`overflow-hidden transition-all duration-500 ${expanded ? 'opacity-100 max-h-[300px] mt-4' : 'opacity-0 max-h-0 mt-0'}`}>
          {/* Descripción */}
          {propiedad.descripcion && (
            <p className="text-xs text-[#4A4F57] dark:text-[#B0ACA6] mb-4 line-clamp-3 leading-relaxed">
              {propiedad.descripcion}
            </p>
          )}

          {/* Stats */}
          <div className="flex items-center gap-4 text-xs text-[#4A4F57] dark:text-[#B0ACA6] mb-4 pb-4 border-b border-[#17313A]/10 dark:border-white/10">
            {propiedad.habitaciones != null && (
              <span className="flex items-center gap-1">
                <Bed className="h-3.5 w-3.5" weight="duotone" />
                {propiedad.habitaciones}
              </span>
            )}
            {propiedad.banos != null && (
              <span className="flex items-center gap-1">
                <Bathtub className="h-3.5 w-3.5" weight="duotone" />
                {propiedad.banos}
              </span>
            )}
            {propiedad.areaTexto && (
              <span className="flex items-center gap-1">
                <Square className="h-3.5 w-3.5" weight="duotone" />
                {propiedad.areaTexto}
              </span>
            )}
          </div>

          {/* Acciones */}
          <div className="flex gap-2">
            <Button
              size="sm"
              className="flex-1 btn-glass-primary rounded-xl text-xs font-semibold h-9 border-0"
              onClick={(e: React.MouseEvent<HTMLButtonElement>) => { e.stopPropagation(); handleAgendar() }}
            >
              <Calendar className="h-3.5 w-3.5 mr-1.5" />
              {t('common.scheduleVisit')}
            </Button>
            <div onClick={(e: React.MouseEvent<HTMLDivElement>) => e.stopPropagation()}>
              <ShareButton
                title={propiedad.titulo}
                url={`/propiedades/${propiedad.id}`}
                image={imgSrc}
                variant="outline"
                size="sm"
                className="btn-glass-tertiary rounded-xl text-xs h-9 px-3 border-0"
                propertyMeta={{ precioTexto: propiedad.precioTexto, tipo: propiedad.tipo, ubicacion: propiedad.ubicacion, habitaciones: propiedad.habitaciones, banos: propiedad.banos, areaTexto: propiedad.areaTexto }}
              />
            </div>
            <Link href={`/propiedades/${propiedad.id}`} onClick={(e: React.MouseEvent<HTMLAnchorElement>) => e.stopPropagation()}>
              <Button
                variant="outline"
                size="sm"
                className="btn-glass-tertiary rounded-xl text-xs h-9 px-3 border-0"
              >
                {t('common.visit')}
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

/** Grid vacío reutilizable */
export function EmptyProperties({ label }: { label: string }) {
  const { t } = useLanguage()
  return (
    <div className="col-span-full py-20 text-center">
      <p className="text-4xl mb-4">🏠</p>
      <h3 className="text-lg font-bold text-conectia-accent mb-2">
        {t('properties.empty.title')}
      </h3>
      <p className="text-sm text-conectia-accent/50">{label}</p>
    </div>
  )
}
