import { scryptSync, timingSafeEqual } from 'crypto'
import { cookies } from 'next/headers'
import { users as internalUsers } from '@/data/internal-users'
import { PASSWORD_HASHES } from '@/lib/credenciales-internas'
import { COOKIE_SESION, DURACION_SESION_SEGUNDOS, crearToken, leerToken, type Sesion } from '@/lib/sesion-token'

export const usuarioInterno = (email: string) => internalUsers.find(u => u.email.toLowerCase() === email)

export function credencialesValidas(email: string, password: string) {
  const guardado = PASSWORD_HASHES[email]
  if (!guardado) return false
  const [salt, hash] = guardado.split(':')
  return timingSafeEqual(scryptSync(password, salt, 64), Buffer.from(hash, 'hex'))
}

export async function abrirSesion(sesion: Sesion) {
  const store = await cookies()
  store.set(COOKIE_SESION, await crearToken(sesion), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: DURACION_SESION_SEGUNDOS,
  })
}

export async function cerrarSesion() {
  const store = await cookies()
  store.delete(COOKIE_SESION)
}

/** La identidad sale de la cookie firmada, nunca de lo que mande el navegador. */
export async function sesionActual() {
  const store = await cookies()
  return leerToken(store.get(COOKIE_SESION)?.value)
}

export async function brokerDeSesion() {
  const sesion = await sesionActual()
  return sesion?.role === 'broker' ? sesion.email : null
}
