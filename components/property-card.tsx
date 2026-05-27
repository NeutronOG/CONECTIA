"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { WishlistButton } from "@/components/wishlist-button"
import { MapPin, Bed, Bathtub, Square, Calendar } from "@phosphor-icons/react"
import Link from "next/link"

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
  const fallback = FALLBACK_IMAGES[Number(propiedad.id) % FALLBACK_IMAGES.length]
  const imgSrc = propiedad.imagen || fallback

  const handleAgendar = () => {
    if (onAgendarVisita) {
      onAgendarVisita(propiedad.id)
      return
    }
    const msg = `Hola, me interesa agendar una visita para: ${propiedad.titulo} en ${propiedad.ubicacion}`
    window.open(`https://wa.me/5214774756951?text=${encodeURIComponent(msg)}`, "_blank")
  }

  return (
    <div className="group glass-card rounded-2xl overflow-hidden flex flex-col transition-all duration-400">
      {/* Imagen */}
      <div className="relative h-52 overflow-hidden flex-shrink-0">
        <img
          src={imgSrc}
          alt={propiedad.titulo}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
        />
        {/* Overlay degradado elegante */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#17313A]/50 via-transparent to-transparent" />

        {/* Badge categoría */}
        {badgeLabel && (
          <div className="absolute top-3 left-3">
            <Badge className="glass-pill text-[#17313A] text-xs font-semibold px-2.5 py-1 rounded-full border-0">
              {badgeLabel}
            </Badge>
          </div>
        )}

        {/* Bono especial */}
        {propiedad.bono && (
          <div className="absolute bottom-3 left-3">
            <span className="btn-glass-secondary text-white text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full shadow-lg">
              {propiedad.bono}
            </span>
          </div>
        )}

        {/* Wishlist */}
        <div className="absolute top-3 right-3">
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
      </div>

      {/* Contenido */}
      <div className="p-5 flex flex-col flex-1">
        {/* Tipo + Precio */}
        <div className="flex items-center justify-between mb-2">
          <Badge className="bg-[#C78F7B]/15 text-[#C78F7B] text-xs font-semibold border border-[#C78F7B]/25 rounded-full px-3">
            {propiedad.tipo}
          </Badge>
          <span className="text-lg font-bold text-[#17313A]" style={{fontFamily: "var(--font-titles)"}}>{propiedad.precioTexto}</span>
        </div>

        {/* Título */}
        <h3 className="text-base font-semibold text-[#1D1F24] mb-1.5 line-clamp-2 leading-snug" style={{fontFamily: "var(--font-titles)"}}>
          {propiedad.titulo}
        </h3>

        {/* Ubicación */}
        <div className="flex items-center text-[#4A4F57] mb-3">
          <MapPin className="h-3.5 w-3.5 mr-1.5 flex-shrink-0 text-[#B0ACA6]" weight="duotone" />
          <span className="text-xs line-clamp-1">{propiedad.ubicacion}</span>
        </div>

        {/* Descripción */}
        {propiedad.descripcion && (
          <p className="text-xs text-[#4A4F57] mb-3 line-clamp-2 leading-relaxed">
            {propiedad.descripcion}
          </p>
        )}

        {/* Stats */}
        <div className="flex items-center gap-4 text-xs text-[#4A4F57] mb-4 mt-auto pt-3 border-t border-[#17313A]/08">
          {propiedad.habitaciones != null && (
            <span className="flex items-center gap-1">
              <Bed className="h-3.5 w-3.5 text-[#B0ACA6]" weight="duotone" />
              {propiedad.habitaciones}
            </span>
          )}
          {propiedad.banos != null && (
            <span className="flex items-center gap-1">
              <Bathtub className="h-3.5 w-3.5 text-[#B0ACA6]" weight="duotone" />
              {propiedad.banos}
            </span>
          )}
          {propiedad.areaTexto && (
            <span className="flex items-center gap-1">
              <Square className="h-3.5 w-3.5 text-[#B0ACA6]" weight="duotone" />
              {propiedad.areaTexto}
            </span>
          )}
        </div>

        {/* Acciones */}
        <div className="flex gap-2">
          <Button
            size="sm"
            className="flex-1 btn-glass-primary rounded-xl text-xs font-semibold h-9 border-0"
            onClick={handleAgendar}
          >
            <Calendar className="h-3.5 w-3.5 mr-1.5" />
            Agendar Visita
          </Button>
          <Link href={`/propiedades/${propiedad.id}`}>
            <Button
              variant="outline"
              size="sm"
              className="btn-glass-tertiary rounded-xl text-xs h-9 px-3 border-0"
            >
              Ver
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}

/** Grid vacío reutilizable */
export function EmptyProperties({ label }: { label: string }) {
  return (
    <div className="col-span-full py-20 text-center">
      <p className="text-4xl mb-4">🏠</p>
      <h3 className="text-lg font-bold text-conectia-accent mb-2">
        Sin propiedades disponibles
      </h3>
      <p className="text-sm text-conectia-accent/50">{label}</p>
    </div>
  )
}
