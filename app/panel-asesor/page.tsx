'use client'

import { useEffect, useState } from 'react'
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
  Camera,
  Crown,
  Zap,
  Sparkles
} from 'lucide-react'
import { getPlanById } from '@/data/subscription-plans'
import { DesarrollosManager } from '@/components/desarrollos-manager'

// Lista de asesores autorizados para ver solicitudes del fotógrafo
const ASESORES_AUTORIZADOS_FOTOGRAFO = ['lizzie@conectia.mx']
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

export default function PanelAsesorPage() {
  const { user, logout, isAuthenticated, loading } = useAuth()
  const router = useRouter()
  const [progress, setProgress] = useState<PropertyProgress[]>([])
  const [leads, setLeads] = useState<Lead[]>([])
  const [activities, setActivities] = useState<Activity[]>([])

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

    // Cargar datos del asesor
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
  }, [user, isAuthenticated, loading, router])

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
      case 'activa': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
      case 'en_negociacion': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
      case 'vendida': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
      case 'rentada': return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
      default: return 'bg-conectia-secondary text-gray-700 dark:bg-gray-900/30 dark:text-gray-400'
    }
  }

  const getLeadStatusColor = (status: string) => {
    switch (status) {
      case 'nuevo': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
      case 'contactado': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
      case 'calificado': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
      case 'descartado': return 'bg-conectia-secondary text-gray-700 dark:bg-gray-900/30 dark:text-gray-400'
      default: return 'bg-conectia-secondary text-gray-700 dark:bg-gray-900/30 dark:text-gray-400'
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
    <div className="min-h-screen bg-conectia-secondary dark:bg-gray-900">
      {/* Header */}
      <header className="bg-[#1A3540] border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-conectia-gold/10 rounded-xl flex items-center justify-center">
                <Building2 className="w-6 h-6 text-conectia-gold" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                  Panel de Asesor
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {user.nombre}
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                logout()
                router.push('/login')
              }}
              className="flex items-center gap-2 px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-conectia-secondary dark:hover:bg-gray-700 rounded-xl transition-all"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Cerrar Sesión</span>
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header con botón de gestión */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
              {(() => {
                // Detectar género basado en el nombre
                const nombre = user.nombre || ''
                const nombreLower = nombre.toLowerCase()
                const nombresFemeninos = ['ana', 'maria', 'maría', 'sofia', 'sofía', 'daniela', 'gris', 'lizzie', 'ingrid']
                const esFemenino = nombresFemeninos.some(n => nombreLower.includes(n))
                return esFemenino ? `Bienvenida, ${user.nombre}` : `Bienvenido, ${user.nombre}`
              })()}
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Gestiona tus propiedades y alcanza tus metas
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Botón para ver solicitudes del fotógrafo (solo para asesores autorizados) */}
            {ASESORES_AUTORIZADOS_FOTOGRAFO.includes(user.email) && (
              <button
                onClick={() => router.push('/panel-asesor/solicitudes-fotografo')}
                className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-all font-semibold shadow-lg hover:shadow-xl whitespace-nowrap"
              >
                <Camera className="w-5 h-5" />
                <span className="hidden sm:inline">Solicitudes Fotógrafo</span>
                <span className="sm:hidden">Fotógrafo</span>
              </button>
            )}
            {/* Botón Publicidad (solo Lizzie) */}
            {user.email === 'lizzie@conectia.mx' && (
              <button
                onClick={() => router.push('/panel-admin/publicidad')}
                className="flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl transition-all font-semibold shadow-lg hover:shadow-xl whitespace-nowrap"
              >
                <Sparkles className="w-5 h-5" />
                <span className="hidden sm:inline">Publicidad</span>
                <span className="sm:hidden">Ads</span>
              </button>
            )}
            <button
              onClick={() => router.push('/panel-asesor/propiedades')}
              className="flex items-center gap-2 px-6 py-3 bg-[#C78F7B] hover:bg-[#D4987E] text-[#17313A] rounded-xl transition-all font-semibold shadow-lg hover:shadow-xl whitespace-nowrap"
            >
              <Settings className="w-5 h-5" />
              <span className="hidden sm:inline">Gestionar Propiedades</span>
              <span className="sm:hidden">Mis Propiedades</span>
            </button>
          </div>
        </div>

        {/* Plan Information */}
        <div className="bg-gradient-to-r from-conectia-gold/10 to-conectia-gold/5 rounded-2xl p-6 mb-8 border-2 border-conectia-gold/30">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              {user.plan === 'elite' ? (
                <div className="w-12 h-12 bg-conectia-gold rounded-xl flex items-center justify-center">
                  <Crown className="w-6 h-6 text-white" />
                </div>
              ) : (
                <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center">
                  <Zap className="w-6 h-6 text-white" />
                </div>
              )}
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  {getPlanById(user.plan || 'core')?.name}
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {user.plan === 'elite' 
                    ? 'Propiedades ilimitadas • Asistente IA incluido'
                    : 'Hasta 6 propiedades activas'
                  }
                </p>
              </div>
            </div>
            {user.plan !== 'elite' && (
              <button
                onClick={() => router.push('/panel-asesor/planes')}
                className="flex items-center gap-2 px-6 py-3 bg-[#C78F7B] hover:bg-[#D4987E] text-[#17313A] rounded-xl transition-all font-semibold shadow-lg hover:shadow-xl whitespace-nowrap"
              >
                <Crown className="w-5 h-5" />
                <span className="hidden sm:inline">Actualizar a Elite</span>
                <span className="sm:inline">Mejorar Plan</span>
              </button>
            )}
          </div>
        </div>

        {/* Sistema de Bonos */}
        <div className="bg-conectia-secondary dark:bg-gray-800 rounded-2xl p-6 mb-8 border-2 border-gray-300 dark:border-gray-700">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-conectia-gold rounded-xl flex items-center justify-center">
                <Award className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Sistema de Bonos</h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">Alcanza tus metas y gana bonos increíbles</p>
              </div>
            </div>
            <div className="text-right">
              <div className="inline-block px-6 py-3 rounded-2xl bg-conectia-gold/20 backdrop-blur-md border border-conectia-gold/30 shadow-lg">
                <p className="text-3xl font-bold text-gray-900 dark:text-white">${bonoActual.bono.toLocaleString()}</p>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">Próximo bono</p>
            </div>
          </div>

          {/* Termómetro de progreso */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Target className="w-5 h-5 text-conectia-gold" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Meta: {bonoActual.descripcion}
                </span>
              </div>
              <div className="flex items-center gap-2">
                {faltanVentas > 0 ? (
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-500/20 backdrop-blur-md border border-red-500/30 shadow-md">
                    <TrendingUp className="w-4 h-4 text-red-700 dark:text-red-400" />
                    <span className="text-sm font-bold text-red-700 dark:text-red-400">
                      ¡Faltan {faltanVentas} {faltanVentas === 1 ? 'venta' : 'ventas'}!
                    </span>
                  </div>
                ) : (
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/20 backdrop-blur-md border border-green-500/30 shadow-md">
                    <CheckCircle2 className="w-4 h-4 text-green-700 dark:text-green-400" />
                    <span className="text-sm font-bold text-green-700 dark:text-green-400">
                      ¡Meta alcanzada!
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Barra de progreso estilo termómetro */}
            <div className="relative h-8 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div
                className="absolute inset-y-0 left-0 bg-gradient-to-r from-conectia-gold via-yellow-500 to-orange-500 rounded-full transition-all duration-1000 ease-out flex items-center justify-end pr-3"
                style={{ width: `${Math.min(progresoBono, 100)}%` }}
              >
                {progresoBono > 15 && (
                  <div className="flex items-center gap-1 text-white font-bold text-sm">
                    <Flame className="w-4 h-4" />
                    <span>{ventasMes}/{bonoActual.meta}</span>
                  </div>
                )}
              </div>
              {progresoBono <= 15 && (
                <div className="absolute inset-0 flex items-center justify-center text-gray-700 dark:text-gray-300 font-bold text-sm">
                  {ventasMes}/{bonoActual.meta}
                </div>
              )}
            </div>

            <div className="flex items-center justify-between mt-2 text-xs text-gray-600 dark:text-gray-400">
              <span>0 ventas</span>
              <span className="font-medium">{Math.round(progresoBono)}% completado</span>
              <span>{bonoActual.meta} ventas</span>
            </div>
          </div>

          {/* Tabla de bonos */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            {bonos.map((b, idx) => (
              <div
                key={idx}
                className={`p-4 rounded-xl border-2 transition-all relative overflow-hidden ${
                  ventasMes >= b.meta
                    ? 'bg-green-900/30 border-green-500 shadow-lg shadow-green-500/20'
                    : b.meta === bonoActual.meta
                      ? 'bg-conectia-gold/10 border-conectia-gold shadow-lg shadow-conectia-gold/20 ring-2 ring-conectia-gold/30'
                      : 'bg-[#17313A] border-gray-700 opacity-60'
                }`}
              >
                {(ventasMes >= b.meta || b.meta === bonoActual.meta) && (
                  <div className="absolute -top-4 -right-4 w-12 h-12 rounded-full opacity-20 bg-white pointer-events-none" />
                )}
                <div className="text-center relative z-10">
                  {ventasMes >= b.meta ? (
                    <CheckCircle2 className="w-7 h-7 text-green-400 mx-auto mb-2" />
                  ) : b.meta === bonoActual.meta ? (
                    <Flame className="w-7 h-7 text-conectia-gold mx-auto mb-2" />
                  ) : (
                    <Award className="w-7 h-7 text-gray-600 mx-auto mb-2" />
                  )}
                  <p className="text-xs font-medium text-gray-400 mb-1">{b.descripcion}</p>
                  <p className={`text-xl font-black ${
                    ventasMes >= b.meta ? 'text-green-400' : b.meta === bonoActual.meta ? 'text-conectia-gold' : 'text-gray-500'
                  }`}>
                    ${(b.bono / 1000).toFixed(0)}k
                  </p>
                  {b.meta === bonoActual.meta && ventasMes < b.meta && (
                    <p className="text-xs text-conectia-gold/70 mt-1">Siguiente meta</p>
                  )}
                  {ventasMes >= b.meta && (
                    <p className="text-xs text-green-400/70 mt-1">¡Ganado!</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {/* Propiedades */}
          <div className="bg-[#1A3540] rounded-2xl p-5 border border-conectia-gold/20 relative overflow-hidden group hover:border-conectia-gold/50 hover:shadow-lg hover:shadow-conectia-gold/10 transition-all duration-300">
            <div className="absolute -top-6 -right-6 w-20 h-20 bg-conectia-gold/10 rounded-full pointer-events-none" />
            <div className="absolute -bottom-4 -left-4 w-14 h-14 bg-conectia-gold/5 rounded-full pointer-events-none" />
            <div className="flex items-start justify-between mb-4">
              <div className="w-11 h-11 bg-conectia-gold/20 rounded-xl flex items-center justify-center">
                <Building2 className="w-5 h-5 text-conectia-gold" />
              </div>
              <span className="text-xs font-semibold text-conectia-gold bg-conectia-gold/10 px-2 py-1 rounded-full">
                {progress.filter(p => p.status === 'activa').length} activas
              </span>
            </div>
            <p className="text-4xl font-black text-white mb-1">{progress.length}</p>
            <p className="text-sm text-gray-400">Propiedades</p>
            <p className="text-xs text-gray-500 mt-1">{progress.filter(p => p.status === 'vendida' || p.status === 'rentada').length} cerradas este mes</p>
          </div>

          {/* Leads */}
          <div className="bg-[#1A3540] rounded-2xl p-5 border border-blue-500/20 relative overflow-hidden group hover:border-blue-500/50 hover:shadow-lg hover:shadow-blue-500/10 transition-all duration-300">
            <div className="absolute -top-6 -right-6 w-20 h-20 bg-blue-500/10 rounded-full pointer-events-none" />
            <div className="absolute -bottom-4 -left-4 w-14 h-14 bg-blue-500/5 rounded-full pointer-events-none" />
            <div className="flex items-start justify-between mb-4">
              <div className="w-11 h-11 bg-blue-500/20 rounded-xl flex items-center justify-center">
                <Users className="w-5 h-5 text-blue-400" />
              </div>
              <span className="text-xs font-semibold text-blue-400 bg-blue-500/10 px-2 py-1 rounded-full">
                {leads.filter(l => l.status === 'nuevo').length} nuevos
              </span>
            </div>
            <p className="text-4xl font-black text-white mb-1">{totalLeads}</p>
            <p className="text-sm text-gray-400">Leads totales</p>
            <p className="text-xs text-gray-500 mt-1">{leads.filter(l => l.status === 'calificado').length} calificados</p>
          </div>

          {/* Visitas */}
          <div className="bg-[#1A3540] rounded-2xl p-5 border border-green-500/20 relative overflow-hidden group hover:border-green-500/50 hover:shadow-lg hover:shadow-green-500/10 transition-all duration-300">
            <div className="absolute -top-6 -right-6 w-20 h-20 bg-green-500/10 rounded-full pointer-events-none" />
            <div className="absolute -bottom-4 -left-4 w-14 h-14 bg-green-500/5 rounded-full pointer-events-none" />
            <div className="flex items-start justify-between mb-4">
              <div className="w-11 h-11 bg-green-500/20 rounded-xl flex items-center justify-center">
                <Eye className="w-5 h-5 text-green-400" />
              </div>
              <span className="text-xs font-semibold text-green-400 bg-green-500/10 px-2 py-1 rounded-full">
                {totalLeads > 0 ? Math.round((totalVisitas / totalLeads) * 100) : 0}% tasa
              </span>
            </div>
            <p className="text-4xl font-black text-white mb-1">{totalVisitas}</p>
            <p className="text-sm text-gray-400">Visitas agendadas</p>
            <p className="text-xs text-gray-500 mt-1">De {totalLeads} leads totales</p>
          </div>

          {/* Ofertas */}
          <div className="bg-[#1A3540] rounded-2xl p-5 border border-purple-500/20 relative overflow-hidden group hover:border-purple-500/50 hover:shadow-lg hover:shadow-purple-500/10 transition-all duration-300">
            <div className="absolute -top-6 -right-6 w-20 h-20 bg-purple-500/10 rounded-full pointer-events-none" />
            <div className="absolute -bottom-4 -left-4 w-14 h-14 bg-purple-500/5 rounded-full pointer-events-none" />
            <div className="flex items-start justify-between mb-4">
              <div className="w-11 h-11 bg-purple-500/20 rounded-xl flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-purple-400" />
              </div>
              <span className="text-xs font-semibold text-purple-400 bg-purple-500/10 px-2 py-1 rounded-full">
                {totalVisitas > 0 ? Math.round((totalOfertas / totalVisitas) * 100) : 0}% conv.
              </span>
            </div>
            <p className="text-4xl font-black text-white mb-1">{totalOfertas}</p>
            <p className="text-sm text-gray-400">Ofertas recibidas</p>
            <p className="text-xs text-gray-500 mt-1">De {totalVisitas} visitas totales</p>
          </div>
        </div>

        {/* Gráficas de Análisis */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Gráfica de Leads por Propiedad */}
          <div className="bg-[#1A3540] rounded-2xl border border-gray-700/60 overflow-hidden shadow-xl">
            <div className="p-5 border-b border-gray-700/60 bg-gradient-to-r from-conectia-gold/10 to-transparent">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <div className="w-8 h-8 bg-conectia-gold/20 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-4 h-4 text-conectia-gold" />
                </div>
                Performance por Propiedad
              </h2>
            </div>
            <div className="p-6">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={leadsPorPropiedad}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.1} />
                  <XAxis dataKey="nombre" tick={{ fill: '#6b7280', fontSize: 12 }} />
                  <YAxis tick={{ fill: '#6b7280', fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1f2937',
                      border: '1px solid #374151',
                      borderRadius: '8px',
                      color: '#fff'
                    }}
                  />
                  <Legend />
                  <Bar dataKey="leads" fill="#3b82f6" name="Leads" radius={[8, 8, 0, 0]} />
                  <Bar dataKey="visitas" fill="#22c55e" name="Visitas" radius={[8, 8, 0, 0]} />
                  <Bar dataKey="ofertas" fill="#a855f7" name="Ofertas" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Gráfica de Leads por Estatus */}
          <div className="bg-[#1A3540] rounded-2xl border border-gray-700/60 overflow-hidden shadow-xl">
            <div className="p-5 border-b border-gray-700/60 bg-gradient-to-r from-blue-500/10 to-transparent">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
                  <Users className="w-4 h-4 text-blue-400" />
                </div>
                Distribución de Leads
              </h2>
            </div>
            <div className="p-6">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={leadsPorEstatus}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {leadsPorEstatus.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1f2937',
                      border: '1px solid #374151',
                      borderRadius: '8px',
                      color: '#fff'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="grid grid-cols-2 gap-2 mt-4">
                {leadsPorEstatus.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2 p-2.5 rounded-lg bg-[#17313A]">
                    <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: item.color }}></div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-gray-400 truncate">{item.name}</p>
                      <p className="text-sm font-black text-white">{item.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Gráfica de Actividad Semanal */}
        <div className="bg-[#1A3540] rounded-2xl border border-gray-700/60 overflow-hidden mb-6 shadow-xl">
          <div className="p-5 border-b border-gray-700/60 bg-gradient-to-r from-green-500/10 to-transparent">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-4 h-4 text-green-400" />
                </div>
                Actividad de la Semana
              </h2>
              <span className="text-xs text-gray-400 bg-gray-800 px-3 py-1 rounded-full">Últimos 7 días</span>
            </div>
          </div>
          <div className="p-6">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={actividadSemanal}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.1} />
                <XAxis dataKey="dia" tick={{ fill: '#6b7280' }} />
                <YAxis tick={{ fill: '#6b7280' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1f2937',
                    border: '1px solid #374151',
                    borderRadius: '8px',
                    color: '#fff'
                  }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="leads"
                  stroke="#3b82f6"
                  strokeWidth={3}
                  name="Leads"
                  dot={{ fill: '#3b82f6', r: 6 }}
                />
                <Line
                  type="monotone"
                  dataKey="visitas"
                  stroke="#22c55e"
                  strokeWidth={3}
                  name="Visitas"
                  dot={{ fill: '#22c55e', r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Mis Propiedades */}
          <div className="bg-[#1A3540] rounded-2xl border border-gray-700/60 overflow-hidden shadow-xl">
            <div className="p-5 border-b border-gray-700/60 bg-gradient-to-r from-conectia-gold/10 to-transparent">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <div className="w-8 h-8 bg-conectia-gold/20 rounded-lg flex items-center justify-center">
                    <Building2 className="w-4 h-4 text-conectia-gold" />
                  </div>
                  Mis Propiedades
                </h2>
                <span className="text-xs font-semibold text-conectia-gold bg-conectia-gold/10 px-3 py-1 rounded-full">
                  {progress.length} total
                </span>
              </div>
            </div>
            <div className="p-5 space-y-3 max-h-[600px] overflow-y-auto">
              {progress.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="w-16 h-16 bg-conectia-gold/10 rounded-2xl flex items-center justify-center mb-4">
                    <Building2 className="w-8 h-8 text-conectia-gold/40" />
                  </div>
                  <p className="text-gray-400 font-medium mb-1">Sin propiedades asignadas</p>
                  <p className="text-sm text-gray-600">Tus propiedades aparecerán aquí una vez asignadas</p>
                </div>
              ) : (
                progress.map((prog) => {
                  const propiedad = propiedades.find(p => p.id === prog.propiedadId)
                  if (!propiedad) return null

                  return (
                    <div key={prog.propiedadId} className="p-4 bg-[#17313A] rounded-xl border border-gray-700/60 hover:border-gray-600 transition-colors">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-white mb-1 truncate">
                            {propiedad.titulo}
                          </h3>
                          <p className="text-xs text-gray-400 flex items-center gap-1">
                            <span>📍</span> {propiedad.ubicacion}
                          </p>
                        </div>
                        <span className={`ml-2 shrink-0 px-2.5 py-1 rounded-full text-xs font-semibold ${getStatusColor(prog.status)}`}>
                          {prog.status.replace('_', ' ')}
                        </span>
                      </div>

                      <div className="grid grid-cols-3 gap-2 mb-3">
                        <div className="text-center bg-blue-500/10 rounded-lg p-2">
                          <p className="text-xl font-black text-blue-400">{prog.leads}</p>
                          <p className="text-xs text-gray-500">Leads</p>
                        </div>
                        <div className="text-center bg-green-500/10 rounded-lg p-2">
                          <p className="text-xl font-black text-green-400">{prog.visitas}</p>
                          <p className="text-xs text-gray-500">Visitas</p>
                        </div>
                        <div className="text-center bg-purple-500/10 rounded-lg p-2">
                          <p className="text-xl font-black text-purple-400">{prog.ofertas}</p>
                          <p className="text-xs text-gray-500">Ofertas</p>
                        </div>
                      </div>

                      {prog.notas && (
                        <div className="p-2.5 bg-conectia-gold/10 rounded-lg border border-conectia-gold/20 mb-2">
                          <p className="text-xs text-conectia-gold/80">📝 {prog.notas}</p>
                        </div>
                      )}

                      <div className="flex items-center gap-1.5 text-xs text-gray-600">
                        <Clock className="w-3 h-3" />
                        <span>{formatDate(prog.ultimaActividad)}</span>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </div>

          {/* Leads Recientes */}
          <div className="bg-[#1A3540] rounded-2xl border border-gray-700/60 overflow-hidden shadow-xl">
            <div className="p-5 border-b border-gray-700/60 bg-gradient-to-r from-blue-500/10 to-transparent">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
                    <Users className="w-4 h-4 text-blue-400" />
                  </div>
                  Leads Recientes
                </h2>
                <span className="text-xs font-semibold text-blue-400 bg-blue-500/10 px-3 py-1 rounded-full">
                  {leads.length} leads
                </span>
              </div>
            </div>
            <div className="p-5 space-y-3 max-h-[600px] overflow-y-auto">
              {leads.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="w-16 h-16 bg-blue-500/10 rounded-2xl flex items-center justify-center mb-4">
                    <Users className="w-8 h-8 text-blue-400/40" />
                  </div>
                  <p className="text-gray-400 font-medium mb-1">Sin leads por ahora</p>
                  <p className="text-sm text-gray-600">Los leads de tus propiedades aparecerán aquí</p>
                </div>
              ) : (
                leads.map((lead) => {
                  const propiedad = propiedades.find(p => p.id === lead.propiedadId)
                  if (!propiedad) return null

                  return (
                    <div key={lead.id} className="p-4 bg-[#17313A] rounded-xl border border-gray-700/60 hover:border-gray-600 transition-colors">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-white truncate">{lead.nombre}</h3>
                          <p className="text-xs text-gray-400 truncate">{propiedad.titulo}</p>
                        </div>
                        <span className={`ml-2 shrink-0 px-2.5 py-1 rounded-full text-xs font-semibold ${getLeadStatusColor(lead.status)}`}>
                          {lead.status}
                        </span>
                      </div>

                      <p className="text-sm text-gray-300 mb-3 p-3 bg-[#1A3540] rounded-lg italic border-l-2 border-conectia-gold/30">
                        “{lead.mensaje}”
                      </p>

                      <div className="flex flex-col sm:flex-row gap-2 mb-3">
                        <a href={`tel:${lead.telefono}`} className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-conectia-gold transition-colors bg-[#1A3540] px-3 py-1.5 rounded-lg">
                          <Phone className="w-3 h-3" />
                          {lead.telefono}
                        </a>
                        <a href={`mailto:${lead.email}`} className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-conectia-gold transition-colors bg-[#1A3540] px-3 py-1.5 rounded-lg">
                          <Mail className="w-3 h-3" />
                          <span className="truncate">{lead.email}</span>
                        </a>
                      </div>

                      <div className="flex items-center gap-1.5 text-xs text-gray-600">
                        <Clock className="w-3 h-3" />
                        <span>{formatDate(lead.fecha)}</span>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </div>
        </div>

        {/* Actividad Reciente */}
        <div className="mt-6 bg-[#1A3540] rounded-2xl border border-gray-700/60 overflow-hidden shadow-xl">
          <div className="p-5 border-b border-gray-700/60 bg-gradient-to-r from-purple-500/10 to-transparent">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-4 h-4 text-purple-400" />
                </div>
                Actividad Reciente
              </h2>
              <span className="text-xs text-gray-400 bg-gray-800 px-3 py-1 rounded-full">{activities.length} registros</span>
            </div>
          </div>
          <div className="p-5">
            {activities.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="w-16 h-16 bg-purple-500/10 rounded-2xl flex items-center justify-center mb-4">
                  <TrendingUp className="w-8 h-8 text-purple-400/40" />
                </div>
                <p className="text-gray-400 font-medium mb-1">Sin actividad registrada</p>
                <p className="text-sm text-gray-600">Las acciones del día apareceran aquí</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {activities.map((activity) => {
                  const propiedad = propiedades.find(p => p.id === activity.propiedadId)
                  if (!propiedad) return null

                  const iconConfig = {
                    lead: { icon: <Users className="w-4 h-4 text-blue-400" />, bg: 'bg-blue-500/20', border: 'border-blue-500/20' },
                    visita: { icon: <Eye className="w-4 h-4 text-green-400" />, bg: 'bg-green-500/20', border: 'border-green-500/20' },
                    oferta: { icon: <DollarSign className="w-4 h-4 text-purple-400" />, bg: 'bg-purple-500/20', border: 'border-purple-500/20' },
                    venta: { icon: <CheckCircle2 className="w-4 h-4 text-green-400" />, bg: 'bg-green-600/20', border: 'border-green-600/20' },
                    nota: { icon: <FileText className="w-4 h-4 text-gray-400" />, bg: 'bg-gray-500/20', border: 'border-gray-500/20' }
                  }
                  const cfg = iconConfig[activity.tipo as keyof typeof iconConfig] || iconConfig.nota

                  return (
                    <div key={activity.id} className={`flex items-start gap-3 p-4 bg-[#17313A] rounded-xl border ${cfg.border} hover:brightness-110 transition-all`}>
                      <div className={`w-9 h-9 ${cfg.bg} rounded-lg flex items-center justify-center flex-shrink-0`}>
                        {cfg.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-white font-medium leading-tight mb-1">
                          {activity.descripcion}
                        </p>
                        <p className="text-xs text-gray-400 truncate mb-1">{propiedad.titulo}</p>
                        <p className="text-xs text-gray-600">{formatDate(activity.fecha)}</p>
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
          <div className="mt-8">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">Gestión de Desarrollos</h2>
              <p className="text-gray-600 dark:text-gray-400">Administra proyectos, calendario y usa el agente IA</p>
            </div>
            <DesarrollosManager userRole="asesor" />
          </div>
        )}
      </div>
    </div>
  )
}
