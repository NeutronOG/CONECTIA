export interface OwnerSubmission {
  id: string
  // Información de la propiedad
  propertyType: string
  bedrooms: string
  bathrooms: string
  area: string
  areaConstruccion?: string
  // Ubicación
  address: string
  city: string
  neighborhood: string
  postalCode: string
  // Detalles
  askingPrice: string
  tipoConsulta?: string
  urgency: string
  description: string
  amenities: string[]
  actividadesRecreativas?: string[]
  // Fotos (guardamos los nombres/URLs)
  photoCount: number
  // Contacto
  ownerName: string
  phone: string
  email: string
  preferredContact: string
  // Promoción / Bono
  promocion?: string
  promocionPersonalizada?: string
  // Acuerdos
  exclusivity: boolean
  terms: boolean
  privacy: boolean
  // Metadata
  submittedAt: string
  status: 'pending' | 'contacted' | 'approved' | 'rejected'
  estimatedValue?: number
}

const STORAGE_KEY = 'conectia_owner_submissions'

export class OwnerSubmissionsStorage {
  // Obtener todas las solicitudes
  static getAll(): OwnerSubmission[] {
    if (typeof window === 'undefined') return []
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored ? JSON.parse(stored) : []
  }

  // Obtener una solicitud por ID
  static getById(id: string): OwnerSubmission | undefined {
    const submissions = this.getAll()
    return submissions.find(s => s.id === id)
  }

  // Guardar todas las solicitudes
  static saveAll(submissions: OwnerSubmission[]): void {
    if (typeof window === 'undefined') return
    localStorage.setItem(STORAGE_KEY, JSON.stringify(submissions))
  }

  // Agregar nueva solicitud
  static add(submission: Omit<OwnerSubmission, 'id' | 'submittedAt' | 'status'>): OwnerSubmission {
    const submissions = this.getAll()
    const newId = `owner-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    
    const newSubmission: OwnerSubmission = {
      ...submission,
      id: newId,
      submittedAt: new Date().toISOString(),
      status: 'pending'
    }
    
    submissions.push(newSubmission)
    this.saveAll(submissions)
    return newSubmission
  }

  // Actualizar estado de solicitud
  static updateStatus(id: string, status: OwnerSubmission['status']): boolean {
    const submissions = this.getAll()
    const index = submissions.findIndex(s => s.id === id)
    
    if (index === -1) return false
    
    submissions[index].status = status
    this.saveAll(submissions)
    return true
  }

  // Obtener solicitudes por estado
  static getByStatus(status: OwnerSubmission['status']): OwnerSubmission[] {
    const submissions = this.getAll()
    return submissions.filter(s => s.status === status)
  }

  // Obtener solicitudes pendientes
  static getPending(): OwnerSubmission[] {
    return this.getByStatus('pending')
  }

  // Eliminar solicitud
  static delete(id: string): boolean {
    const submissions = this.getAll()
    const filtered = submissions.filter(s => s.id !== id)
    
    if (filtered.length === submissions.length) return false
    
    this.saveAll(filtered)
    return true
  }

  // Obtener estadísticas
  static getStats() {
    const submissions = this.getAll()
    return {
      total: submissions.length,
      pending: submissions.filter(s => s.status === 'pending').length,
      contacted: submissions.filter(s => s.status === 'contacted').length,
      approved: submissions.filter(s => s.status === 'approved').length,
      rejected: submissions.filter(s => s.status === 'rejected').length
    }
  }
}
