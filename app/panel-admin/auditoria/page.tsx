'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/auth-context'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
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
  Calendar
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
  propiedad: 'bg-blue-100 text-blue-800 border-blue-200',
  solicitud: 'bg-purple-100 text-purple-800 border-purple-200',
  asesor: 'bg-green-100 text-green-800 border-green-200',
  sistema: 'bg-gray-100 text-gray-800 border-gray-200',
  usuario: 'bg-amber-100 text-amber-800 border-amber-200',
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
    <div className="min-h-screen bg-[#17313A] text-[#EAE4DD] p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 sm:mb-8">
          <div>
            <Button
              variant="ghost"
              onClick={() => router.push('/panel-admin')}
              className="mb-4 text-[#EAE4DD] hover:bg-[#EAE4DD]/10"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver al Panel Admin
            </Button>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#EAE4DD] mb-2">
              Auditoría de Actividades
            </h1>
            <p className="text-sm sm:text-base text-[#EAE4DD]/70">
              Registro de todas las acciones en el sistema
            </p>
          </div>
          
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleDownload}
              className="border-[#C78F7B] text-[#EAE4DD] hover:bg-[#C78F7B]/20"
            >
              <Download className="h-4 w-4 mr-2" />
              Descargar CSV
            </Button>
            <Button
              variant="outline"
              onClick={handleCleanup}
              className="border-red-400 text-red-400 hover:bg-red-400/20"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Limpiar antiguos
            </Button>
          </div>
        </div>

        {/* Filtros */}
        <Card className="mb-6 bg-[#1F3D47] border-[#EAE4DD]/10">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-[#C78F7B]" />
                <span className="text-sm text-[#EAE4DD]/70">Usuario:</span>
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
                          ? 'bg-[#C78F7B] text-[#17313A]'
                          : 'bg-[#17313A] text-[#EAE4DD]/70 hover:text-[#EAE4DD]'
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-[#C78F7B]" />
                <span className="text-sm text-[#EAE4DD]/70">Acción:</span>
                <select
                  value={actionFilter}
                  onChange={(e) => setActionFilter(e.target.value)}
                  className="bg-[#17313A] border border-[#EAE4DD]/20 rounded-lg px-3 py-1.5 text-sm text-[#EAE4DD] focus:outline-none focus:border-[#C78F7B]"
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
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          <Card className="bg-[#1F3D47] border-[#EAE4DD]/10">
            <CardContent className="p-4">
              <p className="text-2xl font-bold text-[#C78F7B]">{logs.length}</p>
              <p className="text-xs text-[#EAE4DD]/70">Total registros</p>
            </CardContent>
          </Card>
          <Card className="bg-[#1F3D47] border-[#EAE4DD]/10">
            <CardContent className="p-4">
              <p className="text-2xl font-bold text-[#C78F7B]">
                {logs.filter(l => l.userEmail === 'ari@conectia.mx').length}
              </p>
              <p className="text-xs text-[#EAE4DD]/70">Acciones de Ari</p>
            </CardContent>
          </Card>
          <Card className="bg-[#1F3D47] border-[#EAE4DD]/10">
            <CardContent className="p-4">
              <p className="text-2xl font-bold text-[#C78F7B]">
                {logs.filter(l => l.action.includes('propiedad')).length}
              </p>
              <p className="text-xs text-[#EAE4DD]/70">Cambios en propiedades</p>
            </CardContent>
          </Card>
          <Card className="bg-[#1F3D47] border-[#EAE4DD]/10">
            <CardContent className="p-4">
              <p className="text-2xl font-bold text-[#C78F7B]">
                {new Set(logs.map(l => l.userId)).size}
              </p>
              <p className="text-xs text-[#EAE4DD]/70">Usuarios activos</p>
            </CardContent>
          </Card>
        </div>

        {/* Lista de logs */}
        <Card className="bg-[#1F3D47] border-[#EAE4DD]/10">
          <CardHeader>
            <CardTitle className="text-lg text-[#EAE4DD] flex items-center gap-2">
              <Calendar className="h-5 w-5 text-[#C78F7B]" />
              Registro de Actividades
            </CardTitle>
            <CardDescription className="text-[#EAE4DD]/70">
              {filter === 'ari' ? 'Mostrando solo las acciones de Ari (Editor Principal)' : 
               filter === 'mine' ? 'Mostrando tus acciones' : 
               'Mostrando todas las acciones del sistema'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {logs.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-4xl mb-4">📋</p>
                <p className="text-lg font-medium text-[#EAE4DD]/70">No hay registros</p>
                <p className="text-sm text-[#EAE4DD]/50">
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
                      className="flex items-start gap-4 p-4 rounded-xl bg-[#17313A] border border-[#EAE4DD]/10 hover:border-[#C78F7B]/30 transition-all"
                    >
                      {/* Icono */}
                      <div className={log.userEmail === 'ari@conectia.mx' ? 'p-2.5 rounded-lg bg-[#C78F7B]/20 text-[#C78F7B]' : 'p-2.5 rounded-lg bg-[#EAE4DD]/10 text-[#EAE4DD]'}>
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
                          <span className="font-medium text-[#EAE4DD]">
                            {actionLabels[log.action] || log.action}
                          </span>
                          <Badge 
                            variant="outline" 
                            className={`text-xs ${entityColors[log.entityType] || 'bg-gray-100 text-gray-800'}`}
                          >
                            {log.entityType}
                          </Badge>
                          {log.userEmail === 'ari@conectia.mx' && (
                            <Badge className="bg-[#C78F7B] text-[#17313A] text-xs">
                              👑 Ari
                            </Badge>
                          )}
                        </div>

                        {log.entityName && (
                          <p className="text-sm text-[#EAE4DD]/80 mt-1">
                            {log.entityName}
                          </p>
                        )}

                        <div className="flex items-center gap-4 mt-2 text-xs text-[#EAE4DD]/50">
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
                            <pre className="mt-2 p-2 bg-[#0F2027] rounded text-xs text-[#EAE4DD]/70 overflow-x-auto">
                              {JSON.stringify(log.details, null, 2)}
                            </pre>
                          </details>
                        )}
                      </div>
                    </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
