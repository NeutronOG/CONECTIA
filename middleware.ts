import { NextResponse, type NextRequest } from 'next/server'
import { esRutaPublica, limiteDe, tieneAcceso } from '@/lib/api-acceso'
import { COOKIE_SESION, leerToken } from '@/lib/sesion-token'

export const config = { matcher: '/api/:path*' }

const VENTANA_MS = 60_000
const MAX_CLAVES = 10_000
const contadores = new Map<string, { total: number; desde: number }>()

// Límite por instancia: frena abusos sencillos; los ataques distribuidos son trabajo del firewall de Vercel.
function excedeLimite(clave: string, porMinuto: number) {
  const ahora = Date.now()
  if (contadores.size > MAX_CLAVES) contadores.clear()
  const actual = contadores.get(clave)
  if (!actual || ahora - actual.desde > VENTANA_MS) {
    contadores.set(clave, { total: 1, desde: ahora })
    return false
  }
  actual.total += 1
  return actual.total > porMinuto
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const metodo = request.method
  if (metodo === 'OPTIONS') return NextResponse.next()

  const porMinuto = limiteDe(pathname)
  if (porMinuto && metodo !== 'GET') {
    const ip = request.headers.get('x-real-ip') || request.headers.get('x-forwarded-for')?.split(',')[0].trim() || 'desconocida'
    if (excedeLimite(`${pathname}|${ip}`, porMinuto)) {
      return NextResponse.json({ error: 'Demasiados intentos. Espera un minuto.' }, { status: 429 })
    }
  }

  if (esRutaPublica(pathname, metodo)) return NextResponse.next()

  const sesion = await leerToken(request.cookies.get(COOKIE_SESION)?.value)
  if (!sesion) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  if (!tieneAcceso(sesion, pathname, metodo)) return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
  return NextResponse.next()
}
