import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

// GET - listar todos los anuncios
export async function GET() {
  try {
    const { data, error } = await getSupabase()
      .from('anuncios')
      .select('*')
      .order('creado_en', { ascending: false })

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ anuncios: data || [] })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

// POST - crear anuncio
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { data, error } = await getSupabase()
      .from('anuncios')
      .insert({
        titulo: body.titulo,
        descripcion: body.descripcion || '',
        imagen: body.imagen || '',
        enlace: body.enlace || '',
        texto_boton: body.textoBoton || 'Ver más',
        ubicacion: body.ubicacion || 'entre-secciones',
        estilo: body.estilo || 'elegante',
        activo: body.activo ?? true,
        estado: body.estado || 'activo',
        fecha_inicio: body.fechaInicio || new Date().toISOString(),
        fecha_fin: body.fechaFin || null,
        creado_por: body.creadoPor || '',
        clicks: 0,
        impresiones: 0,
      })
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ anuncio: data })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
