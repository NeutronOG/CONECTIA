"use client"

import { useWishlist } from "@/components/wishlist-provider"
import { WishlistButton } from "@/components/wishlist-button"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MapPin, Bed, Bath, Square, Heart, MessageCircle } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

export default function FavoritosPage() {
  const { wishlist, wishlistCount } = useWishlist()

  const handleWhatsAppContact = (property: any) => {
    const message = `Hola CONECTIA, me interesa la propiedad "${property.title}" ubicada en ${property.location} con precio de ${property.price}. ¿Podrían enviarme más información y agendar una cita para verla?`
    const whatsappUrl = `https://wa.me/5214774756951?text=${encodeURIComponent(message)}`
    window.open(whatsappUrl, '_blank')
  }

  return (
    <div className="min-h-screen bg-[#F6F2EE] dark:bg-[#17313A]">
      {/* Hero Section */}
      <section className="pt-24 pb-12 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center px-4 py-2 bg-[#17313A]/[0.08] dark:bg-white/[0.08] border border-[#17313A]/15 dark:border-white/15 rounded-full text-sm font-medium text-[#17313A] dark:text-[#EAE4DD] mb-6 backdrop-blur-md">
              <Heart className="h-4 w-4 text-[#C78F7B] mr-2 fill-current" />
              Mis Propiedades Favoritas
            </div>
            <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-light text-[#17313A] dark:text-[#EAE4DD] mb-6 leading-tight">
              Tus Favoritos
            </h1>
            <p className="text-lg sm:text-xl text-[#4A4F57] dark:text-[#B0ACA6] max-w-2xl mx-auto">
              {wishlistCount > 0 
                ? `Tienes ${wishlistCount} ${wishlistCount === 1 ? 'propiedad guardada' : 'propiedades guardadas'} en tu lista de favoritos`
                : 'Aún no tienes propiedades en tu lista de favoritos'
              }
            </p>
          </div>
        </div>
      </section>

      {/* Wishlist Content */}
      <section className="pb-16 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          {wishlistCount === 0 ? (
            /* Empty State */
            <div className="text-center py-16">
              <div className="w-24 h-24 bg-[#17313A]/[0.08] dark:bg-white/[0.08] rounded-full flex items-center justify-center mx-auto mb-6 border border-[#17313A]/10 dark:border-white/10">
                <Heart className="h-12 w-12 text-[#17313A]/40 dark:text-white/40" />
              </div>
              <h3 className="font-serif text-2xl font-semibold text-[#17313A] dark:text-white mb-4">
                No tienes favoritos aún
              </h3>
              <p className="text-[#4A4F57] dark:text-[#B0ACA6] mb-8 max-w-md mx-auto">
                Explora nuestras propiedades y agrega las que más te gusten a tu lista de favoritos
              </p>
              <Link href="/propiedades">
                <Button className="bg-gradient-to-r from-[#C78F7B] to-[#D4987E] hover:from-[#D4987E] hover:to-[#C78F7B] text-white font-semibold px-8 py-3 rounded-2xl shadow-lg">
                  Explorar Propiedades
                </Button>
              </Link>
            </div>
          ) : (
            /* Properties Grid */
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {wishlist.map((property) => (
                <Card key={property.id} className="group overflow-hidden rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 hover:scale-[1.02] bg-[#17313A]/[0.06] dark:bg-white/[0.06] backdrop-blur-md border border-[#17313A]/10 dark:border-white/10">
                  <div className="relative">
                    <div className="aspect-[4/3] overflow-hidden">
                      <Image
                        src={property.image || "/placeholder-property.jpg"}
                        alt={property.title}
                        width={400}
                        height={300}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      />
                    </div>
                    
                    {/* Wishlist Button */}
                    <div className="absolute top-4 right-4">
                      <WishlistButton 
                        property={property}
                        size="md"
                      />
                    </div>

                    {/* Price Badge */}
                    <div className="absolute bottom-4 left-4">
                      <Badge className="bg-conectia-gold/90 text-conectia-graphite font-bold px-3 py-1 text-sm backdrop-blur-sm">
                        {property.price}
                      </Badge>
                    </div>
                  </div>

                  <div className="p-6">
                    <h3 className="font-serif text-xl font-semibold text-[#17313A] dark:text-white mb-2 line-clamp-2">
                      {property.title}
                    </h3>
                    
                    <div className="flex items-center text-[#4A4F57] dark:text-[#B0ACA6] mb-4">
                      <MapPin className="h-4 w-4 mr-1" />
                      <span className="text-sm">{property.location}</span>
                    </div>

                    {/* Property Details */}
                    {(property.bedrooms || property.bathrooms || property.area) && (
                      <div className="flex items-center space-x-4 text-sm text-[#4A4F57] dark:text-[#B0ACA6] mb-4">
                        {property.bedrooms && (
                          <div className="flex items-center">
                            <Bed className="h-4 w-4 mr-1" />
                            <span>{property.bedrooms}</span>
                          </div>
                        )}
                        {property.bathrooms && (
                          <div className="flex items-center">
                            <Bath className="h-4 w-4 mr-1" />
                            <span>{property.bathrooms}</span>
                          </div>
                        )}
                        {property.area && (
                          <div className="flex items-center">
                            <Square className="h-4 w-4 mr-1" />
                            <span>{property.area}</span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex space-x-3">
                      <Button
                        onClick={() => handleWhatsAppContact(property)}
                        className="flex-1 bg-green-600 hover:bg-green-700 text-white rounded-xl font-medium py-2 transition-all duration-300 hover:scale-105"
                      >
                        <MessageCircle className="h-4 w-4 mr-2" />
                        WhatsApp
                      </Button>
                      <Link href={`/propiedades/${property.id}`} className="flex-1">
                        <Button
                          variant="outline"
                          className="w-full rounded-xl font-medium py-2 border-[#17313A]/15 dark:border-white/15 bg-[#17313A]/[0.04] dark:bg-white/[0.04] text-[#17313A] dark:text-[#EAE4DD] hover:bg-[#C78F7B]/20 hover:border-[#C78F7B]/30 hover:text-[#C78F7B] transition-all duration-300"
                        >
                          Ver Detalles
                        </Button>
                      </Link>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
