"use client"

import { useState } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Checkbox } from "@/components/ui/checkbox"
import { MagnifyingGlass, MapPin, House, Bed, Bathtub, ArrowsOut, CurrencyDollar, Faders, X } from "@phosphor-icons/react"

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
      <div className="lg:hidden mb-4">
        <button
          onClick={onToggle}
          className="w-full flex items-center justify-between px-5 py-3 rounded-2xl text-sm font-semibold text-[#EAE4DD] transition-all"
          style={{ background: 'rgba(234,228,221,0.10)', border: '1px solid rgba(234,228,221,0.18)', backdropFilter: 'blur(16px)' }}
        >
          <span className="flex items-center gap-2">
            <Faders className="h-4 w-4 text-[#C78F7B]" weight="duotone" />
            Filtros Avanzados
          </span>
          {(filters.search || filters.location || filters.propertyType || filters.amenities.length > 0) && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#C78F7B] text-white">Activos</span>
          )}
        </button>
      </div>

      {/* Filter Panel */}
      <div className={`${isOpen ? 'block' : 'hidden'} lg:block`}>
        <div className="rounded-2xl overflow-hidden"
          style={{
            background: 'linear-gradient(160deg, rgba(234,228,221,0.11) 0%, rgba(23,49,58,0.30) 100%)',
            backdropFilter: 'blur(28px) saturate(160%)',
            WebkitBackdropFilter: 'blur(28px) saturate(160%)',
            border: '1px solid rgba(234,228,221,0.18)',
            borderTopColor: 'rgba(255,255,255,0.22)',
            boxShadow: '0 2px 0 rgba(255,255,255,0.08) inset, 0 20px 60px rgba(23,49,58,0.30)',
          }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid rgba(234,228,221,0.12)' }}>
            <div className="flex items-center gap-2">
              <Faders className="h-4 w-4 text-[#C78F7B]" weight="duotone" />
              <span className="text-sm font-semibold text-[#EAE4DD] tracking-wide">Filtros de Búsqueda</span>
            </div>
            <button
              onClick={clearFilters}
              className="text-[10px] uppercase tracking-widest text-[#B0ACA6] hover:text-[#C78F7B] transition-colors font-medium"
            >
              Limpiar
            </button>
          </div>

          <div className="p-5 space-y-5">
            {/* Search */}
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest font-semibold text-[#C78F7B]">Búsqueda General</label>
              <div className="relative">
                <MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#B0ACA6]" weight="duotone" />
                <input
                  placeholder="Nombre, ubicación, características..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange("search", e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 text-sm text-[#EAE4DD] placeholder-[#B0ACA6]/60 rounded-xl outline-none transition-all"
                  style={{ background: 'rgba(234,228,221,0.08)', border: '1px solid rgba(234,228,221,0.15)' }}
                />
              </div>
            </div>

            {/* Location */}
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest font-semibold text-[#C78F7B] flex items-center gap-1">
                <MapPin className="h-3 w-3" weight="duotone" /> Ubicación
              </label>
              <Select value={filters.location} onValueChange={(v) => handleFilterChange("location", v)}>
                <SelectTrigger className="text-sm text-[#EAE4DD] rounded-xl border-0 outline-none"
                  style={{ background: 'rgba(234,228,221,0.08)', border: '1px solid rgba(234,228,221,0.15)' }}>
                  <SelectValue placeholder="Selecciona ubicación" />
                </SelectTrigger>
                <SelectContent>
                  {locations.map(l => <SelectItem key={l} value={l}>{l}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            {/* Property Type */}
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest font-semibold text-[#C78F7B] flex items-center gap-1">
                <House className="h-3 w-3" weight="duotone" /> Tipo
              </label>
              <Select value={filters.propertyType} onValueChange={(v) => handleFilterChange("propertyType", v)}>
                <SelectTrigger className="text-sm text-[#EAE4DD] rounded-xl"
                  style={{ background: 'rgba(234,228,221,0.08)', border: '1px solid rgba(234,228,221,0.15)' }}>
                  <SelectValue placeholder="Tipo de propiedad" />
                </SelectTrigger>
                <SelectContent>
                  {propertyTypes.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            {/* Price Range */}
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest font-semibold text-[#C78F7B] flex items-center gap-1">
                <CurrencyDollar className="h-3 w-3" weight="duotone" /> Precio
              </label>
              <Slider value={filters.priceRange} onValueChange={(v) => handleFilterChange("priceRange", v)}
                max={50000000} min={0} step={500000} className="w-full" />
              <div className="flex justify-between text-xs text-[#B0ACA6]">
                <span>{formatPrice(filters.priceRange[0])}</span>
                <span>{formatPrice(filters.priceRange[1])}</span>
              </div>
            </div>

            {/* Beds & Baths */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest font-semibold text-[#C78F7B] flex items-center gap-1">
                  <Bed className="h-3 w-3" weight="duotone" /> Recámaras
                </label>
                <Select value={filters.bedrooms} onValueChange={(v) => handleFilterChange("bedrooms", v)}>
                  <SelectTrigger className="text-sm text-[#EAE4DD] rounded-xl"
                    style={{ background: 'rgba(234,228,221,0.08)', border: '1px solid rgba(234,228,221,0.15)' }}>
                    <SelectValue placeholder="Cualq." />
                  </SelectTrigger>
                  <SelectContent>
                    {['1','2','3','4','5'].map(n => <SelectItem key={n} value={n}>{n}+</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest font-semibold text-[#C78F7B] flex items-center gap-1">
                  <Bathtub className="h-3 w-3" weight="duotone" /> Baños
                </label>
                <Select value={filters.bathrooms} onValueChange={(v) => handleFilterChange("bathrooms", v)}>
                  <SelectTrigger className="text-sm text-[#EAE4DD] rounded-xl"
                    style={{ background: 'rgba(234,228,221,0.08)', border: '1px solid rgba(234,228,221,0.15)' }}>
                    <SelectValue placeholder="Cualq." />
                  </SelectTrigger>
                  <SelectContent>
                    {['1','2','3','4','5'].map(n => <SelectItem key={n} value={n}>{n}+</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Area */}
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest font-semibold text-[#C78F7B] flex items-center gap-1">
                <ArrowsOut className="h-3 w-3" weight="duotone" /> Área (m²)
              </label>
              <Slider value={filters.areaRange} onValueChange={(v) => handleFilterChange("areaRange", v)}
                max={1000} min={0} step={50} className="w-full" />
              <div className="flex justify-between text-xs text-[#B0ACA6]">
                <span>{filters.areaRange[0]} m²</span>
                <span>{filters.areaRange[1]} m²</span>
              </div>
            </div>

            {/* Status */}
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest font-semibold text-[#C78F7B]">Estado</label>
              <Select value={filters.status} onValueChange={(v) => handleFilterChange("status", v)}>
                <SelectTrigger className="text-sm text-[#EAE4DD] rounded-xl"
                  style={{ background: 'rgba(234,228,221,0.08)', border: '1px solid rgba(234,228,221,0.15)' }}>
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Disponible">Disponible</SelectItem>
                  <SelectItem value="Exclusiva">Exclusiva</SelectItem>
                  <SelectItem value="Reservada">Reservada</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Amenities */}
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest font-semibold text-[#C78F7B]">Amenidades</label>
              <div className="grid grid-cols-1 gap-1.5 max-h-44 overflow-y-auto pr-1 scrollbar-thin">
                {amenities.map((amenity) => (
                  <div key={amenity} className="flex items-center gap-2 py-1">
                    <Checkbox
                      id={amenity}
                      checked={filters.amenities.includes(amenity)}
                      onCheckedChange={() => handleAmenityToggle(amenity)}
                      className="border-[#B0ACA6]/40 data-[state=checked]:bg-[#C78F7B] data-[state=checked]:border-[#C78F7B]"
                    />
                    <label htmlFor={amenity} className="text-xs text-[#B0ACA6] hover:text-[#EAE4DD] cursor-pointer transition-colors">{amenity}</label>
                  </div>
                ))}
              </div>
            </div>

            {/* Active Filters */}
            {(filters.search || filters.location || filters.propertyType || filters.amenities.length > 0) && (
              <div className="pt-3" style={{ borderTop: '1px solid rgba(234,228,221,0.12)' }}>
                <p className="text-[10px] uppercase tracking-widest font-semibold text-[#C78F7B] mb-2">Activos</p>
                <div className="flex flex-wrap gap-1.5">
                  {filters.search && (
                    <span className="flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-medium text-[#EAE4DD]"
                      style={{ background: 'rgba(199,143,123,0.20)', border: '1px solid rgba(199,143,123,0.35)' }}>
                      {filters.search}
                      <X className="h-2.5 w-2.5 cursor-pointer" onClick={() => handleFilterChange("search", "")} />
                    </span>
                  )}
                  {filters.location && (
                    <span className="flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-medium text-[#EAE4DD]"
                      style={{ background: 'rgba(199,143,123,0.20)', border: '1px solid rgba(199,143,123,0.35)' }}>
                      {filters.location}
                      <X className="h-2.5 w-2.5 cursor-pointer" onClick={() => handleFilterChange("location", "")} />
                    </span>
                  )}
                  {filters.propertyType && (
                    <span className="flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-medium text-[#EAE4DD]"
                      style={{ background: 'rgba(199,143,123,0.20)', border: '1px solid rgba(199,143,123,0.35)' }}>
                      {filters.propertyType}
                      <X className="h-2.5 w-2.5 cursor-pointer" onClick={() => handleFilterChange("propertyType", "")} />
                    </span>
                  )}
                  {filters.amenities.map((amenity) => (
                    <span key={amenity} className="flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-medium text-[#EAE4DD]"
                      style={{ background: 'rgba(199,143,123,0.20)', border: '1px solid rgba(199,143,123,0.35)' }}>
                      {amenity}
                      <X className="h-2.5 w-2.5 cursor-pointer" onClick={() => handleAmenityToggle(amenity)} />
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
