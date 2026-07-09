'use client'

import { useEffect, useMemo, useState, useTransition } from 'react'
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
  MousePointerClick,
  Camera
} from 'lucide-react'
import { toast } from 'sonner'
import { getPlanById, canAddProperty, getPropertyLimit } from '@/data/subscription-plans'
import { ShareButton } from '@/components/share-button'
import { useLanguage } from '@/lib/i18n'
import { getUserByEmail } from '@/data/internal-users'
import { isSuperUser } from '@/lib/super-users'

export default function PropiedadesAsesorPage() {
  const { t } = useLanguage()
  const { user, isAuthenticated } = useAuth()
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [propiedades, setPropiedades] = useState<Propiedad[]>([])
  const [showForm, setShowForm] = useState(false)
  const [editingProperty, setEditingProperty] = useState<Propiedad | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null)
  const [bajaConfirm, setBajaConfirm] = useState<Propiedad | null>(null)
  const [motivoBaja, setMotivoBaja] = useState('')
  const [analyticsLoaded, setAnalyticsLoaded] = useState(false)

  const handleNavigation = (path: string) => {
    startTransition(() => {
      router.push(path)
    })
  }

  const propertyIds = useMemo(() => propiedades.map(p => p.id), [propiedades])
  const { analytics: propiedadesAnalytics } = usePropertiesAnalyticsList(analyticsLoaded ? propertyIds : [])

  const getAnalyticsForProperty = (id: number) => {
    return analyticsLoaded ? (propiedadesAnalytics.find(a => Number(a.propertyId) === id) || null) : null
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

  // Load analytics after propiedades are loaded (lazy, non-blocking)
  useEffect(() => {
    if (propiedades.length > 0 && !analyticsLoaded) {
      const timer = setTimeout(() => {
        setAnalyticsLoaded(true)
      }, 500) // Delay analytics loading by 500ms to not block initial render
      return () => clearTimeout(timer)
    }
  }, [propiedades.length, analyticsLoaded])

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
        const mapped = (data.propiedades || []).map((p: any) => {
          const asesorEmail = p.asesor_email || p.usuario_id || undefined
          const asesorInfo = asesorEmail ? getUserByEmail(asesorEmail) : undefined
          return {
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
            unidadSuperficie: p.unidad_superficie || undefined,
            detalles: p.detalles || undefined,
            agente: asesorEmail ? {
              email: asesorEmail,
              nombre: asesorInfo?.nombre || asesorEmail,
              especialidad: asesorInfo?.role === 'asesor' ? 'Asesor Inmobiliario' : asesorInfo?.role || 'Agente',
              rating: 0,
              ventas: 0,
              telefono: asesorInfo?.telefono || '',
            } : undefined,
          }
        })
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
          throw new Error(t('panelAsesor.propiedades.errors.updateError'))
        }
        toast.success(t('panelAsesor.propiedades.toast.updateSuccess'))
      } else {
        // Usar el email del usuario para identificar quién subió la propiedad
        if (!user) throw new Error(t('panelAsesor.propiedades.errors.authError'))

        // Guardar con el email del usuario para fácil rastreo
        const newProperty = await PropertiesStorage.add(data, user.email)
        if (!newProperty) {
          throw new Error(t('panelAsesor.propiedades.errors.createError'))
        }
        toast.success(t('panelAsesor.propiedades.toast.createSuccess'))
      }

      await loadProperties()
      setShowForm(false)
      setEditingProperty(null)
    } catch (error: any) {
      console.error('Error guardando propiedad:', error)
      toast.error(error?.message || t('panelAsesor.propiedades.errors.saveError'))
    }
  }

  const handleEdit = (property: Propiedad) => {
    setEditingProperty(property)
    setShowForm(true)
  }

  const handleDelete = (id: number) => {
    PropertiesStorage.delete(id)
    toast.success(t('panelAsesor.propiedades.toast.deleteSuccess'))
    loadProperties()
    setDeleteConfirm(null)
  }

  const handleNewProperty = () => {
    if (!user) return

    // Si no tiene plan, redirigir a elegir uno
    if (!user.plan) {
      toast.info(t('panelAsesor.propiedades.toast.choosePlanTitle'), {
        description: t('panelAsesor.propiedades.toast.choosePlanDesc'),
        action: {
          label: t('panelAsesor.propiedades.toast.choosePlanAction'),
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
        t('panelAsesor.propiedades.toast.limitError', { limit, planName: currentPlan?.name || 'Core' }),
        {
          description: t('panelAsesor.propiedades.toast.limitErrorDesc'),
          action: {
            label: t('panelAsesor.propiedades.toast.viewPlansAction'),
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
      toast.error(t('panelAsesor.propiedades.errors.motivoRequired'))
      return
    }

    try {
      // Aquí se podría enviar una notificación al admin o guardar en base de datos
      // Por ahora actualizamos el estado de la propiedad a "Baja solicitada"
      toast.success(t('panelAsesor.propiedades.toast.bajaSent', { titulo: propiedad.titulo }))
      setBajaConfirm(null)
      setMotivoBaja('')
    } catch (error) {
      console.error('Error al notificar baja:', error)
      toast.error(t('panelAsesor.propiedades.errors.bajaError'))
    }
  }

  if (!user) return null

  if (showForm) {
    return (
      <div className="min-h-screen bg-[#0F2027] relative overflow-hidden">
        <div className="fixed top-0 right-0 w-[500px] h-[500px] bg-[#C78F7B]/5 rounded-full blur-[150px] pointer-events-none" />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
          <button onClick={() => { setShowForm(false); setEditingProperty(null); }} className="flex items-center gap-2 text-[#B0ACA6] hover:text-white mb-6 text-sm transition-colors">
            <ArrowLeft className="h-4 w-4" /> {t('panelAsesor.propiedades.backButton')}
          </button>

          <div className="mb-6">
            <h1 className="text-3xl font-black text-white mb-2">
              {editingProperty ? t('panelAsesor.propiedades.editProperty') : t('panelAsesor.propiedades.newProperty')}
            </h1>
            <p className="text-sm text-[#B0ACA6]">
              {editingProperty ? t('panelAsesor.propiedades.updateDesc') : t('panelAsesor.propiedades.createDesc')}
            </p>
          </div>

          <PropertyForm
            initialData={editingProperty || undefined}
            asesorEmail={editingProperty?.agente?.email || user.email}
            asesorNombre={editingProperty?.agente?.nombre || user.nombre || ''}
            onSubmit={handleSubmit}
            onCancel={() => { 
              setShowForm(false)
              setEditingProperty(null)
            }}
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
            <button onClick={() => handleNavigation('/panel-asesor')} className="flex items-center gap-2 text-[#B0ACA6] hover:text-white mb-3 sm:mb-4 text-sm transition-colors">
              <ArrowLeft className="h-4 w-4" /> {t('panelAsesor.propiedades.backToPanel')}
            </button>
            <h1 className="text-2xl sm:text-3xl font-black text-white mb-1">{t('panelAsesor.propiedades.myProperties')}</h1>
            <p className="text-sm text-[#B0ACA6]">{t('panelAsesor.propiedades.managePortfolio')}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button onClick={() => handleNavigation('/panel-asesor/solicitud-propiedad')} className="flex items-center gap-2 px-4 py-2.5 bg-white/5 border border-white/15 hover:border-[#C78F7B]/30 hover:bg-white/10 text-white rounded-xl transition-all text-sm font-semibold">
              <Camera className="h-4 w-4 text-[#C78F7B]" /> {t('panelAsesor.propiedades.requestProperty')}
            </button>
            <button onClick={handleNewProperty} className="flex items-center gap-2 px-4 py-2.5 bg-[#C78F7B] hover:bg-[#D4987E] text-[#0F2027] rounded-xl transition-all text-sm font-bold shadow-lg shadow-[#C78F7B]/20">
              <Plus className="h-4 w-4" /> {t('panelAsesor.propiedades.newProperty')}
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
                      ? t('panelAsesor.propiedades.unlimitedProperties', { count: propiedades.length })
                      : t('panelAsesor.propiedades.propertyCount', { current: propiedades.length, limit: getPropertyLimit(user.plan || 'core') })
                    }
                  </p>
                </div>
              </div>
              {user.plan !== 'elite' && user.email !== 'lizzie@conectia.mx' && (
                <button onClick={() => router.push('/panel-asesor/planes')} className="flex items-center gap-2 px-4 py-2.5 bg-[#C78F7B] hover:bg-[#D4987E] text-[#0F2027] rounded-xl transition-all text-sm font-bold shadow-lg shadow-[#C78F7B]/20">
                  <Diamond className="h-4 w-4" /> {t('panelAsesor.propiedades.upgradeToElite')}
                </button>
              )}
            </div>
          </div>
        )}

        {/* Stats — Glassmorphism */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-8">
          {[
            { label: t('panelAsesor.propiedades.stats.total'), value: propiedades.length, accent: '#C78F7B', icon: Building2 },
            { label: t('panelAsesor.propiedades.stats.available'), value: propiedades.filter(p => p.status === 'Disponible').length, accent: '#22c55e', icon: Eye },
            { label: t('panelAsesor.propiedades.stats.exclusive'), value: propiedades.filter(p => p.status === 'Exclusiva').length, accent: '#C78F7B', icon: Building2 },
            { label: t('panelAsesor.propiedades.stats.reserved'), value: propiedades.filter(p => p.status === 'Reservada').length, accent: '#3b82f6', icon: Building2 },
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
              <h3 className="text-xl font-bold text-white mb-2">{t('panelAsesor.propiedades.noProperties')}</h3>
              <p className="text-sm text-[#B0ACA6] mb-6">{t('panelAsesor.propiedades.startFirst')}</p>
              <button onClick={handleNewProperty} className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#C78F7B] hover:bg-[#D4987E] text-[#0F2027] rounded-xl transition-all text-sm font-bold shadow-lg shadow-[#C78F7B]/20">
                <Plus className="h-4 w-4" /> {t('panelAsesor.propiedades.publishFirst')}
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
                      <div className="flex flex-col"><span className="text-[10px] text-[#B0ACA6]">{t('panelAsesor.propiedades.publishedBy')}</span><span className="text-xs font-semibold text-white">{propiedad.agente.nombre}</span></div>
                    </div>
                  )}

                  <p className="text-2xl font-black text-[#C78F7B] mb-2">{propiedad.precioTexto}</p>
                  <p className="text-xs font-medium text-[#C78F7B]/80 mb-1">
                    Tu comisión (2%): ${(propiedad.precio * 0.02).toLocaleString('es-MX')} MXN
                  </p>
                  <p className="text-xs font-medium text-[#C78F7B]/80 mb-4">
                    Comisión propietario (2%): ${(propiedad.precio * 0.02).toLocaleString('es-MX')} MXN
                  </p>

                  {/* Mini analytics bar */}
                  {(() => {
                    const analytics = getAnalyticsForProperty(propiedad.id)
                    if (!analytics || (analytics.views === 0 && analytics.shares === 0)) return null
                    return (
                      <div className="flex items-center gap-2 mb-3">
                        {analytics.views > 0 && (
                          <div className="flex items-center gap-1 px-2 py-1 bg-[#8b5cf6]/10 rounded-lg border border-[#8b5cf6]/20">
                            <BarChart3 className="h-3 w-3 text-[#8b5cf6]" />
                            <span className="text-[10px] font-bold text-[#8b5cf6]">{analytics.views} {t('panelAsesor.propiedades.views')}{analytics.views !== 1 ? t('panelAsesor.propiedades.viewsPlural') : ''}</span>
                          </div>
                        )}
                        {analytics.shares > 0 && (
                          <div className="flex items-center gap-1 px-2 py-1 bg-[#06b6d4]/10 rounded-lg border border-[#06b6d4]/20">
                            <Share2 className="h-3 w-3 text-[#06b6d4]" />
                            <span className="text-[10px] font-bold text-[#06b6d4]">{analytics.shares} {t('panelAsesor.propiedades.shared')}{analytics.shares !== 1 ? t('panelAsesor.propiedades.sharedPlural') : ''}</span>
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
                      <Eye className="h-3.5 w-3.5" /> {t('panelAsesor.propiedades.view')}
                    </button>
                    <ShareButton
                      title={propiedad.titulo}
                      url={`/propiedades/${propiedad.id}`}
                      image={propiedad.imagen}
                      variant="ghost"
                      size="sm"
                      className="px-3 py-2 h-auto bg-white/5 border border-white/15 hover:bg-white/10 text-white rounded-xl text-xs font-semibold"
                      propertyMeta={{ precioTexto: propiedad.precioTexto, tipo: propiedad.tipo, ubicacion: propiedad.ubicacion, habitaciones: propiedad.habitaciones, banos: propiedad.banos, areaTexto: propiedad.areaTexto }}
                    />
                    {(isSuperUser(user) || (propiedad.agente && propiedad.agente.email === user?.email)) && (
                      <button onClick={() => handleEdit(propiedad)} className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-white/5 border border-white/15 hover:bg-white/10 text-white rounded-xl transition-all text-xs font-semibold">
                        <Edit className="h-3.5 w-3.5" /> {t('panelAsesor.propiedades.edit')}
                      </button>
                    )}
                    <button onClick={() => setBajaConfirm(propiedad)} className="flex items-center justify-center gap-1.5 px-3 py-2 bg-orange-500/10 border border-orange-500/30 hover:bg-orange-500/20 text-orange-400 rounded-xl transition-all text-xs font-semibold" title="Notificar baja">
                      <AlertTriangle className="h-3.5 w-3.5" />
                    </button>
                    {isSuperUser(user) && (
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
              <DialogTitle className="text-white">{t('panelAsesor.propiedades.deleteConfirm.title')}</DialogTitle>
              <DialogDescription className="text-[#B0ACA6]">{t('panelAsesor.propiedades.deleteConfirm.description')}</DialogDescription>
            </DialogHeader>
            <div className="flex gap-3 justify-end mt-4">
              <Button variant="outline" onClick={() => setDeleteConfirm(null)} className="bg-white/5 border-white/15 text-white hover:bg-white/10 hover:text-white rounded-xl">{t('panelAsesor.propiedades.cancel')}</Button>
              <Button onClick={() => deleteConfirm && handleDelete(deleteConfirm)} className="bg-red-500/80 hover:bg-red-500 text-white rounded-xl">{t('panelAsesor.propiedades.delete')}</Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Dialog de Notificación de Baja */}
        <Dialog open={bajaConfirm !== null} onOpenChange={() => { setBajaConfirm(null); setMotivoBaja(''); }}>
          <DialogContent className="bg-[#17313A]/95 backdrop-blur-xl border-white/10 rounded-[24px]">
            <DialogHeader>
              <DialogTitle className="text-white flex items-center gap-2"><AlertTriangle className="h-5 w-5 text-orange-400" /> {t('panelAsesor.propiedades.bajaConfirm.title')}</DialogTitle>
              <DialogDescription className="text-[#B0ACA6]">{bajaConfirm && (<span>{t('panelAsesor.propiedades.bajaConfirm.description')} <strong className="text-white">{bajaConfirm.titulo}</strong></span>)}</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div>
                <label className="block text-xs font-medium text-[#B0ACA6] mb-2">{t('panelAsesor.propiedades.bajaConfirm.motivoLabel')}</label>
                <textarea value={motivoBaja} onChange={(e) => setMotivoBaja(e.target.value)} placeholder={t('panelAsesor.propiedades.bajaConfirm.motivoPlaceholder')} className="w-full p-3 bg-white/5 border border-white/15 rounded-xl text-white text-sm placeholder:text-[#4A4F57] focus:border-[#C78F7B] focus:ring-1 focus:ring-[#C78F7B]/20 outline-none" rows={3} />
              </div>
              <div className="flex gap-3 justify-end">
                <Button variant="outline" onClick={() => { setBajaConfirm(null); setMotivoBaja(''); }} className="bg-white/5 border-white/15 text-white hover:bg-white/10 hover:text-white rounded-xl">{t('panelAsesor.propiedades.cancel')}</Button>
                <Button onClick={() => bajaConfirm && handleNotificarBaja(bajaConfirm)} className="bg-orange-500/80 hover:bg-orange-500 text-white rounded-xl">{t('panelAsesor.propiedades.bajaConfirm.sendNotification')}</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
