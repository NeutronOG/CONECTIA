import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

// GET - anuncios activos (para homepage), opcionalmente filtrados por ubicación
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const ubicacion = searchParams.get('ubicacion')
    const now = new Date().toISOString()

    let query = getSupabase()
      .from('anuncios')
      .select('*')
      .eq('activo', true)
      .eq('estado', 'activo')
      .or(`fecha_inicio.is.null,fecha_inicio.lte.${now}`)
      .or(`fecha_fin.is.null,fecha_fin.gte.${now}`)

    if (ubicacion) {
      query = query.eq('ubicacion', ubicacion)
    }

    const { data, error } = await query.order('creado_en', { ascending: false })

    if (error) return NextResponse.json({ anuncios: [] })
    return NextResponse.json({ anuncios: data || [] })
  } catch {
    return NextResponse.json({ anuncios: [] })
  }
}

// POST - track click o impresión
export async function POST(req: NextRequest) {
  try {
    const { id, tipo } = await req.json()
    if (!id || !tipo) return NextResponse.json({ ok: false })

    const supabase = getSupabase()
    const campo = tipo === 'click' ? 'clicks' : 'impresiones'
    const { data: current } = await supabase.from('anuncios').select(campo).eq('id', id).single()
    if (current) {
      await supabase.from('anuncios').update({ [campo]: ((current as any)[campo] || 0) + 1 }).eq('id', id)
    }

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ ok: false })
  }
}
