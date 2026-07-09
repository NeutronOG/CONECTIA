import { SUPER_USER_EMAILS } from './super-users'

// Sistema de Auditoría para CONECTIA
// Registra todas las actividades de usuarios, especialmente Ari

export type AuditAction = 
  | 'login'
  | 'logout'
  | 'propiedad_creada'
  | 'propiedad_actualizada'
  | 'propiedad_eliminada'
  | 'propiedad_publicada'
  | 'propiedad_desactivada'
  | 'propiedad_compartida'
  | 'solicitud_aprobada'
  | 'solicitud_rechazada'
  | 'asesor_asignado'
  | 'imagen_subida'
  | 'imagen_eliminada'
  | 'configuracion_cambiada'

export interface AuditLog {
  id: string
  timestamp: string
  userId: string
  userEmail: string
  userName: string
  action: AuditAction
  entityType: 'propiedad' | 'solicitud' | 'asesor' | 'sistema' | 'usuario'
  entityId?: string
  entityName?: string
  details: Record<string, unknown>
  ipAddress?: string
  userAgent?: string
}

const AUDIT_STORAGE_KEY = 'conectia_audit_logs'
const MAX_LOGS = 1000 // Mantener máximo 1000 logs locales

// Generar ID único
function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

// Obtener logs almacenados
export function getAuditLogs(): AuditLog[] {
  if (typeof window === 'undefined') return []
  try {
    const stored = localStorage.getItem(AUDIT_STORAGE_KEY)
    return stored ? JSON.parse(stored) : []
  } catch {
    return []
  }
}

// Guardar logs
function saveAuditLogs(logs: AuditLog[]): void {
  if (typeof window === 'undefined') return
  try {
    // Mantener solo los últimos MAX_LOGS
    const trimmedLogs = logs.slice(-MAX_LOGS)
    localStorage.setItem(AUDIT_STORAGE_KEY, JSON.stringify(trimmedLogs))
  } catch (error) {
    console.error('Error saving audit logs:', error)
  }
}

// Registrar una actividad
export async function logAudit(
  user: { id: string; email: string; nombre: string },
  action: AuditAction,
  entityType: AuditLog['entityType'],
  entityId?: string,
  entityName?: string,
  details: Record<string, unknown> = {}
): Promise<void> {
  const log: AuditLog = {
    id: generateId(),
    timestamp: new Date().toISOString(),
    userId: user.id,
    userEmail: user.email,
    userName: user.nombre,
    action,
    entityType,
    entityId,
    entityName,
    details,
    userAgent: typeof window !== 'undefined' ? navigator.userAgent : undefined,
  }

  // Guardar localmente
  const logs = getAuditLogs()
  logs.push(log)
  saveAuditLogs(logs)

  // Si es super usuario (Ari, admin, Lizzie), también enviar a Supabase para persistencia central
  if (user.email === 'ari@conectia.mx' || SUPER_USER_EMAILS.includes(user.email.toLowerCase())) {
    try {
      await sendToSupabase(log)
    } catch (error) {
      console.error('Error sending audit log to Supabase:', error)
    }
  }

  // Console log para debugging
  console.log(`[AUDIT] ${user.nombre} (${user.email}): ${action}`, {
    entityType,
    entityId,
    entityName,
    details,
  })
}

// Enviar log a Supabase
async function sendToSupabase(log: AuditLog): Promise<void> {
  try {
    const response = await fetch('/api/audit-log', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(log),
    })
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
  } catch {
    // Si falla, el log ya está en localStorage como backup
  }
}

// Filtrar logs por usuario
export function getLogsByUser(userId: string): AuditLog[] {
  return getAuditLogs().filter(log => log.userId === userId)
}

// Filtrar logs por acción
export function getLogsByAction(action: AuditAction): AuditLog[] {
  return getAuditLogs().filter(log => log.action === action)
}

// Filtrar logs por entidad
export function getLogsByEntity(entityType: AuditLog['entityType'], entityId?: string): AuditLog[] {
  return getAuditLogs().filter(log => {
    if (entityId) {
      return log.entityType === entityType && log.entityId === entityId
    }
    return log.entityType === entityType
  })
}

// Obtener logs de Ari específicamente
export function getAriLogs(): AuditLog[] {
  return getAuditLogs().filter(log => log.userEmail === 'ari@conectia.mx')
}

// Exportar logs a CSV
export function exportLogsToCSV(logs?: AuditLog[]): string {
  const data = logs || getAuditLogs()
  
  const headers = ['Fecha', 'Usuario', 'Email', 'Acción', 'Tipo', 'Entidad', 'ID', 'Detalles']
  
  const rows = data.map(log => [
    new Date(log.timestamp).toLocaleString('es-MX'),
    log.userName,
    log.userEmail,
    log.action,
    log.entityType,
    log.entityName || '-',
    log.entityId || '-',
    JSON.stringify(log.details),
  ])
  
  return [headers.join(','), ...rows.map(row => row.map(cell => `"${cell}"`).join(','))].join('\n')
}

// Descargar logs como archivo
export function downloadLogs(logs?: AuditLog[], filename?: string): void {
  const csv = exportLogsToCSV(logs)
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  
  link.setAttribute('href', url)
  link.setAttribute('download', filename || `audit-logs-${new Date().toISOString().split('T')[0]}.csv`)
  link.style.visibility = 'hidden'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

// Limpiar logs antiguos (mantener últimos 30 días)
export function cleanupOldLogs(): void {
  const logs = getAuditLogs()
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
  
  const recentLogs = logs.filter(log => new Date(log.timestamp) > thirtyDaysAgo)
  saveAuditLogs(recentLogs)
}
