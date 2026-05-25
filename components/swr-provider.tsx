'use client'

import { SWRConfig } from 'swr'
import { ReactNode, useEffect } from 'react'
import { prefetchProperties } from '@/hooks/use-properties'

interface SWRProviderProps {
    children: ReactNode
}

/**
 * Provider de SWR con configuración global optimizada
 * para alto rendimiento y alta concurrencia
 */
export function SWRProvider({ children }: SWRProviderProps) {
    // Prefetch de propiedades al montar
    useEffect(() => {
        prefetchProperties()
    }, [])

    return (
        <SWRConfig
            value={{
                // Configuración global optimizada
                revalidateOnFocus: false,
                revalidateOnReconnect: true,
                dedupingInterval: 5000,
                focusThrottleInterval: 30000,
                errorRetryCount: 3,
                errorRetryInterval: 1000,
                keepPreviousData: true,
                
                // Provider de caché personalizado para persistencia
                provider: () => new Map(),
                
                // Callback global de error
                onError: (error, key) => {
                    console.error(`SWR Error [${key}]:`, error)
                },
                
                // Callback de éxito para logging
                onSuccess: (data, key) => {
                    if (process.env.NODE_ENV === 'development') {
                        console.log(`SWR Success [${key}]:`, Array.isArray(data) ? `${data.length} items` : 'loaded')
                    }
                },
            }}
        >
            {children}
        </SWRConfig>
    )
}
