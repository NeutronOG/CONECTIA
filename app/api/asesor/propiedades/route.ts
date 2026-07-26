import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false, autoRefreshToken: false } }
)

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

const propertyFields = [
  'titulo', 'ubicacion', 'precio', 'precio_texto', 'tipo', 'habitaciones',
  'banos', 'medios_banos', 'area', 'area_construccion', 'cochera',
  'area_texto', 'imagen', 'descripcion', 'caracteristicas', 'status',
  'categoria', 'fecha_publicacion', 'tour_virtual', 'galeria', 'bono',
  'comision_asesor_pct', 'unidad_superficie', 'tipo_credito',
] as const

function pickPropertyFields(property: unknown) {
  if (!property || typeof property !== 'object') return {}

  const source = property as Record<string, unknown>
  return propertyFields.reduce<Record<string, unknown>>((data, field) => {
    if (source[field] !== undefined) data[field] = source[field]
    return data
  }, {})
}

async function resolveUserId(usuarioId: unknown, asesorEmail: unknown) {
  if (typeof usuarioId === 'string' && UUID_PATTERN.test(usuarioId)) return usuarioId
  if (typeof asesorEmail !== 'string' || !asesorEmail) return null

  const { data } = await supabaseAdmin
    .from('usuarios')
    .select('id')
    .ilike('email', asesorEmail.trim())
    .maybeSingle()

  return data?.id || null
}

function databaseError(error: { message?: string } | null) {
  return NextResponse.json(
    { error: error?.message || 'No se pudo guardar la propiedad' },
    { status: 500 }
  )
}

export async function POST(request: Request) {
  try {
    const { property, usuarioId, asesorEmail } = await request.json()
    const data = pickPropertyFields(property)

    if (!data.titulo || !data.ubicacion || !data.precio || !data.tipo || !data.area) {
      return NextResponse.json({ error: 'Faltan campos obligatorios de la propiedad' }, { status: 400 })
    }

    const ownerId = await resolveUserId(usuarioId, asesorEmail)
    const ownership = {
      ...(ownerId ? { usuario_id: ownerId } : {}),
      ...(typeof asesorEmail === 'string' && asesorEmail ? { asesor_email: asesorEmail.trim().toLowerCase() } : {}),
    }

    let { data: inserted, error } = await supabaseAdmin
      .from('propiedades')
      .insert({ ...data, ...ownership })
      .select()
      .single()

    // Permite guardar en instalaciones que aún no han añadido asesor_email,
    // conservando de todos modos el UUID correcto en usuario_id.
    if (error?.message?.includes('asesor_email')) {
      ;({ data: inserted, error } = await supabaseAdmin
        .from('propiedades')
        .insert({ ...data, ...(ownerId ? { usuario_id: ownerId } : {}) })
        .select()
        .single())
    }

    if (error) return databaseError(error)
    return NextResponse.json({ property: inserted }, { status: 201 })
  } catch (error) {
    console.error('Error creating property:', error)
    return databaseError(error as { message?: string })
  }
}

export async function PATCH(request: Request) {
  try {
    const { id, property } = await request.json()
    if (!Number.isInteger(Number(id)) || Number(id) <= 0) {
      return NextResponse.json({ error: 'ID de propiedad inválido' }, { status: 400 })
    }

    const data = pickPropertyFields(property)
    if (Object.keys(data).length === 0) {
      return NextResponse.json({ error: 'No hay cambios para guardar' }, { status: 400 })
    }

    const { data: updated, error } = await supabaseAdmin
      .from('propiedades')
      .update(data)
      .eq('id', Number(id))
      .select()
      .single()

    if (error) return databaseError(error)
    return NextResponse.json({ property: updated })
  } catch (error) {
    console.error('Error updating property:', error)
    return databaseError(error as { message?: string })
  }
}

export async function DELETE(request: Request) {
  const id = Number(new URL(request.url).searchParams.get('id'))
  if (!Number.isInteger(id) || id <= 0) {
    return NextResponse.json({ error: 'ID de propiedad inválido' }, { status: 400 })
  }

  try {
    const { error } = await supabaseAdmin.from('propiedades').delete().eq('id', id)
    if (error) return databaseError(error)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting property:', error)
    return databaseError(error as { message?: string })
  }
}
