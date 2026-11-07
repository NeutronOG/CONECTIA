import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false, autoRefreshToken: false } },
)

const BUCKET = 'propiedades'

// El middleware exige sesión del equipo: el bucket público ya no acepta subidas anónimas.
export async function POST(request: Request) {
  try {
    const { path } = await request.json()
    if (typeof path !== 'string' || !/^[\w./-]+$/.test(path) || path.includes('..')) {
      return NextResponse.json({ error: 'Ruta inválida.' }, { status: 400 })
    }
    const { data, error } = await supabaseAdmin.storage.from(BUCKET).createSignedUploadUrl(path)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ path: data.path, token: data.token })
  } catch {
    return NextResponse.json({ error: 'No se pudo preparar la subida.' }, { status: 400 })
  }
}
