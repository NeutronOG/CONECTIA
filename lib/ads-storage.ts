export interface Ad {
  id: string
  // Info del anuncio
  titulo: string
  descripcion: string
  imagen: string
  enlace: string
  textoBoton: string
  // Ubicación en homepage
  ubicacion: 'banner-hero' | 'entre-secciones' | 'lateral' | 'footer'
  // Estilo
  estilo: 'elegante' | 'destacado' | 'sutil'
  // Control
  activo: boolean
  fechaInicio: string
  fechaFin: string
  // Metadata
  creadoPor: string
  creadoEn: string
  clicks: number
  impresiones: number
}

const STORAGE_KEY = 'conectia_ads'

export class AdsStorage {
  static getAll(): Ad[] {
    if (typeof window === 'undefined') return []
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored ? JSON.parse(stored) : []
  }

  static getById(id: string): Ad | undefined {
    return this.getAll().find(a => a.id === id)
  }

  static saveAll(ads: Ad[]): void {
    if (typeof window === 'undefined') return
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ads))
  }

  static add(ad: Omit<Ad, 'id' | 'creadoEn' | 'clicks' | 'impresiones'>): Ad {
    const ads = this.getAll()
    const newAd: Ad = {
      ...ad,
      id: `ad-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      creadoEn: new Date().toISOString(),
      clicks: 0,
      impresiones: 0,
    }
    ads.push(newAd)
    this.saveAll(ads)
    return newAd
  }

  static update(id: string, updates: Partial<Ad>): boolean {
    const ads = this.getAll()
    const idx = ads.findIndex(a => a.id === id)
    if (idx === -1) return false
    ads[idx] = { ...ads[idx], ...updates }
    this.saveAll(ads)
    return true
  }

  static delete(id: string): boolean {
    const ads = this.getAll()
    const filtered = ads.filter(a => a.id !== id)
    if (filtered.length === ads.length) return false
    this.saveAll(filtered)
    return true
  }

  static getActive(): Ad[] {
    const now = new Date().toISOString()
    return this.getAll().filter(a => {
      if (!a.activo) return false
      if (a.fechaInicio && a.fechaInicio > now) return false
      if (a.fechaFin && a.fechaFin < now) return false
      return true
    })
  }

  static getActiveByUbicacion(ubicacion: Ad['ubicacion']): Ad[] {
    return this.getActive().filter(a => a.ubicacion === ubicacion)
  }

  static trackClick(id: string): void {
    const ads = this.getAll()
    const idx = ads.findIndex(a => a.id === id)
    if (idx !== -1) {
      ads[idx].clicks += 1
      this.saveAll(ads)
    }
  }

  static trackImpression(id: string): void {
    const ads = this.getAll()
    const idx = ads.findIndex(a => a.id === id)
    if (idx !== -1) {
      ads[idx].impresiones += 1
      this.saveAll(ads)
    }
  }
}
