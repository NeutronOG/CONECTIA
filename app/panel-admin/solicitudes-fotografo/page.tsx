"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { supabase } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
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
  AlertCircle,
  Aperture
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
    <div className="min-h-screen bg-[#0F2027] text-[#EAE4DD] p-4 sm:p-6 lg:p-8 relative overflow-hidden">
      {/* Glow orbs */}
      <div className="fixed top-0 right-0 w-[500px] h-[500px] bg-[var(--conectia-arcilla)]/5 rounded-full blur-[150px] pointer-events-none" />
      <div className="fixed bottom-0 left-0 w-[400px] h-[400px] bg-[#17313A]/60 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.push('/panel-admin')}
            className="flex items-center gap-2 text-[#B0ACA6] hover:text-white text-sm font-medium mb-3 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver al Panel
          </button>
          <h1 className="text-2xl sm:text-3xl font-black text-white flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[var(--conectia-arcilla)]/10 flex items-center justify-center border border-[var(--conectia-arcilla)]/20">
              <Aperture className="w-5 h-5 text-[var(--conectia-arcilla)]" />
            </div>
            Solicitudes de Fotógrafo
          </h1>
          <p className="text-sm text-[#B0ACA6] mt-1">Revisar y aprobar propiedades enviadas por fotógrafos</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-8">
          {[
            { label: 'Pendientes', value: pendientes, accent: '#f59e0b', icon: Clock },
            { label: 'Aprobadas', value: aprobadas, accent: '#22c55e', icon: CheckCircle },
            { label: 'Rechazadas', value: rechazadas, accent: '#ef4444', icon: XCircle },
          ].map((stat, i) => (
            <div key={i} className="relative bg-white/[0.03] backdrop-blur-md border border-white/10 rounded-[20px] p-5 overflow-hidden hover:border-white/20 transition-all">
              <div className="absolute -top-6 -right-6 w-20 h-20 rounded-full pointer-events-none opacity-30" style={{ background: `${stat.accent}20` }} />
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${stat.accent}15` }}>
                  <stat.icon className="w-5 h-5" style={{ color: stat.accent }} />
                </div>
              </div>
              <p className="text-2xl sm:text-3xl font-black text-white">{stat.value}</p>
              <p className="text-xs text-[#8A8F97] mt-1">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Lista de Solicitudes */}
        <div className="relative bg-white/[0.03] backdrop-blur-md border border-white/10 rounded-[24px] overflow-hidden">
          <div className="p-5 sm:p-6 border-b border-white/10">
            <h2 className="text-lg font-bold text-white">Todas las Solicitudes ({solicitudes.length})</h2>
          </div>
          <div className="p-5 sm:p-6">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="w-10 h-10 border-2 border-[var(--conectia-arcilla)]/30 border-t-[var(--conectia-arcilla)] rounded-full animate-spin" />
              </div>
            ) : solicitudes.length === 0 ? (
              <div className="text-center py-12">
                <Camera className="h-12 w-12 text-[#4A4F57] mx-auto mb-3" />
                <p className="text-white font-semibold mb-1">No hay solicitudes aún</p>
                <p className="text-sm text-[#8A8F97]">Las solicitudes de fotógrafos aparecerán aquí</p>
              </div>
            ) : (
              <div className="space-y-4">
                {solicitudes.map((solicitud) => {
                  const statusConfig = {
                    pendiente: {
                      color: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
                      icon: Clock,
                      text: 'Pendiente'
                    },
                    aprobada: {
                      color: 'bg-green-500/10 text-green-400 border-green-500/20',
                      icon: CheckCircle,
                      text: 'Aprobada'
                    },
                    rechazada: {
                      color: 'bg-red-500/10 text-red-400 border-red-500/20',
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
                      className={`p-4 sm:p-5 rounded-[16px] border transition-all ${
                        isSelected ? 'border-[var(--conectia-arcilla)]/40 bg-white/[0.05]' : 'border-white/10 bg-white/[0.03]'
                      }`}
                    >
                      <div className="space-y-4">
                        {/* Header */}
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2 flex-wrap">
                              <h3 className="font-bold text-lg text-white">{solicitud.titulo}</h3>
                              <span className={`px-2 py-0.5 rounded-full text-xs font-semibold border flex items-center gap-1 ${config.color}`}>
                                <StatusIcon className="h-3 w-3" />
                                {config.text}
                              </span>
                            </div>
                            <div className="flex flex-wrap items-center gap-4 text-sm text-[#8A8F97] mb-2">
                              <span className="flex items-center gap-1">
                                <MapPin className="h-4 w-4 text-[var(--conectia-arcilla)]" />
                                {solicitud.ubicacion}
                              </span>
                              {solicitud.precio_estimado && (
                                <span className="flex items-center gap-1">
                                  <DollarSign className="h-4 w-4 text-[var(--conectia-arcilla)]" />
                                  ${solicitud.precio_estimado.toLocaleString('es-MX')}
                                </span>
                              )}
                              <span className="flex items-center gap-1 text-blue-400">
                                <ImageIcon className="h-4 w-4" />
                                {solicitud.imagenes.length} foto{solicitud.imagenes.length !== 1 ? 's' : ''}
                              </span>
                              <span className="text-[#8A8F97]">
                                {new Date(solicitud.created_at).toLocaleDateString('es-MX')}
                              </span>
                            </div>
                            {solicitud.descripcion && (
                              <p className="text-sm text-[#B0ACA6] mb-2">{solicitud.descripcion}</p>
                            )}
                          </div>
                          {solicitud.status === 'pendiente' && (
                            <Button
                              onClick={() => setSelectedSolicitud(isSelected ? null : solicitud)}
                              variant="outline"
                              size="sm"
                              className="border-white/10 text-[#EAE4DD] hover:bg-white/5 flex-shrink-0"
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
                              className="w-full h-32 object-cover rounded-[12px] cursor-pointer hover:opacity-80 transition-opacity border border-white/10"
                              onClick={() => window.open(url, '_blank')}
                            />
                          ))}
                        </div>

                        {/* Notas Admin (si existen) */}
                        {solicitud.notas_admin && (
                          <div className="p-3 bg-blue-500/5 rounded-[12px] border border-blue-500/20">
                            <p className="text-sm text-blue-300">
                              <strong>Nota del admin:</strong> {solicitud.notas_admin}
                            </p>
                          </div>
                        )}

                        {/* Panel de Acciones (solo para pendientes) */}
                        {isSelected && solicitud.status === 'pendiente' && (
                          <div className="p-4 bg-white/[0.03] rounded-[16px] border border-white/10 space-y-4">
                            <div>
                              <label className="block text-sm font-semibold text-white mb-2">
                                Notas para el fotógrafo (opcional)
                              </label>
                              <Textarea
                                value={notasAdmin}
                                onChange={(e) => setNotasAdmin(e.target.value)}
                                placeholder="Agrega comentarios o instrucciones..."
                                rows={3}
                                className="w-full bg-[#0F2027] border-white/10 text-white placeholder:text-[#4A4F57]"
                              />
                            </div>
                            <div className="flex gap-3">
                              <Button
                                onClick={() => aprobarSolicitud(solicitud)}
                                disabled={processingId === solicitud.id}
                                className="flex-1 bg-green-500/10 text-green-400 border border-green-500/20 hover:bg-green-500/20"
                              >
                                <CheckCircle className="h-4 w-4 mr-2" />
                                {processingId === solicitud.id ? 'Procesando...' : 'Aprobar y Crear Propiedad'}
                              </Button>
                              <Button
                                onClick={() => rechazarSolicitud(solicitud)}
                                disabled={processingId === solicitud.id}
                                variant="outline"
                                className="flex-1 border-red-500/20 text-red-400 hover:bg-red-500/10 hover:border-red-500/30"
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
          </div>
        </div>
      </div>
    </div>
  )
}
