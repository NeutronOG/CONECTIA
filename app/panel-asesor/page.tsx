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
      <header className="bg-conectia-secondary/50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
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
              className="flex items-center gap-2 px-6 py-3 bg-conectia-gold hover:bg-conectia-gold/90 text-black rounded-xl transition-all font-semibold shadow-lg hover:shadow-xl whitespace-nowrap"
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
                className="flex items-center gap-2 px-6 py-3 bg-conectia-gold hover:bg-conectia-gold/90 text-black rounded-xl transition-all font-semibold shadow-lg hover:shadow-xl whitespace-nowrap"
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
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {bonos.map((b, idx) => (
              <div
                key={idx}
                className={`p-4 rounded-xl border-2 transition-all ${ventasMes >= b.meta
                  ? 'bg-green-50 dark:bg-green-900/20 border-green-500'
                  : b.meta === bonoActual.meta
                    ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-500 ring-2 ring-yellow-500/50'
                    : 'bg-conectia-secondary/50 dark:bg-gray-800 border-gray-300 dark:border-gray-600'
                  }`}
              >
                <div className="text-center">
                  {ventasMes >= b.meta ? (
                    <CheckCircle2 className="w-6 h-6 text-green-500 mx-auto mb-2" />
                  ) : (
                    <Award className="w-6 h-6 text-gray-400 mx-auto mb-2" />
                  )}
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">{b.descripcion}</p>
                  <p className="text-lg font-bold text-gray-900 dark:text-white">
                    ${(b.bono / 1000).toFixed(0)}k
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-conectia-secondary/50 dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600 dark:text-gray-400 text-sm">Propiedades</span>
              <Building2 className="w-5 h-5 text-conectia-gold" />
            </div>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">{progress.length}</p>
          </div>

          <div className="bg-conectia-secondary/50 dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600 dark:text-gray-400 text-sm">Leads</span>
              <Users className="w-5 h-5 text-blue-500" />
            </div>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">{totalLeads}</p>
          </div>

          <div className="bg-conectia-secondary/50 dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600 dark:text-gray-400 text-sm">Visitas</span>
              <Eye className="w-5 h-5 text-green-500" />
            </div>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">{totalVisitas}</p>
          </div>

          <div className="bg-conectia-secondary/50 dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600 dark:text-gray-400 text-sm">Ofertas</span>
              <DollarSign className="w-5 h-5 text-purple-500" />
            </div>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">{totalOfertas}</p>
          </div>
        </div>

        {/* Gráficas de Análisis */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Gráfica de Leads por Propiedad */}
          <div className="bg-conectia-secondary/50 dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-conectia-gold" />
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
          <div className="bg-conectia-secondary/50 dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-conectia-gold" />
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
              <div className="grid grid-cols-2 gap-3 mt-4">
                {leadsPorEstatus.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {item.name}: <span className="font-bold text-gray-900 dark:text-white">{item.value}</span>
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Gráfica de Actividad Semanal */}
        <div className="bg-conectia-secondary/50 dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden mb-8">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-conectia-gold" />
              Actividad de la Semana
            </h2>
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Mis Propiedades */}
          <div className="bg-conectia-secondary/50 dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Building2 className="w-5 h-5 text-conectia-gold" />
                Mis Propiedades
              </h2>
            </div>
            <div className="p-6 space-y-4 max-h-[600px] overflow-y-auto">
              {progress.map((prog) => {
                const propiedad = propiedades.find(p => p.id === prog.propiedadId)
                if (!propiedad) return null

                return (
                  <div key={prog.propiedadId} className="p-4 bg-conectia-secondary/70 dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                          {propiedad.titulo}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {propiedad.ubicacion}
                        </p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(prog.status)}`}>
                        {prog.status.replace('_', ' ')}
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-4 mb-3">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">{prog.leads}</p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">Leads</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">{prog.visitas}</p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">Visitas</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">{prog.ofertas}</p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">Ofertas</p>
                      </div>
                    </div>

                    {prog.notas && (
                      <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                        <p className="text-xs text-yellow-800 dark:text-yellow-300">
                          📝 {prog.notas}
                        </p>
                      </div>
                    )}

                    <div className="flex items-center gap-2 mt-3 text-xs text-gray-500 dark:text-gray-400">
                      <Clock className="w-3 h-3" />
                      <span>Última actividad: {formatDate(prog.ultimaActividad)}</span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Leads Recientes */}
          <div className="bg-conectia-secondary/50 dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-conectia-gold" />
                Leads Recientes
              </h2>
            </div>
            <div className="p-6 space-y-4 max-h-[600px] overflow-y-auto">
              {leads.map((lead) => {
                const propiedad = propiedades.find(p => p.id === lead.propiedadId)
                if (!propiedad) return null

                return (
                  <div key={lead.id} className="p-4 bg-conectia-secondary/70 dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                          {lead.nombre}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {propiedad.titulo}
                        </p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getLeadStatusColor(lead.status)}`}>
                        {lead.status}
                      </span>
                    </div>

                    <p className="text-sm text-gray-700 dark:text-gray-300 mb-3 p-3 bg-conectia-secondary/50 dark:bg-gray-800 rounded-lg">
                      "{lead.mensaje}"
                    </p>

                    <div className="space-y-2 mb-3">
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <Phone className="w-4 h-4" />
                        <a href={`tel:${lead.telefono}`} className="hover:text-conectia-gold transition-colors">
                          {lead.telefono}
                        </a>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <Mail className="w-4 h-4" />
                        <a href={`mailto:${lead.email}`} className="hover:text-conectia-gold transition-colors">
                          {lead.email}
                        </a>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                      <Clock className="w-3 h-3" />
                      <span>{formatDate(lead.fecha)}</span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Actividad Reciente */}
        <div className="mt-8 bg-conectia-secondary/50 dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-conectia-gold" />
              Actividad Reciente
            </h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {activities.map((activity) => {
                const propiedad = propiedades.find(p => p.id === activity.propiedadId)
                if (!propiedad) return null

                const getActivityIcon = () => {
                  switch (activity.tipo) {
                    case 'lead': return <Users className="w-4 h-4 text-blue-500" />
                    case 'visita': return <Eye className="w-4 h-4 text-green-500" />
                    case 'oferta': return <DollarSign className="w-4 h-4 text-purple-500" />
                    case 'venta': return <CheckCircle2 className="w-4 h-4 text-green-600" />
                    case 'nota': return <FileText className="w-4 h-4 text-gray-500" />
                  }
                }

                return (
                  <div key={activity.id} className="flex items-start gap-4 p-4 bg-conectia-secondary/70 dark:bg-gray-900 rounded-xl">
                    <div className="w-10 h-10 bg-conectia-secondary/50 dark:bg-gray-800 rounded-xl flex items-center justify-center flex-shrink-0 border border-gray-200 dark:border-gray-700">
                      {getActivityIcon()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900 dark:text-white font-medium">
                        {activity.descripcion}
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                        {propiedad.titulo}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                        {formatDate(activity.fecha)}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
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
