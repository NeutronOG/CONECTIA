"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { uploadImage } from "@/lib/supabase/storage"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { 
  Camera, 
  Video, 
  DollarSign, 
  Home, 
  CheckCircle, 
  Clock, 
  MapPin,
  Banknote,
  PiggyBank,
  LogOut,
  ImageOff,
  Upload,
  Image as ImageIcon,
  AlertCircle,
  XCircle,
  Inbox,
  User,
  Bed,
  Bath,
  Maximize,
  FileText,
  ChevronRight,
  Eye,
  X,
  Loader2,
  Trash2
} from "lucide-react"
import { toast } from 'sonner'

// Configuración de comisiones
const COMISION_CONECTIA = 0.02
const COMISION_FOTOGRAFO = 0.135

function calcularComision(precioVenta: number) {
  const comisionConectia = precioVenta * COMISION_CONECTIA
  const comisionFotografo = comisionConectia * COMISION_FOTOGRAFO
  return { comisionConectia, comisionFotografo }
}

interface PropiedadDB {
  id: number
  titulo: string
  ubicacion: string
  precio: number
  precio_texto: string
  imagen?: string
  galeria?: string[]
  status: string
  asesor_email?: string
  usuario_id?: string
}

interface SolicitudPropiedad {
  id: string
  asesor_email: string
  asesor_nombre?: string
  titulo: string
  ubicacion?: string
  descripcion?: string
  precio_estimado?: number
  tipo?: string
  categoria?: string
  habitaciones?: number
  banos?: number
  area?: number
  status: 'pendiente' | 'en_proceso' | 'completada' | 'rechazada'
  notas_fotografo?: string
  imagenes?: string[]
  propiedad_id?: number
  created_at: string
  updated_at: string
}

export default function PanelFotografoPage() {
  const { user, logout, isAuthenticated } = useAuth()
  const router = useRouter()
  const [propiedades, setPropiedades] = useState<PropiedadDB[]>([])
  const [solicitudes, setSolicitudes] = useState<SolicitudPropiedad[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<'solicitudes' | 'propiedades'>('solicitudes')
  const [solicitudDetalle, setSolicitudDetalle] = useState<SolicitudPropiedad | null>(null)
  const [notaFotografo, setNotaFotografo] = useState('')
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [previewUrls, setPreviewUrls] = useState<string[]>([])
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)

  const handleLogout = async () => {
    try {
      await logout()
    } finally {
      router.push('/login')
    }
  }

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'fotografo') {
      router.push('/login')
      return
    }
    loadData()
  }, [user, isAuthenticated, router])

  const loadData = async () => {
    setLoading(true)
    try {
      // Cargar TODAS las propiedades (Santi ve todo)
      const propRes = await fetch('/api/admin/propiedades')
      if (propRes.ok) {
        const propData = await propRes.json()
        setPropiedades(propData.propiedades || propData || [])
      }

      // Cargar solicitudes de asesores
      const solRes = await fetch('/api/solicitudes-propiedad?role=fotografo')
      if (solRes.ok) {
        const solData = await solRes.json()
        setSolicitudes(solData.solicitudes || [])
      }
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateSolicitud = async (id: string, newStatus: string, notas?: string) => {
    setUpdatingId(id)
    try {
      const res = await fetch('/api/solicitudes-propiedad', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: newStatus, notas_fotografo: notas || undefined })
      })
      if (res.ok) {
        const data = await res.json()
        // Actualizar solicitudDetalle con los datos frescos sin cerrar
        if (data.solicitud) {
          setSolicitudDetalle(data.solicitud)
        }
        // Si se creó una propiedad automáticamente al completar
        if (data.propiedad_creada) {
          toast.success(`¡Propiedad creada automáticamente! (ID: ${data.propiedad_id}). Ya aparece en el listado del asesor.`)
        } else if (newStatus === 'en_proceso') {
          toast.success('Solicitud aceptada')
        } else if (newStatus === 'rechazada') {
          toast.info('Solicitud rechazada')
        }
        await loadData()
      }
    } catch (error) {
      console.error('Error updating solicitud:', error)
      toast.error('Error al actualizar solicitud')
    } finally {
      setUpdatingId(null)
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    const currentImages = solicitudDetalle?.imagenes?.length || 0
    const totalAfter = selectedFiles.length + files.length + currentImages
    if (totalAfter > 30) {
      toast.error(`Máximo 30 fotos por propiedad. Ya tienes ${currentImages + selectedFiles.length}, solo puedes agregar ${30 - currentImages - selectedFiles.length} más.`)
      const allowed = files.slice(0, Math.max(0, 30 - currentImages - selectedFiles.length))
      if (allowed.length === 0) return
      setSelectedFiles(prev => [...prev, ...allowed])
      const newPreviews = allowed.map(file => URL.createObjectURL(file))
      setPreviewUrls(prev => [...prev, ...newPreviews])
      return
    }
    setSelectedFiles(prev => [...prev, ...files])
    const newPreviews = files.map(file => URL.createObjectURL(file))
    setPreviewUrls(prev => [...prev, ...newPreviews])
  }

  const removeSelectedFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index))
    URL.revokeObjectURL(previewUrls[index])
    setPreviewUrls(prev => prev.filter((_, i) => i !== index))
  }

  const handleUploadToSolicitud = async () => {
    if (!solicitudDetalle || selectedFiles.length === 0) return
    setUploading(true)
    setUploadProgress(0)
    try {
      const uploadedUrls: string[] = []
      const total = selectedFiles.length

      for (let i = 0; i < total; i++) {
        setUploadProgress(Math.round((i / total) * 100))
        const result = await uploadImage(selectedFiles[i], `solicitudes/${solicitudDetalle.id}`)
        if (result.error) {
          toast.error(`Error subiendo ${selectedFiles[i].name}: ${result.error}`)
          continue
        }
        if (result.url) uploadedUrls.push(result.url)
      }

      if (uploadedUrls.length === 0) {
        toast.error('No se pudo subir ninguna imagen')
        return
      }

      const currentImages = solicitudDetalle.imagenes || []
      const newImages = [...currentImages, ...uploadedUrls]

      const res = await fetch('/api/solicitudes-propiedad', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: solicitudDetalle.id, imagenes: newImages })
      })

      if (!res.ok) throw new Error('Error guardando imágenes')

      const data = await res.json()
      setSolicitudDetalle(data.solicitud)
      setSelectedFiles([])
      previewUrls.forEach(url => URL.revokeObjectURL(url))
      setPreviewUrls([])
      setUploadProgress(100)
      toast.success(`${uploadedUrls.length} imagen${uploadedUrls.length > 1 ? 'es' : ''} subida${uploadedUrls.length > 1 ? 's' : ''}`)
      await loadData()
    } catch (error: any) {
      console.error('Error:', error)
      toast.error(error.message || 'Error al subir imágenes')
    } finally {
      setUploading(false)
      setUploadProgress(0)
    }
  }

  const handleDeleteSolicitudImage = async (imageUrl: string) => {
    if (!solicitudDetalle || !confirm('¿Eliminar esta imagen?')) return
    try {
      const newImages = (solicitudDetalle.imagenes || []).filter(img => img !== imageUrl)
      const res = await fetch('/api/solicitudes-propiedad', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: solicitudDetalle.id, imagenes: newImages })
      })
      if (!res.ok) throw new Error('Error eliminando imagen')
      const data = await res.json()
      setSolicitudDetalle(data.solicitud)
      toast.success('Imagen eliminada')
      await loadData()
    } catch (error) {
      console.error('Error:', error)
      toast.error('Error al eliminar imagen')
    }
  }

  if (!user) return null

  const solicitudesPendientes = solicitudes.filter(s => s.status === 'pendiente')
  const solicitudesEnProceso = solicitudes.filter(s => s.status === 'en_proceso')
  const totalPropiedades = propiedades.length
  const propiedadesConFotos = propiedades.filter((p: any) => (p.imagen || p.galeria?.length > 0)).length

  // Calcular comisiones
  const propiedadesVendidas = propiedades.filter(p => p.status === 'Vendida')
  const totalComisiones = propiedadesVendidas.reduce((sum, p) => {
    const { comisionFotografo } = calcularComision(p.precio || 0)
    return sum + comisionFotografo
  }, 0)

  return (
    <div className="min-h-screen bg-[#17313A]">
      {/* Header */}
      <header className="bg-[#1A3540] border-b border-gray-700/60 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-conectia-gold/20 rounded-xl flex items-center justify-center">
                <Camera className="w-6 h-6 text-conectia-gold" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">Panel de Fotografía</h1>
                <p className="text-sm text-gray-400">{user.nombre || 'Santiago Canales'} · Fotógrafo & Videógrafo</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 text-gray-300 hover:text-white hover:bg-white/10 rounded-xl transition-all"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Cerrar Sesión</span>
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-[#1A3540] rounded-2xl p-5 border border-red-500/20 relative overflow-hidden hover:border-red-500/50 hover:shadow-lg hover:shadow-red-500/10 transition-all duration-300">
            <div className="absolute -top-6 -right-6 w-20 h-20 bg-red-500/10 rounded-full pointer-events-none" />
            <div className="flex items-start justify-between mb-4">
              <div className="w-11 h-11 bg-red-500/20 rounded-xl flex items-center justify-center relative">
                <Inbox className="w-5 h-5 text-red-400" />
                {solicitudesPendientes.length > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">
                    {solicitudesPendientes.length}
                  </span>
                )}
              </div>
              <span className="text-xs font-semibold text-red-400 bg-red-500/10 px-2 py-1 rounded-full">Urgente</span>
            </div>
            <p className="text-4xl font-black text-white mb-1">{solicitudesPendientes.length}</p>
            <p className="text-sm text-gray-400">Solicitudes Pendientes</p>
            <p className="text-xs text-gray-500 mt-1">{solicitudesEnProceso.length} en proceso</p>
          </div>

          <div className="bg-[#1A3540] rounded-2xl p-5 border border-blue-500/20 relative overflow-hidden hover:border-blue-500/50 hover:shadow-lg hover:shadow-blue-500/10 transition-all duration-300">
            <div className="absolute -top-6 -right-6 w-20 h-20 bg-blue-500/10 rounded-full pointer-events-none" />
            <div className="flex items-start justify-between mb-4">
              <div className="w-11 h-11 bg-blue-500/20 rounded-xl flex items-center justify-center">
                <Home className="w-5 h-5 text-blue-400" />
              </div>
              <span className="text-xs font-semibold text-blue-400 bg-blue-500/10 px-2 py-1 rounded-full">Total</span>
            </div>
            <p className="text-4xl font-black text-white mb-1">{totalPropiedades}</p>
            <p className="text-sm text-gray-400">Propiedades</p>
            <p className="text-xs text-gray-500 mt-1">{propiedadesVendidas.length} vendidas</p>
          </div>

          <div className="bg-[#1A3540] rounded-2xl p-5 border border-green-500/20 relative overflow-hidden hover:border-green-500/50 hover:shadow-lg hover:shadow-green-500/10 transition-all duration-300">
            <div className="absolute -top-6 -right-6 w-20 h-20 bg-green-500/10 rounded-full pointer-events-none" />
            <div className="flex items-start justify-between mb-4">
              <div className="w-11 h-11 bg-green-500/20 rounded-xl flex items-center justify-center">
                <Camera className="w-5 h-5 text-green-400" />
              </div>
              <span className="text-xs font-semibold text-green-400 bg-green-500/10 px-2 py-1 rounded-full">
                {totalPropiedades > 0 ? Math.round((propiedadesConFotos / totalPropiedades) * 100) : 0}%
              </span>
            </div>
            <p className="text-4xl font-black text-white mb-1">{propiedadesConFotos}</p>
            <p className="text-sm text-gray-400">Con Fotos</p>
            <p className="text-xs text-gray-500 mt-1">De {totalPropiedades} propiedades</p>
          </div>

          <div className="bg-[#1A3540] rounded-2xl p-5 border border-conectia-gold/20 relative overflow-hidden hover:border-conectia-gold/50 hover:shadow-lg hover:shadow-conectia-gold/10 transition-all duration-300">
            <div className="absolute -top-6 -right-6 w-20 h-20 bg-conectia-gold/10 rounded-full pointer-events-none" />
            <div className="flex items-start justify-between mb-4">
              <div className="w-11 h-11 bg-conectia-gold/20 rounded-xl flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-conectia-gold" />
              </div>
              <span className="text-xs font-semibold text-conectia-gold bg-conectia-gold/10 px-2 py-1 rounded-full">Ganadas</span>
            </div>
            <p className="text-4xl font-black text-white mb-1">
              ${totalComisiones.toLocaleString('es-MX', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
            </p>
            <p className="text-sm text-gray-400">Comisiones</p>
            <p className="text-xs text-gray-500 mt-1">{propiedadesVendidas.length} venta{propiedadesVendidas.length !== 1 ? 's' : ''}</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1.5 mb-6 bg-[#1A3540] p-1.5 rounded-xl border border-gray-700/60 w-fit">
          <button
            onClick={() => { setTab('solicitudes'); setSolicitudDetalle(null) }}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all ${
              tab === 'solicitudes'
                ? 'bg-conectia-gold text-[#17313A] shadow-lg'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Inbox className="h-4 w-4" />
            Solicitudes de Asesores
            {solicitudesPendientes.length > 0 && (
              <span className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${
                tab === 'solicitudes' ? 'bg-[#17313A]/30 text-[#17313A]' : 'bg-red-500 text-white'
              }`}>
                {solicitudesPendientes.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setTab('propiedades')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all ${
              tab === 'propiedades'
                ? 'bg-conectia-gold text-[#17313A] shadow-lg'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Home className="h-4 w-4" />
            Propiedades ({totalPropiedades})
          </button>
        </div>

        {/* Tab: Solicitudes */}
        {tab === 'solicitudes' && !solicitudDetalle && (
          <div className="bg-[#1A3540] rounded-2xl border border-gray-700/60 overflow-hidden shadow-xl">
            <div className="p-5 border-b border-gray-700/60 bg-gradient-to-r from-conectia-gold/10 to-transparent">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <div className="w-8 h-8 bg-conectia-gold/20 rounded-lg flex items-center justify-center">
                    <Inbox className="h-4 w-4 text-conectia-gold" />
                  </div>
                  Solicitudes de Propiedades
                </h2>
                <span className="text-xs font-semibold text-conectia-gold bg-conectia-gold/10 px-3 py-1 rounded-full">
                  {solicitudes.length} total
                </span>
              </div>
            </div>
            <div className="p-5">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="w-10 h-10 border-2 border-conectia-gold/30 border-t-conectia-gold rounded-full animate-spin mb-4" />
                  <p className="text-gray-400">Cargando solicitudes...</p>
                </div>
              ) : solicitudes.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="w-16 h-16 bg-conectia-gold/10 rounded-2xl flex items-center justify-center mb-4">
                    <Inbox className="h-8 w-8 text-conectia-gold/40" />
                  </div>
                  <h3 className="text-base font-semibold text-white mb-1">Sin solicitudes</h3>
                  <p className="text-sm text-gray-500 max-w-md">
                    Cuando un asesor envíe una solicitud, aparecerá aquí para que subas las fotos.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {solicitudes.map((sol) => {
                    const statusConfig: Record<string, { color: string; text: string }> = {
                      pendiente: { color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30', text: 'Pendiente' },
                      en_proceso: { color: 'bg-blue-500/20 text-blue-400 border-blue-500/30', text: 'En Proceso' },
                      completada: { color: 'bg-green-500/20 text-green-400 border-green-500/30', text: 'Completada' },
                      rechazada: { color: 'bg-red-500/20 text-red-400 border-red-500/30', text: 'Rechazada' }
                    }
                    const config = statusConfig[sol.status] || statusConfig.pendiente

                    return (
                      <div
                        key={sol.id}
                        onClick={() => { setSolicitudDetalle(sol); setNotaFotografo(sol.notas_fotografo || '') }}
                        className="p-4 bg-[#17313A] border border-gray-700/60 rounded-xl hover:border-conectia-gold/40 transition-all cursor-pointer group"
                      >
                        <div className="flex items-center justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-semibold text-white truncate">{sol.titulo}</h3>
                              <span className={`shrink-0 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${config.color}`}>{config.text}</span>
                            </div>
                            <div className="flex items-center gap-3 text-sm text-gray-400 flex-wrap">
                              <span className="flex items-center gap-1">
                                <User className="h-3.5 w-3.5" />
                                {sol.asesor_nombre || sol.asesor_email}
                              </span>
                              {sol.ubicacion && (
                                <span className="flex items-center gap-1">
                                  <MapPin className="h-3.5 w-3.5" />
                                  {sol.ubicacion}
                                </span>
                              )}
                              <span>{new Date(sol.created_at).toLocaleDateString('es-MX')}</span>
                            </div>
                          </div>
                          <ChevronRight className="h-5 w-5 text-gray-600 group-hover:text-conectia-gold transition-colors shrink-0" />
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Detalle de Solicitud */}
        {tab === 'solicitudes' && solicitudDetalle && (
          <div className="space-y-5">
            <button
              onClick={() => setSolicitudDetalle(null)}
              className="flex items-center gap-2 text-sm text-gray-400 hover:text-conectia-gold transition-colors"
            >
              <ChevronRight className="h-4 w-4 rotate-180" />
              Volver a solicitudes
            </button>

            <div className="bg-[#1A3540] rounded-2xl border border-gray-700/60 overflow-hidden shadow-xl">
              <div className="p-5 border-b border-gray-700/60 bg-gradient-to-r from-conectia-gold/10 to-transparent">
                <div className="flex items-center justify-between gap-3">
                  <h2 className="text-lg font-bold text-white">{solicitudDetalle.titulo}</h2>
                  <span className={`shrink-0 px-3 py-1 rounded-full text-xs font-semibold border ${
                    solicitudDetalle.status === 'pendiente' ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' :
                    solicitudDetalle.status === 'en_proceso' ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' :
                    solicitudDetalle.status === 'completada' ? 'bg-green-500/20 text-green-400 border-green-500/30' :
                    'bg-red-500/20 text-red-400 border-red-500/30'
                  }`}>
                    {solicitudDetalle.status === 'pendiente' ? 'Pendiente' :
                     solicitudDetalle.status === 'en_proceso' ? 'En Proceso' :
                     solicitudDetalle.status === 'completada' ? 'Completada' : 'Rechazada'}
                  </span>
                </div>
              </div>
              <div className="p-5 space-y-5">
                {/* Info del asesor */}
                <div className="p-4 bg-blue-500/10 rounded-xl border border-blue-500/20">
                  <p className="text-xs font-semibold text-blue-400 mb-2 uppercase tracking-wider">Solicitado por</p>
                  <p className="text-white font-semibold">{solicitudDetalle.asesor_nombre || 'Sin nombre'}</p>
                  <p className="text-sm text-blue-400">{solicitudDetalle.asesor_email}</p>
                </div>

                {/* Datos de la propiedad */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {solicitudDetalle.ubicacion && (
                    <div className="flex items-center gap-2 text-sm bg-[#17313A] px-3 py-2.5 rounded-lg">
                      <MapPin className="h-4 w-4 text-gray-500 shrink-0" />
                      <span className="text-gray-300">{solicitudDetalle.ubicacion}</span>
                    </div>
                  )}
                  {solicitudDetalle.tipo && (
                    <div className="flex items-center gap-2 text-sm bg-[#17313A] px-3 py-2.5 rounded-lg">
                      <Home className="h-4 w-4 text-gray-500 shrink-0" />
                      <span className="text-gray-300">{solicitudDetalle.tipo}</span>
                    </div>
                  )}
                  {solicitudDetalle.precio_estimado && (
                    <div className="flex items-center gap-2 text-sm bg-[#17313A] px-3 py-2.5 rounded-lg">
                      <DollarSign className="h-4 w-4 text-gray-500 shrink-0" />
                      <span className="text-gray-300">${solicitudDetalle.precio_estimado.toLocaleString('es-MX')}</span>
                    </div>
                  )}
                  {solicitudDetalle.habitaciones && (
                    <div className="flex items-center gap-2 text-sm bg-[#17313A] px-3 py-2.5 rounded-lg">
                      <Bed className="h-4 w-4 text-gray-500 shrink-0" />
                      <span className="text-gray-300">{solicitudDetalle.habitaciones} habitaciones</span>
                    </div>
                  )}
                  {solicitudDetalle.banos && (
                    <div className="flex items-center gap-2 text-sm bg-[#17313A] px-3 py-2.5 rounded-lg">
                      <Bath className="h-4 w-4 text-gray-500 shrink-0" />
                      <span className="text-gray-300">{solicitudDetalle.banos} baños</span>
                    </div>
                  )}
                  {solicitudDetalle.area && (
                    <div className="flex items-center gap-2 text-sm bg-[#17313A] px-3 py-2.5 rounded-lg">
                      <Maximize className="h-4 w-4 text-gray-500 shrink-0" />
                      <span className="text-gray-300">{solicitudDetalle.area} m²</span>
                    </div>
                  )}
                </div>

                {/* Descripción / Notas del asesor */}
                {solicitudDetalle.descripcion && (
                  <div>
                    <p className="text-sm font-semibold text-gray-300 mb-2 flex items-center gap-1.5">
                      <FileText className="h-4 w-4 text-conectia-gold" />
                      Notas del asesor:
                    </p>
                    <p className="text-sm text-gray-300 bg-[#17313A] p-4 rounded-xl border-l-2 border-conectia-gold/30">{solicitudDetalle.descripcion}</p>
                  </div>
                )}

                {/* === SECCIÓN DE FOTOS === */}
                <div className="border-t border-gray-700/60 pt-5">
                  <p className="text-sm font-semibold text-gray-300 mb-3 flex items-center gap-2">
                    <Camera className="h-4 w-4 text-conectia-gold" />
                    Fotos de la propiedad ({(solicitudDetalle.imagenes || []).length})
                  </p>

                  {/* Fotos existentes */}
                  {(solicitudDetalle.imagenes || []).length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                      {(solicitudDetalle.imagenes || []).map((imgUrl, idx) => (
                        <div key={idx} className="relative group">
                          <img src={imgUrl} alt={`Foto ${idx + 1}`} className="w-full h-32 object-cover rounded-lg" />
                          <div className="absolute inset-0 bg-[#17313A]/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-2">
                            <button
                              onClick={() => window.open(imgUrl, '_blank')}
                              className="text-white hover:text-conectia-gold"
                            >
                              <Eye className="h-5 w-5" />
                            </button>
                            <button
                              onClick={() => handleDeleteSolicitudImage(imgUrl)}
                              className="text-white hover:text-red-400"
                            >
                              <Trash2 className="h-5 w-5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Subir nuevas fotos */}
                  <div className="border-2 border-dashed border-gray-600 rounded-xl p-6 text-center hover:border-conectia-gold/50 transition-colors mb-4 cursor-pointer">
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleFileSelect}
                      className="hidden"
                      id="solicitud-file-upload"
                      disabled={uploading}
                    />
                    <label htmlFor="solicitud-file-upload" className="cursor-pointer">
                      <ImageIcon className="h-10 w-10 text-gray-500 mx-auto mb-2" />
                      <p className="text-sm font-semibold text-gray-300">Selecciona imágenes</p>
                      <p className="text-xs text-gray-500">Haz clic para subir fotos (máximo 30)</p>
                    </label>
                  </div>

                  {/* Preview de archivos seleccionados */}
                  {selectedFiles.length > 0 && (
                    <div className="mb-4">
                      <p className="text-sm font-medium mb-2">Seleccionadas ({selectedFiles.length})</p>
                      <div className="grid grid-cols-3 md:grid-cols-5 gap-2 mb-3">
                        {previewUrls.map((url, idx) => (
                          <div key={idx} className="relative group">
                            <img src={url} alt={`Preview ${idx + 1}`} className="w-full h-24 object-cover rounded-lg" />
                            <button
                              onClick={() => removeSelectedFile(idx)}
                              className="absolute top-1 right-1 bg-red-500 text-white p-0.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </div>
                        ))}
                      </div>

                      {uploading && (
                        <div className="mb-3">
                          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div className="h-full bg-conectia-gold rounded-full transition-all duration-300" style={{ width: `${uploadProgress}%` }} />
                          </div>
                          <p className="text-xs text-gray-500 mt-1 text-center">{uploadProgress}%</p>
                        </div>
                      )}

                      <Button
                        onClick={handleUploadToSolicitud}
                        disabled={uploading}
                        className="w-full bg-[#C78F7B] hover:bg-[#D4987E] text-[#17313A] font-semibold"
                      >
                        {uploading ? (
                          <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Subiendo...</>
                        ) : (
                          <><Upload className="h-4 w-4 mr-2" /> Subir {selectedFiles.length} imagen{selectedFiles.length > 1 ? 'es' : ''}</>
                        )}
                      </Button>
                    </div>
                  )}
                </div>

                {/* Notas del fotógrafo */}
                <div>
                  <p className="text-sm font-semibold text-gray-300 mb-2">Tus notas:</p>
                  <Textarea
                    value={notaFotografo}
                    onChange={(e) => setNotaFotografo(e.target.value)}
                    placeholder="Agrega notas sobre la sesión de fotos, horarios, observaciones..."
                    className="min-h-[80px] bg-[#17313A] border-gray-600 text-gray-200 placeholder:text-gray-600 focus:border-conectia-gold/50"
                  />
                </div>

                {/* Acciones */}
                <div className="flex flex-wrap gap-3 pt-2">
                  {solicitudDetalle.status === 'pendiente' && (
                    <>
                      <Button
                        onClick={() => updateSolicitud(solicitudDetalle.id, 'en_proceso', notaFotografo)}
                        disabled={updatingId === solicitudDetalle.id}
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                      >
                        <Camera className="h-4 w-4 mr-2" />
                        Aceptar y Comenzar
                      </Button>
                      <Button
                        onClick={() => updateSolicitud(solicitudDetalle.id, 'rechazada', notaFotografo)}
                        disabled={updatingId === solicitudDetalle.id}
                        variant="outline"
                        className="border-red-300 text-red-600 hover:bg-red-50"
                      >
                        <XCircle className="h-4 w-4 mr-2" />
                        Rechazar
                      </Button>
                    </>
                  )}
                  {solicitudDetalle.status === 'en_proceso' && (
                    <>
                      <Button
                        onClick={() => updateSolicitud(solicitudDetalle.id, 'completada', notaFotografo)}
                        disabled={updatingId === solicitudDetalle.id}
                        className="bg-green-600 hover:bg-green-700 text-white"
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Marcar como Completada
                      </Button>
                      <Button
                        onClick={() => updateSolicitud(solicitudDetalle.id, 'en_proceso', notaFotografo)}
                        disabled={updatingId === solicitudDetalle.id}
                        variant="outline"
                      >
                        Guardar Notas
                      </Button>
                    </>
                  )}
                  {(solicitudDetalle.status === 'completada' || solicitudDetalle.status === 'rechazada') && (
                    <Button
                      onClick={() => updateSolicitud(solicitudDetalle.id, 'en_proceso', notaFotografo)}
                      disabled={updatingId === solicitudDetalle.id}
                      variant="outline"
                    >
                      Reabrir Solicitud
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab: Todas las Propiedades */}
        {tab === 'propiedades' && (
          <div className="bg-[#1A3540] rounded-2xl border border-gray-700/60 overflow-hidden shadow-xl">
            <div className="p-5 border-b border-gray-700/60 bg-gradient-to-r from-blue-500/10 to-transparent">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
                    <Home className="h-4 w-4 text-blue-400" />
                  </div>
                  Todas las Propiedades
                </h2>
                <span className="text-xs font-semibold text-blue-400 bg-blue-500/10 px-3 py-1 rounded-full">
                  {totalPropiedades} total
                </span>
              </div>
            </div>
            <div className="p-5">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="w-10 h-10 border-2 border-blue-400/30 border-t-blue-400 rounded-full animate-spin mb-4" />
                  <p className="text-gray-400">Cargando propiedades...</p>
                </div>
              ) : propiedades.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="w-16 h-16 bg-blue-500/10 rounded-2xl flex items-center justify-center mb-4">
                    <ImageOff className="h-8 w-8 text-blue-400/40" />
                  </div>
                  <h3 className="text-base font-semibold text-white mb-1">Sin propiedades</h3>
                  <p className="text-sm text-gray-500">No hay propiedades registradas aún.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {propiedades.map((propiedad: any) => {
                    const tieneImagen = propiedad.imagen || (propiedad.galeria && propiedad.galeria.length > 0)
                    const numGaleria = propiedad.galeria?.length || 0
                    const asesor = propiedad.asesorEmail || propiedad.asesor_email || propiedad.usuarioId || propiedad.usuario_id || 'Sin asignar'

                    return (
                      <div
                        key={propiedad.id}
                        className="p-4 bg-[#17313A] border border-gray-700/60 rounded-xl hover:border-gray-600 transition-colors"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex gap-3 flex-1 min-w-0">
                            {/* Thumbnail */}
                            <div className="w-16 h-16 rounded-xl bg-[#1A3540] flex-shrink-0 overflow-hidden">
                              {propiedad.imagen ? (
                                <img src={propiedad.imagen} alt="" className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <ImageOff className="h-6 w-6 text-gray-600" />
                                </div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-semibold text-white truncate">{propiedad.titulo}</h3>
                                <span className="shrink-0 text-xs px-2 py-0.5 rounded-full bg-gray-700 text-gray-300">{propiedad.status || 'Disponible'}</span>
                              </div>
                              <div className="flex items-center gap-3 text-xs text-gray-400 mb-1">
                                <span className="flex items-center gap-1">
                                  <MapPin className="h-3 w-3" />
                                  {propiedad.ubicacion}
                                </span>
                                <span className="flex items-center gap-1">
                                  <DollarSign className="h-3 w-3" />
                                  {propiedad.precioTexto || propiedad.precio_texto || `$${(propiedad.precio || 0).toLocaleString('es-MX')}`}
                                </span>
                              </div>
                              <div className="flex items-center gap-3 text-xs">
                                <span className="flex items-center gap-1 text-gray-500">
                                  <User className="h-3 w-3" />
                                  {asesor}
                                </span>
                                <span className={`flex items-center gap-1 font-medium ${
                                  tieneImagen ? 'text-green-400' : 'text-red-400'
                                }`}>
                                  <Camera className="h-3 w-3" />
                                  {tieneImagen ? `${numGaleria > 0 ? numGaleria + ' fotos' : 'Con imagen'}` : 'Sin fotos'}
                                </span>
                              </div>
                            </div>
                          </div>
                          <Button
                            size="sm"
                            onClick={() => router.push(`/panel-fotografo/propiedades/${propiedad.id}`)}
                            className="bg-conectia-gold hover:bg-conectia-gold/80 text-[#17313A] font-semibold shrink-0"
                          >
                            <Upload className="h-4 w-4 mr-1" />
                            Fotos
                          </Button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Resumen de Comisiones */}
        <div className="bg-[#1A3540] rounded-2xl border border-gray-700/60 overflow-hidden shadow-xl mt-6">
          <div className="p-5 border-b border-gray-700/60 bg-gradient-to-r from-conectia-gold/10 to-transparent">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <div className="w-8 h-8 bg-conectia-gold/20 rounded-lg flex items-center justify-center">
                <Banknote className="h-4 w-4 text-conectia-gold" />
              </div>
              Estructura de Comisiones
            </h2>
          </div>
          <div className="p-5">
            <div className="grid md:grid-cols-3 gap-4">
              <div className="text-center p-5 bg-[#17313A] rounded-xl border border-gray-700/60">
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Comisión CONECTIA</p>
                <p className="text-4xl font-black text-white">2%</p>
                <p className="text-xs text-gray-500 mt-1">del precio de venta</p>
              </div>
              <div className="text-center p-5 bg-conectia-gold/10 rounded-xl border-2 border-conectia-gold/40 shadow-lg shadow-conectia-gold/10">
                <p className="text-xs text-gray-400 uppercase tracking-wider mb-2">Tu Comisión</p>
                <p className="text-4xl font-black text-conectia-gold">13.5%</p>
                <p className="text-xs text-gray-400 mt-1">de la comisión CONECTIA</p>
              </div>
              <div className="text-center p-5 bg-green-500/10 rounded-xl border border-green-500/20">
                <p className="text-xs text-gray-400 uppercase tracking-wider mb-2">Tu % del Total</p>
                <p className="text-4xl font-black text-green-400">0.27%</p>
                <p className="text-xs text-gray-400 mt-1">del precio de venta</p>
              </div>
            </div>
            <div className="mt-4 p-4 bg-blue-500/10 rounded-xl border border-blue-500/20">
              <p className="text-sm text-blue-300">
                <strong>Ejemplo:</strong> Por una propiedad vendida en $5,000,000 MXN:
              </p>
              <div className="flex flex-wrap gap-4 mt-2 text-sm">
                <span className="text-gray-400">Comisión CONECTIA: <strong className="text-white">$100,000</strong></span>
                <span className="text-green-400 font-bold">→ Tu comisión: $13,500</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
