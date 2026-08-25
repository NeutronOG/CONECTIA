import { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from './database.types'
import { supabase } from './client'

type PropiedadRow = Database['public']['Tables']['propiedades']['Row']

/**
 * Comparte el cliente de navegador que también maneja la sesión. Tener dos
 * clientes con la misma storage key provoca la advertencia de GoTrue y puede
 * interferir con la sesión activa.
 */
export function getOptimizedSupabase(): SupabaseClient {
    return supabase
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
