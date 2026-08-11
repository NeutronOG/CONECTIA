import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { isPropertyCategory } from '@/lib/property-categories'
import {
  isLegacyCategoryConstraintError,
  isLegacyNumericBonusError,
  normalizePersistedProperty,
  sanitizePropertyPersistenceInput,
  withLegacyBonusFallback,
  withLegacyCategoryFallback,
} from '@/lib/property-persistence-compat'

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

type DatabaseMutationError = { code?: string; message?: string } | null

async function persistWithSchemaCompatibility(
  initialData: Record<string, any>,
  mutation: (data: Record<string, any>) => Promise<{ data: any; error: DatabaseMutationError }>,
) {
  const requestedCategory = initialData.categoria
  const requestedBonus = typeof initialData.bono === 'string' ? initialData.bono.trim() : initialData.bono
  let candidate = sanitizePropertyPersistenceInput(initialData)
  let categoryFallbackApplied = false
  let bonusFallbackApplied = false

  // Máximo tres intentos: normal, compatibilidad de categoría y compatibilidad de bono.
  for (let attempt = 0; attempt < 3; attempt += 1) {
    const result = await mutation(candidate)
    if (!result.error) {
      return {
        data: result.data ? normalizePersistedProperty(result.data) : result.data,
        error: null,
      }
    }

    if (
      !categoryFallbackApplied
      && isPropertyCategory(requestedCategory)
      && isLegacyCategoryConstraintError(result.error)
    ) {
      candidate = withLegacyCategoryFallback(candidate, requestedCategory)
      categoryFallbackApplied = true
      continue
    }

    if (
      !bonusFallbackApplied
      && typeof requestedBonus === 'string'
      && isLegacyNumericBonusError(result.error, requestedBonus)
    ) {
      candidate = withLegacyBonusFallback(candidate, requestedBonus)
      bonusFallbackApplied = true
      continue
    }

    return result
  }

  return mutation(candidate)
}

export async function POST(request: Request) {
  try {
    const { property, usuarioId, asesorEmail } = await request.json()
    const data = pickPropertyFields(property)

    if (!data.titulo || !data.ubicacion || !data.precio || !data.tipo || !data.area) {
      return NextResponse.json({ error: 'Faltan campos obligatorios de la propiedad' }, { status: 400 })
    }
    if (!isPropertyCategory(data.categoria)) {
      return NextResponse.json({ error: 'Selecciona una categoría pública válida' }, { status: 400 })
    }

    const ownerId = await resolveUserId(usuarioId, asesorEmail)
    const ownership = {
      ...(ownerId ? { usuario_id: ownerId } : {}),
      ...(typeof asesorEmail === 'string' && asesorEmail ? { asesor_email: asesorEmail.trim().toLowerCase() } : {}),
    }

    let { data: inserted, error } = await persistWithSchemaCompatibility(
      { ...data, ...ownership },
      async (candidate) => supabaseAdmin
        .from('propiedades')
        .insert(candidate)
        .select()
        .single(),
    )

    // Permite guardar en instalaciones que aún no han añadido asesor_email,
    // conservando de todos modos el UUID correcto en usuario_id.
    if (error?.message?.includes('asesor_email')) {
      ;({ data: inserted, error } = await persistWithSchemaCompatibility(
        { ...data, ...(ownerId ? { usuario_id: ownerId } : {}) },
        async (candidate) => supabaseAdmin
          .from('propiedades')
          .insert(candidate)
          .select()
          .single(),
      ))
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

    const requestedChanges = pickPropertyFields(property)
    if (Object.keys(requestedChanges).length === 0) {
      return NextResponse.json({ error: 'No hay cambios para guardar' }, { status: 400 })
    }
    if (requestedChanges.categoria !== undefined && !isPropertyCategory(requestedChanges.categoria)) {
      return NextResponse.json({ error: 'Selecciona una categoría pública válida' }, { status: 400 })
    }

    // Partimos de la fila actual para que una edición parcial nunca borre
    // galería, bono, comisión, características u otros campos no enviados.
    const { data: currentProperty, error: currentError } = await supabaseAdmin
      .from('propiedades')
      .select('*')
      .eq('id', Number(id))
      .single()

    if (currentError || !currentProperty) {
      return NextResponse.json({ error: 'La propiedad que intentas actualizar no existe' }, { status: 404 })
    }

    const normalizedCurrent = normalizePersistedProperty(currentProperty)
    const data = {
      ...pickPropertyFields(normalizedCurrent),
      ...requestedChanges,
    }

    const { data: updated, error } = await persistWithSchemaCompatibility(
      data,
      async (candidate) => supabaseAdmin
        .from('propiedades')
        .update(candidate)
        .eq('id', Number(id))
        .select()
        .single(),
    )

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
