"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import {
  Camera,
  CheckCircle,
  XCircle,
  Clock,
  MapPin,
  DollarSign,
  Image as ImageIcon,
  ArrowLeft,
  Eye,
  AlertCircle
} from "lucide-react"

interface SolicitudFotografo {
  id: string
  fotografo_id: string
  titulo: string
  ubicacion: string
  descripcion?: string
  precio_estimado?: number
  imagenes: string[]
  status: 'pendiente' | 'aprobada' | 'rechazada'
  created_at: string
  notas_admin?: string
}

// Lista de asesores autorizados para ver solicitudes del fotógrafo
const ASESORES_AUTORIZADOS = ['lizzie@conectia.mx']

export default function SolicitudesFotografoAsesorPage() {
  const { user, isAuthenticated } = useAuth()
  const router = useRouter()
  const [solicitudes, setSolicitudes] = useState<SolicitudFotografo[]>([])
  const [loading, setLoading] = useState(true)
  const [processingId, setProcessingId] = useState<string | null>(null)
  const [selectedSolicitud, setSelectedSolicitud] = useState<SolicitudFotografo | null>(null)
  const [notasAsesor, setNotasAsesor] = useState("")

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'asesor') {
      router.push('/login')
      return
    }

    // Verificar si el asesor está autorizado
    if (!ASESORES_AUTORIZADOS.includes(user.email)) {
      router.push('/panel-asesor')
      return
    }

    loadSolicitudes()
  }, [user, isAuthenticated, router])

  const loadSolicitudes = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/solicitudes-fotografo')
      if (!res.ok) throw new Error('Error al cargar solicitudes')
      
      const data = await res.json()
      setSolicitudes(data.solicitudes || [])
    } catch (error) {
      console.error('Error loading requests:', error)
    } finally {
      setLoading(false)
    }
  }

  const confirmarSolicitud = async (solicitud: SolicitudFotografo) => {
    if (!confirm('¿Confirmar esta solicitud? Se notificará al administrador para su aprobación final.')) return

    setProcessingId(solicitud.id)
    try {
      const res = await fetch('/api/solicitudes-fotografo', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: solicitud.id,
          notas_admin: `[Confirmado por ${user?.nombre}] ${notasAsesor || 'Solicitud verificada y confirmada'}`
        })
      })

      if (!res.ok) throw new Error('Error al confirmar')

      alert('Solicitud confirmada. El administrador será notificado.')
      setNotasAsesor("")
      setSelectedSolicitud(null)
      loadSolicitudes()
    } catch (error) {
      console.error('Error confirming request:', error)
      alert('Error al confirmar la solicitud')
    } finally {
      setProcessingId(null)
    }
  }

  const agregarObservacion = async (solicitud: SolicitudFotografo) => {
    if (!notasAsesor.trim()) {
      alert('Por favor, agrega una observación')
      return
    }

    setProcessingId(solicitud.id)
    try {
      const notaActual = solicitud.notas_admin || ''
      const nuevaNota = `${notaActual}\n[Observación de ${user?.nombre}]: ${notasAsesor}`
      
      const res = await fetch('/api/solicitudes-fotografo', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: solicitud.id,
          notas_admin: nuevaNota.trim()
        })
      })

      if (!res.ok) throw new Error('Error al agregar observación')

      alert('Observación agregada')
      setNotasAsesor("")
      setSelectedSolicitud(null)
      loadSolicitudes()
    } catch (error) {
      console.error('Error adding observation:', error)
      alert('Error al agregar la observación')
    } finally {
      setProcessingId(null)
    }
  }

  if (!user) return null

  // Verificar autorización
  if (!ASESORES_AUTORIZADOS.includes(user.email)) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-100 to-gray-50 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="p-8 text-center">
            <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">Acceso Restringido</h2>
            <p className="text-gray-600 mb-4">No tienes permisos para ver esta sección.</p>
            <Button onClick={() => router.push('/panel-asesor')}>
              Volver al Panel
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const pendientes = solicitudes.filter(s => s.status === 'pendiente').length
  const aprobadas = solicitudes.filter(s => s.status === 'aprobada').length
  const rechazadas = solicitudes.filter(s => s.status === 'rechazada').length

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-100 to-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-conectia-graphite to-gray-900 text-white py-6">
        <div className="container mx-auto px-4">
          <Button
            onClick={() => router.push('/panel-asesor')}
            variant="ghost"
            className="text-white hover:bg-white/10 mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver al Panel
          </Button>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-conectia-primary rounded-full flex items-center justify-center">
              <Camera className="h-6 w-6 text-conectia-accent" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Solicitudes del Fotógrafo</h1>
              <p className="text-gray-300">Revisa y confirma las propiedades enviadas por Santiago</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <Card className="border-0 shadow-lg">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                  <Clock className="h-5 w-5 text-yellow-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Pendientes</p>
                  <p className="text-2xl font-bold text-yellow-600">{pendientes}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Aprobadas</p>
                  <p className="text-2xl font-bold text-green-600">{aprobadas}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                  <XCircle className="h-5 w-5 text-red-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Rechazadas</p>
                  <p className="text-2xl font-bold text-red-600">{rechazadas}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Lista de Solicitudes */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle>Solicitudes del Fotógrafo ({solicitudes.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-12">
                <p className="text-gray-500">Cargando solicitudes...</p>
              </div>
            ) : solicitudes.length === 0 ? (
              <div className="text-center py-12">
                <Camera className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No hay solicitudes aún</p>
              </div>
            ) : (
              <div className="space-y-4">
                {solicitudes.map((solicitud) => {
                  const statusConfig = {
                    pendiente: {
                      color: 'bg-yellow-100 text-yellow-700 border-yellow-300',
                      icon: Clock,
                      text: 'Pendiente'
                    },
                    aprobada: {
                      color: 'bg-green-100 text-green-700 border-green-300',
                      icon: CheckCircle,
                      text: 'Aprobada'
                    },
                    rechazada: {
                      color: 'bg-red-100 text-red-700 border-red-300',
                      icon: XCircle,
                      text: 'Rechazada'
                    }
                  }
                  const config = statusConfig[solicitud.status]
                  const StatusIcon = config.icon
                  const isSelected = selectedSolicitud?.id === solicitud.id

                  return (
                    <div
                      key={solicitud.id}
                      className={`p-4 border rounded-xl transition-all ${
                        isSelected ? 'border-conectia-primary shadow-lg' : 'border-gray-200'
                      }`}
                    >
                      <div className="space-y-4">
                        {/* Header */}
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="font-semibold text-lg">{solicitud.titulo}</h3>
                              <Badge className={`${config.color} border`}>
                                <StatusIcon className="h-3 w-3 mr-1" />
                                {config.text}
                              </Badge>
                            </div>
                            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-2">
                              <span className="flex items-center gap-1">
                                <MapPin className="h-4 w-4" />
                                {solicitud.ubicacion}
                              </span>
                              {solicitud.precio_estimado && (
                                <span className="flex items-center gap-1">
                                  <DollarSign className="h-4 w-4" />
                                  ${solicitud.precio_estimado.toLocaleString('es-MX')}
                                </span>
                              )}
                              <span className="flex items-center gap-1 text-blue-600">
                                <ImageIcon className="h-4 w-4" />
                                {solicitud.imagenes.length} foto{solicitud.imagenes.length !== 1 ? 's' : ''}
                              </span>
                              <span className="text-gray-500">
                                {new Date(solicitud.created_at).toLocaleDateString('es-MX')}
                              </span>
                            </div>
                            {solicitud.descripcion && (
                              <p className="text-sm text-gray-600 mb-2">{solicitud.descripcion}</p>
                            )}
                          </div>
                          <Button
                            onClick={() => setSelectedSolicitud(isSelected ? null : solicitud)}
                            variant="outline"
                            size="sm"
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            {isSelected ? 'Ocultar' : 'Revisar'}
                          </Button>
                        </div>

                        {/* Galería de Imágenes */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                          {solicitud.imagenes.map((url, idx) => (
                            <img
                              key={idx}
                              src={url}
                              alt={`Foto ${idx + 1}`}
                              className="w-full h-32 object-cover rounded-lg cursor-pointer hover:opacity-80 transition-opacity"
                              onClick={() => window.open(url, '_blank')}
                            />
                          ))}
                        </div>

                        {/* Notas (si existen) */}
                        {solicitud.notas_admin && (
                          <div className="p-3 bg-blue-50 rounded-lg">
                            <p className="text-sm text-blue-900 whitespace-pre-line">
                              <strong>Notas:</strong> {solicitud.notas_admin}
                            </p>
                          </div>
                        )}

                        {/* Panel de Acciones */}
                        {isSelected && (
                          <div className="p-4 bg-gray-50 rounded-lg space-y-4">
                            <div>
                              <label className="block text-sm font-semibold mb-2">
                                Agregar observación o comentario
                              </label>
                              <Textarea
                                value={notasAsesor}
                                onChange={(e) => setNotasAsesor(e.target.value)}
                                placeholder="Agrega comentarios sobre la propiedad..."
                                rows={3}
                                className="w-full"
                              />
                            </div>
                            <div className="flex gap-3">
                              {solicitud.status === 'pendiente' && (
                                <Button
                                  onClick={() => confirmarSolicitud(solicitud)}
                                  disabled={processingId === solicitud.id}
                                  className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                                >
                                  <CheckCircle className="h-4 w-4 mr-2" />
                                  {processingId === solicitud.id ? 'Procesando...' : 'Confirmar Solicitud'}
                                </Button>
                              )}
                              <Button
                                onClick={() => agregarObservacion(solicitud)}
                                disabled={processingId === solicitud.id || !notasAsesor.trim()}
                                variant="outline"
                                className="flex-1"
                              >
                                Agregar Observación
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
