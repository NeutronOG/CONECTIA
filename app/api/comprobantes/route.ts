import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { SUPER_USER_EMAILS } from '@/lib/super-users'
import { users as internalUsers } from '@/data/internal-users'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false, autoRefreshToken: false } },
)

const BUCKET = 'comprobantes'
const TIPOS = ['ingreso', 'egreso', 'comision', 'transferencia', 'otro'] as const
const SIGNED_URL_SECONDS = 60 * 60

// Comprobantes: solo administradores y Lizzie
function canManage(email: string) {
  if (SUPER_USER_EMAILS.includes(email)) return true
  return internalUsers.some(u => u.email.toLowerCase() === email && u.role === 'admin')
}

function readEmail(value: unknown) {
  return typeof value === 'string' ? value.trim().toLowerCase() : ''
}

function safeFileName(name: string) {
  const clean = name.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-zA-Z0-9._-]+/g, '-')
  return clean.slice(-80) || 'archivo'
}

export async function GET(request: Request) {
  const email = readEmail(new URL(request.url).searchParams.get('email'))
  if (!canManage(email)) return NextResponse.json({ error: 'No autorizado' }, { status: 403 })

  const { data, error } = await supabaseAdmin
    .from('comprobantes')
    .select('*')
    .order('fecha', { ascending: false })
    .order('created_at', { ascending: false })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const rows = data || []
  const paths = rows.map(r => r.archivo_path)
  const signed = paths.length
    ? (await supabaseAdmin.storage.from(BUCKET).createSignedUrls(paths, SIGNED_URL_SECONDS)).data || []
    : []
  const urlByPath = new Map(signed.map(s => [s.path, s.signedUrl]))

  return NextResponse.json({
    comprobantes: rows.map(r => ({ ...r, archivo_url: urlByPath.get(r.archivo_path) || null })),
  })
}

// POST { action: 'upload-url', email, fileName } → URL firmada para subir el archivo directo a Storage
// POST { email, nombre, concepto, tipo, monto, fecha, notas, archivoPath, archivoNombre, archivoTipo } → registra el comprobante
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const email = readEmail(body.email)
    if (!canManage(email)) return NextResponse.json({ error: 'No autorizado' }, { status: 403 })

    if (body.action === 'upload-url') {
      const fileName = typeof body.fileName === 'string' ? body.fileName : 'archivo'
      const path = `${new Date().toISOString().slice(0, 7)}/${Date.now()}-${safeFileName(fileName)}`
      const { data, error } = await supabaseAdmin.storage.from(BUCKET).createSignedUploadUrl(path)
      if (error) return NextResponse.json({ error: error.message }, { status: 500 })
      return NextResponse.json({ path: data.path, token: data.token })
    }

    const concepto = typeof body.concepto === 'string' ? body.concepto.trim() : ''
    const archivoPath = typeof body.archivoPath === 'string' ? body.archivoPath : ''
    const tipo = TIPOS.includes(body.tipo) ? body.tipo : 'otro'
    const monto = body.monto === '' || body.monto === null || body.monto === undefined ? null : Number(body.monto)
    const fecha = typeof body.fecha === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(body.fecha) ? body.fecha : null

    if (!concepto || !archivoPath || !fecha) {
      return NextResponse.json({ error: 'Completa concepto, fecha y archivo.' }, { status: 400 })
    }
    if (monto !== null && (!Number.isFinite(monto) || monto < 0)) {
      return NextResponse.json({ error: 'El monto no es válido.' }, { status: 400 })
    }

    const { data, error } = await supabaseAdmin
      .from('comprobantes')
      .insert({
        concepto,
        tipo,
        monto,
        fecha,
        notas: typeof body.notas === 'string' ? body.notas.trim() : '',
        archivo_path: archivoPath,
        archivo_nombre: typeof body.archivoNombre === 'string' ? body.archivoNombre : '',
        archivo_tipo: typeof body.archivoTipo === 'string' ? body.archivoTipo : '',
        subido_por_email: email,
        subido_por_nombre: typeof body.nombre === 'string' ? body.nombre.trim() : email,
      })
      .select()
      .single()
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ comprobante: data }, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'No se pudo guardar el comprobante.' }, { status: 400 })
  }
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url)
  const id = Number(searchParams.get('id'))
  const email = readEmail(searchParams.get('email'))
  if (!canManage(email)) return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
  if (!Number.isInteger(id)) return NextResponse.json({ error: 'Comprobante inválido.' }, { status: 400 })

  const { data, error } = await supabaseAdmin.from('comprobantes').delete().eq('id', id).select('archivo_path').single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  if (data?.archivo_path) await supabaseAdmin.storage.from(BUCKET).remove([data.archivo_path])
  return NextResponse.json({ success: true })
}
