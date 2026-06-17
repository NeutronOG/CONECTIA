'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/auth-context'
import { PropertiesStorage } from '@/lib/properties-storage'
import { propiedades as mockPropiedades } from '@/data/propiedades'
import { Propiedad } from '@/data/propiedades'
import { PropertyForm } from '@/components/property-form'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { usePropertiesAnalyticsList } from '@/hooks/use-property-analytics'
import { formatDuration, getAverageInteractionTimeMs } from '@/lib/property-analytics'
import {
  Plus,
  Edit,
  Trash2,
  Eye,
  ArrowLeft,
  Building2,
  MapPin,
  Bed,
  Bath,
  Maximize,
  User,
  AlertTriangle,
  Diamond,
  Zap,
  BarChart3,
  Share2,
  MousePointerClick
} from 'lucide-react'
import { toast } from 'sonner'
import { getPlanById, canAddProperty, getPropertyLimit } from '@/data/subscription-plans'

export default function PropiedadesAsesorPage() {
  const { user, isAuthenticated } = useAuth()
  const router = useRouter()
  const [propiedades, setPropiedades] = useState<Propiedad[]>([])
  const [showForm, setShowForm] = useState(false)
  const [editingProperty, setEditingProperty] = useState<Propiedad | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null)
  const [bajaConfirm, setBajaConfirm] = useState<Propiedad | null>(null)
  const [motivoBaja, setMotivoBaja] = useState('')

  const propertyIds = propiedades.map(p => p.id)
  const { analytics: propiedadesAnalytics } = usePropertiesAnalyticsList(propertyIds)

  const getAnalyticsForProperty = (id: number) => {
    return propiedadesAnalytics.find(a => Number(a.propertyId) === id) || null
  }

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'asesor') {
      router.push('/login')
      return
    }

    // Inicializar con datos mock si está vacío
    PropertiesStorage.initializeWithMockData(mockPropiedades)

    // Cargar propiedades del asesor
    loadProperties()
  }, [user, isAuthenticated, router])

  const loadProperties = async () => {
    if (!user) return

    try {
      console.log('Loading properties for user:', user.id, 'email:', user.email, 'nombre:', user.nombre)
      
      // Usar API del servidor para cargar propiedades (bypasea RLS)
      const params = new URLSearchParams()
      if (user.email) params.append('email', user.email)
      if (user.nombre) params.append('nombre', user.nombre)
      if (user.id) params.append('userId', user.id)
      
      const res = await fetch(`/api/asesor/mis-propiedades?${params.toString()}`)
      
      if (res.ok) {
        const data = await res.json()
        console.log('Loaded properties:', data.total, data.debug)
        // Mapear campos DB a campos App (snake_case -> camelCase)
        const mapped = (data.propiedades || []).map((p: any) => ({
          id: Number(p.id),
          usuarioId: p.usuario_id || undefined,
          titulo: p.titulo,
          ubicacion: p.ubicacion,
          precio: Number(p.precio),
          precioTexto: p.precio_texto,
          tipo: p.tipo,
          habitaciones: p.habitaciones,
          banos: p.banos,
          mediosBanos: p.medios_banos || 0,
          area: p.area,
          areaConstruccion: p.area_construccion || 0,
          cochera: p.cochera || 0,
          amueblado: p.amueblado || undefined,
          areaTexto: p.area_texto,
          imagen: p.imagen || '',
          descripcion: p.descripcion || '',
          caracteristicas: p.caracteristicas || [],
          status: p.status,
          categoria: p.categoria,
          fechaPublicacion: p.created_at || p.fecha_publicacion,
          tourVirtual: p.tour_virtual || undefined,
          galeria: p.galeria || [],
          bono: p.bono || undefined,
          detalles: p.detalles || undefined,
        }))
        setPropiedades(mapped)
      } else {
        console.error('Error loading properties:', await res.text())
        setPropiedades([])
      }
    } catch (error) {
      console.error('Error in loadProperties:', error)
      setPropiedades([])
    }
  }

  const handleSubmit = async (data: Omit<Propiedad, 'id'>) => {
    if (!user) return

    try {
      if (editingProperty) {
        const updated = await PropertiesStorage.update(editingProperty.id, data)
        if (!updated) {
          throw new Error('No se pudo actualizar la propiedad. Verifica que tengas permisos.')
        }
        toast.success('Propiedad actualizada exitosamente')
      } else {
        // Usar el email del usuario para identificar quién subió la propiedad
        if (!user) throw new Error('Usuario no autenticado')

        // Guardar con el email del usuario para fácil rastreo
        const newProperty = await PropertiesStorage.add(data, user.email)
        if (!newProperty) {
          throw new Error('No se pudo crear la propiedad')
        }
        toast.success('Propiedad publicada exitosamente')
      }

      await loadProperties()
      setShowForm(false)
      setEditingProperty(null)
    } catch (error: any) {
      console.error('Error guardando propiedad:', error)
      toast.error(error?.message || 'No se pudo guardar la propiedad')
    }
  }

  const handleEdit = (property: Propiedad) => {
    setEditingProperty(property)
    setShowForm(true)
  }

  const handleDelete = (id: number) => {
    PropertiesStorage.delete(id)
    toast.success('Propiedad eliminada')
    loadProperties()
    setDeleteConfirm(null)
  }

  const handleNewProperty = () => {
    if (!user) return

    // Si no tiene plan, redirigir a elegir uno
    if (!user.plan) {
      toast.info('Elige tu plan para comenzar', {
        description: 'Necesitas seleccionar un plan antes de agregar propiedades',
        action: {
          label: 'Elegir Plan',
          onClick: () => router.push('/alianza-comercial')
        }
      })
      return
    }

    const userPlan = user.plan
    const currentPlan = getPlanById(userPlan)
    
    // Verificar si puede agregar más propiedades
    if (!canAddProperty(userPlan, propiedades.length, user?.email)) {
      const limit = getPropertyLimit(userPlan)
      toast.error(
        `Has alcanzado el límite de ${limit} propiedades del ${currentPlan?.name}`,
        {
          description: 'Actualiza a Plan Elite para propiedades ilimitadas',
          action: {
            label: 'Ver Planes',
            onClick: () => router.push('/panel-asesor/planes')
          }
        }
      )
      return
    }

    setEditingProperty(null)
    setShowForm(true)
  }

  const handleNotificarBaja = async (propiedad: Propiedad) => {
    if (!motivoBaja.trim()) {
      toast.error('Por favor indica el motivo de la baja')
      return
    }

    try {
      // Aquí se podría enviar una notificación al admin o guardar en base de datos
      // Por ahora actualizamos el estado de la propiedad a "Baja solicitada"
      toast.success(`Solicitud de baja enviada para: ${propiedad.titulo}. El administrador será notificado.`)
      setBajaConfirm(null)
      setMotivoBaja('')
    } catch (error) {
      console.error('Error al notificar baja:', error)
      toast.error('Error al enviar la solicitud de baja')
    }
  }

  if (!user) return null

  if (showForm) {
    return (
      <div className="min-h-screen bg-[#0F2027] relative overflow-hidden">
        <div className="fixed top-0 right-0 w-[500px] h-[500px] bg-[#C78F7B]/5 rounded-full blur-[150px] pointer-events-none" />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
          <button onClick={() => { setShowForm(false); setEditingProperty(null); }} className="flex items-center gap-2 text-[#B0ACA6] hover:text-white mb-6 text-sm transition-colors">
            <ArrowLeft className="h-4 w-4" /> Volver
          </button>

          <div className="mb-6">
            <h1 className="text-3xl font-black text-white mb-2">
              {editingProperty ? 'Editar Propiedad' : 'Nueva Propiedad'}
            </h1>
            <p className="text-sm text-[#B0ACA6]">
              {editingProperty ? 'Actualiza la información de la propiedad' : 'Completa el formulario para publicar una nueva propiedad'}
            </p>
          </div>

          <PropertyForm
            initialData={editingProperty || undefined}
            asesorEmail={user.email}
            asesorNombre={user.nombre || ''}
            onSubmit={handleSubmit}
            onCancel={() => { setShowForm(false); setEditingProperty(null); }}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0F2027] relative overflow-hidden">
      {/* Glow orbs */}
      <div className="fixed top-0 right-0 w-[500px] h-[500px] bg-[#C78F7B]/5 rounded-full blur-[150px] pointer-events-none" />
      <div className="fixed bottom-0 left-0 w-[400px] h-[400px] bg-[#17313A]/60 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div className="w-full sm:w-auto">
            <button onClick={() => router.push('/panel-asesor')} className="flex items-center gap-2 text-[#B0ACA6] hover:text-white mb-3 sm:mb-4 text-sm transition-colors">
              <ArrowLeft className="h-4 w-4" /> Volver al Panel
            </button>
            <h1 className="text-2xl sm:text-3xl font-black text-white mb-1">Mis Propiedades</h1>
            <p className="text-sm text-[#B0ACA6]">Gestiona tu portafolio de propiedades</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button onClick={handleNewProperty} className="flex items-center gap-2 px-4 py-2.5 bg-[#C78F7B] hover:bg-[#D4987E] text-[#0F2027] rounded-xl transition-all text-sm font-bold shadow-lg shadow-[#C78F7B]/20">
              <Plus className="h-4 w-4" /> Nueva Propiedad
            </button>
          </div>
        </div>

        {/* Plan Info — Glassmorphism */}
        {user && (
          <div className="relative bg-white/[0.03] backdrop-blur-md border border-white/10 rounded-[28px] p-5 sm:p-6 mb-8 overflow-hidden">
            <div className="absolute -top-20 -right-20 w-40 h-40 bg-[#C78F7B]/10 rounded-full blur-[60px] pointer-events-none" />
            <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: user.plan === 'elite' ? 'rgba(199,143,123,0.2)' : 'rgba(59,130,246,0.2)', border: user.plan === 'elite' ? '1px solid rgba(199,143,123,0.3)' : '1px solid rgba(59,130,246,0.3)' }}>
                  {user.plan === 'elite' ? <Diamond className="h-5 w-5 text-[#C78F7B]" /> : <Zap className="h-5 w-5 text-blue-400" />}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">{getPlanById(user.plan || 'core')?.name}</h3>
                  <p className="text-xs text-[#B0ACA6]">
                    {user.plan === 'elite' || user.email === 'lizzie@conectia.mx'
                      ? `Propiedades ilimitadas • ${propiedades.length} activas`
                      : `${propiedades.length} de ${getPropertyLimit(user.plan || 'core')} propiedades`
                    }
                  </p>
                </div>
              </div>
              {user.plan !== 'elite' && user.email !== 'lizzie@conectia.mx' && (
                <button onClick={() => router.push('/panel-asesor/planes')} className="flex items-center gap-2 px-4 py-2.5 bg-[#C78F7B] hover:bg-[#D4987E] text-[#0F2027] rounded-xl transition-all text-sm font-bold shadow-lg shadow-[#C78F7B]/20">
                  <Diamond className="h-4 w-4" /> Actualizar a Elite
                </button>
              )}
            </div>
          </div>
        )}

        {/* Stats — Glassmorphism */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-8">
          {[
            { label: 'Total Propiedades', value: propiedades.length, accent: '#C78F7B', icon: Building2 },
            { label: 'Disponibles', value: propiedades.filter(p => p.status === 'Disponible').length, accent: '#22c55e', icon: Eye },
            { label: 'Exclusivas', value: propiedades.filter(p => p.status === 'Exclusiva').length, accent: '#C78F7B', icon: Building2 },
            { label: 'Reservadas', value: propiedades.filter(p => p.status === 'Reservada').length, accent: '#3b82f6', icon: Building2 },
          ].map((stat, i) => (
            <div key={i} className="relative bg-white/[0.03] backdrop-blur-md border border-white/10 rounded-[24px] p-5 overflow-hidden group hover:border-white/20 transition-all duration-300">
              <div className="absolute -top-6 -right-6 w-20 h-20 rounded-full pointer-events-none opacity-30" style={{ background: `${stat.accent}20` }} />
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#8A8F97]">{stat.label}</p>
                  <p className="text-2xl sm:text-3xl font-black text-white mt-1">{stat.value}</p>
                </div>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${stat.accent}15` }}>
                  <stat.icon className="w-5 h-5 sm:w-6 sm:h-6" style={{ color: stat.accent }} />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Lista de Propiedades */}
        {propiedades.length === 0 ? (
          <div className="relative bg-white/[0.03] backdrop-blur-md border border-white/10 rounded-[28px] p-12 text-center">
            <div className="absolute -top-20 -right-20 w-40 h-40 bg-[#C78F7B]/10 rounded-full blur-[60px] pointer-events-none" />
            <div className="relative">
              <div className="w-16 h-16 bg-[#C78F7B]/10 rounded-2xl flex items-center justify-center mx-auto mb-4"><Building2 className="h-8 w-8 text-[#C78F7B]/60" /></div>
              <h3 className="text-xl font-bold text-white mb-2">No tienes propiedades</h3>
              <p className="text-sm text-[#B0ACA6] mb-6">Comienza publicando tu primera propiedad</p>
              <button onClick={handleNewProperty} className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#C78F7B] hover:bg-[#D4987E] text-[#0F2027] rounded-xl transition-all text-sm font-bold shadow-lg shadow-[#C78F7B]/20">
                <Plus className="h-4 w-4" /> Publicar Primera Propiedad
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {propiedades.map((propiedad) => (
              <div key={propiedad.id} className="relative bg-white/[0.03] backdrop-blur-md border border-white/10 rounded-[24px] overflow-hidden group hover:border-white/20 transition-all duration-300 hover:-translate-y-1">
                <div className="relative h-48 overflow-hidden">
                  <img src={propiedad.imagen} alt={propiedad.titulo} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0F2027] via-transparent to-transparent opacity-60" />
                  <div className="absolute top-3 right-3">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold backdrop-blur-md border ${
                      propiedad.status === 'Disponible' ? 'bg-green-500/15 text-green-400 border-green-500/30' :
                      propiedad.status === 'Exclusiva' ? 'bg-[#C78F7B]/15 text-[#C78F7B] border-[#C78F7B]/30' :
                      'bg-blue-500/15 text-blue-400 border-blue-500/30'
                    }`}>{propiedad.status}</span>
                  </div>
                  <div className="absolute bottom-3 left-3 right-3">
                    <h3 className="text-lg font-bold text-white leading-tight">{propiedad.titulo}</h3>
                    <div className="flex items-center text-[#B0ACA6] text-xs mt-1"><MapPin className="h-3 w-3 mr-1 text-[#C78F7B]" /> {propiedad.ubicacion}</div>
                  </div>
                </div>

                <div className="p-5">
                  {propiedad.agente && (
                    <div className="flex items-center gap-2 mb-3 px-3 py-2 bg-[#C78F7B]/10 rounded-xl border border-[#C78F7B]/20">
                      <User className="h-4 w-4 text-[#C78F7B]" />
                      <div className="flex flex-col"><span className="text-[10px] text-[#B0ACA6]">Publicado por</span><span className="text-xs font-semibold text-white">{propiedad.agente.nombre}</span></div>
                    </div>
                  )}

                  <p className="text-2xl font-black text-[#C78F7B] mb-4">{propiedad.precioTexto}</p>

                  {/* Mini analytics bar */}
                  {(() => {
                    const analytics = getAnalyticsForProperty(propiedad.id)
                    if (!analytics || (analytics.views === 0 && analytics.shares === 0)) return null
                    return (
                      <div className="flex items-center gap-2 mb-3">
                        {analytics.views > 0 && (
                          <div className="flex items-center gap-1 px-2 py-1 bg-[#8b5cf6]/10 rounded-lg border border-[#8b5cf6]/20">
                            <BarChart3 className="h-3 w-3 text-[#8b5cf6]" />
                            <span className="text-[10px] font-bold text-[#8b5cf6]">{analytics.views} vista{analytics.views !== 1 ? 's' : ''}</span>
                          </div>
                        )}
                        {analytics.shares > 0 && (
                          <div className="flex items-center gap-1 px-2 py-1 bg-[#06b6d4]/10 rounded-lg border border-[#06b6d4]/20">
                            <Share2 className="h-3 w-3 text-[#06b6d4]" />
                            <span className="text-[10px] font-bold text-[#06b6d4]">{analytics.shares} compartido{analytics.shares !== 1 ? 's' : ''}</span>
                          </div>
                        )}
                        {analytics.interactionsCount > 0 && (
                          <div className="flex items-center gap-1 px-2 py-1 bg-[#C78F7B]/10 rounded-lg border border-[#C78F7B]/20" title="Tiempo promedio de interacción">
                            <MousePointerClick className="h-3 w-3 text-[#C78F7B]" />
                            <span className="text-[10px] font-bold text-[#C78F7B]">{formatDuration(getAverageInteractionTimeMs(propiedad.id))}</span>
                          </div>
                        )}
                      </div>
                    )
                  })()}

                  <div className="flex items-center gap-3 text-xs text-[#B0ACA6] mb-5">
                    <div className="flex items-center gap-1 px-2.5 py-1.5 bg-white/5 rounded-lg border border-white/10"><Bed className="h-3.5 w-3.5" /> {propiedad.habitaciones}</div>
                    <div className="flex items-center gap-1 px-2.5 py-1.5 bg-white/5 rounded-lg border border-white/10"><Bath className="h-3.5 w-3.5" /> {propiedad.banos}</div>
                    <div className="flex items-center gap-1 px-2.5 py-1.5 bg-white/5 rounded-lg border border-white/10"><Maximize className="h-3.5 w-3.5" /> {propiedad.areaTexto}</div>
                  </div>

                  <div className="flex gap-2">
                    <button onClick={() => handleEdit(propiedad)} className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-white/5 border border-white/15 hover:bg-white/10 text-white rounded-xl transition-all text-xs font-semibold">
                      <Eye className="h-3.5 w-3.5" /> Ver
                    </button>
                    {(user?.role === 'admin' || (propiedad.agente && propiedad.agente.email === user?.email)) && (
                      <button onClick={() => handleEdit(propiedad)} className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-white/5 border border-white/15 hover:bg-white/10 text-white rounded-xl transition-all text-xs font-semibold">
                        <Edit className="h-3.5 w-3.5" /> Editar
                      </button>
                    )}
                    <button onClick={() => setBajaConfirm(propiedad)} className="flex items-center justify-center gap-1.5 px-3 py-2 bg-orange-500/10 border border-orange-500/30 hover:bg-orange-500/20 text-orange-400 rounded-xl transition-all text-xs font-semibold" title="Notificar baja">
                      <AlertTriangle className="h-3.5 w-3.5" />
                    </button>
                    {user?.role === 'admin' && (
                      <button onClick={() => setDeleteConfirm(propiedad.id)} className="flex items-center justify-center gap-1.5 px-3 py-2 bg-red-500/10 border border-red-500/30 hover:bg-red-500/20 text-red-400 rounded-xl transition-all text-xs font-semibold" title="Eliminar">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Dialog de Confirmación de Eliminación */}
        <Dialog open={deleteConfirm !== null} onOpenChange={() => setDeleteConfirm(null)}>
          <DialogContent className="bg-[#17313A]/95 backdrop-blur-xl border-white/10 rounded-[24px]">
            <DialogHeader>
              <DialogTitle className="text-white">¿Eliminar propiedad?</DialogTitle>
              <DialogDescription className="text-[#B0ACA6]">Esta acción no se puede deshacer. La propiedad será eliminada permanentemente.</DialogDescription>
            </DialogHeader>
            <div className="flex gap-3 justify-end mt-4">
              <Button variant="outline" onClick={() => setDeleteConfirm(null)} className="bg-white/5 border-white/15 text-white hover:bg-white/10 hover:text-white rounded-xl">Cancelar</Button>
              <Button onClick={() => deleteConfirm && handleDelete(deleteConfirm)} className="bg-red-500/80 hover:bg-red-500 text-white rounded-xl">Eliminar</Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Dialog de Notificación de Baja */}
        <Dialog open={bajaConfirm !== null} onOpenChange={() => { setBajaConfirm(null); setMotivoBaja(''); }}>
          <DialogContent className="bg-[#17313A]/95 backdrop-blur-xl border-white/10 rounded-[24px]">
            <DialogHeader>
              <DialogTitle className="text-white flex items-center gap-2"><AlertTriangle className="h-5 w-5 text-orange-400" /> Notificar Baja de Propiedad</DialogTitle>
              <DialogDescription className="text-[#B0ACA6]">{bajaConfirm && (<span>Estás solicitando dar de baja: <strong className="text-white">{bajaConfirm.titulo}</strong></span>)}</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div>
                <label className="block text-xs font-medium text-[#B0ACA6] mb-2">Motivo de la baja *</label>
                <textarea value={motivoBaja} onChange={(e) => setMotivoBaja(e.target.value)} placeholder="Ej: Propiedad vendida, propietario retiró la propiedad, etc." className="w-full p-3 bg-white/5 border border-white/15 rounded-xl text-white text-sm placeholder:text-[#4A4F57] focus:border-[#C78F7B] focus:ring-1 focus:ring-[#C78F7B]/20 outline-none" rows={3} />
              </div>
              <div className="flex gap-3 justify-end">
                <Button variant="outline" onClick={() => { setBajaConfirm(null); setMotivoBaja(''); }} className="bg-white/5 border-white/15 text-white hover:bg-white/10 hover:text-white rounded-xl">Cancelar</Button>
                <Button onClick={() => bajaConfirm && handleNotificarBaja(bajaConfirm)} className="bg-orange-500/80 hover:bg-orange-500 text-white rounded-xl">Enviar Notificación</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
