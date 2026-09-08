import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { isSuperUser } from '@/lib/super-users'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false, autoRefreshToken: false } },
)

const EVENT_TYPES = ['renta', 'venta', 'apartado', 'visita', 'reunion', 'otro'] as const
type EventType = (typeof EVENT_TYPES)[number]

function isEventType(value: unknown): value is EventType {
  return typeof value === 'string' && EVENT_TYPES.includes(value as EventType)
}

function validDate(value: unknown) {
  return typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)
}

export async function GET(request: Request) {
  const email = new URL(request.url).searchParams.get('email')?.trim().toLowerCase()
  if (!email) return NextResponse.json({ error: 'Se requiere el correo del asesor' }, { status: 400 })

  let query = supabaseAdmin.from('calendario').select('*').order('fecha').order('hora')
  if (!isSuperUser({ email })) query = query.eq('asesor_email', email)
  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ events: data || [], canViewAll: isSuperUser({ email }) })
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : ''
    const titulo = typeof body.titulo === 'string' ? body.titulo.trim() : ''
    const mesesAntes = Number(body.mesesAntes ?? 3)

    if (!email || !titulo || !validDate(body.fecha) || !isEventType(body.tipo)) {
      return NextResponse.json({ error: 'Completa título, fecha y tipo de evento.' }, { status: 400 })
    }
    if (!Number.isInteger(mesesAntes) || mesesAntes < 0 || mesesAntes > 12) {
      return NextResponse.json({ error: 'El recordatorio debe ser entre 0 y 12 meses antes.' }, { status: 400 })
    }

    const { data, error } = await supabaseAdmin
      .from('calendario')
      .insert({
        asesor_email: email,
        asesor_nombre: typeof body.nombre === 'string' ? body.nombre.trim() : email,
        titulo,
        fecha: body.fecha,
        hora: typeof body.hora === 'string' && /^\d{2}:\d{2}/.test(body.hora) ? body.hora : '09:00',
        tipo: body.tipo,
        descripcion: typeof body.descripcion === 'string' ? body.descripcion.trim() : '',
        meses_antes: mesesAntes,
      })
      .select()
      .single()
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ event: data }, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'No se pudo crear el evento.' }, { status: 400 })
  }
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url)
  const id = Number(searchParams.get('id'))
  const email = searchParams.get('email')?.trim().toLowerCase()
  if (!Number.isInteger(id) || !email) return NextResponse.json({ error: 'Evento inválido.' }, { status: 400 })

  let query = supabaseAdmin.from('calendario').delete().eq('id', id)
  if (!isSuperUser({ email })) query = query.eq('asesor_email', email)
  const { error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
