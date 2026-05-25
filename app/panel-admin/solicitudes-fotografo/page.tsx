"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { supabase } from "@/lib/supabase/client"
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

export default function SolicitudesFotografoPage() {
  const { user, isAuthenticated } = useAuth()
  const router = useRouter()
  const [solicitudes, setSolicitudes] = useState<SolicitudFotografo[]>([])
  const [loading, setLoading] = useState(true)
  const [processingId, setProcessingId] = useState<string | null>(null)
  const [selectedSolicitud, setSelectedSolicitud] = useState<SolicitudFotografo | null>(null)
  const [notasAdmin, setNotasAdmin] = useState("")

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'admin') {
      router.push('/login')
      return
    }
    loadSolicitudes()
  }, [user, isAuthenticated, router])

  const loadSolicitudes = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('solicitudes_fotografo')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setSolicitudes(data || [])
    } catch (error) {
      console.error('Error loading requests:', error)
    } finally {
      setLoading(false)
    }
  }

  const aprobarSolicitud = async (solicitud: SolicitudFotografo) => {
    if (!confirm('¿Aprobar esta solicitud y crear la propiedad?')) return

    setProcessingId(solicitud.id)
    try {
      // 1. Crear la propiedad en la tabla propiedades
      const { data: nuevaPropiedad, error: propError } = await supabase
        .from('propiedades')
        .insert({
          titulo: solicitud.titulo,
          ubicacion: solicitud.ubicacion,
          descripcion: solicitud.descripcion || '',
          precio: solicitud.precio_estimado || 0,
          precio_texto: solicitud.precio_estimado 
            ? `$${solicitud.precio_estimado.toLocaleString('es-MX')}`
            : 'Precio a consultar',
          imagenes: solicitud.imagenes,
          status: 'Disponible',
          fotografo_id: solicitud.fotografo_id
        })
        .select()
        .single()

      if (propError) throw propError

      // 2. Actualizar el estado de la solicitud
      const { error: updateError } = await supabase
        .from('solicitudes_fotografo')
        .update({
          status: 'aprobada',
          aprobada_at: new Date().toISOString(),
          notas_admin: notasAdmin || 'Solicitud aprobada y propiedad creada'
        })
        .eq('id', solicitud.id)

      if (updateError) throw updateError

      alert('¡Solicitud aprobada! La propiedad ha sido creada.')
      setNotasAdmin("")
      setSelectedSolicitud(null)
      loadSolicitudes()
    } catch (error) {
      console.error('Error approving request:', error)
      alert('Error al aprobar la solicitud')
    } finally {
      setProcessingId(null)
    }
  }

  const rechazarSolicitud = async (solicitud: SolicitudFotografo) => {
    if (!notasAdmin.trim()) {
      alert('Por favor, agrega una nota explicando el motivo del rechazo')
      return
    }

    if (!confirm('¿Rechazar esta solicitud?')) return

    setProcessingId(solicitud.id)
    try {
      const { error } = await supabase
        .from('solicitudes_fotografo')
        .update({
          status: 'rechazada',
          aprobada_at: new Date().toISOString(),
          notas_admin: notasAdmin
        })
        .eq('id', solicitud.id)

      if (error) throw error

      alert('Solicitud rechazada')
      setNotasAdmin("")
      setSelectedSolicitud(null)
      loadSolicitudes()
    } catch (error) {
      console.error('Error rejecting request:', error)
      alert('Error al rechazar la solicitud')
    } finally {
      setProcessingId(null)
    }
  }

  if (!user) return null

  const pendientes = solicitudes.filter(s => s.status === 'pendiente').length
  const aprobadas = solicitudes.filter(s => s.status === 'aprobada').length
  const rechazadas = solicitudes.filter(s => s.status === 'rechazada').length

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-100 to-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-conectia-graphite to-gray-900 text-white py-6">
        <div className="container mx-auto px-4">
          <Button
            onClick={() => router.push('/panel-admin')}
            variant="ghost"
            className="text-white hover:bg-white/10 mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver al Panel Admin
          </Button>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-conectia-primary rounded-full flex items-center justify-center">
              <Camera className="h-6 w-6 text-conectia-accent" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Solicitudes de Fotógrafo</h1>
              <p className="text-gray-300">Revisar y aprobar propiedades enviadas por Santiago</p>
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
            <CardTitle>Todas las Solicitudes ({solicitudes.length})</CardTitle>
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
                          {solicitud.status === 'pendiente' && (
                            <Button
                              onClick={() => setSelectedSolicitud(isSelected ? null : solicitud)}
                              variant="outline"
                              size="sm"
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              {isSelected ? 'Ocultar' : 'Revisar'}
                            </Button>
                          )}
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

                        {/* Notas Admin (si existen) */}
                        {solicitud.notas_admin && (
                          <div className="p-3 bg-blue-50 rounded-lg">
                            <p className="text-sm text-blue-900">
                              <strong>Nota del admin:</strong> {solicitud.notas_admin}
                            </p>
                          </div>
                        )}

                        {/* Panel de Acciones (solo para pendientes) */}
                        {isSelected && solicitud.status === 'pendiente' && (
                          <div className="p-4 bg-gray-50 rounded-lg space-y-4">
                            <div>
                              <label className="block text-sm font-semibold mb-2">
                                Notas para el fotógrafo (opcional)
                              </label>
                              <Textarea
                                value={notasAdmin}
                                onChange={(e) => setNotasAdmin(e.target.value)}
                                placeholder="Agrega comentarios o instrucciones..."
                                rows={3}
                                className="w-full"
                              />
                            </div>
                            <div className="flex gap-3">
                              <Button
                                onClick={() => aprobarSolicitud(solicitud)}
                                disabled={processingId === solicitud.id}
                                className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                              >
                                <CheckCircle className="h-4 w-4 mr-2" />
                                {processingId === solicitud.id ? 'Procesando...' : 'Aprobar y Crear Propiedad'}
                              </Button>
                              <Button
                                onClick={() => rechazarSolicitud(solicitud)}
                                disabled={processingId === solicitud.id}
                                variant="destructive"
                                className="flex-1"
                              >
                                <XCircle className="h-4 w-4 mr-2" />
                                Rechazar
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
