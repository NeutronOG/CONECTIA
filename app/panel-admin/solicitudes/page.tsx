'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/auth-context'
import { OwnerSubmissionsStorage, OwnerSubmission } from '@/lib/owner-submissions-storage'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  ArrowLeft,
  Home,
  User,
  Phone,
  Mail,
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  Trash2,
  Building2,
  Camera,
  FileText,
  Tag,
  Inbox
} from 'lucide-react'

export default function SolicitudesPropietariosPage() {
  const { user, isAuthenticated } = useAuth()
  const router = useRouter()
  const [submissions, setSubmissions] = useState<OwnerSubmission[]>([])
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    contacted: 0,
    approved: 0,
    rejected: 0
  })

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'admin') {
      router.push('/login')
      return
    }

    loadSubmissions()
  }, [user, isAuthenticated, router])

  const loadSubmissions = () => {
    const allSubmissions = OwnerSubmissionsStorage.getAll()
    setSubmissions(allSubmissions)
    setStats(OwnerSubmissionsStorage.getStats())
  }

  const updateStatus = (id: string, status: OwnerSubmission['status']) => {
    OwnerSubmissionsStorage.updateStatus(id, status)
    loadSubmissions()
  }

  const deleteSubmission = (id: string) => {
    if (confirm('¿Estás seguro de eliminar esta solicitud?')) {
      OwnerSubmissionsStorage.delete(id)
      loadSubmissions()
    }
  }

  const propertyTypeLabels: Record<string, string> = {
    departamento: 'Departamento',
    terreno_lote: 'Terreno / Lote',
    local_comercial: 'Local Comercial',
    casa_condominio: 'Casa en Condominio',
    casa: 'Casa',
    bodega_comercial: 'Bodega Comercial',
    edificio: 'Edificio',
    duplex: 'Dúplex',
    nave: 'Nave',
    quinta: 'Quinta',
    terreno_comercial: 'Terreno Comercial',
    villa: 'Villa',
    oficina: 'Oficina',
    rancho: 'Rancho',
    terreno_industrial: 'Terreno Industrial',
    penthouse: 'Penthouse',
    loft: 'Loft',
    residencia: 'Residencia',
  }

  const urgencyLabels: Record<string, string> = {
    urgent: 'Menos de 3 meses',
    medium: '3-6 meses',
    flexible: '6-12 meses',
    patient: 'Sin prisa',
  }

  const tipoConsultaLabels: Record<string, string> = {
    vender: 'Vender',
    rentar: 'Rentar',
    comprar: 'Comprar',
    general: 'Consulta general',
  }

  const contactLabels: Record<string, string> = {
    morning: 'Mañana (9-12)',
    afternoon: 'Tarde (12-18)',
    evening: 'Noche (18-21)',
    anytime: 'Cualquier horario',
  }

  const promocionLabels: Record<string, string> = {
    escrituras_gratis: 'Escrituras Gratis',
    meses_mantenimiento: '3 Meses Mantenimiento Gratis',
    mudanza_gratis: 'Mudanza Incluida',
    descuento_5: '5% Descuento Cierre Rápido',
    descuento_10: '10% Descuento Pago Contado',
    amueblado: 'Incluye Mobiliario',
    remodelacion: 'Remodelación Incluida',
    electrodomesticos: 'Electrodomésticos Incluidos',
    estacionamiento_extra: 'Estacionamiento Extra Gratis',
    bodega_extra: 'Bodega Adicional Incluida',
    comision_reducida: 'Comisión Reducida',
    personalizada: 'Personalizada',
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-yellow-500/10 text-yellow-400 border border-yellow-500/20">Pendiente</span>
      case 'contacted':
        return <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20">Contactado</span>
      case 'approved':
        return <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-green-500/10 text-green-400 border border-green-500/20">Aprobado</span>
      case 'rejected':
        return <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-red-500/10 text-red-400 border border-red-500/20">Rechazado</span>
      default:
        return <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-white/5 text-[#B0ACA6] border border-white/10">Desconocido</span>
    }
  }

  const formatCurrency = (value: string) => {
    const num = parseFloat(value.replace(/[^0-9.-]+/g, ''))
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      minimumFractionDigits: 0
    }).format(num)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-MX', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (!user) return null

  return (
    <div className="min-h-screen bg-[#0F2027] text-[#EAE4DD] p-4 sm:p-6 lg:p-8 relative overflow-hidden">
      {/* Glow orbs */}
      <div className="fixed top-0 right-0 w-[500px] h-[500px] bg-[#C78F7B]/5 rounded-full blur-[150px] pointer-events-none" />
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
            <div className="w-10 h-10 rounded-xl bg-[#C78F7B]/10 flex items-center justify-center border border-[#C78F7B]/20">
              <Inbox className="w-5 h-5 text-[#C78F7B]" />
            </div>
            Solicitudes de Propietarios
          </h1>
          <p className="text-sm text-[#B0ACA6] mt-1">Gestiona las solicitudes de registro de propiedades</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-8">
          {[
            { label: 'Total', value: stats.total, accent: '#C78F7B', icon: Building2 },
            { label: 'Pendientes', value: stats.pending, accent: '#f59e0b', icon: Clock },
            { label: 'Contactados', value: stats.contacted, accent: '#3b82f6', icon: Phone },
            { label: 'Aprobados', value: stats.approved, accent: '#22c55e', icon: CheckCircle },
            { label: 'Rechazados', value: stats.rejected, accent: '#ef4444', icon: XCircle },
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

        {/* Tabs por Estado */}
        <Tabs defaultValue="all" className="space-y-6">
          <TabsList className="bg-white/[0.03] border border-white/10 p-1">
            <TabsTrigger value="all" className="data-[state=active]:bg-[#C78F7B] data-[state=active]:text-[#0F2027]">Todas ({stats.total})</TabsTrigger>
            <TabsTrigger value="pending" className="data-[state=active]:bg-[#C78F7B] data-[state=active]:text-[#0F2027]">Pendientes ({stats.pending})</TabsTrigger>
            <TabsTrigger value="contacted" className="data-[state=active]:bg-[#C78F7B] data-[state=active]:text-[#0F2027]">Contactados ({stats.contacted})</TabsTrigger>
            <TabsTrigger value="approved" className="data-[state=active]:bg-[#C78F7B] data-[state=active]:text-[#0F2027]">Aprobados ({stats.approved})</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            {submissions.length === 0 ? (
              <div className="relative bg-white/[0.03] backdrop-blur-md border border-white/10 rounded-[24px] p-12 text-center">
                <Inbox className="h-12 w-12 text-[#4A4F57] mx-auto mb-3" />
                <p className="text-white font-semibold mb-1">No hay solicitudes registradas</p>
                <p className="text-sm text-[#8A8F97]">Las solicitudes aparecerán aquí cuando los propietarios envíen sus datos</p>
              </div>
            ) : (
              submissions.map((submission) => (
                <div key={submission.id} className="relative bg-white/[0.03] backdrop-blur-md border border-white/10 rounded-[24px] overflow-hidden hover:border-white/20 transition-all">
                  <div className="p-5 sm:p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2 flex-wrap">
                          <Building2 className="h-5 w-5 text-[#C78F7B]" />
                          <h3 className="text-lg font-bold text-white">{propertyTypeLabels[submission.propertyType] || submission.propertyType}</h3>
                          {getStatusBadge(submission.status)}
                          {submission.tipoConsulta && (
                            <span className="px-2 py-0.5 rounded-full text-xs border border-[#C78F7B]/30 text-[#C78F7B]">
                              {tipoConsultaLabels[submission.tipoConsulta] || submission.tipoConsulta}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-4 text-[#8A8F97] text-sm">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {formatDate(submission.submittedAt)}
                          </div>
                          {submission.urgency && (
                            <div className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              {urgencyLabels[submission.urgency] || submission.urgency}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-2xl font-bold text-[#C78F7B]">
                          {formatCurrency(submission.askingPrice)}
                        </p>
                        {submission.estimatedValue && (
                          <p className="text-sm text-[#8A8F97]">
                            Est: {formatCurrency(submission.estimatedValue.toString())}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Propiedad info grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 text-sm">
                      <div>
                        <p className="text-[#8A8F97] text-xs mb-0.5">Ubicación</p>
                        <p className="font-semibold text-white">{submission.neighborhood}, {submission.city}</p>
                      </div>
                      <div>
                        <p className="text-[#8A8F97] text-xs mb-0.5">Dirección</p>
                        <p className="font-semibold text-white">{submission.address || '—'}</p>
                      </div>
                      <div>
                        <p className="text-[#8A8F97] text-xs mb-0.5">Área Total</p>
                        <p className="font-semibold text-white">{submission.area} m²</p>
                      </div>
                      {submission.areaConstruccion && (
                        <div>
                          <p className="text-[#8A8F97] text-xs mb-0.5">Área Construcción</p>
                          <p className="font-semibold text-white">{submission.areaConstruccion} m²</p>
                        </div>
                      )}
                      <div>
                        <p className="text-[#8A8F97] text-xs mb-0.5">Habitaciones</p>
                        <p className="font-semibold text-white">{submission.bedrooms}</p>
                      </div>
                      <div>
                        <p className="text-[#8A8F97] text-xs mb-0.5">Baños</p>
                        <p className="font-semibold text-white">{submission.bathrooms}</p>
                      </div>
                      {submission.postalCode && (
                        <div>
                          <p className="text-[#8A8F97] text-xs mb-0.5">C.P.</p>
                          <p className="font-semibold text-white">{submission.postalCode}</p>
                        </div>
                      )}
                      <div>
                        <p className="text-[#8A8F97] text-xs mb-0.5">Fotos</p>
                        <p className="font-semibold text-white flex items-center gap-1"><Camera className="h-3 w-3 text-[#C78F7B]" />{submission.photoCount}</p>
                      </div>
                    </div>

                    {/* Descripción */}
                    {submission.description && (
                      <div className="mb-4 p-3 bg-white/[0.03] rounded-[12px] border border-white/10">
                        <p className="text-[#8A8F97] text-xs mb-1 flex items-center gap-1"><FileText className="h-3 w-3 text-[#C78F7B]" />Descripción</p>
                        <p className="text-sm text-[#B0ACA6]">{submission.description}</p>
                      </div>
                    )}

                    {/* Propietario */}
                    <div className="mb-4">
                      <p className="text-[#8A8F97] text-sm mb-2">Propietario</p>
                      <div className="flex flex-wrap items-center gap-4 text-sm text-[#B0ACA6]">
                        <div className="flex items-center gap-1">
                          <User className="h-4 w-4 text-[#C78F7B]" />
                          {submission.ownerName}
                        </div>
                        <div className="flex items-center gap-1">
                          <Phone className="h-4 w-4 text-[#C78F7B]" />
                          {submission.phone}
                        </div>
                        <div className="flex items-center gap-1">
                          <Mail className="h-4 w-4 text-[#C78F7B]" />
                          {submission.email}
                        </div>
                        {submission.preferredContact && (
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4 text-[#C78F7B]" />
                            {contactLabels[submission.preferredContact] || submission.preferredContact}
                          </div>
                        )}
                      </div>
                      <div className="flex gap-2 mt-2 flex-wrap">
                        {submission.exclusivity && (
                          <span className="px-2 py-0.5 rounded-full text-xs bg-[#C78F7B]/10 text-[#C78F7B] border border-[#C78F7B]/20">Exclusividad aceptada</span>
                        )}
                        {submission.terms && (
                          <span className="px-2 py-0.5 rounded-full text-xs bg-green-500/10 text-green-400 border border-green-500/20">Términos aceptados</span>
                        )}
                        {submission.privacy && (
                          <span className="px-2 py-0.5 rounded-full text-xs bg-green-500/10 text-green-400 border border-green-500/20">Privacidad aceptada</span>
                        )}
                      </div>
                    </div>

                    {/* Amenidades */}
                    {submission.amenities.length > 0 && (
                      <div className="mb-4">
                        <p className="text-[#8A8F97] text-sm mb-2">Amenidades</p>
                        <div className="flex flex-wrap gap-2">
                          {submission.amenities.map((amenity, idx) => (
                            <span key={idx} className="px-2 py-0.5 rounded-full text-xs border border-white/10 text-[#B0ACA6]">
                              {amenity}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Actividades Recreativas */}
                    {submission.actividadesRecreativas && submission.actividadesRecreativas.length > 0 && (
                      <div className="mb-4">
                        <p className="text-[#8A8F97] text-sm mb-2">Actividades Recreativas</p>
                        <div className="flex flex-wrap gap-2">
                          {submission.actividadesRecreativas.map((act, idx) => (
                            <span key={idx} className="px-2 py-0.5 rounded-full text-xs border border-blue-500/20 text-blue-400">
                              {act}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Promoción / Bono */}
                    {submission.promocion && submission.promocion !== 'ninguna' && (
                      <div className="mb-4 p-3 bg-[#C78F7B]/5 rounded-[12px] border border-[#C78F7B]/20">
                        <p className="text-[#8A8F97] text-xs mb-2 flex items-center gap-1"><Tag className="h-3 w-3 text-[#C78F7B]" />Promoción / Bono</p>
                        <div className="inline-flex items-center gap-2 bg-[#C78F7B] text-[#0F2027] px-4 py-2 rounded-full text-sm font-bold">
                          <Tag className="h-4 w-4" />
                          {submission.promocion === 'personalizada'
                            ? (submission.promocionPersonalizada || 'Promoción Especial')
                            : (promocionLabels[submission.promocion] || submission.promocion)
                          }
                        </div>
                      </div>
                    )}

                    <div className="flex gap-2 flex-wrap">
                      {submission.status === 'pending' && (
                        <>
                          <Button
                            size="sm"
                            onClick={() => updateStatus(submission.id, 'contacted')}
                            className="bg-blue-500/10 text-blue-400 border border-blue-500/20 hover:bg-blue-500/20"
                          >
                            <Phone className="h-4 w-4 mr-1" />
                            Marcar Contactado
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => updateStatus(submission.id, 'approved')}
                            className="bg-green-500/10 text-green-400 border border-green-500/20 hover:bg-green-500/20"
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Aprobar
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => updateStatus(submission.id, 'rejected')}
                            className="bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20"
                          >
                            <XCircle className="h-4 w-4 mr-1" />
                            Rechazar
                          </Button>
                        </>
                      )}
                      {submission.status === 'contacted' && (
                        <Button
                          size="sm"
                          onClick={() => updateStatus(submission.id, 'approved')}
                          className="bg-green-500/10 text-green-400 border border-green-500/20 hover:bg-green-500/20"
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Aprobar
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => deleteSubmission(submission.id)}
                        className="ml-auto border-white/10 text-red-400 hover:bg-red-500/10 hover:border-red-500/30"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </TabsContent>

          <TabsContent value="pending" className="space-y-4">
            {OwnerSubmissionsStorage.getByStatus('pending').length === 0 ? (
              <div className="relative bg-white/[0.03] backdrop-blur-md border border-white/10 rounded-[24px] p-12 text-center">
                <Clock className="h-12 w-12 text-[#4A4F57] mx-auto mb-3" />
                <p className="text-white font-semibold mb-1">Sin solicitudes pendientes</p>
                <p className="text-sm text-[#8A8F97]">No hay solicitudes esperando revisión</p>
              </div>
            ) : (
              OwnerSubmissionsStorage.getByStatus('pending').map((submission) => (
                <div key={submission.id} className="relative bg-white/[0.03] backdrop-blur-md border border-white/10 rounded-[24px] p-6">
                  <p className="text-yellow-400">Solicitud pendiente de revisión</p>
                </div>
              ))
            )}
          </TabsContent>

          <TabsContent value="contacted" className="space-y-4">
            {OwnerSubmissionsStorage.getByStatus('contacted').length === 0 ? (
              <div className="relative bg-white/[0.03] backdrop-blur-md border border-white/10 rounded-[24px] p-12 text-center">
                <Phone className="h-12 w-12 text-[#4A4F57] mx-auto mb-3" />
                <p className="text-white font-semibold mb-1">Sin contactados</p>
                <p className="text-sm text-[#8A8F97]">No hay propietarios contactados aún</p>
              </div>
            ) : (
              OwnerSubmissionsStorage.getByStatus('contacted').map((submission) => (
                <div key={submission.id} className="relative bg-white/[0.03] backdrop-blur-md border border-white/10 rounded-[24px] p-6">
                  <p className="text-blue-400">Propietario contactado</p>
                </div>
              ))
            )}
          </TabsContent>

          <TabsContent value="approved" className="space-y-4">
            {OwnerSubmissionsStorage.getByStatus('approved').length === 0 ? (
              <div className="relative bg-white/[0.03] backdrop-blur-md border border-white/10 rounded-[24px] p-12 text-center">
                <CheckCircle className="h-12 w-12 text-[#4A4F57] mx-auto mb-3" />
                <p className="text-white font-semibold mb-1">Sin aprobados</p>
                <p className="text-sm text-[#8A8F97]">No hay solicitudes aprobadas aún</p>
              </div>
            ) : (
              OwnerSubmissionsStorage.getByStatus('approved').map((submission) => (
                <div key={submission.id} className="relative bg-white/[0.03] backdrop-blur-md border border-white/10 rounded-[24px] p-6">
                  <p className="text-green-400">Solicitud aprobada</p>
                </div>
              ))
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
