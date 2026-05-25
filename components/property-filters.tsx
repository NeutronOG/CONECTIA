"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { 
  Search, 
  MapPin, 
  Home, 
  Bed, 
  Bath, 
  Square, 
  DollarSign, 
  Filter,
  X,
  SlidersHorizontal
} from "lucide-react"

interface PropertyFiltersProps {
  onFiltersChange: (filters: any) => void
  isOpen: boolean
  onToggle: () => void
}

export function PropertyFilters({ onFiltersChange, isOpen, onToggle }: PropertyFiltersProps) {
  const [filters, setFilters] = useState({
    search: "",
    location: "",
    propertyType: "",
    priceRange: [0, 50000000],
    bedrooms: "",
    bathrooms: "",
    areaRange: [0, 1000],
    amenities: [] as string[],
    status: ""
  })

  const propertyTypes = [
    "Penthouse",
    "Villa",
    "Residencia",
    "Departamento",
    "Casa",
    "Condominio",
    "Loft",
    "Edificio",
    "Bodega",
    "Nave Industrial",
    "Terreno (m\u00b2)",
    "Rancho",
    "Hect\u00e1reas",
    "Local Comercial",
    "Oficina",
    "Hospital",
    "Cl\u00ednica"
  ]

  const locations = [
    "Polanco, CDMX",
    "Santa Fe, CDMX",
    "Roma Norte, CDMX",
    "Condesa, CDMX",
    "Las Lomas, CDMX",
    "Interlomas, Estado de México",
    "León, Guanajuato"
  ]

  const amenities = [
    "Alberca",
    "Gimnasio",
    "Área de juegos infantiles",
    "Roof garden",
    "Asadores",
    "Salón de eventos",
    "Coworking",
    "Seguridad / vigilancia",
    "Estacionamiento",
    "Elevadores",
    "Áreas verdes",
    "Pet park",
    "Cancha deportiva",
    "Guardería",
    "Terraza",
    "Acceso controlado",
    "Cámaras de vigilancia",
    "WIFI en áreas comunes",
    "Cafetería"
  ]

  const handleFilterChange = (key: string, value: any) => {
    const newFilters = { ...filters, [key]: value }
    setFilters(newFilters)
    onFiltersChange(newFilters)
  }

  const handleAmenityToggle = (amenity: string) => {
    const newAmenities = filters.amenities.includes(amenity)
      ? filters.amenities.filter(a => a !== amenity)
      : [...filters.amenities, amenity]
    
    handleFilterChange("amenities", newAmenities)
  }

  const clearFilters = () => {
    const clearedFilters = {
      search: "",
      location: "",
      propertyType: "",
      priceRange: [0, 50000000],
      bedrooms: "",
      bathrooms: "",
      areaRange: [0, 1000],
      amenities: [],
      status: ""
    }
    setFilters(clearedFilters)
    onFiltersChange(clearedFilters)
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price)
  }

  return (
    <>
      {/* Mobile Filter Toggle */}
      <div className="lg:hidden mb-6">
        <Button
          onClick={onToggle}
          variant="outline"
          className="w-full border-conectia-gold/20 hover:border-conectia-gold hover:bg-conectia-gold/5"
        >
          <SlidersHorizontal className="h-4 w-4 mr-2" />
          Filtros Avanzados
          {(filters.search || filters.location || filters.propertyType || filters.amenities.length > 0) && (
            <Badge className="ml-2 bg-conectia-gold text-black text-xs">
              Activos
            </Badge>
          )}
        </Button>
      </div>

      {/* Filter Panel */}
      <div className={`${isOpen ? 'block' : 'hidden'} lg:block`}>
        <Card className="border-conectia-gold/20 shadow-lg">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl font-serif text-gray-900">
                Filtros de Búsqueda
              </CardTitle>
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                  className="text-gray-500 hover:text-conectia-gold"
                >
                  Limpiar
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onToggle}
                  className="lg:hidden"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Search */}
            <div className="space-y-2">
              <Label htmlFor="search" className="text-sm font-medium text-gray-700">
                Búsqueda General
              </Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="search"
                  placeholder="Buscar por nombre, ubicación, características..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange("search", e.target.value)}
                  className="pl-10 border-gray-200 focus:border-conectia-gold focus:ring-conectia-gold/20"
                />
              </div>
            </div>

            {/* Location */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">
                <MapPin className="inline h-4 w-4 mr-1" />
                Ubicación
              </Label>
              <Select value={filters.location} onValueChange={(value) => handleFilterChange("location", value)}>
                <SelectTrigger className="border-gray-200 focus:border-conectia-gold">
                  <SelectValue placeholder="Selecciona una ubicación" />
                </SelectTrigger>
                <SelectContent>
                  {locations.map((location) => (
                    <SelectItem key={location} value={location}>
                      {location}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Property Type */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">
                <Home className="inline h-4 w-4 mr-1" />
                Tipo de Propiedad
              </Label>
              <Select value={filters.propertyType} onValueChange={(value) => handleFilterChange("propertyType", value)}>
                <SelectTrigger className="border-gray-200 focus:border-conectia-gold">
                  <SelectValue placeholder="Selecciona el tipo" />
                </SelectTrigger>
                <SelectContent>
                  {propertyTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Price Range */}
            <div className="space-y-3">
              <Label className="text-sm font-medium text-gray-700">
                <DollarSign className="inline h-4 w-4 mr-1" />
                Rango de Precio
              </Label>
              <div className="px-2">
                <Slider
                  value={filters.priceRange}
                  onValueChange={(value) => handleFilterChange("priceRange", value)}
                  max={50000000}
                  min={0}
                  step={500000}
                  className="w-full"
                />
              </div>
              <div className="flex justify-between text-sm text-gray-600">
                <span>{formatPrice(filters.priceRange[0])}</span>
                <span>{formatPrice(filters.priceRange[1])}</span>
              </div>
            </div>

            {/* Bedrooms & Bathrooms */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">
                  <Bed className="inline h-4 w-4 mr-1" />
                  Habitaciones
                </Label>
                <Select value={filters.bedrooms} onValueChange={(value) => handleFilterChange("bedrooms", value)}>
                  <SelectTrigger className="border-gray-200 focus:border-conectia-gold">
                    <SelectValue placeholder="Cualquiera" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1+</SelectItem>
                    <SelectItem value="2">2+</SelectItem>
                    <SelectItem value="3">3+</SelectItem>
                    <SelectItem value="4">4+</SelectItem>
                    <SelectItem value="5">5+</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">
                  <Bath className="inline h-4 w-4 mr-1" />
                  Baños
                </Label>
                <Select value={filters.bathrooms} onValueChange={(value) => handleFilterChange("bathrooms", value)}>
                  <SelectTrigger className="border-gray-200 focus:border-conectia-gold">
                    <SelectValue placeholder="Cualquiera" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1+</SelectItem>
                    <SelectItem value="2">2+</SelectItem>
                    <SelectItem value="3">3+</SelectItem>
                    <SelectItem value="4">4+</SelectItem>
                    <SelectItem value="5">5+</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Area Range */}
            <div className="space-y-3">
              <Label className="text-sm font-medium text-gray-700">
                <Square className="inline h-4 w-4 mr-1" />
                Área (m²)
              </Label>
              <div className="px-2">
                <Slider
                  value={filters.areaRange}
                  onValueChange={(value) => handleFilterChange("areaRange", value)}
                  max={1000}
                  min={0}
                  step={50}
                  className="w-full"
                />
              </div>
              <div className="flex justify-between text-sm text-gray-600">
                <span>{filters.areaRange[0]} m²</span>
                <span>{filters.areaRange[1]} m²</span>
              </div>
            </div>

            {/* Status */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">Estado</Label>
              <Select value={filters.status} onValueChange={(value) => handleFilterChange("status", value)}>
                <SelectTrigger className="border-gray-200 focus:border-conectia-gold">
                  <SelectValue placeholder="Todos los estados" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Disponible">Disponible</SelectItem>
                  <SelectItem value="Exclusiva">Exclusiva</SelectItem>
                  <SelectItem value="Reservada">Reservada</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Amenities */}
            <div className="space-y-3">
              <Label className="text-sm font-medium text-gray-700">Amenidades</Label>
              <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto">
                {amenities.map((amenity) => (
                  <div key={amenity} className="flex items-center space-x-2">
                    <Checkbox
                      id={amenity}
                      checked={filters.amenities.includes(amenity)}
                      onCheckedChange={() => handleAmenityToggle(amenity)}
                      className="border-gray-300 data-[state=checked]:bg-conectia-gold data-[state=checked]:border-conectia-gold"
                    />
                    <Label
                      htmlFor={amenity}
                      className="text-sm text-gray-700 cursor-pointer"
                    >
                      {amenity}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Active Filters */}
            {(filters.search || filters.location || filters.propertyType || filters.amenities.length > 0) && (
              <div className="pt-4 border-t border-gray-200">
                <Label className="text-sm font-medium text-gray-700 mb-2 block">
                  Filtros Activos
                </Label>
                <div className="flex flex-wrap gap-2">
                  {filters.search && (
                    <Badge variant="secondary" className="bg-conectia-gold/10 text-conectia-gold border-conectia-gold/20">
                      Búsqueda: {filters.search}
                      <X 
                        className="h-3 w-3 ml-1 cursor-pointer" 
                        onClick={() => handleFilterChange("search", "")}
                      />
                    </Badge>
                  )}
                  {filters.location && (
                    <Badge variant="secondary" className="bg-conectia-gold/10 text-conectia-gold border-conectia-gold/20">
                      {filters.location}
                      <X 
                        className="h-3 w-3 ml-1 cursor-pointer" 
                        onClick={() => handleFilterChange("location", "")}
                      />
                    </Badge>
                  )}
                  {filters.propertyType && (
                    <Badge variant="secondary" className="bg-conectia-gold/10 text-conectia-gold border-conectia-gold/20">
                      {filters.propertyType}
                      <X 
                        className="h-3 w-3 ml-1 cursor-pointer" 
                        onClick={() => handleFilterChange("propertyType", "")}
                      />
                    </Badge>
                  )}
                  {filters.amenities.map((amenity) => (
                    <Badge key={amenity} variant="secondary" className="bg-conectia-gold/10 text-conectia-gold border-conectia-gold/20">
                      {amenity}
                      <X 
                        className="h-3 w-3 ml-1 cursor-pointer" 
                        onClick={() => handleAmenityToggle(amenity)}
                      />
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  )
}
