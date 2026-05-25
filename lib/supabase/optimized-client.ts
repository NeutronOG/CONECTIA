import { createClient, SupabaseClient } from '@supabase/supabase-js'
import type { Database } from './database.types'

type PropiedadRow = Database['public']['Tables']['propiedades']['Row']

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables')
}

// Singleton pattern para evitar múltiples instancias
let supabaseInstance: SupabaseClient | null = null

/**
 * Cliente Supabase optimizado para alto rendimiento
 * - Connection pooling automático
 * - Retry logic con exponential backoff
 * - Configuración optimizada para alta concurrencia
 */
export function getOptimizedSupabase(): SupabaseClient {
    if (supabaseInstance) {
        return supabaseInstance
    }

    supabaseInstance = createClient(supabaseUrl, supabaseAnonKey, {
        auth: {
            persistSession: true,
            autoRefreshToken: true,
            detectSessionInUrl: false, // Evita overhead en cada request
        },
        global: {
            headers: {
                'x-client-info': 'conectia/1.0.0',
            },
        },
        db: {
            schema: 'public',
        },
        realtime: {
            params: {
                eventsPerSecond: 10, // Limitar eventos para no saturar
            },
        },
    })

    return supabaseInstance
}

// Export singleton
export const supabaseOptimized = getOptimizedSupabase()

/**
 * Retry wrapper con exponential backoff
 * Para manejar errores transitorios de red
 */
export async function withRetry<T>(
    operation: () => Promise<T>,
    maxRetries: number = 3,
    baseDelay: number = 100
): Promise<T> {
    let lastError: Error | null = null
    
    for (let attempt = 0; attempt < maxRetries; attempt++) {
        try {
            return await operation()
        } catch (error) {
            lastError = error as Error
            
            // No reintentar errores de autenticación o validación
            if (error instanceof Error) {
                const message = error.message.toLowerCase()
                if (message.includes('auth') || message.includes('permission') || message.includes('invalid')) {
                    throw error
                }
            }
            
            // Exponential backoff
            const delay = baseDelay * Math.pow(2, attempt)
            await new Promise(resolve => setTimeout(resolve, delay))
        }
    }
    
    throw lastError
}

/**
 * Batch fetcher para múltiples IDs
 * Optimiza queries cuando se necesitan múltiples propiedades
 */
export async function batchFetchProperties(ids: number[]): Promise<Map<number, PropiedadRow>> {
    if (ids.length === 0) return new Map()
    
    const { data, error } = await supabaseOptimized
        .from('propiedades')
        .select('*')
        .in('id', ids)
    
    if (error) throw error
    
    const map = new Map<number, PropiedadRow>()
    if (data) {
        data.forEach((prop: PropiedadRow) => {
            map.set(prop.id, prop)
        })
    }
    return map
}
