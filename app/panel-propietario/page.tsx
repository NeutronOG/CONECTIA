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
          <div className="bg-[#1A3540] border border-gray-700/60 rounded-2xl shadow-xl p-8 text-center">
            <Building2 className="w-16 h-16 mx-auto mb-4 text-gray-500" />
            <h2 className="text-2xl font-bold text-white mb-2">
              No se encontró información de su propiedad
            </h2>
            <p className="text-gray-400">
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
      activa: 'bg-green-500/20 text-green-400 border border-green-500/30',
      en_negociacion: 'bg-blue-500/20 text-blue-400 border border-blue-500/30',
      vendida: 'bg-purple-500/20 text-purple-400 border border-purple-500/30',
      rentada: 'bg-orange-500/20 text-orange-400 border border-orange-500/30',
      pausada: 'bg-gray-500/20 text-gray-400 border border-gray-500/30'
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
      case 'nuevo': return 'text-blue-400 bg-blue-500/20 border border-blue-500/30'
      case 'contactado': return 'text-green-400 bg-green-500/20 border border-green-500/30'
      case 'calificado': return 'text-purple-400 bg-purple-500/20 border border-purple-500/30'
      case 'descartado': return 'text-red-400 bg-red-500/20 border border-red-500/20'
      default: return 'text-gray-400 bg-gray-500/20 border border-gray-500/30'
    }
  }

  return (
    <div className="min-h-screen bg-[#17313A]">
      {/* Header */}
      <header className="bg-[#1A3540] border-b border-gray-700/60 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
                <Home className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">Panel de Propietario</h1>
                <p className="text-sm text-gray-400">Bienvenido, {user.nombre}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => router.push('/')}
                className="flex items-center gap-2 px-4 py-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-xl transition-all"
              >
                <Home className="w-4 h-4" />
                <span className="hidden sm:inline">Volver al Inicio</span>
              </button>
              <button
                onClick={() => { logout(); router.push('/login') }}
                className="flex items-center gap-2 px-4 py-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-xl transition-all"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Cerrar Sesión</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-8 space-y-8">
        {/* Información de la Propiedad */}
        <div className="bg-[#1A3540] rounded-2xl border border-gray-700/60 overflow-hidden shadow-xl">
          <div className="relative h-64">
            <img 
              src={miPropiedad.imagen} 
              alt={miPropiedad.titulo}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0F2027]/80 to-transparent" />
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
          
          <div className="p-6 grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="flex items-center gap-3 bg-[#17313A] rounded-xl p-4 border border-gray-700/40">
              <div className="p-3 bg-blue-500/20 rounded-lg">
                <DollarSign className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider">Precio</p>
                <p className="text-lg font-bold text-white">{miPropiedad.precioTexto}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 bg-[#17313A] rounded-xl p-4 border border-gray-700/40">
              <div className="p-3 bg-green-500/20 rounded-lg">
                <Building2 className="w-6 h-6 text-green-400" />
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider">Tipo</p>
                <p className="text-lg font-bold text-white">{miPropiedad.tipo}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 bg-[#17313A] rounded-xl p-4 border border-gray-700/40">
              <div className="p-3 bg-purple-500/20 rounded-lg">
                <Home className="w-6 h-6 text-purple-400" />
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider">Habitaciones</p>
                <p className="text-lg font-bold text-white">{miPropiedad.habitaciones}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 bg-[#17313A] rounded-xl p-4 border border-gray-700/40">
              <div className="p-3 bg-orange-500/20 rounded-lg">
                <Sparkles className="w-6 h-6 text-orange-400" />
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider">Área</p>
                <p className="text-lg font-bold text-white">{miPropiedad.areaTexto}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-[#1A3540] rounded-2xl border border-blue-500/20 p-5 relative overflow-hidden hover:border-blue-500/50 transition-all duration-300">
            <div className="absolute -top-6 -right-6 w-20 h-20 bg-blue-500/10 rounded-full pointer-events-none" />
            <div className="flex items-start justify-between mb-4">
              <div className="w-11 h-11 bg-blue-500/20 rounded-xl flex items-center justify-center">
                <Users className="w-5 h-5 text-blue-400" />
              </div>
              <span className="text-xs font-semibold text-blue-400 bg-blue-500/10 px-2 py-1 rounded-full">Total</span>
            </div>
            <p className="text-4xl font-black text-white mb-1">{progreso.leads}</p>
            <p className="text-sm text-gray-400">Leads Totales</p>
            <p className="text-xs text-gray-500 mt-1">Interesados en tu propiedad</p>
          </div>

          <div className="bg-[#1A3540] rounded-2xl border border-green-500/20 p-5 relative overflow-hidden hover:border-green-500/50 transition-all duration-300">
            <div className="absolute -top-6 -right-6 w-20 h-20 bg-green-500/10 rounded-full pointer-events-none" />
            <div className="flex items-start justify-between mb-4">
              <div className="w-11 h-11 bg-green-500/20 rounded-xl flex items-center justify-center">
                <Eye className="w-5 h-5 text-green-400" />
              </div>
              <span className="text-xs font-semibold text-green-400 bg-green-500/10 px-2 py-1 rounded-full">Tours</span>
            </div>
            <p className="text-4xl font-black text-white mb-1">{progreso.visitas}</p>
            <p className="text-sm text-gray-400">Visitas Programadas</p>
            <p className="text-xs text-gray-500 mt-1">Tours realizados</p>
          </div>

          <div className="bg-[#1A3540] rounded-2xl border border-purple-500/20 p-5 relative overflow-hidden hover:border-purple-500/50 transition-all duration-300">
            <div className="absolute -top-6 -right-6 w-20 h-20 bg-purple-500/10 rounded-full pointer-events-none" />
            <div className="flex items-start justify-between mb-4">
              <div className="w-11 h-11 bg-purple-500/20 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-purple-400" />
              </div>
              <span className="text-xs font-semibold text-purple-400 bg-purple-500/10 px-2 py-1 rounded-full">Propuestas</span>
            </div>
            <p className="text-4xl font-black text-white mb-1">{progreso.ofertas}</p>
            <p className="text-sm text-gray-400">Ofertas Recibidas</p>
            <p className="text-xs text-gray-500 mt-1">Propuestas de compra</p>
          </div>

          <div className="bg-[#1A3540] rounded-2xl border border-orange-500/20 p-5 relative overflow-hidden hover:border-orange-500/50 transition-all duration-300">
            <div className="absolute -top-6 -right-6 w-20 h-20 bg-orange-500/10 rounded-full pointer-events-none" />
            <div className="flex items-start justify-between mb-4">
              <div className="w-11 h-11 bg-orange-500/20 rounded-xl flex items-center justify-center">
                <Heart className="w-5 h-5 text-orange-400" />
              </div>
              <span className="text-xs font-semibold text-orange-400 bg-orange-500/10 px-2 py-1 rounded-full">Guardados</span>
            </div>
            <p className="text-4xl font-black text-white mb-1">{miPropiedad.detalles?.favoritos || 0}</p>
            <p className="text-sm text-gray-400">Favoritos</p>
            <p className="text-xs text-gray-500 mt-1">Guardada por usuarios</p>
          </div>
        </div>

        {/* Gráficas */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Distribución de Leads */}
          <div className="bg-[#1A3540] rounded-2xl border border-gray-700/60 overflow-hidden shadow-xl">
            <div className="p-5 border-b border-gray-700/60 bg-gradient-to-r from-blue-500/10 to-transparent">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
                  <Users className="w-4 h-4 text-blue-400" />
                </div>
                Distribución de Leads
              </h3>
            </div>
            <div className="p-5">
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={90}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#1A3540', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="grid grid-cols-2 gap-3 mt-2">
                {statusData.map((item) => (
                  <div key={item.name} className="flex items-center gap-2 bg-[#17313A] rounded-lg px-3 py-2">
                    <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                    <span className="text-xs text-gray-400 truncate">
                      {item.name}: <span className="font-bold text-white">{item.value}</span>
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Actividad de la Semana */}
          <div className="bg-[#1A3540] rounded-2xl border border-gray-700/60 overflow-hidden shadow-xl">
            <div className="p-5 border-b border-gray-700/60 bg-gradient-to-r from-green-500/10 to-transparent">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center">
                  <Activity className="w-4 h-4 text-green-400" />
                </div>
                Actividad de la Semana
              </h3>
            </div>
            <div className="p-5">
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={actividadSemana}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.4} />
                  <XAxis dataKey="dia" stroke="#6b7280" tick={{ fill: '#9ca3af', fontSize: 12 }} />
                  <YAxis stroke="#6b7280" tick={{ fill: '#9ca3af', fontSize: 12 }} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#17313A', 
                      border: '1px solid rgba(255,255,255,0.1)', 
                      borderRadius: '8px',
                      color: '#fff'
                    }}
                  />
                  <Legend wrapperStyle={{ color: '#9ca3af' }} />
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
        </div>

        {/* Leads Recientes y Actividad */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Leads Recientes */}
          <div className="bg-[#1A3540] rounded-2xl border border-gray-700/60 overflow-hidden shadow-xl">
            <div className="p-5 border-b border-gray-700/60 bg-gradient-to-r from-blue-500/10 to-transparent">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
                  <Users className="w-4 h-4 text-blue-400" />
                </div>
                Leads Recientes
              </h3>
            </div>
            <div className="p-5 space-y-3">
              {leadsPropiedad.slice(0, 5).map((lead) => (
                <div key={lead.id} className="p-4 bg-[#17313A] border border-gray-700/60 rounded-xl hover:border-gray-600 transition-colors">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className="font-semibold text-white">{lead.nombre}</h4>
                      <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                        <Calendar className="w-3 h-3" />
                        {new Date(lead.fecha).toLocaleDateString('es-MX', { 
                          day: 'numeric', 
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold flex items-center gap-1 ${getLeadStatusColor(lead.status)}`}>
                      {getLeadStatusIcon(lead.status)}
                      {lead.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-400 mb-3">{lead.mensaje}</p>
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <Phone className="w-3.5 h-3.5" />
                      {lead.telefono}
                    </span>
                    <span className="flex items-center gap-1">
                      <Mail className="w-3.5 h-3.5" />
                      {lead.email}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Actividad Reciente */}
          <div className="bg-[#1A3540] rounded-2xl border border-gray-700/60 overflow-hidden shadow-xl">
            <div className="p-5 border-b border-gray-700/60 bg-gradient-to-r from-green-500/10 to-transparent">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center">
                  <Activity className="w-4 h-4 text-green-400" />
                </div>
                Actividad Reciente
              </h3>
            </div>
            <div className="p-5 space-y-3">
              {actividadPropiedad.slice(0, 5).map((actividad) => (
                <div key={actividad.id} className="flex items-start gap-4 p-4 bg-[#17313A] border border-gray-700/60 rounded-xl">
                  <div className={`p-2 rounded-lg shrink-0 ${
                    actividad.tipo === 'lead' ? 'bg-blue-500/20' :
                    actividad.tipo === 'visita' ? 'bg-green-500/20' :
                    actividad.tipo === 'oferta' ? 'bg-purple-500/20' :
                    actividad.tipo === 'venta' ? 'bg-orange-500/20' :
                    'bg-gray-500/20'
                  }`}>
                    {actividad.tipo === 'lead' && <Users className="w-5 h-5 text-blue-400" />}
                    {actividad.tipo === 'visita' && <Eye className="w-5 h-5 text-green-400" />}
                    {actividad.tipo === 'oferta' && <TrendingUp className="w-5 h-5 text-purple-400" />}
                    {actividad.tipo === 'venta' && <CheckCircle2 className="w-5 h-5 text-orange-400" />}
                    {actividad.tipo === 'nota' && <MessageSquare className="w-5 h-5 text-gray-400" />}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-white">
                      {actividad.descripcion}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
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
          <div className="bg-[#1A3540] rounded-2xl border border-blue-500/30 overflow-hidden shadow-xl">
            <div className="p-5 border-b border-gray-700/60 bg-gradient-to-r from-blue-500/10 to-transparent">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
                  <MessageSquare className="w-4 h-4 text-blue-400" />
                </div>
                Notas del Asesor
              </h3>
            </div>
            <div className="p-5">
              <p className="text-gray-300">{progreso.notas}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
