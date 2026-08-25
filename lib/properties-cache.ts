import { Propiedad } from '@/data/propiedades'

/**
 * Sistema de caché en memoria para propiedades
 * Diseñado para carga instantánea y alta concurrencia
 */

interface CacheEntry<T> {
    data: T
    timestamp: number
    etag?: string
}

interface CacheConfig {
    ttl: number // Time to live en ms
    staleWhileRevalidate: number // Tiempo extra para servir datos stale mientras se revalida
}

const DEFAULT_CONFIG: CacheConfig = {
    ttl: 30000, // 30 segundos de caché fresco
    staleWhileRevalidate: 300000, // 5 minutos de datos stale aceptables
}

class PropertiesCache {
    private cache: Map<string, CacheEntry<any>> = new Map()
    private config: CacheConfig
    private revalidating: Set<string> = new Set()
    private subscribers: Map<string, Set<(data: any) => void>> = new Map()

    constructor(config: Partial<CacheConfig> = {}) {
        this.config = { ...DEFAULT_CONFIG, ...config }
    }

    /**
     * Obtiene datos del caché
     * Retorna inmediatamente si hay datos (frescos o stale)
     */
    get<T>(key: string): { data: T | null; isStale: boolean; isFresh: boolean } {
        const entry = this.cache.get(key)
        
        if (!entry) {
            return { data: null, isStale: false, isFresh: false }
        }

        const now = Date.now()
        const age = now - entry.timestamp
        const isFresh = age < this.config.ttl
        const isStale = age >= this.config.ttl && age < this.config.ttl + this.config.staleWhileRevalidate

        return {
            data: entry.data as T,
            isStale: !isFresh && isStale,
            isFresh,
        }
    }

    /**
     * Guarda datos en caché
     */
    set<T>(key: string, data: T, etag?: string): void {
        this.cache.set(key, {
            data,
            timestamp: Date.now(),
            etag,
        })

        // Notificar a suscriptores
        const subs = this.subscribers.get(key)
        if (subs) {
            subs.forEach(callback => callback(data))
        }
    }

    /**
     * Marca una key como en proceso de revalidación
     */
    startRevalidation(key: string): boolean {
        if (this.revalidating.has(key)) {
            return false // Ya se está revalidando
        }
        this.revalidating.add(key)
        return true
    }

    /**
     * Termina el proceso de revalidación
     */
    endRevalidation(key: string): void {
        this.revalidating.delete(key)
    }

    /**
     * Suscribirse a cambios de una key
     */
    subscribe(key: string, callback: (data: any) => void): () => void {
        if (!this.subscribers.has(key)) {
            this.subscribers.set(key, new Set())
        }
        this.subscribers.get(key)!.add(callback)

        return () => {
            this.subscribers.get(key)?.delete(callback)
        }
    }

    /**
     * Invalida una key específica
     */
    invalidate(key: string): void {
        this.cache.delete(key)
    }

    /**
     * Invalida todo el caché
     */
    invalidateAll(): void {
        this.cache.clear()
    }

    /**
     * Precarga datos en caché
     */
    preload<T>(key: string, data: T): void {
        this.set(key, data)
    }

    /**
     * Obtiene estadísticas del caché
     */
    getStats(): { size: number; keys: string[] } {
        return {
            size: this.cache.size,
            keys: Array.from(this.cache.keys()),
        }
    }
}

// Singleton global
export const propertiesCache = new PropertiesCache()

// Keys predefinidas
export const CACHE_KEYS = {
    ALL_PROPERTIES: 'properties:all',
    PROPERTY_BY_ID: (id: number) => `properties:${id}`,
    PROPERTIES_BY_CATEGORY: (cat: string) => `properties:category:${cat}`,
    PROPERTIES_BY_ASESOR: (email: string) => `properties:asesor:${email}`,
    PROPERTIES_BY_USUARIO: (usuarioId: string) => `properties:usuario:${usuarioId}`,
    FEATURED_PROPERTIES: 'properties:featured',
}

/**
 * Hook helper para usar con el caché
 * Implementa stale-while-revalidate pattern
 */
export async function getCachedOrFetch<T>(
    key: string,
    fetcher: () => Promise<T>,
    options: { forceRefresh?: boolean } = {}
): Promise<T> {
    const cached = propertiesCache.get<T>(key)

    // Si hay datos frescos y no se fuerza refresh, retornar inmediatamente
    if (cached.isFresh && !options.forceRefresh) {
        return cached.data!
    }

    // Si hay datos stale, retornarlos pero revalidar en background
    if (cached.isStale && !options.forceRefresh) {
        // Revalidar en background si no se está haciendo ya
        if (propertiesCache.startRevalidation(key)) {
            fetcher()
                .then(data => {
                    propertiesCache.set(key, data)
                })
                .catch(console.error)
                .finally(() => {
                    propertiesCache.endRevalidation(key)
                })
        }
        return cached.data!
    }

    // No hay datos o se fuerza refresh - fetch síncrono
    try {
        const data = await fetcher()
        propertiesCache.set(key, data)
        return data
    } catch (error) {
        // Si falla pero hay datos stale, usarlos como fallback
        if (cached.data) {
            console.warn('Using stale cache due to fetch error:', error)
            return cached.data
        }
        throw error
    }
}
