import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { BROKER_BUCKET, esRutaDelBroker, rutaArchivo } from '@/lib/broker-archivos'
import { CATEGORIAS_RECURSO } from '@/lib/broker-recursos'
import { brokerDeSesion } from '@/lib/sesion'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false, autoRefreshToken: false } },
)

const SIGNED_URL_SECONDS = 60 * 60

const texto = (value: unknown) => typeof value === 'string' ? value.trim() : ''

function ligaValida(liga: string) {
  try {
    return ['http:', 'https:'].includes(new URL(liga).protocol)
  } catch {
    return false
  }
}

export async function GET() {
  const email = await brokerDeSesion()
  if (!email) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const { data, error } = await supabaseAdmin
    .from('broker_recursos')
    .select('*')
    .eq('broker_email', email)
    .order('created_at', { ascending: false })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const rows = data || []
  const paths = rows.map(r => r.archivo_path).filter(Boolean)
  const signed = paths.length
    ? (await supabaseAdmin.storage.from(BROKER_BUCKET).createSignedUrls(paths, SIGNED_URL_SECONDS)).data || []
    : []
  const urlByPath = new Map(signed.map(s => [s.path, s.signedUrl]))

  return NextResponse.json({
    recursos: rows.map(r => ({ ...r, archivo_url: urlByPath.get(r.archivo_path) || null })),
  })
}

// POST { action: 'upload-url', fileName } → URL firmada para subir el archivo directo a Storage
// POST { categoria, banco, titulo, descripcion, liga, vigente_hasta, archivoPath, archivoNombre, archivoTipo } → registra el recurso
export async function POST(request: Request) {
  try {
    const email = await brokerDeSesion()
    if (!email) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    const body = await request.json()

    if (body.action === 'upload-url') {
      const path = rutaArchivo(email, 'recursos', texto(body.fileName))
      const { data, error } = await supabaseAdmin.storage.from(BROKER_BUCKET).createSignedUploadUrl(path)
      if (error) return NextResponse.json({ error: error.message }, { status: 500 })
      return NextResponse.json({ path: data.path, token: data.token })
    }

    const titulo = texto(body.titulo)
    const liga = texto(body.liga)
    const archivoPath = texto(body.archivoPath)
    const vigente = texto(body.vigente_hasta)
    if (!titulo) return NextResponse.json({ error: 'El título es obligatorio.' }, { status: 400 })
    if (!liga && !archivoPath) return NextResponse.json({ error: 'Adjunta un archivo o una liga.' }, { status: 400 })
    if (liga && !ligaValida(liga)) return NextResponse.json({ error: 'La liga no es válida.' }, { status: 400 })
    if (archivoPath && !esRutaDelBroker(email, archivoPath)) return NextResponse.json({ error: 'Archivo inválido.' }, { status: 400 })

    const { data, error } = await supabaseAdmin
      .from('broker_recursos')
      .insert({
        broker_email: email,
        categoria: CATEGORIAS_RECURSO.some(c => c.id === body.categoria) ? body.categoria : 'formato',
        banco: texto(body.banco),
        titulo,
        descripcion: texto(body.descripcion),
        liga,
        archivo_path: archivoPath,
        archivo_nombre: texto(body.archivoNombre),
        archivo_tipo: texto(body.archivoTipo),
        vigente_hasta: /^\d{4}-\d{2}-\d{2}$/.test(vigente) ? vigente : null,
      })
      .select()
      .single()
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    const firmada = archivoPath
      ? (await supabaseAdmin.storage.from(BROKER_BUCKET).createSignedUrl(archivoPath, SIGNED_URL_SECONDS)).data?.signedUrl
      : null
    return NextResponse.json({ recurso: { ...data, archivo_url: firmada || null } }, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'No se pudo guardar el recurso.' }, { status: 400 })
  }
}

export async function DELETE(request: Request) {
  const email = await brokerDeSesion()
  const id = Number(new URL(request.url).searchParams.get('id'))
  if (!email) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  if (!Number.isInteger(id)) return NextResponse.json({ error: 'Recurso inválido.' }, { status: 400 })

  const { data, error } = await supabaseAdmin
    .from('broker_recursos')
    .delete()
    .eq('id', id)
    .eq('broker_email', email)
    .select('archivo_path')
    .single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  if (data?.archivo_path) await supabaseAdmin.storage.from(BROKER_BUCKET).remove([data.archivo_path])
  return NextResponse.json({ success: true })
}
