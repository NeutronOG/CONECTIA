import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
)

// GET - Obtener solicitudes (para fotógrafo: todas, para asesor: solo las suyas)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const email = searchParams.get('email')
    const role = searchParams.get('role')

    let query = supabaseAdmin
      .from('solicitudes_propiedad')
      .select('*')
      .order('created_at', { ascending: false })

    // Si es asesor, solo ver las suyas
    if (role === 'asesor' && email) {
      query = query.eq('asesor_email', email)
    }

    const { data, error } = await query

    if (error) {
      // Si la tabla no existe, devolver array vacío con instrucciones
      if (error.message.includes('solicitudes_propiedad')) {
        return NextResponse.json({ 
          solicitudes: [],
          needsTable: true,
          sql: `CREATE TABLE solicitudes_propiedad (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  asesor_email TEXT NOT NULL,
  asesor_nombre TEXT,
  titulo TEXT NOT NULL,
  ubicacion TEXT,
  descripcion TEXT,
  precio_estimado NUMERIC,
  tipo TEXT DEFAULT 'Departamento',
  categoria TEXT DEFAULT 'venta',
  habitaciones INTEGER,
  banos INTEGER,
  area NUMERIC,
  status TEXT DEFAULT 'pendiente',
  notas_fotografo TEXT,
  imagenes JSONB DEFAULT '[]'::jsonb,
  datos_extra JSONB DEFAULT '{}'::jsonb,
  propiedad_id INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE solicitudes_propiedad ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all for service role" ON solicitudes_propiedad
  FOR ALL USING (true) WITH CHECK (true);`
        })
      }
      console.error('Error fetching solicitudes:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ solicitudes: data || [] })
  } catch (error: any) {
    console.error('Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// POST - Crear nueva solicitud (asesor envía solicitud)
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { asesor_email, asesor_nombre, titulo, ubicacion, descripcion, precio_estimado, tipo, categoria, habitaciones, banos, area, ...extraData } = body

    if (!asesor_email || !titulo) {
      return NextResponse.json({ error: 'Se requiere email del asesor y título' }, { status: 400 })
    }

    const insertData: any = {
      asesor_email,
      asesor_nombre: asesor_nombre || null,
      titulo,
      ubicacion: ubicacion || null,
      descripcion: descripcion || null,
      precio_estimado: precio_estimado || null,
      tipo: tipo || 'Departamento',
      categoria: categoria || 'venta',
      habitaciones: habitaciones || null,
      banos: banos || null,
      area: area || null,
      status: 'pendiente'
    }

    // Guardar datos extra del formulario completo (caracteristicas, amenidades, etc.)
    if (Object.keys(extraData).length > 0) {
      insertData.datos_extra = extraData
    }

    const { data, error } = await supabaseAdmin
      .from('solicitudes_propiedad')
      .insert(insertData)
      .select()
      .single()

    if (error) {
      // Si falla por columna datos_extra, intentar sin ella
      if (error.message.includes('datos_extra')) {
        delete insertData.datos_extra
        const { data: data2, error: error2 } = await supabaseAdmin
          .from('solicitudes_propiedad')
          .insert(insertData)
          .select()
          .single()

        if (error2) {
          console.error('Error creating solicitud (fallback):', error2)
          return NextResponse.json({ error: error2.message }, { status: 500 })
        }
        return NextResponse.json({ solicitud: data2 })
      }

      console.error('Error creating solicitud:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ solicitud: data })
  } catch (error: any) {
    console.error('Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// PATCH - Actualizar solicitud (fotógrafo actualiza status, agrega notas, vincula propiedad)
export async function PATCH(request: Request) {
  try {
    const body = await request.json()
    const { id, status, notas_fotografo, propiedad_id, imagenes } = body

    if (!id) {
      return NextResponse.json({ error: 'Se requiere ID de solicitud' }, { status: 400 })
    }

    const updateData: any = { updated_at: new Date().toISOString() }
    if (status) updateData.status = status
    if (notas_fotografo !== undefined) updateData.notas_fotografo = notas_fotografo
    if (propiedad_id !== undefined) updateData.propiedad_id = propiedad_id
    if (imagenes !== undefined) updateData.imagenes = imagenes

    const { data, error } = await supabaseAdmin
      .from('solicitudes_propiedad')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      // Si el error es por columna imagenes faltante, intentar sin ella
      if (error.message.includes('imagenes') && imagenes !== undefined) {
        console.warn('Columna imagenes no existe, intentando sin ella. Ejecuta: ALTER TABLE solicitudes_propiedad ADD COLUMN imagenes JSONB DEFAULT \'[]\'::jsonb;')
        const { imagenes: _, ...updateWithoutImages } = updateData
        const { data: data2, error: error2 } = await supabaseAdmin
          .from('solicitudes_propiedad')
          .update(updateWithoutImages)
          .eq('id', id)
          .select()
          .single()

        if (error2) {
          console.error('Error updating solicitud (fallback):', error2)
          return NextResponse.json({ error: error2.message }, { status: 500 })
        }
        return NextResponse.json({ solicitud: { ...data2, imagenes: [] } })
      }

      console.error('Error updating solicitud:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // === CREAR PROPIEDAD AUTOMÁTICAMENTE AL COMPLETAR ===
    if (status === 'completada' && data) {
      try {
        const solicitud = data
        const extra = solicitud.datos_extra || {}
        const imagenesArr: string[] = solicitud.imagenes || []
        const imagenPrincipal = imagenesArr.length > 0 ? imagenesArr[0] : ''
        const galeria = imagenesArr.length > 1 ? imagenesArr.slice(1) : []

        const precioNum = Math.round(Number(solicitud.precio_estimado) || 0)
        const precioTexto = precioNum > 0 
          ? `$${precioNum.toLocaleString('es-MX')}` 
          : 'Consultar precio'

        const areaNum = Math.round(Number(solicitud.area) || 0)

        const nuevaPropiedad: any = {
          titulo: solicitud.titulo,
          ubicacion: solicitud.ubicacion || 'Sin ubicación',
          precio: precioNum,
          precio_texto: precioTexto,
          tipo: solicitud.tipo || 'Departamento',
          categoria: solicitud.categoria || 'venta',
          habitaciones: Math.round(Number(solicitud.habitaciones) || 0),
          banos: Math.round(Number(solicitud.banos) || 0),
          area: areaNum,
          area_texto: areaNum > 0 ? `${areaNum} m²` : '0 m²',
          imagen: imagenPrincipal,
          galeria: galeria,
          descripcion: solicitud.descripcion || '',
          caracteristicas: extra.caracteristicas || [],
          status: 'Disponible',
          fecha_publicacion: new Date().toISOString().split('T')[0],
          asesor_email: solicitud.asesor_email,
          usuario_id: solicitud.asesor_email,
        }

        // Agregar campos extra del PropertyForm si existen
        if (extra.mediosBanos) nuevaPropiedad.medios_banos = Math.round(Number(extra.mediosBanos) || 0)
        if (extra.areaConstruccion) nuevaPropiedad.area_construccion = Math.round(Number(extra.areaConstruccion) || 0)
        if (extra.cochera) nuevaPropiedad.cochera = Math.round(Number(extra.cochera) || 0)
        if (extra.tipoCredito) nuevaPropiedad.tipo_credito = extra.tipoCredito
        if (extra.tourVirtual) nuevaPropiedad.tour_virtual = extra.tourVirtual
        if (extra.agente) nuevaPropiedad.agente = extra.agente
        if (extra.detalles) nuevaPropiedad.detalles = extra.detalles

        const { data: propData, error: propError } = await supabaseAdmin
          .from('propiedades')
          .insert(nuevaPropiedad)
          .select()
          .single()

        if (propError) {
          console.error('Error creando propiedad desde solicitud:', propError)
          // No fallar el PATCH, solo loguear
        } else if (propData) {
          console.log('Propiedad creada automáticamente:', propData.id, propData.titulo)
          // Vincular propiedad_id en la solicitud
          await supabaseAdmin
            .from('solicitudes_propiedad')
            .update({ propiedad_id: propData.id })
            .eq('id', id)

          // Devolver solicitud actualizada con propiedad_id
          return NextResponse.json({ 
            solicitud: { ...data, propiedad_id: propData.id },
            propiedad_creada: true,
            propiedad_id: propData.id
          })
        }
      } catch (propErr) {
        console.error('Error en creación automática de propiedad:', propErr)
        // No fallar, la solicitud ya se actualizó
      }
    }

    return NextResponse.json({ solicitud: data })
  } catch (error: any) {
    console.error('Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
