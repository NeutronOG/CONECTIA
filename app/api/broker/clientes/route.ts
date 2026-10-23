import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { users as internalUsers } from '@/data/internal-users'
import { CHECKLIST_KEYS, ESTATUS_BANCARIO } from '@/lib/broker-checklist'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false, autoRefreshToken: false } },
)

const TEXT_FIELDS = ['cliente_nombre', 'cliente_email', 'cliente_telefono', 'propiedad', 'monto_credito', 'tipo_credito', 'notas', 'notaria', 'banco', 'avaluo'] as const
const DATE_FIELDS = ['fecha_firma', 'vencimiento'] as const

function readEmail(value: unknown) {
  return typeof value === 'string' ? value.trim().toLowerCase() : ''
}

// Cada broker solo ve y modifica sus propios clientes
function isBroker(email: string) {
  return internalUsers.some(u => u.email.toLowerCase() === email && u.role === 'broker')
}

function pickUpdates(body: Record<string, unknown>) {
  const updates: Record<string, unknown> = {}
  for (const field of TEXT_FIELDS) {
    if (typeof body[field] === 'string') updates[field] = (body[field] as string).trim()
  }
  if (body.checklist && typeof body.checklist === 'object' && !Array.isArray(body.checklist)) {
    const checklist = body.checklist as Record<string, unknown>
    updates.checklist = Object.fromEntries(
      CHECKLIST_KEYS
        .filter(id => typeof checklist[id] === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(checklist[id] as string))
        .map(id => [id, checklist[id]]),
    )
  }
  if (ESTATUS_BANCARIO.some(e => e.id === body.estatus)) updates.estatus = body.estatus
  for (const field of DATE_FIELDS) {
    const value = body[field]
    if (value === null || value === '') updates[field] = null
    else if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)) updates[field] = value
  }
  return updates
}

export async function GET(request: Request) {
  const email = readEmail(new URL(request.url).searchParams.get('email'))
  if (!isBroker(email)) return NextResponse.json({ error: 'No autorizado' }, { status: 403 })

  const { data, error } = await supabaseAdmin
    .from('broker_clientes')
    .select('*')
    .eq('broker_email', email)
    .order('updated_at', { ascending: false })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ clientes: data || [] })
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const email = readEmail(body.email)
    if (!isBroker(email)) return NextResponse.json({ error: 'No autorizado' }, { status: 403 })

    const updates = pickUpdates(body)
    if (!updates.cliente_nombre) return NextResponse.json({ error: 'El nombre del cliente es obligatorio.' }, { status: 400 })

    const { data, error } = await supabaseAdmin
      .from('broker_clientes')
      .insert({ ...updates, broker_email: email })
      .select()
      .single()
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ cliente: data }, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'No se pudo crear el cliente.' }, { status: 400 })
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json()
    const email = readEmail(body.email)
    const id = Number(body.id)
    if (!isBroker(email)) return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
    if (!Number.isInteger(id)) return NextResponse.json({ error: 'Cliente inválido.' }, { status: 400 })

    const { data, error } = await supabaseAdmin
      .from('broker_clientes')
      .update({ ...pickUpdates(body), updated_at: new Date().toISOString() })
      .eq('id', id)
      .eq('broker_email', email)
      .select()
      .single()
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ cliente: data })
  } catch {
    return NextResponse.json({ error: 'No se pudo actualizar el cliente.' }, { status: 400 })
  }
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url)
  const id = Number(searchParams.get('id'))
  const email = readEmail(searchParams.get('email'))
  if (!isBroker(email)) return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
  if (!Number.isInteger(id)) return NextResponse.json({ error: 'Cliente inválido.' }, { status: 400 })

  const { error } = await supabaseAdmin.from('broker_clientes').delete().eq('id', id).eq('broker_email', email)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
