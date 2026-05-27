'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/auth-context'
import { propertyProgress, leads, activities } from '@/data/internal-users'
import { propiedades } from '@/data/propiedades'
import { Building2, TrendingUp, Users, Eye, Heart, Calendar, Phone, Mail, MapPin, DollarSign, Home, Activity, MessageSquare, CheckCircle2, Clock, XCircle, Sparkles, LogOut } from 'lucide-react'
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

export default function PanelPropietario() {
  const { user, isAuthenticated, logout } = useAuth()
  const router = useRouter()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (mounted && (!isAuthenticated || user?.role !== 'propietario')) {
      router.push('/login')
    }
  }, [isAuthenticated, user, router, mounted])

  if (!mounted || !user || user.role !== 'propietario') {
    return null
  }

  // Obtener la propiedad del propietario
  const miPropiedad = propiedades.find(p => p.id === user.propiedadId)
  const progreso = propertyProgress.find(p => p.propiedadId === user.propiedadId)
  const leadsPropiedad = leads.filter(l => l.propiedadId === user.propiedadId)
  const actividadPropiedad = activities.filter(a => a.propiedadId === user.propiedadId)

  if (!miPropiedad || !progreso) {
    return (
      <div className="min-h-screen bg-[#17313A] p-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-conectia-secondary/50 dark:bg-gray-800 rounded-2xl shadow-xl p-8 text-center">
            <Building2 className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              No se encontró información de su propiedad
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Por favor contacte al administrador
            </p>
          </div>
        </div>
      </div>
    )
  }

  // Calcular estadísticas
  const leadsNuevos = leadsPropiedad.filter(l => l.status === 'nuevo').length
  const leadsContactados = leadsPropiedad.filter(l => l.status === 'contactado').length
  const leadsCalificados = leadsPropiedad.filter(l => l.status === 'calificado').length
  const leadsDescartados = leadsPropiedad.filter(l => l.status === 'descartado').length

  // Datos para gráficas
  const statusData = [
    { name: 'Nuevos', value: leadsNuevos, color: '#3b82f6' },
    { name: 'Contactados', value: leadsContactados, color: '#10b981' },
    { name: 'Calificados', value: leadsCalificados, color: '#8b5cf6' },
    { name: 'Descartados', value: leadsDescartados, color: '#ef4444' }
  ]

  const actividadSemana = [
    { dia: 'Lun', leads: 2, visitas: 1 },
    { dia: 'Mar', leads: 3, visitas: 2 },
    { dia: 'Mié', leads: 1, visitas: 1 },
    { dia: 'Jue', leads: 4, visitas: 2 },
    { dia: 'Vie', leads: 3, visitas: 1 },
    { dia: 'Sáb', leads: 2, visitas: 1 },
    { dia: 'Dom', leads: 0, visitas: 0 }
  ]

  const getStatusBadge = (status: string) => {
    const badges = {
      activa: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
      en_negociacion: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
      vendida: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
      rentada: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
      pausada: 'bg-conectia-secondary text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
    }
    return badges[status as keyof typeof badges] || badges.activa
  }

  const getStatusText = (status: string) => {
    const texts = {
      activa: 'Activa',
      en_negociacion: 'En Negociación',
      vendida: 'Vendida',
      rentada: 'Rentada',
      pausada: 'Pausada'
    }
    return texts[status as keyof typeof texts] || status
  }

  const getLeadStatusIcon = (status: string) => {
    switch (status) {
      case 'nuevo': return <Clock className="w-4 h-4" />
      case 'contactado': return <MessageSquare className="w-4 h-4" />
      case 'calificado': return <CheckCircle2 className="w-4 h-4" />
      case 'descartado': return <XCircle className="w-4 h-4" />
      default: return <Clock className="w-4 h-4" />
    }
  }

  const getLeadStatusColor = (status: string) => {
    switch (status) {
      case 'nuevo': return 'text-blue-600 bg-blue-50 dark:bg-blue-900/20'
      case 'contactado': return 'text-green-600 bg-green-50 dark:bg-green-900/20'
      case 'calificado': return 'text-purple-600 bg-purple-50 dark:bg-purple-900/20'
      case 'descartado': return 'text-red-600 bg-red-50 dark:bg-red-900/20'
      default: return 'text-gray-600 bg-conectia-secondary/70 dark:bg-gray-900/20'
    }
  }

  return (
    <div className="min-h-screen bg-[#17313A]">
      {/* Header */}
      <div className="bg-conectia-secondary/50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                <Home className="w-8 h-8 text-blue-600" />
                Panel de Propietario
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Bienvenido, {user.nombre}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => router.push('/')}
                className="px-6 py-2 bg-conectia-secondary hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded-lg transition-colors"
              >
                Volver al Inicio
              </button>
              <button
                onClick={() => {
                  logout()
                  router.push('/login')
                }}
                className="flex items-center gap-2 px-4 py-2 bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Cerrar Sesión
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-8 space-y-8">
        {/* Información de la Propiedad */}
        <div className="bg-conectia-secondary/50 dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden">
          <div className="relative h-64">
            <img 
              src={miPropiedad.imagen} 
              alt={miPropiedad.titulo}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0F2027]/60 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-3xl font-bold mb-2">{miPropiedad.titulo}</h2>
                  <p className="flex items-center gap-2 text-white/90">
                    <MapPin className="w-5 h-5" />
                    {miPropiedad.ubicacion}
                  </p>
                </div>
                <span className={`px-4 py-2 rounded-full text-sm font-semibold ${getStatusBadge(progreso.status)}`}>
                  {getStatusText(progreso.status)}
                </span>
              </div>
            </div>
          </div>
          
          <div className="p-6 grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <DollarSign className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Precio</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">{miPropiedad.precioTexto}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <Building2 className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Tipo</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">{miPropiedad.tipo}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                <Home className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Habitaciones</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">{miPropiedad.habitaciones}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                <Sparkles className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Área</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">{miPropiedad.areaTexto}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-xl p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <Users className="w-8 h-8 opacity-80" />
              <span className="text-3xl font-bold">{progreso.leads}</span>
            </div>
            <p className="text-blue-100 font-medium">Leads Totales</p>
            <p className="text-blue-200 text-sm mt-1">Interesados en tu propiedad</p>
          </div>

          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl shadow-xl p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <Eye className="w-8 h-8 opacity-80" />
              <span className="text-3xl font-bold">{progreso.visitas}</span>
            </div>
            <p className="text-green-100 font-medium">Visitas Programadas</p>
            <p className="text-green-200 text-sm mt-1">Tours realizados</p>
          </div>

          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl shadow-xl p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <TrendingUp className="w-8 h-8 opacity-80" />
              <span className="text-3xl font-bold">{progreso.ofertas}</span>
            </div>
            <p className="text-purple-100 font-medium">Ofertas Recibidas</p>
            <p className="text-purple-200 text-sm mt-1">Propuestas de compra</p>
          </div>

          <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl shadow-xl p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <Heart className="w-8 h-8 opacity-80" />
              <span className="text-3xl font-bold">{miPropiedad.detalles?.favoritos || 0}</span>
            </div>
            <p className="text-orange-100 font-medium">Favoritos</p>
            <p className="text-orange-200 text-sm mt-1">Guardada por usuarios</p>
          </div>
        </div>

        {/* Gráficas */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Distribución de Leads */}
          <div className="bg-conectia-secondary/50 dark:bg-gray-800 rounded-2xl shadow-xl p-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
              <Users className="w-6 h-6 text-blue-600" />
              Distribución de Leads
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="grid grid-cols-2 gap-4 mt-4">
              {statusData.map((item) => (
                <div key={item.name} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {item.name}: <span className="font-semibold text-gray-900 dark:text-white">{item.value}</span>
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Actividad de la Semana */}
          <div className="bg-conectia-secondary/50 dark:bg-gray-800 rounded-2xl shadow-xl p-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
              <Activity className="w-6 h-6 text-green-600" />
              Actividad de la Semana
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={actividadSemana}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.1} />
                <XAxis dataKey="dia" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1f2937', 
                    border: 'none', 
                    borderRadius: '8px',
                    color: '#fff'
                  }}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="leads" 
                  stroke="#3b82f6" 
                  strokeWidth={2}
                  dot={{ fill: '#3b82f6', r: 4 }}
                  name="Leads"
                />
                <Line 
                  type="monotone" 
                  dataKey="visitas" 
                  stroke="#10b981" 
                  strokeWidth={2}
                  dot={{ fill: '#10b981', r: 4 }}
                  name="Visitas"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Leads Recientes y Actividad */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Leads Recientes */}
          <div className="bg-conectia-secondary/50 dark:bg-gray-800 rounded-2xl shadow-xl p-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
              <Users className="w-6 h-6 text-blue-600" />
              Leads Recientes
            </h3>
            <div className="space-y-4">
              {leadsPropiedad.slice(0, 5).map((lead) => (
                <div key={lead.id} className="p-4 bg-conectia-secondary/70 dark:bg-gray-700/50 rounded-xl hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white">{lead.nombre}</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1 mt-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(lead.fecha).toLocaleDateString('es-MX', { 
                          day: 'numeric', 
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 ${getLeadStatusColor(lead.status)}`}>
                      {getLeadStatusIcon(lead.status)}
                      {lead.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">{lead.mensaje}</p>
                  <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                    <span className="flex items-center gap-1">
                      <Phone className="w-4 h-4" />
                      {lead.telefono}
                    </span>
                    <span className="flex items-center gap-1">
                      <Mail className="w-4 h-4" />
                      {lead.email}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Actividad Reciente */}
          <div className="bg-conectia-secondary/50 dark:bg-gray-800 rounded-2xl shadow-xl p-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
              <Activity className="w-6 h-6 text-green-600" />
              Actividad Reciente
            </h3>
            <div className="space-y-4">
              {actividadPropiedad.slice(0, 5).map((actividad) => (
                <div key={actividad.id} className="flex items-start gap-4 p-4 bg-conectia-secondary/70 dark:bg-gray-700/50 rounded-xl">
                  <div className={`p-2 rounded-lg ${
                    actividad.tipo === 'lead' ? 'bg-blue-100 dark:bg-blue-900/30' :
                    actividad.tipo === 'visita' ? 'bg-green-100 dark:bg-green-900/30' :
                    actividad.tipo === 'oferta' ? 'bg-purple-100 dark:bg-purple-900/30' :
                    actividad.tipo === 'venta' ? 'bg-orange-100 dark:bg-orange-900/30' :
                    'bg-conectia-secondary dark:bg-gray-900/30'
                  }`}>
                    {actividad.tipo === 'lead' && <Users className="w-5 h-5 text-blue-600" />}
                    {actividad.tipo === 'visita' && <Eye className="w-5 h-5 text-green-600" />}
                    {actividad.tipo === 'oferta' && <TrendingUp className="w-5 h-5 text-purple-600" />}
                    {actividad.tipo === 'venta' && <CheckCircle2 className="w-5 h-5 text-orange-600" />}
                    {actividad.tipo === 'nota' && <MessageSquare className="w-5 h-5 text-gray-600" />}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {actividad.descripcion}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {new Date(actividad.fecha).toLocaleDateString('es-MX', { 
                        day: 'numeric', 
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Notas del Asesor */}
        {progreso.notas && (
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl shadow-xl p-6 border border-blue-200 dark:border-blue-800">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <MessageSquare className="w-6 h-6 text-blue-600" />
              Notas del Asesor
            </h3>
            <p className="text-gray-700 dark:text-gray-300">{progreso.notas}</p>
          </div>
        )}
      </div>
    </div>
  )
}
