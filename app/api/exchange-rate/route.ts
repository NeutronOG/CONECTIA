import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const response = await fetch('https://api.frankfurter.dev/v2/rate/usd/mxn', {
      next: { revalidate: 86400 },
      signal: AbortSignal.timeout(8000),
    })
    if (!response.ok) throw new Error('Exchange rate unavailable')
    const data: unknown = await response.json()
    if (!data || typeof data !== 'object') throw new Error('Invalid exchange rate')
    const { rate, date } = data as Record<string, unknown>
    if (typeof rate !== 'number' || !Number.isFinite(rate) || rate <= 0 || typeof date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      throw new Error('Invalid exchange rate')
    }
    return NextResponse.json({ rate, date })
  } catch {
    return NextResponse.json({ error: 'Tipo de cambio no disponible' }, { status: 503 })
  }
}
