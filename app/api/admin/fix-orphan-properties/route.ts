import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Usar service role key para bypasear RLS
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
)

// Mapeo de propiedades conocidas a sus asesores
// Esto se puede actualizar manualmente o detectar automáticamente
const PROPERTY_OWNER_MAP: Record<string, string> = {
  // Propiedades de Lizzie
  'lizzie': 'lizzie@conectia.mx',
  // Propiedades de Daniela
  'daniela': 'daniela@conectia.mx',
  // Propiedades de Ingrid
  'ingrid': 'ingrid@conectia.mx',
}

export async function GET() {
  try {
    // Obtener TODAS las propiedades con toda su información
    const { data: allProps, error } = await supabaseAdmin
      .from('propiedades')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching properties:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Filtrar propiedades sin asesor asignado
    const orphans = allProps?.filter(p => !p.usuario_id && !p.asesor_email) || []
    
    // Propiedades con asesor
    const assigned = allProps?.filter(p => p.usuario_id || p.asesor_email) || []

    return NextResponse.json({ 
      orphanProperties: orphans.map(p => ({
        id: p.id,
        titulo: p.titulo,
        ubicacion: p.ubicacion,
        usuario_id: p.usuario_id,
        asesor_email: p.asesor_email,
        created_at: p.created_at,
        imagen: p.imagen
      })),
      assignedProperties: assigned.map(p => ({
        id: p.id,
        titulo: p.titulo,
        asesor: p.usuario_id || p.asesor_email
      })),
      totalOrphans: orphans.length,
      totalAssigned: assigned.length,
      total: allProps?.length || 0
    })
  } catch (error: any) {
    console.error('Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { propertyId, asesorId, asesorEmail } = body

    if (!propertyId) {
      return NextResponse.json({ error: 'propertyId es requerido' }, { status: 400 })
    }

    // Support both old (email) and new (id) clients
    const idToUse = asesorId || null
    const emailToUse = asesorEmail || null

    // Build update object: only set usuario_id if it's a valid UUID or null
    const updateData: any = {}

    if (idToUse) {
      updateData.usuario_id = idToUse
    } else {
      updateData.usuario_id = null
    }

    // Try to set asesor_email too (TEXT column, safe for emails)
    if (emailToUse) {
      updateData.asesor_email = emailToUse
    } else {
      updateData.asesor_email = null
    }

    const { data, error } = await supabaseAdmin
      .from('propiedades')
      .update(updateData)
      .eq('id', propertyId)
      .select()
      .single()

    if (error) {
      console.error('Error updating property:', error)
      // If asesor_email column doesn't exist, try updating only usuario_id
      if (error.message && error.message.includes('asesor_email')) {
        const { data: fallbackData, error: fallbackError } = await supabaseAdmin
          .from('propiedades')
          .update({ usuario_id: idToUse })
          .eq('id', propertyId)
          .select()
          .single()

        if (fallbackError) {
          return NextResponse.json({ error: fallbackError.message }, { status: 500 })
        }
        return NextResponse.json({
          success: true,
          property: fallbackData,
          note: 'Columna asesor_email no existe. Ejecuta: ALTER TABLE propiedades ADD COLUMN asesor_email TEXT;'
        })
      }
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      property: data
    })
  } catch (error: any) {
    console.error('Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// Endpoint para asignar múltiples propiedades a un asesor
export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const { assignments } = body // Array de { propertyId, asesorEmail }

    if (!assignments || !Array.isArray(assignments)) {
      return NextResponse.json({ error: 'assignments array es requerido' }, { status: 400 })
    }

    const results = []
    for (const { propertyId, asesorEmail } of assignments) {
      const { data, error } = await supabaseAdmin
        .from('propiedades')
        .update({ usuario_id: asesorEmail })
        .eq('id', propertyId)
        .select()
        .single()

      if (error) {
        results.push({ propertyId, error: error.message })
      } else {
        results.push({ propertyId, success: true, asesor: asesorEmail })
      }
    }

    return NextResponse.json({ results })
  } catch (error: any) {
    console.error('Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
