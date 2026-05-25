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
    <div className="min-h-screen bg-gradient-to-b from-gray-100 to-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-conectia-dark to-gray-900 text-white py-8">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-conectia-gold rounded-full flex items-center justify-center">
                <Camera className="h-8 w-8 text-black" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Panel de Fotografía</h1>
                <p className="text-gray-300">{user.nombre || 'Santiago Canales'} - Fotógrafo & Videógrafo</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 text-white/90 hover:text-white hover:bg-white/10 rounded-xl transition-all"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Cerrar Sesión</span>
            </button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="border-0 shadow-lg">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center relative">
                  <Inbox className="h-5 w-5 text-red-600" />
                  {solicitudesPendientes.length > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">
                      {solicitudesPendientes.length}
                    </span>
                  )}
                </div>
                <div>
                  <p className="text-xs text-gray-500">Solicitudes Pendientes</p>
                  <p className="text-lg font-bold text-red-600">{solicitudesPendientes.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <Home className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Total Propiedades</p>
                  <p className="text-lg font-bold text-blue-600">{totalPropiedades}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <Camera className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Con Fotos</p>
                  <p className="text-lg font-bold text-green-600">{propiedadesConFotos}/{totalPropiedades}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-conectia-gold/20 rounded-full flex items-center justify-center">
                  <DollarSign className="h-5 w-5 text-conectia-gold" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Comisiones</p>
                  <p className="text-lg font-bold text-conectia-gold">
                    ${totalComisiones.toLocaleString('es-MX', { minimumFractionDigits: 0 })}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <Button
            variant={tab === 'solicitudes' ? 'default' : 'outline'}
            onClick={() => { setTab('solicitudes'); setSolicitudDetalle(null) }}
            className={tab === 'solicitudes' ? 'bg-conectia-gold hover:bg-conectia-gold/90 text-black' : ''}
          >
            <Inbox className="h-4 w-4 mr-2" />
            Solicitudes de Asesores
            {solicitudesPendientes.length > 0 && (
              <span className="ml-2 bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                {solicitudesPendientes.length}
              </span>
            )}
          </Button>
          <Button
            variant={tab === 'propiedades' ? 'default' : 'outline'}
            onClick={() => setTab('propiedades')}
            className={tab === 'propiedades' ? 'bg-conectia-gold hover:bg-conectia-gold/90 text-black' : ''}
          >
            <Home className="h-4 w-4 mr-2" />
            Todas las Propiedades ({totalPropiedades})
          </Button>
        </div>

        {/* Tab: Solicitudes */}
        {tab === 'solicitudes' && !solicitudDetalle && (
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Inbox className="h-5 w-5 text-conectia-gold" />
                Solicitudes de Propiedades ({solicitudes.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-12">
                  <p className="text-gray-500">Cargando solicitudes...</p>
                </div>
              ) : solicitudes.length === 0 ? (
                <div className="text-center py-12">
                  <Inbox className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">Sin solicitudes</h3>
                  <p className="text-gray-500 text-sm max-w-md mx-auto">
                    Cuando un asesor envíe una solicitud de propiedad, aparecerá aquí para que subas las fotos.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {solicitudes.map((sol) => {
                    const statusConfig: Record<string, { color: string; text: string }> = {
                      pendiente: { color: 'bg-yellow-100 text-yellow-700 border-yellow-300', text: 'Pendiente' },
                      en_proceso: { color: 'bg-blue-100 text-blue-700 border-blue-300', text: 'En Proceso' },
                      completada: { color: 'bg-green-100 text-green-700 border-green-300', text: 'Completada' },
                      rechazada: { color: 'bg-red-100 text-red-700 border-red-300', text: 'Rechazada' }
                    }
                    const config = statusConfig[sol.status] || statusConfig.pendiente

                    return (
                      <div
                        key={sol.id}
                        onClick={() => { setSolicitudDetalle(sol); setNotaFotografo(sol.notas_fotografo || '') }}
                        className="p-4 border border-gray-200 rounded-xl hover:shadow-md hover:border-conectia-gold/50 transition-all cursor-pointer group"
                      >
                        <div className="flex items-center justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-semibold text-lg truncate">{sol.titulo}</h3>
                              <Badge className={`${config.color} border text-xs`}>{config.text}</Badge>
                            </div>
                            <div className="flex items-center gap-3 text-sm text-gray-500">
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
                          <ChevronRight className="h-5 w-5 text-gray-300 group-hover:text-conectia-gold transition-colors" />
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Detalle de Solicitud */}
        {tab === 'solicitudes' && solicitudDetalle && (
          <div className="space-y-6">
            <Button variant="ghost" onClick={() => setSolicitudDetalle(null)}>
              ← Volver a solicitudes
            </Button>

            <Card className="border-0 shadow-lg">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl">{solicitudDetalle.titulo}</CardTitle>
                  <Badge className={
                    solicitudDetalle.status === 'pendiente' ? 'bg-yellow-100 text-yellow-700 border-yellow-300 border' :
                    solicitudDetalle.status === 'en_proceso' ? 'bg-blue-100 text-blue-700 border-blue-300 border' :
                    solicitudDetalle.status === 'completada' ? 'bg-green-100 text-green-700 border-green-300 border' :
                    'bg-red-100 text-red-700 border-red-300 border'
                  }>
                    {solicitudDetalle.status === 'pendiente' ? 'Pendiente' :
                     solicitudDetalle.status === 'en_proceso' ? 'En Proceso' :
                     solicitudDetalle.status === 'completada' ? 'Completada' : 'Rechazada'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Info del asesor */}
                <div className="p-4 bg-blue-50 rounded-xl">
                  <p className="text-sm font-medium text-blue-700 mb-1">Solicitado por:</p>
                  <p className="text-blue-900 font-semibold">{solicitudDetalle.asesor_nombre || 'Sin nombre'}</p>
                  <p className="text-sm text-blue-600">{solicitudDetalle.asesor_email}</p>
                </div>

                {/* Datos de la propiedad */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {solicitudDetalle.ubicacion && (
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="h-4 w-4 text-gray-400" />
                      <span>{solicitudDetalle.ubicacion}</span>
                    </div>
                  )}
                  {solicitudDetalle.tipo && (
                    <div className="flex items-center gap-2 text-sm">
                      <Home className="h-4 w-4 text-gray-400" />
                      <span>{solicitudDetalle.tipo}</span>
                    </div>
                  )}
                  {solicitudDetalle.precio_estimado && (
                    <div className="flex items-center gap-2 text-sm">
                      <DollarSign className="h-4 w-4 text-gray-400" />
                      <span>${solicitudDetalle.precio_estimado.toLocaleString('es-MX')}</span>
                    </div>
                  )}
                  {solicitudDetalle.habitaciones && (
                    <div className="flex items-center gap-2 text-sm">
                      <Bed className="h-4 w-4 text-gray-400" />
                      <span>{solicitudDetalle.habitaciones} habitaciones</span>
                    </div>
                  )}
                  {solicitudDetalle.banos && (
                    <div className="flex items-center gap-2 text-sm">
                      <Bath className="h-4 w-4 text-gray-400" />
                      <span>{solicitudDetalle.banos} baños</span>
                    </div>
                  )}
                  {solicitudDetalle.area && (
                    <div className="flex items-center gap-2 text-sm">
                      <Maximize className="h-4 w-4 text-gray-400" />
                      <span>{solicitudDetalle.area} m²</span>
                    </div>
                  )}
                </div>

                {/* Descripción / Notas del asesor */}
                {solicitudDetalle.descripcion && (
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                      <FileText className="h-4 w-4" />
                      Notas del asesor:
                    </p>
                    <p className="text-sm text-gray-600 bg-gray-50 p-4 rounded-xl">{solicitudDetalle.descripcion}</p>
                  </div>
                )}

                {/* === SECCIÓN DE FOTOS === */}
                <div className="border-t pt-6">
                  <p className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                    <Camera className="h-4 w-4 text-conectia-gold" />
                    Fotos de la propiedad ({(solicitudDetalle.imagenes || []).length})
                  </p>

                  {/* Fotos existentes */}
                  {(solicitudDetalle.imagenes || []).length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                      {(solicitudDetalle.imagenes || []).map((imgUrl, idx) => (
                        <div key={idx} className="relative group">
                          <img src={imgUrl} alt={`Foto ${idx + 1}`} className="w-full h-32 object-cover rounded-lg" />
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-2">
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
                  <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-conectia-gold transition-colors mb-4">
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
                      <ImageIcon className="h-10 w-10 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm font-semibold text-gray-700">Selecciona imágenes</p>
                      <p className="text-xs text-gray-500">Haz clic para subir fotos de esta propiedad (máximo 30)</p>
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
                        className="w-full bg-conectia-gold hover:bg-conectia-gold/90 text-black font-semibold"
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
                  <p className="text-sm font-medium text-gray-700 mb-2">Tus notas:</p>
                  <Textarea
                    value={notaFotografo}
                    onChange={(e) => setNotaFotografo(e.target.value)}
                    placeholder="Agrega notas sobre la sesión de fotos, horarios, observaciones..."
                    className="min-h-[80px]"
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
              </CardContent>
            </Card>
          </div>
        )}

        {/* Tab: Todas las Propiedades */}
        {tab === 'propiedades' && (
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Home className="h-5 w-5 text-conectia-gold" />
                Todas las Propiedades ({totalPropiedades})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-12">
                  <p className="text-gray-500">Cargando propiedades...</p>
                </div>
              ) : propiedades.length === 0 ? (
                <div className="text-center py-12">
                  <ImageOff className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">Sin propiedades</h3>
                  <p className="text-gray-500 text-sm">No hay propiedades registradas aún.</p>
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
                        className="p-4 border border-gray-200 rounded-xl hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex gap-4 flex-1 min-w-0">
                            {/* Thumbnail */}
                            <div className="w-20 h-20 rounded-lg bg-gray-100 flex-shrink-0 overflow-hidden">
                              {propiedad.imagen ? (
                                <img src={propiedad.imagen} alt="" className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <ImageOff className="h-8 w-8 text-gray-300" />
                                </div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-semibold truncate">{propiedad.titulo}</h3>
                                <Badge variant="secondary" className="text-xs">{propiedad.status || 'Disponible'}</Badge>
                              </div>
                              <div className="flex items-center gap-3 text-sm text-gray-500 mb-1">
                                <span className="flex items-center gap-1">
                                  <MapPin className="h-3.5 w-3.5" />
                                  {propiedad.ubicacion}
                                </span>
                                <span className="flex items-center gap-1">
                                  <DollarSign className="h-3.5 w-3.5" />
                                  {propiedad.precioTexto || propiedad.precio_texto || `$${(propiedad.precio || 0).toLocaleString('es-MX')}`}
                                </span>
                              </div>
                              <div className="flex items-center gap-3 text-xs text-gray-400">
                                <span className="flex items-center gap-1">
                                  <User className="h-3 w-3" />
                                  {asesor}
                                </span>
                                <span className={`flex items-center gap-1 ${tieneImagen ? 'text-green-600' : 'text-red-500'}`}>
                                  <Camera className="h-3 w-3" />
                                  {tieneImagen ? `${numGaleria > 0 ? numGaleria + ' fotos' : 'Con imagen'}` : 'Sin fotos'}
                                </span>
                              </div>
                            </div>
                          </div>
                          <Button
                            size="sm"
                            onClick={() => router.push(`/panel-fotografo/propiedades/${propiedad.id}`)}
                            className="bg-conectia-gold hover:bg-conectia-gold/90 text-black"
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
            </CardContent>
          </Card>
        )}

        {/* Resumen de Comisiones */}
        <Card className="border-0 shadow-lg mt-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Banknote className="h-5 w-5 text-conectia-gold" />
              Estructura de Comisiones
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center p-4 bg-conectia-secondary/70 rounded-xl">
                <p className="text-sm text-gray-500 mb-1">Comisión CONECTIA</p>
                <p className="text-3xl font-bold text-gray-900">2%</p>
                <p className="text-xs text-gray-400">del precio de venta</p>
              </div>
              <div className="text-center p-4 bg-conectia-gold/10 rounded-xl border-2 border-conectia-gold/30">
                <p className="text-sm text-gray-500 mb-1">Tu Comisión</p>
                <p className="text-3xl font-bold text-conectia-gold">13.5%</p>
                <p className="text-xs text-gray-400">de la comisión CONECTIA</p>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-xl">
                <p className="text-sm text-gray-500 mb-1">Tu % del Total</p>
                <p className="text-3xl font-bold text-green-600">0.27%</p>
                <p className="text-xs text-gray-400">del precio de venta</p>
              </div>
            </div>
            <div className="mt-6 p-4 bg-blue-50 rounded-xl">
              <p className="text-sm text-blue-800">
                <strong>Ejemplo:</strong> Por una propiedad vendida en $5,000,000 MXN:
              </p>
              <div className="flex flex-wrap gap-4 mt-2 text-sm">
                <span className="text-gray-600">Comisión CONECTIA: <strong>$100,000</strong></span>
                <span className="text-emerald-600 font-bold">→ Tu comisión: $13,500</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
