"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { 
  MapPin, Bed, Bath, Square, Calendar, Heart, Share2, Phone, Mail, MessageCircle,
  Car, Wifi, Shield, TreePine, Waves, Dumbbell, ChefHat, Wind, Sun, Camera, Play,
  ArrowLeft, ArrowRight, Maximize, X, Star, Clock, Calculator, Loader2, Users, FileText, Sparkles, Info, ChevronDown
} from "lucide-react"
import Link from "next/link"
import { WishlistButton } from "@/components/wishlist-button"
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
    <div className="min-h-screen bg-conectia-secondary">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <Link href="/propiedades" className="inline-flex items-center text-conectia-gold hover:text-conectia-gold/80 mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver a Propiedades
        </Link>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="relative rounded-2xl overflow-hidden bg-gray-900 aspect-video group">
              <img
                src={images[currentImageIndex]}
                alt={propertyData.titulo}
                className="w-full h-full object-cover"
              />
              
              {images.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-[#17313A]/50 hover:bg-[#17313A]/70 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <ArrowLeft className="h-5 w-5" />
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-[#17313A]/50 hover:bg-[#17313A]/70 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <ArrowRight className="h-5 w-5" />
                  </button>
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                    {images.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setCurrentImageIndex(i)}
                        className={`w-2 h-2 rounded-full transition-all ${
                          i === currentImageIndex ? 'bg-white w-6' : 'bg-white/50'
                        }`}
                      />
                    ))}
                  </div>
                </>
              )}

              <button
                onClick={() => setIsImageFullscreen(true)}
                className="absolute top-4 right-4 w-10 h-10 bg-[#17313A]/50 hover:bg-[#17313A]/70 rounded-full flex items-center justify-center text-white"
              >
                <Maximize className="h-5 w-5" />
              </button>

              {propertyData.tourVirtual && (
                <button
                  onClick={() => window.open(propertyData.tourVirtual, '_blank')}
                  className="absolute top-4 left-4 px-4 py-2 bg-[#C78F7B] hover:bg-[#D4987E] text-[#17313A] rounded-full font-medium flex items-center gap-2"
                >
                  <Play className="h-4 w-4" />
                  Tour Virtual
                </button>
              )}
            </div>

            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Badge className="bg-conectia-gold text-[#17313A]">{propertyData.status}</Badge>
                      <Badge variant="outline">{propertyData.tipo}</Badge>
                    </div>
                    <CardTitle className="text-3xl mb-2 uppercase">{propertyData.titulo}</CardTitle>
                    <div className="flex items-center text-gray-600">
                      <MapPin className="h-4 w-4 mr-1" />
                      {propertyData.ubicacion}
                    </div>
                  </div>
                  <WishlistButton property={{
                    id: String(propertyData.id),
                    title: propertyData.titulo,
                    price: propertyData.precioTexto,
                    location: propertyData.ubicacion,
                    image: propertyData.imagen,
                    bedrooms: propertyData.habitaciones,
                    bathrooms: propertyData.banos,
                    area: propertyData.area,
                  }} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold text-conectia-gold mb-6">
                  {propertyData.precioTexto}
                </div>

                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="flex items-center gap-2">
                    <Bed className="h-5 w-5 text-gray-400" />
                    <span className="font-medium">{propertyData.habitaciones} Hab</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Bath className="h-5 w-5 text-gray-400" />
                    <span className="font-medium">{propertyData.banos} Baños</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Square className="h-5 w-5 text-gray-400" />
                    <span className="font-medium">{propertyData.areaTexto}</span>
                  </div>
                </div>

                <Tabs defaultValue="descripcion" className="w-full">
                  <TabsList className="grid w-full grid-cols-4 gap-0.5">
                    <TabsTrigger value="descripcion" className="flex-col gap-1 py-2 px-1">
                      <FileText className="h-4 w-4" />
                      <span className="text-[10px] sm:text-xs">Descripción</span>
                    </TabsTrigger>
                    <TabsTrigger value="caracteristicas" className="flex-col gap-1 py-2 px-1">
                      <Sparkles className="h-4 w-4" />
                      <span className="text-[10px] sm:text-xs">Amenidades</span>
                    </TabsTrigger>
                    <TabsTrigger value="detalles" className="flex-col gap-1 py-2 px-1">
                      <Info className="h-4 w-4" />
                      <span className="text-[10px] sm:text-xs">Detalles</span>
                    </TabsTrigger>
                    <TabsTrigger value="ubicacion" className="flex-col gap-1 py-2 px-1">
                      <MapPin className="h-4 w-4" />
                      <span className="text-[10px] sm:text-xs">Ubicación</span>
                    </TabsTrigger>
                  </TabsList>

                  {/* Descripción */}
                  <TabsContent value="descripcion" className="mt-4 space-y-4">
                    <div>
                      <h3 className="font-semibold text-lg mb-2 text-conectia-accent">Acerca de esta propiedad</h3>
                      <p className="text-gray-600 leading-relaxed">{propertyData.descripcion}</p>
                    </div>
                    
                    {propertyData.tourVirtual && (
                      <div className="pt-4 border-t">
                        <Button variant="outline" className="w-full" asChild>
                          <a href={propertyData.tourVirtual} target="_blank" rel="noopener noreferrer">
                            <Play className="h-4 w-4 mr-2" />
                            Ver Tour Virtual 360°
                          </a>
                        </Button>
                      </div>
                    )}
                  </TabsContent>

                  {/* Características y Amenidades - Expandible */}
                  <TabsContent value="caracteristicas" className="mt-4">
                    <Accordion type="single" collapsible className="w-full space-y-2">
                      <AccordionItem value="amenidades" className="border rounded-lg px-4 bg-white">
                        <AccordionTrigger className="hover:no-underline py-3">
                          <div className="flex items-center gap-2">
                            <Sparkles className="h-5 w-5 text-conectia-gold" />
                            <span className="font-semibold text-conectia-accent">Amenidades y Características</span>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="pb-4">
                          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-2 mt-2">
                            {propertyData.caracteristicas?.map((car, i) => {
                              const Icon = amenityIcons[car] || Shield
                              return (
                                <div key={i} className="flex items-center gap-2 p-2.5 rounded-lg bg-gray-50 border border-gray-200 hover:border-conectia-gold/50 transition-colors">
                                  <div className="w-8 h-8 rounded-full bg-conectia-gold/10 flex items-center justify-center flex-shrink-0">
                                    <Icon className="h-4 w-4 text-conectia-gold" />
                                  </div>
                                  <span className="text-xs font-medium text-gray-700 leading-tight">{car}</span>
                                </div>
                              )
                            })}
                          </div>
                        </AccordionContent>
                      </AccordionItem>

                      <AccordionItem value="espacios" className="border rounded-lg px-4 bg-white">
                        <AccordionTrigger className="hover:no-underline py-3">
                          <div className="flex items-center gap-2">
                            <Square className="h-5 w-5 text-conectia-gold" />
                            <span className="font-semibold text-conectia-accent">Espacios Adicionales</span>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="pb-4">
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-2">
                            {propertyData.cochera && (
                              <div className="flex items-center gap-2 p-2.5 rounded-lg bg-blue-50 border border-blue-200">
                                <Car className="h-4 w-4 text-blue-600 flex-shrink-0" />
                                <span className="text-xs font-medium text-blue-700">{propertyData.cochera} Cochera{propertyData.cochera > 1 ? 's' : ''}</span>
                              </div>
                            )}
                            {propertyData.mediosBanos && (
                              <div className="flex items-center gap-2 p-2.5 rounded-lg bg-purple-50 border border-purple-200">
                                <Bath className="h-4 w-4 text-purple-600 flex-shrink-0" />
                                <span className="text-xs font-medium text-purple-700">{propertyData.mediosBanos} Medio Baño{propertyData.mediosBanos > 1 ? 's' : ''}</span>
                              </div>
                            )}
                            {propertyData.areaConstruccion && (
                              <div className="flex items-center gap-2 p-2.5 rounded-lg bg-green-50 border border-green-200">
                                <Square className="h-4 w-4 text-green-600 flex-shrink-0" />
                                <span className="text-xs font-medium text-green-700">{propertyData.areaConstruccion} m² const.</span>
                              </div>
                            )}
                            {propertyData.amueblado && (
                              <div className="flex items-center gap-2 p-2.5 rounded-lg bg-orange-50 border border-orange-200">
                                <Users className="h-4 w-4 text-orange-600 flex-shrink-0" />
                                <span className="text-xs font-medium text-orange-700 capitalize">{propertyData.amueblado.replace(/_/g, ' ')}</span>
                              </div>
                            )}
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                  </TabsContent>

                  {/* Detalles Técnicos */}
                  <TabsContent value="detalles" className="mt-4 space-y-4">
                    <div>
                      <h3 className="font-semibold text-lg mb-3 text-conectia-accent">Información Detallada</h3>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center py-2 border-b border-gray-200">
                          <span className="text-gray-600 text-sm">Tipo de Propiedad</span>
                          <span className="font-medium text-gray-900">{propertyData.detalles?.tipoPropiedad || propertyData.tipo}</span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b border-gray-200">
                          <span className="text-gray-600 text-sm">Área Total</span>
                          <span className="font-medium text-gray-900">{propertyData.areaTexto}</span>
                        </div>
                        {propertyData.detalles?.areaTerreno && (
                          <div className="flex justify-between items-center py-2 border-b border-gray-200">
                            <span className="text-gray-600 text-sm">Área de Terreno</span>
                            <span className="font-medium text-gray-900">{propertyData.detalles.areaTerreno}</span>
                          </div>
                        )}
                        {propertyData.detalles?.antiguedad && (
                          <div className="flex justify-between items-center py-2 border-b border-gray-200">
                            <span className="text-gray-600 text-sm">Antigüedad</span>
                            <span className="font-medium text-gray-900">{propertyData.detalles.antiguedad}</span>
                          </div>
                        )}
                        <div className="flex justify-between items-center py-2 border-b border-gray-200">
                          <span className="text-gray-600 text-sm">Estado</span>
                          <Badge className="bg-conectia-gold text-[#17313A]">{propertyData.status}</Badge>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b border-gray-200">
                          <span className="text-gray-600 text-sm">Categoría</span>
                          <Badge variant="outline" className="capitalize">{propertyData.categoria}</Badge>
                        </div>
                        {propertyData.detalles?.publicado && (
                          <div className="flex justify-between items-center py-2 border-b border-gray-200">
                            <span className="text-gray-600 text-sm flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              Fecha de Publicación
                            </span>
                            <span className="font-medium text-gray-900">{propertyData.detalles.publicado}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Estadísticas */}
                    {propertyData.detalles && (
                      <div className="pt-4 border-t">
                        <h4 className="font-semibold text-gray-700 mb-3">Estadísticas</h4>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="p-3 rounded-lg bg-blue-50 border border-blue-200">
                            <div className="flex items-center gap-2 mb-1">
                              <Camera className="h-4 w-4 text-blue-600" />
                              <span className="text-xs text-blue-600 font-medium">Vistas</span>
                            </div>
                            <p className="text-2xl font-bold text-blue-700">{propertyData.detalles.vistas?.toLocaleString()}</p>
                          </div>
                          <div className="p-3 rounded-lg bg-red-50 border border-red-200">
                            <div className="flex items-center gap-2 mb-1">
                              <Heart className="h-4 w-4 text-red-600" />
                              <span className="text-xs text-red-600 font-medium">Favoritos</span>
                            </div>
                            <p className="text-2xl font-bold text-red-700">{propertyData.detalles.favoritos?.toLocaleString()}</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </TabsContent>

                  {/* Ubicación */}
                  <TabsContent value="ubicacion" className="mt-4 space-y-4">
                    <div>
                      <h3 className="font-semibold text-lg mb-3 text-conectia-accent">Ubicación</h3>
                      <div className="flex items-start gap-3 p-4 rounded-lg bg-gray-50 border border-gray-200">
                        <MapPin className="h-5 w-5 text-conectia-gold flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="font-medium text-gray-900">{propertyData.ubicacion}</p>
                          <p className="text-sm text-gray-600 mt-1">
                            Esta propiedad se encuentra en una ubicación privilegiada con fácil acceso a servicios, transporte y amenidades.
                          </p>
                        </div>
                      </div>
                    </div>

                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Contactar Asesor</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src="/conectia-select-white.png" />
                    <AvatarFallback>AS</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">Asesor CONECTIA</p>
                    <p className="text-sm text-gray-500">Especialista en Propiedades</p>
                  </div>
                </div>

                <Button className="w-full bg-green-600 hover:bg-green-700 text-white">
                  <MessageCircle className="h-4 w-4 mr-2" />
                  WhatsApp
                </Button>
                <Button variant="outline" className="w-full">
                  <Phone className="h-4 w-4 mr-2" />
                  Llamar
                </Button>
                <Button variant="outline" className="w-full">
                  <Mail className="h-4 w-4 mr-2" />
                  Email
                </Button>
              </CardContent>
            </Card>

          </div>
        </div>
      </div>

      {isImageFullscreen && (
        <div className="fixed inset-0 z-50 bg-[#17313A] flex items-center justify-center">
          <button
            onClick={() => setIsImageFullscreen(false)}
            className="absolute top-4 right-4 w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white"
          >
            <X className="h-5 w-5" />
          </button>
          <img
            src={images[currentImageIndex]}
            alt={propertyData.titulo}
            className="max-w-full max-h-full object-contain"
          />
        </div>
      )}
    </div>
  )
}
