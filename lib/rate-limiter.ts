/**
 * Sistema de Rate Limiting y Connection Pooling
 * Diseñado para soportar 100+ usuarios cargando contenido simultáneamente
 * y 50,000+ usuarios navegando al mismo tiempo
 */

interface RateLimitConfig {
    maxRequests: number
    windowMs: number
}

interface RequestRecord {
    count: number
    resetTime: number
}

/**
 * Rate Limiter en memoria para el cliente
 * Previene sobrecarga de requests al servidor
 */
class ClientRateLimiter {
    private requests: Map<string, RequestRecord> = new Map()
    private config: RateLimitConfig

    constructor(config: RateLimitConfig = { maxRequests: 100, windowMs: 60000 }) {
        this.config = config
    }

    /**
     * Verifica si una request está permitida
     */
    isAllowed(key: string): boolean {
        const now = Date.now()
        const record = this.requests.get(key)

        if (!record || now > record.resetTime) {
            this.requests.set(key, {
                count: 1,
                resetTime: now + this.config.windowMs,
            })
            return true
        }

        if (record.count >= this.config.maxRequests) {
            return false
        }

        record.count++
        return true
    }

    /**
     * Obtiene el tiempo restante hasta el reset
     */
    getResetTime(key: string): number {
        const record = this.requests.get(key)
        if (!record) return 0
        return Math.max(0, record.resetTime - Date.now())
    }

    /**
     * Limpia records expirados
     */
    cleanup(): void {
        const now = Date.now()
        for (const [key, record] of this.requests.entries()) {
            if (now > record.resetTime) {
                this.requests.delete(key)
            }
        }
    }
}

/**
 * Request Queue para manejar concurrencia
 * Evita saturar el servidor con demasiadas requests simultáneas
 */
class RequestQueue {
    private queue: Array<() => Promise<any>> = []
    private running: number = 0
    private maxConcurrent: number

    constructor(maxConcurrent: number = 10) {
        this.maxConcurrent = maxConcurrent
    }

    /**
     * Agrega una request a la cola
     */
    async add<T>(request: () => Promise<T>): Promise<T> {
        return new Promise((resolve, reject) => {
            const execute = async () => {
                this.running++
                try {
                    const result = await request()
                    resolve(result)
                } catch (error) {
                    reject(error)
                } finally {
                    this.running--
                    this.processNext()
                }
            }

            if (this.running < this.maxConcurrent) {
                execute()
            } else {
                this.queue.push(execute)
            }
        })
    }

    private processNext(): void {
        if (this.queue.length > 0 && this.running < this.maxConcurrent) {
            const next = this.queue.shift()
            if (next) next()
        }
    }

    /**
     * Obtiene estadísticas de la cola
     */
    getStats(): { running: number; queued: number } {
        return {
            running: this.running,
            queued: this.queue.length,
        }
    }
}

/**
 * Debouncer para requests frecuentes
 */
class RequestDebouncer {
    private timers: Map<string, NodeJS.Timeout> = new Map()
    private pending: Map<string, { resolve: (value: any) => void; reject: (error: any) => void }[]> = new Map()

    /**
     * Debounce una request
     */
    debounce<T>(key: string, request: () => Promise<T>, delayMs: number = 300): Promise<T> {
        return new Promise((resolve, reject) => {
            // Agregar a pending
            if (!this.pending.has(key)) {
                this.pending.set(key, [])
            }
            this.pending.get(key)!.push({ resolve, reject })

            // Cancelar timer anterior
            const existingTimer = this.timers.get(key)
            if (existingTimer) {
                clearTimeout(existingTimer)
            }

            // Crear nuevo timer
            const timer = setTimeout(async () => {
                const callbacks = this.pending.get(key) || []
                this.pending.delete(key)
                this.timers.delete(key)

                try {
                    const result = await request()
                    callbacks.forEach(cb => cb.resolve(result))
                } catch (error) {
                    callbacks.forEach(cb => cb.reject(error))
                }
            }, delayMs)

            this.timers.set(key, timer)
        })
    }

    /**
     * Cancela un debounce pendiente
     */
    cancel(key: string): void {
        const timer = this.timers.get(key)
        if (timer) {
            clearTimeout(timer)
            this.timers.delete(key)
        }
        this.pending.delete(key)
    }
}

// Instancias singleton
export const rateLimiter = new ClientRateLimiter({
    maxRequests: 100, // 100 requests por minuto por cliente
    windowMs: 60000,
})

export const requestQueue = new RequestQueue(10) // Máximo 10 requests concurrentes

export const requestDebouncer = new RequestDebouncer()

/**
 * Wrapper para requests con rate limiting y queue
 */
export async function throttledRequest<T>(
    key: string,
    request: () => Promise<T>,
    options: { debounce?: number } = {}
): Promise<T> {
    // Verificar rate limit
    if (!rateLimiter.isAllowed(key)) {
        const resetTime = rateLimiter.getResetTime(key)
        throw new Error(`Rate limit exceeded. Try again in ${Math.ceil(resetTime / 1000)} seconds.`)
    }

    // Aplicar debounce si se especifica
    if (options.debounce) {
        return requestDebouncer.debounce(key, () => requestQueue.add(request), options.debounce)
    }

    // Agregar a la cola
    return requestQueue.add(request)
}

// Limpiar rate limiter periódicamente
if (typeof window !== 'undefined') {
    setInterval(() => {
        rateLimiter.cleanup()
    }, 60000) // Cada minuto
}
