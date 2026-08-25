"use client"

import { useState, useEffect, useMemo } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { uploadImage } from "@/lib/supabase/storage"
import { useAllPropertyAnalytics, usePropertiesAnalyticsList } from "@/hooks/use-property-analytics"
import { formatDuration } from "@/lib/property-analytics"
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
  Trash2,
  BarChart3,
  TrendingUp,
  MousePointerClick,
  Share2
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
    if (newStatus === 'completada' && !(solicitudDetalle?.imagenes || []).length) {
      toast.error('Sube al menos una foto antes de completar la solicitud')
      return
    }

    setUpdatingId(id)
    try {
      const res = await fetch('/api/solicitudes-propiedad', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: newStatus, notas_fotografo: notas || undefined })
      })
      const data = await res.json()
      if (res.ok) {
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
      } else {
        throw new Error(data.error || 'Error al actualizar solicitud')
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

  // Analytics
  const propertyIds = useMemo(() => propiedades.map(p => p.id), [propiedades])
  const { totalViews, totalShares, topProperties } = useAllPropertyAnalytics()
  const { analytics: propiedadesAnalytics } = usePropertiesAnalyticsList(propertyIds)

  const totalVistasPropiedades = propiedadesAnalytics.reduce((sum, a) => sum + a.views, 0)
  const totalCompartidosPropiedades = propiedadesAnalytics.reduce((sum, a) => sum + a.shares, 0)
  const avgInteractionTime = propiedadesAnalytics.length > 0
    ? propiedadesAnalytics.reduce((sum, a) => sum + (a.interactionsCount > 0 ? a.totalInteractionTimeMs / a.interactionsCount : 0), 0) / propiedadesAnalytics.filter(a => a.interactionsCount > 0).length || 0
    : 0

  return (
    <div className="min-h-screen bg-[#0F2027] relative overflow-hidden">
      {/* Glow orbs */}
      <div className="fixed top-0 right-0 w-[500px] h-[500px] bg-[var(--conectia-arcilla)]/5 rounded-full blur-[150px] pointer-events-none" />
      <div className="fixed bottom-0 left-0 w-[400px] h-[400px] bg-[#17313A]/60 rounded-full blur-[120px] pointer-events-none" />

      {/* Header — Glassmorphism */}
      <header className="sticky top-0 z-50 bg-[#0F2027]/80 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(199,143,123,0.15)', border: '1px solid rgba(199,143,123,0.3)' }}>
                <Camera className="w-5 h-5 text-[var(--conectia-arcilla)]" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-white">Panel de Fotografía</h1>
                <p className="text-xs text-[#B0ACA6]">{user.nombre || 'Santiago Canales'} · Fotógrafo & Videógrafo</p>
              </div>
            </div>
            <button onClick={handleLogout} className="flex items-center gap-2 px-4 py-2 text-[#B0ACA6] hover:text-white hover:bg-white/5 rounded-xl transition-all text-sm border border-white/10 hover:border-[var(--conectia-arcilla)]/30">
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Cerrar Sesión</span>
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        {/* Stats — Glassmorphism */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 mb-8">
          {[
            { label: 'Solicitudes Pendientes', value: solicitudesPendientes.length, sub: `${solicitudesEnProceso.length} en proceso`, accent: '#ef4444', icon: Inbox, badge: 'Urgente' },
            { label: 'Propiedades', value: totalPropiedades, sub: `${propiedadesVendidas.length} vendidas`, accent: '#3b82f6', icon: Home, badge: 'Total' },
            { label: 'Con Fotos', value: propiedadesConFotos, sub: `De ${totalPropiedades}`, accent: '#22c55e', icon: Camera, badge: `${totalPropiedades > 0 ? Math.round((propiedadesConFotos / totalPropiedades) * 100) : 0}%` },
            { label: 'Comisiones', value: `$${totalComisiones.toLocaleString('es-MX', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`, sub: `${propiedadesVendidas.length} venta${propiedadesVendidas.length !== 1 ? 's' : ''}`, accent: 'var(--conectia-arcilla)', icon: DollarSign, badge: 'Ganadas' },
            { label: 'Vistas Totales', value: totalVistasPropiedades, sub: `${totalViews} global`, accent: '#8b5cf6', icon: BarChart3, badge: 'Analytics' },
            { label: 'Compartidos', value: totalCompartidosPropiedades, sub: `${totalShares} global`, accent: '#06b6d4', icon: Share2, badge: 'Social' },
          ].map((stat, i) => (
            <div key={i} className="relative bg-white/[0.03] backdrop-blur-md border border-white/10 rounded-[24px] p-5 overflow-hidden group hover:border-white/20 transition-all duration-300">
              <div className="absolute -top-6 -right-6 w-20 h-20 rounded-full pointer-events-none opacity-30" style={{ background: `${stat.accent}20` }} />
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${stat.accent}15` }}>
                  <stat.icon className="w-5 h-5" style={{ color: stat.accent }} />
                </div>
                <span className="text-[10px] font-bold px-2 py-1 rounded-full" style={{ background: `${stat.accent}15`, color: stat.accent }}>{stat.badge}</span>
              </div>
              <p className="text-2xl sm:text-3xl font-black text-white">{stat.value}</p>
              <p className="text-xs text-[#8A8F97] mt-1">{stat.label}</p>
              <p className="text-[10px] text-[#4A4F57] mt-0.5">{stat.sub}</p>
            </div>
          ))}
        </div>

        {/* Analytics Row — Vistas, Compartidos, Tiempo Promedio */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="relative bg-white/[0.03] backdrop-blur-md border border-white/10 rounded-[24px] p-5 overflow-hidden">
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-[#8b5cf6]/10 rounded-full blur-[40px] pointer-events-none" />
            <div className="relative flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-[#8b5cf6]/10 flex items-center justify-center border border-[#8b5cf6]/20">
                <MousePointerClick className="w-6 h-6 text-[#8b5cf6]" />
              </div>
              <div>
                <p className="text-xs text-[#8A8F97] uppercase tracking-wider font-bold">Tiempo Promedio</p>
                <p className="text-2xl font-black text-white">{formatDuration(Math.round(avgInteractionTime))}</p>
                <p className="text-[10px] text-[#4A4F57]">Por visita en propiedades</p>
              </div>
            </div>
          </div>

          <div className="relative bg-white/[0.03] backdrop-blur-md border border-white/10 rounded-[24px] p-5 overflow-hidden">
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-[#06b6d4]/10 rounded-full blur-[40px] pointer-events-none" />
            <div className="relative flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-[#06b6d4]/10 flex items-center justify-center border border-[#06b6d4]/20">
                <TrendingUp className="w-6 h-6 text-[#06b6d4]" />
              </div>
              <div>
                <p className="text-xs text-[#8A8F97] uppercase tracking-wider font-bold">Tasa de Conversión</p>
                <p className="text-2xl font-black text-white">{totalViews > 0 ? ((totalShares / totalViews) * 100).toFixed(1) : 0}%</p>
                <p className="text-[10px] text-[#4A4F57]">Compartidos / Vistas</p>
              </div>
            </div>
          </div>

          <div className="relative bg-white/[0.03] backdrop-blur-md border border-white/10 rounded-[24px] p-5 overflow-hidden">
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-[var(--conectia-arcilla)]/10 rounded-full blur-[40px] pointer-events-none" />
            <div className="relative flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-[var(--conectia-arcilla)]/10 flex items-center justify-center border border-[var(--conectia-arcilla)]/20">
                <Eye className="w-6 h-6 text-[var(--conectia-arcilla)]" />
              </div>
              <div>
                <p className="text-xs text-[#8A8F97] uppercase tracking-wider font-bold">Top Propiedad</p>
                <p className="text-lg font-black text-white truncate">{topProperties[0]?.propertyId ? `ID: ${topProperties[0].propertyId}` : 'Sin datos'}</p>
                <p className="text-[10px] text-[#4A4F57]">{topProperties[0]?.views || 0} vistas</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1.5 mb-6 bg-white/[0.03] backdrop-blur-md p-1.5 rounded-xl border border-white/10 w-fit">
          <button
            onClick={() => { setTab('solicitudes'); setSolicitudDetalle(null) }}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all ${
              tab === 'solicitudes'
                ? 'bg-[var(--conectia-arcilla)] text-[#0F2027] shadow-lg shadow-[var(--conectia-arcilla)]/20'
                : 'text-[#B0ACA6] hover:text-white hover:bg-white/5'
            }`}
          >
            <Inbox className="h-4 w-4" />
            Solicitudes
            {solicitudesPendientes.length > 0 && (
              <span className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${
                tab === 'solicitudes' ? 'bg-[#0F2027]/30 text-[#0F2027]' : 'bg-red-500 text-white'
              }`}>
                {solicitudesPendientes.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setTab('propiedades')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all ${
              tab === 'propiedades'
                ? 'bg-[var(--conectia-arcilla)] text-[#0F2027] shadow-lg shadow-[var(--conectia-arcilla)]/20'
                : 'text-[#B0ACA6] hover:text-white hover:bg-white/5'
            }`}
          >
            <Home className="h-4 w-4" />
            Propiedades ({totalPropiedades})
          </button>
        </div>

        {/* Tab: Solicitudes */}
        {tab === 'solicitudes' && !solicitudDetalle && (
          <div className="relative bg-white/[0.03] backdrop-blur-md border border-white/10 rounded-[24px] overflow-hidden overflow-hidden shadow-xl">
            <div className="p-5 border-b border-white/10 px-6 pt-5 pb-4">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <div className="w-8 h-8 bg-[var(--conectia-arcilla)]/10 rounded-lg border border-[var(--conectia-arcilla)]/20 flex items-center justify-center">
                    <Inbox className="h-4 w-4 text-[var(--conectia-arcilla)]" />
                  </div>
                  Solicitudes de Propiedades
                </h2>
                <span className="text-xs font-semibold text-[var(--conectia-arcilla)] bg-[var(--conectia-arcilla)]/10 px-3 py-1 rounded-full">
                  {solicitudes.length} total
                </span>
              </div>
            </div>
            <div className="p-5">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="w-10 h-10 border-2 border-[var(--conectia-arcilla)]/30 border-t-[var(--conectia-arcilla)] rounded-full animate-spin mb-4" />
                  <p className="text-[#B0ACA6]">Cargando solicitudes...</p>
                </div>
              ) : solicitudes.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="w-16 h-16 bg-[var(--conectia-arcilla)]/10 rounded-2xl flex items-center justify-center mb-4">
                    <Inbox className="h-8 w-8 text-[var(--conectia-arcilla)]/40" />
                  </div>
                  <h3 className="text-base font-semibold text-white mb-1">Sin solicitudes</h3>
                  <p className="text-sm text-[#8A8F97] max-w-md">
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
                        className="p-4 bg-white/[0.02] border border-white/10 rounded-xl hover:border-[var(--conectia-arcilla)]/40 transition-all cursor-pointer group"
                      >
                        <div className="flex items-center justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-semibold text-white truncate">{sol.titulo}</h3>
                              <span className={`shrink-0 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${config.color}`}>{config.text}</span>
                            </div>
                            <div className="flex items-center gap-3 text-sm text-[#B0ACA6] flex-wrap">
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
                          <ChevronRight className="h-5 w-5 text-[#4A4F57] group-hover:text-[var(--conectia-arcilla)] transition-colors shrink-0" />
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
              className="flex items-center gap-2 text-sm text-[#B0ACA6] hover:text-[var(--conectia-arcilla)] transition-colors"
            >
              <ChevronRight className="h-4 w-4 rotate-180" />
              Volver a solicitudes
            </button>

            <div className="relative bg-white/[0.03] backdrop-blur-md border border-white/10 rounded-[24px] overflow-hidden overflow-hidden shadow-xl">
              <div className="p-5 border-b border-white/10 px-6 pt-5 pb-4">
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
                      <MapPin className="h-4 w-4 text-[#8A8F97] shrink-0" />
                      <span className="text-white">{solicitudDetalle.ubicacion}</span>
                    </div>
                  )}
                  {solicitudDetalle.tipo && (
                    <div className="flex items-center gap-2 text-sm bg-[#17313A] px-3 py-2.5 rounded-lg">
                      <Home className="h-4 w-4 text-[#8A8F97] shrink-0" />
                      <span className="text-white">{solicitudDetalle.tipo}</span>
                    </div>
                  )}
                  {solicitudDetalle.precio_estimado && (
                    <div className="flex items-center gap-2 text-sm bg-[#17313A] px-3 py-2.5 rounded-lg">
                      <DollarSign className="h-4 w-4 text-[#8A8F97] shrink-0" />
                      <span className="text-white">${solicitudDetalle.precio_estimado.toLocaleString('es-MX')}</span>
                    </div>
                  )}
                  {solicitudDetalle.habitaciones && (
                    <div className="flex items-center gap-2 text-sm bg-[#17313A] px-3 py-2.5 rounded-lg">
                      <Bed className="h-4 w-4 text-[#8A8F97] shrink-0" />
                      <span className="text-white">{solicitudDetalle.habitaciones} habitaciones</span>
                    </div>
                  )}
                  {solicitudDetalle.banos && (
                    <div className="flex items-center gap-2 text-sm bg-[#17313A] px-3 py-2.5 rounded-lg">
                      <Bath className="h-4 w-4 text-[#8A8F97] shrink-0" />
                      <span className="text-white">{solicitudDetalle.banos} baños</span>
                    </div>
                  )}
                  {solicitudDetalle.area && (
                    <div className="flex items-center gap-2 text-sm bg-[#17313A] px-3 py-2.5 rounded-lg">
                      <Maximize className="h-4 w-4 text-[#8A8F97] shrink-0" />
                      <span className="text-white">{solicitudDetalle.area} m²</span>
                    </div>
                  )}
                </div>

                {/* Descripción / Notas del asesor */}
                {solicitudDetalle.descripcion && (
                  <div>
                    <p className="text-sm font-semibold text-white mb-2 flex items-center gap-1.5">
                      <FileText className="h-4 w-4 text-[var(--conectia-arcilla)]" />
                      Notas del asesor:
                    </p>
                    <p className="text-sm text-white bg-[#17313A] p-4 rounded-xl border-l-2 border-[var(--conectia-arcilla)]/30">{solicitudDetalle.descripcion}</p>
                  </div>
                )}

                {/* === SECCIÓN DE FOTOS === */}
                <div className="border-t border-gray-700/60 pt-5">
                  <p className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                    <Camera className="h-4 w-4 text-[var(--conectia-arcilla)]" />
                    Contenido de la propiedad ({(solicitudDetalle.imagenes || []).length})
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
                              className="text-white hover:text-[var(--conectia-arcilla)]"
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
                  <div className="border-2 border-dashed border-gray-600 rounded-xl p-6 text-center hover:border-[var(--conectia-arcilla)]/50 transition-colors mb-4 cursor-pointer">
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
                      <ImageIcon className="h-10 w-10 text-[#8A8F97] mx-auto mb-2" />
                      <p className="text-sm font-semibold text-white">Selecciona imágenes</p>
                      <p className="text-xs text-[#8A8F97]">Haz clic para subir fotos (máximo 30)</p>
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
                          <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                            <div className="h-full bg-[var(--conectia-arcilla)] rounded-full transition-all duration-300" style={{ width: `${uploadProgress}%` }} />
                          </div>
                          <p className="text-xs text-[#8A8F97] mt-1 text-center">{uploadProgress}%</p>
                        </div>
                      )}

                      <Button
                        onClick={handleUploadToSolicitud}
                        disabled={uploading}
                        className="w-full bg-[var(--conectia-arcilla)] hover:bg-[var(--conectia-arcilla-hover)] text-[#0F2027] font-semibold rounded-xl"
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
                  <p className="text-sm font-semibold text-white mb-2">Tus notas:</p>
                  <Textarea
                    value={notaFotografo}
                    onChange={(e) => setNotaFotografo(e.target.value)}
                    placeholder="Agrega notas sobre la sesión de fotos, horarios, observaciones..."
                    className="min-h-[80px] bg-white/5 border-white/15 text-white placeholder:text-[#4A4F57] focus:border-[var(--conectia-arcilla)]/50"
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
                        disabled={updatingId === solicitudDetalle.id || !(solicitudDetalle.imagenes || []).length}
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
          <div className="relative bg-white/[0.03] backdrop-blur-md border border-white/10 rounded-[24px] overflow-hidden overflow-hidden shadow-xl">
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
                  <p className="text-[#B0ACA6]">Cargando propiedades...</p>
                </div>
              ) : propiedades.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="w-16 h-16 bg-blue-500/10 rounded-2xl flex items-center justify-center mb-4">
                    <ImageOff className="h-8 w-8 text-blue-400/40" />
                  </div>
                  <h3 className="text-base font-semibold text-white mb-1">Sin propiedades</h3>
                  <p className="text-sm text-[#8A8F97]">No hay propiedades registradas aún.</p>
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
                        className="p-4 bg-white/[0.02] border border-white/10 rounded-xl hover:border-white/20 transition-colors"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex gap-3 flex-1 min-w-0">
                            {/* Thumbnail */}
                            <div className="w-16 h-16 rounded-xl bg-[#1A3540] flex-shrink-0 overflow-hidden">
                              {propiedad.imagen ? (
                                <img src={propiedad.imagen} alt="" className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <ImageOff className="h-6 w-6 text-[#4A4F57]" />
                                </div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-semibold text-white truncate">{propiedad.titulo}</h3>
                                <span className="shrink-0 text-xs px-2 py-0.5 rounded-full bg-gray-700 text-white">{propiedad.status || 'Disponible'}</span>
                              </div>
                              <div className="flex items-center gap-3 text-xs text-[#B0ACA6] mb-1">
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
                                <span className="flex items-center gap-1 text-[#8A8F97]">
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
                            className="bg-[var(--conectia-arcilla)] hover:bg-[var(--conectia-arcilla-hover)] text-[#0F2027] font-semibold shrink-0"
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
        <div className="relative bg-white/[0.03] backdrop-blur-md border border-white/10 rounded-[24px] overflow-hidden overflow-hidden shadow-xl mt-6">
          <div className="p-5 border-b border-white/10 px-6 pt-5 pb-4">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <div className="w-8 h-8 bg-[var(--conectia-arcilla)]/10 rounded-lg border border-[var(--conectia-arcilla)]/20 flex items-center justify-center">
                <Banknote className="h-4 w-4 text-[var(--conectia-arcilla)]" />
              </div>
              Estructura de Comisiones
            </h2>
          </div>
          <div className="p-5">
            <div className="grid md:grid-cols-3 gap-4">
              <div className="text-center p-5 bg-white/[0.02] rounded-xl border border-white/10">
                <p className="text-xs text-[#8A8F97] uppercase tracking-wider mb-2">Comisión CONECTIA</p>
                <p className="text-4xl font-black text-white">2%</p>
                <p className="text-xs text-[#8A8F97] mt-1">del precio de venta</p>
              </div>
              <div className="text-center p-5 bg-[var(--conectia-arcilla)]/10 rounded-xl border-2 border-[var(--conectia-arcilla)]/40 shadow-lg shadow-[var(--conectia-arcilla)]/10">
                <p className="text-xs text-[#B0ACA6] uppercase tracking-wider mb-2">Tu Comisión</p>
                <p className="text-4xl font-black text-[var(--conectia-arcilla)]">13.5%</p>
                <p className="text-xs text-[#B0ACA6] mt-1">de la comisión CONECTIA</p>
              </div>
              <div className="text-center p-5 bg-green-500/10 rounded-xl border border-green-500/20">
                <p className="text-xs text-[#B0ACA6] uppercase tracking-wider mb-2">Tu % del Total</p>
                <p className="text-4xl font-black text-green-400">0.27%</p>
                <p className="text-xs text-[#B0ACA6] mt-1">del precio de venta</p>
              </div>
            </div>
            <div className="mt-4 p-4 bg-blue-500/10 rounded-xl border border-blue-500/20">
              <p className="text-sm text-blue-300">
                <strong>Ejemplo:</strong> Por una propiedad vendida en $5,000,000 MXN:
              </p>
              <div className="flex flex-wrap gap-4 mt-2 text-sm">
                <span className="text-[#B0ACA6]">Comisión CONECTIA: <strong className="text-white">$100,000</strong></span>
                <span className="text-green-400 font-bold">→ Tu comisión: $13,500</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
