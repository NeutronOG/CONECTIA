"use client"

import { useState, useMemo, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { PropertyFilters } from "@/components/property-filters"
import { AISearchChat } from "@/components/ai-search-chat"
import { MapPin, Bed, Bath, Square, Eye, Calendar, Grid, List, Map, Search, Sparkles, MessageSquare, RefreshCw, Building } from "lucide-react"
import Link from "next/link"
import { WishlistButton } from "@/components/wishlist-button"
import { Propiedad } from "@/data/propiedades"
import { usePropertiesStatic } from "@/hooks/use-properties-static"
import { useAuth } from "@/contexts/auth-context"

export default function PropiedadesPage() {
  const { user, isAuthenticated } = useAuth()
  // Hook con datos estáticos + realtime - carga instantánea
  const { properties: propiedades, isLoading, refresh, realtimeCount } = usePropertiesStatic()
  
  const [filters, setFilters] = useState<any>({})
  const [isFiltersOpen, setIsFiltersOpen] = useState(false)
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'map'>('grid')
  const [sortBy, setSortBy] = useState('fecha-desc')
  const [isAIChatOpen, setIsAIChatOpen] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const PAGE_SIZE = 12

  // El hook usePropertiesStatic ya maneja realtime automáticamente


  // Filter and sort properties
  const filteredAndSortedProperties = useMemo(() => {
    // En la página pública de propiedades, mostrar TODAS las propiedades
    // Los asesores ven sus propiedades en /panel-asesor/propiedades
    const base = propiedades

    let filtered = base.filter(propiedad => {
      // Search filter
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase()
        const searchableText = `${propiedad.titulo} ${propiedad.ubicacion} ${propiedad.descripcion} ${propiedad.caracteristicas.join(' ')}`.toLowerCase()
        if (!searchableText.includes(searchTerm)) return false
      }

      // Location filter
      if (filters.location && propiedad.ubicacion !== filters.location) return false

      // Property type filter
      if (filters.propertyType && propiedad.tipo !== filters.propertyType) return false

      // Price range filter
      if (filters.priceRange) {
        if (propiedad.precio < filters.priceRange[0] || propiedad.precio > filters.priceRange[1]) return false
      }

      // Bedrooms filter
      if (filters.bedrooms && propiedad.habitaciones < parseInt(filters.bedrooms)) return false

      // Bathrooms filter
      if (filters.bathrooms && propiedad.banos < parseInt(filters.bathrooms)) return false

      // Area range filter
      if (filters.areaRange) {
        if (propiedad.area < filters.areaRange[0] || propiedad.area > filters.areaRange[1]) return false
      }

      // Status filter
      if (filters.status && propiedad.status !== filters.status) return false

      // Amenities filter
      if (filters.amenities && filters.amenities.length > 0) {
        const hasAllAmenities = filters.amenities.every((amenity: string) =>
          propiedad.caracteristicas.some(caracteristica =>
            caracteristica.toLowerCase().includes(amenity.toLowerCase())
          )
        )
        if (!hasAllAmenities) return false
      }

      return true
    })

    // Sort properties
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'precio-asc':
          return a.precio - b.precio
        case 'precio-desc':
          return b.precio - a.precio
        case 'area-asc':
          return a.area - b.area
        case 'area-desc':
          return b.area - a.area
        case 'fecha-desc':
          return new Date(b.fechaPublicacion).getTime() - new Date(a.fechaPublicacion).getTime()
        case 'fecha-asc':
          return new Date(a.fechaPublicacion).getTime() - new Date(b.fechaPublicacion).getTime()
        default:
          return 0
      }
    })

    return filtered
  }, [propiedades, filters, sortBy])

  const totalPages = Math.ceil(filteredAndSortedProperties.length / PAGE_SIZE)
  const paginatedProperties = filteredAndSortedProperties.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  )

  const handleFiltersChange = (newFilters: any) => {
    setFilters(newFilters)
    setCurrentPage(1)
  }

  const handleSortChange = (value: string) => {
    setSortBy(value)
    setCurrentPage(1)
  }

  return (
    <div className="min-h-screen bg-[#0F2027] transition-colors duration-500 relative overflow-hidden">
      {/* Glow orbs */}
      <div className="fixed top-0 left-1/4 w-[500px] h-[500px] bg-[#C78F7B]/5 rounded-full blur-[150px] pointer-events-none" />
      <div className="fixed bottom-0 right-1/4 w-[400px] h-[400px] bg-[#17313A]/60 rounded-full blur-[120px] pointer-events-none" />

      {/* Hero Section */}
      <section className="relative overflow-hidden min-h-[320px] sm:min-h-[400px] pt-16">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat scale-105"
          style={{ backgroundImage: "url('/fondoconectia.jpg')" }}
        />
        <div className="absolute inset-0 bg-[#0F2027]/80" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0F2027] via-[#0F2027]/70 to-transparent" />
        <div className="absolute top-20 right-20 w-72 h-72 bg-[#C78F7B]/10 rounded-full blur-[100px] pointer-events-none" />

        <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-10 py-12 sm:py-20 flex items-center">
          <div className="max-w-xl">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-2xl flex items-center justify-center"
                style={{ background: 'rgba(199,143,123,0.20)', border: '1px solid rgba(199,143,123,0.35)', backdropFilter: 'blur(12px)' }}>
                <Building className="h-5 w-5 text-[#C78F7B]" />
              </div>
              <span className="text-[#C78F7B] text-[10px] font-semibold uppercase tracking-[0.35em]">CONECTIA</span>
            </div>
            <h1 className="font-titles text-5xl sm:text-6xl md:text-7xl font-black text-white leading-[0.95] mb-2">
              Propiedades
            </h1>
            <h2 className="font-titles text-4xl sm:text-5xl md:text-6xl font-light italic bg-gradient-to-r from-[#C78F7B] to-[#E8A88F] bg-clip-text text-transparent leading-tight mb-5">
              Exclusivas
            </h2>
            <p className="text-[#B0ACA6] text-base sm:text-lg mb-7 leading-relaxed max-w-md">
              Descubre nuestra selección de propiedades únicas y exclusivas
            </p>
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium text-[#EAE4DD] bg-white/[0.05] border border-white/15 backdrop-blur-md">
              {isLoading ? 'Cargando...' : `${filteredAndSortedProperties.length} de ${propiedades.length} Propiedades`}
            </span>
          </div>
        </div>
      </section>

      {/* Properties Section */}
      <section className="py-8 sm:py-16 px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 sm:gap-8">
            {/* Filters Sidebar */}
            <div className="lg:col-span-1 space-y-4 sm:space-y-6">
              <PropertyFilters
                onFiltersChange={handleFiltersChange}
                isOpen={isFiltersOpen}
                onToggle={() => setIsFiltersOpen(!isFiltersOpen)}
              />

              {/* AI Search Button */}
              <div className="relative bg-white/[0.03] backdrop-blur-md border border-white/10 rounded-2xl p-4 sm:p-6 overflow-hidden">
                <div className="absolute -top-10 -right-10 w-24 h-24 bg-[#C78F7B]/10 rounded-full blur-[30px] pointer-events-none" />
                <div className="relative text-center space-y-3 sm:space-y-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-[#C78F7B]/20 rounded-xl flex items-center justify-center mx-auto">
                    <Sparkles className="h-5 w-5 sm:h-6 sm:w-6 text-[#C78F7B]" />
                  </div>
                  <div>
                    <h3 className="font-serif text-base sm:text-lg font-semibold text-white mb-1.5 sm:mb-2">
                      Búsqueda con IA
                    </h3>
                    <p className="text-xs sm:text-sm text-[#B0ACA6] leading-relaxed">
                      Describe la propiedad que buscas y nuestro asistente inteligente te ayudará a encontrarla
                    </p>
                  </div>
                  <Button
                    onClick={() => setIsAIChatOpen(true)}
                    className="w-full bg-[#C78F7B] hover:bg-[#D4987E] text-[#0F2027] font-bold rounded-xl shadow-lg shadow-[#C78F7B]/20 transition-all duration-300 text-sm"
                  >
                    <MessageSquare className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-2" />
                    Iniciar Chat IA
                  </Button>
                  <div className="flex items-center justify-center space-x-1.5 sm:space-x-2 text-[10px] sm:text-xs text-[#4A4F57]">
                    <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-[#C78F7B] rounded-full animate-pulse"></div>
                    <span>Asistente disponible 24/7</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Properties Content */}
            <div className="lg:col-span-3">
              {/* Toolbar */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4 mb-6 sm:mb-8">
                <div className="flex items-center space-x-4">
                  <h2 className="text-lg sm:text-xl md:text-2xl font-serif font-bold text-white">
                    {filteredAndSortedProperties.length} <span className="text-[#C78F7B]">Propiedades</span>
                  </h2>
                </div>

                <div className="flex items-center space-x-2 sm:space-x-4 w-full sm:w-auto">
                  {/* Sort Dropdown */}
                  <Select value={sortBy} onValueChange={handleSortChange}>
                    <SelectTrigger className="w-full sm:w-48 bg-white/5 border-white/15 text-[#EAE4DD] focus:border-[#C78F7B] rounded-xl text-sm">
                      <SelectValue placeholder="Ordenar por" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#17313A] border-white/15 text-white">
                      <SelectItem value="precio-desc" className="focus:bg-[#C78F7B]/20 focus:text-[#C78F7B]">Precio: Mayor a menor</SelectItem>
                      <SelectItem value="precio-asc" className="focus:bg-[#C78F7B]/20 focus:text-[#C78F7B]">Precio: Menor a mayor</SelectItem>
                      <SelectItem value="area-desc" className="focus:bg-[#C78F7B]/20 focus:text-[#C78F7B]">Área: Mayor a menor</SelectItem>
                      <SelectItem value="area-asc" className="focus:bg-[#C78F7B]/20 focus:text-[#C78F7B]">Área: Menor a mayor</SelectItem>
                      <SelectItem value="fecha-desc" className="focus:bg-[#C78F7B]/20 focus:text-[#C78F7B]">Más recientes</SelectItem>
                      <SelectItem value="fecha-asc" className="focus:bg-[#C78F7B]/20 focus:text-[#C78F7B]">Más antiguos</SelectItem>
                    </SelectContent>
                  </Select>

                  {/* View Mode Toggle */}
                  <div className="hidden sm:flex bg-white/[0.03] border border-white/15 rounded-xl overflow-hidden p-0.5">
                    <Button
                      variant={viewMode === 'grid' ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => setViewMode('grid')}
                      className={`rounded-lg ${viewMode === 'grid' ? 'bg-[#C78F7B] text-[#0F2027] hover:bg-[#D4987E]' : 'text-[#B0ACA6] hover:text-white hover:bg-white/5'}`}
                    >
                      <Grid className="h-4 w-4" />
                    </Button>
                    <Button
                      variant={viewMode === 'list' ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => setViewMode('list')}
                      className={`rounded-lg ${viewMode === 'list' ? 'bg-[#C78F7B] text-[#0F2027] hover:bg-[#D4987E]' : 'text-[#B0ACA6] hover:text-white hover:bg-white/5'}`}
                    >
                      <List className="h-4 w-4" />
                    </Button>
                    <Button
                      variant={viewMode === 'map' ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => setViewMode('map')}
                      className={`rounded-lg ${viewMode === 'map' ? 'bg-[#C78F7B] text-[#0F2027] hover:bg-[#D4987E]' : 'text-[#B0ACA6] hover:text-white hover:bg-white/5'}`}
                    >
                      <Map className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Properties Grid */}
              {viewMode === 'grid' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
                  {paginatedProperties.map((propiedad) => (
                    <Link href={`/propiedades/${propiedad.id}`} key={propiedad.id} className="group">
                      <div className="relative bg-white/[0.03] backdrop-blur-md border border-white/10 rounded-[28px] shadow-xl hover:shadow-2xl hover:shadow-[#C78F7B]/5 transition-all duration-500 overflow-hidden h-full flex flex-col">
                        <div className="relative h-52 sm:h-60 overflow-hidden">
                          <img src={propiedad.imagen || "/placeholder.svg"} alt={propiedad.titulo} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                          <div className="absolute inset-0 bg-gradient-to-t from-[#0F2027]/60 via-transparent to-transparent" />
                          <div className="absolute top-4 left-4">
                            <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider backdrop-blur-md ${propiedad.status === "Disponible" ? "bg-green-500/80 text-white" : propiedad.status === "Exclusiva" ? "bg-[#C78F7B]/80 text-[#0F2027]" : "bg-red-500/80 text-white"}`}>{propiedad.status}</span>
                          </div>
                          <div className="absolute top-4 right-4"><WishlistButton property={{ id: propiedad.id.toString(), title: propiedad.titulo, price: propiedad.precioTexto, location: propiedad.ubicacion, image: propiedad.imagen, bedrooms: propiedad.habitaciones, bathrooms: propiedad.banos, area: propiedad.areaTexto }} size="sm" /></div>
                          <div className="absolute bottom-4 right-4"><span className="text-xl sm:text-2xl font-black text-white drop-shadow-lg">{propiedad.precioTexto}</span></div>
                        </div>
                        <div className="p-5 sm:p-6 flex-1 flex flex-col">
                          <span className="inline-flex self-start px-2.5 py-1 rounded-lg bg-white/[0.05] border border-white/10 text-[#B0ACA6] text-[10px] font-semibold uppercase tracking-wider mb-2">{propiedad.tipo}</span>
                          <h3 className="text-base sm:text-lg font-serif font-bold text-white mb-2 line-clamp-2 uppercase">{propiedad.titulo}</h3>
                          <div className="flex items-center text-[#B0ACA6] mb-3"><MapPin className="h-3.5 w-3.5 mr-1.5 text-[#C78F7B] flex-shrink-0" /><span className="text-xs sm:text-sm line-clamp-1">{propiedad.ubicacion}</span></div>
                          <p className="text-[#B0ACA6]/80 text-xs sm:text-sm mb-4 line-clamp-2 flex-1">{propiedad.descripcion}</p>
                          <div className="flex items-center gap-4 mb-4 text-xs text-[#4A4F57]">
                            <div className="flex items-center gap-1"><Bed className="h-3.5 w-3.5 text-[#C78F7B]" /><span>{propiedad.habitaciones}</span></div>
                            <div className="flex items-center gap-1"><Bath className="h-3.5 w-3.5 text-[#C78F7B]" /><span>{propiedad.banos}</span></div>
                            <div className="flex items-center gap-1"><Square className="h-3.5 w-3.5 text-[#C78F7B]" /><span>{propiedad.areaTexto}</span></div>
                          </div>
                          <div className="flex flex-wrap gap-2 mb-4">
                            {propiedad.caracteristicas.slice(0, 2).map((c, i) => (<span key={i} className="px-2.5 py-1 rounded-lg bg-white/[0.04] text-[#B0ACA6] text-[10px] font-medium border border-white/[0.08]">{c}</span>))}
                            {propiedad.caracteristicas.length > 2 && (<span className="px-2.5 py-1 rounded-lg bg-[#C78F7B]/10 text-[#C78F7B] text-[10px] font-bold border border-[#C78F7B]/20">+{propiedad.caracteristicas.length - 2}</span>)}
                          </div>
                          <div className="flex gap-3 mt-auto">
                            <Button className="flex-1 bg-[#C78F7B] hover:bg-[#D4987E] text-[#0F2027] rounded-xl text-sm font-bold shadow-lg shadow-[#C78F7B]/20" onClick={(e) => { e.preventDefault(); const mensaje = `¡Hola! 👋 Me interesa agendar una visita para la propiedad:\n\n🏠 *${propiedad.titulo}*\n📍 ${propiedad.ubicacion}\n💰 ${propiedad.precioTexto}\n\n¿Podrían darme más información?`; window.open(`https://wa.me/5214774756951?text=${encodeURIComponent(mensaje)}`, '_blank'); }}><Calendar className="h-3.5 w-3.5 mr-2" />Agendar Visita</Button>
                            <Button variant="outline" className="px-4 bg-white/5 border-white/15 text-white hover:bg-white/10 hover:border-[#C78F7B]/30 rounded-xl text-sm">Ver Detalles</Button>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}

              {/* List View */}
              {viewMode === 'list' && (
                <div className="space-y-5">
                  {paginatedProperties.map((propiedad) => (
                    <Link href={`/propiedades/${propiedad.id}`} key={propiedad.id} className="group block">
                      <div className="relative bg-white/[0.03] backdrop-blur-md border border-white/10 rounded-[24px] shadow-lg hover:shadow-xl hover:shadow-[#C78F7B]/5 transition-all duration-300 overflow-hidden">
                        <div className="flex flex-col md:flex-row">
                          <div className="relative md:w-80 h-56 md:h-48 overflow-hidden">
                            <img src={propiedad.imagen || "/placeholder.svg"} alt={propiedad.titulo} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                            <div className="absolute inset-0 bg-gradient-to-r from-[#0F2027]/40 via-transparent to-transparent" />
                            <div className="absolute top-4 left-4">
                              <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider backdrop-blur-md ${propiedad.status === "Disponible" ? "bg-green-500/80 text-white" : propiedad.status === "Exclusiva" ? "bg-[#C78F7B]/80 text-[#0F2027]" : "bg-red-500/80 text-white"}`}>{propiedad.status}</span>
                            </div>
                          </div>
                          <div className="flex-1 p-5 sm:p-6">
                            <div className="flex flex-col h-full">
                              <div className="flex items-start justify-between mb-3">
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-3 mb-2 flex-wrap">
                                    <span className="px-2.5 py-1 rounded-lg bg-white/[0.05] border border-white/10 text-[#B0ACA6] text-[10px] font-semibold uppercase tracking-wider">{propiedad.tipo}</span>
                                    <span className="text-xl sm:text-2xl font-black text-[#C78F7B]">{propiedad.precioTexto}</span>
                                  </div>
                                  <h3 className="text-lg sm:text-xl font-serif font-bold text-white mb-2 uppercase">{propiedad.titulo}</h3>
                                  <div className="flex items-center text-[#B0ACA6] mb-3"><MapPin className="h-4 w-4 mr-2 text-[#C78F7B]" /><span className="text-sm">{propiedad.ubicacion}</span></div>
                                </div>
                                <div className="flex space-x-2 flex-shrink-0"><WishlistButton property={{ id: propiedad.id.toString(), title: propiedad.titulo, price: propiedad.precioTexto, location: propiedad.ubicacion, image: propiedad.imagen, bedrooms: propiedad.habitaciones, bathrooms: propiedad.banos, area: propiedad.areaTexto }} size="sm" /></div>
                              </div>
                              <p className="text-[#B0ACA6] text-sm mb-4 line-clamp-2 flex-1">{propiedad.descripcion}</p>
                              <div className="flex items-center justify-between mt-auto">
                                <div className="flex items-center gap-5 text-sm text-[#4A4F57]">
                                  <div className="flex items-center gap-1"><Bed className="h-4 w-4 text-[#C78F7B]" /><span>{propiedad.habitaciones} hab</span></div>
                                  <div className="flex items-center gap-1"><Bath className="h-4 w-4 text-[#C78F7B]" /><span>{propiedad.banos} baños</span></div>
                                  <div className="flex items-center gap-1"><Square className="h-4 w-4 text-[#C78F7B]" /><span>{propiedad.areaTexto}</span></div>
                                </div>
                                <div className="flex gap-2">
                                  <Button size="sm" className="bg-[#C78F7B] hover:bg-[#D4987E] text-[#0F2027] rounded-xl font-bold" onClick={(e) => { e.preventDefault(); const mensaje = `¡Hola! 👋 Me interesa agendar una visita para la propiedad:\n\n🏠 *${propiedad.titulo}*\n📍 ${propiedad.ubicacion}\n💰 ${propiedad.precioTexto}\n\n¿Podrían darme más información?`; window.open(`https://wa.me/5214774756951?text=${encodeURIComponent(mensaje)}`, '_blank'); }}><Calendar className="h-4 w-4 mr-2" />Agendar</Button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}

              {/* Map View */}
              {viewMode === 'map' && (
                <div className="bg-white/[0.03] backdrop-blur-md border border-white/10 rounded-[24px] shadow-lg overflow-hidden">
                  <div className="h-96 bg-[#0F2027] flex items-center justify-center">
                    <div className="text-center text-[#B0ACA6]">
                      <Map className="h-16 w-16 mx-auto mb-4 text-[#C78F7B]" />
                      <h3 className="text-lg font-semibold mb-2 text-white">Vista de Mapa</h3>
                      <p>Mapa interactivo con ubicaciones de propiedades</p>
                      <p className="text-sm mt-2 text-[#4A4F57]">Próximamente disponible</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Pagination */}
              {totalPages > 1 && viewMode !== 'map' && (
                <div className="flex items-center justify-center gap-2 mt-10">
                  <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="px-4 py-2 rounded-xl border border-white/15 text-sm font-medium text-[#B0ACA6] disabled:opacity-30 hover:border-[#C78F7B]/40 hover:text-[#C78F7B] transition-colors bg-white/[0.03]">← Anterior</button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).filter(p => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 2).reduce<(number | '...')[]>((acc, p, idx, arr) => { if (idx > 0 && p - (arr[idx - 1] as number) > 1) acc.push('...'); acc.push(p); return acc; }, []).map((item, i) => item === '...' ? (<span key={`ellipsis-${i}`} className="px-2 text-[#4A4F57] text-sm">…</span>) : (<button key={item} onClick={() => setCurrentPage(item as number)} className={`w-9 h-9 rounded-xl text-sm font-semibold transition-colors ${currentPage === item ? 'bg-[#C78F7B] text-[#0F2027]' : 'border border-white/15 text-[#B0ACA6] hover:border-[#C78F7B]/40 hover:text-[#C78F7B] bg-white/[0.03]'}`}>{item}</button>))}
                  <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="px-4 py-2 rounded-xl border border-white/15 text-sm font-medium text-[#B0ACA6] disabled:opacity-30 hover:border-[#C78F7B]/40 hover:text-[#C78F7B] transition-colors bg-white/[0.03]">Siguiente →</button>
                </div>
              )}

              {/* No Results */}
              {filteredAndSortedProperties.length === 0 && (
                <div className="text-center py-16">
                  <div className="text-[#4A4F57] mb-4">
                    <Search className="h-16 w-16 mx-auto mb-4" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">No se encontraron propiedades</h3>
                  <p className="text-[#B0ACA6] mb-6">Intenta ajustar tus filtros de búsqueda</p>
                  <Button onClick={() => setFilters({})} className="bg-[#C78F7B] hover:bg-[#D4987E] text-[#0F2027] font-bold rounded-xl">Limpiar Filtros</Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-[#0F2027] via-[#17313A] to-[#0F2027]" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-[#C78F7B]/8 rounded-full blur-[120px] pointer-events-none" />
        <div className="relative max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-white mb-6">
            ¿Tienes una <span className="bg-gradient-to-r from-[#C78F7B] to-[#E8A88F] bg-clip-text text-transparent">propiedad exclusiva?</span>
          </h2>
          <p className="text-lg sm:text-xl text-[#B0ACA6] mb-8 max-w-2xl mx-auto">
            Únete a nuestro selecto portafolio de propiedades de lujo y accede a compradores exclusivos
          </p>
          <Link href="/propietarios">
            <Button className="bg-[#C78F7B] hover:bg-[#D4987E] text-[#0F2027] px-8 py-4 text-lg font-bold rounded-2xl shadow-xl shadow-[#C78F7B]/20 hover:scale-105 transition-all">
              Registrar mi Propiedad
            </Button>
          </Link>
        </div>
      </section>

      {/* AI Search Chat */}
      <AISearchChat
        isOpen={isAIChatOpen}
        onClose={() => setIsAIChatOpen(false)}
        properties={propiedades}
      />
    </div>
  )
}
