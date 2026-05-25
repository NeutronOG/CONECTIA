import { useState, useEffect } from 'react'
import useSWR from 'swr'
import { supabase } from '@/lib/supabase/client'
import type { Propiedad } from '@/data/propiedades'

// Fetcher via API route (bypasses RLS using service role key on server)
const fetchPropertiesFromAPI = async (): Promise<Propiedad[]> => {
  try {
    const res = await fetch('/api/propiedades')
    if (!res.ok) {
      console.error('Error fetching properties API:', res.status, res.statusText)
      return []
    }
    const json = await res.json()
    return json.propiedades || []
  } catch (error) {
    console.error('Error fetching properties:', error)
    return []
  }
}

export function usePropertiesStatic() {
  const [realtimeUpdates, setRealtimeUpdates] = useState<Map<number, Propiedad>>(new Map())

  // Cargar datos via API route con SWR
  const { data: supabaseProperties = [], isLoading, error, mutate } = useSWR(
    'properties-api',
    fetchPropertiesFromAPI,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      dedupingInterval: 30000, // 30 segundos
      focusThrottleInterval: 300000, // 5 minutos
    }
  )

  // Suscribirse a cambios en tiempo real
  useEffect(() => {
    const channel = supabase
      .channel('propiedades_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'propiedades' },
        async (payload) => {
          console.log('🔄 Realtime update received:', payload.eventType)

          if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
            const newProp = payload.new as any
            const formattedProp: Propiedad = {
              id: Number(newProp.id),
              usuarioId: newProp.usuario_id || undefined,
              titulo: newProp.titulo,
              ubicacion: newProp.ubicacion,
              precio: Number(newProp.precio),
              precioTexto: newProp.precio_texto,
              tipo: newProp.tipo,
              habitaciones: newProp.habitaciones,
              banos: newProp.banos,
              area: newProp.area,
              areaTexto: newProp.area_texto,
              imagen: newProp.imagen || '',
              descripcion: newProp.descripcion || '',
              caracteristicas: newProp.caracteristicas || [],
              status: newProp.status,
              categoria: newProp.categoria,
              fechaPublicacion: newProp.fecha_publicacion,
              tourVirtual: newProp.tour_virtual || undefined,
              galeria: newProp.galeria || undefined,
            }

            setRealtimeUpdates((prev) => {
              const updated = new Map(prev)
              updated.set(newProp.id, formattedProp)
              return updated
            })
            
            // Revalidar datos de SWR para sincronizar
            mutate()
          } else if (payload.eventType === 'DELETE') {
            setRealtimeUpdates((prev) => {
              const updated = new Map(prev)
              updated.delete(payload.old.id)
              return updated
            })
            mutate()
          }
        }
      )
      .subscribe()

    return () => {
      channel.unsubscribe()
    }
  }, [mutate])

  // Combinar datos de Supabase con actualizaciones en tiempo real
  const properties = supabaseProperties.map((prop) => realtimeUpdates.get(prop.id) || prop)

  // Agregar nuevas propiedades que llegaron por realtime
  const allProperties = [
    ...properties,
    ...Array.from(realtimeUpdates.values()).filter(
      (prop) => !supabaseProperties.find((p) => p.id === prop.id)
    ),
  ]

  return {
    properties: allProperties,
    isLoading,
    error,
    refresh: () => mutate(),
    realtimeCount: realtimeUpdates.size,
  }
}

// Fetcher para cargar una propiedad específica por ID via API
const fetchPropertyById = async (id: number): Promise<Propiedad | null> => {
  try {
    const res = await fetch(`/api/propiedades?id=${id}`)
    if (!res.ok) {
      console.error('Error fetching property:', res.status)
      return null
    }
    const json = await res.json()
    return json.propiedad || null
  } catch (error) {
    console.error('Error fetching property:', error)
    return null
  }
}

// Hook para obtener una propiedad específica - carga directa sin depender de todas las propiedades
export function usePropertyStatic(id: number) {
  const { data: property, isLoading, error } = useSWR(
    id ? `property-${id}` : null,
    () => fetchPropertyById(id),
    {
      revalidateOnFocus: false,
      dedupingInterval: 60000,
    }
  )

  return {
    property,
    isLoading,
    error,
  }
}

// Hook para obtener propiedades por categoría
export function usePropertiesByCategory(categoria: string) {
  const { properties, isLoading } = usePropertiesStatic()
  const filtered = properties.filter((p) => p.categoria === categoria)

  return {
    properties: filtered,
    isLoading,
  }
}
