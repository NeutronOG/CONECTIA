export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export interface Database {
    public: {
        Tables: {
            propiedades: {
                Row: {
                    id: number
                    titulo: string
                    ubicacion: string
                    precio: number
                    precio_texto: string
                    tipo: string
                    habitaciones: number
                    banos: number
                    medios_banos: number | null
                    area: number
                    area_construccion: number | null
                    cochera: number | null
                    area_texto: string
                    imagen: string | null
                    descripcion: string | null
                    caracteristicas: string[] | null
                    status: 'Disponible' | 'Exclusiva' | 'Reservada'
                    categoria: 'venta' | 'renta' | 'especial' | 'remate' | 'exclusivo'
                    fecha_publicacion: string
                    tour_virtual: string | null
                    galeria: string[] | null
                    usuario_id: string | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: number
                    titulo: string
                    ubicacion: string
                    precio: number
                    precio_texto: string
                    tipo: string
                    habitaciones: number
                    banos: number
                    medios_banos?: number | null
                    area: number
                    area_construccion?: number | null
                    cochera?: number | null
                    area_texto: string
                    imagen?: string | null
                    descripcion?: string | null
                    caracteristicas?: string[] | null
                    status?: 'Disponible' | 'Exclusiva' | 'Reservada'
                    categoria?: 'venta' | 'renta' | 'especial' | 'remate' | 'exclusivo'
                    fecha_publicacion?: string
                    tour_virtual?: string | null
                    galeria?: string[] | null
                    usuario_id?: string | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: number
                    titulo?: string
                    ubicacion?: string
                    precio?: number
                    precio_texto?: string
                    tipo?: string
                    habitaciones?: number
                    banos?: number
                    medios_banos?: number | null
                    area?: number
                    area_construccion?: number | null
                    cochera?: number | null
                    area_texto?: string
                    imagen?: string | null
                    descripcion?: string | null
                    caracteristicas?: string[] | null
                    status?: 'Disponible' | 'Exclusiva' | 'Reservada'
                    categoria?: 'venta' | 'renta' | 'especial' | 'remate' | 'exclusivo'
                    fecha_publicacion?: string
                    tour_virtual?: string | null
                    galeria?: string[] | null
                    usuario_id?: string | null
                    created_at?: string
                    updated_at?: string
                }
            }
            agentes: {
                Row: {
                    id: number
                    nombre: string
                    especialidad: string | null
                    rating: number | null
                    ventas: number
                    telefono: string | null
                    email: string
                    avatar: string | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: number
                    nombre: string
                    especialidad?: string | null
                    rating?: number | null
                    ventas?: number
                    telefono?: string | null
                    email: string
                    avatar?: string | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: number
                    nombre?: string
                    especialidad?: string | null
                    rating?: number | null
                    ventas?: number
                    telefono?: string | null
                    email?: string
                    avatar?: string | null
                    created_at?: string
                    updated_at?: string
                }
            }
            usuarios: {
                Row: {
                    id: string
                    email: string
                    nombre: string | null
                    role: 'admin' | 'propietario' | 'asesor' | 'cliente'
                    telefono: string | null
                    avatar: string | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id: string
                    email: string
                    nombre?: string | null
                    role?: 'admin' | 'propietario' | 'asesor' | 'cliente'
                    telefono?: string | null
                    avatar?: string | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    email?: string
                    nombre?: string | null
                    role?: 'admin' | 'propietario' | 'asesor' | 'cliente'
                    telefono?: string | null
                    avatar?: string | null
                    created_at?: string
                    updated_at?: string
                }
            }
            favoritos: {
                Row: {
                    id: number
                    usuario_id: string
                    propiedad_id: number
                    created_at: string
                }
                Insert: {
                    id?: number
                    usuario_id: string
                    propiedad_id: number
                    created_at?: string
                }
                Update: {
                    id?: number
                    usuario_id?: string
                    propiedad_id?: number
                    created_at?: string
                }
            }
            propiedad_detalles: {
                Row: {
                    propiedad_id: number
                    tipo_propiedad: string | null
                    area_terreno: string | null
                    antiguedad: string | null
                    vistas: number
                    favoritos: number
                    publicado: string | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    propiedad_id: number
                    tipo_propiedad?: string | null
                    area_terreno?: string | null
                    antiguedad?: string | null
                    vistas?: number
                    favoritos?: number
                    publicado?: string | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    propiedad_id?: number
                    tipo_propiedad?: string | null
                    area_terreno?: string | null
                    antiguedad?: string | null
                    vistas?: number
                    favoritos?: number
                    publicado?: string | null
                    created_at?: string
                    updated_at?: string
                }
            }
        }
    }
}
