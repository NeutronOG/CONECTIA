import { Propiedad } from '@/data/propiedades'
import type { Database } from './supabase/database.types'
import { createClient, SupabaseClient } from '@supabase/supabase-js'

type PropiedadRow = Database['public']['Tables']['propiedades']['Row']

// Singleton: una sola instancia sin persistSession para queries de datos
let _dbClient: SupabaseClient | null = null
function getDbClient(): SupabaseClient {
  if (!_dbClient) {
    _dbClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false } }
    )
  }
  return _dbClient
}

// Cliente con service role para operaciones que requieren bypass de RLS
let _adminClient: SupabaseClient | null = null
function getAdminClient(): SupabaseClient {
  if (!_adminClient) {
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    _adminClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      serviceKey,
      { auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false } }
    )
  }
  return _adminClient
}

export class PropertiesStorage {
  // Convertir de formato DB a formato App
  static dbToApp(dbProp: PropiedadRow): Propiedad {
    return {
      id: Number(dbProp.id),
      usuarioId: (dbProp as any).usuario_id || undefined,
      titulo: dbProp.titulo,
      ubicacion: dbProp.ubicacion,
      precio: Number(dbProp.precio),
      precioTexto: dbProp.precio_texto,
      tipo: dbProp.tipo,
      habitaciones: dbProp.habitaciones,
      banos: dbProp.banos,
      mediosBanos: (dbProp as any).medios_banos || 0,
      area: dbProp.area,
      areaConstruccion: (dbProp as any).area_construccion || 0,
      cochera: (dbProp as any).cochera || 0,
      areaTexto: dbProp.area_texto,
      imagen: dbProp.imagen || '',
      descripcion: dbProp.descripcion || '',
      caracteristicas: dbProp.caracteristicas || [],
      status: dbProp.status,
      categoria: dbProp.categoria,
      fechaPublicacion: dbProp.fecha_publicacion,
      tourVirtual: dbProp.tour_virtual || undefined,
      galeria: dbProp.galeria || undefined,
      bono: (dbProp as any).bono || undefined,
    }

  }

  // Obtener propiedades por usuario (asesor) - busca por email principalmente
  static async getByUsuario(usuarioId: string, userEmail?: string, userName?: string): Promise<Propiedad[]> {
    try {
      console.log('getByUsuario:', { usuarioId, userEmail, userName })
      
      const db = getDbClient()
      
      // Obtener todas las propiedades
      const { data, error } = await db
        .from('propiedades')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching properties:', error)
        return []
      }
      
      if (!data || data.length === 0) {
        console.log('No properties in DB')
        return []
      }

      console.log('Total properties:', data.length)
      
      // Filtrar por usuario - priorizar asesor_email
      const filtered = data.filter((p: any) => {
        const asesorEmail = p.asesor_email ? String(p.asesor_email).toLowerCase().trim() : null
        const uid = p.usuario_id ? String(p.usuario_id).toLowerCase().trim() : null
        
        // Buscar por asesor_email exacto (método principal)
        if (userEmail && asesorEmail === userEmail.toLowerCase()) return true
        
        // Buscar por usuario_id exacto
        if (userEmail && uid === userEmail.toLowerCase()) return true
        if (uid === usuarioId.toLowerCase()) return true
        
        // Buscar si el email está contenido en asesor_email o usuario_id
        if (userEmail) {
          if (asesorEmail && asesorEmail.includes(userEmail.toLowerCase())) return true
          if (uid && uid.includes(userEmail.toLowerCase())) return true
        }
        
        // Buscar por nombre
        if (userName) {
          const name = userName.toLowerCase()
          if (asesorEmail && asesorEmail.includes(name)) return true
          if (uid && uid.includes(name)) return true
          // Buscar por primer nombre
          const firstName = name.split(' ')[0]
          if (firstName.length > 2) {
            if (asesorEmail && asesorEmail.includes(firstName)) return true
            if (uid && uid.includes(firstName)) return true
          }
        }
        return false
      })
      
      console.log('Filtered properties for', userEmail || userName, ':', filtered.length)
      return filtered.map(this.dbToApp)
    } catch (err) {
      console.error('Error in getByUsuario:', err)
      return []
    }
  }

  // Validar si un string es un UUID válido
  private static isValidUUID(str: string): boolean {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
    return uuidRegex.test(str)
  }

  // Convertir de formato App a formato DB
  private static appToDb(appProp: Omit<Propiedad, 'id'>, usuarioId?: string): any {
    const dbData: any = {
      titulo: appProp.titulo,
      ubicacion: appProp.ubicacion,
      precio: Math.round(Number(appProp.precio) || 0),
      precio_texto: appProp.precioTexto,
      tipo: appProp.tipo,
      habitaciones: Math.round(Number(appProp.habitaciones) || 0),
      banos: Math.round(Number(appProp.banos) || 0),
      area: Math.round(Number(appProp.area) || 0),
      area_texto: appProp.areaTexto,
      imagen: appProp.imagen,
      descripcion: appProp.descripcion,
      caracteristicas: appProp.caracteristicas,
      status: appProp.status,
      categoria: appProp.categoria,
      fecha_publicacion: appProp.fechaPublicacion,
      tour_virtual: appProp.tourVirtual,
      galeria: appProp.galeria,
      bono: (appProp as any).bono || null,
    }
    
    // NOTA: Los campos medios_banos, area_construccion, cochera y tipo_credito
    // requieren que existan en la tabla de Supabase. Ejecuta en Supabase:
    // ALTER TABLE propiedades 
    // ADD COLUMN IF NOT EXISTS medios_banos INTEGER DEFAULT 0,
    // ADD COLUMN IF NOT EXISTS area_construccion INTEGER DEFAULT 0,
    // ADD COLUMN IF NOT EXISTS cochera INTEGER DEFAULT 0,
    // ADD COLUMN IF NOT EXISTS tipo_credito TEXT;
    
    // Tipo de crédito - agregar si existe la columna
    if ((appProp as any).tipoCredito !== undefined) {
      dbData.tipo_credito = (appProp as any).tipoCredito
    }
    
    // Descomentar cuando las columnas existan en la DB:
    // if (appProp.mediosBanos !== undefined) {
    //   dbData.medios_banos = appProp.mediosBanos
    // }
    // if (appProp.areaConstruccion !== undefined) {
    //   dbData.area_construccion = appProp.areaConstruccion
    // }
    // if (appProp.cochera !== undefined) {
    //   dbData.cochera = appProp.cochera
    // }

    // Guardar el email del asesor en asesor_email (nueva columna TEXT)
    if (usuarioId) {
      dbData.asesor_email = usuarioId
      // Mantener usuario_id para compatibilidad con datos antiguos
      dbData.usuario_id = usuarioId
    }

    // Asegurar que no se incluya el id
    delete dbData.id

    return dbData
  }

  // Obtener todas las propiedades
  static async getAll(): Promise<Propiedad[]> {
    try {
      const db = getDbClient()

      const { data, error } = await db
        .from('propiedades')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      return data?.map(this.dbToApp) || []
    } catch (error) {
      console.error('Error in getAll:', error)
      return []
    }
  }

  // Obtener una propiedad por ID
  static async getById(id: number): Promise<Propiedad | undefined> {
    try {
      const db = getDbClient()

      const { data, error } = await db
        .from('propiedades')
        .select('*')
        .eq('id', id)
        .single()

      if (error) throw error
      return data ? this.dbToApp(data) : undefined
    } catch (error) {
      console.error('Error in getById:', error)
      return undefined
    }
  }

  // Verificar si ya existe una propiedad con el mismo título y ubicación
  static async checkDuplicate(titulo: string, ubicacion: string): Promise<boolean> {
    try {
      const db = getDbClient()
      
      const { data, error } = await db
        .from('propiedades')
        .select('id')
        .ilike('titulo', titulo)
        .ilike('ubicacion', ubicacion)
        .limit(1)

      if (error) throw error
      return (data?.length || 0) > 0
    } catch (error) {
      console.error('Error checking duplicate:', error)
      return false
    }
  }

  // Verificar si una imagen ya existe en alguna propiedad
  // Nota: Solo verifica URLs, no imágenes base64 (son muy largas para consultas)
  static async checkDuplicateImage(imageUrl: string): Promise<boolean> {
    try {
      // No verificar imágenes base64 - son demasiado largas para consultas HTTP
      // y cada imagen base64 es única por naturaleza
      if (imageUrl.startsWith('data:')) {
        return false
      }

      // Solo verificar URLs normales (no base64)
      if (imageUrl.length > 2000) {
        console.warn('Image URL too long for duplicate check, skipping')
        return false
      }

      const db = getDbClient()

      // Buscar en imagen principal
      const { data: mainImage, error: mainError } = await db
        .from('propiedades')
        .select('id')
        .eq('imagen', imageUrl)
        .limit(1)

      if (mainError) throw mainError
      if ((mainImage?.length || 0) > 0) return true

      // Buscar en galería - solo si la URL es corta
      const { data: gallery, error: galleryError } = await db
        .from('propiedades')
        .select('id, galeria')

      if (galleryError) throw galleryError

      for (const prop of (gallery || []) as { id: number; galeria: string[] | null }[]) {
        if (prop.galeria && Array.isArray(prop.galeria)) {
          if (prop.galeria.includes(imageUrl)) return true
        }
      }

      return false
    } catch (error) {
      console.error('Error checking duplicate image:', error)
      return false
    }
  }

  // Agregar nueva propiedad
  static async add(property: Omit<Propiedad, 'id'>, usuarioId: string): Promise<Propiedad | null> {
    try {
      // Validar propiedad duplicada
      const isDuplicate = await this.checkDuplicate(property.titulo, property.ubicacion)
      if (isDuplicate) {
        throw new Error('Ya existe una propiedad con el mismo título y ubicación')
      }

      // Validar imagen principal duplicada
      if (property.imagen) {
        const isImageDuplicate = await this.checkDuplicateImage(property.imagen)
        if (isImageDuplicate) {
          throw new Error('La imagen principal ya está siendo usada en otra propiedad')
        }
      }

      // Validar imágenes de galería duplicadas
      if (property.galeria && property.galeria.length > 0) {
        for (const img of property.galeria) {
          const isGalleryImageDuplicate = await this.checkDuplicateImage(img)
          if (isGalleryImageDuplicate) {
            throw new Error(`La imagen de galería "${img}" ya está siendo usada en otra propiedad`)
          }
        }
      }

      const dbData = this.appToDb(property, usuarioId)

      const db = getDbClient()

      const { data, error } = await db
        .from('propiedades')
        .insert(dbData)
        .select()
        .single()

      if (error) {
        console.error('PropertiesStorage.add - Error de Supabase:', error)
        throw error
      }
      
      return data ? this.dbToApp(data) : null
    } catch (error) {
      console.error('PropertiesStorage.add - Error capturado:', error)
      throw error
    }
  }

  // Actualizar propiedad existente
  static async update(id: number, updates: Partial<Propiedad>): Promise<Propiedad | null> {
    try {
      const dbData = this.appToDb(updates as any)

      const db = getAdminClient()

      const { data, error } = await db
        .from('propiedades')
        .update(dbData)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      
      return data ? this.dbToApp(data) : null
    } catch (error) {
      console.error('Error updating property:', error)
      throw error
    }
  }

  // Eliminar propiedad
  static async delete(id: number): Promise<boolean> {
    try {
      const db = getDbClient()

      const { error } = await db
        .from('propiedades')
        .delete()
        .eq('id', id)

      if (error) throw error
      
      return true
    } catch (error) {
      console.error('Error deleting property:', error)
      return false
    }
  }

  // Obtener propiedades por asesor
  static async getByAsesor(asesorEmail: string): Promise<Propiedad[]> {
    try {
      const db = getDbClient()

      // Obtener propiedades por email del asesor en usuario_id
      const { data, error } = await db
        .from('propiedades')
        .select('*')
        .eq('usuario_id', asesorEmail)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data?.map(this.dbToApp) || []
    } catch (error) {
      console.error('Error in getByAsesor:', error)
      return []
    }
  }

  // Obtener propiedades por categoría
  static async getByCategoria(categoria: string): Promise<Propiedad[]> {
    try {
      const db = getDbClient()

      const { data, error } = await db
        .from('propiedades')
        .select('*')
        .eq('categoria', categoria)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data?.map(this.dbToApp) || []
    } catch (error) {
      console.error('Error in getByCategoria:', error)
      return []
    }
  }

  // Inicializar con datos mock (solo para desarrollo / fallback)
  static initializeWithMockData(mockData: Propiedad[]): void {
    console.log('Mock data initialization not needed with Supabase')
    // Este método ya no es necesario con Supabase real
    // Los datos se migrarán con el script seed-supabase.ts
  }
}
