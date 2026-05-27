'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/auth-context'
import {
  Building2,
  Users,
  TrendingUp,
  DollarSign,
  Eye,
  FileText,
  LogOut,
  UserCircle,
  BarChart3,
  Settings,
  Home,
  Phone,
  Mail,
  Clock,
  CheckCircle2,
  AlertCircle,
  Award,
  ClipboardList,
  Camera,
  Sparkles
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

  // Helper para obtener el email/id del asesor asignado a una propiedad
  const getPropAsesor = (p: PropiedadDB) => (p.asesorEmail || p.usuarioId || p.usuario_id || '').toLowerCase()

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Disponible': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
      case 'Exclusiva': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
      case 'Reservada': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
      default: return 'bg-conectia-secondary text-gray-700 dark:bg-gray-900/30 dark:text-gray-400'
    }
  }

  const getAsesorName = (usuarioId?: string) => {
    if (!usuarioId || usuarioId.trim() === '') return 'Sin asignar'
    // Buscar por ID o por email
    const asesor = asesores.find(a => 
      a.id === usuarioId || 
      a.email === usuarioId || 
      a.email.toLowerCase() === usuarioId.toLowerCase()
    )
    if (asesor) return asesor.nombre
    // Si no se encuentra pero tiene formato de email, mostrar el email
    if (usuarioId.includes('@')) return usuarioId
    return 'Sin asignar'
  }

  return (
    <div className="min-h-screen bg-conectia-secondary/70 dark:bg-gray-900">
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
                  Panel de Administración
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {user.nombre} • Admin
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => router.push('/panel-admin/propiedades')}
                className="flex items-center gap-2 px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl transition-all font-semibold border border-red-200"
              >
                <Building2 className="w-4 h-4" />
                <span className="hidden sm:inline">Gestionar Propiedades</span>
              </button>
              <button
                onClick={() => router.push('/panel-admin/solicitudes-fotografo')}
                className="flex items-center gap-2 px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-xl transition-all font-semibold border border-blue-200"
              >
                <Camera className="w-4 h-4" />
                <span className="hidden sm:inline">Solicitudes Fotógrafo</span>
              </button>
              <button
                onClick={() => router.push('/panel-admin/solicitudes')}
                className="flex items-center gap-2 px-4 py-2 bg-[#C78F7B] hover:bg-[#D4987E] text-[#17313A] rounded-xl transition-all font-semibold relative"
              >
                <ClipboardList className="w-4 h-4" />
                <span className="hidden sm:inline">Solicitudes</span>
                {submissionsStats.pending > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    {submissionsStats.pending}
                  </span>
                )}
              </button>
              <button
                onClick={() => router.push('/panel-admin/publicidad')}
                className="flex items-center gap-2 px-4 py-2 bg-purple-50 hover:bg-purple-100 text-purple-600 rounded-xl transition-all font-semibold border border-purple-200"
              >
                <Sparkles className="w-4 h-4" />
                <span className="hidden sm:inline">Publicidad</span>
              </button>
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
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
          <button
            onClick={() => setActiveTab('overview')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all whitespace-nowrap ${activeTab === 'overview'
                ? 'bg-conectia-gold text-white'
                : 'bg-conectia-secondary/50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-conectia-secondary dark:hover:bg-gray-700'
              }`}
          >
            <BarChart3 className="w-4 h-4" />
            Vista General
          </button>
          <button
            onClick={() => setActiveTab('properties')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all whitespace-nowrap ${activeTab === 'properties'
                ? 'bg-conectia-gold text-white'
                : 'bg-conectia-secondary/50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-conectia-secondary dark:hover:bg-gray-700'
              }`}
          >
            <Home className="w-4 h-4" />
            Propiedades
          </button>
          <button
            onClick={() => setActiveTab('team')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all whitespace-nowrap ${activeTab === 'team'
                ? 'bg-conectia-gold text-white'
                : 'bg-conectia-secondary/50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-conectia-secondary dark:hover:bg-gray-700'
              }`}
          >
            <Users className="w-4 h-4" />
            Equipo
          </button>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <>
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-conectia-secondary/50 dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-600 dark:text-gray-400 text-sm">Propiedades</span>
                  <Building2 className="w-5 h-5 text-conectia-gold" />
                </div>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mb-1">{totalPropiedades}</p>
                <p className="text-xs text-green-600 dark:text-green-400">
                  {propiedadesDisponibles} disponibles • {propiedadesExclusivas} exclusivas
                </p>
              </div>

              <div className="bg-conectia-secondary/50 dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-600 dark:text-gray-400 text-sm">Asesores</span>
                  <Users className="w-5 h-5 text-blue-500" />
                </div>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mb-1">{totalAsesores}</p>
                <p className="text-xs text-blue-600 dark:text-blue-400">
                  Activos en el sistema
                </p>
              </div>

              <div className="bg-conectia-secondary/50 dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-600 dark:text-gray-400 text-sm">Solicitudes</span>
                  <ClipboardList className="w-5 h-5 text-green-500" />
                </div>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mb-1">{submissionsStats.total}</p>
                <p className="text-xs text-green-600 dark:text-green-400">
                  {submissionsStats.pending} pendientes
                </p>
              </div>

              <div className="bg-conectia-secondary/50 dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-600 dark:text-gray-400 text-sm">Sin Asignar</span>
                  <AlertCircle className="w-5 h-5 text-orange-500" />
                </div>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
                  {propiedades.filter(p => !getPropAsesor(p)).length}
                </p>
                <p className="text-xs text-orange-600 dark:text-orange-400">
                  Propiedades sin asesor
                </p>
              </div>
            </div>

            {/* Propiedades Recientes */}
            <div className="bg-conectia-secondary/50 dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden mb-8">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-conectia-gold" />
                  Propiedades Recientes
                </h2>
              </div>
              <div className="p-6">
                {loading ? (
                  <p className="text-center text-gray-500">Cargando...</p>
                ) : propiedades.length === 0 ? (
                  <p className="text-center text-gray-500">No hay propiedades registradas</p>
                ) : (
                  <div className="space-y-4">
                    {propiedades.slice(0, 5).map((propiedad) => (
                      <div key={propiedad.id} className="flex items-start gap-4 p-4 bg-conectia-secondary/70 dark:bg-gray-900 rounded-xl">
                        <div className="w-10 h-10 bg-conectia-gold/10 rounded-xl flex items-center justify-center flex-shrink-0">
                          <Home className="w-5 h-5 text-conectia-gold" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-gray-900 dark:text-white font-medium">
                            {propiedad.titulo}
                          </p>
                          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                            {propiedad.ubicacion} • {propiedad.precioTexto || propiedad.precio_texto}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            Asesor: {getAsesorName(getPropAsesor(propiedad) || undefined)}
                          </p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(propiedad.status)}`}>
                          {propiedad.status}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Asesores del Equipo */}
            <div className="bg-conectia-secondary/50 dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <Award className="w-5 h-5 text-conectia-gold" />
                  Equipo de Asesores
                </h2>
              </div>
              <div className="p-6">
                {loading ? (
                  <p className="text-center text-gray-500">Cargando...</p>
                ) : asesores.length === 0 ? (
                  <p className="text-center text-gray-500">No hay asesores registrados</p>
                ) : (
                  <div className="space-y-4">
                    {asesores.map((asesor) => {
                      const asesorEmailLower = asesor.email?.toLowerCase() || ''
                      const propiedadesAsesor = propiedades.filter(p => {
                        const pa = getPropAsesor(p)
                        return pa === asesorEmailLower || pa === asesor.id?.toLowerCase()
                      })

                      return (
                        <div key={asesor.id} className="p-4 bg-conectia-secondary/70 dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="w-12 h-12 bg-conectia-gold/10 rounded-xl flex items-center justify-center">
                                <UserCircle className="w-6 h-6 text-conectia-gold" />
                              </div>
                              <div>
                                <h3 className="font-semibold text-gray-900 dark:text-white">
                                  {asesor.nombre}
                                </h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                  {asesor.email}
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-2xl font-bold text-conectia-gold">{propiedadesAsesor.length}</p>
                              <p className="text-xs text-gray-600 dark:text-gray-400">propiedades</p>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {/* Properties Tab */}
        {activeTab === 'properties' && (
          <div className="bg-conectia-secondary/50 dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Home className="w-5 h-5 text-conectia-gold" />
                Todas las Propiedades
              </h2>
            </div>
            <div className="p-6">
              {loading ? (
                <p className="text-center text-gray-500">Cargando...</p>
              ) : propiedades.length === 0 ? (
                <p className="text-center text-gray-500">No hay propiedades registradas</p>
              ) : (
                <div className="space-y-4">
                  {propiedades.map((propiedad) => (
                    <div key={propiedad.id} className="p-4 bg-conectia-secondary/70 dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                            {propiedad.titulo}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                            {propiedad.ubicacion} • {propiedad.precioTexto || propiedad.precio_texto}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-500">
                            Asesor: {getAsesorName(getPropAsesor(propiedad) || undefined)}
                          </p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(propiedad.status)}`}>
                          {propiedad.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Team Tab */}
        {activeTab === 'team' && (
          <div className="bg-conectia-secondary/50 dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-conectia-gold" />
                Equipo de Asesores
              </h2>
            </div>
            <div className="p-6">
              {loading ? (
                <p className="text-center text-gray-500">Cargando...</p>
              ) : asesores.length === 0 ? (
                <p className="text-center text-gray-500">No hay asesores registrados</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {asesores.map((asesor) => {
                    // Contar propiedades por email o ID
                    const asesorEmailLower = asesor.email?.toLowerCase() || ''
                    const propiedadesAsesor = propiedades.filter(p => {
                      const pa = getPropAsesor(p)
                      return pa === asesorEmailLower || pa === asesor.id?.toLowerCase()
                    })

                    return (
                      <div key={asesor.id} className="p-6 bg-conectia-secondary/70 dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700">
                        <div className="flex items-start gap-4 mb-4">
                          <div className="w-16 h-16 bg-conectia-gold/10 rounded-xl flex items-center justify-center flex-shrink-0">
                            <UserCircle className="w-8 h-8 text-conectia-gold" />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-bold text-gray-900 dark:text-white text-lg">
                              {asesor.nombre}
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                              {asesor.email}
                            </p>
                            {asesor.telefono && (
                              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                <Phone className="w-4 h-4" />
                                <span>{asesor.telefono}</span>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="text-center p-4 bg-conectia-secondary/50 dark:bg-gray-800 rounded-lg">
                          <p className="text-3xl font-bold text-conectia-gold">
                            {propiedadesAsesor.length}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">propiedades</p>
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
