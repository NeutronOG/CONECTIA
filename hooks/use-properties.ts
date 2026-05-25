'use client'

import useSWR, { SWRConfiguration, mutate } from 'swr'
import { Propiedad } from '@/data/propiedades'
import { supabaseOptimized, withRetry } from '@/lib/supabase/optimized-client'
import { propertiesCache, CACHE_KEYS } from '@/lib/properties-cache'
import type { Database } from '@/lib/supabase/database.types'

type PropiedadRow = Database['public']['Tables']['propiedades']['Row']

/**
 * Convierte formato DB a formato App
 */
function dbToApp(dbProp: PropiedadRow): Propiedad {
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
        area: dbProp.area,
        areaTexto: dbProp.area_texto,
        imagen: dbProp.imagen || '',
        descripcion: dbProp.descripcion || '',
        caracteristicas: dbProp.caracteristicas || [],
        status: dbProp.status,
        categoria: dbProp.categoria,
        fechaPublicacion: dbProp.fecha_publicacion,
        tourVirtual: dbProp.tour_virtual || undefined,
        galeria: dbProp.galeria || undefined,
    }
}

/**
 * Fetcher optimizado con caché y retry
 */
async function fetchAllProperties(): Promise<Propiedad[]> {
    return withRetry(async () => {
        const { data, error } = await supabaseOptimized
            .from('propiedades')
            .select('*')
            .order('created_at', { ascending: false })

        if (error) throw error
        return (data || []).map(dbToApp)
    })
}

async function fetchPropertyById(id: number): Promise<Propiedad | null> {
    return withRetry(async () => {
        const { data, error } = await supabaseOptimized
            .from('propiedades')
            .select('*')
            .eq('id', id)
            .single()

        if (error) throw error
        return data ? dbToApp(data) : null
    })
}

async function fetchPropertiesByCategory(category: string): Promise<Propiedad[]> {
    return withRetry(async () => {
        const { data, error } = await supabaseOptimized
            .from('propiedades')
            .select('*')
            .eq('categoria', category)
            .order('created_at', { ascending: false })

        if (error) throw error
        return (data || []).map(dbToApp)
    })
}

/**
 * Configuración SWR optimizada para alto rendimiento
 */
const defaultSWRConfig: SWRConfiguration = {
    revalidateOnFocus: false, // No revalidar al enfocar (reduce requests)
    revalidateOnReconnect: true, // Sí revalidar al reconectar
    dedupingInterval: 5000, // Deduplicar requests en 5 segundos
    focusThrottleInterval: 30000, // Throttle de focus a 30 segundos
    errorRetryCount: 3, // Reintentar 3 veces en error
    errorRetryInterval: 1000, // Intervalo entre reintentos
    keepPreviousData: true, // Mantener datos previos mientras carga
    suspense: false, // No usar suspense (mejor control)
}

/**
 * Hook principal para obtener todas las propiedades
 * Implementa stale-while-revalidate para carga instantánea
 */
export function useProperties(options?: SWRConfiguration) {
    const { data, error, isLoading, isValidating, mutate: revalidate } = useSWR<Propiedad[]>(
        CACHE_KEYS.ALL_PROPERTIES,
        fetchAllProperties,
        {
            ...defaultSWRConfig,
            ...options,
            // Fallback a caché local si existe
            fallbackData: propertiesCache.get<Propiedad[]>(CACHE_KEYS.ALL_PROPERTIES).data || undefined,
            onSuccess: (data) => {
                // Actualizar caché local
                propertiesCache.set(CACHE_KEYS.ALL_PROPERTIES, data)
            },
        }
    )

    return {
        properties: data || [],
        isLoading: isLoading && !data,
        isValidating,
        error,
        refresh: () => revalidate(),
    }
}

/**
 * Hook para obtener una propiedad por ID
 */
export function useProperty(id: number | null, options?: SWRConfiguration) {
    const cacheKey = id ? CACHE_KEYS.PROPERTY_BY_ID(id) : null

    const { data, error, isLoading, isValidating, mutate: revalidate } = useSWR<Propiedad | null>(
        cacheKey,
        () => (id ? fetchPropertyById(id) : null),
        {
            ...defaultSWRConfig,
            ...options,
            fallbackData: cacheKey ? propertiesCache.get<Propiedad>(cacheKey).data : undefined,
            onSuccess: (data) => {
                if (cacheKey && data) {
                    propertiesCache.set(cacheKey, data)
                }
            },
        }
    )

    return {
        property: data,
        isLoading: isLoading && !data,
        isValidating,
        error,
        refresh: () => revalidate(),
    }
}

/**
 * Hook para obtener propiedades por categoría
 */
export function usePropertiesByCategory(category: string | null, options?: SWRConfiguration) {
    const cacheKey = category ? CACHE_KEYS.PROPERTIES_BY_CATEGORY(category) : null

    const { data, error, isLoading, isValidating, mutate: revalidate } = useSWR<Propiedad[]>(
        cacheKey,
        () => (category ? fetchPropertiesByCategory(category) : []),
        {
            ...defaultSWRConfig,
            ...options,
            fallbackData: cacheKey ? propertiesCache.get<Propiedad[]>(cacheKey).data || [] : [],
            onSuccess: (data) => {
                if (cacheKey) {
                    propertiesCache.set(cacheKey, data)
                }
            },
        }
    )

    return {
        properties: data || [],
        isLoading: isLoading && !data,
        isValidating,
        error,
        refresh: () => revalidate(),
    }
}

/**
 * Prefetch de propiedades para carga instantánea
 * Llamar esto en el layout o página principal
 */
export async function prefetchProperties(): Promise<void> {
    try {
        const data = await fetchAllProperties()
        propertiesCache.set(CACHE_KEYS.ALL_PROPERTIES, data)
        // También actualizar SWR cache
        mutate(CACHE_KEYS.ALL_PROPERTIES, data, false)
    } catch (error) {
        console.error('Error prefetching properties:', error)
    }
}

/**
 * Invalidar caché de propiedades
 * Llamar después de crear/editar/eliminar
 */
export function invalidatePropertiesCache(): void {
    propertiesCache.invalidateAll()
    mutate(CACHE_KEYS.ALL_PROPERTIES)
}

/**
 * Actualización optimista
 * Actualiza UI inmediatamente y sincroniza con servidor
 */
export async function optimisticUpdate(
    id: number,
    updates: Partial<Propiedad>,
    serverUpdate: () => Promise<Propiedad | null>
): Promise<boolean> {
    const cacheKey = CACHE_KEYS.ALL_PROPERTIES
    const currentData = propertiesCache.get<Propiedad[]>(cacheKey).data || []

    // Actualización optimista local
    const optimisticData = currentData.map(p =>
        p.id === id ? { ...p, ...updates } : p
    )
    propertiesCache.set(cacheKey, optimisticData)
    mutate(cacheKey, optimisticData, false)

    try {
        // Sincronizar con servidor
        const result = await serverUpdate()
        if (result) {
            // Actualizar con datos reales del servidor
            const finalData = currentData.map(p =>
                p.id === id ? result : p
            )
            propertiesCache.set(cacheKey, finalData)
            mutate(cacheKey, finalData, false)
            return true
        }
        return false
    } catch (error) {
        // Rollback en caso de error
        propertiesCache.set(cacheKey, currentData)
        mutate(cacheKey, currentData, false)
        throw error
    }
}

/**
 * Agregar propiedad con actualización optimista
 */
export async function optimisticAdd(
    newProperty: Propiedad,
    serverAdd: () => Promise<Propiedad | null>
): Promise<Propiedad | null> {
    const cacheKey = CACHE_KEYS.ALL_PROPERTIES
    const currentData = propertiesCache.get<Propiedad[]>(cacheKey).data || []

    // Agregar optimistamente
    const optimisticData = [newProperty, ...currentData]
    propertiesCache.set(cacheKey, optimisticData)
    mutate(cacheKey, optimisticData, false)

    try {
        const result = await serverAdd()
        if (result) {
            // Reemplazar con datos reales
            const finalData = [result, ...currentData]
            propertiesCache.set(cacheKey, finalData)
            mutate(cacheKey, finalData, false)
            return result
        }
        // Rollback si falla
        propertiesCache.set(cacheKey, currentData)
        mutate(cacheKey, currentData, false)
        return null
    } catch (error) {
        // Rollback
        propertiesCache.set(cacheKey, currentData)
        mutate(cacheKey, currentData, false)
        throw error
    }
}

/**
 * Eliminar propiedad con actualización optimista
 */
export async function optimisticDelete(
    id: number,
    serverDelete: () => Promise<boolean>
): Promise<boolean> {
    const cacheKey = CACHE_KEYS.ALL_PROPERTIES
    const currentData = propertiesCache.get<Propiedad[]>(cacheKey).data || []

    // Eliminar optimistamente
    const optimisticData = currentData.filter(p => p.id !== id)
    propertiesCache.set(cacheKey, optimisticData)
    mutate(cacheKey, optimisticData, false)

    try {
        const success = await serverDelete()
        if (!success) {
            // Rollback si falla
            propertiesCache.set(cacheKey, currentData)
            mutate(cacheKey, currentData, false)
        }
        return success
    } catch (error) {
        // Rollback
        propertiesCache.set(cacheKey, currentData)
        mutate(cacheKey, currentData, false)
        throw error
    }
}
