import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { abrirSesion, cerrarSesion, credencialesValidas, sesionActual, usuarioInterno } from '@/lib/sesion'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false, autoRefreshToken: false } },
)

const PAGINA_USUARIOS = 1000

async function idDeSupabase(email: string) {
  const { data } = await supabaseAdmin.auth.admin.listUsers({ perPage: PAGINA_USUARIOS })
  return data?.users.find(u => u.email?.toLowerCase() === email)?.id ?? null
}

export async function GET() {
  const sesion = await sesionActual()
  if (!sesion) return NextResponse.json({ error: 'Sesión no válida' }, { status: 401 })
  return NextResponse.json(sesion)
}

// POST { email, password } → usuario interno
// POST { accessToken } → cuenta de Supabase Auth; el rol sale de la tabla usuarios y nunca da acceso de admin
export async function POST(request: Request) {
  try {
    const body = await request.json()

    if (typeof body.accessToken === 'string') {
      const { data, error } = await supabaseAdmin.auth.getUser(body.accessToken)
      const email = data.user?.email?.toLowerCase()
      if (error || !data.user || !email || usuarioInterno(email)) {
        return NextResponse.json({ error: 'Credenciales inválidas' }, { status: 401 })
      }
      const { data: perfil } = await supabaseAdmin.from('usuarios').select('role').eq('id', data.user.id).maybeSingle()
      const role = perfil?.role && perfil.role !== 'admin' ? perfil.role : 'cliente'
      await abrirSesion({ email, role })
      return NextResponse.json({ success: true })
    }

    const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : ''
    const password = typeof body.password === 'string' ? body.password : ''
    const usuario = usuarioInterno(email)
    if (!usuario || !credencialesValidas(email, password)) {
      return NextResponse.json({ error: 'Credenciales inválidas' }, { status: 401 })
    }
    await abrirSesion({ email, role: usuario.role })
    return NextResponse.json({ userId: await idDeSupabase(email) })
  } catch {
    return NextResponse.json({ error: 'No se pudo iniciar sesión.' }, { status: 400 })
  }
}

export async function DELETE() {
  await cerrarSesion()
  return NextResponse.json({ success: true })
}
