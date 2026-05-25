'use client'

import useSWRInfinite, { SWRInfiniteConfiguration } from 'swr/infinite'
import { Propiedad } from '@/data/propiedades'
import { supabaseOptimized, withRetry } from '@/lib/supabase/optimized-client'
import type { Database } from '@/lib/supabase/database.types'

type PropiedadRow = Database['public']['Tables']['propiedades']['Row']

const PAGE_SIZE = 20

/**
 * Convierte formato DB a formato App
 */
function dbToApp(dbProp: PropiedadRow): Propiedad {
    return {
        id: Number(dbProp.id),
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

interface PageData {
    properties: Propiedad[]
    hasMore: boolean
    total: number
}

/**
 * Fetcher para paginación
 */
async function fetchPropertiesPage(
    pageIndex: number,
    category?: string
): Promise<PageData> {
    return withRetry(async () => {
        const offset = pageIndex * PAGE_SIZE

        let query = supabaseOptimized
            .from('propiedades')
            .select('*', { count: 'exact' })
            .order('created_at', { ascending: false })
            .range(offset, offset + PAGE_SIZE - 1)

        if (category) {
            query = query.eq('categoria', category)
        }

        const { data, error, count } = await query

        if (error) throw error

        return {
            properties: (data || []).map(dbToApp),
            hasMore: (count || 0) > offset + PAGE_SIZE,
            total: count || 0,
        }
    })
}

/**
 * Hook para carga infinita de propiedades
 * Ideal para scroll infinito con alto rendimiento
 */
export function useInfiniteProperties(
    category?: string,
    options?: SWRInfiniteConfiguration
) {
    const getKey = (pageIndex: number, previousPageData: PageData | null) => {
        // Si la página anterior no tiene más datos, no cargar más
        if (previousPageData && !previousPageData.hasMore) return null
        
        // Clave única para esta página
        return `properties:infinite:${category || 'all'}:${pageIndex}`
    }

    const { data, error, size, setSize, isLoading, isValidating, mutate } = useSWRInfinite<PageData>(
        getKey,
        (key) => {
            const pageIndex = parseInt(key.split(':').pop() || '0')
            return fetchPropertiesPage(pageIndex, category)
        },
        {
            revalidateOnFocus: false,
            revalidateFirstPage: false,
            parallel: true, // Cargar páginas en paralelo
            persistSize: true, // Mantener tamaño entre navegaciones
            ...options,
        }
    )

    // Aplanar todas las páginas en un solo array
    const properties = data ? data.flatMap(page => page.properties) : []
    const hasMore = data ? data[data.length - 1]?.hasMore ?? false : true
    const total = data ? data[0]?.total ?? 0 : 0

    return {
        properties,
        isLoading: isLoading && !data,
        isLoadingMore: isValidating && size > 1,
        isValidating,
        error,
        hasMore,
        total,
        loadMore: () => setSize(size + 1),
        refresh: () => mutate(),
        pageCount: size,
    }
}

/**
 * Hook para prefetch de la siguiente página
 * Mejora la experiencia de scroll infinito
 */
export function usePrefetchNextPage(
    currentPage: number,
    hasMore: boolean,
    category?: string
) {
    // Prefetch automático cuando el usuario está cerca del final
    if (hasMore && typeof window !== 'undefined') {
        // Usar requestIdleCallback para no bloquear el UI
        if ('requestIdleCallback' in window) {
            (window as any).requestIdleCallback(() => {
                fetchPropertiesPage(currentPage + 1, category).catch(() => {
                    // Ignorar errores de prefetch
                })
            })
        }
    }
}
