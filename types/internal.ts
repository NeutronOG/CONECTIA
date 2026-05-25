export type UserRole = 'asesor' | 'admin' | 'propietario' | 'fotografo' | 'broker'
export type PlanType = 'core' | 'elite'

export interface User {
  id: string
  nombre: string
  email: string
  password?: string
  role: UserRole
  telefono?: string
  avatar?: string
  propiedadId?: number // Para propietarios
  plan?: PlanType // Plan de suscripción para asesores
}

export interface PropertyProgress {
  propiedadId: number
  asesorId: string
  leads: number
  visitas: number
  ofertas: number
  status: 'activa' | 'en_negociacion' | 'vendida' | 'rentada' | 'pausada'
  ultimaActividad: string
  notas?: string
}

export interface Lead {
  id: string
  propiedadId: number
  nombre: string
  email: string
  telefono: string
  mensaje: string
  fecha: string
  status: 'nuevo' | 'contactado' | 'calificado' | 'descartado'
  asesorId?: string
}

export interface Activity {
  id: string
  tipo: 'lead' | 'visita' | 'oferta' | 'venta' | 'nota'
  propiedadId: number
  asesorId: string
  descripcion: string
  fecha: string
}
