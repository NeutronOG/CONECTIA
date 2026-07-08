'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/auth-context'
import { useAllPropertyAnalytics } from '@/hooks/use-property-analytics'
import {
  Building2,
  Users,
  Eye,
  LogOut,
  BarChart3,
  Home,
  Phone,
  AlertCircle,
  Award,
  ClipboardList,
  Camera,
  Megaphone,
  History,
  ArrowUpRight,
  Shield,
  TrendingUp,
  Share2,
  Diamond
} from 'lucide-react'
import { OwnerSubmissionsStorage } from '@/lib/owner-submissions-storage'

interface Asesor {
  id: string
  nombre: string
  email: string
  telefono?: string
}

interface PropiedadDB {
  id: number
  titulo: string
  ubicacion: string
  precio: number
  precio_texto?: string
  precioTexto?: string
  usuario_id?: string
  usuarioId?: string
  asesorEmail?: string
  status: string
}

export default function PanelAdminPage() {
  const { user, logout, isAuthenticated } = useAuth()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'overview' | 'properties' | 'team'>('overview')
  const [asesores, setAsesores] = useState<Asesor[]>([])
  const [propiedades, setPropiedades] = useState<PropiedadDB[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'admin') {
      router.push('/login')
      return
    }
    loadData()
  }, [user, isAuthenticated, router])

  const loadData = async () => {
    setLoading(true)
    try {
      // Cargar asesores y propiedades en paralelo usando APIs del servidor
      const [resAsesores, resPropiedades] = await Promise.all([
        fetch('/api/admin/asesores'),
        fetch('/api/admin/propiedades')
      ])

      if (resAsesores.ok) {
        const data = await resAsesores.json()
        setAsesores(data.asesores || [])
      }

      if (resPropiedades.ok) {
        const data = await resPropiedades.json()
        console.log('Propiedades loaded:', data.propiedades?.length)
        setPropiedades(data.propiedades || [])
      } else {
        console.error('Error loading propiedades:', await resPropiedades.text())
      }
    } catch (error) {
      console.error('Error loading admin data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (!user) return null

  const totalPropiedades = propiedades.length
  const totalAsesores = asesores.length
  const submissionsStats = OwnerSubmissionsStorage.getStats()

  const propiedadesDisponibles = propiedades.filter(p => p.status === 'Disponible').length
  const propiedadesExclusivas = propiedades.filter(p => p.status === 'Exclusiva').length
  const propiedadesReservadas = propiedades.filter(p => p.status === 'Reservada').length
  const propiedadesVendidas = propiedades.filter(p => p.status === 'Vendida').length

  const { totalViews, totalShares, topProperties } = useAllPropertyAnalytics()

  // Helper para obtener el email/id del asesor asignado a una propiedad
  const getPropAsesor = (p: PropiedadDB) => (p.asesorEmail || p.usuarioId || p.usuario_id || '').toLowerCase()

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Disponible': return 'bg-green-500/10 text-green-400 border-green-500/20'
      case 'Exclusiva': return 'bg-[#C78F7B]/10 text-[#C78F7B] border-[#C78F7B]/20'
      case 'Reservada': return 'bg-blue-500/10 text-blue-400 border-blue-500/20'
      case 'Vendida': return 'bg-purple-500/10 text-purple-400 border-purple-500/20'
      default: return 'bg-white/5 text-[#B0ACA6] border-white/10'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Disponible': return <Home className="w-3 h-3" />
      case 'Exclusiva': return <Diamond className="w-3 h-3" />
      case 'Reservada': return <ClipboardList className="w-3 h-3" />
      case 'Vendida': return <TrendingUp className="w-3 h-3" />
      default: return <Home className="w-3 h-3" />
    }
  }

  const getAsesorName = (usuarioId?: string) => {
    if (!usuarioId || usuarioId.trim() === '') return 'Sin asignar'
    const asesor = asesores.find(a =>
      a.id === usuarioId ||
      a.email === usuarioId ||
      a.email.toLowerCase() === usuarioId.toLowerCase()
    )
    if (asesor) return asesor.nombre
    if (usuarioId.includes('@')) return usuarioId
    return 'Sin asignar'
  }

  const getAsesorInitials = (nombre: string) => {
    return nombre.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
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
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(199,143,123,0.15)', border: '1px solid rgba(199,143,123,0.3)' }}>
                <Shield className="w-5 h-5 text-[#C78F7B]" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-white">Panel de Administración</h1>
                <p className="text-xs text-[#B0ACA6]">{user.nombre} • Admin</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="hidden xl:flex items-center gap-2 mr-2">
                <button onClick={() => router.push('/panel-admin/propiedades')} className="flex items-center gap-2 px-3 py-2 text-[#B0ACA6] hover:text-white hover:bg-white/5 rounded-xl transition-all text-xs font-semibold border border-white/10">
                  <Building2 className="w-3.5 h-3.5" /> Propiedades
                </button>
                <button onClick={() => router.push('/panel-admin/solicitudes-fotografo')} className="flex items-center gap-2 px-3 py-2 text-[#B0ACA6] hover:text-white hover:bg-white/5 rounded-xl transition-all text-xs font-semibold border border-white/10">
                  <Camera className="w-3.5 h-3.5" /> Fotógrafo
                </button>
                <button onClick={() => router.push('/panel-admin/solicitudes')} className="flex items-center gap-2 px-3 py-2 text-[#B0ACA6] hover:text-white hover:bg-white/5 rounded-xl transition-all text-xs font-semibold border border-white/10 relative">
                  <ClipboardList className="w-3.5 h-3.5" /> Solicitudes
                  {submissionsStats.pending > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[9px] rounded-full flex items-center justify-center font-bold">{submissionsStats.pending}</span>
                  )}
                </button>
                <button onClick={() => router.push('/panel-admin/auditoria')} className="flex items-center gap-2 px-3 py-2 text-[#B0ACA6] hover:text-white hover:bg-white/5 rounded-xl transition-all text-xs font-semibold border border-white/10">
                  <History className="w-3.5 h-3.5" /> Auditoría
                </button>
                <button onClick={() => router.push('/panel-admin/publicidad')} className="flex items-center gap-2 px-3 py-2 text-[#B0ACA6] hover:text-white hover:bg-white/5 rounded-xl transition-all text-xs font-semibold border border-white/10">
                  <Megaphone className="w-3.5 h-3.5" /> Publicidad
                </button>
              </div>
              <button onClick={async () => { await logout(); router.push('/login') }} className="flex items-center gap-2 px-4 py-2 text-[#B0ACA6] hover:text-white hover:bg-white/5 rounded-xl transition-all text-sm border border-white/10 hover:border-[#C78F7B]/30">
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Salir</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        {/* Tabs — Glassmorphism */}
        <div className="flex gap-1.5 mb-8 overflow-x-auto pb-2">
          {[
            { id: 'overview', label: 'Vista General', icon: BarChart3 },
            { id: 'properties', label: 'Propiedades', icon: Home },
            { id: 'team', label: 'Equipo', icon: Users },
          ].map((tabItem) => (
            <button
              key={tabItem.id}
              onClick={() => setActiveTab(tabItem.id as any)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all whitespace-nowrap ${
                activeTab === tabItem.id
                  ? 'bg-[#C78F7B] text-[#0F2027] shadow-lg shadow-[#C78F7B]/20'
                  : 'text-[#B0ACA6] hover:text-white hover:bg-white/5'
              }`}
            >
              <tabItem.icon className="w-4 h-4" />
              {tabItem.label}
            </button>
          ))}
        </div>

        {/* OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Hero Stats — 6 cards */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
              {[
                { label: 'Propiedades', value: totalPropiedades, sub: `${propiedadesDisponibles} disp • ${propiedadesExclusivas} exc`, accent: '#C78F7B', icon: Building2 },
                { label: 'Asesores', value: totalAsesores, sub: 'Activos en sistema', accent: '#3b82f6', icon: Users },
                { label: 'Solicitudes', value: submissionsStats.total, sub: `${submissionsStats.pending} pendientes`, accent: '#22c55e', icon: ClipboardList },
                { label: 'Sin Asignar', value: propiedades.filter(p => !getPropAsesor(p)).length, sub: 'Propiedades libres', accent: '#f97316', icon: AlertCircle },
                { label: 'Vistas', value: totalViews, sub: 'Totales plataforma', accent: '#8b5cf6', icon: Eye },
                { label: 'Compartidos', value: totalShares, sub: 'Redes sociales', accent: '#06b6d4', icon: Share2 },
              ].map((stat, i) => (
                <div key={i} className="relative bg-white/[0.03] backdrop-blur-md border border-white/10 rounded-[24px] p-5 overflow-hidden group hover:border-white/20 transition-all duration-300">
                  <div className="absolute -top-6 -right-6 w-20 h-20 rounded-full pointer-events-none opacity-30" style={{ background: `${stat.accent}20` }} />
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${stat.accent}15` }}>
                      <stat.icon className="w-5 h-5" style={{ color: stat.accent }} />
                    </div>
                  </div>
                  <p className="text-2xl sm:text-3xl font-black text-white">{stat.value}</p>
                  <p className="text-xs text-[#8A8F97] mt-1">{stat.label}</p>
                  <p className="text-[10px] text-[#4A4F57] mt-0.5">{stat.sub}</p>
                </div>
              ))}
            </div>

            {/* Status Breakdown + Top Property */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="lg:col-span-2 relative bg-white/[0.03] backdrop-blur-md border border-white/10 rounded-[24px] p-6 overflow-hidden">
                <div className="absolute -top-20 -right-20 w-40 h-40 bg-[#C78F7B]/10 rounded-full blur-[60px] pointer-events-none" />
                <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2 relative">
                  <BarChart3 className="w-4 h-4 text-[#C78F7B]" /> Distribución de Propiedades
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 relative">
                  {[
                    { label: 'Disponibles', value: propiedadesDisponibles, total: totalPropiedades, color: '#22c55e' },
                    { label: 'Exclusivas', value: propiedadesExclusivas, total: totalPropiedades, color: '#C78F7B' },
                    { label: 'Reservadas', value: propiedadesReservadas, total: totalPropiedades, color: '#3b82f6' },
                    { label: 'Vendidas', value: propiedadesVendidas, total: totalPropiedades, color: '#a855f7' },
                  ].map((s, i) => {
                    const pct = s.total > 0 ? Math.round((s.value / s.total) * 100) : 0
                    return (
                      <div key={i} className="relative bg-white/[0.02] rounded-xl p-4 border border-white/5">
                        <p className="text-xs text-[#8A8F97] mb-2">{s.label}</p>
                        <p className="text-2xl font-black text-white">{s.value}</p>
                        <div className="mt-2 h-1.5 bg-white/10 rounded-full overflow-hidden">
                          <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: s.color }} />
                        </div>
                        <p className="text-[10px] text-[#4A4F57] mt-1">{pct}% del total</p>
                      </div>
                    )
                  })}
                </div>
              </div>

              <div className="relative bg-white/[0.03] backdrop-blur-md border border-white/10 rounded-[24px] p-6 overflow-hidden">
                <div className="absolute -top-20 -right-20 w-40 h-40 bg-[#8b5cf6]/10 rounded-full blur-[60px] pointer-events-none" />
                <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2 relative">
                  <TrendingUp className="w-4 h-4 text-[#8b5cf6]" /> Propiedades Destacadas
                </h3>
                {topProperties[0]?.propertyId ? (
                  <div className="space-y-3 relative">
                    <div className="w-12 h-12 rounded-xl bg-[#8b5cf6]/10 flex items-center justify-center border border-[#8b5cf6]/20">
                      <Eye className="w-6 h-6 text-[#8b5cf6]" />
                    </div>
                    <p className="text-lg font-black text-white">ID: {topProperties[0].propertyId}</p>
                    <div className="flex items-center gap-4">
                      <div className="text-center">
                        <p className="text-xl font-bold text-[#8b5cf6]">{topProperties[0].views}</p>
                        <p className="text-[10px] text-[#8A8F97]">vistas</p>
                      </div>
                      <div className="text-center">
                        <p className="text-xl font-bold text-[#06b6d4]">{topProperties[0].shares}</p>
                        <p className="text-[10px] text-[#8A8F97]">shares</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <Eye className="w-8 h-8 text-[#4A4F57] mx-auto mb-2" />
                    <p className="text-sm text-[#8A8F97]">Sin datos de analytics aún</p>
                  </div>
                )}
              </div>
            </div>

            {/* Recent Properties */}
            <div className="relative bg-white/[0.03] backdrop-blur-md border border-white/10 rounded-[24px] overflow-hidden">
              <div className="px-6 pt-5 pb-4 border-b border-white/10 flex items-center justify-between">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-[#C78F7B]" /> Propiedades Recientes
                </h3>
                <button onClick={() => setActiveTab('properties')} className="text-xs font-bold text-[#C78F7B] hover:text-[#E8A88F] flex items-center gap-1 transition-colors">
                  Ver todas <ArrowUpRight className="w-3 h-3" />
                </button>
              </div>
              <div className="p-6">
                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="w-8 h-8 border-2 border-[#C78F7B]/30 border-t-[#C78F7B] rounded-full animate-spin" />
                  </div>
                ) : propiedades.length === 0 ? (
                  <div className="text-center py-8">
                    <Home className="w-8 h-8 text-[#4A4F57] mx-auto mb-2" />
                    <p className="text-sm text-[#8A8F97]">No hay propiedades registradas</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {propiedades.slice(0, 5).map((propiedad) => (
                      <div key={propiedad.id} className="flex items-center gap-4 p-4 bg-white/[0.02] rounded-xl border border-white/5 hover:border-white/15 transition-all group">
                        <div className="w-10 h-10 bg-[#C78F7B]/10 rounded-xl flex items-center justify-center flex-shrink-0 border border-[#C78F7B]/20">
                          <Home className="w-5 h-5 text-[#C78F7B]" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-white truncate">{propiedad.titulo}</p>
                          <p className="text-xs text-[#B0ACA6] mt-0.5">{propiedad.ubicacion} • {propiedad.precioTexto || propiedad.precio_texto}</p>
                          <p className="text-[10px] text-[#4A4F57] mt-0.5">Asesor: {getAsesorName(getPropAsesor(propiedad) || undefined)}</p>
                        </div>
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border flex items-center gap-1 shrink-0 ${getStatusColor(propiedad.status)}`}>
                          {getStatusIcon(propiedad.status)} {propiedad.status}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Team Section */}
            <div className="relative bg-white/[0.03] backdrop-blur-md border border-white/10 rounded-[24px] overflow-hidden">
              <div className="px-6 pt-5 pb-4 border-b border-white/10 flex items-center justify-between">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Award className="w-4 h-4 text-[#C78F7B]" /> Equipo de Asesores
                </h3>
                <button onClick={() => setActiveTab('team')} className="text-xs font-bold text-[#C78F7B] hover:text-[#E8A88F] flex items-center gap-1 transition-colors">
                  Ver todo <ArrowUpRight className="w-3 h-3" />
                </button>
              </div>
              <div className="p-6">
                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="w-8 h-8 border-2 border-[#C78F7B]/30 border-t-[#C78F7B] rounded-full animate-spin" />
                  </div>
                ) : asesores.length === 0 ? (
                  <div className="text-center py-8">
                    <Users className="w-8 h-8 text-[#4A4F57] mx-auto mb-2" />
                    <p className="text-sm text-[#8A8F97]">No hay asesores registrados</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {asesores.slice(0, 6).map((asesor) => {
                      const asesorEmailLower = asesor.email?.toLowerCase() || ''
                      const propiedadesAsesor = propiedades.filter(p => {
                        const pa = getPropAsesor(p)
                        return pa === asesorEmailLower || pa === asesor.id?.toLowerCase()
                      })
                      return (
                        <div key={asesor.id} className="flex items-center gap-3 p-4 bg-white/[0.02] rounded-xl border border-white/5 hover:border-white/15 transition-all">
                          <div className="w-10 h-10 rounded-xl bg-[#C78F7B]/10 flex items-center justify-center border border-[#C78F7B]/20 flex-shrink-0">
                            <span className="text-xs font-bold text-[#C78F7B]">{getAsesorInitials(asesor.nombre)}</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-white truncate">{asesor.nombre}</p>
                            <p className="text-[10px] text-[#8A8F97] truncate">{asesor.email}</p>
                          </div>
                          <div className="text-right shrink-0">
                            <p className="text-lg font-black text-[#C78F7B]">{propiedadesAsesor.length}</p>
                            <p className="text-[10px] text-[#4A4F57]">props</p>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* PROPERTIES TAB */}
        {activeTab === 'properties' && (
          <div className="relative bg-white/[0.03] backdrop-blur-md border border-white/10 rounded-[24px] overflow-hidden">
            <div className="px-6 pt-5 pb-4 border-b border-white/10">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Home className="w-4 h-4 text-[#C78F7B]" /> Todas las Propiedades
                <span className="ml-2 text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#C78F7B]/10 text-[#C78F7B] border border-[#C78F7B]/20">{totalPropiedades}</span>
              </h3>
            </div>
            <div className="p-6">
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="w-8 h-8 border-2 border-[#C78F7B]/30 border-t-[#C78F7B] rounded-full animate-spin" />
                </div>
              ) : propiedades.length === 0 ? (
                <div className="text-center py-8">
                  <Home className="w-8 h-8 text-[#4A4F57] mx-auto mb-2" />
                  <p className="text-sm text-[#8A8F97]">No hay propiedades registradas</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {propiedades.map((propiedad) => (
                    <div key={propiedad.id} className="flex items-center gap-4 p-4 bg-white/[0.02] rounded-xl border border-white/5 hover:border-white/15 transition-all group">
                      <div className="w-10 h-10 bg-[#C78F7B]/10 rounded-xl flex items-center justify-center flex-shrink-0 border border-[#C78F7B]/20">
                        <Home className="w-5 h-5 text-[#C78F7B]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-white">{propiedad.titulo}</p>
                        <p className="text-xs text-[#B0ACA6] mt-0.5">{propiedad.ubicacion} • {propiedad.precioTexto || propiedad.precio_texto}</p>
                        <p className="text-[10px] text-[#4A4F57] mt-0.5">Asesor: {getAsesorName(getPropAsesor(propiedad) || undefined)}</p>
                      </div>
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border flex items-center gap-1 shrink-0 ${getStatusColor(propiedad.status)}`}>
                        {getStatusIcon(propiedad.status)} {propiedad.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TEAM TAB */}
        {activeTab === 'team' && (
          <div className="relative bg-white/[0.03] backdrop-blur-md border border-white/10 rounded-[24px] overflow-hidden">
            <div className="px-6 pt-5 pb-4 border-b border-white/10">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Users className="w-4 h-4 text-[#C78F7B]" /> Equipo de Asesores
                <span className="ml-2 text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#C78F7B]/10 text-[#C78F7B] border border-[#C78F7B]/20">{totalAsesores}</span>
              </h3>
            </div>
            <div className="p-6">
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="w-8 h-8 border-2 border-[#C78F7B]/30 border-t-[#C78F7B] rounded-full animate-spin" />
                </div>
              ) : asesores.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="w-8 h-8 text-[#4A4F57] mx-auto mb-2" />
                  <p className="text-sm text-[#8A8F97]">No hay asesores registrados</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {asesores.map((asesor) => {
                    const asesorEmailLower = asesor.email?.toLowerCase() || ''
                    const propiedadesAsesor = propiedades.filter(p => {
                      const pa = getPropAsesor(p)
                      return pa === asesorEmailLower || pa === asesor.id?.toLowerCase()
                    })
                    const disponibles = propiedadesAsesor.filter(p => p.status === 'Disponible').length
                    const exclusivas = propiedadesAsesor.filter(p => p.status === 'Exclusiva').length
                    return (
                      <div key={asesor.id} className="relative bg-white/[0.02] rounded-[20px] p-5 border border-white/5 hover:border-white/15 transition-all group">
                        <div className="flex items-start gap-4 mb-4">
                          <div className="w-12 h-12 rounded-xl bg-[#C78F7B]/10 flex items-center justify-center border border-[#C78F7B]/20 flex-shrink-0">
                            <span className="text-sm font-bold text-[#C78F7B]">{getAsesorInitials(asesor.nombre)}</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-bold text-white text-base">{asesor.nombre}</h3>
                            <p className="text-xs text-[#B0ACA6] truncate">{asesor.email}</p>
                            {asesor.telefono && (
                              <div className="flex items-center gap-1.5 text-xs text-[#8A8F97] mt-1">
                                <Phone className="w-3 h-3" />
                                <span>{asesor.telefono}</span>
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                          <div className="text-center p-2 bg-white/[0.02] rounded-lg border border-white/5">
                            <p className="text-lg font-black text-white">{propiedadesAsesor.length}</p>
                            <p className="text-[10px] text-[#8A8F97]">Total</p>
                          </div>
                          <div className="text-center p-2 bg-green-500/5 rounded-lg border border-green-500/10">
                            <p className="text-lg font-black text-green-400">{disponibles}</p>
                            <p className="text-[10px] text-[#8A8F97]">Disp.</p>
                          </div>
                          <div className="text-center p-2 bg-[#C78F7B]/5 rounded-lg border border-[#C78F7B]/10">
                            <p className="text-lg font-black text-[#C78F7B]">{exclusivas}</p>
                            <p className="text-[10px] text-[#8A8F97]">Exc.</p>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
