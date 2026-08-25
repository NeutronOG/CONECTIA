import { NextRequest, NextResponse } from 'next/server'

function normalizeKey(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
}

export async function GET(req: NextRequest) {
  const url = new URL(req.url)
  const input = (url.searchParams.get('input') || '').trim()

  if (!input) {
    return NextResponse.json({ suggestions: [] })
  }

  const apiKey =
    process.env.GOOGLE_MAPS_API_KEY ||
    process.env.GOOGLE_PLACES_API_KEY ||
    process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY

  if (!apiKey) {
    return NextResponse.json({ suggestions: [], error: 'missing_api_key' }, { status: 200 })
  }

  const endpoint = new URL('https://maps.googleapis.com/maps/api/place/autocomplete/json')
  endpoint.searchParams.set('input', input)
  endpoint.searchParams.set('language', 'es')
  endpoint.searchParams.set('components', 'country:mx')
  endpoint.searchParams.set('types', 'geocode')
  endpoint.searchParams.set('key', apiKey)

  try {
    const resp = await fetch(endpoint.toString(), {
      cache: 'no-store',
    })

    if (!resp.ok) {
      return NextResponse.json({ suggestions: [], error: `upstream_status_${resp.status}` }, { status: 200 })
    }

    const json = await resp.json()

    const map = new Map<string, string>()
    const predictions = Array.isArray(json?.predictions) ? json.predictions : []

    for (const p of predictions) {
      const mainText = p?.structured_formatting?.main_text || p?.description || ''
      const zone = String(mainText).trim()
      if (!zone) continue
      const key = normalizeKey(zone)
      if (!map.has(key)) map.set(key, zone)
    }

    return NextResponse.json({ suggestions: Array.from(map.values()) })
  } catch (e: any) {
    return NextResponse.json({ suggestions: [], error: e?.message || 'unknown_error' }, { status: 200 })
  }
}
