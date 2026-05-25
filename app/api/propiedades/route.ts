import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Usar service role key para bypasear RLS
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
)

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    // Si se pide una propiedad específica
    if (id) {
      const { data: prop, error } = await supabaseAdmin
        .from('propiedades')
        .select('*')
        .eq('id', id)
        .single()

      if (error) {
        console.error('Error fetching property:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
      }

      // Obtener nombre del asesor
      let agenteNombre = 'Asesor CONECTIA'
      if (prop.usuario_id) {
        const { data: usuario } = await supabaseAdmin
          .from('usuarios')
          .select('nombre')
          .eq('id', prop.usuario_id)
          .single()
        if (usuario) agenteNombre = usuario.nombre
      }

      const propiedad = {
        id: prop.id,
        usuarioId: prop.usuario_id || undefined,
        titulo: prop.titulo,
        ubicacion: prop.ubicacion,
        precio: Number(prop.precio),
        precioTexto: prop.precio_texto,
        tipo: prop.tipo,
        habitaciones: prop.habitaciones,
        banos: prop.banos,
        area: prop.area,
        areaTexto: prop.area_texto,
        imagen: prop.imagen || '/placeholder-property.jpg',
        descripcion: prop.descripcion || '',
        caracteristicas: prop.caracteristicas || [],
        status: prop.status,
        categoria: prop.categoria,
        fechaPublicacion: prop.fecha_publicacion,
        tourVirtual: prop.tour_virtual || undefined,
        galeria: prop.galeria || [],
        agente: {
          nombre: agenteNombre,
          especialidad: 'Especialista en Propiedades',
          rating: 5.0,
          ventas: 0,
          telefono: '+52 1 477 475 6951',
          email: 'conectiaselect@gmail.com',
        },
      }

      return NextResponse.json({ propiedad })
    }

    // Listado completo
    const { data: propiedades, error: propError } = await supabaseAdmin
      .from('propiedades')
      .select('id, titulo, ubicacion, precio, precio_texto, tipo, habitaciones, banos, area, area_texto, imagen, descripcion, caracteristicas, status, categoria, fecha_publicacion, tour_virtual, usuario_id, created_at, bono')
      .order('created_at', { ascending: false })

    if (propError) {
      console.error('Error fetching properties:', propError)
      return NextResponse.json({ error: propError.message }, { status: 500 })
    }

    // Obtener nombres de usuarios
    const usuarioIds = [...new Set((propiedades || []).map((p: any) => p.usuario_id).filter(Boolean))]
    let usuariosMap: Record<string, string> = {}
    if (usuarioIds.length > 0) {
      const { data: usuarios } = await supabaseAdmin
        .from('usuarios')
        .select('id, nombre')
        .in('id', usuarioIds)
      if (usuarios) {
        usuariosMap = usuarios.reduce((acc: Record<string, string>, u: any) => {
          acc[u.id] = u.nombre
          return acc
        }, {})
      }
    }

    const result = (propiedades || []).map((prop: any) => ({
      id: Number(prop.id),
      usuarioId: prop.usuario_id || undefined,
      titulo: prop.titulo,
      ubicacion: prop.ubicacion,
      precio: Number(prop.precio),
      precioTexto: prop.precio_texto,
      tipo: prop.tipo,
      habitaciones: prop.habitaciones,
      banos: prop.banos,
      area: prop.area,
      areaTexto: prop.area_texto,
      imagen: prop.imagen || '/placeholder-property.jpg',
      descripcion: prop.descripcion || '',
      caracteristicas: prop.caracteristicas || [],
      status: prop.status,
      categoria: prop.categoria,
      fechaPublicacion: prop.created_at || prop.fecha_publicacion,
      tourVirtual: prop.tour_virtual || undefined,
      galeria: undefined,
      bono: prop.bono || undefined,
      agente: prop.usuario_id && usuariosMap[prop.usuario_id] ? {
        nombre: usuariosMap[prop.usuario_id],
        especialidad: 'Especialista en Propiedades',
        rating: 5.0,
        ventas: 0,
        telefono: '',
        email: '',
      } : undefined,
    }))

    return NextResponse.json({ propiedades: result })
  } catch (error: any) {
    console.error('Error in public propiedades API:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
