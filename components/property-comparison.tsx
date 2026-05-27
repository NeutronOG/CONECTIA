"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  X, 
  Heart, 
  Share2, 
  MapPin, 
  Bed, 
  Bath, 
  Square, 
  Calendar,
  TrendingUp,
  Eye,
  ArrowRight
} from "lucide-react"
import Link from "next/link"

interface Property {
  id: number
  titulo: string
  ubicacion: string
  precio: number
  precioTexto: string
  tipo: string
  habitaciones: number
  banos: number
  area: number
  areaTexto: string
  imagen: string
  descripcion: string
  caracteristicas: string[]
  status: string
}

interface PropertyComparisonProps {
  properties: Property[]
  onRemoveProperty: (id: number) => void
  onToggleFavorite: (id: number) => void
  favorites: number[]
}

export function PropertyComparison({ 
  properties, 
  onRemoveProperty, 
  onToggleFavorite, 
  favorites 
}: PropertyComparisonProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  if (properties.length === 0) {
    return null
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price)
  }

  const getPricePerSqm = (price: number, area: number) => {
    return Math.round(price / area)
  }

  const getHighestPrice = () => Math.max(...properties.map(p => p.precio))
  const getLowestPrice = () => Math.min(...properties.map(p => p.precio))
  const getLargestArea = () => Math.max(...properties.map(p => p.area))

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-conectia-secondary/50 border-t border-gray-200 shadow-2xl">
      {/* Collapsed Header */}
      <div 
        className="px-6 py-4 cursor-pointer hover:bg-conectia-secondary/70 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-conectia-gold rounded-full flex items-center justify-center">
                <TrendingUp className="h-4 w-4 text-[#17313A]" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">
                  Comparar Propiedades ({properties.length})
                </h3>
                <p className="text-sm text-gray-600">
                  Haz clic para ver comparación detallada
                </p>
              </div>
            </div>
            
            {/* Property Thumbnails */}
            <div className="flex space-x-2">
              {properties.slice(0, 3).map((property) => (
                <div key={property.id} className="relative">
                  <img
                    src={property.imagen || "/placeholder.svg"}
                    alt={property.titulo}
                    className="w-12 h-12 rounded-lg object-cover"
                  />
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      onRemoveProperty(property.id)
                    }}
                    className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
              {properties.length > 3 && (
                <div className="w-12 h-12 bg-conectia-secondary rounded-lg flex items-center justify-center text-sm font-medium text-gray-600">
                  +{properties.length - 3}
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <Button
              variant="outline"
              size="sm"
              className="border-conectia-gold text-conectia-gold hover:bg-conectia-gold hover:text-[#17313A]"
            >
              <Share2 className="h-4 w-4 mr-2" />
              Compartir
            </Button>
            <Button
              size="sm"
              className="bg-[#C78F7B] hover:bg-[#D4987E] text-[#17313A]"
            >
              Ver Comparación
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </div>
      </div>

      {/* Expanded Comparison */}
      {isExpanded && (
        <div className="border-t border-gray-200 bg-conectia-secondary/70 max-h-96 overflow-y-auto">
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {properties.map((property) => (
                <Card key={property.id} className="relative overflow-hidden">
                  {/* Remove Button */}
                  <button
                    onClick={() => onRemoveProperty(property.id)}
                    className="absolute top-3 right-3 z-10 w-8 h-8 bg-conectia-secondary/50/90 hover:bg-conectia-secondary/50 rounded-full flex items-center justify-center shadow-sm"
                  >
                    <X className="h-4 w-4 text-gray-600" />
                  </button>

                  {/* Property Image */}
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={property.imagen || "/placeholder.svg"}
                      alt={property.titulo}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-3 left-3">
                      <Badge
                        className={`${
                          property.status === "Disponible"
                            ? "bg-green-500/90 text-white"
                            : property.status === "Exclusiva"
                              ? "bg-conectia-gold/90 text-[#17313A]"
                              : "bg-red-500/90 text-white"
                        } backdrop-blur-sm`}
                      >
                        {property.status}
                      </Badge>
                    </div>
                  </div>

                  <CardContent className="p-4">
                    {/* Price Comparison Indicators */}
                    <div className="flex items-center justify-between mb-3">
                      <Badge className="bg-conectia-secondary text-gray-700 text-xs">
                        {property.tipo}
                      </Badge>
                      <div className="flex items-center space-x-1">
                        <span className="text-lg font-bold text-conectia-gold">
                          {property.precioTexto}
                        </span>
                        {property.precio === getHighestPrice() && (
                          <Badge className="bg-red-100 text-red-700 text-xs">
                            Más caro
                          </Badge>
                        )}
                        {property.precio === getLowestPrice() && (
                          <Badge className="bg-green-100 text-green-700 text-xs">
                            Mejor precio
                          </Badge>
                        )}
                      </div>
                    </div>

                    <h3 className="font-semibold text-gray-900 mb-2 line-clamp-1 uppercase">
                      {property.titulo}
                    </h3>

                    <div className="flex items-center text-gray-600 mb-3">
                      <MapPin className="h-4 w-4 mr-1" />
                      <span className="text-sm">{property.ubicacion}</span>
                    </div>

                    {/* Comparison Metrics */}
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center">
                          <Bed className="h-4 w-4 mr-1 text-gray-400" />
                          <span>{property.habitaciones} hab</span>
                        </div>
                        <div className="flex items-center">
                          <Bath className="h-4 w-4 mr-1 text-gray-400" />
                          <span>{property.banos} baños</span>
                        </div>
                        <div className="flex items-center">
                          <Square className="h-4 w-4 mr-1 text-gray-400" />
                          <span>{property.area} m²</span>
                          {property.area === getLargestArea() && (
                            <Badge className="ml-1 bg-blue-100 text-blue-700 text-xs">
                              Más grande
                            </Badge>
                          )}
                        </div>
                      </div>

                      <div className="text-sm text-gray-600">
                        <span className="font-medium">Precio por m²:</span>{" "}
                        {formatPrice(getPricePerSqm(property.precio, property.area))}
                      </div>
                    </div>

                    {/* Key Features */}
                    <div className="mb-4">
                      <div className="flex flex-wrap gap-1">
                        {property.caracteristicas.slice(0, 2).map((caracteristica, index) => (
                          <Badge key={index} className="bg-conectia-secondary/70 text-gray-600 text-xs border-0">
                            {caracteristica}
                          </Badge>
                        ))}
                        {property.caracteristicas.length > 2 && (
                          <Badge className="bg-conectia-gold/10 text-conectia-gold text-xs border-0">
                            +{property.caracteristicas.length - 2}
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onToggleFavorite(property.id)}
                        className={`flex-1 ${
                          favorites.includes(property.id)
                            ? 'border-red-300 text-red-600 hover:bg-red-50'
                            : 'border-gray-200 hover:border-conectia-gold hover:text-conectia-gold'
                        }`}
                      >
                        <Heart className={`h-4 w-4 mr-1 ${
                          favorites.includes(property.id) ? 'fill-current' : ''
                        }`} />
                        {favorites.includes(property.id) ? 'Guardado' : 'Guardar'}
                      </Button>
                      <Link href={`/propiedades/${property.id}`}>
                        <Button
                          size="sm"
                          className="bg-[#C78F7B] hover:bg-[#D4987E] text-[#17313A]"
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          Ver
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Comparison Summary */}
            <div className="mt-6 p-4 bg-conectia-secondary/50 rounded-lg border border-gray-200">
              <h4 className="font-semibold text-gray-900 mb-3">Resumen de Comparación</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Rango de precios:</span>
                  <div className="font-medium">
                    {formatPrice(getLowestPrice())} - {formatPrice(getHighestPrice())}
                  </div>
                </div>
                <div>
                  <span className="text-gray-600">Área promedio:</span>
                  <div className="font-medium">
                    {Math.round(properties.reduce((sum, p) => sum + p.area, 0) / properties.length)} m²
                  </div>
                </div>
                <div>
                  <span className="text-gray-600">Precio promedio por m²:</span>
                  <div className="font-medium">
                    {formatPrice(
                      Math.round(
                        properties.reduce((sum, p) => sum + getPricePerSqm(p.precio, p.area), 0) / 
                        properties.length
                      )
                    )}
                  </div>
                </div>
                <div>
                  <span className="text-gray-600">Tipos de propiedad:</span>
                  <div className="font-medium">
                    {Array.from(new Set(properties.map(p => p.tipo))).join(", ")}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
