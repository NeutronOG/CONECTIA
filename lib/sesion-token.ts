// Token de sesión firmado. Usa Web Crypto porque también corre en el middleware (edge).
export const COOKIE_SESION = 'conectia_sesion'
export const DURACION_SESION_SEGUNDOS = 60 * 60 * 24 * 7

export interface Sesion {
  email: string
  role: string
}

const enBase64Url = (bytes: Uint8Array) =>
  btoa(String.fromCharCode(...bytes)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')

const deBase64Url = (texto: string) =>
  Uint8Array.from(atob(texto.replace(/-/g, '+').replace(/_/g, '/')), c => c.charCodeAt(0))

const clave = () => crypto.subtle.importKey(
  'raw',
  new TextEncoder().encode(`${process.env.SUPABASE_SERVICE_ROLE_KEY}:sesion-v1`),
  { name: 'HMAC', hash: 'SHA-256' },
  false,
  ['sign', 'verify'],
)

export async function crearToken({ email, role }: Sesion) {
  const datos = enBase64Url(new TextEncoder().encode(JSON.stringify({ email, role, exp: Date.now() + DURACION_SESION_SEGUNDOS * 1000 })))
  const firma = await crypto.subtle.sign('HMAC', await clave(), new TextEncoder().encode(datos))
  return `${datos}.${enBase64Url(new Uint8Array(firma))}`
}

export async function leerToken(token: string | undefined): Promise<Sesion | null> {
  const [datos, firma] = token?.split('.') ?? []
  if (!datos || !firma) return null
  try {
    const valida = await crypto.subtle.verify('HMAC', await clave(), deBase64Url(firma), new TextEncoder().encode(datos))
    if (!valida) return null
    const { email, role, exp } = JSON.parse(new TextDecoder().decode(deBase64Url(datos)))
    return typeof email === 'string' && typeof role === 'string' && Date.now() < exp ? { email, role } : null
  } catch {
    return null
  }
}
