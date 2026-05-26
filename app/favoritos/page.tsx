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
    <div className="min-h-screen bg-conectia-secondary">
      {/* Hero Section */}
      <section className="pt-24 pb-12 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center px-4 py-2 bg-red-50 border border-red-200 rounded-full text-sm font-medium text-red-600 mb-6">
              <Heart className="h-4 w-4 text-red-500 mr-2 fill-current" />
              Mis Propiedades Favoritas
            </div>
            <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-light text-conectia-graphite mb-6 leading-tight">
              Tus Favoritos
            </h1>
            <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto">
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
              <div className="w-24 h-24 bg-conectia-secondary rounded-full flex items-center justify-center mx-auto mb-6">
                <Heart className="h-12 w-12 text-gray-400" />
              </div>
              <h3 className="font-serif text-2xl font-semibold text-gray-900 mb-4">
                No tienes favoritos aún
              </h3>
              <p className="text-gray-600 mb-8 max-w-md mx-auto">
                Explora nuestras propiedades y agrega las que más te gusten a tu lista de favoritos
              </p>
              <Link href="/propiedades">
                <Button className="bg-gradient-to-r from-conectia-gold to-yellow-400 hover:from-conectia-gold/90 hover:to-yellow-400/90 text-conectia-graphite font-semibold px-8 py-3 rounded-2xl shadow-lg">
                  Explorar Propiedades
                </Button>
              </Link>
            </div>
          ) : (
            /* Properties Grid */
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {wishlist.map((property) => (
                <Card key={property.id} className="group overflow-hidden rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 hover:scale-[1.02] bg-conectia-secondary/50">
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
                    <h3 className="font-serif text-xl font-semibold text-conectia-graphite mb-2 line-clamp-2">
                      {property.title}
                    </h3>
                    
                    <div className="flex items-center text-gray-600 mb-4">
                      <MapPin className="h-4 w-4 mr-1" />
                      <span className="text-sm">{property.location}</span>
                    </div>

                    {/* Property Details */}
                    {(property.bedrooms || property.bathrooms || property.area) && (
                      <div className="flex items-center space-x-4 text-sm text-gray-500 mb-4">
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
                          className="w-full rounded-xl font-medium py-2 border-conectia-accent bg-conectia-secondary/50 text-conectia-accent hover:bg-conectia-gold hover:text-black transition-all duration-300"
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
