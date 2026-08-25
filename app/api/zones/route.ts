import { NextResponse } from 'next/server'

import { propiedades } from '@/data/propiedades'

function normalizeKey(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
}

function extractZoneFromUbicacion(ubicacion: string): string {
  const zone = ubicacion.split(',')[0]?.trim()
  return zone || ubicacion.trim()
}

export async function GET() {
  const zonesMap = new Map<string, string>()

  for (const p of propiedades) {
    const zone = extractZoneFromUbicacion(p.ubicacion)
    const key = normalizeKey(zone)
    if (zone && !zonesMap.has(key)) zonesMap.set(key, zone)
  }

  try {
    const { supabaseOptimized } = await import('@/lib/supabase/optimized-client')

    const { data, error } = await supabaseOptimized
      .from('propiedades')
      .select('ubicacion')
      .limit(2000)

    if (error) {
      throw error
    }

    for (const row of data || []) {
      const zone = extractZoneFromUbicacion((row as any).ubicacion || '')
      const key = normalizeKey(zone)
      if (zone && !zonesMap.has(key)) zonesMap.set(key, zone)
    }
  } catch {
    // fallback: solo zonas del mock data
  }

  const zones = Array.from(zonesMap.values()).sort((a, b) => a.localeCompare(b, 'es'))

  return NextResponse.json({ zones })
}
