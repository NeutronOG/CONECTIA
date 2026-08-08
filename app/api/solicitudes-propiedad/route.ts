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
    const {
      asesor_email,
      asesor_nombre,
      titulo,
      ubicacion,
      descripcion,
      precio_estimado,
      tipo,
      categoria,
      habitaciones,
      banos,
      area,
      imagenes,
      ...extraData
    } = body

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
      imagenes: Array.isArray(imagenes) ? imagenes.filter((imagen) => typeof imagen === 'string' && imagen.length > 0) : [],
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
      // Si la tabla no existe, devolver error con instrucciones
      if (error.message.includes('solicitudes_propiedad') && error.message.includes('does not exist')) {
        return NextResponse.json({
          error: 'La tabla solicitudes_propiedad no existe en Supabase.',
          fix: 'Ejecuta el script supabase/create-solicitudes-propiedad-table.sql en el SQL Editor de Supabase.'
        }, { status: 500 })
      }

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

    const validStatuses = ['pendiente', 'en_proceso', 'completada', 'rechazada']
    if (status && !validStatuses.includes(status)) {
      return NextResponse.json({ error: 'Estado de solicitud no válido' }, { status: 400 })
    }

    // Evita marcar como finalizado un trabajo sin el contenido que debe
    // publicar el fotógrafo. La validación también vive en el servidor.
    if (status === 'completada') {
      const { data: currentSolicitud, error: currentError } = await supabaseAdmin
        .from('solicitudes_propiedad')
        .select('imagenes')
        .eq('id', id)
        .single()

      if (currentError) {
        return NextResponse.json({ error: currentError.message }, { status: 500 })
      }

      if (!Array.isArray(currentSolicitud?.imagenes) || currentSolicitud.imagenes.length === 0) {
        return NextResponse.json({ error: 'Sube al menos una foto antes de completar la solicitud' }, { status: 400 })
      }
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
    if (status === 'completada' && data && !data.propiedad_id) {
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
        const habitacionesNum = Math.round(Number(String(solicitud.habitaciones || '0').replace(/\+.*/, '')) || 0)
        const banosNum = Math.round(Number(String(solicitud.banos || '0').replace(/\+.*/, '')) || 0)
        const asesorEmail = typeof solicitud.asesor_email === 'string'
          ? solicitud.asesor_email.trim().toLowerCase()
          : ''

        // Mantener la propiedad asociada al asesor que creó la solicitud para
        // que aparezca en su cartera al concluir el trabajo fotográfico.
        const { data: asesor } = asesorEmail
          ? await supabaseAdmin
            .from('usuarios')
            .select('id')
            .ilike('email', asesorEmail)
            .maybeSingle()
          : { data: null }

        const nuevaPropiedad: any = {
          titulo: solicitud.titulo,
          ubicacion: solicitud.ubicacion || 'Sin ubicación',
          precio: precioNum,
          precio_texto: extra.precioTexto || precioTexto,
          tipo: solicitud.tipo || 'Departamento',
          categoria: solicitud.categoria || 'venta',
          habitaciones: habitacionesNum,
          banos: banosNum,
          medios_banos: Math.round(Number(extra.mediosBanos) || 0),
          area: areaNum,
          area_texto: extra.areaTexto || (areaNum > 0 ? `${areaNum} m²` : '0 m²'),
          area_construccion: Math.round(Number(extra.areaConstruccion) || 0),
          cochera: Math.round(Number(extra.cochera) || 0),
          imagen: imagenPrincipal,
          galeria: galeria,
          descripcion: solicitud.descripcion || '',
          caracteristicas: extra.caracteristicas || [],
          status: 'Disponible',
          unidad_superficie: extra.unidadSuperficie || 'm²',
          tour_virtual: extra.tourVirtual || null,
          fecha_publicacion: extra.fechaPublicacion || new Date().toISOString(),
          ...(asesorEmail ? { asesor_email: asesorEmail } : {}),
          ...(asesor?.id ? { usuario_id: asesor.id } : {}),
        }

        const { data: propData, error: propError } = await supabaseAdmin
          .from('propiedades')
          .insert(nuevaPropiedad)
          .select()
          .single()

        if (propError) {
          console.error('Error creando propiedad desde solicitud:', propError)
          // Reportar el error al cliente para diagnóstico
          return NextResponse.json({ 
            solicitud: data,
            propiedad_creada: false,
            error_propiedad: propError.message 
          }, { status: 500 })
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
      } catch (propErr: any) {
        console.error('Error en creación automática de propiedad:', propErr)
        return NextResponse.json({ 
          solicitud: data,
          propiedad_creada: false,
          error_propiedad: propErr.message || 'Error desconocido'
        }, { status: 500 })
      }
    }

    return NextResponse.json({ solicitud: data })
  } catch (error: any) {
    console.error('Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
