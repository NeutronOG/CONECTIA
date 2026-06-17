'use client'

import { useEffect, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/auth-context'
import { getProgressByAsesor, getLeadsByAsesor, getActivitiesByAsesor } from '@/data/internal-users'
import { propiedades } from '@/data/propiedades'
import { PropertyProgress, Lead, Activity } from '@/types/internal'
import {
  Building2,
  TrendingUp,
  Users,
  Eye,
  FileText,
  LogOut,
  Phone,
  Mail,
  Clock,
  CheckCircle2,
  AlertCircle,
  DollarSign,
  Award,
  Target,
  TrendingDown,
  Flame,
  Plus,
  Settings,
  Diamond,
  Zap,
  Sparkles,
  MapPin
} from 'lucide-react'
import { getPlanById } from '@/data/subscription-plans'
import { DesarrollosManager } from '@/components/desarrollos-manager'
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

export default function PanelAsesorPage() {
  const { user, logout, isAuthenticated, loading } = useAuth()
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [progress, setProgress] = useState<PropertyProgress[]>([])
  const [leads, setLeads] = useState<Lead[]>([])
  const [activities, setActivities] = useState<Activity[]>([])
  const [dataLoaded, setDataLoaded] = useState(false)

  const handleNavigation = (path: string) => {
    startTransition(() => {
      router.push(path)
    })
  }

  useEffect(() => {
    // Esperar a que termine de cargar antes de redirigir
    if (loading) return

    if (!isAuthenticated || user?.role !== 'asesor') {
      router.push('/login')
      return
    }

    // Si el asesor no tiene plan asignado, redirigir a elegir plan
    if (!user.plan) {
      router.push('/alianza-comercial')
      return
    }

    // Load data asynchronously to not block render
    if (!dataLoaded) {
      console.log('🔍 Cargando datos para asesor:', user.id, user.email)
      const progressData = getProgressByAsesor(user.id, user.email)
      const leadsData = getLeadsByAsesor(user.id, user.email)
      const activitiesData = getActivitiesByAsesor(user.id, user.email)
      
      console.log('📊 Progress cargado:', progressData.length, 'propiedades')
      console.log('👥 Leads cargados:', leadsData.length, 'leads')
      console.log('📝 Actividades cargadas:', activitiesData.length, 'actividades')
      
      setProgress(progressData)
      setLeads(leadsData)
      setActivities(activitiesData)
      setDataLoaded(true)
    }
  }, [user, isAuthenticated, loading, router, dataLoaded])

  if (!user) return null

  const totalLeads = progress.reduce((sum, p) => sum + p.leads, 0)
  const totalVisitas = progress.reduce((sum, p) => sum + p.visitas, 0)
  const totalOfertas = progress.reduce((sum, p) => sum + p.ofertas, 0)

  // Sistema de bonos
  const ventasMes = progress.filter(p => p.status === 'vendida' || p.status === 'rentada').length
  const bonos = [
    { meta: 3, bono: 2500, descripcion: '3 propiedades' },
    { meta: 5, bono: 5000, descripcion: '5 propiedades' },
    { meta: 8, bono: 10000, descripcion: '8 propiedades' },
    { meta: 12, bono: 20000, descripcion: '12 propiedades' },
    { meta: 15, bono: 35000, descripcion: '15 propiedades' }
  ]

  const bonoActual = bonos.find(b => ventasMes < b.meta) || bonos[bonos.length - 1]
  const progresoBono = (ventasMes / bonoActual.meta) * 100
  const faltanVentas = Math.max(0, bonoActual.meta - ventasMes)

  // Datos para gráficas
  const leadsPorPropiedad = progress.map(p => {
    const propiedad = propiedades.find(prop => prop.id === p.propiedadId)
    return {
      nombre: propiedad?.titulo.substring(0, 15) + '...' || 'Propiedad',
      leads: p.leads,
      visitas: p.visitas,
      ofertas: p.ofertas
    }
  })

  const leadsPorEstatus = [
    { name: 'Nuevos', value: leads.filter(l => l.status === 'nuevo').length, color: '#3b82f6' },
    { name: 'Contactados', value: leads.filter(l => l.status === 'contactado').length, color: '#eab308' },
    { name: 'Calificados', value: leads.filter(l => l.status === 'calificado').length, color: '#22c55e' },
    { name: 'Descartados', value: leads.filter(l => l.status === 'descartado').length, color: '#6b7280' }
  ]

  const actividadSemanal = [
    { dia: 'Lun', leads: 3, visitas: 2 },
    { dia: 'Mar', leads: 5, visitas: 3 },
    { dia: 'Mié', leads: 4, visitas: 2 },
    { dia: 'Jue', leads: 6, visitas: 4 },
    { dia: 'Vie', leads: 8, visitas: 5 },
    { dia: 'Sáb', leads: 2, visitas: 1 },
    { dia: 'Dom', leads: 1, visitas: 0 }
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'activa': return 'bg-green-500/15 text-green-400 border border-green-500/25'
      case 'en_negociacion': return 'bg-yellow-500/15 text-yellow-400 border border-yellow-500/25'
      case 'vendida': return 'bg-blue-500/15 text-blue-400 border border-blue-500/25'
      case 'rentada': return 'bg-purple-500/15 text-purple-400 border border-purple-500/25'
      default: return 'bg-white/5 text-[#B0ACA6] border border-white/10'
    }
  }

  const getLeadStatusColor = (status: string) => {
    switch (status) {
      case 'nuevo': return 'bg-blue-500/15 text-blue-400 border border-blue-500/25'
      case 'contactado': return 'bg-yellow-500/15 text-yellow-400 border border-yellow-500/25'
      case 'calificado': return 'bg-green-500/15 text-green-400 border border-green-500/25'
      case 'descartado': return 'bg-white/5 text-[#4A4F57] border border-white/10'
      default: return 'bg-white/5 text-[#B0ACA6] border border-white/10'
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('es-MX', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date)
  }

  return (
    <div className="min-h-screen bg-[#0F2027] relative overflow-hidden">
      {/* Glow orbs */}
      <div className="fixed top-0 right-0 w-[500px] h-[500px] bg-[#C78F7B]/5 rounded-full blur-[150px] pointer-events-none" />
      <div className="fixed bottom-0 left-0 w-[400px] h-[400px] bg-[#17313A]/60 rounded-full blur-[120px] pointer-events-none" />

      {/* Header — Glassmorphism */}
      <header className="sticky top-0 z-50 bg-[#0F2027]/80 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: 'rgba(199,143,123,0.15)', border: '1px solid rgba(199,143,123,0.3)' }}>
                <Building2 className="w-5 h-5 text-[#C78F7B]" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-white">Panel de Asesor</h1>
                <p className="text-xs text-[#B0ACA6]">{user.nombre}</p>
              </div>
            </div>
            <button
              onClick={() => { logout(); handleNavigation('/login') }}
              className="flex items-center gap-2 px-4 py-2 text-[#B0ACA6] hover:text-white hover:bg-white/5 rounded-xl transition-all text-sm border border-white/10 hover:border-[#C78F7B]/30"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Cerrar Sesión</span>
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        {/* Welcome Hero */}
        <div className="mb-8">
          <div className="relative bg-white/[0.03] backdrop-blur-md border border-white/10 rounded-[28px] p-6 sm:p-8 overflow-hidden">
            <div className="absolute -top-20 -right-20 w-40 h-40 bg-[#C78F7B]/10 rounded-full blur-[60px] pointer-events-none" />
            <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
              <div>
                <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#C78F7B]/10 border border-[#C78F7B]/25 text-[#C78F7B] text-[10px] font-bold uppercase tracking-[0.3em] mb-3">
                  <Diamond className="w-3 h-3" /> {getPlanById(user.plan || 'core')?.name}
                </span>
                <h1 className="text-2xl sm:text-3xl font-black text-white mb-1">
                  {(() => {
                    const nombre = user.nombre || ''
                    const nombreLower = nombre.toLowerCase()
                    const nombresFemeninos = ['ana', 'maria', 'maría', 'sofia', 'sofía', 'daniela', 'gris', 'lizzie', 'ingrid']
                    const esFemenino = nombresFemeninos.some(n => nombreLower.includes(n))
                    return esFemenino ? `Bienvenida, ${user.nombre}` : `Bienvenido, ${user.nombre}`
                  })()}
                </h1>
                <p className="text-sm text-[#B0ACA6]">Gestiona tus propiedades y alcanza tus metas</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {user.email === 'lizzie@conectia.mx' && (
                  <button onClick={() => handleNavigation('/panel-admin/publicidad')} className="flex items-center gap-2 px-4 py-2.5 bg-white/5 border border-white/15 hover:border-[#C78F7B]/30 hover:bg-white/10 text-white rounded-xl transition-all text-sm font-semibold">
                    <Sparkles className="w-4 h-4 text-[#C78F7B]" /> Publicidad
                  </button>
                )}
                <button onClick={() => handleNavigation('/panel-asesor/propiedades')} className="flex items-center gap-2 px-4 py-2.5 bg-[#C78F7B] hover:bg-[#D4987E] text-[#0F2027] rounded-xl transition-all text-sm font-bold shadow-lg shadow-[#C78F7B]/20">
                  <Settings className="w-4 h-4" /> Gestionar Propiedades
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Bonus System — Glassmorphism Card */}
        <div className="relative bg-white/[0.03] backdrop-blur-md border border-white/10 rounded-[28px] p-6 sm:p-8 mb-8 overflow-hidden">
          <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-[#C78F7B]/10 rounded-full blur-[40px] pointer-events-none" />
          <div className="relative">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#C78F7B]/20 flex items-center justify-center">
                  <Award className="w-5 h-5 text-[#C78F7B]" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">Sistema de Bonos</h2>
                  <p className="text-xs text-[#B0ACA6]">Alcanza tus metas y gana bonos</p>
                </div>
              </div>
              <div className="text-right">
                <div className="inline-block px-5 py-2.5 rounded-2xl bg-[#C78F7B]/15 border border-[#C78F7B]/30">
                  <p className="text-2xl font-black text-[#C78F7B]">${bonoActual.bono.toLocaleString()}</p>
                </div>
                <p className="text-xs text-[#B0ACA6] mt-1">Próximo bono</p>
              </div>
            </div>

            {/* Progress bar */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-[#B0ACA6]">Meta: {bonoActual.descripcion}</span>
                {faltanVentas > 0 ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/30 text-xs font-bold text-red-400">
                    <TrendingUp className="w-3 h-3" /> ¡Faltan {faltanVentas} {faltanVentas === 1 ? 'venta' : 'ventas'}!
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-500/10 border border-green-500/30 text-xs font-bold text-green-400">
                    <CheckCircle2 className="w-3 h-3" /> ¡Meta alcanzada!
                  </span>
                )}
              </div>
              <div className="relative h-6 bg-white/5 rounded-full overflow-hidden border border-white/10">
                <div className="absolute inset-y-0 left-0 bg-gradient-to-r from-[#C78F7B] to-[#E8A88F] rounded-full transition-all duration-1000 ease-out flex items-center justify-end pr-2" style={{ width: `${Math.min(progresoBono, 100)}%` }}>
                  {progresoBono > 15 && <span className="text-[10px] font-bold text-[#0F2027]">{ventasMes}/{bonoActual.meta}</span>}
                </div>
                {progresoBono <= 15 && <div className="absolute inset-0 flex items-center justify-center text-[10px] text-[#B0ACA6] font-medium">{ventasMes}/{bonoActual.meta}</div>}
              </div>
              <div className="flex items-center justify-between mt-1 text-[10px] text-[#4A4F57]">
                <span>0 ventas</span>
                <span>{Math.round(progresoBono)}% completado</span>
                <span>{bonoActual.meta} ventas</span>
              </div>
            </div>

            {/* Bonus milestones */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
              {bonos.map((b, idx) => (
                <div key={idx} className={`p-3 rounded-xl border transition-all relative overflow-hidden ${
                  ventasMes >= b.meta ? 'bg-green-500/10 border-green-500/30 shadow-lg shadow-green-500/10' : b.meta === bonoActual.meta ? 'bg-[#C78F7B]/10 border-[#C78F7B]/30 shadow-lg shadow-[#C78F7B]/10' : 'bg-white/[0.02] border-white/10 opacity-50'
                }`}>
                  <div className="text-center relative z-10">
                    {ventasMes >= b.meta ? <CheckCircle2 className="w-5 h-5 text-green-400 mx-auto mb-1.5" /> : b.meta === bonoActual.meta ? <Flame className="w-5 h-5 text-[#C78F7B] mx-auto mb-1.5" /> : <Award className="w-5 h-5 text-[#4A4F57] mx-auto mb-1.5" />}
                    <p className="text-[10px] font-medium text-[#B0ACA6] mb-0.5">{b.descripcion}</p>
                    <p className={`text-lg font-black ${ventasMes >= b.meta ? 'text-green-400' : b.meta === bonoActual.meta ? 'text-[#C78F7B]' : 'text-[#4A4F57]'}`}>${(b.bono / 1000).toFixed(0)}k</p>
                    {b.meta === bonoActual.meta && ventasMes < b.meta && <p className="text-[10px] text-[#C78F7B]/70 mt-0.5">Siguiente meta</p>}
                    {ventasMes >= b.meta && <p className="text-[10px] text-green-400/70 mt-0.5">¡Ganado!</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Stats Cards — Glassmorphism */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { icon: Building2, label: 'Propiedades', value: progress.length, sub: `${progress.filter(p => p.status === 'vendida' || p.status === 'rentada').length} cerradas`, badge: `${progress.filter(p => p.status === 'activa').length} activas`, accent: '#C78F7B' },
            { icon: Users, label: 'Leads totales', value: totalLeads, sub: `${leads.filter(l => l.status === 'calificado').length} calificados`, badge: `${leads.filter(l => l.status === 'nuevo').length} nuevos`, accent: '#3b82f6' },
            { icon: Eye, label: 'Visitas', value: totalVisitas, sub: `De ${totalLeads} leads`, badge: `${totalLeads > 0 ? Math.round((totalVisitas / totalLeads) * 100) : 0}% tasa`, accent: '#22c55e' },
            { icon: DollarSign, label: 'Ofertas', value: totalOfertas, sub: `De ${totalVisitas} visitas`, badge: `${totalVisitas > 0 ? Math.round((totalOfertas / totalVisitas) * 100) : 0}% conv.`, accent: '#a855f7' },
          ].map((stat, i) => (
            <div key={i} className="relative bg-white/[0.03] backdrop-blur-md border border-white/10 rounded-[24px] p-5 overflow-hidden group hover:border-white/20 transition-all duration-300">
              <div className="absolute -top-6 -right-6 w-20 h-20 rounded-full pointer-events-none opacity-30" style={{ background: `${stat.accent}20` }} />
              <div className="flex items-start justify-between mb-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${stat.accent}15` }}>
                  <stat.icon className="w-5 h-5" style={{ color: stat.accent }} />
                </div>
                <span className="text-[10px] font-bold px-2 py-1 rounded-full" style={{ background: `${stat.accent}15`, color: stat.accent }}>{stat.badge}</span>
              </div>
              <p className="text-3xl font-black text-white mb-1">{stat.value}</p>
              <p className="text-sm text-[#B0ACA6]">{stat.label}</p>
              <p className="text-[10px] text-[#4A4F57] mt-1">{stat.sub}</p>
            </div>
          ))}
        </div>

        {/* Charts — Glassmorphism */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="relative bg-white/[0.03] backdrop-blur-md border border-white/10 rounded-[28px] overflow-hidden">
            <div className="p-5 border-b border-white/10 flex items-center gap-3">
              <div className="w-8 h-8 bg-[#C78F7B]/15 rounded-lg flex items-center justify-center"><TrendingUp className="w-4 h-4 text-[#C78F7B]" /></div>
              <h2 className="text-sm font-bold text-white">Performance por Propiedad</h2>
            </div>
            <div className="p-6">
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={leadsPorPropiedad}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="nombre" tick={{ fill: '#B0ACA6', fontSize: 10 }} />
                  <YAxis tick={{ fill: '#B0ACA6', fontSize: 10 }} />
                  <Tooltip contentStyle={{ backgroundColor: '#17313A', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '12px', color: '#fff' }} />
                  <Legend wrapperStyle={{ color: '#B0ACA6' }} />
                  <Bar dataKey="leads" fill="#3b82f6" name="Leads" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="visitas" fill="#22c55e" name="Visitas" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="ofertas" fill="#a855f7" name="Ofertas" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="relative bg-white/[0.03] backdrop-blur-md border border-white/10 rounded-[28px] overflow-hidden">
            <div className="p-5 border-b border-white/10 flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-500/15 rounded-lg flex items-center justify-center"><Users className="w-4 h-4 text-blue-400" /></div>
              <h2 className="text-sm font-bold text-white">Distribución de Leads</h2>
            </div>
            <div className="p-6">
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={leadsPorEstatus} cx="50%" cy="50%" labelLine={false} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} outerRadius={90} fill="#8884d8" dataKey="value">
                    {leadsPorEstatus.map((entry, index) => (<Cell key={`cell-${index}`} fill={entry.color} />))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#17313A', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '12px', color: '#fff' }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="grid grid-cols-2 gap-2 mt-3">
                {leadsPorEstatus.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2 p-2 rounded-xl bg-white/[0.03] border border-white/10">
                    <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                    <div className="flex-1 min-w-0"><p className="text-[10px] text-[#B0ACA6] truncate">{item.name}</p><p className="text-sm font-black text-white">{item.value}</p></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Weekly Activity — Glassmorphism */}
        <div className="relative bg-white/[0.03] backdrop-blur-md border border-white/10 rounded-[28px] overflow-hidden mb-8">
          <div className="p-5 border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-green-500/15 rounded-lg flex items-center justify-center"><TrendingUp className="w-4 h-4 text-green-400" /></div>
              <h2 className="text-sm font-bold text-white">Actividad de la Semana</h2>
            </div>
            <span className="text-[10px] text-[#B0ACA6] bg-white/5 px-3 py-1 rounded-full border border-white/10">Últimos 7 días</span>
          </div>
          <div className="p-6">
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={actividadSemanal}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="dia" tick={{ fill: '#B0ACA6' }} />
                <YAxis tick={{ fill: '#B0ACA6' }} />
                <Tooltip contentStyle={{ backgroundColor: '#17313A', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '12px', color: '#fff' }} />
                <Legend wrapperStyle={{ color: '#B0ACA6' }} />
                <Line type="monotone" dataKey="leads" stroke="#3b82f6" strokeWidth={2} name="Leads" dot={{ fill: '#3b82f6', r: 4 }} />
                <Line type="monotone" dataKey="visitas" stroke="#22c55e" strokeWidth={2} name="Visitas" dot={{ fill: '#22c55e', r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Lists — Glassmorphism */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Mis Propiedades */}
          <div className="relative bg-white/[0.03] backdrop-blur-md border border-white/10 rounded-[28px] overflow-hidden">
            <div className="p-5 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-[#C78F7B]/15 rounded-lg flex items-center justify-center"><Building2 className="w-4 h-4 text-[#C78F7B]" /></div>
                <h2 className="text-sm font-bold text-white">Mis Propiedades</h2>
              </div>
              <span className="text-[10px] font-bold text-[#C78F7B] bg-[#C78F7B]/10 px-2.5 py-1 rounded-full">{progress.length} total</span>
            </div>
            <div className="p-5 space-y-3 max-h-[600px] overflow-y-auto">
              {progress.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="w-14 h-14 bg-[#C78F7B]/10 rounded-2xl flex items-center justify-center mb-3"><Building2 className="w-7 h-7 text-[#C78F7B]/40" /></div>
                  <p className="text-sm text-[#B0ACA6] font-medium mb-1">Sin propiedades asignadas</p>
                  <p className="text-xs text-[#4A4F57]">Tus propiedades aparecerán aquí</p>
                </div>
              ) : (
                progress.map((prog) => {
                  const propiedad = propiedades.find(p => p.id === prog.propiedadId)
                  if (!propiedad) return null
                  return (
                    <div key={prog.propiedadId} className="p-4 bg-white/[0.03] rounded-2xl border border-white/10 hover:border-white/20 transition-all">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-white text-sm mb-1 truncate">{propiedad.titulo}</h3>
                          <p className="text-[10px] text-[#B0ACA6] flex items-center gap-1"><MapPin className="w-3 h-3 text-[#C78F7B]" /> {propiedad.ubicacion}</p>
                        </div>
                        <span className={`ml-2 shrink-0 px-2 py-0.5 rounded-full text-[10px] font-bold ${getStatusColor(prog.status)}`}>{prog.status.replace('_', ' ')}</span>
                      </div>
                      <div className="grid grid-cols-3 gap-2 mb-3">
                        <div className="text-center bg-blue-500/10 rounded-xl p-2"><p className="text-lg font-black text-blue-400">{prog.leads}</p><p className="text-[10px] text-[#4A4F57]">Leads</p></div>
                        <div className="text-center bg-green-500/10 rounded-xl p-2"><p className="text-lg font-black text-green-400">{prog.visitas}</p><p className="text-[10px] text-[#4A4F57]">Visitas</p></div>
                        <div className="text-center bg-purple-500/10 rounded-xl p-2"><p className="text-lg font-black text-purple-400">{prog.ofertas}</p><p className="text-[10px] text-[#4A4F57]">Ofertas</p></div>
                      </div>
                      {prog.notas && (
                        <div className="p-2.5 bg-[#C78F7B]/10 rounded-xl border border-[#C78F7B]/20 mb-2">
                          <p className="text-[10px] text-[#C78F7B]">📝 {prog.notas}</p>
                        </div>
                      )}
                      <div className="flex items-center gap-1.5 text-[10px] text-[#4A4F57]"><Clock className="w-3 h-3" /><span>{formatDate(prog.ultimaActividad)}</span></div>
                    </div>
                  )
                })
              )}
            </div>
          </div>

          {/* Leads Recientes */}
          <div className="relative bg-white/[0.03] backdrop-blur-md border border-white/10 rounded-[28px] overflow-hidden">
            <div className="p-5 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-500/15 rounded-lg flex items-center justify-center"><Users className="w-4 h-4 text-blue-400" /></div>
                <h2 className="text-sm font-bold text-white">Leads Recientes</h2>
              </div>
              <span className="text-[10px] font-bold text-blue-400 bg-blue-500/10 px-2.5 py-1 rounded-full">{leads.length} leads</span>
            </div>
            <div className="p-5 space-y-3 max-h-[600px] overflow-y-auto">
              {leads.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="w-14 h-14 bg-blue-500/10 rounded-2xl flex items-center justify-center mb-3"><Users className="w-7 h-7 text-blue-400/40" /></div>
                  <p className="text-sm text-[#B0ACA6] font-medium mb-1">Sin leads por ahora</p>
                  <p className="text-xs text-[#4A4F57]">Los leads de tus propiedades aparecerán aquí</p>
                </div>
              ) : (
                leads.map((lead) => {
                  const propiedad = propiedades.find(p => p.id === lead.propiedadId)
                  if (!propiedad) return null
                  return (
                    <div key={lead.id} className="p-4 bg-white/[0.03] rounded-2xl border border-white/10 hover:border-white/20 transition-all">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-white text-sm truncate">{lead.nombre}</h3>
                          <p className="text-[10px] text-[#B0ACA6] truncate">{propiedad.titulo}</p>
                        </div>
                        <span className={`ml-2 shrink-0 px-2 py-0.5 rounded-full text-[10px] font-bold ${getLeadStatusColor(lead.status)}`}>{lead.status}</span>
                      </div>
                      <p className="text-xs text-[#B0ACA6] mb-3 p-2.5 bg-white/[0.03] rounded-xl italic border-l-2 border-[#C78F7B]/30">“{lead.mensaje}”</p>
                      <div className="flex flex-col sm:flex-row gap-2 mb-3">
                        <a href={`tel:${lead.telefono}`} className="flex items-center gap-1.5 text-[10px] text-[#B0ACA6] hover:text-[#C78F7B] transition-colors bg-white/[0.03] px-3 py-1.5 rounded-lg border border-white/10"><Phone className="w-3 h-3" />{lead.telefono}</a>
                        <a href={`mailto:${lead.email}`} className="flex items-center gap-1.5 text-[10px] text-[#B0ACA6] hover:text-[#C78F7B] transition-colors bg-white/[0.03] px-3 py-1.5 rounded-lg border border-white/10"><Mail className="w-3 h-3" /><span className="truncate">{lead.email}</span></a>
                      </div>
                      <div className="flex items-center gap-1.5 text-[10px] text-[#4A4F57]"><Clock className="w-3 h-3" /><span>{formatDate(lead.fecha)}</span></div>
                    </div>
                  )
                })
              )}
            </div>
          </div>
        </div>

        {/* Actividad Reciente — Glassmorphism */}
        <div className="relative bg-white/[0.03] backdrop-blur-md border border-white/10 rounded-[28px] overflow-hidden mb-8">
          <div className="p-5 border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-purple-500/15 rounded-lg flex items-center justify-center"><TrendingUp className="w-4 h-4 text-purple-400" /></div>
              <h2 className="text-sm font-bold text-white">Actividad Reciente</h2>
            </div>
            <span className="text-[10px] text-[#B0ACA6] bg-white/5 px-3 py-1 rounded-full border border-white/10">{activities.length} registros</span>
          </div>
          <div className="p-5">
            {activities.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="w-14 h-14 bg-purple-500/10 rounded-2xl flex items-center justify-center mb-3"><TrendingUp className="w-7 h-7 text-purple-400/40" /></div>
                <p className="text-sm text-[#B0ACA6] font-medium mb-1">Sin actividad registrada</p>
                <p className="text-xs text-[#4A4F57]">Las acciones del día aparecerán aquí</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {activities.map((activity) => {
                  const propiedad = propiedades.find(p => p.id === activity.propiedadId)
                  if (!propiedad) return null
                  const iconConfig = {
                    lead: { icon: <Users className="w-4 h-4 text-blue-400" />, bg: 'bg-blue-500/15', border: 'border-blue-500/20' },
                    visita: { icon: <Eye className="w-4 h-4 text-green-400" />, bg: 'bg-green-500/15', border: 'border-green-500/20' },
                    oferta: { icon: <DollarSign className="w-4 h-4 text-purple-400" />, bg: 'bg-purple-500/15', border: 'border-purple-500/20' },
                    venta: { icon: <CheckCircle2 className="w-4 h-4 text-green-400" />, bg: 'bg-green-600/15', border: 'border-green-600/20' },
                    nota: { icon: <FileText className="w-4 h-4 text-[#B0ACA6]" />, bg: 'bg-white/5', border: 'border-white/10' }
                  }
                  const cfg = iconConfig[activity.tipo as keyof typeof iconConfig] || iconConfig.nota
                  return (
                    <div key={activity.id} className={`flex items-start gap-3 p-4 bg-white/[0.03] rounded-2xl border ${cfg.border} hover:border-white/20 transition-all`}>
                      <div className={`w-9 h-9 ${cfg.bg} rounded-xl flex items-center justify-center flex-shrink-0`}>{cfg.icon}</div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-white font-medium leading-tight mb-1">{activity.descripcion}</p>
                        <p className="text-[10px] text-[#B0ACA6] truncate mb-1">{propiedad.titulo}</p>
                        <p className="text-[10px] text-[#4A4F57]">{formatDate(activity.fecha)}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        {/* Desarrollos Manager — solo para Ana García */}
        {user.email === 'ana@conectia.mx' && (
          <div className="mb-8">
            <div className="relative bg-white/[0.03] backdrop-blur-md border border-white/10 rounded-[28px] p-6 sm:p-8 overflow-hidden">
              <div className="absolute -top-20 -right-20 w-40 h-40 bg-[#C78F7B]/10 rounded-full blur-[60px] pointer-events-none" />
              <div className="relative mb-6">
                <h2 className="text-2xl font-bold text-white mb-1">Gestión de Desarrollos</h2>
                <p className="text-sm text-[#B0ACA6]">Administra proyectos, calendario y usa el agente IA</p>
              </div>
              <DesarrollosManager userRole="asesor" />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
