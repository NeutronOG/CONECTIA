import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Usar service role key para bypasear RLS
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
)

export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from('propiedades')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching propiedades:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Transformar datos al formato esperado por el frontend
    const propiedades = (data || []).map((p: any) => ({
      id: p.id,
      usuarioId: p.asesor_email || p.usuario_id, // Priorizar asesor_email
      asesorEmail: p.asesor_email,
      titulo: p.titulo,
      ubicacion: p.ubicacion,
      precio: p.precio,
      precioTexto: p.precio_texto,
      tipo: p.tipo,
      habitaciones: p.habitaciones,
      banos: p.banos,
      mediosBanos: p.medios_banos || 0,
      area: p.area,
      areaConstruccion: p.area_construccion || 0,
      cochera: p.cochera || 0,
      areaTexto: p.area_texto,
      imagen: p.imagen || '',
      descripcion: p.descripcion || '',
      caracteristicas: p.caracteristicas || [],
      status: p.status,
      categoria: p.categoria,
      fechaPublicacion: p.fecha_publicacion,
      tourVirtual: p.tour_virtual,
      galeria: p.galeria,
      agente: p.agente || null,
      createdAt: p.created_at
    }))

    return NextResponse.json({ propiedades })
  } catch (error: any) {
    console.error('Error in propiedades API:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
