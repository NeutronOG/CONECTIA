"use client"

import { useState, useEffect } from "react"
import { trackPropertyView, startInteractionTimer } from "@/lib/property-analytics"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { 
  MapPin, Bed, Bath, Square, Heart, Phone, Mail, MessageCircle,
  Car, Wifi, Shield, TreePine, Waves, Dumbbell, ChefHat, Wind, Sun, Camera, Play,
  ArrowLeft, ArrowRight, Maximize, X, Loader2, Users
} from "lucide-react"
import Link from "next/link"
import { WishlistButton } from "@/components/wishlist-button"
import { ShareButton } from "@/components/share-button"
import type { Propiedad } from "@/data/propiedades"
import { usePropertyStatic } from "@/hooks/use-properties-static"

interface PropertyDetailClientProps {
  propertyData: Propiedad | null
  propertyId: string
}

export function PropertyDetailClient({ propertyData: initialData, propertyId }: PropertyDetailClientProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [isImageFullscreen, setIsImageFullscreen] = useState(false)
  
  const id = parseInt(propertyId, 10)
  const { property: propertyData, isLoading, error: loadError } = usePropertyStatic(id)

  // Track view and interaction time
  useEffect(() => {
    if (propertyData) {
      trackPropertyView(propertyData.id)
      const endTimer = startInteractionTimer(propertyData.id)
      return endTimer
    }
  }, [propertyData])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-conectia-gold mx-auto mb-4" />
          <p className="text-gray-600">Cargando propiedad...</p>
        </div>
      </div>
    )
  }

  if (loadError || !propertyData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">Error al cargar la propiedad</p>
          <Link href="/propiedades">
            <Button>Volver a Propiedades</Button>
          </Link>
        </div>
      </div>
    )
  }

  const images = propertyData.galeria && propertyData.galeria.length > 0 
    ? propertyData.galeria 
    : [propertyData.imagen]

  const nextImage = () => setCurrentImageIndex((prev) => (prev + 1) % images.length)
  const prevImage = () => setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length)

  const amenityIcons: Record<string, React.ElementType> = {
    'Estacionamiento': Car, 'WiFi': Wifi, 'Seguridad 24/7': Shield, 'Jardín': TreePine,
    'Alberca': Waves, 'Gimnasio': Dumbbell, 'Cocina equipada': ChefHat,
    'Aire acondicionado': Wind, 'Terraza': Sun
  }

  return (
    <div className="min-h-screen bg-white dark:bg-[#0F2027] transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 pt-28 pb-16">
        <Link href="/propiedades" className="inline-flex items-center text-[#C78F7B] hover:text-[#b87c68] mb-8 transition-colors text-sm font-medium">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver a Propiedades
        </Link>

        <div className="grid lg:grid-cols-[1.2fr_0.8fr] gap-10 lg:gap-12">
          {/* Left column */}
          <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <span className="px-3 py-1 rounded-full bg-[#C78F7B]/15 text-[#C78F7B] text-[10px] font-bold uppercase tracking-wider">{propertyData.status}</span>
                  <span className="px-3 py-1 rounded-full bg-[#F3F4F6] dark:bg-[#17313A]/30 text-[#6B7280] dark:text-[#B0ACA6] text-[10px] font-semibold uppercase tracking-wider">{propertyData.tipo}</span>
                </div>
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#17313A] dark:text-[#EAE4DD] leading-tight">{propertyData.titulo}</h1>
                <div className="flex items-center gap-1.5 mt-3 text-[#6B7280] dark:text-[#B0ACA6]">
                  <MapPin className="h-4 w-4 text-[#C78F7B]" />
                  <span className="text-sm">{propertyData.ubicacion}</span>
                </div>
              </div>
              <div className="flex gap-2">
                <ShareButton title={propertyData.titulo} description={propertyData.descripcion} url={`/propiedades/${propertyData.id}`} image={propertyData.imagen} variant="outline" size="sm" propertyMeta={{ precioTexto: propertyData.precioTexto, tipo: propertyData.tipo, ubicacion: propertyData.ubicacion, habitaciones: propertyData.habitaciones, banos: propertyData.banos, areaTexto: propertyData.areaTexto }} />
                <WishlistButton property={{ id: String(propertyData.id), title: propertyData.titulo, price: propertyData.precioTexto, location: propertyData.ubicacion, image: propertyData.imagen, bedrooms: propertyData.habitaciones, bathrooms: propertyData.banos, area: propertyData.areaTexto }} />
              </div>
            </div>

            {/* Price */}
            <div>
              <p className="text-[10px] uppercase tracking-[0.35em] text-[#9CA3AF] font-bold mb-2">Precio</p>
              <p className="text-4xl sm:text-5xl font-black text-[#C78F7B]">{propertyData.precioTexto}</p>
            </div>

            {/* Main image — blob shape */}
            <div
              className="relative w-full aspect-[16/10] overflow-hidden shadow-2xl bg-[#F3F4F6] dark:bg-[#17313A]/20"
              style={{ borderRadius: '24px 96px 24px 96px' }}
            >
              <img
                src={images[currentImageIndex]}
                alt={propertyData.titulo}
                className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
              />

              {images.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-4 top-1/2 -translate-y-1/2 w-11 h-11 bg-white/90 dark:bg-[#17313A]/80 border border-[#E5E7EB] dark:border-white/10 hover:border-[#C78F7B]/40 rounded-full flex items-center justify-center text-[#17313A] dark:text-white transition-all z-10"
                  >
                    <ArrowLeft className="h-5 w-5" />
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-4 top-1/2 -translate-y-1/2 w-11 h-11 bg-white/90 dark:bg-[#17313A]/80 border border-[#E5E7EB] dark:border-white/10 hover:border-[#C78F7B]/40 rounded-full flex items-center justify-center text-[#17313A] dark:text-white transition-all z-10"
                  >
                    <ArrowRight className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => setIsImageFullscreen(true)}
                    className="absolute top-4 right-4 w-10 h-10 bg-white/90 dark:bg-[#17313A]/80 border border-[#E5E7EB] dark:border-white/10 rounded-full flex items-center justify-center text-[#17313A] dark:text-white transition-all z-10"
                  >
                    <Maximize className="h-5 w-5" />
                  </button>
                  {propertyData.tourVirtual && (
                    <button
                      onClick={() => window.open(propertyData.tourVirtual, '_blank')}
                      className="absolute top-4 left-4 px-5 py-2.5 bg-[#C78F7B] hover:bg-[#b87c68] text-white rounded-full font-bold text-sm flex items-center gap-2 shadow-lg transition-all z-10"
                    >
                      <Play className="h-4 w-4 fill-current" />
                      Tour Virtual
                    </button>
                  )}
                  <div className="absolute bottom-5 right-5 bg-white/90 dark:bg-[#17313A]/80 border border-[#E5E7EB] dark:border-white/10 px-3 py-1.5 rounded-full text-xs font-bold text-[#17313A] dark:text-white">
                    {currentImageIndex + 1} / {images.length}
                  </div>
                </>
              )}
            </div>

            {/* Thumbnails */}
            {images.length > 1 && (
              <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
                {images.map((src, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentImageIndex(i)}
                    className={`relative aspect-[4/3] rounded-xl overflow-hidden border-2 transition-all ${
                      i === currentImageIndex ? 'border-[#C78F7B]' : 'border-transparent hover:border-[#C78F7B]/40'
                    }`}
                  >
                    <img src={src} alt={`${propertyData.titulo} ${i + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}

            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-4">
              {[
                { icon: Bed, value: `${propertyData.habitaciones || 0} Hab` },
                { icon: Bath, value: `${propertyData.banos || 0} Baños` },
                { icon: Square, value: propertyData.areaTexto || '—' }
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3 p-4 rounded-2xl border border-[#E5E7EB] dark:border-[#EAE4DD]/10 bg-white dark:bg-[#17313A]/10">
                  <div className="w-10 h-10 rounded-xl bg-[#C78F7B]/10 flex items-center justify-center">
                    <item.icon className="h-5 w-5 text-[#C78F7B]" />
                  </div>
                  <span className="text-sm font-bold text-[#17313A] dark:text-[#EAE4DD]">{item.value}</span>
                </div>
              ))}
            </div>

            {/* Info Cards */}
            <div className="space-y-6">
              {/* Descripción */}
              <div className="rounded-3xl border border-[#E5E7EB] dark:border-[#EAE4DD]/10 bg-white dark:bg-[#17313A]/10 p-6 sm:p-8">
                <h3 className="text-lg font-bold text-[#17313A] dark:text-[#EAE4DD] mb-4">Acerca de esta propiedad</h3>
                <p className="text-[#6B7280] dark:text-[#B0ACA6] leading-relaxed whitespace-pre-line">{propertyData.descripcion || 'Sin descripción disponible.'}</p>
                {propertyData.tourVirtual && (
                  <div className="pt-6 mt-6 border-t border-[#E5E7EB] dark:border-[#EAE4DD]/10">
                    <Button className="w-full bg-[#C78F7B] hover:bg-[#b87c68] text-white font-bold rounded-xl py-5" asChild>
                      <a href={propertyData.tourVirtual} target="_blank" rel="noopener noreferrer"><Play className="h-4 w-4 mr-2" />Ver Tour Virtual 360°</a>
                    </Button>
                  </div>
                )}
              </div>

              {/* Amenidades */}
              {propertyData.caracteristicas && propertyData.caracteristicas.length > 0 && (
                <div className="rounded-3xl border border-[#E5E7EB] dark:border-[#EAE4DD]/10 bg-white dark:bg-[#17313A]/10 p-6 sm:p-8">
                  <h3 className="text-lg font-bold text-[#17313A] dark:text-[#EAE4DD] mb-4">Amenidades y Características</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {propertyData.caracteristicas.map((car, i) => {
                      const Icon = amenityIcons[car] || Shield
                      return (
                        <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-[#F9FAFB] dark:bg-[#17313A]/20 border border-[#E5E7EB] dark:border-[#EAE4DD]/10">
                          <div className="w-9 h-9 rounded-lg bg-[#C78F7B]/10 flex items-center justify-center">
                            <Icon className="h-4 w-4 text-[#C78F7B]" />
                          </div>
                          <span className="text-xs font-medium text-[#17313A] dark:text-[#EAE4DD] leading-tight">{car}</span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Detalles */}
              <div className="rounded-3xl border border-[#E5E7EB] dark:border-[#EAE4DD]/10 bg-white dark:bg-[#17313A]/10 p-6 sm:p-8">
                <h3 className="text-lg font-bold text-[#17313A] dark:text-[#EAE4DD] mb-4">Información Detallada</h3>
                <div className="space-y-3">
                  {[
                    { label: 'Tipo de Propiedad', value: propertyData.detalles?.tipoPropiedad || propertyData.tipo },
                    { label: 'Área Total', value: propertyData.areaTexto },
                    ...(propertyData.detalles?.areaTerreno ? [{ label: 'Área de Terreno', value: propertyData.detalles.areaTerreno }] : []),
                    ...(propertyData.detalles?.antiguedad ? [{ label: 'Antigüedad', value: propertyData.detalles.antiguedad }] : []),
                    { label: 'Estado', value: propertyData.status },
                    { label: 'Categoría', value: propertyData.categoria },
                    ...(propertyData.detalles?.publicado ? [{ label: 'Fecha de Publicación', value: propertyData.detalles.publicado }] : []),
                  ].map((item, i) => (
                    <div key={i} className="flex justify-between items-center py-3 border-b border-[#E5E7EB] dark:border-[#EAE4DD]/10 last:border-0">
                      <span className="text-[#6B7280] dark:text-[#B0ACA6] text-sm">{item.label}</span>
                      <span className="font-semibold text-[#17313A] dark:text-[#EAE4DD] text-sm">{item.value}</span>
                    </div>
                  ))}
                </div>
                {propertyData.detalles && (
                  <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t border-[#E5E7EB] dark:border-[#EAE4DD]/10">
                    {[{ icon: Camera, label: 'Vistas', value: propertyData.detalles.vistas?.toLocaleString() }, { icon: Heart, label: 'Favoritos', value: propertyData.detalles.favoritos?.toLocaleString() }].map((stat, i) => (
                      <div key={i} className="p-4 rounded-2xl bg-[#F9FAFB] dark:bg-[#17313A]/20 border border-[#E5E7EB] dark:border-[#EAE4DD]/10">
                        <div className="flex items-center gap-2 mb-2">
                          <stat.icon className="h-4 w-4 text-[#C78F7B]" />
                          <span className="text-xs text-[#6B7280] dark:text-[#B0ACA6] font-medium">{stat.label}</span>
                        </div>
                        <p className="text-2xl font-black text-[#17313A] dark:text-[#EAE4DD]">{stat.value || '0'}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Ubicación */}
              <div className="rounded-3xl border border-[#E5E7EB] dark:border-[#EAE4DD]/10 bg-white dark:bg-[#17313A]/10 p-6 sm:p-8">
                <h3 className="text-lg font-bold text-[#17313A] dark:text-[#EAE4DD] mb-4">Ubicación</h3>
                <div className="flex items-start gap-3 p-4 rounded-2xl bg-[#F9FAFB] dark:bg-[#17313A]/20 border border-[#E5E7EB] dark:border-[#EAE4DD]/10">
                  <MapPin className="h-5 w-5 text-[#C78F7B] mt-0.5" />
                  <div>
                    <p className="font-semibold text-[#17313A] dark:text-[#EAE4DD]">{propertyData.ubicacion}</p>
                    <p className="text-sm text-[#6B7280] dark:text-[#B0ACA6] mt-1">Esta propiedad se encuentra en una ubicación privilegiada con fácil acceso a servicios, transporte y amenidades.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right column — sticky */}
          <div className="lg:sticky lg:top-28 h-fit space-y-6">
            {/* Contact Card */}
            <div className="rounded-3xl border border-[#E5E7EB] dark:border-[#EAE4DD]/10 bg-white dark:bg-[#17313A]/10 p-6 shadow-lg">
              <h3 className="text-lg font-bold text-[#17313A] dark:text-[#EAE4DD] mb-5">Contactar Asesor</h3>
              <div className="flex items-center gap-3 p-3 rounded-2xl bg-[#F9FAFB] dark:bg-[#17313A]/20 border border-[#E5E7EB] dark:border-[#EAE4DD]/10 mb-5">
                <Avatar className="h-12 w-12 border border-[#C78F7B]/30">
                  <AvatarImage src="/logo.png" />
                  <AvatarFallback className="bg-[#C78F7B]/20 text-[#C78F7B] font-bold">CS</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold text-[#17313A] dark:text-[#EAE4DD] text-sm">Asesor CONECTIA</p>
                  <p className="text-xs text-[#6B7280] dark:text-[#B0ACA6]">Especialista en Propiedades</p>
                </div>
              </div>
              <div className="space-y-3">
                <Button className="w-full bg-[#C78F7B] hover:bg-[#b87c68] text-white font-bold rounded-xl py-5">
                  <MessageCircle className="h-4 w-4 mr-2" />
                  WhatsApp
                </Button>
                <Button variant="outline" className="w-full border-[#E5E7EB] dark:border-[#EAE4DD]/20 text-[#17313A] dark:text-[#EAE4DD] hover:border-[#C78F7B]/40 rounded-xl font-semibold py-5">
                  <Phone className="h-4 w-4 mr-2" />
                  Llamar
                </Button>
                <Button variant="outline" className="w-full border-[#E5E7EB] dark:border-[#EAE4DD]/20 text-[#17313A] dark:text-[#EAE4DD] hover:border-[#C78F7B]/40 rounded-xl font-semibold py-5">
                  <Mail className="h-4 w-4 mr-2" />
                  Email
                </Button>
              </div>
            </div>

            {/* Quick Info Card */}
            <div className="rounded-3xl border border-[#E5E7EB] dark:border-[#EAE4DD]/10 bg-white dark:bg-[#17313A]/10 p-6">
              <h4 className="text-sm font-bold text-[#17313A] dark:text-[#EAE4DD] uppercase tracking-wider mb-4">Información Rápida</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-[#6B7280] dark:text-[#B0ACA6]">ID Propiedad</span>
                  <span className="text-xs font-mono text-[#C78F7B]">#{propertyData.id}</span>
                </div>
                <div className="h-px bg-[#E5E7EB] dark:bg-[#EAE4DD]/10" />
                <div className="flex items-center justify-between">
                  <span className="text-xs text-[#6B7280] dark:text-[#B0ACA6]">Publicado</span>
                  <span className="text-xs text-[#17313A] dark:text-[#EAE4DD]">{propertyData.detalles?.publicado || 'Recientemente'}</span>
                </div>
                <div className="h-px bg-[#E5E7EB] dark:bg-[#EAE4DD]/10" />
                <div className="flex items-center justify-between">
                  <span className="text-xs text-[#6B7280] dark:text-[#B0ACA6]">Estado</span>
                  <span className="px-2 py-0.5 rounded-full bg-[#C78F7B]/15 text-[#C78F7B] text-[10px] font-bold">{propertyData.status}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {isImageFullscreen && (
        <div className="fixed inset-0 z-50 bg-[#0F2027]/95 backdrop-blur-xl flex items-center justify-center">
          <button
            onClick={() => setIsImageFullscreen(false)}
            className="absolute top-4 right-4 w-11 h-11 bg-white/10 border border-white/20 hover:bg-[#C78F7B]/20 rounded-full flex items-center justify-center text-white transition-all z-10"
          >
            <X className="h-5 w-5" />
          </button>
          <img
            src={images[currentImageIndex]}
            alt={propertyData.titulo}
            className="max-w-[95%] max-h-[90vh] object-contain rounded-2xl shadow-2xl"
          />
          {images.length > 1 && (
            <>
              <button onClick={prevImage} className="absolute left-4 top-1/2 -translate-y-1/2 w-11 h-11 bg-white/10 border border-white/20 hover:bg-[#C78F7B]/20 rounded-full flex items-center justify-center text-white transition-all">
                <ArrowLeft className="h-5 w-5" />
              </button>
              <button onClick={nextImage} className="absolute right-4 top-1/2 -translate-y-1/2 w-11 h-11 bg-white/10 border border-white/20 hover:bg-[#C78F7B]/20 rounded-full flex items-center justify-center text-white transition-all">
                <ArrowRight className="h-5 w-5" />
              </button>
            </>
          )}
        </div>
      )}
    </div>
  )
}
