import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { BROKER_BUCKET, esRutaDelBroker, rutaArchivo } from '@/lib/broker-archivos'
import { brokerDeSesion } from '@/lib/sesion'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false, autoRefreshToken: false } },
)

const CAMPOS = ['nombre_completo', 'cargo', 'empresa', 'telefono', 'whatsapp', 'correo_contacto', 'semblanza'] as const
const SIGNED_URL_SECONDS = 60 * 60

async function conFotoFirmada(perfil: Record<string, unknown>) {
  const path = typeof perfil.foto_path === 'string' ? perfil.foto_path : ''
  const firmada = path ? (await supabaseAdmin.storage.from(BROKER_BUCKET).createSignedUrl(path, SIGNED_URL_SECONDS)).data?.signedUrl : null
  return { ...perfil, foto_url: firmada || null }
}

export async function GET() {
  const email = await brokerDeSesion()
  if (!email) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const { data, error } = await supabaseAdmin.from('broker_perfiles').select('*').eq('broker_email', email).maybeSingle()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ perfil: data ? await conFotoFirmada(data) : null })
}

// POST { action: 'upload-url', fileName } → URL firmada para subir la foto directo a Storage
export async function POST(request: Request) {
  try {
    const email = await brokerDeSesion()
    if (!email) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    const { action, fileName } = await request.json()
    if (action !== 'upload-url') return NextResponse.json({ error: 'Acción inválida.' }, { status: 400 })

    const path = rutaArchivo(email, 'perfil', typeof fileName === 'string' ? fileName : 'foto')
    const { data, error } = await supabaseAdmin.storage.from(BROKER_BUCKET).createSignedUploadUrl(path)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ path: data.path, token: data.token })
  } catch {
    return NextResponse.json({ error: 'No se pudo preparar la foto.' }, { status: 400 })
  }
}

export async function PUT(request: Request) {
  try {
    const email = await brokerDeSesion()
    if (!email) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    const body = await request.json()

    const cambios: Record<string, string> = {}
    for (const campo of CAMPOS) {
      if (typeof body[campo] === 'string') cambios[campo] = body[campo].trim()
    }
    const { data: anterior } = await supabaseAdmin.from('broker_perfiles').select('foto_path').eq('broker_email', email).maybeSingle()
    if (typeof body.foto_path === 'string') {
      if (body.foto_path && !esRutaDelBroker(email, body.foto_path)) return NextResponse.json({ error: 'Foto inválida.' }, { status: 400 })
      cambios.foto_path = body.foto_path
    }

    const { data, error } = await supabaseAdmin
      .from('broker_perfiles')
      .upsert({ ...cambios, broker_email: email, updated_at: new Date().toISOString() })
      .select()
      .single()
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    if (anterior?.foto_path && anterior.foto_path !== data.foto_path) {
      await supabaseAdmin.storage.from(BROKER_BUCKET).remove([anterior.foto_path])
    }
    return NextResponse.json({ perfil: await conFotoFirmada(data) })
  } catch {
    return NextResponse.json({ error: 'No se pudo guardar el perfil.' }, { status: 400 })
  }
}
