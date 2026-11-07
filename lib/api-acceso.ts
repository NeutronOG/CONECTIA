import { isSuperUser } from '@/lib/super-users'
import type { Sesion } from '@/lib/sesion-token'

// Quién puede llamar cada ruta de /api. Lo que no aparezca aquí exige sesión: denegar por defecto.
const ADMIN = ['admin']
const EQUIPO = ['admin', 'asesor', 'empresa']

// Las rutas de n8n, Telegram y el webhook de Stripe validan su propio secreto.
const PUBLICAS: { ruta: string; metodos?: string[] }[] = [
  { ruta: '/api/auth/sesion' },
  { ruta: '/api/propiedades', metodos: ['GET'] },
  { ruta: '/api/anuncios' },
  { ruta: '/api/contacto-asesor' },
  { ruta: '/api/exchange-rate' },
  { ruta: '/api/zones' },
  { ruta: '/api/places' },
  { ruta: '/api/ai/chat' },
  { ruta: '/api/translate-property' },
  { ruta: '/api/stripe' },
  { ruta: '/api/telegram' },
  { ruta: '/api/n8n' },
]

// La primera coincidencia gana: las rutas específicas van antes que su prefijo.
const POR_ROL: { ruta: string; roles: string[]; metodos?: string[] }[] = [
  { ruta: '/api/admin/propiedades', roles: [...ADMIN, 'fotografo'], metodos: ['GET'] },
  { ruta: '/api/admin', roles: ADMIN },
  { ruta: '/api/migrar-solicitudes-completadas', roles: ADMIN },
  { ruta: '/api/comprobantes', roles: ADMIN },
  { ruta: '/api/audit-log', roles: ADMIN, metodos: ['GET'] },
  { ruta: '/api/asesor', roles: EQUIPO },
  { ruta: '/api/calendario', roles: EQUIPO },
  { ruta: '/api/fotografo', roles: [...ADMIN, 'fotografo'] },
  { ruta: '/api/solicitudes-fotografo', roles: [...EQUIPO, 'fotografo'] },
  { ruta: '/api/solicitudes-propiedad', roles: [...EQUIPO, 'fotografo'] },
  { ruta: '/api/storage', roles: [...EQUIPO, 'fotografo'] },
  { ruta: '/api/broker', roles: ['broker'] },
]

const coincide = (pathname: string, ruta: string) => pathname === ruta || pathname.startsWith(`${ruta}/`)
const aplica = (regla: { ruta: string; metodos?: string[] }, pathname: string, metodo: string) =>
  coincide(pathname, regla.ruta) && (!regla.metodos || regla.metodos.includes(metodo))

export const esRutaPublica = (pathname: string, metodo: string) => PUBLICAS.some(r => aplica(r, pathname, metodo))

export function tieneAcceso(sesion: Sesion, pathname: string, metodo: string) {
  const regla = POR_ROL.find(r => aplica(r, pathname, metodo))
  if (!regla) return true
  return regla.roles.includes(sesion.role) || (regla.roles.includes('admin') && isSuperUser(sesion))
}

// Peticiones por minuto, por IP. Protege contra fuerza bruta y abuso de costos (IA, mapas, correo).
export const LIMITES: { ruta: string; porMinuto: number }[] = [
  { ruta: '/api/auth/sesion', porMinuto: 10 },
  { ruta: '/api/contacto-asesor', porMinuto: 5 },
  { ruta: '/api/stripe/create-checkout-session', porMinuto: 10 },
  { ruta: '/api/ai/chat', porMinuto: 20 },
  { ruta: '/api/translate-property', porMinuto: 30 },
  { ruta: '/api/places', porMinuto: 60 },
]

export const limiteDe = (pathname: string) => LIMITES.find(l => coincide(pathname, l.ruta))?.porMinuto
