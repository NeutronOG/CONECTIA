import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

// PATCH - actualizar anuncio
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await req.json()
    const updates: Record<string, any> = {}

    if (body.titulo !== undefined) updates.titulo = body.titulo
    if (body.descripcion !== undefined) updates.descripcion = body.descripcion
    if (body.imagen !== undefined) updates.imagen = body.imagen
    if (body.enlace !== undefined) updates.enlace = body.enlace
    if (body.textoBoton !== undefined) updates.texto_boton = body.textoBoton
    if (body.ubicacion !== undefined) updates.ubicacion = body.ubicacion
    if (body.estilo !== undefined) updates.estilo = body.estilo
    if (body.activo !== undefined) updates.activo = body.activo
    if (body.estado !== undefined) updates.estado = body.estado
    if (body.fechaInicio !== undefined) updates.fecha_inicio = body.fechaInicio || null
    if (body.fechaFin !== undefined) updates.fecha_fin = body.fechaFin || null

    const { data, error } = await getSupabase()
      .from('anuncios')
      .update(updates)
      .eq('id', params.id)
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ anuncio: data })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

// DELETE - eliminar anuncio
export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { error } = await getSupabase()
      .from('anuncios')
      .delete()
      .eq('id', params.id)

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
