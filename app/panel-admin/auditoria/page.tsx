'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/auth-context'
import { Button } from '@/components/ui/button'
import {
  ArrowLeft,
  Download,
  Trash2,
  User,
  LogIn,
  LogOut,
  Home,
  Edit3,
  Share2,
  CheckCircle,
  XCircle,
  UserCheck,
  ImagePlus,
  Settings,
  Filter,
  Calendar,
  ShieldCheck,
  ClipboardList
} from 'lucide-react'
import { 
  getAuditLogs, 
  getAriLogs, 
  getLogsByUser, 
  getLogsByAction,
  downloadLogs,
  cleanupOldLogs,
  AuditLog 
} from '@/lib/audit-log'
import { toast } from 'sonner'

const actionIcons: { [key: string]: React.ElementType } = {
  login: LogIn,
  logout: LogOut,
  propiedad_creada: Home,
  propiedad_actualizada: Edit3,
  propiedad_eliminada: Trash2,
  propiedad_publicada: Home,
  propiedad_desactivada: Home,
  propiedad_compartida: Share2,
  solicitud_aprobada: CheckCircle,
  solicitud_rechazada: XCircle,
  asesor_asignado: UserCheck,
  imagen_subida: ImagePlus,
  imagen_eliminada: Trash2,
  configuracion_cambiada: Settings,
}

function getActionIcon(action: string): React.ElementType {
  return actionIcons[action] || Settings
}

const actionLabels: Record<string, string> = {
  login: 'Inicio de sesión',
  logout: 'Cierre de sesión',
  propiedad_creada: 'Propiedad creada',
  propiedad_actualizada: 'Propiedad actualizada',
  propiedad_eliminada: 'Propiedad eliminada',
  propiedad_publicada: 'Propiedad publicada',
  propiedad_desactivada: 'Propiedad desactivada',
  propiedad_compartida: 'Propiedad compartida',
  solicitud_aprobada: 'Solicitud aprobada',
  solicitud_rechazada: 'Solicitud rechazada',
  asesor_asignado: 'Asesor asignado',
  imagen_subida: 'Imagen subida',
  imagen_eliminada: 'Imagen eliminada',
  configuracion_cambiada: 'Configuración cambiada',
}

const entityColors: Record<string, string> = {
  propiedad: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  solicitud: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  asesor: 'bg-green-500/10 text-green-400 border-green-500/20',
  sistema: 'bg-white/5 text-[#B0ACA6] border-white/10',
  usuario: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
}

export default function AuditoriaPage() {
  const { user, isAuthenticated } = useAuth()
  const router = useRouter()
  const [logs, setLogs] = useState<AuditLog[]>([])
  const [filter, setFilter] = useState<'all' | 'ari' | 'mine'>('all')
  const [actionFilter, setActionFilter] = useState<string>('all')

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'admin') {
      router.push('/login')
      return
    }
    loadLogs()
  }, [isAuthenticated, user, router])

  const loadLogs = () => {
    let filteredLogs: AuditLog[] = []
    
    switch (filter) {
      case 'ari':
        filteredLogs = getAriLogs()
        break
      case 'mine':
        if (user) {
          filteredLogs = getLogsByUser(user.id)
        }
        break
      default:
        filteredLogs = getAuditLogs()
    }

    if (actionFilter !== 'all') {
      filteredLogs = filteredLogs.filter(log => log.action === actionFilter)
    }

    // Ordenar por fecha descendente
    filteredLogs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    
    setLogs(filteredLogs)
  }

  useEffect(() => {
    loadLogs()
  }, [filter, actionFilter, user])

  const handleDownload = () => {
    const filename = `auditoria-conectia-${new Date().toISOString().split('T')[0]}.csv`
    downloadLogs(logs, filename)
  }

  const handleCleanup = () => {
    if (confirm('¿Estás seguro de eliminar logs antiguos (más de 30 días)?')) {
      cleanupOldLogs()
      loadLogs()
      toast.success('Logs antiguos eliminados')
    }
  }

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp)
    return date.toLocaleString('es-MX', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    })
  }

  const getTimeAgo = (timestamp: string) => {
    const diff = Date.now() - new Date(timestamp).getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 1) return 'Justo ahora'
    if (minutes < 60) return `Hace ${minutes} min`
    if (hours < 24) return `Hace ${hours} h`
    return `Hace ${days} días`
  }

  // Obtener acciones únicas para el filtro
  const uniqueActions = Array.from(new Set(getAuditLogs().map(log => log.action)))

  if (!user) return null

  return (
    <div className="min-h-screen bg-[#0F2027] text-[#EAE4DD] p-4 sm:p-6 lg:p-8 relative overflow-hidden">
      {/* Glow orbs */}
      <div className="fixed top-0 right-0 w-[500px] h-[500px] bg-[#C78F7B]/5 rounded-full blur-[150px] pointer-events-none" />
      <div className="fixed bottom-0 left-0 w-[400px] h-[400px] bg-[#17313A]/60 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <button
              onClick={() => router.push('/panel-admin')}
              className="flex items-center gap-2 text-[#B0ACA6] hover:text-white text-sm font-medium mb-3 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Volver al Panel
            </button>
            <h1 className="text-2xl sm:text-3xl font-black text-white flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#C78F7B]/10 flex items-center justify-center border border-[#C78F7B]/20">
                <ClipboardList className="w-5 h-5 text-[#C78F7B]" />
              </div>
              Auditoría de Actividades
            </h1>
            <p className="text-sm text-[#B0ACA6] mt-1">Registro de todas las acciones en el sistema</p>
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleDownload}
              className="border-[#C78F7B] text-[#EAE4DD] hover:bg-[#C78F7B]/10"
            >
              <Download className="h-4 w-4 mr-2" />
              Descargar CSV
            </Button>
            <Button
              variant="outline"
              onClick={handleCleanup}
              className="border-red-400/30 text-red-400 hover:bg-red-500/10 hover:border-red-400/50"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Limpiar antiguos
            </Button>
          </div>
        </div>

        {/* Filtros */}
        <div className="relative bg-white/[0.03] backdrop-blur-md border border-white/10 rounded-[20px] p-4 sm:p-5 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex items-center gap-2 flex-wrap">
              <User className="h-4 w-4 text-[#C78F7B]" />
              <span className="text-sm text-[#8A8F97]">Usuario:</span>
              <div className="flex gap-1">
                {[
                  { id: 'all', label: 'Todos' },
                  { id: 'ari', label: 'Ari (Editor)' },
                  { id: 'mine', label: 'Mis acciones' },
                ].map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setFilter(f.id as any)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                      filter === f.id
                        ? 'bg-[#C78F7B] text-[#0F2027]'
                        : 'bg-white/[0.05] text-[#B0ACA6] hover:text-white border border-white/10'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <Filter className="h-4 w-4 text-[#C78F7B]" />
              <span className="text-sm text-[#8A8F97]">Acción:</span>
              <select
                value={actionFilter}
                onChange={(e) => setActionFilter(e.target.value)}
                className="bg-[#0F2027] border border-white/10 rounded-lg px-3 py-1.5 text-sm text-[#EAE4DD] focus:outline-none focus:border-[#C78F7B]"
              >
                <option value="all">Todas las acciones</option>
                {uniqueActions.map(action => (
                  <option key={action} value={action}>
                    {actionLabels[action] || action}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          {[
            { label: 'Total registros', value: logs.length, accent: '#C78F7B', icon: ClipboardList },
            { label: 'Acciones de Ari', value: logs.filter(l => l.userEmail === 'ari@conectia.mx').length, accent: '#f59e0b', icon: ShieldCheck },
            { label: 'Cambios en propiedades', value: logs.filter(l => l.action.includes('propiedad')).length, accent: '#3b82f6', icon: Home },
            { label: 'Usuarios activos', value: new Set(logs.map(l => l.userId)).size, accent: '#22c55e', icon: User },
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

        {/* Lista de logs */}
        <div className="relative bg-white/[0.03] backdrop-blur-md border border-white/10 rounded-[24px] overflow-hidden">
          <div className="p-5 sm:p-6 border-b border-white/10">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Calendar className="h-5 w-5 text-[#C78F7B]" />
              Registro de Actividades
            </h2>
            <p className="text-sm text-[#8A8F97] mt-1">
              {filter === 'ari' ? 'Mostrando solo las acciones de Ari (Editor Principal)' :
               filter === 'mine' ? 'Mostrando tus acciones' :
               'Mostrando todas las acciones del sistema'}
            </p>
          </div>
          <div className="p-5 sm:p-6">
            {logs.length === 0 ? (
              <div className="text-center py-12">
                <ClipboardList className="h-12 w-12 text-[#4A4F57] mx-auto mb-3" />
                <p className="text-lg font-medium text-white mb-1">No hay registros</p>
                <p className="text-sm text-[#8A8F97]">
                  {filter === 'ari'
                    ? 'Ari aún no ha realizado acciones registradas'
                    : 'No se encontraron registros con los filtros seleccionados'}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {logs.map((log) => (
                    <div
                      key={log.id}
                      className="flex items-start gap-4 p-4 rounded-[16px] bg-white/[0.03] border border-white/10 hover:border-[#C78F7B]/30 transition-all"
                    >
                      {/* Icono */}
                      <div className={log.userEmail === 'ari@conectia.mx' ? 'p-2.5 rounded-xl bg-[#C78F7B]/10 text-[#C78F7B] border border-[#C78F7B]/20 flex-shrink-0' : 'p-2.5 rounded-xl bg-white/[0.05] text-[#B0ACA6] border border-white/10 flex-shrink-0'}>
                        {log.action === 'login' && <LogIn className="h-5 w-5" />}
                        {log.action === 'logout' && <LogOut className="h-5 w-5" />}
                        {log.action === 'propiedad_creada' && <Home className="h-5 w-5" />}
                        {log.action === 'propiedad_actualizada' && <Edit3 className="h-5 w-5" />}
                        {log.action === 'propiedad_eliminada' && <Trash2 className="h-5 w-5" />}
                        {log.action === 'propiedad_publicada' && <Home className="h-5 w-5" />}
                        {log.action === 'propiedad_desactivada' && <Home className="h-5 w-5" />}
                        {log.action === 'propiedad_compartida' && <Share2 className="h-5 w-5" />}
                        {log.action === 'solicitud_aprobada' && <CheckCircle className="h-5 w-5" />}
                        {log.action === 'solicitud_rechazada' && <XCircle className="h-5 w-5" />}
                        {log.action === 'asesor_asignado' && <UserCheck className="h-5 w-5" />}
                        {log.action === 'imagen_subida' && <ImagePlus className="h-5 w-5" />}
                        {log.action === 'imagen_eliminada' && <Trash2 className="h-5 w-5" />}
                        {log.action === 'configuracion_cambiada' && <Settings className="h-5 w-5" />}
                        {!actionIcons[log.action] && <Settings className="h-5 w-5" />}
                      </div>

                      {/* Contenido */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-medium text-white">
                            {actionLabels[log.action] || log.action}
                          </span>
                          <span className={`text-xs px-2 py-0.5 rounded-full border ${entityColors[log.entityType] || 'bg-white/5 text-[#B0ACA6] border-white/10'}`}>
                            {log.entityType}
                          </span>
                          {log.userEmail === 'ari@conectia.mx' && (
                            <span className="text-xs px-2 py-0.5 rounded-full bg-[#C78F7B] text-[#0F2027] font-semibold">
                              Ari
                            </span>
                          )}
                        </div>

                        {log.entityName && (
                          <p className="text-sm text-[#B0ACA6] mt-1">
                            {log.entityName}
                          </p>
                        )}

                        <div className="flex items-center gap-4 mt-2 text-xs text-[#8A8F97]">
                          <span className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            {log.userName} ({log.userEmail})
                          </span>
                          <span>•</span>
                          <span>{formatDate(log.timestamp)}</span>
                          <span className="text-[#C78F7B]">({getTimeAgo(log.timestamp)})</span>
                        </div>

                        {/* Detalles expandibles */}
                        {Object.keys(log.details).length > 0 && (
                          <details className="mt-2">
                            <summary className="text-xs text-[#C78F7B] cursor-pointer hover:text-[#D4987E]">
                              Ver detalles
                            </summary>
                            <pre className="mt-2 p-3 bg-[#0A181C] rounded-[12px] text-xs text-[#B0ACA6] overflow-x-auto border border-white/5">
                              {JSON.stringify(log.details, null, 2)}
                            </pre>
                          </details>
                        )}
                      </div>
                    </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
