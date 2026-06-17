"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { 
  MapPin, Bed, Bath, Square, Calendar, Heart, Share2, Phone, Mail, MessageCircle,
  Car, Wifi, Shield, TreePine, Waves, Dumbbell, ChefHat, Wind, Sun, Camera, Play,
  ArrowLeft, ArrowRight, Maximize, X, Star, Loader2, Users, FileText, Sparkles, Info
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
    <div className="min-h-screen bg-[#0F2027] relative overflow-hidden">
      {/* Glow orbs */}
      <div className="fixed top-20 right-[20%] w-[400px] h-[400px] bg-[#C78F7B]/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="fixed bottom-20 left-[10%] w-[300px] h-[300px] bg-[#17313A]/40 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 pt-16 pb-8 relative z-10">
        <Link href="/propiedades" className="inline-flex items-center text-[#C78F7B] hover:text-[#E8A88F] mb-8 transition-colors">
          <ArrowLeft className="h-4 w-4 mr-2" />
          <span className="text-sm font-medium">Volver a Propiedades</span>
        </Link>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="relative rounded-[28px] overflow-hidden aspect-video group shadow-2xl shadow-black/40">
              <img
                src={images[currentImageIndex]}
                alt={propertyData.titulo}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0F2027]/60 via-transparent to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-r from-[#0F2027]/30 via-transparent to-transparent" />

              {images.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-4 top-1/2 -translate-y-1/2 w-11 h-11 bg-white/5 border border-white/15 hover:bg-[#C78F7B]/20 hover:border-[#C78F7B]/30 backdrop-blur-md rounded-full flex items-center justify-center text-white transition-all duration-300 hover:scale-110 z-10"
                  >
                    <ArrowLeft className="h-5 w-5" />
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-4 top-1/2 -translate-y-1/2 w-11 h-11 bg-white/5 border border-white/15 hover:bg-[#C78F7B]/20 hover:border-[#C78F7B]/30 backdrop-blur-md rounded-full flex items-center justify-center text-white transition-all duration-300 hover:scale-110 z-10"
                  >
                    <ArrowRight className="h-5 w-5" />
                  </button>
                  <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex gap-2 z-10">
                    {images.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setCurrentImageIndex(i)}
                        className={`h-2 rounded-full transition-all duration-300 ${
                          i === currentImageIndex ? 'bg-[#C78F7B] w-8' : 'bg-white/30 hover:bg-white/50 w-2'
                        }`}
                      />
                    ))}
                  </div>
                </>
              )}

              <button
                onClick={() => setIsImageFullscreen(true)}
                className="absolute top-4 right-4 w-10 h-10 bg-white/5 border border-white/15 hover:bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center text-white transition-all z-10"
              >
                <Maximize className="h-5 w-5" />
              </button>

              {propertyData.tourVirtual && (
                <button
                  onClick={() => window.open(propertyData.tourVirtual, '_blank')}
                  className="absolute top-4 left-4 px-5 py-2.5 bg-[#C78F7B] hover:bg-[#D4987E] text-[#0F2027] rounded-full font-bold text-sm flex items-center gap-2 shadow-lg shadow-[#C78F7B]/20 transition-all z-10"
                >
                  <Play className="h-4 w-4 fill-current" />
                  Tour Virtual
                </button>
              )}

              <div className="absolute bottom-5 right-5 bg-[#0F2027]/60 backdrop-blur-md border border-white/10 px-3 py-1.5 rounded-full text-xs font-bold text-white z-10">
                {currentImageIndex + 1} / {images.length}
              </div>
            </div>

            {/* Main Info — Glassmorphism */}
            <div className="relative bg-white/[0.03] backdrop-blur-md border border-white/10 rounded-[28px] p-6 sm:p-8 shadow-2xl overflow-hidden">
              <div className="absolute -top-24 -right-24 w-48 h-48 bg-[#C78F7B]/8 rounded-full blur-[60px] pointer-events-none" />

              <div className="relative">
                {/* Header */}
                <div className="flex flex-col sm:flex-row items-start justify-between gap-4 mb-6">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-3 flex-wrap">
                      <span className="px-3 py-1 rounded-full bg-[#C78F7B]/20 border border-[#C78F7B]/30 text-[#C78F7B] text-[10px] font-bold uppercase tracking-wider">{propertyData.status}</span>
                      <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[#B0ACA6] text-[10px] font-semibold uppercase tracking-wider">{propertyData.tipo}</span>
                    </div>
                    <h1 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-white leading-tight break-words uppercase">{propertyData.titulo}</h1>
                    <div className="flex items-center gap-1.5 mt-3 text-[#B0ACA6]">
                      <MapPin className="h-4 w-4 text-[#C78F7B] flex-shrink-0" />
                      <span className="text-sm break-words">{propertyData.ubicacion}</span>
                    </div>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <ShareButton title={propertyData.titulo} description={`${propertyData.ubicacion} - ${propertyData.precioTexto}`} url={`/propiedades/${propertyData.id}`} image={propertyData.imagen} variant="outline" size="sm" />
                    <WishlistButton property={{ id: String(propertyData.id), title: propertyData.titulo, price: propertyData.precioTexto, location: propertyData.ubicacion, image: propertyData.imagen, bedrooms: propertyData.habitaciones, bathrooms: propertyData.banos, area: propertyData.areaTexto }} />
                  </div>
                </div>

                {/* Price */}
                <div className="mb-8">
                  <p className="text-[10px] text-[#4A4F57] uppercase tracking-widest font-semibold mb-1">Precio</p>
                  <p className="text-4xl sm:text-5xl font-black bg-gradient-to-r from-[#C78F7B] to-[#E8A88F] bg-clip-text text-transparent">{propertyData.precioTexto}</p>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-3 gap-3 mb-8">
                  {[{ icon: Bed, value: `${propertyData.habitaciones} Hab` }, { icon: Bath, value: `${propertyData.banos} Baños` }, { icon: Square, value: propertyData.areaTexto }].map((item, i) => (
                    <div key={i} className="flex items-center gap-2 p-3 rounded-xl bg-white/[0.04] border border-white/10">
                      <item.icon className="h-5 w-5 text-[#C78F7B] flex-shrink-0" />
                      <span className="text-sm font-medium text-white break-words">{item.value}</span>
                    </div>
                  ))}
                </div>

                {/* Tabs */}
                <Tabs defaultValue="descripcion" className="w-full">
                  <TabsList className="grid w-full grid-cols-4 gap-1.5 bg-white/[0.03] border border-white/10 p-1.5 rounded-2xl">
                    <TabsTrigger value="descripcion" className="flex flex-col items-center gap-1 py-2.5 px-1 rounded-xl text-[10px] sm:text-xs font-bold !text-[#EAE4DD] hover:!text-white data-[state=active]:bg-[#C78F7B]/20 data-[state=active]:!text-[#C78F7B] data-[state=active]:border data-[state=active]:border-[#C78F7B]/30 data-[state=active]:shadow-lg data-[state=active]:shadow-[#C78F7B]/10 transition-all">
                      <FileText className="h-4 w-4" />
                      <span className="hidden sm:inline">Descripción</span>
                    </TabsTrigger>
                    <TabsTrigger value="caracteristicas" className="flex flex-col items-center gap-1 py-2.5 px-1 rounded-xl text-[10px] sm:text-xs font-bold !text-[#EAE4DD] hover:!text-white data-[state=active]:bg-[#C78F7B]/20 data-[state=active]:!text-[#C78F7B] data-[state=active]:border data-[state=active]:border-[#C78F7B]/30 data-[state=active]:shadow-lg data-[state=active]:shadow-[#C78F7B]/10 transition-all">
                      <Sparkles className="h-4 w-4" />
                      <span className="hidden sm:inline">Amenidades</span>
                    </TabsTrigger>
                    <TabsTrigger value="detalles" className="flex flex-col items-center gap-1 py-2.5 px-1 rounded-xl text-[10px] sm:text-xs font-bold !text-[#EAE4DD] hover:!text-white data-[state=active]:bg-[#C78F7B]/20 data-[state=active]:!text-[#C78F7B] data-[state=active]:border data-[state=active]:border-[#C78F7B]/30 data-[state=active]:shadow-lg data-[state=active]:shadow-[#C78F7B]/10 transition-all">
                      <Info className="h-4 w-4" />
                      <span className="hidden sm:inline">Detalles</span>
                    </TabsTrigger>
                    <TabsTrigger value="ubicacion" className="flex flex-col items-center gap-1 py-2.5 px-1 rounded-xl text-[10px] sm:text-xs font-bold !text-[#EAE4DD] hover:!text-white data-[state=active]:bg-[#C78F7B]/20 data-[state=active]:!text-[#C78F7B] data-[state=active]:border data-[state=active]:border-[#C78F7B]/30 data-[state=active]:shadow-lg data-[state=active]:shadow-[#C78F7B]/10 transition-all">
                      <MapPin className="h-4 w-4" />
                      <span className="hidden sm:inline">Ubicación</span>
                    </TabsTrigger>
                  </TabsList>

                  {/* Descripción */}
                  <TabsContent value="descripcion" className="mt-6 space-y-6">
                    <div>
                      <h3 className="font-semibold text-lg mb-3 text-white">Acerca de esta propiedad</h3>
                      <p className="text-[#B0ACA6] leading-relaxed break-words">{propertyData.descripcion}</p>
                    </div>
                    {propertyData.tourVirtual && (
                      <div className="pt-4 border-t border-white/10">
                        <Button className="w-full bg-white/5 border border-white/15 text-white hover:bg-[#C78F7B]/20 hover:border-[#C78F7B]/30 rounded-xl py-5" asChild>
                          <a href={propertyData.tourVirtual} target="_blank" rel="noopener noreferrer"><Play className="h-4 w-4 mr-2 text-[#C78F7B]" />Ver Tour Virtual 360°</a>
                        </Button>
                      </div>
                    )}
                  </TabsContent>

                  {/* Amenidades */}
                  <TabsContent value="caracteristicas" className="mt-6">
                    <div className="space-y-4">
                      <h3 className="font-semibold text-lg text-white">Amenidades y Características</h3>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {propertyData.caracteristicas?.map((car, i) => {
                          const Icon = amenityIcons[car] || Shield
                          return (
                            <div key={i} className="group flex items-center gap-3 p-3 rounded-xl bg-white/[0.04] border border-white/10 hover:bg-white/[0.07] hover:border-[#C78F7B]/20 transition-all duration-300">
                              <div className="w-9 h-9 rounded-lg bg-[#C78F7B]/10 flex items-center justify-center flex-shrink-0 group-hover:bg-[#C78F7B]/20 transition-colors">
                                <Icon className="h-4 w-4 text-[#C78F7B]" />
                              </div>
                              <span className="text-xs font-medium text-white leading-tight break-words">{car}</span>
                            </div>
                          )
                        })}
                      </div>
                      {(propertyData.cochera || propertyData.mediosBanos || propertyData.areaConstruccion || propertyData.amueblado) && (
                        <div className="pt-4">
                          <h3 className="font-semibold text-lg text-white mb-3">Espacios Adicionales</h3>
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                            {propertyData.cochera && (
                              <div className="flex items-center gap-2 p-3 rounded-xl bg-white/[0.04] border border-white/10">
                                <Car className="h-4 w-4 text-[#C78F7B] flex-shrink-0" />
                                <span className="text-xs font-medium text-white">{propertyData.cochera} Cochera</span>
                              </div>
                            )}
                            {propertyData.mediosBanos && (
                              <div className="flex items-center gap-2 p-3 rounded-xl bg-white/[0.04] border border-white/10">
                                <Bath className="h-4 w-4 text-[#C78F7B] flex-shrink-0" />
                                <span className="text-xs font-medium text-white">{propertyData.mediosBanos} Medio Baño</span>
                              </div>
                            )}
                            {propertyData.areaConstruccion && (
                              <div className="flex items-center gap-2 p-3 rounded-xl bg-white/[0.04] border border-white/10">
                                <Square className="h-4 w-4 text-[#C78F7B] flex-shrink-0" />
                                <span className="text-xs font-medium text-white">{propertyData.areaConstruccion} m² const.</span>
                              </div>
                            )}
                            {propertyData.amueblado && (
                              <div className="flex items-center gap-2 p-3 rounded-xl bg-white/[0.04] border border-white/10">
                                <Users className="h-4 w-4 text-[#C78F7B] flex-shrink-0" />
                                <span className="text-xs font-medium text-white capitalize">{propertyData.amueblado.replace(/_/g, ' ')}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </TabsContent>

                  {/* Detalles */}
                  <TabsContent value="detalles" className="mt-6 space-y-6">
                    <div>
                      <h3 className="font-semibold text-lg mb-4 text-white">Información Detallada</h3>
                      <div className="space-y-2">
                        {[
                          { label: 'Tipo de Propiedad', value: propertyData.detalles?.tipoPropiedad || propertyData.tipo },
                          { label: 'Área Total', value: propertyData.areaTexto },
                          ...(propertyData.detalles?.areaTerreno ? [{ label: 'Área de Terreno', value: propertyData.detalles.areaTerreno }] : []),
                          ...(propertyData.detalles?.antiguedad ? [{ label: 'Antigüedad', value: propertyData.detalles.antiguedad }] : []),
                          { label: 'Estado', value: propertyData.status, isBadge: true },
                          { label: 'Categoría', value: propertyData.categoria, isBadge: true },
                          ...(propertyData.detalles?.publicado ? [{ label: 'Fecha de Publicación', value: propertyData.detalles.publicado }] : []),
                        ].map((item, i) => (
                          <div key={i} className="flex justify-between items-center py-3 border-b border-white/10">
                            <span className="text-[#B0ACA6] text-sm">{item.label}</span>
                            {item.isBadge ? (
                              <span className="px-3 py-1 rounded-full bg-[#C78F7B]/20 border border-[#C78F7B]/30 text-[#C78F7B] text-xs font-bold">{item.value}</span>
                            ) : (
                              <span className="font-medium text-white text-sm">{item.value}</span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                    {propertyData.detalles && (
                      <div className="pt-4 border-t border-white/10">
                        <h4 className="font-semibold text-white mb-4">Estadísticas</h4>
                        <div className="grid grid-cols-2 gap-4">
                          {[{ icon: Camera, label: 'Vistas', value: propertyData.detalles.vistas?.toLocaleString() }, { icon: Heart, label: 'Favoritos', value: propertyData.detalles.favoritos?.toLocaleString() }].map((stat, i) => (
                            <div key={i} className="p-4 rounded-xl bg-white/[0.04] border border-white/10">
                              <div className="flex items-center gap-2 mb-2">
                                <stat.icon className="h-4 w-4 text-[#C78F7B]" />
                                <span className="text-xs text-[#B0ACA6] font-medium">{stat.label}</span>
                              </div>
                              <p className="text-2xl font-black text-white">{stat.value || '0'}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </TabsContent>

                  {/* Ubicación */}
                  <TabsContent value="ubicacion" className="mt-6 space-y-4">
                    <h3 className="font-semibold text-lg text-white">Ubicación</h3>
                    <div className="flex items-start gap-3 p-4 rounded-xl bg-white/[0.04] border border-white/10">
                      <MapPin className="h-5 w-5 text-[#C78F7B] flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium text-white">{propertyData.ubicacion}</p>
                        <p className="text-sm text-[#B0ACA6] mt-1">Esta propiedad se encuentra en una ubicación privilegiada con fácil acceso a servicios, transporte y amenidades.</p>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            {/* Contact Card — Glassmorphism */}
            <div className="relative bg-white/[0.03] backdrop-blur-md border border-white/10 rounded-[28px] p-6 shadow-2xl overflow-hidden">
              <div className="absolute -bottom-16 -left-16 w-40 h-40 bg-[#C78F7B]/8 rounded-full blur-[50px] pointer-events-none" />

              <div className="relative space-y-5">
                <h3 className="font-serif text-xl font-bold text-white">Contactar Asesor</h3>

                <div className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.04] border border-white/10">
                  <Avatar className="h-12 w-12 border border-[#C78F7B]/30">
                    <AvatarImage src="/logo.png" />
                    <AvatarFallback className="bg-[#C78F7B]/20 text-[#C78F7B] font-bold">CS</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold text-white text-sm">Asesor CONECTIA</p>
                    <p className="text-xs text-[#B0ACA6]">Especialista en Propiedades</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <Button className="w-full bg-[#C78F7B] hover:bg-[#D4987E] text-[#0F2027] font-bold rounded-xl shadow-lg shadow-[#C78F7B]/20">
                    <MessageCircle className="h-4 w-4 mr-2" />
                    WhatsApp
                  </Button>
                  <Button variant="outline" className="w-full bg-white/5 border-white/15 text-white hover:bg-white/10 hover:border-[#C78F7B]/30 rounded-xl font-semibold">
                    <Phone className="h-4 w-4 mr-2" />
                    Llamar
                  </Button>
                  <Button variant="outline" className="w-full bg-white/5 border-white/15 text-white hover:bg-white/10 hover:border-[#C78F7B]/30 rounded-xl font-semibold">
                    <Mail className="h-4 w-4 mr-2" />
                    Email
                  </Button>
                </div>
              </div>
            </div>

            {/* Quick Info Card */}
            <div className="relative bg-white/[0.03] backdrop-blur-md border border-white/10 rounded-[28px] p-6 shadow-xl overflow-hidden">
              <div className="space-y-4">
                <h4 className="text-sm font-bold text-white uppercase tracking-wider">Información Rápida</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-[#B0ACA6]">ID Propiedad</span>
                    <span className="text-xs font-mono text-[#C78F7B]">#{propertyData.id}</span>
                  </div>
                  <div className="h-px bg-white/10" />
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-[#B0ACA6]">Publicado</span>
                    <span className="text-xs text-white">{propertyData.detalles?.publicado || 'Recientemente'}</span>
                  </div>
                  <div className="h-px bg-white/10" />
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-[#B0ACA6]">Estado</span>
                    <span className="px-2 py-0.5 rounded-full bg-[#C78F7B]/20 border border-[#C78F7B]/30 text-[#C78F7B] text-[10px] font-bold">{propertyData.status}</span>
                  </div>
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
            className="absolute top-4 right-4 w-11 h-11 bg-white/5 border border-white/15 hover:bg-[#C78F7B]/20 hover:border-[#C78F7B]/30 rounded-full flex items-center justify-center text-white transition-all z-10"
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
              <button onClick={prevImage} className="absolute left-4 top-1/2 -translate-y-1/2 w-11 h-11 bg-white/5 border border-white/15 hover:bg-[#C78F7B]/20 rounded-full flex items-center justify-center text-white transition-all">
                <ArrowLeft className="h-5 w-5" />
              </button>
              <button onClick={nextImage} className="absolute right-4 top-1/2 -translate-y-1/2 w-11 h-11 bg-white/5 border border-white/15 hover:bg-[#C78F7B]/20 rounded-full flex items-center justify-center text-white transition-all">
                <ArrowRight className="h-5 w-5" />
              </button>
            </>
          )}
        </div>
      )}
    </div>
  )
}
